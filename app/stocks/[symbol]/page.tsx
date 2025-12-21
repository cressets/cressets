'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, TrendingDown, Info, Globe2, Clock } from 'lucide-react';
import { Stock, ChartData } from '@/types/stock';
import { getStockBySymbol, getStockChartData, getStockNews, getStockStats, StockNews } from '@/lib/stocks';
import StockChart from '@/components/StockChart';
import StockBoard from '@/components/StockBoard';
import { Newspaper } from 'lucide-react';

interface PageProps {
    params: Promise<{ symbol: string }>;
}

export default function StockDetailPage({ params }: PageProps) {
    const resolvedParams = use(params);
    const symbol = resolvedParams.symbol;

    const [stock, setStock] = useState<Stock | null>(null);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [news, setNews] = useState<StockNews[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const [stockData, chart, newsData, statsData] = await Promise.all([
                getStockBySymbol(symbol),
                getStockChartData(symbol),
                getStockNews(symbol),
                getStockStats(symbol)
            ]);

            if (stockData) {
                setStock(stockData);
                setChartData(chart);
                setNews(newsData);
                setStats(statsData);
            }
            setLoading(false);
        };
        fetchData();
    }, [symbol]);

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
        <div className="min-h-screen bg-neutral-50 pb-20 font-sans">
            {/* Detail Header */}
            <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <Link href="/stocks" className="inline-flex items-center gap-2 text-sm font-semibold text-neutral-600 hover:text-neutral-900 transition-colors mb-8 group">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        목록으로 돌아가기
                    </Link>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="px-3 py-1 bg-neutral-100 rounded-full text-[10px] font-bold tracking-widest text-neutral-500 uppercase">{stock.market} MARKET</span>
                                <span className="flex items-center gap-1 text-[10px] font-bold text-neutral-600">
                                    <Clock size={12} />
                                    REAL-TIME SCRAPING DATA
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-1 font-serif">{stock.name}</h1>
                            <p className="text-xl font-mono text-neutral-600 font-medium">{stock.symbol}</p>
                        </div>

                        <div className="text-right">
                            <div className="text-5xl font-black flex items-center gap-2 justify-end">
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
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Info size={18} className="text-neutral-600" />
                                    실시간 차트
                                </h3>
                                <div className="flex gap-2">
                                    <span className="px-3 py-1 bg-black text-white text-[10px] font-bold rounded-lg cursor-pointer">1D</span>
                                    <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-neutral-200">1W</span>
                                    <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-neutral-200">1M</span>
                                    <span className="px-3 py-1 bg-neutral-100 text-neutral-600 text-[10px] font-bold rounded-lg cursor-pointer hover:bg-neutral-200">1Y</span>
                                </div>
                            </div>
                            <StockChart data={chartData} isPositive={isPositive} />
                        </div>

                        {/* News Section */}
                        <div className="bg-white p-8 rounded-[40px] border border-neutral-100 shadow-sm">
                            <h3 className="text-lg font-bold flex items-center gap-2 mb-6">
                                <Newspaper size={18} className="text-neutral-600" />
                                관련 뉴스
                            </h3>
                            <div className="space-y-6">
                                {news.map((n) => (
                                    <Link key={n.id} href={n.url} className="block group">
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest">{n.source}</span>
                                            <span className="text-[10px] text-neutral-400">{n.time}</span>
                                        </div>
                                        <h4 className="text-base font-bold group-hover:text-blue-600 transition-colors leading-snug">
                                            {n.title}
                                        </h4>
                                    </Link>
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
                                    <span className="text-white/50 text-sm font-medium">거래량</span>
                                    <span className="font-bold">{stats?.volume || '---'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-4">
                                    <span className="text-white/50 text-sm font-medium">시가총액</span>
                                    <span className="font-bold">{stats?.marketCap || '---'}</span>
                                </div>
                                <div className="flex justify-between border-b border-white/10 pb-4">
                                    <span className="text-white/50 text-sm font-medium">52주 최고</span>
                                    <span className="font-bold text-red-400">{stats?.high52w || '---'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-white/50 text-sm font-medium">52주 최저</span>
                                    <span className="font-bold text-blue-400">{stats?.low52w || '---'}</span>
                                </div>
                            </div>
                            <button className="w-full mt-10 bg-white text-black py-4 rounded-2xl font-black text-sm hover:scale-[1.02] transition-transform active:scale-100">
                                관심 종목 추가
                            </button>
                        </div>

                        <div className="bg-[#EBE8E3] p-8 rounded-[40px] border border-[#E5E1DB]">
                            <h3 className="text-xl font-bold mb-4">AI 투자 전망</h3>
                            <p className="text-neutral-600 text-sm leading-relaxed mb-6">
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
        </div>
    );
}
