import { Stock, ChartData } from '@/types/stock';

/**
 * 웹 크롤링 코드가 모두 제거되었습니다. 
 * 모든 주식 데이터는 app/actions/stocks.ts의 공공데이터 API를 통해 제공됩니다.
 */

export async function searchStocks(query: string): Promise<Stock[]> {
    return [];
}

export async function getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    return undefined;
}

export async function getStockChartData(symbol: string, range: string = '1d'): Promise<ChartData[]> {
    return [];
}

export interface StockNews {
    id: string;
    title: string;
    source: string;
    time: string;
    url: string;
    content: string;
}

export async function getStockNews(symbol: string): Promise<StockNews[]> {
    return [];
}

export async function getStockStats(symbol: string) {
    return null;
}
