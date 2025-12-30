
export interface PublicStockItem {
    basDt: string;
    srtnCd: string;
    isinCd: string;
    itmsNm: string;
    mrktCls: string;
    clpr: string;
    vs: string;
    fltRt: string;
    mkp: string;
    hipr: string;
    lopr: string;
    trqu: string;
    trPrc: string;
    lstgStkn: string;
    mrktTotAmt: string;
}

export async function fetchPublicStockPriceInfo(params: {
    itmsNm?: string;
    isinCd?: string;
    mrktCls?: string;
    basDt?: string;
    numOfRows?: number;
    pageNo?: number;
}): Promise<PublicStockItem[]> {
    const serviceKey = process.env.API_KEY;
    if (!serviceKey) {
        console.warn('API_KEY is not defined in environment variables.');
        return [];
    }

    const baseUrl = 'http://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';
    const queryParams = new URLSearchParams({
        serviceKey: serviceKey,
        resultType: 'json',
        numOfRows: (params.numOfRows || 10).toString(),
        pageNo: (params.pageNo || 1).toString(),
    });

    if (params.itmsNm) queryParams.append('itmsNm', params.itmsNm);
    if (params.isinCd) queryParams.append('isinCd', params.isinCd);
    if (params.mrktCls) queryParams.append('mrktCls', params.mrktCls);
    if (params.basDt) queryParams.append('basDt', params.basDt);

    try {
        const response = await fetch(`${baseUrl}?${queryParams.toString()}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const items = data?.response?.body?.items?.item;

        if (!items) return [];
        return Array.isArray(items) ? items : [items];
    } catch (error) {
        console.error('Error fetching public stock info:', error);
        return [];
    }
}

export async function getMarketOverview(): Promise<PublicStockItem[]> {
    // Fetch latest market data (usually from 1-2 days ago as it's official data)
    // We'll try to get the most recent date by not specifying basDt and getting top items
    return fetchPublicStockPriceInfo({
        numOfRows: 20,
        mrktCls: 'KOSPI'
    });
}
