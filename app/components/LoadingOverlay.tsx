'use client';

export default function LoadingOverlay({ fullScreen = false }: { fullScreen?: boolean }) {
    return (
        <div className={`loading-overlay ${fullScreen ? 'fullscreen' : 'absolute'}`}>
            <div className="spinner-container">
                <div className="ring ring-1"></div>
                <div className="ring ring-2"></div>
                <div className="ring ring-3"></div>
                <div className="brand-c">C</div>
            </div>

            <style jsx>{`
                .loading-overlay {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    background: rgba(255, 255, 255, 0.8);
                    backdrop-filter: blur(5px);
                    z-index: 50;
                    transition: opacity 0.3s ease;
                }
                .fullscreen {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100vw;
                    height: 100vh;
                }
                .absolute {
                    position: absolute;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    min-height: 300px;
                }

                .spinner-container {
                    position: relative;
                    width: 80px;
                    height: 80px;
                }

                .ring {
                    position: absolute;
                    border-radius: 50%;
                    border: 2px solid transparent;
                }

                .ring-1 {
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    border-top-color: var(--color-primary);
                    animation: spin 1.5s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                }

                .ring-2 {
                    top: 10px;
                    left: 10px;
                    width: 60px;
                    height: 60px;
                    border-right-color: var(--color-accent);
                    animation: spin 2s cubic-bezier(0.5, 0, 0.5, 1) infinite reverse;
                }

                .ring-3 {
                    top: 20px;
                    left: 20px;
                    width: 40px;
                    height: 40px;
                    border-bottom-color: var(--color-tan);
                    animation: spin 3s cubic-bezier(0.5, 0, 0.5, 1) infinite;
                }

                .brand-c {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-family: var(--font-heading);
                    font-weight: 900;
                    font-size: 1.2rem;
                    color: var(--color-primary);
                    animation: pulse 2s ease-in-out infinite;
                }

                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }

                @keyframes pulse {
                    0%, 100% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
                    50% { opacity: 0.5; transform: translate(-50%, -50%) scale(0.9); }
                }
            `}</style>
        </div>
    );
}
