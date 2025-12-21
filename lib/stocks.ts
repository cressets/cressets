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
        // Naver 통합 검색 API (국내/해외/코인 등 포함)
        const searchUrl = `https://m.stock.naver.com/front-api/search/autoComplete?query=${encodeURIComponent(lowercaseQuery)}&target=stock,index,marketindicator,coin,ipo`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (!data.result || data.result.length === 0) {
            return [];
        }

        // 전체 검색 결과 중 주식(stock) 카테고리 추출
        const stockGroup = data.result.find((group: any) => group.category === 'stock');
        if (!stockGroup || !stockGroup.items || stockGroup.items.length === 0) return [];

        return stockGroup.items.map((item: any) => {
            const isKR = item.nationType === 'domestic';
            const symbol = isKR
                ? item.repreCode + (item.stockExchangeType === 'KOSPI' ? '.KS' : '.KQ')
                : item.repreCode; // 해외 주식은 AAPL.O 형태 그대로 사용

            return {
                symbol: symbol,
                name: item.nm,
                price: parseFloat(item.nv.toString().replace(/,/g, '')),
                change: parseFloat(item.cv.toString().replace(/,/g, '')),
                changePercent: parseFloat(item.cr.toString()),
                market: isKR ? item.stockExchangeType : item.nationType.toUpperCase(),
                currency: isKR ? 'KRW' : (item.currencyType || 'USD')
            };
        });
    } catch (error) {
        console.error('Search API Error:', error);
        return [];
    }
}

export async function getStockBySymbol(symbol: string): Promise<Stock | undefined> {
    try {
        const isKR = symbol.endsWith('.KS') || symbol.endsWith('.KQ');
        const code = isKR ? symbol.split('.')[0] : symbol;

        if (isKR) {
            // 국내 주식 실시간 시세
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
        } else {
            // 해외 주식 실시간 시세 (예: AAPL.O)
            const naverUrl = `https://polling.finance.naver.com/api/realtime/worldstock/stock/${code}`;
            const res = await fetch(naverUrl, { cache: 'no-store' });
            const data = await res.json();

            if (data.result && data.result.length > 0) {
                const stockInfo = data.result[0];
                return {
                    symbol: symbol,
                    name: stockInfo.nm,
                    price: parseFloat(stockInfo.nv.toString()),
                    change: parseFloat(stockInfo.cv.toString()),
                    changePercent: parseFloat(stockInfo.cr.toString()),
                    market: 'US', // 기본적으로 US로 매핑 (필요시 상세 거래소 정보 활용)
                    currency: stockInfo.cur || 'USD'
                };
            }
        }
        return undefined;
    } catch (error) {
        console.error('GetStockBySymbol API Error:', error);
        return undefined;
    }
}

export async function getStockChartData(symbol: string, range: string = '1d'): Promise<ChartData[]> {
    try {
        const isKR = symbol.endsWith('.KS') || symbol.endsWith('.KQ');
        const code = isKR ? symbol.split('.')[0] : symbol;

        // periodType 매핑
        let periodType = 'day';
        if (range === '1d') periodType = 'day';
        else if (range === '5d') periodType = 'day'; // 네이버는 보통 day로 여러 개 가져옴
        else if (range === '1mo') periodType = 'month';
        else if (range === '1y') periodType = 'year';

        const chartUrl = isKR
            ? `https://api.stock.naver.com/chart/domestic/item/${code}?periodType=${periodType}`
            : `https://api.stock.naver.com/chart/foreign/item/${code}?periodType=${periodType}`;

        const res = await fetch(chartUrl, { cache: 'no-store' });
        const data = await res.json();

        // 네이버 차트 데이터 파싱 로직 (간소화)
        if (!data.priceInfos || !Array.isArray(data.priceInfos)) return [];

        return data.priceInfos.map((item: any) => ({
            time: item.localDateTime.substring(4, 8) === '0000'
                ? item.localDateTime.substring(0, 4)
                : item.localDateTime.substring(4, 6) + '/' + item.localDateTime.substring(6, 8),
            price: parseFloat(item.closePrice.toString().replace(/,/g, ''))
        }));
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
    // 실시간 뉴스 스크래핑 시뮬레이션 (이미 Action에서 구현됨)
    return [];
}

export async function getStockStats(symbol: string) {
    try {
        const isKR = symbol.endsWith('.KS') || symbol.endsWith('.KQ');
        const code = isKR ? symbol.split('.')[0] : symbol;

        const basicUrl = isKR
            ? `https://m.stock.naver.com/api/stock/${code}/basic`
            : `https://api.stock.naver.com/stock/${code}/basic`;

        const res = await fetch(basicUrl, { cache: 'no-store' });
        const data = await res.json();

        const info = isKR ? data : data; // 해외/국내 구조 대동소이

        return {
            volume: info.accumulatedTradingVolume?.toLocaleString() || '---',
            marketCap: info.marketValue ? (parseFloat(info.marketValue.toString().replace(/,/g, '')) / 1e8).toFixed(0) + '억' : '---',
            high52w: info.highPriceOf52Weeks?.toLocaleString() || '---',
            low52w: info.lowPriceOf52Weeks?.toLocaleString() || '---'
        };
    } catch (error) {
        console.error('GetStockStats API Error:', error);
        return null;
    }
}
