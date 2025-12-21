import { Stock, ChartData, Market } from '@/types/stock';

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
        return [];
    }
    try {
        // Yahoo Finance Search API 활용 (실제 종목 검색)
        const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(lowercaseQuery)}&quotesCount=10&newsCount=0`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (!data.quotes || data.quotes.length === 0) {
            return [];
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
                price: isKR ? Math.floor(q.regularMarketPrice) : Number(q.regularMarketPrice.toFixed(2)),
                change: isKR ? Math.floor(q.regularMarketChange) : Number(q.regularMarketChange.toFixed(2)),
                changePercent: Number(q.regularMarketChangePercent.toFixed(2)),
                market: isKR ? (q.symbol.endsWith('.KS') ? 'KOSPI' : 'KOSDAQ') : isJP ? 'JP' : 'US',
                currency: q.currency
            };
        });

        return results;
    } catch (error) {
        console.error('Search API Error:', error);
        return [];
    }
}

export async function getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    try {
        // 1. 한국 주식의 경우 네이버 API 우선 시도 (가장 정확)
        if (symbol.endsWith('.KS') || symbol.endsWith('.KQ')) {
            const code = symbol.split('.')[0];
            try {
                const naverUrl = `https://polling.finance.naver.com/api/realtime/domestic/stock/${code}`;
                const res = await fetch(naverUrl, { cache: 'no-store' });
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

        // 2. 해외 주식 또는 네이버 실패 시 Yahoo Finance Quote API 사용
        const quoteUrl = `https://query1.finance.yahoo.com/v7/finance/quote?symbols=${symbol}`;
        const res = await fetch(quoteUrl, { cache: 'no-store' });
        const data = await res.json();

        if (!data.quoteResponse.result || data.quoteResponse.result.length === 0) {
            return undefined;
        }

        const q = data.quoteResponse.result[0];
        const isKR = q.symbol.endsWith('.KS') || q.symbol.endsWith('.KQ');
        const isJP = q.symbol.endsWith('.T');

        return {
            symbol: q.symbol,
            name: q.longName || q.shortName || q.symbol,
            price: isKR ? Math.floor(q.regularMarketPrice) : Number(q.regularMarketPrice.toFixed(2)),
            change: isKR ? Math.floor(q.regularMarketChange) : Number(q.regularMarketChange.toFixed(2)),
            changePercent: Number(q.regularMarketChangePercent.toFixed(2)),
            market: isKR ? (q.symbol.endsWith('.KS') ? 'KOSPI' : 'KOSDAQ') : isJP ? 'JP' : 'US',
            currency: q.currency
        };
    } catch (error) {
        console.error('GetStockBySymbol API Error:', error);
        return undefined;
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
