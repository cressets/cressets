'use server';

import db from '@/lib/db';

export interface StockNews {
    id: string;
    title: string;
    source: string;
    time: string;
    url: string;
    content: string;
}

/**
 * 프로젝트 방침에 따라 외부 웹 크롤링 코드를 모두 제거했습니다.
 * 현재 공공데이터 API에서 제공하는 별도의 실시간 뉴스 API가 없으므로 빈 결과를 반환합니다.
 */
export async function getStockNewsAction(symbol: string): Promise<{ news: StockNews[], lastScrapedAt: string | null }> {
    return {
        news: [],
        lastScrapedAt: null
    };
}
