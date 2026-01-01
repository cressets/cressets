'use client';

import { useCachedData } from '@/app/hooks/useCachedData';
import { getMarketNews, NewsItem } from '@/app/lib/api/news-client';

import LoadingOverlay from '@/app/components/LoadingOverlay';  // Add import

export default function InsightsPage() {
    const { data: news, loading } = useCachedData<NewsItem[]>('marketNews', getMarketNews, 10 * 60 * 1000);

    return (
        <div className="insights-container">
            <h1 className="page-title">MARKET INSIGHTS</h1>
            <p className="subtitle">Latest Financial News & Opinions</p>

            {loading ? (
                <LoadingOverlay />
            ) : (
                <div className="news-grid">
                    {news?.map((item, idx) => (
                        <article key={idx} className="news-card">
                            <div className="news-meta">
                                <span className="source">{item.source}</span>
                                <span className="date">{item.date}</span>
                            </div>
                            <h3 className="news-title">
                                <a href={item.link} target="_blank" rel="noopener noreferrer">
                                    {item.title}
                                </a>
                            </h3>
                            <div className="card-footer">
                                <a href={item.link} target="_blank" rel="noopener noreferrer" className="read-more">
                                    Read Article <span className="arrow">→</span>
                                </a>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            <style jsx>{`
                .insights-container {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 2rem;
                }
                .page-title {
                    font-size: 4rem;
                    line-height: 1;
                    margin-bottom: 0.5rem;
                    color: var(--color-primary);
                    font-family: var(--font-heading);
                    letter-spacing: -0.02em;
                }
                .subtitle {
                    font-family: var(--font-body);
                    font-size: 1.25rem;
                    color: var(--color-tan);
                    margin-bottom: 3rem;
                    border-bottom: 1px solid var(--color-border);
                    padding-bottom: 1rem;
                    font-weight: 500;
                }
                .news-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                    gap: 2rem;
                }
                .news-card {
                    border: 1px solid var(--color-border);
                    border-radius: var(--border-radius-md);
                    padding: 2rem;
                    background: var(--color-white);
                    display: flex;
                    flex-direction: column;
                    justify-content: space-between;
                    min-height: 240px;
                    transition: var(--transition-smooth);
                    position: relative;
                }
                .news-card:hover {
                    transform: translateY(-5px);
                    box-shadow: var(--shadow-md);
                    border-color: transparent;
                }
                .news-meta {
                    font-family: var(--font-body);
                    font-size: 0.85rem;
                    color: #888;
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 1.5rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .source {
                    font-weight: 700;
                    color: var(--color-accent);
                }
                .news-title {
                    font-size: 1.5rem;
                    line-height: 1.4;
                    margin-bottom: 2rem;
                    font-family: var(--font-heading);
                }
                .news-title a {
                    text-decoration: none;
                    color: var(--color-primary);
                    transition: color 0.2s;
                }
                .news-title a:hover {
                    color: var(--color-accent);
                }
                .card-footer {
                    margin-top: auto;
                    border-top: 1px solid #f5f5f5;
                    padding-top: 1rem;
                    text-align: right;
                }
                .read-more {
                    font-weight: 600;
                    font-size: 0.9rem;
                    color: var(--color-primary);
                    text-decoration: none;
                    font-family: var(--font-body);
                    transition: color 0.2s;
                    display: inline-flex;
                    align-items: center;
                    gap: 0.5rem;
                }
                .read-more:hover {
                    color: var(--color-accent);
                }
                .arrow {
                    transition: transform 0.2s;
                }
                .read-more:hover .arrow {
                    transform: translateX(5px);
                }
                

            `}</style>
        </div>
    );
}
