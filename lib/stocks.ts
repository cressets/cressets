import { Stock, ChartData, Market } from '@/types/stock';

const TOP_STOCKS_KR: Stock[] = [
    { symbol: '005930', name: '삼성전자', price: 72500, change: 800, changePercent: 1.12, market: 'KR', currency: 'KRW' },
    { symbol: '000660', name: 'SK하이닉스', price: 140200, change: 3100, changePercent: 2.26, market: 'KR', currency: 'KRW' },
    { symbol: '005935', name: '삼성전자우', price: 58900, change: 400, changePercent: 0.68, market: 'KR', currency: 'KRW' },
    { symbol: '207940', name: '삼성바이오로직스', price: 812000, change: 12000, changePercent: 1.50, market: 'KR', currency: 'KRW' },
    { symbol: '005380', name: '현대차', price: 235000, change: -2500, changePercent: -1.05, market: 'KR', currency: 'KRW' },
    { symbol: '068270', name: '셀트리온', price: 178500, change: 4200, changePercent: 2.41, market: 'KR', currency: 'KRW' },
    { symbol: '005490', name: 'POSCO홀딩스', price: 395000, change: -1500, changePercent: -0.38, market: 'KR', currency: 'KRW' },
    { symbol: '051910', name: 'LG화학', price: 412000, change: -8000, changePercent: -1.90, market: 'KR', currency: 'KRW' },
    { symbol: '035420', name: 'NAVER', price: 215000, change: -1500, changePercent: -0.69, market: 'KR', currency: 'KRW' },
    { symbol: '000270', name: '기아', price: 112000, change: 1500, changePercent: 1.36, market: 'KR', currency: 'KRW' },
];

const TOP_STOCKS_US: Stock[] = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 185.92, change: 1.25, changePercent: 0.68, market: 'US', currency: 'USD' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', price: 374.58, change: 4.12, changePercent: 1.11, market: 'US', currency: 'USD' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', price: 495.22, change: 12.45, changePercent: 2.58, market: 'US', currency: 'USD' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 142.33, change: 0.85, changePercent: 0.60, market: 'US', currency: 'USD' },
    { symbol: 'AMZN', name: 'Amazon.com, Inc.', price: 154.07, change: 1.32, changePercent: 0.86, market: 'US', currency: 'USD' },
    { symbol: 'META', name: 'Meta Platforms, Inc.', price: 353.39, change: 4.56, changePercent: 1.31, market: 'US', currency: 'USD' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', price: 238.45, change: -2.30, changePercent: -0.95, market: 'US', currency: 'USD' },
    { symbol: 'BRK-B', name: 'Berkshire Hathaway Inc.', price: 362.45, change: 0.85, changePercent: 0.23, market: 'US', currency: 'USD' },
    { symbol: 'V', name: 'Visa Inc.', price: 258.12, change: 1.12, changePercent: 0.44, market: 'US', currency: 'USD' },
    { symbol: 'UNH', name: 'UnitedHealth Group Inc.', price: 524.33, change: -3.45, changePercent: -0.65, market: 'US', currency: 'USD' },
];

const ALL_TOP_STOCKS = [...TOP_STOCKS_KR, ...TOP_STOCKS_US];

export async function searchStocks(query: string): Promise<Stock[]> {
    const lowercaseQuery = query.toLowerCase().trim();

    // 초기 상태: 네이버 실시간 인기 종목 또는 시가총액 상위 종목 노출
    if (!lowercaseQuery) {
        try {
            const naverTopUrl = `https://m.stock.naver.com/front-api/home/realTime/top10?nationType=domestic&sortType=top`;
            const res = await fetch(naverTopUrl);
            const data = await res.json();
            if (data.result && data.result.length > 0) {
                return data.result.map((item: any) => ({
                    symbol: item.itemCode + (item.stockExchangeType === 'KOSPI' ? '.KS' : '.KQ'),
                    name: item.itemName,
                    price: parseInt(item.closePrice.replace(/,/g, '')),
                    change: parseInt(item.compareToPreviousClosePrice.replace(/,/g, '')),
                    changePercent: parseFloat(item.fluctuationsRatio),
                    market: item.stockExchangeType as Market,
                    currency: 'KRW'
                }));
            }
        } catch (e) {
            console.warn('Naver Top API failed:', e);
        }
        return ALL_TOP_STOCKS;
    }
    try {
        // Yahoo Finance Search API 활용 (실제 종목 검색)
        const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(lowercaseQuery)}&quotesCount=10&newsCount=0`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (!data.quotes || data.quotes.length === 0) {
            // 결과가 없을 경우 기존 필터링 결과 반환
            return ALL_TOP_STOCKS.filter(stock =>
                stock.symbol.toLowerCase().includes(lowercaseQuery) ||
                stock.name.toLowerCase().includes(lowercaseQuery)
            );
        }

        const symbols = data.quotes
            .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
            .map((q: any) => q.symbol);

        if (symbols.length === 0) return [];

        // 실시간 시세 정보 가져오기 (Yahoo Finance Quote API)
        const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbols.join(',')}`;
        const quoteRes = await fetch(quoteUrl);
        const quoteData = await quoteRes.json();

        const results: Stock[] = quoteData.quoteResponse.result.map((q: any) => {
            const isKR = q.symbol.endsWith('.KS') || q.symbol.endsWith('.KQ');
            const isJP = q.symbol.endsWith('.T');

            return {
                symbol: q.symbol,
                name: q.longName || q.shortName || q.symbol,
                price: q.regularMarketPrice,
                change: q.regularMarketChange,
                changePercent: q.regularMarketChangePercent,
                market: isKR ? 'KR' : isJP ? 'JP' : 'US',
                currency: q.currency
            };
        });

        return results;
    } catch (error) {
        console.error('Search API Error:', error);
        // 에러 시 기존 목업 필터링이라도 수행
        return ALL_TOP_STOCKS.filter(stock =>
            stock.symbol.toLowerCase().includes(lowercaseQuery) ||
            stock.name.toLowerCase().includes(lowercaseQuery)
        );
    }
}

export async function getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    try {
        // 한국 주식의 경우 네이버 API 시도
        if (symbol.endsWith('.KS') || symbol.endsWith('.KQ')) {
            const code = symbol.split('.')[0];
            try {
                const naverUrl = `https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`;
                const res = await fetch(naverUrl);
                const data = await res.json();

                if (data.result && data.result.areas && data.result.areas.length > 0) {
                    const stockInfo = data.result.areas[0].datas[0];
                    return {
                        symbol: symbol,
                        name: stockInfo.nm,
                        price: parseInt(stockInfo.nv.toString()),
                        change: parseInt(stockInfo.cv.toString()),
                        changePercent: parseFloat(stockInfo.cr.toString()),
                        market: symbol.endsWith('.KS') ? 'KOSPI' : 'KOSDAQ',
                        currency: 'KRW'
                    };
                }
            } catch (e) {
                console.warn('Naver API failed, falling back to Yahoo:', e);
            }
        }

        const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
        const res = await fetch(quoteUrl);
        const data = await res.json();

        if (!data.quoteResponse.result || data.quoteResponse.result.length === 0) {
            return ALL_TOP_STOCKS.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());
        }

        const q = data.quoteResponse.result[0];
        const isKR = q.symbol.endsWith('.KS') || q.symbol.endsWith('.KQ');
        const isJP = q.symbol.endsWith('.T');

        return {
            symbol: q.symbol,
            name: q.longName || q.shortName || q.symbol,
            price: q.regularMarketPrice,
            change: q.regularMarketChange,
            changePercent: q.regularMarketChangePercent,
            market: isKR ? (q.symbol.endsWith('.KS') ? 'KOSPI' : 'KOSDAQ') : isJP ? 'JP' : 'US',
            currency: q.currency
        };
    } catch (error) {
        console.error('GetStockBySymbol API Error:', error);
        return ALL_TOP_STOCKS.find(s => s.symbol.toLowerCase() === symbol.toLowerCase());
    }
}

export async function getStockChartData(symbol: string, range: string = '1d'): Promise<ChartData[]> {
    try {
        let interval = '15m';
        if (range === '1d') interval = '5m';
        else if (range === '5d') interval = '30m';
        else if (range === '1mo') interval = '1d';
        else if (range === '1y') interval = '1wk';

        const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=${range}&interval=${interval}`;
        const res = await fetch(chartUrl);
        const data = await res.json();

        if (!data.chart || !data.chart.result || data.chart.result.length === 0) return [];

        const result = data.chart.result[0];
        const timestamps = result.timestamp;
        const prices = result.indicators.quote[0].close;

        if (!timestamps || !prices) return [];

        return timestamps.map((ts: number, i: number) => ({
            time: range === '1d' || range === '5d'
                ? new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : new Date(ts * 1000).toLocaleDateString([], { month: '2-digit', day: '2-digit' }),
            price: prices[i] ? Number(prices[i].toFixed(2)) : null
        })).filter((d: any) => d.price !== null) as ChartData[];
    } catch (error) {
        console.error('GetStockChartData API Error:', error);
        return [];
    }
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
    // 실시간 뉴스 스크래핑 시뮬레이션
    return [
        {
            id: '1',
            title: `${symbol} 주가, 향후 성장성에 대한 투자자들의 긍정적 전망 잇따라`,
            source: 'CRESSETS News',
            time: '2시간 전',
            url: '#',
            content: `투자자들 사이에서 ${symbol}의 중장기 성장 잠재력에 대한 긍정적인 평가가 확산되고 있습니다. 최근 발표된 시장 데이터에 따르면, 해당 분야의 수요가 예상을 상회하고 있으며 ${symbol}은(는) 차별화된 전략으로 시장 점유율을 견고히 하고 있습니다. 전문가들은 거시 경제의 불확실성 속에서도 ${symbol}의 탄탄한 재무 구조가 리스크를 상쇄할 것으로 내다봤습니다.`
        },
        {
            id: '2',
            title: `분석가들, ${symbol}의 4분기 실적 발표에 주목`,
            source: 'Insight Hub',
            time: '5시간 전',
            url: '#',
            content: `금융 분석가들이 ${symbol}의 다가오는 4분기 실적 발표를 예의주시하고 있습니다. 이번 실적 발표는 향후 1년간의 주가 방향성을 결정짓는 중요한 분기점이 될 것으로 보입니다. 특히 수익성 개선 여부와 신규 사업 부문의 성장세가 핵심 관전 포인트로 꼽힙니다. 분석가들은 보수적인 접근을 유지하면서도 기술적 반등의 가능성을 배제하지 않고 있습니다.`
        },
        {
            id: '3',
            title: `${symbol} 관련 주요 시장 변동 사항 및 대응 전략`,
            source: 'Beacon Finance',
            time: '8시간 전',
            url: '#',
            content: `최근 시장 변동성이 확대됨에 따라 ${symbol} 투자자들을 위한 맞춤형 대응 전략이 요구되고 있습니다. 글로벌 공급망의 변화와 금리 인상 기조가 주가에 하방 압력을 가하고 있으나, ${symbol}의 강력한 브랜드 파워와 충성도 높은 고객층은 여전한 강점으로 작용하고 있습니다. 단기적 변동성에 일희일비하기보다 핵심 본질 가치에 집중하는 장기적 관점의 투자가 유효할 것으로 분석됩니다.`
        }
    ];
}

export async function getStockStats(symbol: string) {
    try {
        const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
        const res = await fetch(quoteUrl);
        const data = await res.json();

        if (!data.quoteResponse.result || data.quoteResponse.result.length === 0) return null;

        const q = data.quoteResponse.result[0];

        return {
            volume: q.regularMarketVolume?.toLocaleString() || '---',
            marketCap: q.marketCap ? (q.marketCap / 1e12).toFixed(2) + 'T' : '---',
            high52w: q.fiftyTwoWeekHigh?.toFixed(2) || '---',
            low52w: q.fiftyTwoWeekLow?.toFixed(2) || '---'
        };
    } catch (error) {
        console.error('GetStockStats API Error:', error);
        return null;
    }
}
