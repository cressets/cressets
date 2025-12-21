'use server';

import db from '@/lib/db';
import { StockNews } from '@/lib/stocks';

export async function getStockNewsAction(symbol: string): Promise<StockNews[]> {
    // 1. 해당 종목의 마지막 스크래핑 시간 확인 (최신 1건)
    const lastNews = db.prepare('SELECT scrapedAt FROM stock_news WHERE symbol = ? ORDER BY scrapedAt DESC LIMIT 1').get(symbol) as { scrapedAt: string } | undefined;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (!lastNews || new Date(lastNews.scrapedAt) < oneHourAgo) {
        await scrapeStockNews(symbol);
    }

    // 2. DB에서 데이터 가져오기 (최신순 10개)
    const results = db.prepare('SELECT * FROM stock_news WHERE symbol = ? ORDER BY scrapedAt DESC LIMIT 10').all(symbol) as any[];

    return results.map(r => ({
        id: r.id,
        title: r.title,
        source: r.source,
        time: r.time,
        content: r.content,
        url: r.url
    }));
}

async function scrapeStockNews(symbol: string) {
    try {
        console.log(`Scraping real-time news for ${symbol}...`);

        if (symbol.endsWith('.KS') || symbol.endsWith('.KQ')) {
            const code = symbol.split('.')[0];
            const naverNewsUrl = `https://m.stock.naver.com/api/news/stock/${code}?pageSize=10&page=1`;
            const res = await fetch(naverNewsUrl, { cache: 'no-store' });
            const data = await res.json();

            // 네이버 종목 뉴스는 [{ items: [...] }] 구조임
            if (!data || !Array.isArray(data) || data.length === 0 || !data[0].items) return;

            const items = data[0].items;

            db.prepare('DELETE FROM stock_news WHERE symbol = ?').run(symbol);
            const insert = db.prepare(`
                INSERT INTO stock_news (id, symbol, title, source, time, content, url)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `);

            for (const item of items) {
                const id = item.articleId || item.artId || Math.random().toString(36).substr(2, 9);
                const title = item.title;
                const source = item.officeName || item.officeNm;
                const time = item.datetime || item.dt;
                const url = `https://m.stock.naver.com/domestic/stock/${code}/news/view/${id}`;
                const content = `[${source}] ${title}\n\n이 기사는 네이버 금융을 통해 실시간으로 수집되었습니다. ${symbol} 관련 최신 국내 시장 동향을 확인하세요.\n\n자세한 내용은 원본 링크를 통해 확인하실 수 있습니다.`;

                insert.run(id, symbol, title, source, time, content, url);
            }
            console.log(`Scraped ${items.length} news from Naver for ${symbol} successfully.`);
            return;
        }

        // Yahoo Finance Search API for non-KR stocks
        const searchUrl = `https://query1.finance.yahoo.com/v1/finance/search?q=${symbol}&newsCount=10`;
        const res = await fetch(searchUrl);
        const data = await res.json();

        if (!data.news || data.news.length === 0) return;

        db.prepare('DELETE FROM stock_news WHERE symbol = ?').run(symbol);
        const insert = db.prepare(`
            INSERT INTO stock_news (id, symbol, title, source, time, content, url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of data.news) {
            const id = item.uuid || Math.random().toString(36).substr(2, 9);
            const title = item.title;
            const source = item.publisher;
            const time = formatTime(item.providerPublishTime * 1000);
            const url = item.link;
            const content = `[${source}] ${title}\n\n이 기사는 Yahoo Finance를 통해 실시간으로 수집되었습니다. ${symbol} 관련 최신 시장 동향을 확인하세요.\n\n자세한 내용은 원본 링크를 통해 확인하실 수 있습니다.`;

            insert.run(id, symbol, title, source, time, content, url);
        }

        console.log(`Scraped ${data.news.length} news from Yahoo for ${symbol} successfully.`);
    } catch (error) {
        console.error(`Scraping Error for ${symbol}:`, error);
    }
}

function formatTime(timestamp: number) {
    const diff = (Date.now() - timestamp) / 1000;
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    return Math.floor(diff / 86400) + '일 전';
}
