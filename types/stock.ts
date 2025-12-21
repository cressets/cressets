export type Market = 'US' | 'KR' | 'JP' | 'KOSPI' | 'KOSDAQ';

export interface Stock {
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    market: Market;
    currency: string;
}

export interface ChartData {
    time: string;
    price: number;
}

export interface Post {
    id: string;
    author: string;
    content: string;
    createdAt: string;
    likes: number;
}
