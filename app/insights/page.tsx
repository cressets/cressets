"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, BookOpen, TrendingUp, Search, ArrowRight, Filter, Globe, Zap, Clock, User, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Mock Insight Data
const INSIGHT_CATEGORIES = ['전체', '시장 분석', '전문가 칼럼', '해외 뉴스', '산업 트렌드'];

import { getInsightsAction, Insight } from '@/app/actions/insights';

export default function InsightsPage() {
    const [activeCategory, setActiveCategory] = useState('전체');
    const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
    const [insights, setInsights] = useState<Insight[]>([]);
    const [lastScraped, setLastScraped] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInsights = async () => {
            const response = await getInsightsAction();
            setInsights(response.insights);
            setLastScraped(response.lastScrapedAt);
            setLoading(false);
        };
        fetchInsights();
    }, []);
    const filteredPosts = activeCategory === '전체'
        ? insights
        : insights.filter(p => p.category === activeCategory);

    return (
        <div className="min-h-screen bg-neutral-50 pt-32 pb-20 font-sans">
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 text-white text-[10px] font-black tracking-widest uppercase">
                            <Zap size={14} className="fill-white" />
                            인사이트 허브
                        </div>
                        {lastScraped && (
                            <span className="text-[10px] font-bold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-full flex items-center gap-1">
                                <Clock size={12} />
                                마지막 업데이트: {new Date(lastScraped).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-neutral-900 mb-6 font-serif">
                        시장 통찰력 & <br /> 실시간 분석 리포트.
                    </h1>
                    <p className="text-xl text-neutral-900 max-w-2xl leading-relaxed font-medium">
                        Cressets의 데이터 엔진이 수집한 전 세계의 주요 인사이트와 뉴스, <br />그리고 전문가들의 깊이 있는 분석을 한눈에 확인하세요.
                    </p>
                </div>

                {/* Categories & Search */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 mb-12">
                    <div className="flex flex-wrap gap-2">
                        {INSIGHT_CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={`px-6 py-3 rounded-2xl text-sm font-black transition-all ${activeCategory === cat
                                    ? 'bg-neutral-900 text-white shadow-xl scale-105'
                                    : 'bg-white text-neutral-800 border border-neutral-100 hover:bg-neutral-100'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:max-w-xs">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-900 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="찾으시는 키워드가 있나요?"
                            className="w-full pl-12 pr-4 py-4 bg-white border border-neutral-100 rounded-3xl focus:ring-2 focus:ring-neutral-900 transition-all outline-none font-medium text-neutral-900"
                        />
                    </div>
                </div>

                {/* Insight Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredPosts.map((post) => (
                        <motion.button
                            layoutId={post.id}
                            key={post.id}
                            onClick={() => setSelectedInsight(post)}
                            className="group bg-white rounded-[45px] overflow-hidden border border-neutral-100 shadow-sm hover:shadow-2xl transition-all text-left"
                        >
                            <div className="relative aspect-video overflow-hidden">
                                <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                <div className="absolute top-4 left-4">
                                    <span className="px-4 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black text-neutral-900 border border-white/20">
                                        {post.category}
                                    </span>
                                </div>
                            </div>
                            <div className="p-8">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-6 h-6 rounded-full bg-neutral-100 flex items-center justify-center">
                                        <User size={12} className="text-neutral-900" />
                                    </div>
                                    <span className="text-xs font-black text-neutral-900">{post.author}</span>
                                    <span className="text-xs text-neutral-900/40">•</span>
                                    <span className="text-xs font-bold text-neutral-500">{post.time}</span>
                                </div>
                                <h3 className="text-2xl font-black mb-4 leading-tight group-hover:text-neutral-800 transition-colors text-neutral-900">
                                    {post.title}
                                </h3>
                                <p className="text-neutral-900 leading-relaxed font-medium mb-8 line-clamp-2">
                                    {post.summary}
                                </p>
                                <div className="flex items-center gap-2 text-sm font-black text-neutral-900 group-hover:gap-4 transition-all">
                                    Read Article <ArrowRight size={18} />
                                </div>
                            </div>
                        </motion.button>
                    ))}
                </div>

                {/* CTA */}
                <div className="mt-24 p-16 rounded-[60px] bg-neutral-100 border border-neutral-200 text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -mr-32 -mt-32 blur-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
                    <h2 className="text-3xl font-black mb-6 text-neutral-900 relative z-10">당신만의 투자 통찰력을 기르고 싶으신가요?</h2>
                    <p className="text-xl text-neutral-900 mb-10 max-w-xl mx-auto leading-relaxed relative z-10 font-medium">
                        Cressets의 AI가 분석하는 종목별 리포트를 실시간 검색 기능을 통해 지금 바로 확인해보세요.
                    </p>
                    <Link href="/stocks" className="inline-flex items-center gap-3 bg-neutral-900 text-white px-10 py-5 rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl active:scale-95 relative z-10">
                        종목 검색하기 <Search size={22} />
                    </Link>
                </div>
            </main>

            {/* Modal */}
            <AnimatePresence>
                {selectedInsight && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            layoutId={selectedInsight.id}
                            className="bg-white w-full max-w-3xl rounded-[50px] shadow-2xl relative overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <button
                                onClick={() => setSelectedInsight(null)}
                                className="absolute top-8 right-8 z-10 p-3 rounded-full bg-white/10 backdrop-blur-md text-white hover:bg-white hover:text-black transition-all border border-white/20"
                            >
                                <X size={24} />
                            </button>

                            <div className="relative h-64 shrink-0">
                                <img src={selectedInsight.image} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-white via-white/20 to-transparent" />
                                <div className="absolute bottom-6 left-10">
                                    <span className="px-4 py-1.5 bg-neutral-900 text-white rounded-full text-[10px] font-black uppercase tracking-wider">
                                        {selectedInsight.category}
                                    </span>
                                </div>
                            </div>

                            <div className="p-10 md:p-14 overflow-y-auto scrollbar-hide">
                                <div className="flex items-center gap-3 mb-8">
                                    <div className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center">
                                        <User size={16} className="text-neutral-900" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-black text-neutral-900">{selectedInsight.author}</p>
                                        <p className="text-xs font-bold text-neutral-500">{selectedInsight.time}</p>
                                    </div>
                                </div>

                                <h2 className="text-4xl font-black text-neutral-900 mb-8 leading-tight font-serif">
                                    {selectedInsight.title}
                                </h2>

                                <div className="text-neutral-900 text-xl leading-relaxed font-medium space-y-6">
                                    <p className="font-black text-2xl text-neutral-800 border-l-4 border-neutral-900 pl-6 mb-8 italic">
                                        "{selectedInsight.summary}"
                                    </p>
                                    <p>{selectedInsight.content}</p>
                                    <p>또한 거시 경제 지표들이 긍정적인 신호를 보내고 있습니다. 인플레이션이 둔화되고 고용 시장이 견조한 흐름을 보이면서 소비 심리가 살아나고 있으며, 이는 기업들의 실적 개선으로 이어질 전망입니다.</p>
                                    <p>하지만 여전히 지정학적 리스크와 환율 변동성 등 주의해야 할 요소들이 산재해 있습니다. 투자자들은 분산 투자 원칙을 준수하며 개별 기업의 펀더멘털을 면밀히 검토해야 할 시기입니다.</p>
                                </div>

                                <div className="mt-16 pt-10 border-t border-neutral-100 flex flex-wrap gap-4">
                                    <button
                                        className="flex-1 bg-neutral-900 text-white py-5 rounded-2xl font-black text-sm hover:bg-neutral-800 transition-all shadow-xl"
                                        onClick={() => setSelectedInsight(null)}
                                    >
                                        닫기
                                    </button>
                                    <button className="flex-1 bg-neutral-100 text-neutral-900 py-5 rounded-2xl font-black text-sm hover:bg-neutral-200 transition-all border border-neutral-200 flex items-center justify-center gap-2">
                                        <Globe size={18} /> 공유하기
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
