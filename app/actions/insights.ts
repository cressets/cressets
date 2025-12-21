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
        console.log('Scraping real-time market insights...');

        // Yahoo Finance Search API for news
        const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=market&newsCount=50`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (!data.news || data.news.length === 0) return;

        // 기존 데이터 삭제 (최신 50개 유지를 위해 초기화 후 재삽입)
        db.prepare('DELETE FROM insights').run();

        const insert = db.prepare(`
            INSERT INTO insights (id, category, title, summary, author, time, image, content, url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of data.news) {
            const id = item.uuid || Math.random().toString(36).substr(2, 9);
            const title = item.title;
            const summary = item.publisher + ' - ' + (new Date(item.providerPublishTime * 1000).toLocaleString());
            const author = item.publisher;
            const time = formatTime(item.providerPublishTime * 1000);
            const url = item.link;

            // 카테고리 랜덤 배분 (또는 키워드 기반)
            const category = CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];

            // 이미지 시뮬레이션 (썸네일이 있으면 사용, 없으면 랜덤 비즈니스 이미지)
            const image = (item.thumbnail && item.thumbnail.resolutions && item.thumbnail.resolutions[0].url)
                || `https://images.unsplash.com/photo-1611974717482-480929974861?auto=format&fit=crop&q=80&w=800&sig=${id}`;

            const content = `[${author}] ${title}\n\n이 기사는 Yahoo Finance 통신을 통해 실시간으로 수집되었습니다. 자세한 내용은 원본 링크를 통해 확인하시기 바랍니다.\n\n해당 리포트는 Cressets의 데이터 엔진에 의해 분석되었으며, 시장의 주요 트렌드인 ${category} 섹션으로 분류되었습니다.`;

            insert.run(id, category, title, summary, author, time, image, content, url);
        }

        // 마지막 스크래핑 시간 저장
        db.prepare('INSERT OR REPLACE INTO metadata (key, value) VALUES (?, ?)').run('last_insight_scrape', now.toISOString());

        console.log(`Scraped ${data.news.length} insights successfully.`);
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
