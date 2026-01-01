'use client';

import Link from 'next/link';

export default function Navbar() {
  return (
    <>
      <nav className="main-nav">
        <Link href="/" className="nav-logo">CRESSETS</Link>
        <div className="nav-links">
          <Link href="/market" className="nav-item">MARKET</Link>
          <Link href="/insights" className="nav-item">INSIGHTS</Link>
          <Link href="/community" className="nav-item">COMMUNITY</Link>
        </div>
      </nav>
      <style jsx>{`
        .main-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 5%;
          background: rgba(255, 255, 255, 0.95);
          backdrop-filter: blur(10px);
          position: sticky;
          top: 0;
          z-index: 100;
          border-bottom: 1px solid rgba(0,0,0,0.05);
        }
        .nav-logo {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: var(--color-primary);
          text-decoration: none;
        }
        .nav-links {
          display: flex;
          gap: 2.5rem;
        }
        .nav-item {
          font-family: var(--font-body);
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--color-primary);
          text-decoration: none;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          position: relative;
          padding: 0.5rem 0;
        }
        .nav-item::after {
          content: '';
          position: absolute;
          width: 0;
          height: 1px;
          bottom: 0;
          left: 0;
          background-color: var(--color-accent);
          transition: width 0.3s ease;
        }
        .nav-item:hover {
          color: var(--color-accent);
        }
        .nav-item:hover::after {
          width: 100%;
        }
      `}</style>
    </>
  );
}
