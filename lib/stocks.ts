import { Stock, ChartData, Market } from '@/types/stock';

const MOCK_STOCKS: Stock[] = [
    // US Stocks
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, changePercent: 0.68, market: 'US', currency: 'USD' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 238.45, change: -2.30, changePercent: -0.95, market: 'US', currency: 'USD' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 374.58, change: 4.12, changePercent: 1.11, market: 'US', currency: 'USD' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 495.22, change: 12.45, changePercent: 2.58, market: 'US', currency: 'USD' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.33, change: 0.85, changePercent: 0.60, market: 'US', currency: 'USD' },
    // KR Stocks
    { symbol: '005930', name: '삼성전자', price: 72500, change: 800, changePercent: 1.12, market: 'KR', currency: 'KRW' },
    { symbol: '035420', name: 'NAVER', price: 215000, change: -1500, changePercent: -0.69, market: 'KR', currency: 'KRW' },
    { symbol: '000660', name: 'SK하이닉스', price: 140200, change: 3100, changePercent: 2.26, market: 'KR', currency: 'KRW' },
    { symbol: '035720', name: '카카오', price: 52100, change: -400, changePercent: -0.76, market: 'KR', currency: 'KRW' },
    // JP Stocks
    { symbol: '7203', name: 'Toyota Motor Corp', price: 2580, change: 15, changePercent: 0.58, market: 'JP', currency: 'JPY' },
    { symbol: '6758', name: 'Sony Group Corp', price: 12850, change: -120, changePercent: -0.92, market: 'JP', currency: 'JPY' },
    { symbol: '9984', name: 'SoftBank Group', price: 6240, change: 85, changePercent: 1.38, market: 'JP', currency: 'JPY' },
];

export async function searchStocks(query: string): Promise<Stock[]> {
    const lowercaseQuery = query.toLowerCase().trim();
    if (!lowercaseQuery) return MOCK_STOCKS;

    const filtered = MOCK_STOCKS.filter(stock =>
        stock.symbol.toLowerCase().includes(lowercaseQuery) ||
        stock.name.toLowerCase().includes(lowercaseQuery)
    );

    // 검색 결과가 적거나 없을 때, 새로운 종목 탐색 시뮬레이션
    if (filtered.length < 3 && lowercaseQuery.length >= 2) {
        const symbol = lowercaseQuery.toUpperCase();
        const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(lowercaseQuery) || /^[0-9]+$/.test(symbol);
        const isJapanese = /^[0-9]{4}$/.test(symbol);

        const market: Market = isKorean ? 'KR' : isJapanese ? 'JP' : 'US';
        const currency = market === 'US' ? 'USD' : market === 'KR' ? 'KRW' : 'JPY';
        const basePrice = market === 'KR' ? 50000 : market === 'JP' ? 3000 : 150;

        // 이미 결과에 포함되지 않은 경우에만 추가
        if (!filtered.some(s => s.symbol === symbol)) {
            filtered.push({
                symbol: isKorean && !/^[0-9]+$/.test(symbol) ? `K${Math.floor(Math.random() * 900000 + 100000)}` : symbol,
                name: `${lowercaseQuery} 관련주`,
                price: basePrice + (Math.random() * basePrice * 0.1),
                change: (Math.random() * 10 - 5),
                changePercent: (Math.random() * 4 - 2),
                market: market,
                currency: currency
            });
        }
    }

    return filtered;
}

export async function getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    const lowercaseSymbol = symbol.toLowerCase();
    const existing = MOCK_STOCKS.find(s => s.symbol.toLowerCase() === lowercaseSymbol);

    if (existing) return existing;

    // 없는 종목인 경우 실시간 생성 (상세 페이지 접근 시)
    const isKorean = /^[0-9]+$/.test(symbol) || symbol.startsWith('K');
    const isJapanese = /^[0-9]{4}$/.test(symbol);
    const market: Market = isKorean ? 'KR' : isJapanese ? 'JP' : 'US';
    const currency = market === 'US' ? 'USD' : market === 'KR' ? 'KRW' : 'JPY';
    const basePrice = market === 'KR' ? 50000 : market === 'JP' ? 3000 : 150;

    return {
        symbol: symbol.toUpperCase(),
        name: `${symbol.toUpperCase()} 분석 기업`,
        price: basePrice + (Math.random() * basePrice * 0.1),
        change: (Math.random() * 10 - 5),
        changePercent: (Math.random() * 4 - 2),
        market: market,
        currency: currency
    };
}

export async function getStockChartData(symbol: string): Promise<ChartData[]> {
    const stock = await getStockBySymbol(symbol);
    if (!stock) return [];

    const data: ChartData[] = [];
    let currentPrice = stock.price * 0.95;
    const now = new Date();

    for (let i = 0; i < 20; i++) {
        const time = new Date(now.getTime() - (20 - i) * 3600000);
        currentPrice = currentPrice * (1 + (Math.random() * 0.02 - 0.01));
        data.push({
            time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            price: Number(currentPrice.toFixed(2))
        });
    }

    data.push({
        time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        price: stock.price
    });

    return data;
}

export interface StockNews {
    id: string;
    title: string;
    source: string;
    time: string;
    url: string;
}

export async function getStockNews(symbol: string): Promise<StockNews[]> {
    // 실시간 뉴스 스크래핑 시뮬레이션
    return [
        {
            id: '1',
            title: `${symbol} 주가, 향후 성장성에 대한 투자자들의 긍정적 전망 잇따라`,
            source: 'CRESSETS News',
            time: '2시간 전',
            url: '#'
        },
        {
            id: '2',
            title: `분석가들, ${symbol}의 4분기 실적 발표에 주목`,
            source: 'Insight Hub',
            time: '5시간 전',
            url: '#'
        },
        {
            id: '3',
            title: `${symbol} 관련 주요 시장 변동 사항 및 대응 전략`,
            source: 'Beacon Finance',
            time: '8시간 전',
            url: '#'
        }
    ];
}

export async function getStockStats(symbol: string) {
    // 실시간 투자 지표 스크래핑 시뮬레이션
    return {
        volume: (Math.random() * 50000000 + 10000000).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        marketCap: (Math.random() * 3 + 0.5).toFixed(2) + 'T',
        high52w: (Math.random() * 100 + 100).toFixed(2),
        low52w: (Math.random() * 50 + 50).toFixed(2)
    };
}
