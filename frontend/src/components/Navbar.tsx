'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const toolLinks = [
    { href: '/tools/spf-lookup', label: 'SPF Record Lookup' },
    { href: '/tools/spf-generator', label: 'SPF Record Generator' },
    { href: '/tools/dkim-lookup', label: 'DKIM Record Lookup' },
    { href: '/tools/dkim-generator', label: 'DKIM Record Generator' },
    { href: '/tools/dmarc-lookup', label: 'DMARC Record Lookup' },
    { href: '/tools/dmarc-generator', label: 'DMARC Record Generator' },
];

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
                                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-64 bg-[#111827] border border-white/10 rounded-2xl shadow-2xl shadow-black/40">
                                    <div className="p-2">
                                        <Link
                                            href="/tools"
                                            onClick={() => setToolsOpen(false)}
                                            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-blue-400 hover:bg-white/5 transition-colors"
                                        >
                                            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" />
                                            View All Tools
                                        </Link>
                                        <div className="h-px bg-white/5 my-1" />
                                        {toolLinks.map((tool) => (
                                            <Link
                                                key={tool.href}
                                                href={tool.href}
                                                onClick={() => setToolsOpen(false)}
                                                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs transition-colors ${isActive(tool.href)
                                                    ? 'text-white bg-white/10 font-semibold'
                                                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                                                    }`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${tool.href.includes('spf') ? 'bg-blue-500' :
                                                    tool.href.includes('dkim') ? 'bg-emerald-500' : 'bg-purple-500'
                                                    }`} />
                                                {tool.label}
                                            </Link>
                                        ))}
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
