'use client';

import Link from 'next/link';

export default function Home() {
  return (
    <main className="main-container">
      <div className="content-wrapper">
        <h1 className="hero-title">CRESSETS</h1>
        <p className="hero-subtitle">
          Discover market insights and manage your assets with clarity and confidence.<br />
          Cressets is a financial platform that provides stock market search.
        </p>

        <div className="action-area">
          <Link href="/market" className="cta-button">
            Go to Market
          </Link>
        </div>
      </div>

      <div className="visual-element">
        {/* 3D Wireframe Sphere */}
        <div className="sphere-container">
          <div className="sphere">
            <div className="ring ring-1"></div>
            <div className="ring ring-2"></div>
            <div className="ring ring-3"></div>
            <div className="ring ring-4"></div>
            <div className="core"></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .main-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0 10%;
          background-color: var(--color-secondary); /* Light Mint */
          overflow: hidden;
          position: relative;
        }

        .content-wrapper {
          flex: 1;
          z-index: 2;
          max-width: 600px;
        }

        .hero-title {
          font-family: var(--font-heading);
          font-size: 6rem;
          color: var(--color-primary); /* Deep Green */
          margin-bottom: 2rem;
          line-height: 1;
          letter-spacing: -0.02em;
        }

        .hero-subtitle {
          font-family: var(--font-body);
          font-size: 1.25rem;
          color: #3A4D3F; /* Muted Green-Grey */
          line-height: 1.6;
          margin-bottom: 3rem;
          max-width: 90%;
        }

        .cta-button {
          display: inline-block;
          padding: 1rem 2.5rem;
          background-color: var(--color-primary);
          color: var(--color-white);
          border-radius: 50px; /* Pill shape */
          font-family: var(--font-body);
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          transition: var(--transition-smooth);
          border: 1px solid var(--color-primary);
        }

        .cta-button:hover {
          background-color: transparent;
          color: var(--color-primary);
          transform: translateY(-2px);
          box-shadow: var(--shadow-md);
        }

        .visual-element {
          flex: 1;
          display: flex;
          justify-content: center;
          align-items: center;
          perspective: 1000px;
        }

        .sphere-container {
            width: 500px;
            height: 500px;
            position: relative;
            transform-style: preserve-3d;
            animation: float 6s ease-in-out infinite;
        }

        .sphere {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 100%;
            height: 100%;
            transform-style: preserve-3d;
            transform: translate(-50%, -50%) rotateX(60deg) rotateZ(30deg);
        }

        .ring {
            position: absolute;
            top: 50%;
            left: 50%;
            border-radius: 50%;
            border: 2px solid rgba(46, 125, 50, 0.3); /* Accent transparent */
            transform: translate(-50%, -50%);
            width: 100%;
            height: 100%;
        }

        .ring-1 {
            border-color: var(--color-primary);
            animation: rotate1 12s linear infinite;
        }
        .ring-2 {
            width: 80%;
            height: 80%;
            border-color: var(--color-accent);
            animation: rotate2 15s linear infinite reverse;
        }
        .ring-3 {
            width: 60%;
            height: 60%;
            border-color: var(--color-tan);
            border-width: 1px;
            animation: rotate3 20s linear infinite;
        }
        .ring-4 {
             width: 120%;
             height: 120%;
             border: 1px dashed rgba(10, 38, 19, 0.1);
             animation: rotate1 25s linear infinite;
        }

        .core {
            position: absolute;
            top: 50%;
            left: 50%;
            width: 40px;
            height: 40px;
            background: var(--color-primary);
            border-radius: 50%;
            transform: translate(-50%, -50%);
            box-shadow: 0 0 40px var(--color-accent);
            animation: pulse-core 4s ease-in-out infinite;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }

        @keyframes rotate1 {
            0% { transform: translate(-50%, -50%) rotateY(0deg); }
            100% { transform: translate(-50%, -50%) rotateY(360deg); }
        }
        @keyframes rotate2 {
            0% { transform: translate(-50%, -50%) rotateX(0deg); }
            100% { transform: translate(-50%, -50%) rotateX(360deg); }
        }
        @keyframes rotate3 {
            0% { transform: translate(-50%, -50%) rotateZ(0deg); }
            100% { transform: translate(-50%, -50%) rotateZ(360deg); }
        }
        @keyframes pulse-core {
            0%, 100% { transform: translate(-50%, -50%) scale(1); opacity: 0.8; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
        }

        @media (max-width: 768px) {
          .main-container {
            flex-direction: column;
            justify-content: center;
            text-align: center;
            padding: 4rem 2rem;
          }
          .content-wrapper {
            margin-bottom: 4rem;
          }
          .hero-title {
            font-size: 4rem;
          }
          .sphere-container {
            width: 300px;
            height: 300px;
          }
        }
      `}</style>
    </main>
  );
}
