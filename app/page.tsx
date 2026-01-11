'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, X, Command, Cloud, Shield, Zap } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

export default function LandingPage() {
  const [showApiModal, setShowApiModal] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // 강제로 body 스타일 지정 (최후의 수단)
    document.body.style.display = 'flex';
    document.body.style.justifyContent = 'center';
    document.body.style.alignItems = 'center';
    document.body.style.minHeight = '100vh';
    document.body.style.margin = '0';
    document.body.style.overflowX = 'hidden';

    return () => {
      document.body.style.display = '';
      document.body.style.justifyContent = '';
      document.body.style.alignItems = '';
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError('유효하지 않은 API 키입니다');
      }
    } catch {
      setError('연결 오류가 발생했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-center font-sans">

      {/* 1. 배경 */}
      <div className="fixed inset-0 w-screen h-screen z-[-1] pointer-events-none bg-black">
        <div className="absolute inset-0 aurora-gradient opacity-60"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_10%,transparent_100%)]"></div>
      </div>

      {/* 2. 네비게이션 - 중앙 고정 */}
      <div className="fixed top-8 left-1/2 -translate-x-1/2 z-50">
        <div className="glass-card px-8 py-3 rounded-full flex items-center gap-3 shadow-2xl shadow-cyan-900/10">
          <div className="bg-cyan-500/10 p-2 rounded-lg border border-cyan-500/20">
            <Command size={20} className="text-cyan-400" />
          </div>
          <span className="text-sm font-bold tracking-[0.2em] text-white">CRESSETS</span>
        </div>
      </div>

      {/* 3. 메인 콘텐츠 - Absolute Centering으로 강제 중앙 정렬 */}
      <main className="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-full max-w-[1200px] px-6 z-10 flex flex-col items-center justify-center text-center">

        {/* Version Badge */}
        <div className="mb-10 mx-auto glass-card px-5 py-2 rounded-full flex items-center justify-center gap-3 animate-float border-cyan-500/20 bg-cyan-900/5 min-w-max">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
          </span>
          <span className="text-xs font-bold text-cyan-200 uppercase tracking-[0.2em]">
            System Operational
          </span>
        </div>

        {/* Headline */}
        <h1 className="w-full text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[1.05] text-white drop-shadow-2xl mx-auto">
          Redefining<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-500 to-indigo-500 text-glow filter drop-shadow-lg inline-block py-2">
            Digital Freedom
          </span>
        </h1>

        {/* Description */}
        <p className="w-full text-lg md:text-2xl text-slate-300 max-w-3xl mb-14 leading-relaxed font-light text-glow-subtle mx-auto px-4">
          압도적인 속도와 강력한 보안.<br className="hidden sm:block" />
          당신의 데이터를 위한 가장 안전한 공간을 경험하세요.
        </p>

        {/* Feature Icons */}
        <div className="w-full flex justify-center gap-8 sm:gap-16 mb-16 mx-auto">
          <div className="flex flex-col items-center gap-3 group">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-cyan-500/30 group-hover:bg-cyan-500/10 transition-colors">
              <Shield size={28} className="text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-[10px] font-bold text-cyan-200/50 uppercase tracking-[0.2em] group-hover:text-cyan-200 transition-colors">Secure</span>
          </div>
          <div className="flex flex-col items-center gap-3 group">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-blue-500/30 group-hover:bg-blue-500/10 transition-colors">
              <Zap size={28} className="text-blue-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-[10px] font-bold text-blue-200/50 uppercase tracking-[0.2em] group-hover:text-blue-200 transition-colors">Fast</span>
          </div>
          <div className="flex flex-col items-center gap-3 group">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/5 group-hover:border-purple-500/30 group-hover:bg-purple-500/10 transition-colors">
              <Cloud size={28} className="text-purple-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <span className="text-[10px] font-bold text-purple-200/50 uppercase tracking-[0.2em] group-hover:text-purple-200 transition-colors">Unified</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={() => setShowApiModal(true)}
          className="mx-auto btn-premium group relative px-12 py-5 rounded-full font-bold text-lg flex items-center gap-3 z-30 overflow-hidden shadow-[0_0_40px_rgba(255,255,255,0.1)] hover:shadow-[0_0_60px_rgba(6,182,212,0.4)] transition-all duration-500 hover:scale-105 active:scale-95 cursor-pointer"
        >
          <span className="relative z-10 tracking-wide text-slate-900">Get Started</span>
          <ArrowRight size={20} className="relative z-10 text-slate-900 group-hover:translate-x-1.5 transition-transform duration-300" />
          <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
        </button>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-8 left-1/2 -translate-x-1/2 text-center z-10 pointer-events-none w-full">
        <p className="text-slate-500 text-[10px] uppercase tracking-[0.4em] font-medium opacity-70">
          Secured by Cressets &copy; 2026
        </p>
      </footer>

      {/* Modal */}
      <AnimatePresence>
        {showApiModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80 backdrop-blur-xl"
              onClick={() => setShowApiModal(false)}
            />
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-card w-full max-w-md p-10 rounded-[2rem] relative overflow-hidden bg-[#0A0A0F] mx-4 shadow-2xl z-[101]"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Accent Line */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 shadow-[0_0_20px_rgba(6,182,212,0.5)]"></div>

              <div className="flex justify-between items-start mb-10">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Access</h2>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-medium">Private Gateway</p>
                </div>
                <button
                  onClick={() => setShowApiModal(false)}
                  className="p-2 -mr-2 -mt-2 rounded-full hover:bg-white/5 text-slate-500 hover:text-white transition-colors cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleLogin} className="space-y-8">
                <div>
                  <div className="relative group">
                    <input
                      type="password"
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      className="input-glass w-full px-5 py-5 rounded-2xl text-white text-xl outline-none font-mono tracking-[0.2em] placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-sans text-center bg-black/50 border-white/5 focus:border-cyan-500/50 transition-all duration-300"
                      placeholder="ENTER API KEY"
                      autoFocus
                    />
                    <div className="absolute inset-x-0 -bottom-px h-[1px] bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500 shadow-[0_0_10px_rgba(6,182,212,1)]"></div>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-400 text-sm font-medium text-center bg-red-950/30 py-3 rounded-xl border border-red-500/10 flex items-center justify-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={loading || !apiKey}
                  className="w-full py-5 bg-gradient-to-r from-cyan-600 to-blue-600 rounded-2xl text-white font-bold text-lg hover:shadow-[0_0_30px_rgba(6,182,212,0.3)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg border border-white/10 cursor-pointer"
                >
                  {loading ? 'Authenticating...' : 'Connect System'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
