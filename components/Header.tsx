'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Globe, TrendingUp, Users, Wallet, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
    { name: '시장 검색', href: '/stocks', icon: TrendingUp },
    { name: '인사이트', href: '/insights', icon: Globe },
    { name: '토론 섹션', href: '/boards', icon: Users },
    // { name: '자산관리', href: '#', icon: Wallet },
];

export default function Header() {
    const pathname = usePathname();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <nav className={cn(
            "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4",
            isScrolled ? "bg-white/80 backdrop-blur-md border-b border-neutral-200 py-3" : "bg-transparent"
        )}>
            <div className="max-w-7xl mx-auto flex items-center justify-between">
                {/* Logo */}
                <Link href="/" className="text-2xl font-black tracking-tighter text-neutral-900 flex items-center gap-2">
                    CRESSETS
                </Link>

                {/* Desktop Navigation - Centered */}
                <div className="hidden md:flex items-center gap-1 flex-1 justify-center">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={cn(
                                "px-5 py-2.5 rounded-full text-sm font-bold transition-all relative group",
                                pathname === item.href
                                    ? "text-neutral-900"
                                    : "text-neutral-800 hover:text-neutral-900"
                            )}
                        >
                            <span className="relative z-10 flex items-center gap-2">
                                <item.icon size={16} />
                                {item.name}
                            </span>
                            {pathname === item.href && (
                                <div className="absolute inset-0 bg-neutral-100 rounded-full z-0" />
                            )}
                        </Link>
                    ))}
                </div>

                {/* Empty Right Column to balance Logo on desktop */}
                <div className="hidden md:block w-[120px]" />

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 text-neutral-900"
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Navigation */}
            {isMobileMenuOpen && (
                <div className="absolute top-full left-0 right-0 bg-white border-b border-neutral-200 p-6 flex flex-col gap-4 md:hidden shadow-2xl animate-in slide-in-from-top duration-300">
                    {NAV_ITEMS.map((item) => (
                        <Link
                            key={item.name}
                            href={item.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className="flex items-center gap-3 text-lg font-bold text-neutral-600 hover:text-neutral-900 p-2"
                        >
                            <item.icon size={20} />
                            {item.name}
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
