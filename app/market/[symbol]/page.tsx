'use client';

import { useEffect, useState, use } from 'react';
import { searchStocks, getStockHistory, getStockByCode, StockItem } from '@/app/lib/api/stock-client';
import { getStockNews } from '@/app/lib/api/news-client';
import { getStockBoard, getPosts } from '@/app/lib/api/community-actions';
import StockChart from '@/app/components/StockChart';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import Link from 'next/link';

// Helper to parse YYYYMMDD to readable date
function formatDate(dateStr: string) {
    if (!dateStr) return '';
    const y = dateStr.slice(0, 4);
    const m = dateStr.slice(4, 6);
    const d = dateStr.slice(6, 8);
    return `${y}-${m}-${d}`;
}

// Basic Post Interface for preview
interface PostPreview {
    id: string;
    title: string;
    author: string;
    createdAt: string;
}

export default function StockDetailPage({ params }: { params: Promise<{ symbol: string }> }) {
    // Unwrap params using React.use()
    const { symbol } = use(params);
    const [stockInfo, setStockInfo] = useState<StockItem | null>(null);
    const [history, setHistory] = useState<{ date: string; close: number }[]>([]);
    const [news, setNews] = useState<{ title: string; link: string; date: string }[]>([]);
    const [posts, setPosts] = useState<PostPreview[]>([]);
    const [boardId, setBoardId] = useState<string>('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            // 1. Get basic info by Code
            const stockData = await getStockByCode(symbol);
            setStockInfo(stockData);

            if (!stockData) {
                setLoading(false);
                return;
            }

            // 2. Get History (Last 3 Months)
            const end = new Date();
            const start = new Date();
            start.setMonth(start.getMonth() - 3); // 3 months

            const toDateStr = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, '');

            const histData = await getStockHistory(symbol, toDateStr(start), toDateStr(end));

            setHistory(histData.map(item => ({
                date: formatDate(item.basDt),
                close: parseInt(item.clpr)
            })));

            // 3. Get News (Search by name - more relevant)
            const newsData = await getStockNews(stockData?.itmsNm || symbol);
            setNews(newsData);

            // 4. Get Community Posts - only if we have stock info
            if (stockData) {
                try {
                    const board = await getStockBoard(stockData.srtnCd, stockData.itmsNm);
                    setBoardId(board.id);
                    const recentPosts = await getPosts(board.id);
                    setPosts(recentPosts.slice(0, 5).map((p: any) => ({
                        id: p.id,
                        title: p.title,
                        author: p.author,
                        createdAt: new Date(p.createdAt).toISOString()
                    })));
                } catch (e) {
                    console.error("Failed to load community:", e);
                }
            }

            setLoading(false);
        }
        fetchData();
    }, [symbol]);

    if (loading) return <LoadingOverlay fullScreen={true} />;
    if (!stockInfo) return <div className="error">STOCK NOT FOUND</div>;

    const isUp = parseFloat(stockInfo.fltRt) > 0;
    const colorClass = isUp ? '#D60000' : parseFloat(stockInfo.fltRt) < 0 ? '#0000D6' : '#000';

    return (
        <div className="detail-container">
            {/* Header */}
            <header className="stock-header">
                <div className="header-top">
                    <h1 className="stock-title">{stockInfo.itmsNm} <span className="stock-code">{stockInfo.srtnCd}</span></h1>
                    <div className="stock-price-block" style={{ color: colorClass }}>
                        <span className="current-price">{parseInt(stockInfo.clpr).toLocaleString()}</span>
                        <span className="change-info">
                            {stockInfo.vs} ({stockInfo.fltRt}%)
                        </span>
                    </div>
                </div>
                <div className="header-meta">
                    <span>Market: {stockInfo.mrktCtg}</span>
                    <span>Vol: {parseInt(stockInfo.trqu).toLocaleString()}</span>
                </div>
            </header>

            {/* Chart Section */}
            <section className="chart-section">
                <h2 className="section-title">PRICE HISTORY (3 MONTHS)</h2>
                <StockChart data={history} />
            </section>

            {/* Grid for News & Community */}
            <div className="info-grid">
                {/* News Section */}
                <section className="news-section">
                    <h2 className="section-title">LATEST NEWS</h2>
                    <div className="news-list">
                        {news.length > 0 ? news.map((item, idx) => (
                            <div className="news-item" key={idx}>
                                <span className="news-date">{item.date}</span>
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="news-link">{item.title}</a>
                            </div>
                        )) : (
                            <div className="news-item">NO NEWS FOUND</div>
                        )}
                    </div>
                </section>

                {/* Community Section */}
                <section className="community-section">
                    <h2 className="section-title">COMMUNITY TALK</h2>
                    <div className="post-list">
                        {posts.length > 0 ? posts.map((post) => (
                            <Link key={post.id} href={`/community/post/${post.id}`} className="post-item-link">
                                <div className="post-item">
                                    <span className="post-user">{post.author}</span>
                                    <p className="post-preview">{post.title}</p>
                                    <span className="post-date">{new Date(post.createdAt).toLocaleDateString()}</span>
                                </div>
                            </Link>
                        )) : (
                            <div className="post-item">No discussion yet. Be the first!</div>
                        )}
                    </div>
                    {boardId && (
                        <Link href={`/community/board/${boardId}`} className="view-all-btn">
                            VIEW ALL DISCUSSION
                        </Link>
                    )}
                </section>
            </div>

            <Link href="/market" className="back-link">← BACK TO MARKET</Link>

            <style jsx>{`
        .detail-container {
            max-width: 1200px;
            margin: 0 auto;
            padding-bottom: 4rem;
            padding: 2rem;
        }
        .loading, .error {
            font-size: 1.5rem;
            font-weight: 500;
            text-align: center;
            padding: 4rem;
            font-family: var(--font-body);
        }
        .stock-header {
            margin-bottom: 3rem;
            border-bottom: 1px solid var(--color-border);
            padding-bottom: 1.5rem;
        }
        .header-top {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
        }
        .stock-title {
            font-size: 4rem;
            font-weight: 900;
            margin: 0;
            line-height: 1;
            font-family: var(--font-heading);
            color: var(--color-primary);
        }
        .stock-code {
            font-size: 1.5rem;
            color: #888;
            font-weight: 400;
            vertical-align: middle;
            font-family: var(--font-body);
        }
        .stock-price-block {
            text-align: right;
            font-family: var(--font-heading);
        }
        .current-price {
            font-size: 3.5rem;
            font-weight: 700;
            display: block;
            line-height: 1;
        }
        .change-info {
            font-size: 1.25rem;
            font-family: var(--font-body);
        }
        .header-meta {
            margin-top: 1rem;
            font-family: var(--font-heading);
            font-size: 1rem;
            color: #555;
            display: flex;
            gap: 2rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }
        .section-title {
            font-size: 1.5rem;
            border-bottom: 1px solid var(--color-border);
            margin-bottom: 1.5rem;
            padding-bottom: 0.5rem;
            font-family: var(--font-heading);
            color: var(--color-primary);
        }
        .chart-section {
            margin-bottom: 4rem;
        }
        .info-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 3rem;
            margin-bottom: 2rem;
        }
        .news-item {
            padding: 1.5rem 0;
            border-bottom: 1px solid var(--color-border);
        }
        .news-date {
            font-size: 0.8rem;
            color: var(--color-accent);
            display: block;
            margin-bottom: 0.3rem;
            font-family: var(--font-body);
            font-weight: 600;
        }
        .news-link {
            font-size: 1.25rem;
            font-weight: 600;
            text-decoration: none;
            color: var(--color-primary);
            font-family: var(--font-heading);
            line-height: 1.3;
        }
        .news-link:hover {
            color: var(--color-accent);
        }
        .post-item {
            background: #fff;
            padding: 1rem;
            border: 1px solid var(--color-border);
            border-radius: var(--border-radius-sm);
            margin-bottom: 0.8rem;
            transition: var(--transition-smooth);
        }
        .post-item:hover {
            border-color: var(--color-accent);
            transform: translateX(5px);
        }
        .post-item-link {
            text-decoration: none;
            color: inherit;
            display: block;
        }
        .post-user {
            font-weight: 700;
            font-size: 0.75rem;
            color: var(--color-accent);
            display: block;
            margin-bottom: 0.3rem;
            text-transform: uppercase;
        }
        .post-preview {
            font-weight: 600;
            font-size: 1rem;
            margin: 0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            font-family: var(--font-heading);
            color: var(--color-primary);
        }
        .post-date {
            font-size: 0.7rem;
            color: #999;
            margin-top: 0.3rem;
            display: block;
        }
        .view-all-btn {
            display: inline-block;
            margin-top: 1rem;
            font-weight: 600;
            text-decoration: none;
            color: var(--color-primary);
            font-family: var(--font-heading);
            border-bottom: 1px solid var(--color-primary);
        }
        .view-all-btn:hover {
            color: var(--color-accent);
            border-color: var(--color-accent);
        }
        .back-link {
            font-weight: 600;
            font-size: 1rem;
            text-decoration: none;
            color: #888;
            font-family: var(--font-body);
            display: inline-flex;
            align-items: center;
        }
        .back-link:hover {
            color: var(--color-primary);
        }
        @media (max-width: 768px) {
            .info-grid {
                grid-template-columns: 1fr;
            }
            .header-top {
                flex-direction: column;
                align-items: flex-start;
            }
            .stock-price-block {
                text-align: left;
                margin-top: 1rem;
            }
        }
      `}</style>
        </div>
    );
}
