'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Book, Shield, Activity, GitBranch, TrendingUp, Settings, Zap, ChevronUp, List } from 'lucide-react';

const docSections = [
    {
        title: 'Getting Started',
        items: [
            { title: 'Introduction', href: '/docs', icon: Book },
            { title: 'Getting Started', href: '/docs/getting-started', icon: Zap },
            { title: 'Clay Integration', href: '/docs/clay-integration', icon: Activity },
            { title: 'Smartlead Integration', href: '/docs/smartlead-integration', icon: Activity },
            { title: 'API Integration', href: '/docs/api-integration', icon: Settings },
        ]
    },
    {
        title: 'Core Concepts',
        items: [
            { title: 'Platform Rules', href: '/docs/platform-rules', icon: Shield },
            { title: 'Monitoring System', href: '/docs/monitoring', icon: Activity },
            { title: 'Execution Gate', href: '/docs/execution-gate', icon: GitBranch },
            { title: 'Risk Scoring', href: '/docs/risk-scoring', icon: TrendingUp },
            { title: 'State Machine', href: '/docs/state-machine', icon: GitBranch },
        ]
    },
    {
        title: 'Configuration',
        items: [
            { title: 'Configuration', href: '/docs/configuration', icon: Settings },
        ]
    }
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
        // Find all h2 and h3 elements in the main content
        const findHeadings = () => {
            const mainContent = document.querySelector('main');
            if (!mainContent) return;

            const elements = mainContent.querySelectorAll('h2, h3');
            const items: TocItem[] = [];

            elements.forEach((el, index) => {
                // Generate ID if not present
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

        // Small delay to ensure content is rendered
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
        <aside className="hidden xl:block fixed top-32 right-8 w-52 h-[calc(100vh-10rem)] overflow-y-auto z-30">
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

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

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

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans overflow-hidden">

            {/* ================= FLOATING GLASS NAVBAR (Matching Landing/Pricing) ================= */}
            <header className="absolute top-8 left-0 right-0 flex justify-center z-50">
                <div className="glass-nav px-10 py-4 flex items-center gap-10 shadow-sm bg-white/60 backdrop-blur-md border border-white/20 rounded-full">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                        <span className="font-bold text-xl tracking-tight">Superkabe</span>
                    </Link>
                    <nav className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
                        <Link href="/" className="hover:text-black transition-colors">Product</Link>
                        <Link href="/docs" className="text-black font-semibold transition-colors">Documentation</Link>
                        <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                    </nav>
                    <div className="flex gap-4 items-center">
                        <Link href="/login" className="text-gray-600 hover:text-black text-sm font-medium transition-colors">Sign In</Link>
                        <Link href="/signup" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                            Get Started
                        </Link>
                    </div>
                </div>
                {/* Mobile Menu Button */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-white/60 backdrop-blur-md border border-white/20 lg:hidden text-gray-600"
                >
                    {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </header>

            {/* ================= HERO BLUR BLOBS (Matching Landing/Pricing) ================= */}
            <div className="hero-blur pointer-events-none">
                <div className="blur-blob blur-purple opacity-30"></div>
                <div className="blur-blob blur-blue opacity-30"></div>
            </div>

            {/* ================= MAIN LAYOUT ================= */}
            <div className="relative z-10 pt-40 pb-8">
                <div className="flex">
                    {/* Sidebar - fixed on desktop, stays frozen while scrolling */}
                    <aside className={`
                        hidden lg:block fixed top-32 left-6 w-72 h-[calc(100vh-10rem)] bg-white/70 backdrop-blur-md border border-white/30 rounded-3xl overflow-y-auto
                        shadow-xl shadow-gray-200/50 z-30
                    `}>
                        <div className="p-6">
                            <nav className="space-y-8">
                                {docSections.map((section) => (
                                    <div key={section.title}>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                                            {section.title}
                                        </h3>
                                        <ul className="space-y-0.5">
                                            {section.items.map((item) => (
                                                <NavItem
                                                    key={item.href}
                                                    href={item.href}
                                                    title={item.title}
                                                    icon={item.icon}
                                                    onClick={() => setSidebarOpen(false)}
                                                />
                                            ))}
                                        </ul>
                                    </div>
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
                            <nav className="space-y-8">
                                {docSections.map((section) => (
                                    <div key={section.title}>
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 px-3">
                                            {section.title}
                                        </h3>
                                        <ul className="space-y-0.5">
                                            {section.items.map((item) => (
                                                <NavItem
                                                    key={item.href}
                                                    href={item.href}
                                                    title={item.title}
                                                    icon={item.icon}
                                                    onClick={() => setSidebarOpen(false)}
                                                />
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* Main content - offset for fixed sidebars on desktop */}
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
        <li>
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
                <span>{title}</span>
            </Link>
        </li>
    );
}
