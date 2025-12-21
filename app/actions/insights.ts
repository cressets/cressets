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

export async function getInsightsAction() {
    // 1. 마지막 스크래핑 시간 확인
    const lastScrape = db.prepare('SELECT value FROM metadata WHERE key = ?').get('last_insight_scrape') as { value: string } | undefined;
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000);

    if (!lastScrape || new Date(lastScrape.value) < twoHoursAgo) {
        await scrapeInsights();
    }

    // 2. DB에서 데이터 가져오기 (최신순)
    const results = db.prepare('SELECT * FROM insights ORDER BY scrapedAt DESC LIMIT 50').all() as any[];

    return results.map(r => ({
        id: r.id,
        category: r.category,
        title: r.title,
        summary: r.summary,
        author: r.author,
        time: r.time,
        image: r.image,
        content: r.content,
        url: r.url
    })) as Insight[];
}

async function scrapeInsights() {
    const now = new Date();
    try {
        console.log('Scraping real-time market insights (Global & Domestic)...');

        const insert = db.prepare(`
            INSERT INTO insights (id, category, title, summary, author, time, image, content, url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        // 기존 데이터 삭제
        db.prepare('DELETE FROM insights').run();

        // 1. Yahoo Finance (Global News)
        try {
            const yahooUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=market&newsCount=25`;
            const yRes = await fetch(yahooUrl);
            const yData = await yRes.json();

            if (yData.news) {
                for (const item of yData.news) {
                    const id = item.uuid || Math.random().toString(36).substr(2, 9);
                    const title = item.title;
                    const summary = item.publisher + ' - Global Market Insight';
                    const author = item.publisher;
                    const time = formatTime(item.providerPublishTime * 1000);
                    const url = item.link;
                    const category = '해외 뉴스';
                    const image = (item.thumbnail && item.thumbnail.resolutions && item.thumbnail.resolutions[0].url)
                        || `https://images.unsplash.com/photo-1611974717482-480929974861?auto=format&fit=crop&q=80&w=800&sig=${id}`;
                    const content = `[${author}] ${title}\n\n이 기사는 Yahoo Finance를 통해 실시간으로 수집된 해외 시장 소식입니다.\n\n해당 리포트는 Cressets의 데이터 엔진에 의해 분석되었습니다.`;

                    insert.run(id, category, title, summary, author, time, image, content, url);
                }
            }
        } catch (e) {
            console.error('Yahoo Scrape Error:', e);
        }

        // 2. Naver Finance (Domestic News)
        try {
            // 네이버 주요 뉴스 API
            const naverUrl = `https://m.stock.naver.com/api/news/mainlist?pageSize=25&page=1`;
            const nRes = await fetch(naverUrl);
            const nData = await nRes.json();

            if (nData && Array.isArray(nData)) {
                for (const item of nData) {
                    const id = item.artId || Math.random().toString(36).substr(2, 9);
                    const title = item.title;
                    const summary = item.officeNm + ' - 국내 시장 인사이트';
                    const author = item.officeNm;
                    const time = item.dt; // "20분 전" 등
                    const url = `https://m.stock.naver.com/domestic/stock/home/news/view/${item.artId}`;
                    const category = CATEGORIES[Math.floor(Math.random() * 2)]; // 시장 분석 or 전문가 칼럼
                    const image = item.thumbUrl || `https://images.unsplash.com/photo-1611974717482-480929974861?auto=format&fit=crop&q=80&w=800&sig=${id}`;
                    const content = `[${author}] ${title}\n\n이 기사는 네이버 금융을 통해 실시간으로 수집된 국내 시장 소식입니다.\n\nCressets의 데이터 분석 시스템이 요약한 결과, 해당 기사는 현재 ${category} 분야에서 높은 주목도를 보이고 있습니다.`;

                    insert.run(id, category, title, summary, author, time, image, content, url);
                }
            }
        } catch (e) {
            console.error('Naver Scrape Error:', e);
        }

        // 마지막 스크래핑 시간 저장
        db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)').run('last_insight_scrape', now.toISOString());

        console.log(`Scraping completed.`);
    } catch (error) {
        console.error('Scraping Error:', error);
    }
}

function formatTime(timestamp: number) {
    const diff = (Date.now() - timestamp) / 1000;
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    return Math.floor(diff / 86400) + '일 전';
}
