'use client';

import { useCachedData } from '@/app/hooks/useCachedData';
import { getTopStocks, StockItem } from '@/app/lib/api/stock-client';
import LoadingOverlay from '@/app/components/LoadingOverlay';
import Link from 'next/link';

export default function MarketPage() {
  // 5 minutes TTL for Market Data
  const { data: topStocks, loading } = useCachedData<StockItem[]>('topStocks', getTopStocks, 5 * 60 * 1000);

  return (
    <div className="market-container">
      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">MARKET WATCH</h1>
        <p className="hero-subtitle">Top 20 Market Cap Leaders</p>
      </section>

      <section className="list-section">
        {loading ? (
          <LoadingOverlay />
        ) : (
          <div className="stock-grid">
            {topStocks?.map((stock, index) => (
              <StockCard key={stock.isinCd} stock={stock} rank={index + 1} />
            ))}
          </div>
        )}
      </section>

      <style jsx>{`
        .market-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }
        .hero {
          margin-bottom: 3rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid var(--color-border);
        }
        .hero-title {
          font-size: 4rem;
          line-height: 1;
          color: var(--color-primary);
          font-family: var(--font-heading);
          letter-spacing: -0.02em;
        }
        .hero-subtitle {
          font-family: var(--font-body);
          font-size: 1.25rem;
          color: var(--color-tan);
          margin-top: 0.5rem;
          font-weight: 500;
        }
        .stock-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
        }

      `}</style>
    </div>
  );
}

function StockCard({ stock, rank }: { stock: StockItem; rank?: number }) {
  const isUp = parseFloat(stock.fltRt) > 0;
  const isDown = parseFloat(stock.fltRt) < 0;
  const colorClass = isUp ? 'text-red' : isDown ? 'text-blue' : 'text-neutral';

  return (
    <Link href={`/market/${stock.srtnCd}`} className="stock-card-link">
      <article className="stock-card">
        <div className="card-header">
          {rank && <span className="rank">0{rank}</span>}
          <span className="code">{stock.srtnCd}</span>
        </div>
        <h3 className="stock-name">{stock.itmsNm}</h3>
        <div className="stock-details">
          <span className="price">{parseInt(stock.clpr).toLocaleString()}</span>
          <div className={`change ${colorClass}`}>
            <span className="percent">{isUp ? '+' : ''}{stock.fltRt}%</span>
            <span className="diff">{isUp ? '▲' : isDown ? '▼' : ''} {stock.vs}</span>
          </div>
        </div>
        <div className="market-cap">
          {(parseInt(stock.mrktTotAmt) / 100000000).toLocaleString()} 억
        </div>
      </article>
      <style jsx>{`
        .stock-card-link {
            text-decoration: none;
            display: block;
            height: 100%;
        }
        .stock-card {
          border: 1px solid var(--color-border);
          border-radius: var(--border-radius-md);
          padding: 1.5rem;
          background: var(--color-white);
          transition: var(--transition-smooth);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          position: relative;
          overflow: hidden;
        }
        .stock-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 4px;
            background: var(--color-primary);
            opacity: 0;
            transition: opacity 0.3s ease;
        }
        .stock-card:hover {
          transform: translateY(-5px);
          box-shadow: var(--shadow-md);
          border-color: transparent;
        }
        .stock-card:hover::before {
            opacity: 1;
        }
        .card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 1rem;
          font-family: var(--font-heading);
          color: #888;
          font-size: 0.9rem;
        }
        .rank {
            font-weight: 700;
            color: var(--color-accent);
        }
        .stock-name {
          font-family: var(--font-heading);
          font-size: 1.4rem;
          margin-bottom: 1.5rem;
          line-height: 1.2;
          color: var(--color-primary);
        }
        .stock-details {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: auto;
          border-top: 1px solid #f0f0f0;
          padding-top: 1rem;
        }
        .price {
          font-family: var(--font-body);
          font-size: 1.25rem;
          font-weight: 700;
          color: var(--color-primary);
        }
        .change {
          font-family: var(--font-body);
          font-size: 0.9rem;
          font-weight: 500;
          text-align: right;
        }
        .text-red { color: #D32F2F; }
        .text-blue { color: #1976D2; }
        .text-neutral { color: #757575; }
        
        .market-cap {
            font-size: 0.75rem;
            color: #999;
            margin-top: 0.5rem;
            text-align: right;
            font-family: var(--font-body);
        }
      `}</style>
    </Link>
  );
}
