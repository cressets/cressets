'use client';

import { useEffect, useState } from 'react';

export default function Preloader() {
    const [visible, setVisible] = useState(true);
    const [animate, setAnimate] = useState(false);

    useEffect(() => {
        // Start animation immediately
        setAnimate(true);

        // Fade out after a short delay to simulate sophisticated loading
        const timer = setTimeout(() => {
            setVisible(false);
        }, 2000); // 2 seconds minimum for the "branding" moment

        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className={`preloader ${!visible ? 'hidden' : ''}`}>
            <div className="logo-container">
                <h1 className="logo-text">CRESSETS</h1>
                <div className="line-wrapper">
                    <div className={`line ${animate ? 'animate' : ''}`}></div>
                </div>
                <p className={`tagline ${animate ? 'fade-in' : ''}`}>Discovery with Clarity</p>
            </div>

            <style jsx>{`
        .preloader {
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background-color: var(--color-primary);
          color: var(--color-secondary);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          transition: opacity 0.5s ease-out, visibility 0.5s;
        }
        .preloader.hidden {
          opacity: 0;
          visibility: hidden;
        }
        .logo-container {
          text-align: center;
        }
        .logo-text {
          font-family: var(--font-heading);
          font-size: 4rem;
          margin: 0;
          opacity: 0;
          animation: slideUp 0.8s ease-out forwards;
        }
        .line-wrapper {
          width: 0px;
          height: 2px;
          background: var(--color-accent);
          margin: 1rem auto;
          transition: width 1s ease-in-out;
          animation: expandWidth 1s ease 0.5s forwards;
        }
        .tagline {
          font-family: var(--font-body);
          font-size: 1rem;
          letter-spacing: 0.2rem;
          text-transform: uppercase;
          opacity: 0;
          margin-top: 1rem;
          color: var(--color-tan);
        }
        .tagline.fade-in {
          animation: fadeIn 1s ease 1s forwards;
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes expandWidth {
          from { width: 0; }
          to { width: 100px; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
        </div>
    );
}
