'use server';

import db from '@/lib/db';
import { StockNews } from '@/lib/stocks';

export async function getStockNewsAction(symbol: string): Promise<{ news: StockNews[], lastScrapedAt: string | null }> {
    // 1. 해당 종목의 마지막 스크래핑 시간 확인 (최신 1건)
    const lastNews = db.prepare('SELECT scrapedAt FROM stock_news WHERE symbol = ? ORDER BY scrapedAt DESC LIMIT 1').get(symbol) as { scrapedAt: string } | undefined;

    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    if (!lastNews || new Date(lastNews.scrapedAt) < oneHourAgo) {
        await scrapeStockNews(symbol);
    }

    // 2. DB에서 데이터 가져오기 (최신순 10개)
    const results = db.prepare('SELECT * FROM stock_news WHERE symbol = ? ORDER BY scrapedAt DESC LIMIT 10').all(symbol) as any[];
    const lastScrapedAt = results.length > 0 ? results[0].scrapedAt : null;

    return {
        news: results.map(r => ({
            id: r.id,
            title: r.title,
            source: r.source,
            time: r.time,
            content: r.content,
            url: r.url
        })),
        lastScrapedAt
    };
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

        // 해외 주식 네이버 뉴스 API (예: AAPL.O)
        const naverNewsUrl = `https://api.stock.naver.com/news/stock/${symbol}?pageSize=10&page=1`;
        const res = await fetch(naverNewsUrl, { cache: 'no-store' });
        const data = await res.json();

        if (!data || !Array.isArray(data) || data.length === 0) return;

        db.prepare('DELETE FROM stock_news WHERE symbol = ?').run(symbol);
        const insert = db.prepare(`
            INSERT INTO stock_news (id, symbol, title, source, time, content, url)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `);

        for (const item of data) {
            const id = item.articleId || Math.random().toString(36).substr(2, 9);
            const title = item.title;
            const source = item.officeName;
            const time = formatNaverTime(item.datetime);
            const url = `https://m.stock.naver.com/worldstock/stock/${symbol}/news/view/${id}`;
            const content = `[${source}] ${title}\n\n이 기사는 네이버 금융을 통해 실시간으로 수집되었습니다. ${symbol} 관련 최신 글로벌 시장 동향을 확인하세요.\n\n자세한 내용은 원본 링크를 통해 확인하실 수 있습니다.`;

            insert.run(id, symbol, title, source, time, content, url);
        }

        console.log(`Scraped ${data.length} news from Naver (Global) for ${symbol} successfully.`);
    } catch (error) {
        console.error(`Scraping Error for ${symbol}:`, error);
    }
}

function formatNaverTime(naverDate: string) {
    if (!naverDate || naverDate.length < 12) return '방금 전';
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
