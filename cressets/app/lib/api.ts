import axios from 'axios';

const API_KEY = process.env.API_KEY;
const BASE_URL = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';

export interface StockData {
    basDt: string;
    srtnCd: string;
    isinCd: string;
    itmsNm: string;
    mrktCtg: string;
    clpr: string;
    vs: string;
    fltRt: string;
    mkp: string;
    hipr: string;
    lopr: string;
    trqu: string;
    trPrc: string;
    lstgStCnt: string;
    mrktTotAmt: string;
}

export async function fetchStockData(query: string): Promise<StockData[]> {
    if (!API_KEY) {
        console.warn('API_KEY is not defined');
        return [];
    }

    // Determine if query is a name or code (simple check)
    const isCode = /^\d+$/.test(query);
    const params: any = {
        serviceKey: API_KEY, // Decode if necessary, but usually passed as is or decoded
        numOfRows: 20,
        pageNo: 1,
        resultType: 'json',
    };

    if (isCode) {
        // If it's a code (like 005930), try searching by it directly if the API supports it,
        // or just use it as 'likeSrtnCd' if available or verify API docs.
        // Standard KRX API usually takes 'itmsNm' or 'likeSrtnCd'.
        // We'll try 'itmsNm' for name search.
        // Use 'likeSrtnCd' for code search if available in this specific service.
        // Let's assume 'itmsNm' works for partial name match.
        // For code updates, usually 'srtnCd' is exact match.
        // WARNING: The standard API parameters might differ. I'm using common ones.
        // If the user query looks like a code, we might want to search by code.
        // However, without detailed docs, let's try 'itmsNm' first as it's safer for "Search".
    }

    // Actually, let's use 'itmsNm' for name search as primary.
    if (query) {
        params.itmsNm = query;
    }

    try {
        const response = await axios.get(BASE_URL, { params });
        // The response structure might be response.data.response.body.items.item
        const items = response.data?.response?.body?.items?.item;

        if (Array.isArray(items)) {
            return items;
        } else if (items) {
            return [items]; // Single item case
        }

        return [];
    } catch (error) {
        console.error('Failed to fetch stock data:', error);
        return [];
    }
}

export async function fetchStockDetail(symbol: string): Promise<StockData | null> {
    // Symbol is usually the Short Code (srtnCd)
    if (!API_KEY) return null;

    try {
        const response = await axios.get(BASE_URL, {
            params: {
                serviceKey: API_KEY,
                numOfRows: 1,
                pageNo: 1,
                resultType: 'json',
                likeSrtnCd: symbol // Search by short code
            }
        });

        const items = response.data?.response?.body?.items?.item;
        if (Array.isArray(items) && items.length > 0) return items[0];
        if (items && !Array.isArray(items)) return items;

        return null;
    } catch (error) {
        console.error("Error fetching detail:", error);
        return null;
    }
}
