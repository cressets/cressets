'use server';

import { fetchPublicStockPriceInfo, PublicStockItem } from '@/lib/public-data';
import { Stock, ChartData } from '@/types/stock';

/**
 * 공식 공공데이터 API만을 사용하여 종목을 검색합니다.
 */
export async function searchStocksAction(query: string): Promise<Stock[]> {
    if (!query) return getTopStocksAction('ALL');

    const cleanQuery = query.trim();
    // 종목명이면 itmsNm으로 검색, 숫자면 srtnCd로 검색하도록 유연하게 대응
    const isNumeric = /^\d+$/.test(cleanQuery);

    let items: PublicStockItem[] = [];
    if (isNumeric) {
        items = await fetchPublicStockPriceInfo({ srtnCd: cleanQuery });
    } else {
        items = await fetchPublicStockPriceInfo({ likeItmsNm: cleanQuery });
    }

    // 중복 제거 (같은 종목의 다른 날짜 데이터가 올 수 있음)
    const seen = new Set();
    const uniqueItems = items.filter(item => {
        if (seen.has(item.srtnCd)) return false;
        seen.add(item.srtnCd);
        return true;
    });

    return uniqueItems.map(item => ({
        symbol: item.srtnCd,
        name: item.itmsNm,
        price: parseInt(item.clpr),
        change: parseInt(item.vs),
        changePercent: parseFloat(item.fltRt),
        market: item.mrktCtg as any,
        currency: 'KRW'
    }));
}

/**
 * 심볼(단축코드)을 기반으로 상세 정보를 가져옵니다.
 */
export async function getStockBySymbolAction(symbol: string): Promise<Stock | undefined> {
    if (!symbol) return undefined;

    const cleanSymbol = symbol.split('.')[0].trim();

    // srtnCd(단축코드) 검색 -> fetchPublicStockPriceInfo 내부에서 likeSrtnCd로 변환됨
    const items = await fetchPublicStockPriceInfo({ srtnCd: cleanSymbol, numOfRows: 1 });

    if (items.length === 0) {
        const isinItems = await fetchPublicStockPriceInfo({ isinCd: cleanSymbol, numOfRows: 1 });
        if (isinItems.length === 0) return undefined;
        items.push(...isinItems);
    }

    const item = items[0];
    return {
        symbol: item.srtnCd,
        name: item.itmsNm,
        price: parseInt(item.clpr),
        change: parseInt(item.vs),
        changePercent: parseFloat(item.fltRt),
        market: item.mrktCtg as any,
        currency: 'KRW'
    };
}

/**
 * 차트 데이터 (최근 30일 시세 활용)
 */
export async function getStockChartDataAction(symbol: string, range: string = '1d'): Promise<ChartData[]> {
    const cleanSymbol = symbol.split('.')[0].trim();
    const items = await fetchPublicStockPriceInfo({ srtnCd: cleanSymbol, numOfRows: 30 });

    return items.reverse().map(item => ({
        time: item.basDt.substring(4, 6) + '/' + item.basDt.substring(6, 8),
        price: parseInt(item.clpr)
    }));
}

export async function getStockStatsAction(symbol: string) {
    const cleanSymbol = symbol.split('.')[0].trim();
    const results = await fetchPublicStockPriceInfo({ srtnCd: cleanSymbol, numOfRows: 1 });
    if (results.length === 0) return null;

    const item = results[0];
    return {
        volume: parseInt(item.trqu).toLocaleString(),
        marketCap: (parseInt(item.mrktTotAmt) / 100000000).toFixed(0) + '억',
        high52w: '---',
        low52w: '---'
    };
}

export async function getPublicStockInfoAction(name: string): Promise<PublicStockItem[]> {
    return fetchPublicStockPriceInfo({ itmsNm: name, numOfRows: 1 });
}

export async function getPublicMarketOverviewAction(): Promise<PublicStockItem[]> {
    return fetchPublicStockPriceInfo({ numOfRows: 6, mrktCls: 'KOSPI' });
}

export async function getTopStocksAction(market: 'KOSPI' | 'KOSDAQ' | 'ALL' = 'ALL'): Promise<Stock[]> {
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
            if (seen.has(item.srtnCd)) return false;
            seen.add(item.srtnCd);
            return true;
        })
        .sort((a, b) => parseInt(b.mrktTotAmt) - parseInt(a.mrktTotAmt))
        .slice(0, 20)
        .map(item => ({
            symbol: item.srtnCd,
            name: item.itmsNm,
            price: parseInt(item.clpr),
            change: parseInt(item.vs),
            changePercent: parseFloat(item.fltRt),
            market: item.mrktCtg as any,
            currency: 'KRW'
        }));
}
