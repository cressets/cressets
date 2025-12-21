import Image from "next/image";
import Link from "next/link";
import { TrendingUp, MessageSquare, Search, ArrowRight, ShieldCheck, Zap, Users } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-neutral-800 selection:text-white overflow-x-hidden">

      <main className="pt-32 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="relative flex flex-col items-center text-center space-y-10 mb-32">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-neutral-100 rounded-full blur-[120px] -z-10 opacity-60" />

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-50 border border-neutral-100 text-xs font-black tracking-widest text-neutral-500 uppercase animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Zap size={14} className="text-neutral-900 fill-neutral-900" />
            Financial Beacon
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-neutral-900 max-w-5xl leading-[0.95] animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100">
            Illuminate Your <br />
            <span className="text-neutral-400">Financial Future.</span>
          </h1>

          <p className="text-xl md:text-2xl text-neutral-800 max-w-2xl leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
            Cressets은 데이터 기반의 통찰력으로 복잡한 시장을 밝히는 등불입니다. 실시간 검색, 집단 지성, 그리고 AI 분석을 한 곳에서 경험하세요.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
            <Link
              href="/stocks"
              className="bg-neutral-900 text-white px-10 py-5 rounded-full font-black text-lg hover:bg-neutral-800 transition-all shadow-2xl hover:scale-105 active:scale-95 flex items-center gap-2"
            >
              시장 탐색하기 <Search size={20} />
            </Link>
            <Link
              href="/boards"
              className="bg-white text-neutral-900 border border-neutral-200 px-10 py-5 rounded-full font-black text-lg hover:bg-neutral-50 transition-all flex items-center gap-2"
            >
              토론 참여하기 <MessageSquare size={20} />
            </Link>
          </div>
        </div>

        {/* Brand Core - Lantern Concept */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-32 items-center">
          <div className="relative group">
            <div className="absolute inset-0 bg-neutral-900 rounded-[60px] blur-3xl opacity-0 group-hover:opacity-10 transition-opacity duration-700" />
            <div className="relative rounded-[50px] overflow-hidden border border-neutral-100 shadow-2xl bg-neutral-50 aspect-video flex items-center justify-center p-12">
              <Image
                src="/dashboard.png"
                alt="Cressets Dashboard"
                width={800}
                height={500}
                className="rounded-3xl shadow-2xl transform group-hover:scale-[1.02] transition-transform duration-700"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-8 rounded-3xl shadow-2xl border border-neutral-100 max-w-[240px]">
              <div className="flex items-center gap-2 text-emerald-500 font-black mb-2">
                <TrendingUp size={18} /> +32.8%
              </div>
              <p className="text-xs text-neutral-500 leading-tight">AI가 분석한 Cressets Growth Index 2025 전망</p>
            </div>
          </div>

          <div className="space-y-8 pl-0 lg:pl-12">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
              투명함이 만드는 <br />확신(Confidence).
            </h2>
            <p className="text-lg text-neutral-900 leading-relaxed">
              우리는 숫자가 아닌 맥락을 제공합니다. 전 세계의 공개 시장 데이터를 스크래핑하고 가공하여 투자자가 가려워하는 지점을 정확히 짚어냅니다.
            </p>
            <div className="space-y-4 pt-4">
              {[
                { icon: ShieldCheck, text: "검증된 실시간 데이터 스크래핑 엔진" },
                { icon: Users, text: "종목별 특화된 강력한 토론 커뮤니티" },
                { icon: Zap, text: "AI 기반의 명확한 투자 전망 제시" }
              ].map((item, id) => (
                <div key={id} className="flex items-center gap-3 font-bold text-neutral-700">
                  <div className="p-2 bg-neutral-50 rounded-lg"><item.icon size={20} /></div>
                  {item.text}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feature Cards Modern */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-32">
          {[
            {
              title: "Global Search",
              desc: "미국, 한국, 일본 시장을 넘나드는 심리스한 종목 검색 환경.",
              color: "bg-white",
              href: "/stocks"
            },
            {
              title: "Insight Hub",
              desc: "흩어진 투자 의견을 하나로 모아 보여주는 강력한 토론 허브.",
              color: "bg-neutral-50",
              href: "/boards"
            },
            {
              title: "Trust Architecture",
              desc: "투명한 데이터 공개로 구축하는 견고한 자산 관리 시스템.",
              color: "bg-[#EBE8E3]",
              href: "/stocks"
            }
          ].map((feature, id) => (
            <Link
              key={id}
              href={feature.href}
              className={`${feature.color} p-10 rounded-[40px] border border-neutral-100 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group`}
            >
              <h3 className="text-2xl font-black mb-4 flex items-center justify-between">
                {feature.title}
                <ArrowRight className="opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0 transition-all" size={20} />
              </h3>
              <p className="text-neutral-900 leading-relaxed font-medium">
                {feature.desc}
              </p>
            </Link>
          ))}
        </div>

        {/* CTA Bottom */}
        <div className="relative py-24 px-8 rounded-[60px] bg-neutral-900 text-white text-center overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent pointer-events-none" />
          <h2 className="text-4xl md:text-6xl font-black mb-8 relative z-10">어둠 속에서 빛나는 <br />당신의 통찰력을 Cressets에서.</h2>
          <div className="flex justify-center gap-6 relative z-10">
            <Link href="/stocks" className="bg-white text-black px-10 py-4 rounded-full font-black text-lg hover:scale-105 transition-transform active:scale-95">
              지금 무료로 시작하기
            </Link>
          </div>
        </div>

      </main>

      <footer className="py-16 border-t border-neutral-100 bg-neutral-50/50">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-2xl font-black tracking-tighter">CRESSETS</div>
          <div className="flex gap-8 text-sm font-bold text-neutral-500">
            <Link href="/stocks" className="hover:text-black">Markets</Link>
            <Link href="/boards" className="hover:text-black">Boards</Link>
            <a href="#" className="hover:text-black">Privacy</a>
            <a href="#" className="hover:text-black">Terms</a>
          </div>
          <div className="text-sm text-neutral-400 font-medium">
            © {new Date().getFullYear()} Cressets. Designed for clarity.
          </div>
        </div>
      </footer>
    </div>
  );
}
