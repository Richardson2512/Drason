'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 40);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Close mobile menu when route changes
    useEffect(() => { setMobileOpen(false); }, [pathname]);

    const navLinks = [
        { href: '/product', label: 'Product' },
        { href: '/docs', label: 'Documentation' },
        { href: '/pricing', label: 'Pricing' },
        { href: '/blog', label: 'Blog' },
    ];

    const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/');

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
                    <nav className="hidden md:flex gap-7 text-[13px] font-medium">
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
                <div className="fixed inset-0 z-40 bg-[#111827]/95 backdrop-blur-2xl flex flex-col items-center justify-center gap-6 animate-fadeIn">
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
