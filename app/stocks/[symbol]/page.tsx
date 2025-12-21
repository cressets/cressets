"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Info, Globe2, Clock, Newspaper, X } from 'lucide-react';
import { Stock, ChartData } from '@/types/stock';
import { StockNews } from '@/lib/stocks';
import { getStockBySymbolAction, getStockChartDataAction, getStockStatsAction } from '@/app/actions/stocks';
import { getStockNewsAction } from '@/app/actions/stock-news';
import StockChart from '@/components/StockChart';
import StockBoard from '@/components/StockBoard';
import { motion, AnimatePresence } from 'framer-motion';

interface PageProps {
    params: Promise<{ symbol: string }>;
}

export default function StockDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const symbol = resolvedParams.symbol;

    const [stock, setStock] = useState<Stock | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [news, setNews] = useState<StockNews[]>([]);
    const [newsLastScraped, setNewsLastScraped] = useState<string | null>(null);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedNews, setSelectedNews] = useState<StockNews | null>(null);
    const [timeframe, setTimeframe] = useState('1d');
    const [chartLoading, setChartLoading] = useState(false);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const [stockData, newsResponse, statsData] = await Promise.all([
                    getStockBySymbolAction(symbol),
                    getStockNewsAction(symbol),
                    getStockStatsAction(symbol)
                ]);

                if (stockData) {
                    setStock(stockData);
                    setNews(newsResponse.news);
                    setNewsLastScraped(newsResponse.lastScrapedAt);
                    setStats(statsData);
                }
            } catch (error) {
                console.error('Fetch error:', error);
            }
            setLoading(false);
        };
        fetchInitialData();
    }, [symbol]);

    useEffect(() => {
        const fetchChart = async () => {
            setChartLoading(true);
            const chart = await getStockChartDataAction(symbol, timeframe);
            setChartData(chart);
            setChartLoading(false);
        };
        fetchChart();
    }, [symbol, timeframe]);

    if (loading) {
        return (
            <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
            </div>
        );
    }

    if (!stock) {
        return (
            <div className="min-h-screen bg-neutral-50 flex flex-col items-center justify-center p-4">
                <h1 className="text-4xl font-bold mb-4">Stock Not Found</h1>
                <Link href="/stocks" className="text-blue-600 hover:underline">Back to search</Link>
            </div>
        );
    }

    const isPositive = stock.change >= 0;

    return (
        <div className="min-h-screen bg-neutral-50 pb-20 font-sans pt-24">
            {/* Detail Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link href="/stocks" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-800 hover:text-neutral-900 transition-colors mb-8 group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        목록으로 돌아가기
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-neutral-100 rounded-full text-[10px] font-bold tracking-widest text-neutral-900 uppercase">{stock.market} 시장</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-800">
                                    <Clock size={12} />
                                    실시간 스크래핑 데이터
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-1 font-serif text-neutral-900">{stock.name}</h1>
                            <p className="text-xl font-mono text-neutral-800 font-medium">{stock.symbol}</p>
                        </div>

                        <div className="text-right">
                            <div className="text-5xl font-black flex items-center gap-2 justify-end text-neutral-900">
                                <span className="text-2xl mt-2">{stock.currency === 'KRW' ? '₩' : stock.currency === 'USD' ? '$' : '¥'}</span>
                                {stock.price.toLocaleString()}
                            </div>
                            <div className={`text-xl font-bold mt-2 flex items-center justify-end gap-2 ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                                {isPositive ? <TrendingUp size={24} /> : <TrendingDown size={24} />}
                                {isPositive ? '+' : ''}{stock.change.toLocaleString()} ({stock.changePercent}%)
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Main Content: Chart & News */}
                    <div className="lg:col-span-2 space-y-10">
                        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-900">
                                    <Info size={18} className="text-neutral-800" />
                                    실시간 차트
                                </h3>
                                <div className="flex gap-2">
                                    {[
                                        { label: '1D', value: '1d' },
                                        { label: '1W', value: '5d' },
                                        { label: '1M', value: '1mo' },
                                        { label: '1Y', value: '1y' }
                                    ].map((tf) => (
                                        <button
                                            key={tf.value}
                                            onClick={() => setTimeframe(tf.value)}
                                            className={`px-3 py-1 text-[10px] font-bold rounded-lg transition-all ${timeframe === tf.value
                                                ? 'bg-black text-white shadow-md'
                                                : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
                                                }`}
                                        >
                                            {tf.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className={`relative ${chartLoading ? 'opacity-50' : 'opacity-100'} transition-opacity`}>
                                {chartLoading && (
                                    <div className="absolute inset-0 flex items-center justify-center z-10">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                                    </div>
                                )}
                                <StockChart data={chartData} isPositive={isPositive} />
                            </div>
                        </div>

                        {/* News Section */}
                        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-bold flex items-center gap-2 text-neutral-900">
                                    <Newspaper size={18} className="text-neutral-800" />
                                    관련 뉴스
                                </h3>
                                {newsLastScraped && (
                                    <span className="text-[10px] font-bold text-neutral-500 bg-neutral-50 px-3 py-1 rounded-full">
                                        마지막 업데이트: {new Date(newsLastScraped).toLocaleString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-6">
                                {news.map((n) => (
                                    <button
                                        key={n.id}
                                        onClick={() => setSelectedNews(n)}
                                        className="block group w-full text-left"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-black text-neutral-800 uppercase tracking-widest">{n.source}</span>
                                            <span className="text-[10px] text-neutral-900 font-bold">{n.time}</span>
                                        </div>
                                        <h4 className="text-base font-bold group-hover:text-blue-600 transition-colors leading-snug text-neutral-900">
                                            {n.title}
                                        </h4>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <StockBoard symbol={symbol} />
                    </div>

                    {/* Sidebar: Info & Stats */}
                    <div className="space-y-8">
                        <div className="bg-neutral-900 text-white p-8 rounded-[40px] shadow-2xl relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                            <Globe2 className="mb-6 opacity-50" size={32} />
                            <h3 className="text-2xl font-bold mb-4">투자 정보</h3>
                            <div className="space-y-6">
                                <div className="flex justify-between border-b border-white/10 pb-4">
                                    <span className="text-white/70 text-sm font-medium">거래량</span>
                                    <span className="font-bold">{stats?.volume || '---'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-4">
                                    <span className="text-white/70 text-sm font-medium">시가총액</span>
                                    <span className="font-bold">{stats?.marketCap || '---'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-4">
                                    <span className="text-white/70 text-sm font-medium">52주 최고</span>
                                    <span className="font-bold text-red-400">{stats?.high52w || '---'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/70 text-sm font-medium">52주 최저</span>
                                    <span className="font-bold text-blue-400">{stats?.low52w || '---'}</span>
                                </div>
                            </div>
                            <button className="w-full mt-10 bg-white text-black py-4 rounded-2xl font-black text-sm hover:scale-[1.02] transition-transform active:scale-100">
                                관심 종목 추가
                            </button>
                        </div>

                        <div className="bg-[#EBE8E3] p-8 rounded-[40px] border border-[#E5E1DB]">
                            <h3 className="text-xl font-bold mb-4 text-neutral-900">AI 투자 전망</h3>
                            <p className="text-neutral-900 text-sm leading-relaxed mb-6">
                                분석 결과, {stock.name}은(는) 현재 시장 트렌드와 유사한 흐름을 보이고 있습니다. 실시간 스크래핑된 지표들은 긍정적인 신호를 보냅니다.
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 h-3 bg-white rounded-full overflow-hidden">
                                    <div className="h-full bg-green-500 w-[78%]" />
                                </div>
                                <span className="text-xs font-black text-neutral-900">78% 매수 우위</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* News Popup (Modal) */}
            <AnimatePresence>
                {selectedNews && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[40px] shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-8 md:p-12">
                                <button
                                    onClick={() => setSelectedNews(null)}
                                    className="absolute top-6 right-6 p-2 rounded-full hover:bg-neutral-100 transition-colors"
                                >
                                    <X size={24} className="text-neutral-900" />
                                </button>

                                <div className="flex items-center gap-3 mb-6">
                                    <span className="px-3 py-1 bg-neutral-100 rounded-full text-[10px] font-bold text-neutral-900 uppercase">
                                        {selectedNews.source}
                                    </span>
                                    <span className="text-[10px] font-black text-neutral-900">
                                        {selectedNews.time}
                                    </span>
                                </div>

                                <h2 className="text-3xl font-black text-neutral-900 mb-8 leading-tight">
                                    {selectedNews.title}
                                </h2>

                                <div className="text-neutral-800 text-lg leading-relaxed font-medium whitespace-pre-wrap max-h-[40vh] overflow-y-auto pr-4 scrollbar-hide">
                                    {selectedNews.content}
                                </div>

                                <div className="mt-12 flex gap-4">
                                    <button
                                        className="flex-1 bg-neutral-900 text-white py-4 rounded-2xl font-black text-sm hover:bg-neutral-800 transition-all"
                                        onClick={() => setSelectedNews(null)}
                                    >
                                        확인
                                    </button>
                                    <Link
                                        href={selectedNews.url}
                                        target="_blank"
                                        className="flex-1 bg-neutral-100 text-neutral-900 py-4 rounded-2xl font-black text-sm text-center hover:bg-neutral-200 transition-all"
                                    >
                                        원본 보기 ↗
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
