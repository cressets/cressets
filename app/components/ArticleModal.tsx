'use client';

import { useEffect, useState } from 'react';
import { scrapeArticleContent, ArticleContent } from '../lib/api/news-client';

interface ArticleModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

export default function ArticleModal({ isOpen, onClose, url, title }: ArticleModalProps) {
    const [content, setContent] = useState<ArticleContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen && url) {
            setLoading(true);
            setError('');
            // Since scrapeArticleContent is a server action (if defined with 'use server' at top of file, or imported from one)
            // Wait, news-client.ts has 'use server' at top? Yes.
            scrapeArticleContent(url)
                .then(data => {
                    if (data) {
                        setContent(data);
                    } else {
                        // If scraping failed or not supported, we show fallback
                        setError('This article content cannot be loaded directly. Please verify on the original site.');
                    }
                })
                .catch(err => {
                    console.error(err);
                    setError('Failed to load article.');
                })
                .finally(() => setLoading(false));
        }
    }, [isOpen, url]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>&times;</button>

                {loading ? (
                    <div className="loading">Cannot load article content...</div>
                ) : error ? (
                    <div className="error-state">
                        <p>{error}</p>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="read-original-btn">
                            READ ORIGINAL ARTICLE
                        </a>
                    </div>
                ) : content ? (
                    <article className="article-body">
                        <h2 className="article-title">{content.title}</h2>
                        <div className="article-meta">
                            <span className="source">{content.source}</span>
                            <span className="date">{content.date}</span>
                        </div>
                        <div className="article-text">
                            {content.content.map((para, i) => (
                                <p key={i}>{para}</p>
                            ))}
                        </div>
                        <a href={url} target="_blank" rel="noopener noreferrer" className="original-link">
                            View Original Source
                        </a>

                        {/* Comment Section Placeholder */}
                        <div className="comments-section">
                            <h3>COMMENTS</h3>
                            <div className="comment-list">
                                <p className="no-comments">No comments yet. Be the first to discuss!</p>
                            </div>
                            <form className="comment-form" onSubmit={(e) => e.preventDefault()}>
                                <input type="text" placeholder="Write a comment..." className="comment-input" />
                                <button className="comment-submit">POST</button>
                            </form>
                        </div>
                    </article>
                ) : null}
            </div>

            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0, 0, 0, 0.7);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000;
                    backdrop-filter: blur(5px);
                }
                .modal-content {
                    background: var(--color-white);
                    width: 90%;
                    max-width: 800px;
                    height: 85vh;
                    overflow-y: auto;
                    padding: 3rem;
                    position: relative;
                    border: 2px solid var(--color-primary);
                    box-shadow: 20px 20px 0px rgba(0,0,0,0.5);
                }
                .close-btn {
                    position: absolute;
                    top: 1rem;
                    right: 1.5rem;
                    font-size: 2rem;
                    background: none;
                    border: none;
                    cursor: pointer;
                }
                .loading, .error-state {
                    height: 100%;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                    align-items: center;
                    font-size: 1.5rem;
                    font-weight: bold;
                    gap: 1rem;
                    text-align: center;
                }
                .read-original-btn {
                    padding: 1rem 2rem;
                    background: var(--color-primary);
                    color: var(--color-white);
                    text-decoration: none;
                    font-weight: bold;
                }
                
                .article-title {
                    font-family: var(--font-heading);
                    font-size: 2.5rem;
                    line-height: 1.2;
                    margin-bottom: 1rem;
                }
                .article-meta {
                    color: var(--color-gray);
                    margin-bottom: 2rem;
                    display: flex;
                    gap: 1rem;
                    font-size: 0.9rem;
                    border-bottom: 1px solid #eee;
                    padding-bottom: 1rem;
                }
                .article-text {
                    font-size: 1.1rem;
                    line-height: 1.8;
                    color: #333;
                }
                .article-text p {
                    margin-bottom: 1.5rem;
                }
                .original-link {
                    display: inline-block;
                    margin-top: 2rem;
                    color: var(--color-tan);
                    font-weight: bold;
                }

                .comments-section {
                    margin-top: 4rem;
                    border-top: 2px solid var(--color-black);
                    padding-top: 2rem;
                }
                .comments-section h3 {
                    font-family: var(--font-heading);
                    margin-bottom: 1.5rem;
                }
                .no-comments {
                    color: #999;
                    font-style: italic;
                    margin-bottom: 1.5rem;
                }
                .comment-form {
                    display: flex;
                    gap: 1rem;
                }
                .comment-input {
                    flex: 1;
                    padding: 1rem;
                    border: 1px solid #ccc;
                }
                .comment-submit {
                    padding: 0 2rem;
                    background: var(--color-primary);
                    color: var(--color-white);
                    font-weight: bold;
                    border: none;
                    cursor: pointer;
                }
            `}</style>
        </div>
    );
}
