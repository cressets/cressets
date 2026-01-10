'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey }),
      });

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError('Access Denied');
      }
    } catch (err) {
      setError('Connection Error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-white relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="p-8 bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-[0_0_50px_rgba(0,255,255,0.2)]"
      >
        <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">
          CRESSETS
        </h1>
        <form onSubmit={handleLogin} className="flex flex-col gap-4 w-80">
          <input
            type="password"
            placeholder="ENTER API KEY"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-4 bg-black/50 border border-white/20 rounded-lg text-center tracking-widest text-cyan-300 focus:border-cyan-500 transition-colors placeholder:text-gray-600 outline-none"
            autoFocus
          />
          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
          <button
            disabled={loading}
            className="w-full p-4 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/50 text-cyan-400 rounded-lg uppercase tracking-wider font-bold transition-all disabled:opacity-50"
          >
            {loading ? 'AUTHENTICATING...' : 'ACCESS STORAGE'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
