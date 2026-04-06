'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useCallback, useRef } from 'react';
import { Menu, X, ChevronUp, List, Activity, Shield, Globe, Mail, BookOpen, Users, AlertTriangle, DollarSign, Monitor, CheckCircle, TrendingUp, Search, GitBranch, Target, Scale, HelpCircle, Zap } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


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
    {
        title: 'Deliverability Tools Compared',
        href: '/blog/email-deliverability-tools-compared',
        icon: Activity,
    },
    {
        title: 'How Spam Filters Work',
        href: '/blog/how-spam-filters-work',
        icon: Shield,
    },
    {
        title: 'Infrastructure Protection for Agencies',
        href: '/blog/cold-email-infrastructure-protection-for-agencies',
        icon: Users,
    },
    {
        title: 'Deliverability Troubleshooting',
        href: '/blog/cold-email-deliverability-troubleshooting',
        icon: AlertTriangle,
    },
    {
        title: 'Cost of Unmonitored Infrastructure',
        href: '/blog/cost-of-unmonitored-cold-email-infrastructure',
        icon: DollarSign,
    },
    {
        title: 'Real-Time Monitoring',
        href: '/blog/real-time-email-infrastructure-monitoring',
        icon: Monitor,
    },
    // ── Email Validation Series ──
    {
        title: 'Best Validation Tools 2026',
        href: '/blog/best-email-validation-tools-cold-outreach',
        icon: CheckCircle,
    },
    {
        title: 'Validation vs Verification',
        href: '/blog/email-validation-vs-verification',
        icon: Search,
    },
    {
        title: 'Why Verified Emails Bounce',
        href: '/blog/why-verified-emails-still-bounce',
        icon: AlertTriangle,
    },
    {
        title: 'Reduce Bounce Rate Below 2%',
        href: '/blog/reduce-cold-email-bounce-rate',
        icon: TrendingUp,
    },
    {
        title: 'ZeroBounce Alternatives',
        href: '/blog/zerobounce-alternatives-infrastructure-monitoring',
        icon: GitBranch,
    },
    {
        title: 'Protect Reputation at Scale',
        href: '/blog/protect-sender-reputation-scaling-outreach',
        icon: Shield,
    },
    // ── Pillar Pages ──
    {
        title: 'Validation for Smartlead & Instantly',
        href: '/blog/email-validation-smartlead-instantly',
        icon: Zap,
    },
    {
        title: 'Bounce Rate Thresholds',
        href: '/blog/cold-email-bounce-rate-thresholds',
        icon: AlertTriangle,
    },
    {
        title: 'Validation for Agencies',
        href: '/blog/email-validation-for-agencies',
        icon: Users,
    },
    {
        title: 'Catch-All Domains Risk',
        href: '/blog/catch-all-domains-cold-outreach',
        icon: Target,
    },
    {
        title: 'Domain Burned Recovery',
        href: '/blog/domain-burned-recovery-prevention',
        icon: Activity,
    },
    {
        title: 'Validation Pricing Guide',
        href: '/blog/email-validation-pricing-guide',
        icon: DollarSign,
    },
    // ── Comparisons ──
    {
        title: 'vs Manual Monitoring',
        href: '/blog/superkabe-vs-manual-monitoring',
        icon: Scale,
    },
    {
        title: 'vs Warmup Tools',
        href: '/blog/superkabe-vs-warmup-tools',
        icon: Scale,
    },
    {
        title: 'vs Verification Tools',
        href: '/blog/superkabe-vs-email-verification-tools',
        icon: HelpCircle,
    },
    // ── Warmup Pillar ──
    {
        title: 'Complete Warmup Guide 2026',
        href: '/blog/complete-email-warmup-guide',
        icon: Activity,
    },
    // ── Catch-All Branded ──
    {
        title: 'ZeroBounce Catch-All',
        href: '/blog/zerobounce-catch-all-handling',
        icon: Target,
    },
    {
        title: 'NeverBounce Catch-All',
        href: '/blog/neverbounce-catch-all-detection',
        icon: Target,
    },
    {
        title: 'Catch-All Comparison',
        href: '/blog/catch-all-detection-zerobounce-vs-neverbounce',
        icon: Scale,
    },
    // ── Alternatives ──
    {
        title: 'ZeroBounce Alternatives',
        href: '/blog/zerobounce-alternatives',
        icon: GitBranch,
    },
    {
        title: 'NeverBounce Alternatives',
        href: '/blog/neverbounce-alternatives',
        icon: GitBranch,
    },
    {
        title: 'MillionVerifier Alternatives',
        href: '/blog/millionverifier-alternatives',
        icon: GitBranch,
    },
    {
        title: 'Beyond Verification',
        href: '/blog/email-verification-tool-alternatives',
        icon: Shield,
    },
];

interface TocItem {
    id: string;
    text: string;
    level: number;
}

function TableOfContents({ offsetY }: { offsetY: number }) {
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
        <aside
            className="hidden xl:block fixed top-32 right-8 w-52 overflow-y-auto scrollbar-hide z-30"
            style={{ maxHeight: 'calc(100vh - 9rem)', transform: `translateY(-${offsetY}px)` }}
        >
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
    const [sidebarOffsetY, setSidebarOffsetY] = useState(0);
    const pathname = usePathname();

    // Don't apply layout to the blog index page
    const isBlogIndex = pathname === '/blog';

    const handleScroll = useCallback(() => {
        setShowScrollTop(window.scrollY > 300);

        const footer = document.querySelector('footer');
        if (!footer) return;
        const footerTop = footer.getBoundingClientRect().top;
        const vh = window.innerHeight;

        if (footerTop < vh) {
            // Footer is visible — slide sidebars up by the overlap amount
            setSidebarOffsetY(vh - footerTop);
        } else {
            setSidebarOffsetY(0);
        }
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true });
        handleScroll();
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    // Blog index uses its own standalone layout
    if (isBlogIndex) {
        return <>{children}</>;
    }

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans overflow-x-hidden">

            {/* ================= JSON-LD ================= */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "BreadcrumbList",
                    "itemListElement": [
                        { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://www.superkabe.com" },
                        { "@type": "ListItem", "position": 2, "name": "Blog", "item": "https://www.superkabe.com/blog" }
                    ]
                }) }}
            />

            {/* ================= NAVBAR ================= */}
            <Navbar />

            {/* ================= Fixed Background Layer ================= */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="cloud-bg">
                    <div className="cloud-shadow" />
                    <div className="cloud-puff-1" />
                    <div className="cloud-puff-2" />
                    <div className="cloud-puff-3" />
                </div>
                <div className="absolute inset-0 hero-grid"></div>
            </div>

            {/* ================= MAIN LAYOUT ================= */}
            <div className="relative z-10 pt-32 md:pt-36 pb-8">
                <div className="flex items-start">
                    {/* Sidebar - fixed on desktop, slides up when footer visible */}
                    <aside
                        className="hidden lg:block fixed top-32 left-6 w-72 bg-white/70 backdrop-blur-md border border-white/30 rounded-3xl overflow-y-auto scrollbar-hide shadow-xl shadow-gray-200/50 z-30"
                        style={{ maxHeight: 'calc(100vh - 9rem)', transform: `translateY(-${sidebarOffsetY}px)` }}
                    >
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

                    {/* Main content - offset for fixed sidebars on desktop */}
                    <main className="flex-1 lg:ml-80 xl:mr-64 px-6 lg:px-12">
                        <div className="max-w-4xl py-4 lg:py-6">
                            {children}
                        </div>
                    </main>

                    {/* Table of Contents - right sidebar */}
                    <TableOfContents offsetY={sidebarOffsetY} />
                </div>
            </div>

            {/* ================= FOOTER ================= */}
            <Footer />

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
