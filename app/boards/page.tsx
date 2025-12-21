"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { MessageSquare, TrendingUp, User, ArrowRight } from 'lucide-react';
import { getAllRecentPosts, getTrendingSymbols } from '@/app/actions/boards';
import { Post } from '@/types/stock';

export default function BoardsHubPage() {
    const [posts, setPosts] = useState<(Post & { symbol: string })[]>([]);
    const [trending, setTrending] = useState<{ symbol: string; count: number }[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [recentPosts, trendingData] = await Promise.all([
                getAllRecentPosts(),
                getTrendingSymbols()
            ]);
            setPosts(recentPosts);
            setTrending(trendingData);
            setLoading(false);
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-neutral-50 pt-24 pb-20 font-sans">
            <header className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 text-neutral-900">토론 섹션</h1>
                        <p className="text-neutral-800 text-lg font-medium">실시간으로 달궈진 투자자들의 통찰력을 확인하세요.</p>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left: Recent Posts Feed */}
                    <div className="lg:col-span-2 space-y-6">
                        <h2 className="text-xl font-bold flex items-center gap-2 mb-4">
                            <MessageSquare className="text-neutral-400" size={20} />
                            최신 의견
                        </h2>

                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <div key={post.id} className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-800 font-bold">
                                                <User size={18} />
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-neutral-900">{post.author}</div>
                                                <div className="text-xs text-neutral-600 font-bold">{post.createdAt}</div>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/stocks/${post.symbol}`}
                                            className="px-3 py-1 bg-neutral-900 text-white rounded-full text-[10px] font-black tracking-widest hover:bg-neutral-800 transition-colors"
                                        >
                                            {post.symbol}
                                        </Link>
                                    </div>
                                    <p className="text-neutral-900 leading-relaxed font-medium">
                                        {post.content}
                                    </p>
                                </div>
                            ))
                        ) : (
                            <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-neutral-200">
                                <p className="text-neutral-400">아직 작성된 게시글이 없습니다.</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Trending/Shortcuts */}
                    <div className="space-y-8">
                        <div className="bg-neutral-900 text-white p-8 rounded-[40px] shadow-2xl overflow-hidden relative">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                            <TrendingUp className="mb-6 opacity-50" size={32} />
                            <h3 className="text-2xl font-bold mb-6">지금 핫한 종목</h3>

                            <div className="space-y-4">
                                {trending.map((item, index) => (
                                    <Link
                                        key={item.symbol}
                                        href={`/stocks/${item.symbol}`}
                                        className="flex items-center justify-between group p-2 -mx-2 rounded-2xl hover:bg-white/5 transition-colors"
                                    >
                                        <div className="flex items-center gap-4">
                                            <span className="text-white/30 font-black italic text-lg">{index + 1}</span>
                                            <div>
                                                <div className="font-bold">{item.symbol}</div>
                                                <div className="text-[10px] text-white/50 font-medium">{item.count}개의 새로운 의견</div>
                                            </div>
                                        </div>
                                        <ArrowRight size={16} className="text-white/30 group-hover:text-white transition-colors" />
                                    </Link>
                                ))}
                                {trending.length === 0 && (
                                    <p className="text-white/30 text-sm italic">트렌딩 데이터가 아직 없습니다.</p>
                                )}
                            </div>
                        </div>

                        <div className="bg-[#EBE8E3] p-8 rounded-[40px] border border-[#E5E1DB]">
                            <h3 className="text-xl font-bold mb-4 italic">Cressets Insights</h3>
                            <p className="text-neutral-600 text-sm leading-relaxed">
                                토론 섹션은 실제 투자자들의 심리를 반영합니다. 다양한 의견을 경청하시되, 투자는 본인의 확신 하에 진행하세요.
                            </p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
