'use client';

import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { ChevronUp } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { HowToJsonLd, ItemListJsonLd } from '@/components/seo/ExtraSchema';
import { blogPageSeo } from '@/data/blogPageSeo';
import MaileveryToc from '@/components/blog/MaileveryToc';

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    const [showScrollTop, setShowScrollTop] = useState(false);
    const pathname = usePathname();

    // Blog index uses its own standalone layout. Every other blog route
    // uses the Mailivery-style centered layout (sticky left TOC + main column).
    const isBlogIndex = pathname === '/blog';

    const handleScroll = useCallback(() => {
        setShowScrollTop(window.scrollY > 300);
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Blog index uses its own standalone layout (renders children directly)
    if (isBlogIndex) {
        return <>{children}</>;
    }

    // Mailivery-style posts: cream brand background, sticky left TOC + centered main column
    return (
        <div className="bg-[#F7F2EB] text-gray-900 min-h-screen font-sans">
            <Navbar />

            {/*
              Per-post BreadcrumbList (3 levels: Home > Blog > <post title>) is
              emitted by each blog post page so the post title appears in the
              SERP breadcrumb display. The previously-emitted 2-level layout
              breadcrumb was removed to avoid duplicate / less-specific markup
              taking precedence over the per-post version.
            */}

            <div className="max-w-7xl mx-auto px-6 md:px-10 pt-32 md:pt-40 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-10 lg:gap-16">
                    {/* Sticky left TOC — hidden on mobile */}
                    <aside className="hidden lg:block">
                        <MaileveryToc />
                    </aside>

                    {/* Main article column */}
                    <main className="min-w-0 max-w-3xl">
                        {blogPageSeo[pathname]?.howTo && <HowToJsonLd data={blogPageSeo[pathname]!.howTo!} />}
                        {blogPageSeo[pathname]?.itemList && <ItemListJsonLd data={blogPageSeo[pathname]!.itemList!} />}
                        {children}
                    </main>
                </div>
            </div>

            <Footer />

            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-white rounded-full shadow-xl shadow-gray-300/50 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all duration-300"
                    aria-label="Scroll to top"
                >
                    <ChevronUp size={24} />
                </button>
            )}
        </div>
    );
}
