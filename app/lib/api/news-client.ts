'use server';

import * as cheerio from 'cheerio';
import axios from 'axios';

export interface NewsItem {
    title: string;
    link: string;
    source: string;
    date: string;
}

export interface ArticleContent {
    title: string;
    date: string;
    content: string[];
    source?: string;
}

// Scrape specific stock news using Google News RSS (More reliable than Naver RSS which is deprecated)
export async function getStockNews(query: string): Promise<NewsItem[]> {
    try {
        // Google News RSS
        const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=ko&gl=KR&ceid=KR:ko`;

        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        const $ = cheerio.load(response.data, { xmlMode: true });
        const newsList: NewsItem[] = [];

        $('item').each((_, element) => {
            const title = $(element).find('title').text();
            const link = $(element).find('link').text();
            const source = $(element).find('source').text() || 'Google News';
            const pubDate = $(element).find('pubDate').text();
            // Format date
            const date = new Date(pubDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

            newsList.push({
                title,
                link,
                source,
                date
            });
        });

        return newsList.slice(0, 10);

    } catch (error) {
        console.error('Failed to fetch news RSS:', error);
        return [];
    }
}

// Scrape market news (Naver Finance Main News) - Crawling fallback
export async function getMarketNews(): Promise<NewsItem[]> {
    try {
        const url = `https://finance.naver.com/news/mainnews.naver`;

        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': 'Mozilla/5.0' }
        });

        const decoder = new TextDecoder('euc-kr');
        const html = decoder.decode(response.data);
        const $ = cheerio.load(html);
        const newsList: NewsItem[] = [];

        $('.mainNewsList li, .newsList li').each((_, element) => {
            const titleEl = $(element).find('dd.articleSubject a, dt.articleSubject a');
            if (!titleEl.length) return;

            const title = titleEl.text().trim();
            const href = titleEl.attr('href');
            const link = href ? `https://finance.naver.com${href}` : '#';
            const source = $(element).find('.press').text().trim() || 'Naver Finance';
            const date = $(element).find('.wdate').text().trim() || new Date().toISOString().slice(0, 10);

            newsList.push({ title, link, source, date });
        });

        return newsList.slice(0, 15);
    } catch (error) {
        console.error('Failed to scrape market news:', error);
        return [];
    }
}

// Scrape article content with improved encoding and selector handling
export async function scrapeArticleContent(url: string): Promise<ArticleContent | null> {
    console.log(`[scraper] Scraping URL: ${url}`);
    try {
        // Allowed domains check (Include google.com for redirects)
        if (!url.includes('naver.com') && !url.includes('google.com')) {
            console.log('[scraper] Domain not supported:', url);
            return null;
        }

        const isFinance = url.includes('finance.naver.com');

        const response = await axios.get(url, {
            responseType: 'arraybuffer',
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            },
            maxRedirects: 5 // Follow redirects (crucial for Google News)
        });

        // Determine encoding
        // If final URL (response.request.res.responseUrl) is finance.naver.com, use euc-kr
        const finalUrl = response.request?.res?.responseUrl || url;
        const isFinanceFinal = finalUrl.includes('finance.naver.com');

        const decoder = new TextDecoder(isFinance || isFinanceFinal ? 'euc-kr' : 'utf-8');
        const html = decoder.decode(response.data);
        const $ = cheerio.load(html);

        // Selectors
        let title = $('#title_area, .media_end_head_title, .article_info h3, .article_header .article_title').first().text().trim();
        let date = $('.media_end_head_info_datestamp, .article_info .date, .article_header .wdate').first().text().trim();

        // Content Selectors (Comprehensive)
        const contentDiv = $('#dic_area, #articeBody, #newsEndContents, .article_cont, .scr_text, .article_body');

        // Cleanup garbage
        contentDiv.find('script, style, iframe, .img_desc, .end_photo_org, .nbd_a, .c_ko_d, .link_news').remove();

        const paragraphs: string[] = [];
        const text = contentDiv.html() || '';

        // Convert br to newlines to preserve structure
        const cleanText = text.replace(/<br\s*\/?>/gi, '\n');

        const $content = cheerio.load(cleanText, { xmlMode: false });
        const rawText = $content.root().text();

        rawText.split('\n').forEach(line => {
            const trimmed = line.trim();
            if (trimmed.length > 0) paragraphs.push(trimmed);
        });

        if (paragraphs.length === 0) {
            console.log('[scraper] No content found via selectors');
            return null;
        }

        return {
            title: title || 'No Title',
            date: date || '',
            content: paragraphs,
            source: 'Naver News'
        };

    } catch (error) {
        console.error('[scraper] Failed:', error);
        return null;
    }
}
