'use server';

import { fetchPublicStockPriceInfo, PublicStockItem } from '@/lib/public-data';
import { Stock, ChartData } from '@/types/stock';

/**
 * 공식 공공데이터 API만을 사용하여 종목을 검색합니다.
 */
export async function searchStocksAction(query: string): Promise<Stock[]> {
    try {
        if (!query) return getTopStocksAction('ALL');

        const cleanQuery = query.trim();
        const isNumeric = /^\d+$/.test(cleanQuery);

        let items: PublicStockItem[] = [];
        if (isNumeric) {
            items = await fetchPublicStockPriceInfo({ srtnCd: cleanQuery });
        } else {
            items = await fetchPublicStockPriceInfo({ likeItmsNm: cleanQuery });
        }

        const seen = new Set();
        const uniqueItems = items.filter(item => {
            if (!item.srtnCd || seen.has(item.srtnCd)) return false;
            seen.add(item.srtnCd);
            return true;
        });

        return uniqueItems.map(item => ({
            symbol: item.srtnCd,
            name: item.itmsNm,
            price: parseInt(item.clpr || '0'),
            change: parseInt(item.vs || '0'),
            changePercent: parseFloat(item.fltRt || '0'),
            market: (item.mrktCtg || 'KOSPI') as any,
            currency: 'KRW'
        }));
    } catch (error) {
        console.error('searchStocksAction error:', error);
        return [];
    }
}

/**
 * 심볼(단축코드)을 기반으로 상세 정보를 가져옵니다.
 */
export async function getStockBySymbolAction(symbol: string): Promise<Stock | undefined> {
    try {
        if (!symbol) return undefined;

        const cleanSymbol = symbol.split('.')[0].trim();

        let items = await fetchPublicStockPriceInfo({ srtnCd: cleanSymbol, numOfRows: 1 });

        if (items.length === 0) {
            const isinItems = await fetchPublicStockPriceInfo({ isinCd: cleanSymbol, numOfRows: 1 });
            if (isinItems.length === 0) return undefined;
            items = isinItems;
        }

        const item = items[0];
        if (!item) return undefined;

        return {
            symbol: item.srtnCd,
            name: item.itmsNm,
            price: parseInt(item.clpr || '0'),
            change: parseInt(item.vs || '0'),
            changePercent: parseFloat(item.fltRt || '0'),
            market: (item.mrktCtg || 'KOSPI') as any,
            currency: 'KRW'
        };
    } catch (error) {
        console.error('getStockBySymbolAction error:', error);
        return undefined;
    }
}

/**
 * 차트 데이터 (최근 30일 시세 활용)
 */
export async function getStockChartDataAction(symbol: string, range: string = '1d'): Promise<ChartData[]> {
    try {
        const cleanSymbol = symbol.split('.')[0].trim();
        const items = await fetchPublicStockPriceInfo({ srtnCd: cleanSymbol, numOfRows: 30 });

        if (!items || items.length === 0) return [];

        return items.reverse().map(item => ({
            time: item.basDt ? (item.basDt.substring(4, 6) + '/' + item.basDt.substring(6, 8)) : '',
            price: parseInt(item.clpr || '0')
        }));
    } catch (error) {
        console.error('getStockChartDataAction error:', error);
        return [];
    }
}

export async function getStockStatsAction(symbol: string) {
    try {
        const cleanSymbol = symbol.split('.')[0].trim();
        const results = await fetchPublicStockPriceInfo({ srtnCd: cleanSymbol, numOfRows: 1 });
        if (results.length === 0) return null;

        const item = results[0];
        if (!item) return null;

        return {
            volume: parseInt(item.trqu || '0').toLocaleString(),
            marketCap: (parseInt(item.mrktTotAmt || '0') / 100000000).toFixed(0) + '억',
            high52w: '---',
            low52w: '---'
        };
    } catch (error) {
        console.error('getStockStatsAction error:', error);
        return null;
    }
}

export async function getPublicStockInfoAction(name: string): Promise<PublicStockItem[]> {
    try {
        return fetchPublicStockPriceInfo({ itmsNm: name, numOfRows: 1 });
    } catch (error) {
        console.error('getPublicStockInfoAction error:', error);
        return [];
    }
}

export async function getPublicMarketOverviewAction(): Promise<PublicStockItem[]> {
    try {
        return fetchPublicStockPriceInfo({ numOfRows: 6, mrktCls: 'KOSPI' });
    } catch (error) {
        console.error('getPublicMarketOverviewAction error:', error);
        return [];
    }
}

export async function getTopStocksAction(market: 'KOSPI' | 'KOSDAQ' | 'ALL' = 'ALL'): Promise<Stock[]> {
    try {
        const markets = market === 'ALL' ? ['KOSPI', 'KOSDAQ'] : [market];
        let allItems: PublicStockItem[] = [];

        for (const m of markets) {
            const items = await fetchPublicStockPriceInfo({
                mrktCls: m,
                numOfRows: 20
            });
            allItems = [...allItems, ...items];
        }

        const seen = new Set();
        return allItems
            .filter(item => {
                if (!item.srtnCd || seen.has(item.srtnCd)) return false;
                seen.add(item.srtnCd);
                return true;
            })
            .sort((a, b) => parseInt(b.mrktTotAmt || '0') - parseInt(a.mrktTotAmt || '0'))
            .slice(0, 20)
            .map(item => ({
                symbol: item.srtnCd,
                name: item.itmsNm,
                price: parseInt(item.clpr || '0'),
                change: parseInt(item.vs || '0'),
                changePercent: parseFloat(item.fltRt || '0'),
                market: (item.mrktCtg || 'KOSPI') as any,
                currency: 'KRW'
            }));
    } catch (error) {
        console.error('getTopStocksAction error:', error);
        return [];
    }
}
