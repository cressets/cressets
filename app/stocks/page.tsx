"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, TrendingUp, TrendingDown, Globe, SearchIcon } from 'lucide-react';
import { Stock, Market } from '@/types/stock';
import { searchStocksAction } from '@/app/actions/stocks';
import PublicMarketOverview from '@/components/PublicMarketOverview';

export default function StocksPage() {
    const [query, setQuery] = useState('');
    const [stocks, setStocks] = useState<Stock[]>([]);
    const [marketFilter, setMarketFilter] = useState<Market | 'ALL'>('ALL');

    useEffect(() => {
        const fetchStocks = async () => {
            const results = await searchStocksAction(query);
            if (marketFilter === 'ALL') {
                setStocks(results);
            } else {
                setStocks(results.filter(s => s.market === marketFilter));
            }
        };
        fetchStocks();
    }, [query, marketFilter]);

    return (
        <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans pt-24">
            {/* Search Header */}
            <header className="bg-white border-b border-neutral-200 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight mb-1 text-neutral-900">시장 검색</h1>
                            <p className="text-neutral-800">전 세계 주요 주식 시장의 실시간 데이터를 확인하세요.</p>
                        </div>

                        <div className="relative max-w-md w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="종목명 또는 심볼 입력 (예: AAPL, 삼성전자)"
                                className="w-full pl-12 pr-4 py-3 bg-neutral-100 border-none rounded-2xl focus:ring-2 focus:ring-neutral-900 transition-all outline-none"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex gap-2 mt-8 overflow-x-auto pb-2 scrollbar-hide">
                        {(['ALL', 'US', 'KR', 'JP'] as const).map((m) => (
                            <button
                                key={m}
                                onClick={() => setMarketFilter(m)}
                                className={`px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${marketFilter === m
                                    ? 'bg-neutral-900 text-white shadow-lg'
                                    : 'bg-white border border-neutral-200 text-neutral-600 hover:border-neutral-900'
                                    }`}
                            >
                                {m === 'ALL' ? '전체 시장' : m === 'US' ? '미국 주식' : m === 'KR' ? '한국 주식' : '일본 주식'}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {stocks.length > 0 ? (
                        stocks.map((stock) => (
                            <Link
                                key={stock.symbol}
                                href={`/stocks/${stock.symbol}`}
                                className="group bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <span className="text-xs font-black text-neutral-800 uppercase tracking-widest">{stock.market} MARKET</span>
                                        <h3 className="text-xl font-bold mt-1 group-hover:text-blue-600 transition-colors text-neutral-900">{stock.name}</h3>
                                        <p className="text-sm text-neutral-700 font-mono font-bold">{stock.symbol}</p>
                                    </div>
                                    <div className={`p-2 rounded-xl ${stock.change >= 0 ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {stock.change >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                    </div>
                                </div>

                                <div className="mt-6 flex justify-between items-end">
                                    <div>
                                        <div className="text-2xl font-bold">
                                            {stock.currency === 'KRW' ? '₩' : stock.currency === 'USD' ? '$' : '¥'}
                                            {stock.price.toLocaleString()}
                                        </div>
                                        <div className={`text-sm font-semibold mt-1 ${stock.change >= 0 ? 'text-red-500' : 'text-blue-500'}`}>
                                            {stock.change >= 0 ? '+' : ''}{stock.change.toLocaleString()} ({stock.changePercent}%)
                                        </div>
                                    </div>
                                    <div className="text-xs font-black text-neutral-800 group-hover:text-neutral-900 transition-colors">
                                        상세보기 →
                                    </div>
                                </div>
                            </Link>
                        ))
                    ) : (
                        <div className="col-span-full py-20 text-center">
                            <div className="bg-neutral-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <SearchIcon className="text-neutral-400 w-10 h-10" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2 text-neutral-900">검색 결과가 없습니다</h2>
                            <p className="text-neutral-800 font-medium">다른 키워드로 검색하거나 필터를 조절해 보세요.</p>
                        </div>
                    )}
                </div>

                <PublicMarketOverview />
            </main>
        </div>
    );
}
