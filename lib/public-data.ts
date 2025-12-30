
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

/**
 * 전제조건: API_KEY는 공공데이터포털에서 제공하는 '인코딩된(Encoded)' 키여야 합니다.
 * 만약 디코딩된 키인 경우 URLSearchParams에서 자동으로 인코딩되도록 구성해야 합니다.
 * 여기서는 인코딩된 키가 입력된다고 가정하고 수동으로 연결합니다.
 */
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
        console.error('[PublicAPI] ERROR: API_KEY is missing');
        return [];
    }

    const baseUrl = 'https://apis.data.go.kr/1160100/service/GetStockSecuritiesInfoService/getStockPriceInfo';

    // 수동으로 쿼리 파라미터 생성 (serviceKey는 인코딩 오염 방지를 위해 별도로 처리)
    const queryParams = new URLSearchParams();
    queryParams.append('resultType', 'json');
    queryParams.append('numOfRows', (params.numOfRows || 10).toString());
    queryParams.append('pageNo', (params.pageNo || 1).toString());

    if (params.itmsNm) queryParams.append('itmsNm', params.itmsNm);
    if (params.isinCd) queryParams.append('isinCd', params.isinCd);
    if (params.mrktCls) queryParams.append('mrktCls', params.mrktCls);
    if (params.basDt) queryParams.append('basDt', params.basDt);
    if (params.srtnCd) queryParams.append('likeSrtnCd', params.srtnCd);
    if (params.likeSrtnCd) queryParams.append('likeSrtnCd', params.likeSrtnCd);
    if (params.likeItmsNm) queryParams.append('likeItmsNm', params.likeItmsNm);

    // 공공데이터포털 특이사항: serviceKey는 이미 인코딩되어 있으므로 URLSearchParams에 넣으면 이중 인코딩됨.
    // 따라서 수동으로 붙임.
    const fullUrl = `${baseUrl}?serviceKey=${serviceKey}&${queryParams.toString()}`;

    try {
        const response = await fetch(fullUrl, {
            next: { revalidate: 3600 },
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[PublicAPI] HTTP Error: ${response.status}`, errText.substring(0, 500));
            return [];
        }

        const text = await response.text();
        if (!text) return [];

        try {
            const data = JSON.parse(text);
            const resultCode = data?.response?.header?.resultCode;

            if (resultCode && resultCode !== '00') {
                console.warn(`[PublicAPI] API Business Error: ${resultCode} - ${data?.response?.header?.resultMsg}`);
                return [];
            }

            const items = data?.response?.body?.items?.item;
            if (!items) return [];
            return Array.isArray(items) ? items : [items];
        } catch (jsonError) {
            // JSON 파싱 실패 시 XML 에러 메시지일 가능성이 큼
            console.error('[PublicAPI] JSON Parse Error. Response might be XML error:', text.substring(0, 500));
            return [];
        }
    } catch (error) {
        console.error('[PublicAPI] Unexpected Network Error:', error);
        return [];
    }
}

export async function getMarketOverview(): Promise<PublicStockItem[]> {
    return await fetchPublicStockPriceInfo({
        numOfRows: 20,
        mrktCls: 'KOSPI'
    });
}
