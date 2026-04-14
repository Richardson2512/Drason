'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const toolLinks = [
    {
        href: '/tools/spf-lookup',
        label: 'SPF Record Lookup',
        desc: 'Check your domain\'s SPF record',
        category: 'spf',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.35-4.35" /></svg>
        ),
    },
    {
        href: '/tools/spf-generator',
        label: 'SPF Record Generator',
        desc: 'Build a valid SPF TXT record',
        category: 'spf',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
        ),
    },
    {
        href: '/tools/dkim-lookup',
        label: 'DKIM Record Lookup',
        desc: 'Verify your DKIM public key',
        category: 'dkim',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="m21 2-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0 3 3L22 7l-3-3m-3.5 3.5L19 4" /></svg>
        ),
    },
    {
        href: '/tools/dkim-generator',
        label: 'DKIM Record Generator',
        desc: 'Create a signed DKIM record',
        category: 'dkim',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
        ),
    },
    {
        href: '/tools/dmarc-lookup',
        label: 'DMARC Record Lookup',
        desc: 'Check your domain DMARC policy',
        category: 'dmarc',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
        ),
    },
    {
        href: '/tools/dmarc-generator',
        label: 'DMARC Record Generator',
        desc: 'Configure your DMARC policy',
        category: 'dmarc',
        icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><path d="m9 12 2 2 4-4" /></svg>
        ),
    },
];

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
    spf: { bg: 'bg-blue-50', text: 'text-blue-600' },
    dkim: { bg: 'bg-emerald-50', text: 'text-emerald-600' },
    dmarc: { bg: 'bg-purple-50', text: 'text-purple-600' },
};

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
    const toolsRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileOpen(false);
        setToolsOpen(false);
        setMobileToolsOpen(false);
    }, [pathname]);

    // Close tools dropdown on outside click (use 'click' not 'mousedown' to let Link navigate first)
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
                setToolsOpen(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const navLinks = [
        { href: '/product', label: 'Product' },
        { href: '/docs', label: 'Documentation' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/blog', label: 'Blog' },
    ];

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');
    const isToolsActive = pathname.startsWith('/tools');

    return (
        <>
            <header
                className={`fixed top-0 left-0 right-0 flex justify-center z-50 transition-all duration-500 ${scrolled ? 'py-3' : 'py-6 md:py-8'
                    }`}
            >
                <div
                    className={`flex items-center gap-6 md:gap-10 shadow-2xl transition-all duration-500 rounded-full
                        ${scrolled
                            ? 'px-6 md:px-8 py-2.5 bg-[#111827]/90 backdrop-blur-2xl border border-white/10 shadow-black/30'
                            : 'px-8 md:px-10 py-3.5 bg-[#111827]/75 backdrop-blur-xl border border-white/[0.08] shadow-black/20'
                        }`}
                >
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2.5 shrink-0">
                        <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={30} height={30} />
                        <span className="font-bold text-lg md:text-xl tracking-tight text-white">Superkabe</span>
                    </Link>

                    {/* Desktop Nav */}
                    <nav className="hidden md:flex gap-7 text-[13px] font-medium items-center">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`transition-colors duration-200 ${isActive(link.href)
                                    ? 'text-white font-semibold'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                {link.label}
                            </Link>
                        ))}

                        {/* Free Tools Dropdown */}
                        <div ref={toolsRef} className="relative">
                            <button
                                onClick={() => setToolsOpen(!toolsOpen)}
                                className={`flex items-center gap-1 transition-colors duration-200 ${isToolsActive
                                    ? 'text-white font-semibold'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Free Tools
                                <svg
                                    className={`w-3 h-3 transition-transform duration-200 ${toolsOpen ? 'rotate-180' : ''}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth={2.5}
                                >
                                    <path d="m6 9 6 6 6-6" />
                                </svg>
                            </button>

                            {toolsOpen && (
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-[820px] max-w-[calc(100vw-48px)] bg-white border border-gray-200 rounded-3xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] overflow-hidden">
                                    <div className="flex items-stretch">
                                        {/* Left spotlight card — popl style featured link */}
                                        <Link
                                            href="/tools"
                                            onClick={() => setToolsOpen(false)}
                                            className="group relative flex flex-col items-center justify-center w-[220px] shrink-0 px-6 py-10 text-center border-r border-gray-100 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                                    <rect x="3" y="3" width="7" height="7" rx="1" />
                                                    <rect x="14" y="3" width="7" height="7" rx="1" />
                                                    <rect x="3" y="14" width="7" height="7" rx="1" />
                                                    <rect x="14" y="14" width="7" height="7" rx="1" />
                                                </svg>
                                            </div>
                                            <h3 className="text-[15px] font-bold text-gray-900 mb-1.5">All Free Tools</h3>
                                            <p className="text-[11px] text-gray-500 leading-relaxed mb-4">Authentication lookups + record generators</p>
                                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-900 group-hover:gap-2 transition-all">
                                                Explore all
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>
                                            </span>
                                        </Link>

                                        {/* Right tools grid — 2 columns × 3 rows */}
                                        <div className="flex-1 grid grid-cols-2 gap-0">
                                            {toolLinks.map((tool, i) => {
                                                const cc = CATEGORY_COLORS[tool.category];
                                                const isRightCol = i % 2 === 1;
                                                const isBottomRow = i >= toolLinks.length - 2;
                                                return (
                                                    <Link
                                                        key={tool.href}
                                                        href={tool.href}
                                                        onClick={() => setToolsOpen(false)}
                                                        className={`group relative flex items-start gap-3 px-5 py-4 transition-all duration-300 ${!isRightCol ? 'border-r border-gray-100' : ''} ${!isBottomRow ? 'border-b border-gray-100' : ''} ${isActive(tool.href) ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                                    >
                                                        <div className={`w-9 h-9 rounded-xl ${cc.bg} flex items-center justify-center shrink-0 ${cc.text} group-hover:scale-110 transition-transform`}>
                                                            {tool.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-[13px] font-semibold text-gray-900 group-hover:translate-x-[2px] transition-transform">{tool.label}</div>
                                                            <div className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{tool.desc}</div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Desktop CTAs */}
                    <div className="hidden md:flex gap-3 items-center ml-2">
                        <Link href="/login" className="text-gray-400 hover:text-white text-[13px] font-medium transition-colors">
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="px-5 py-2 bg-white text-gray-900 rounded-full text-[13px] font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-white/10"
                        >
                            Get Started
                        </Link>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setMobileOpen(!mobileOpen)}
                        className="md:hidden flex flex-col gap-1.5 p-1.5"
                        aria-label="Toggle menu"
                    >
                        <span className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-[5px]' : ''}`} />
                        <span className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
                        <span className={`w-5 h-[2px] bg-white rounded-full transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-[5px]' : ''}`} />
                    </button>
                </div>
            </header>

            {/* Mobile Menu Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-[#111827]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 animate-fadeIn overflow-y-auto py-24">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`text-2xl font-semibold transition-colors ${isActive(link.href) ? 'text-white' : 'text-gray-400 hover:text-white'
                                }`}
                            onClick={() => setMobileOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}

                    {/* Mobile Free Tools Accordion */}
                    <div className="flex flex-col items-center">
                        <button
                            onClick={() => setMobileToolsOpen(!mobileToolsOpen)}
                            className={`flex items-center gap-2 text-2xl font-semibold transition-colors ${isToolsActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
                        >
                            Free Tools
                            <svg
                                className={`w-5 h-5 transition-transform duration-200 ${mobileToolsOpen ? 'rotate-180' : ''}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth={2.5}
                            >
                                <path d="m6 9 6 6 6-6" />
                            </svg>
                        </button>
                        {mobileToolsOpen && (
                            <div className="flex flex-col items-center gap-3 mt-4">
                                <Link
                                    href="/tools"
                                    className="text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    View All Tools
                                </Link>
                                {toolLinks.map((tool) => (
                                    <Link
                                        key={tool.href}
                                        href={tool.href}
                                        className={`text-sm transition-colors ${isActive(tool.href) ? 'text-white font-semibold' : 'text-gray-500 hover:text-white'}`}
                                        onClick={() => setMobileOpen(false)}
                                    >
                                        {tool.label}
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="flex flex-col gap-4 mt-6 items-center">
                        <Link href="/login" className="text-gray-400 hover:text-white text-lg font-medium transition-colors" onClick={() => setMobileOpen(false)}>
                            Sign In
                        </Link>
                        <Link
                            href="/signup"
                            className="px-8 py-3 bg-white text-gray-900 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
                            onClick={() => setMobileOpen(false)}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </>
    );
}
