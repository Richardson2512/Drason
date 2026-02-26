'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, ChevronUp, List, Activity, Shield, Globe, Mail, BookOpen } from 'lucide-react';
import Navbar from '@/components/Navbar';
import CloudBackground from '@/components/CloudBackground';

const blogArticles = [
    {
        title: 'New: Infrastructure Assessment',
        href: '/blog/introducing-infrastructure-assessment',
        icon: Activity,
    },
    {
        title: 'Complete Deliverability Guide',
        href: '/blog/email-deliverability-guide',
        icon: BookOpen,
    },
    {
        title: 'Bounce Rate & Deliverability',
        href: '/blog/bounce-rate-deliverability',
        icon: Activity,
    },
    {
        title: 'SPF, DKIM, and DMARC',
        href: '/blog/spf-dkim-dmarc-explained',
        icon: Shield,
    },
    {
        title: 'Domain Warming Methodology',
        href: '/blog/domain-warming-methodology',
        icon: Globe,
    },
    {
        title: 'Email Reputation Lifecycle',
        href: '/blog/email-reputation-lifecycle',
        icon: Mail,
    },
];

interface TocItem {
    id: string;
    text: string;
    level: number;
}

function TableOfContents() {
    const [headings, setHeadings] = useState<TocItem[]>([]);
    const [activeId, setActiveId] = useState<string>('');
    const pathname = usePathname();

    useEffect(() => {
        const findHeadings = () => {
            const mainContent = document.querySelector('main');
            if (!mainContent) return;

            const elements = mainContent.querySelectorAll('h2, h3');
            const items: TocItem[] = [];

            elements.forEach((el, index) => {
                if (!el.id) {
                    el.id = `heading-${index}-${el.textContent?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || index}`;
                }
                items.push({
                    id: el.id,
                    text: el.textContent || '',
                    level: el.tagName === 'H2' ? 2 : 3
                });
            });

            setHeadings(items);
        };

        const timer = setTimeout(findHeadings, 100);
        return () => clearTimeout(timer);
    }, [pathname]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            { rootMargin: '-80px 0px -80% 0px' }
        );

        headings.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [headings]);

    const scrollToHeading = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - offset;
            window.scrollTo({ top: offsetPosition, behavior: 'smooth' });
        }
    };

    if (headings.length === 0) return null;

    return (
        <aside className="hidden xl:block fixed top-32 right-8 w-52 h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide z-30">
            <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl p-4 shadow-lg shadow-gray-200/30">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                    <List size={14} className="text-gray-400" />
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">On this page</span>
                </div>
                <nav className="space-y-1">
                    {headings.map((heading) => (
                        <button
                            key={heading.id}
                            onClick={() => scrollToHeading(heading.id)}
                            className={`
                                block w-full text-left text-xs py-1.5 transition-colors duration-200 truncate
                                ${heading.level === 3 ? 'pl-3' : 'pl-0'}
                                ${activeId === heading.id
                                    ? 'text-blue-600 font-semibold'
                                    : 'text-gray-500 hover:text-gray-800'
                                }
                            `}
                        >
                            {heading.text}
                        </button>
                    ))}
                </nav>
            </div>
        </aside>
    );
}

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const pathname = usePathname();

    // Don't apply layout to the blog index page
    const isBlogIndex = pathname === '/blog';

    useEffect(() => {
        const handleScroll = () => {
            setShowScrollTop(window.scrollY > 300);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Blog index uses its own standalone layout
    if (isBlogIndex) {
        return <>{children}</>;
    }

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans overflow-hidden">

            {/* ================= NAVBAR ================= */}
            <Navbar />

            {/* ================= Unified Fixed Background Layer ================= */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <CloudBackground />
                <div className="absolute inset-0 hero-grid"></div>
            </div>

            {/* ================= MAIN LAYOUT ================= */}
            <div className="relative z-10 pt-32 md:pt-36 pb-8">
                <div className="flex">
                    {/* Sidebar - fixed on desktop */}
                    <aside className={`
                        hidden lg:block fixed top-32 left-6 w-72 h-[calc(100vh-10rem)] bg-white/70 backdrop-blur-md border border-white/30 rounded-3xl overflow-y-auto
                        shadow-xl shadow-gray-200/50 z-30
                    `}>
                        <div className="p-6">
                            <div className="mb-6 pb-4 border-b border-gray-100">
                                <Link href="/blog" className="text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors">
                                    ← All Articles
                                </Link>
                            </div>
                            <nav className="space-y-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                                    Articles
                                </h3>
                                {blogArticles.map((article) => (
                                    <NavItem
                                        key={article.href}
                                        href={article.href}
                                        title={article.title}
                                        icon={article.icon}
                                        onClick={() => setSidebarOpen(false)}
                                    />
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Mobile Sidebar - fixed overlay */}
                    <aside className={`
                        fixed top-32 left-6 h-[calc(100vh-10rem)] w-72 bg-white/70 backdrop-blur-md border border-white/30 rounded-3xl overflow-y-auto
                        transition-transform duration-300 z-40 shadow-xl shadow-gray-200/50 lg:hidden
                        ${sidebarOpen ? 'translate-x-0' : '-translate-x-[120%]'}
                    `}>
                        <div className="p-6">
                            <div className="mb-6 pb-4 border-b border-gray-100">
                                <Link href="/blog" className="text-xs font-bold text-gray-400 uppercase tracking-wider hover:text-gray-600 transition-colors">
                                    ← All Articles
                                </Link>
                            </div>
                            <nav className="space-y-1">
                                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                                    Articles
                                </h3>
                                {blogArticles.map((article) => (
                                    <NavItem
                                        key={article.href}
                                        href={article.href}
                                        title={article.title}
                                        icon={article.icon}
                                        onClick={() => setSidebarOpen(false)}
                                    />
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main content - offset for fixed sidebars */}
                    <main className="flex-1 lg:ml-80 xl:mr-64 px-6 lg:px-12">
                        <div className="max-w-4xl py-4 lg:py-6">
                            {children}
                        </div>
                    </main>

                    {/* Table of Contents - right sidebar */}
                    <TableOfContents />
                </div>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Go to Top Button */}
            {showScrollTop && (
                <button
                    onClick={scrollToTop}
                    className="fixed bottom-8 right-8 z-50 w-12 h-12 bg-white rounded-full shadow-xl shadow-gray-200/50 border border-gray-100 flex items-center justify-center text-gray-600 hover:text-blue-600 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    aria-label="Scroll to top"
                >
                    <ChevronUp size={24} />
                </button>
            )}
        </div>
    );
}

function NavItem({ href, title, icon: Icon, onClick }: { href: string; title: string; icon: any; onClick: () => void }) {
    const pathname = usePathname();
    const isActive = pathname === href;

    return (
        <Link
            href={href}
            onClick={onClick}
            className={`
                flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200
                ${isActive
                    ? 'bg-blue-50 text-blue-700 font-semibold shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
            `}
        >
            <Icon size={18} className={isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'} />
            <span className="text-sm">{title}</span>
        </Link>
    );
}
