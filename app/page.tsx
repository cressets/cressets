import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-neutral-800 selection:text-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 bg-white/80 backdrop-blur-md">
        <div className="text-2xl font-bold tracking-tighter">Cressets</div>
        <div className="hidden md:flex gap-8 text-sm font-medium text-neutral-600">
          <a href="#" className="hover:text-black transition-colors">Features</a>
          <Link href="/stocks" className="hover:text-black transition-colors">Market Data</Link>
          <a href="#" className="hover:text-black transition-colors">Insights</a>
          <a href="#" className="hover:text-black transition-colors">Contact</a>
        </div>
        <Link href="/stocks" className="bg-neutral-900 text-white px-6 py-2.5 rounded-full text-sm font-medium hover:bg-neutral-800 transition-all">
          Get Started ↗
        </Link>
      </nav>

      <main className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="flex flex-col items-center text-center space-y-8 mb-20">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif tracking-tight text-neutral-900 max-w-5xl leading-[1.1]">
            Discover market insights and manage your assets with clarity and confidence.
          </h1>
          <p className="text-lg md:text-xl text-neutral-500 max-w-2xl leading-relaxed">
            Cressets is a financial platform that provides stock market search, data-driven insights, and personal asset management tools in one place.
          </p>
        </div>

        {/* Dashboard Showcase */}
        <div className="relative w-full rounded-3xl overflow-hidden shadow-2xl border border-neutral-100 bg-neutral-50 mb-20 group">
          <div className="absolute inset-0 bg-gradient-to-t from-neutral-900/10 to-transparent pointer-events-none z-10" />
          <Image
            src="/dashboard.png"
            alt="Cressets Dashboard"
            width={1920}
            height={1080}
            className="w-full h-auto object-cover transform transition-transform duration-700 hover:scale-[1.01]"
            priority
          />
          {/* Floating Stats Badge */}
          <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 z-20 bg-white/10 backdrop-blur-lg border border-white/20 p-6 rounded-2xl text-white">
            <div className="text-3xl font-medium mb-1">+24.5%</div>
            <div className="text-sm text-white/80 uppercase tracking-widest font-medium">Portfolio Growth</div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {/* Feature 1 */}
          <div className="bg-neutral-50 rounded-2xl p-8 hover:bg-neutral-100 transition-colors duration-300">
            <div className="w-16 h-16 mb-6 relative">
              <Image src="/feature-stocks.png" alt="Stock Search" fill className="object-contain" />
            </div>
            <h3 className="text-2xl font-serif mb-3">Stock Market Search</h3>
            <p className="text-neutral-500 leading-relaxed">
              Real-time data and advanced filtering to find the perfect investment opportunities across global markets.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="bg-neutral-50 rounded-2xl p-8 hover:bg-neutral-100 transition-colors duration-300">
            <div className="w-16 h-16 mb-6 relative">
              <Image src="/feature-insights.png" alt="Insights" fill className="object-contain" />
            </div>
            <h3 className="text-2xl font-serif mb-3">Data-Driven Insights</h3>
            <p className="text-neutral-500 leading-relaxed">
              AI-powered analysis and clear visualizations help you understand market trends and make informed decisions.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#EBE8E3] rounded-2xl p-8 hover:bg-[#E5E1DB] transition-colors duration-300">
            <div className="w-16 h-16 mb-6 relative">
              <Image src="/feature-assets.png" alt="Assets" fill className="object-contain" />
            </div>
            <h3 className="text-2xl font-serif mb-3">Asset Management</h3>
            <p className="text-neutral-600 leading-relaxed">
              Securely track your portfolio performance, manage diversification, and watch your wealth grow in one place.
            </p>
            <button className="mt-6 text-sm font-semibold underline underline-offset-4 hover:text-black/70">
              Explore Tools
            </button>
          </div>
        </div>

        {/* Simple Footer Call to Action */}
        <div className="text-center py-20 border-t border-neutral-100">
          <h2 className="text-4xl font-serif mb-8">Ready to start?</h2>
          <div className="flex justify-center gap-4">
            <button className="bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-neutral-800 transition-all">
              Get Started Now
            </button>
            <button className="bg-white text-black border border-neutral-200 px-8 py-4 rounded-full font-medium hover:bg-neutral-50 transition-all">
              Contact Sales
            </button>
          </div>
        </div>

      </main>

      <footer className="py-12 border-t border-neutral-100 flex flex-col items-center gap-8 bg-neutral-50/50">
        <div className="flex flex-col items-center gap-4">
          <h3 className="text-sm font-semibold text-neutral-900 uppercase tracking-wider">Contact</h3>
          <div className="flex gap-6">
            <a href="https://github.com/tail-s" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all duration-300 group border border-neutral-100">
              <span className="sr-only">GitHub</span>
              <svg className="w-5 h-5 text-neutral-600 group-hover:text-black" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/oliverslife" target="_blank" rel="noopener noreferrer" className="bg-white p-3 rounded-full shadow-sm hover:shadow-md hover:scale-110 transition-all duration-300 group border border-neutral-100">
              <span className="sr-only">LinkedIn</span>
              <svg className="w-5 h-5 text-neutral-600 group-hover:text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.239-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
              </svg>
            </a>
          </div>
        </div>
        <div className="text-sm text-neutral-400">
          © {new Date().getFullYear()} Cressets. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
