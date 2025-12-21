'use server';

import db from '@/lib/db';
// uuid 대신 가벼운 ID 생성 로직 사용

export interface Insight {
    id: string;
    category: string;
    title: string;
    summary: string;
    author: string;
    time: string;
    image: string;
    content: string;
    url: string;
}

const CATEGORIES = ['시장 분석', '전문가 칼럼', '해외 뉴스', '산업 트렌드'];

export async function getInsightsAction(): Promise<{ insights: Insight[], lastScrapedAt: string | null }> {
    // 1. 마지막 스크래핑 시간 확인
    const lastScrape = db.prepare('SELECT value FROM metadata WHERE key = ?').get('last_insight_scrape') as { value: string } | undefined;
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 1 * 60 * 60 * 1000);

    if (!lastScrape || new Date(lastScrape.value) < oneHourAgo) {
        await scrapeInsights();
    }

    // 2. DB에서 데이터 가져오기 (최신순)
    const results = db.prepare('SELECT * FROM insights ORDER BY scrapedAt DESC LIMIT 50').all() as any[];
    const lastScrapedAt = lastScrape ? lastScrape.value : null;

    return {
        insights: results.map(r => ({
            id: r.id,
            category: r.category,
            title: r.title,
            summary: r.summary,
            author: r.author,
            time: r.time,
            image: r.image,
            content: r.content,
            url: r.url
        })),
        lastScrapedAt
    };
}

async function scrapeInsights() {
    const now = new Date();
    try {
        console.log('Scraping real-time market insights from Naver Finance (Flash News)...');

        const insert = db.prepare(`
            INSERT INTO insights (id, category, title, summary, author, time, image, content, url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // 기존 데이터 삭제
        db.prepare('DELETE FROM insights').run();

        // Naver Finance Flash News API
        const naverUrl = `https://m.stock.naver.com/front-api/news/category?category=flashnews&pageSize=50&page=1`;
        const res = await fetch(naverUrl, { cache: 'no-store' });
        const data = await res.json();

        if (data.isSuccess && data.result) {
            for (const item of data.result) {
                const id = item.articleId;
                const title = item.title;
                const author = item.officeName;
                const summary = `[${author}] ${title.substring(0, 50)}...`;

                // Naver format: YYYYMMDDHHMMSS -> Readable format or relative
                const time = formatNaverTime(item.datetime);
                const url = `https://m.stock.naver.com/investment/news/flashnews/view/${item.articleId}`;

                // 카테고리 랜덤 또는 키워드 기반 (기본: 실시간 속보)
                const category = '실시간 속보';

                const image = item.imageOriginLink || `https://images.unsplash.com/photo-1611974717482-480929974861?auto=format&fit=crop&q=80&w=800&sig=${id}`;

                const content = `${item.body || title}\n\n이 기사는 네이버 금융 실시간 속보를 통해 수집되었습니다. 자세한 내용은 원본 링크를 통해 확인해 주세요.`;

                insert.run(id, category, title, summary, author, time, image, content, url);
            }
        }

        // 마지막 스크래핑 시간 저장
        db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)').run('last_insight_scrape', now.toISOString());

        console.log(`Scraping completed.`);
    } catch (error) {
        console.error('Scraping Error:', error);
    }
}

function formatNaverTime(naverDate: string) {
    if (!naverDate || naverDate.length < 12) return '방금 전';
    // YYYYMMDDHHMMSS
    const year = parseInt(naverDate.substring(0, 4));
    const month = parseInt(naverDate.substring(4, 6)) - 1;
    const day = parseInt(naverDate.substring(6, 8));
    const hour = parseInt(naverDate.substring(8, 10));
    const minute = parseInt(naverDate.substring(10, 12));

    const date = new Date(year, month, day, hour, minute);
    const diff = (Date.now() - date.getTime()) / 1000;

    if (diff < 60) return '방금 전';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    return Math.floor(diff / 86400) + '일 전';
}
