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

    // 초기 상태: 시가총액 상위 종목 스크래핑 데이터 노출 (시뮬레이션)
    if (!lowercaseQuery) return ALL_TOP_STOCKS;

    const filtered = ALL_TOP_STOCKS.filter(stock =>
        stock.symbol.toLowerCase().includes(lowercaseQuery) ||
        stock.name.toLowerCase().includes(lowercaseQuery)
    );

    // 검색 결과가 적은 경우, 실시간 스크래핑 엔진 가동 시뮬레이션
    if (filtered.length < 5 && lowercaseQuery.length >= 1) {
        const symbol = lowercaseQuery.toUpperCase();
        const isKorean = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(lowercaseQuery) || /^[0-9]+$/.test(symbol);
        const isJapanese = /^[0-9]{4}$/.test(symbol);

        const market: Market = isKorean ? 'KR' : isJapanese ? 'JP' : 'US';
        const currency = market === 'US' ? 'USD' : market === 'KR' ? 'KRW' : 'JPY';
        const basePrice = market === 'KR' ? 50000 : market === 'JP' ? 3000 : 150;

        // 이미 결과에 포함되지 않은 경우에만 새로운 탐색 결과 추가
        if (!filtered.some(s => s.symbol === symbol)) {
            // "관련주" 대신 더 명확한 명칭 부여
            let name = `${symbol} Group`;
            if (isKorean) {
                name = lowercaseQuery.length <= 3 ? `${lowercaseQuery}산업` : `${lowercaseQuery}홀딩스`;
            }

            filtered.push({
                symbol: isKorean && !/^[0-9]+$/.test(symbol) ? `K${Math.floor(Math.random() * 900000 + 100000)}` : symbol,
                name: name,
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
    const existing = ALL_TOP_STOCKS.find(s => s.symbol.toLowerCase() === lowercaseSymbol);

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
    // 실시간 투자 지표 스크래핑 시뮬레이션
    return {
        volume: (Math.random() * 50000000 + 10000000).toLocaleString(undefined, { maximumFractionDigits: 0 }),
        marketCap: (Math.random() * 3 + 0.5).toFixed(2) + 'T',
        high52w: (Math.random() * 100 + 100).toFixed(2),
        low52w: (Math.random() * 50 + 50).toFixed(2)
    };
}
