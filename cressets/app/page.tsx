import EmotionRegistry from "./registry";
import SearchInput from "./components/SearchInput";
import StockCard from "./components/StockCard";
import { fetchStockData } from "./lib/api";
import styles from "./page.module.css"; // We'll replace this with Emotion/SCSS usage directly or keep for compatibility?
// Actually we are using global SCSS and Emotion. I'll refrain from using module.css if possible, or use inline styles/Emotion.

import styled from '@emotion/styled';

// Since we are in a Server Component, we can't use styled-components directly in the *default export* if it's not a client boundary?
// Actually, Emotion's `styled` works in Client Components. For Server Components, we typically use CSS/SCSS or 'use client' wrappers.
// But `page.tsx` is a Server Component.
// Solution: Use SCSS classes or a Client Component wrapper for the layout if we want complex interactivity.
// For the main page structure, standard HTML + SCSS classes is fine.

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  let stocks: any[] = [];

  if (q) {
    stocks = await fetchStockData(q);
  }

  return (
    <main className="main-container">
      <div className="hero-section">
        <h1 className="hero-title text-gradient">Cressets</h1>
        <p className="hero-subtitle">
          Discover market insights and manage your assets with clarity and confidence.<br />
          Cressets is a financial platform that provides stock market search.
        </p>

        <div className="search-wrapper">
          <SearchInput />
        </div>
      </div>

      {q && (
        <div className="results-section">
          <h2 className="section-title">Search Results for "{q}"</h2>
          <div className="stock-grid">
            {stocks.length > 0 ? (
              stocks.map((stock) => (
                // Use a unique key. API might not guarantee unique ID, using srtnCd (Short Code)
                <StockCard key={stock.srtnCd} stock={stock} />
              ))
            ) : (
              <p className="no-results">No results found.</p>
            )}
          </div>
        </div>
      )}

      {/* Basic SCSS styling for this page injected via globals or we can add a style block */}
      <style>{`
        .main-container {
          min-height: 100vh;
          padding: 4rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .hero-section {
          text-align: center;
          margin-bottom: 4rem;
          padding: 4rem 0;
        }
        .hero-title {
          font-size: 4rem;
          font-weight: 800;
          margin-bottom: 1.5rem;
          letter-spacing: -0.04em;
        }
        .hero-subtitle {
          font-size: 1.25rem;
          color: var(--text-secondary);
          margin-bottom: 3rem;
          line-height: 1.6;
          max-width: 600px;
          margin-left: auto;
          margin-right: auto;
        }
        .search-wrapper {
          display: flex;
          justify-content: center;
        }
        .results-section {
          animation: fadeIn 0.5s ease;
        }
        .section-title {
          font-size: 1.5rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.1);
          padding-bottom: 1rem;
        }
        .stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        .no-results {
          text-align: center;
          color: var(--text-secondary);
          font-size: 1.125rem;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </main>
  );
}
