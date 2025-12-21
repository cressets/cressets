import { Stock, ChartData, Post } from '@/types/stock';

const MOCK_STOCKS: Stock[] = [
    // US Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, changePercent: 0.68, market: 'US', currency: 'USD' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 238.45, change: -2.30, changePercent: -0.95, market: 'US', currency: 'USD' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 374.58, change: 4.12, changePercent: 1.11, market: 'US', currency: 'USD' },
    // KR Stocks
    { symbol: '005930', name: '삼성전자', price: 72500, change: 800, changePercent: 1.12, market: 'KR', currency: 'KRW' },
    { symbol: '035420', name: 'NAVER', price: 215000, change: -1500, changePercent: -0.69, market: 'KR', currency: 'KRW' },
    { symbol: '000660', name: 'SK하이닉스', price: 140200, change: 3100, changePercent: 2.26, market: 'KR', currency: 'KRW' },
    // JP Stocks
    { symbol: '7203', name: 'Toyota Motor Corporation', price: 2580, change: 15, changePercent: 0.58, market: 'JP', currency: 'JPY' },
    { symbol: '6758', name: 'Sony Group Corporation', price: 12850, change: -120, changePercent: -0.92, market: 'JP', currency: 'JPY' },
    { symbol: '9984', name: 'SoftBank Group Corp.', price: 6240, change: 85, changePercent: 1.38, market: 'JP', currency: 'JPY' },
];

export async function searchStocks(query: string): Promise<Stock[]> {
    const lowercaseQuery = query.toLowerCase();
    return MOCK_STOCKS.filter(stock =>
        stock.symbol.toLowerCase().includes(lowercaseQuery) ||
        stock.name.toLowerCase().includes(lowercaseQuery)
    );
}

export async function getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    return MOCK_STOCKS.find(s => s.symbol === symbol);
}

export async function getStockChartData(symbol: string): Promise<ChartData[]> {
    const stock = await getStockBySymbol(symbol);
    if (!stock) return [];

    // Generate random walking data for the demo
    const data: ChartData[] = [];
    let currentPrice = stock.price * 0.95;
    const now = new Date();

    for (let i = 0; i < 20; i++) {
        const time = new Date(now.getTime() - (20 - i) * 3600000); // Hourly data
        currentPrice = currentPrice * (1 + (Math.random() * 0.02 - 0.01));
        data.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: Number(currentPrice.toFixed(2))
        });
    }

    // Ensure the last price is the current price
    data.push({
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: stock.price
    });

    return data;
}

// In-memory posts for the demo
const MOCK_POSTS: Record<string, Post[]> = {};

export async function getBoardPosts(symbol: string): Promise<Post[]> {
    if (!MOCK_POSTS[symbol]) {
        MOCK_POSTS[symbol] = [
            { id: '1', author: '주식왕', content: `${symbol} 오늘 전고점 돌파할까요?`, createdAt: '2025-12-21 10:00', likes: 12 },
            { id: '2', author: '개미', content: '방금 추매했습니다. 가즈아!', createdAt: '2025-12-21 10:15', likes: 5 },
        ];
    }
    return MOCK_POSTS[symbol];
}

export async function addPost(symbol: string, author: string, content: string): Promise<Post> {
    const newPost: Post = {
        id: Date.now().toString(),
        author,
        content,
        createdAt: new Date().toLocaleString(),
        likes: 0
    };

    if (!MOCK_POSTS[symbol]) MOCK_POSTS[symbol] = [];
    MOCK_POSTS[symbol].unshift(newPost);
    return newPost;
}
