'use server';

import axios from 'axios';

const API_KEY = process.env.API_KEY; // Environment variable must be set
const BASE_URL = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService';

export interface StockItem {
    basDt: string; // Base Date (YYYYMMDD)
    srtnCd: string; // Short Code (e.g., 005930)
    isinCd: string; // ISIN Code
    itmsNm: string; // Item Name (e.g., Samsung Electronics)
    mrktCtg: string; // Market Category (KOSPI/KOSDAQ)
    clpr: string; // Close Price
    vs: string; // Variance (Change)
    fltRt: string; // Fluctuation Rate
    mkp: string; // Open Price
    hipr: string; // High Price
    lopr: string; // Low Price
    trqu: string; // Trading Volume
    trPrc: string; // Trading Price (Amount)
    lstgStCnt: string; // Listed Stock Count
    mrktTotAmt: string; // Market Cap
}

interface ApiResponse {
    response: {
        header: {
            resultCode: string;
            resultMsg: string;
        };
        body: {
            numOfRows: number;
            pageNo: number;
            totalCount: number;
            items: {
                item: StockItem[];
            };
        };
    };
}

// 2026-01-01 -> YYYYMMDD
const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}`;
}

// Helper to get a recent business day (simple fallback logic)
const getRecentBusinessDay = () => {
    const date = new Date();
    // Simple logic: if weekend, go back to Friday. 
    // Ideally, the API would return the latest available if we query a range or just don't send a date (but API might require it or default to today).
    // This API defaults to "search matches". If we don't send a date, it might return all history? No, optional.
    // Let's try querying for a recent range (last 5 days) and take the latest.
    return formatDate(date);
}

const stockCache = new Map<string, { timestamp: number; data: StockItem[] }>();

// Helper to safely fetch data by constructing the URL manually to avoid double-encoding the service key
async function fetchStockData(params: Record<string, string | number>): Promise<StockItem[]> {
    // Construct Query String manually for non-serviceKey params
    const searchParams = new URLSearchParams();
    for (const key in params) {
        searchParams.append(key, String(params[key]));
    }

    // Append Service Key directly (without encoding, or assuming it's safe)
    // NOTE: The key provided is a hex string, so encoding doesn't change it. 
    // But this method ensures we control exactly what is sent.
    const url = `${BASE_URL}/getStockPriceInfo?serviceKey=${API_KEY}&${searchParams.toString()}`;

    console.log(`Fetching URL: ${url}`); // Verify URL in logs

    try {
        const response = await axios.get<ApiResponse>(url);

        if (!response.data || !response.data.response) {
            console.error('Invalid API Response:', JSON.stringify(response.data).substring(0, 200));
            return [];
        }

        // Handle "SERVICE_KEY_IS_NOT_REGISTERED_ERROR" which implies XML response parsed as JSON?
        // Actually axios won't parse XML to JSON automatically unless we use a transformer.
        // But if resultType=json works, we get JSON.

        const items = response.data.response.body.items.item;
        return items || [];
    } catch (error) {
        console.error('Fetch failed:', error);
        return [];
    }
}

// Get Top Stocks
export async function getTopStocks(): Promise<StockItem[]> {
    // Check cache
    const cached = stockCache.get('top20');
    if (cached && (Date.now() - cached.timestamp < 1000 * 60 * 60)) { // 1 hour cache
        console.log('Returning cached top stocks');
        return cached.data;
    }

    try {
        const today = new Date();
        const twoWeeksAgo = new Date();
        twoWeeksAgo.setDate(today.getDate() - 14); // Look back 2 weeks to safely find trading days

        console.log(`Fetching top stocks from ${formatDate(twoWeeksAgo)}...`);

        const items = await fetchStockData({
            numOfRows: 2000,
            pageNo: 1,
            resultType: 'json',
            beginBasDt: formatDate(twoWeeksAgo),
            mrktCtg: 'KOSPI',
        });

        // Group by symbol, take latest
        const latestStocks = new Map<string, StockItem>();
        items.forEach(item => {
            if (!latestStocks.has(item.srtnCd)) {
                latestStocks.set(item.srtnCd, item);
            } else {
                const existing = latestStocks.get(item.srtnCd)!;
                if (item.basDt > existing.basDt) {
                    latestStocks.set(item.srtnCd, item);
                }
            }
        });

        const stockList = Array.from(latestStocks.values());

        // Sort by Market Cap (mkp is string "Open Price"?? NO. 
        // Wait, info.txt says: mrktTotAmt	시가총액. mkp is Open Price.
        // My previous code sorted by `mkp` which is wrong. I should sort by `mrktTotAmt`.

        const sorted = stockList.sort((a, b) => {
            const capA = parseInt(a.mrktTotAmt);
            const capB = parseInt(b.mrktTotAmt);
            return capB - capA;
        });

        const top20 = sorted.slice(0, 20);
        stockCache.set('top20', { timestamp: Date.now(), data: top20 });

        return top20;

    } catch (error) {
        console.error('Failed to fetch top stocks:', error);
        return [];
    }
}

// Search Stocks by Name
export async function searchStocks(query: string): Promise<StockItem[]> {
    try {
        console.log(`Searching for: ${query}`);

        // Search within last 6 months to ensure we get valid active stocks but not too much old data
        const today = new Date();
        const sixMonthsAgo = new Date();
        sixMonthsAgo.setMonth(today.getMonth() - 6);

        const items = await fetchStockData({
            numOfRows: 150, // Increase slightly
            pageNo: 1,
            resultType: 'json',
            likeItmsNm: query,
            beginBasDt: formatDate(sixMonthsAgo)
        });

        if (items.length === 0) {
            console.log('No items found for query:', query);
            return [];
        }

        // Deduplicate: Keep latest entry for each stock
        const uniqueStocks = new Map<string, StockItem>();
        items.forEach(item => {
            if (!uniqueStocks.has(item.srtnCd)) {
                uniqueStocks.set(item.srtnCd, item);
            } else {
                const existing = uniqueStocks.get(item.srtnCd)!;
                if (item.basDt > existing.basDt) {
                    uniqueStocks.set(item.srtnCd, item);
                }
            }
        });

        const stockList = Array.from(uniqueStocks.values());

        // Sort by relevance
        return stockList.sort((a, b) => {
            const nameA = a.itmsNm;
            const nameB = b.itmsNm;

            // Exact match gets highest priority
            if (nameA === query) return -1;
            if (nameB === query) return 1;

            // Starts with query gets second priority
            const startA = nameA.startsWith(query);
            const startB = nameB.startsWith(query);
            if (startA && !startB) return -1;
            if (!startA && startB) return 1;

            // Then sort byMarket Cap (if available) or Name
            // Since we might not have market cap in search results always (API varies), fallback to name
            return nameA.localeCompare(nameB);
        });

    } catch (error) {
        console.error('Search failed:', error);
        return [];
    }
}

// Get Stock by Code (Exact Match)
export async function getStockByCode(symbol: string): Promise<StockItem | null> {
    try {
        // Search within last 2 months
        const today = new Date();
        const twoMonthsAgo = new Date();
        twoMonthsAgo.setMonth(today.getMonth() - 2);

        const items = await fetchStockData({
            numOfRows: 10,
            pageNo: 1,
            resultType: 'json',
            likeSrtnCd: symbol, // Use code search param
            beginBasDt: formatDate(twoMonthsAgo)
        });

        if (!items || items.length === 0) return null;

        // Find the item with the matching short code
        // and get the latest date
        const matchingItems = items.filter(item => item.srtnCd === symbol);

        if (matchingItems.length === 0) return null;

        // Sort by date desc
        matchingItems.sort((a, b) => b.basDt.localeCompare(a.basDt));

        return matchingItems[0];
    } catch (error) {
        console.error('Get Stock By Code failed:', error);
        return null;
    }
}

// Get Stock History
export async function getStockHistory(symbol: string, startDate: string, endDate: string): Promise<StockItem[]> {
    try {
        const items = await fetchStockData({
            numOfRows: 1000,
            pageNo: 1,
            resultType: 'json',
            likeSrtnCd: symbol,
            beginBasDt: startDate,
            endBasDt: endDate
        });

        return items.sort((a, b) => a.basDt.localeCompare(b.basDt)); // Sort by date ascending
    } catch (error) {
        console.error('History fetch failed:', error);
        return [];
    }
}
