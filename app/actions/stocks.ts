'use server';

import { fetchPublicStockPriceInfo, PublicStockItem } from '@/lib/public-data';
import { Stock, ChartData } from '@/types/stock';

/**
 * 공식 공공데이터 API만을 사용하여 종목을 검색합니다. (웹 크롤링 제거)
 */
export async function searchStocksAction(query: string): Promise<Stock[]> {
    if (!query) return getTopStocksAction('ALL');

    const items = await fetchPublicStockPriceInfo({ itmsNm: query });

    return items.map(item => ({
        symbol: item.srtnCd,
        name: item.itmsNm,
        price: parseInt(item.clpr),
        change: parseInt(item.vs),
        changePercent: parseFloat(item.fltRt),
        market: item.mrktCls as any,
        currency: 'KRW'
    }));
}

/**
 * 심볼(단축코드)을 기반으로 상세 정보를 가져옵니다.
 */
export async function getStockBySymbolAction(symbol: string): Promise<Stock | undefined> {
    const items = await fetchPublicStockPriceInfo({ isinCd: symbol }); // isinCd 또는 srtnCd 활용
    // 만약 isinCd로 안나온다면 itmsNm 등으로 재시도할 수 있으나, 여기선 symbol이 srtnCd라고 가정
    const results = items.length > 0 ? items : await fetchPublicStockPriceInfo({ srtnCd: symbol });

    if (results.length === 0) return undefined;

    const item = results[0];
    return {
        symbol: item.srtnCd,
        name: item.itmsNm,
        price: parseInt(item.clpr),
        change: parseInt(item.vs),
        changePercent: parseFloat(item.fltRt),
        market: item.mrktCls as any,
        currency: 'KRW'
    };
}

/**
 * 차트 데이터는 현재 공공데이터에서 일별 시세로 제공되므로, 이를 활용합니다.
 */
export async function getStockChartDataAction(symbol: string, range: string = '1d'): Promise<ChartData[]> {
    const items = await fetchPublicStockPriceInfo({ srtnCd: symbol, numOfRows: 30 });

    return items.reverse().map(item => ({
        time: item.basDt.substring(4, 6) + '/' + item.basDt.substring(6, 8),
        price: parseInt(item.clpr)
    }));
}

export async function getStockStatsAction(symbol: string) {
    const results = await fetchPublicStockPriceInfo({ srtnCd: symbol });
    if (results.length === 0) return null;

    const item = results[0];
    return {
        volume: parseInt(item.trqu).toLocaleString(),
        marketCap: (parseInt(item.mrktTotAmt) / 100000000).toFixed(0) + '억',
        high52w: '---', // 공공데이터 기본 API에서 직접 제공하지 않음
        low52w: '---'
    };
}

export async function getPublicStockInfoAction(name: string): Promise<PublicStockItem[]> {
    return fetchPublicStockPriceInfo({ itmsNm: name });
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

    return allItems
        .sort((a, b) => parseInt(b.mrktTotAmt) - parseInt(a.mrktTotAmt))
        .slice(0, 20)
        .map(item => ({
            symbol: item.srtnCd,
            name: item.itmsNm,
            price: parseInt(item.clpr),
            change: parseInt(item.vs),
            changePercent: parseFloat(item.fltRt),
            market: item.mrktCls as any,
            currency: 'KRW'
        }));
}
