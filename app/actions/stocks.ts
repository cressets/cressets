'use server';

import * as stocksLib from '@/lib/stocks';
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
