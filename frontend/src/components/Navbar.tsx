'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Search, Pencil, KeyRound, Settings, ShieldCheck, Shield, ArrowRight, LayoutDashboard, LayoutGrid } from 'lucide-react';
import { useIsAuthenticated } from '@/lib/auth-client';
import { appUrl } from '@/lib/urls';

const toolLinks = [
    {
        href: '/tools/spf-lookup',
        label: 'SPF Record Lookup',
        desc: 'Check your domain\'s SPF record',
        icon: <Search size={14} strokeWidth={1.75} />,
    },
    {
        href: '/tools/spf-generator',
        label: 'SPF Record Generator',
        desc: 'Build a valid SPF TXT record',
        icon: <Pencil size={14} strokeWidth={1.75} />,
    },
    {
        href: '/tools/dkim-lookup',
        label: 'DKIM Record Lookup',
        desc: 'Verify your DKIM public key',
        icon: <KeyRound size={14} strokeWidth={1.75} />,
    },
    {
        href: '/tools/dkim-generator',
        label: 'DKIM Record Generator',
        desc: 'Create a signed DKIM record',
        icon: <Settings size={14} strokeWidth={1.75} />,
    },
    {
        href: '/tools/dmarc-lookup',
        label: 'DMARC Record Lookup',
        desc: 'Check your domain DMARC policy',
        icon: <Shield size={14} strokeWidth={1.75} />,
    },
    {
        href: '/tools/dmarc-generator',
        label: 'DMARC Record Generator',
        desc: 'Configure your DMARC policy',
        icon: <ShieldCheck size={14} strokeWidth={1.75} />,
    },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [toolsOpen, setToolsOpen] = useState(false);
    const [mobileToolsOpen, setMobileToolsOpen] = useState(false);
    const toolsRef = useRef<HTMLDivElement>(null);
    const pathname = usePathname();
    // ready=false on first client render so SSR markup matches; flips true on
    // mount once we've read the cookie. We render the signed-out CTAs while
    // ready=false to avoid a flash of authed UI on hydration.
    const { ready, isAuthenticated } = useIsAuthenticated();

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
                    className={`flex items-center gap-6 md:gap-10 transition-all duration-500 rounded-full
                        ${scrolled
                            ? 'px-6 md:px-8 py-2.5 border border-white/15'
                            : 'px-8 md:px-10 py-3.5 border border-white/[0.12]'
                        }`}
                    style={{
                        background: scrolled ? 'rgba(17, 24, 39, 0.65)' : 'rgba(17, 24, 39, 0.55)',
                        backdropFilter: 'blur(24px) saturate(180%)',
                        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                        boxShadow: scrolled
                            ? '0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                            : '0 12px 40px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.08)',
                    }}
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
                                <div
                                    className="absolute top-full left-1/2 -translate-x-1/2 mt-7 w-[720px] max-w-[calc(100vw-48px)]"
                                    style={{
                                        background: '#FFFFFF',
                                        border: '1px solid #D1CBC5',
                                        borderRadius: 14,
                                        boxShadow: '0 20px 48px rgba(17, 24, 39, 0.16), 0 4px 12px rgba(17, 24, 39, 0.05)',
                                        overflow: 'hidden',
                                    }}
                                >
                                    <div className="flex items-stretch p-3 gap-3">
                                        {/* LEFT: tools list - 2 cols × 3 rows */}
                                        <div className="flex-1 grid grid-cols-2 gap-1">
                                            {toolLinks.map((tool) => {
                                                const active = isActive(tool.href);
                                                return (
                                                    <Link
                                                        key={tool.href}
                                                        href={tool.href}
                                                        onClick={() => setToolsOpen(false)}
                                                        className="group flex items-start gap-2.5 px-3 py-2 rounded-md transition-colors"
                                                        style={{
                                                            background: active ? '#F7F2EB' : 'transparent',
                                                            textDecoration: 'none',
                                                        }}
                                                        onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = '#F5F1EA'; }}
                                                        onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                                                            style={{ background: '#FFFFFF', border: '1px solid #E8E3DC', color: '#4B5563' }}
                                                        >
                                                            {tool.icon}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div style={{ fontSize: '0.74rem', fontWeight: 600, color: '#111827', letterSpacing: '-0.005em', lineHeight: 1.3 }}>
                                                                {tool.label}
                                                            </div>
                                                            <div style={{ fontSize: '0.64rem', color: '#6B7280', marginTop: 1, lineHeight: 1.4 }}>
                                                                {tool.desc}
                                                            </div>
                                                        </div>
                                                    </Link>
                                                );
                                            })}
                                        </div>

                                        {/* RIGHT: stacked branded banners */}
                                        <div className="w-[220px] shrink-0 flex flex-col gap-2.5">
                                            {/* Banner 1: Cold Email Templates - branded with Superkabe logo */}
                                            <Link
                                                href="/cold-email-templates"
                                                onClick={() => setToolsOpen(false)}
                                                className="group relative flex flex-col p-4 rounded-xl overflow-hidden"
                                                style={{
                                                    background: 'linear-gradient(135deg, #1C4532 0%, #143325 100%)',
                                                    border: '1px solid #143325',
                                                    textDecoration: 'none',
                                                }}
                                            >
                                                {/* Branded header - Superkabe logo + wordmark */}
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <Image src="/image/logo-v2.png" alt="Superkabe" width={18} height={18} className="shrink-0" />
                                                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#FFFFFF', letterSpacing: '-0.005em' }}>
                                                        Superkabe
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold mb-1" style={{ fontSize: '0.82rem', color: '#FFFFFF', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                                                    Cold Email Templates
                                                </h3>
                                                <p style={{ fontSize: '0.66rem', color: 'rgba(255,255,255,0.74)', lineHeight: 1.5 }}>
                                                    Industry-standard templates, AI-customizable in seconds
                                                </p>
                                                <span
                                                    className="inline-flex items-center gap-1 mt-3 group-hover:gap-1.5 transition-all"
                                                    style={{ fontSize: '0.68rem', fontWeight: 600, color: '#FFFFFF' }}
                                                >
                                                    Browse library
                                                    <ArrowRight size={11} strokeWidth={2} />
                                                </span>
                                            </Link>

                                            {/* Banner 2: All Free Tools */}
                                            <Link
                                                href="/tools"
                                                onClick={() => setToolsOpen(false)}
                                                className="group flex flex-col p-4 rounded-xl transition-colors"
                                                style={{
                                                    background: '#FAF8F4',
                                                    border: '1px solid #E8E3DC',
                                                    textDecoration: 'none',
                                                }}
                                                onMouseEnter={(e) => { e.currentTarget.style.background = '#F2EBE0'; }}
                                                onMouseLeave={(e) => { e.currentTarget.style.background = '#FAF8F4'; }}
                                            >
                                                <div className="flex items-center gap-1.5 mb-3">
                                                    <div className="w-[18px] h-[18px] rounded-md flex items-center justify-center shrink-0" style={{ background: '#1C4532' }}>
                                                        <LayoutGrid size={10} strokeWidth={2.25} style={{ color: '#FFFFFF' }} />
                                                    </div>
                                                    <span style={{ fontSize: '0.66rem', fontWeight: 700, color: '#1C4532', letterSpacing: '-0.005em' }}>
                                                        All Tools
                                                    </span>
                                                </div>
                                                <h3 className="font-semibold mb-1" style={{ fontSize: '0.82rem', color: '#111827', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
                                                    All Free Tools
                                                </h3>
                                                <p style={{ fontSize: '0.66rem', color: '#6B7280', lineHeight: 1.5 }}>
                                                    SPF, DKIM, DMARC lookups and generators
                                                </p>
                                                <span
                                                    className="inline-flex items-center gap-1 mt-3 group-hover:gap-1.5 transition-all"
                                                    style={{ fontSize: '0.68rem', fontWeight: 600, color: '#1C4532' }}
                                                >
                                                    Explore all
                                                    <ArrowRight size={11} strokeWidth={2} />
                                                </span>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </nav>

                    {/* Desktop CTAs - auth-aware. Renders signed-out state on
                        SSR and first render, flips to dashboard CTA after the
                        token cookie is read on mount.
                        appUrl() returns absolute URLs to app.* in subdomain
                        mode (so users hop directly without a 302 from the
                        marketing site's middleware) and relative paths
                        otherwise. Uses <a> instead of next/link because
                        next/link can short-circuit cross-host navigation. */}
                    <div className="hidden md:flex gap-3 items-center ml-2">
                        {ready && isAuthenticated ? (
                            <a
                                href={appUrl('/dashboard')}
                                className="inline-flex items-center gap-1.5 px-5 py-2 bg-white text-gray-900 rounded-full text-[13px] font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-white/10"
                            >
                                <LayoutDashboard size={13} strokeWidth={2} />
                                Dashboard
                            </a>
                        ) : (
                            <>
                                <a href={appUrl('/login')} className="text-gray-400 hover:text-white text-[13px] font-medium transition-colors">
                                    Sign In
                                </a>
                                <a
                                    href={appUrl('/signup')}
                                    className="px-5 py-2 bg-white text-gray-900 rounded-full text-[13px] font-semibold hover:bg-gray-100 transition-all duration-200 shadow-lg shadow-white/10"
                                >
                                    Get Started
                                </a>
                            </>
                        )}
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

            {/* Desktop dropdown backdrop dim - z-40 sits below navbar (z-50) so the pill stays vibrant on top */}
            {toolsOpen && (
                <div
                    aria-hidden
                    onClick={() => setToolsOpen(false)}
                    className="hidden md:block fixed inset-0 z-40 animate-fadeIn"
                    style={{ background: 'rgba(17, 24, 39, 0.32)', backdropFilter: 'blur(2px)' }}
                />
            )}

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
                        {ready && isAuthenticated ? (
                            <a
                                href={appUrl('/dashboard')}
                                className="inline-flex items-center gap-2 px-8 py-3 bg-white text-gray-900 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
                                onClick={() => setMobileOpen(false)}
                            >
                                <LayoutDashboard size={16} strokeWidth={2} />
                                Dashboard
                            </a>
                        ) : (
                            <>
                                <a href={appUrl('/login')} className="text-gray-400 hover:text-white text-lg font-medium transition-colors" onClick={() => setMobileOpen(false)}>
                                    Sign In
                                </a>
                                <a
                                    href={appUrl('/signup')}
                                    className="px-8 py-3 bg-white text-gray-900 rounded-full text-lg font-semibold hover:bg-gray-100 transition-all shadow-lg"
                                    onClick={() => setMobileOpen(false)}
                                >
                                    Get Started
                                </a>
                            </>
                        )}
                    </div>
                </div>
            )}
        </>
    );
}
