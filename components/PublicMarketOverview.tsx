
"use client";

import { useState, useEffect } from 'react';
import { PublicStockItem } from '@/lib/public-data';
import { getPublicMarketOverviewAction } from '@/app/actions/stocks';
import { Globe2, TrendingUp, TrendingDown } from 'lucide-react';

export default function PublicMarketOverview() {
    const [data, setData] = useState<PublicStockItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const result = await getPublicMarketOverviewAction();
                setData(result);
            } catch (error) {
                console.error('Error fetching market overview:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="mt-16 animate-pulse">
                <div className="h-8 w-64 bg-neutral-200 rounded mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="h-40 bg-neutral-100 rounded-[32px]"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!data || data.length === 0) return null;

    return (
        <section className="mt-16">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-neutral-900 flex items-center gap-2">
                        <Globe2 className="text-blue-600" />
                        공공데이터 마켓 인사이트
                    </h2>
                    <p className="text-neutral-500 text-sm mt-1">금융위원회에서 제공하는 공식 시장 데이터입니다. (KOSPI 우량주)</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.map((item) => {
                    const fltRt = parseFloat(item.fltRt);
                    const isPositive = fltRt >= 0;

                    return (
                        <div key={item.isinCd} className="bg-white p-6 rounded-[32px] border border-neutral-100 shadow-sm hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-neutral-900">{item.itmsNm}</h3>
                                    <p className="text-xs font-mono text-neutral-500">{item.srtnCd}</p>
                                </div>
                                <div className={`p-2 rounded-xl ${isPositive ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                                    {isPositive ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                                </div>
                            </div>

                            <div className="flex justify-between items-end">
                                <div>
                                    <p className="text-2xl font-black text-neutral-900">₩{parseInt(item.clpr).toLocaleString()}</p>
                                    <p className={`text-sm font-bold ${isPositive ? 'text-red-500' : 'text-blue-500'}`}>
                                        {isPositive ? '+' : ''}{item.vs} ({item.fltRt}%)
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] font-black text-neutral-400 uppercase">시가총액</p>
                                    <p className="text-xs font-bold text-neutral-900">{(parseInt(item.mrktTotAmt) / 1000000000000).toFixed(1)}조</p>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </section>
    );
}
