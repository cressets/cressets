
export interface PublicStockItem {
    basDt: string;
    srtnCd: string;
    isinCd: string;
    itmsNm: string;
    mrktCtg: string;
    clpr: string;
    vs: string;
    fltRt: string;
    mkp: string;
    hipr: string;
    lopr: string;
    trqu: string;
    trPrc: string;
    lstgStCnt: string;
    mrktTotAmt: string;
}

export async function fetchPublicStockPriceInfo(params: {
    itmsNm?: string;
    isinCd?: string;
    mrktCls?: string;
    basDt?: string;
    srtnCd?: string;
    likeSrtnCd?: string;
    likeItmsNm?: string;
    numOfRows?: number;
    pageNo?: number;
}): Promise<PublicStockItem[]> {
    const serviceKey = process.env.API_KEY;
    if (!serviceKey) {
        console.error('API_KEY is not defined in environment variables.');
        return [];
    }

    const baseUrl = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';

    // URLSearchParams can double-encode serviceKey if it's already encoded. 
    // Data.go.kr service keys are notoriously sensitive to this.
    // We append serviceKey manually to avoid double encoding.
    const queryParams = new URLSearchParams({
        resultType: 'json',
        numOfRows: (params.numOfRows || 10).toString(),
        pageNo: (params.pageNo || 1).toString(),
    });

    if (params.itmsNm) queryParams.append('itmsNm', params.itmsNm);
    if (params.isinCd) queryParams.append('isinCd', params.isinCd);
    if (params.mrktCls) queryParams.append('mrktCls', params.mrktCls);
    if (params.basDt) queryParams.append('basDt', params.basDt);
    if (params.srtnCd) queryParams.append('likeSrtnCd', params.srtnCd);
    if (params.likeSrtnCd) queryParams.append('likeSrtnCd', params.likeSrtnCd);
    if (params.likeItmsNm) queryParams.append('likeItmsNm', params.likeItmsNm);

    const fullUrl = `${baseUrl}?serviceKey=${serviceKey}&${queryParams.toString()}`;

    try {
        console.log(`Fetching public data: ${baseUrl}?serviceKey=HIDDEN&${queryParams.toString()}`);
        const response = await fetch(fullUrl, {
            next: { revalidate: 3600 }
        });

        const text = await response.text();

        if (!response.ok) {
            console.error(`HTTP error! status: ${response.status}, body: ${text.substring(0, 200)}`);
            return [];
        }

        try {
            const data = JSON.parse(text);

            // Handle error codes from API even with 200 OK
            const resultCode = data?.response?.header?.resultCode;
            if (resultCode && resultCode !== '00') {
                console.error(`API Error: ${resultCode} - ${data?.response?.header?.resultMsg}`);
                return [];
            }

            const items = data?.response?.body?.items?.item;

            if (!items) return [];
            return Array.isArray(items) ? items : [items];
        } catch (e) {
            // If JSON parse fails, it might be XML error from the portal
            console.error('Failed to parse JSON response. Body might be XML error:', text.substring(0, 500));
            return [];
        }
    } catch (error) {
        console.error('Error fetching public stock info:', error);
        return [];
    }
}

export async function getMarketOverview(): Promise<PublicStockItem[]> {
    return fetchPublicStockPriceInfo({
        numOfRows: 20,
        mrktCls: 'KOSPI'
    });
}
