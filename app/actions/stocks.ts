'use server';

import * as stocksLib from '@/lib/stocks';
import { fetchPublicStockPriceInfo, PublicStockItem } from '@/lib/public-data';
import { Stock, ChartData } from '@/types/stock';

export async function searchStocksAction(query: string): Promise<Stock[]> {
    return stocksLib.searchStocks(query);
}

export async function getStockBySymbolAction(symbol: string): Promise<Stock | undefined> {
    return stocksLib.getStockBySymbol(symbol);
}

export async function getStockChartDataAction(symbol: string, range: string = '1d'): Promise<ChartData[]> {
    return stocksLib.getStockChartData(symbol, range);
}

export async function getStockStatsAction(symbol: string) {
    return stocksLib.getStockStats(symbol);
}

export async function getPublicStockInfoAction(name: string): Promise<PublicStockItem[]> {
    return fetchPublicStockPriceInfo({ itmsNm: name });
}

export async function getPublicMarketOverviewAction(): Promise<PublicStockItem[]> {
    return fetchPublicStockPriceInfo({ numOfRows: 6, mrktCls: 'KOSPI' });
}
