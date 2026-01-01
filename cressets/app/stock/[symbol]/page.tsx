import { fetchStockDetail } from "../../lib/api";
import { getComments } from "../../actions/discussion";
import DiscussionBoard from "../../components/DiscussionBoard";
import Link from 'next/link';

export default async function StockDetail({ params }: { params: Promise<{ symbol: string }> }) {
    const { symbol } = await params;
    const stock = await fetchStockDetail(symbol);
    const comments = await getComments(symbol);

    if (!stock) {
        return (
            <div className="container error-container">
                <h1>Stock Not Found</h1>
                <p>Could not retrieve data for symbol: {symbol}</p>
                <Link href="/" className="back-link">← Back to Search</Link>
                <style>{`
            .container { padding: 4rem; text-align: center; }
            .back-link { color: var(--primary-color); text-decoration: underline; margin-top: 1rem; display: inline-block; }
        `}</style>
            </div>
        );
    }

    const price = parseInt(stock.clpr).toLocaleString();
    const change = parseInt(stock.vs);
    const changeRate = parseFloat(stock.fltRt);
    const isPositive = change >= 0;

    return (
        <div className="detail-container">
            <Link href="/" className="back-button">← Back</Link>

            <div className="stock-header glass-panel">
                <div className="header-top">
                    <span className="stock-symbol">{stock.srtnCd}</span>
                    <span className="market-category">{stock.mrktCtg}</span>
                </div>
                <h1 className="stock-name">{stock.itmsNm}</h1>

                <div className="stock-price-row">
                    <span className="current-price">₩{price}</span>
                    <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
                        {isPositive ? '▲' : '▼'} {Math.abs(change).toLocaleString()} ({Math.abs(changeRate)}%)
                    </span>
                </div>

                <div className="stock-meta-grid">
                    <div className="meta-item">
                        <span className="label">Volume</span>
                        <span className="value">{parseInt(stock.trqu).toLocaleString()}</span>
                    </div>
                    <div className="meta-item">
                        <span className="label">High</span>
                        <span className="value">₩{parseInt(stock.hipr).toLocaleString()}</span>
                    </div>
                    <div className="meta-item">
                        <span className="label">Low</span>
                        <span className="value">₩{parseInt(stock.lopr).toLocaleString()}</span>
                    </div>
                    <div className="meta-item">
                        <span className="label">Market Cap</span>
                        <span className="value">{(parseInt(stock.mrktTotAmt) / 100000000).toLocaleString()} 억</span>
                    </div>
                </div>
            </div>

            <div className="discussion-section">
                <DiscussionBoard stockSymbol={symbol} initialComments={comments} />
            </div>

            <style>{`
        .detail-container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          min-height: 100vh;
        }
        .back-button {
          display: inline-block;
          margin-bottom: 2rem;
          color: var(--text-secondary);
          transition: color 0.2s;
        }
        .back-button:hover {
          color: white;
        }
        .stock-header {
          padding: 2.5rem;
          margin-bottom: 2rem;
        }
        .header-top {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .stock-symbol {
          background: rgba(255,255,255,0.1);
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 0.875rem;
          font-family: monospace;
        }
        .market-category {
          color: var(--text-secondary);
          font-size: 0.875rem;
        }
        .stock-name {
          font-size: 2.5rem;
          font-weight: 700;
          margin-bottom: 1.5rem;
        }
        .stock-price-row {
          display: flex;
          align-items: baseline;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .current-price {
          font-size: 3rem;
          font-weight: 700;
          letter-spacing: -0.03em;
        }
        .price-change {
          font-size: 1.25rem;
          font-weight: 500;
        }
        .positive { color: #00e5ff; }
        .negative { color: #ff2979; }
        
        .stock-meta-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1.5rem;
            border-top: 1px solid rgba(255,255,255,0.1);
            padding-top: 1.5rem;
        }
        .meta-item {
            display: flex;
            flex-direction: column;
            gap: 0.25rem;
        }
        .label {
            font-size: 0.875rem;
            color: var(--text-secondary);
        }
        .value {
            font-size: 1.125rem;
            font-weight: 500;
        }
      `}</style>
        </div>
    );
}
