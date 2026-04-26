'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Book, Shield, Activity, GitBranch, TrendingUp, Settings, Zap, ChevronUp, List, HelpCircle, AlertTriangle, Database, Code, Cpu } from 'lucide-react';
import Navbar from '@/components/Navbar';
import TldrBlock from '@/components/seo/TldrBlock';
import FaqSection, { FaqJsonLd } from '@/components/seo/FaqSection';
import { docsPageSeo } from '@/data/docsPageSeo';


const docSections = [
 {
 title: 'Getting Started',
 items: [
 { title: 'Introduction', href: '/docs', icon: Book },
 { title: 'Getting Started', href: '/docs/getting-started', icon: Zap },
 { title: 'Clay Integration', href: '/docs/clay-integration', icon: Activity },
 { title: 'Slack Integration', href: '/docs/slack-integration', icon: Settings },
 { title: 'API & Webhooks', href: '/docs/api-integration', icon: Settings },
 ]
 },
 {
 title: 'Developers',
 items: [
 { title: 'API Documentation (v1)', href: '/docs/api-documentation', icon: Code },
 { title: 'MCP Server', href: '/docs/mcp-server', icon: Cpu },
 ]
 },
 {
 title: 'Core Concepts',
 items: [
 { title: 'Platform Rules', href: '/docs/platform-rules', icon: Shield },
 { title: 'Monitoring System', href: '/docs/monitoring', icon: Activity },
 { title: 'Execution Gate', href: '/docs/execution-gate', icon: GitBranch },
 { title: 'Risk Scoring', href: '/docs/risk-scoring', icon: TrendingUp },
 { title: 'Technical Architecture', href: '/docs/technical-architecture', icon: GitBranch },
 { title: 'State Machine', href: '/docs/state-machine', icon: GitBranch },
 ]
 },
 {
 title: 'Configuration',
 items: [
 { title: 'Configuration', href: '/docs/configuration', icon: Settings },
 { title: 'Deployment', href: '/docs/deployment', icon: Settings },
 { title: 'Infrastructure Assessment', href: '/docs/infrastructure-assessment', icon: TrendingUp },
 { title: 'Warmup Recovery', href: '/docs/warmup-recovery', icon: Activity },
 ]
 },
 {
 title: 'Help Center',
 items: [
 { title: 'Email Validation', href: '/docs/help/email-validation', icon: HelpCircle },
 { title: 'CSV Lead Upload', href: '/docs/help/csv-upload', icon: HelpCircle },
 { title: 'ESP-Aware Routing', href: '/docs/help/esp-routing', icon: HelpCircle },
 { title: 'Validation Credits', href: '/docs/help/validation-credits', icon: HelpCircle },
 { title: 'Auto-Healing Pipeline', href: '/docs/help/auto-healing', icon: HelpCircle },
 { title: 'Quarantine Explained', href: '/docs/help/quarantine', icon: HelpCircle },
 { title: 'Mailbox Rotation', href: '/docs/help/mailbox-rotation', icon: HelpCircle },
 { title: 'Status Labels', href: '/docs/help/entity-statuses', icon: HelpCircle },
 { title: 'Status Colors', href: '/docs/help/status-colors', icon: HelpCircle },
 { title: 'DNS Setup Guide', href: '/docs/help/dns-setup', icon: HelpCircle },
 { title: 'Bounce Classification', href: '/docs/help/bounce-classification', icon: HelpCircle },
 { title: 'Load Balancing', href: '/docs/help/load-balancing', icon: HelpCircle },
 { title: 'Optimization Suggestions', href: '/docs/help/optimization-suggestions', icon: HelpCircle },
 { title: 'Campaign Paused', href: '/docs/help/campaign-paused', icon: AlertTriangle },
 { title: 'Connection Errors', href: '/docs/help/connection-errors', icon: AlertTriangle },
 { title: 'Infrastructure Score', href: '/docs/help/infrastructure-score-explained', icon: HelpCircle },
 { title: '24/7 Monitoring', href: '/docs/help/24-7-monitoring', icon: HelpCircle },
 { title: 'Notifications', href: '/docs/help/notifications', icon: HelpCircle },
 { title: 'Audit Logs', href: '/docs/help/audit-logs', icon: HelpCircle },
 { title: 'Analytics', href: '/docs/help/analytics', icon: Activity },
 { title: 'Billing', href: '/docs/help/billing', icon: HelpCircle },
 { title: 'Account Management', href: '/docs/help/account-management', icon: HelpCircle },
 ]
 }
];

const docMeta: Record<string, { title: string; description: string }> = {};
docSections.forEach(section => {
 section.items.forEach(item => {
 docMeta[item.href] = {
 title: item.title,
 description: `${item.title} — documentation for Superkabe, the AI cold email platform with native deliverability protection.`,
 };
 });
});

function DocJsonLd() {
 const pathname = usePathname();
 const page = docMeta[pathname];
 if (!page) return null;

 // Find which section this page belongs to
 const section = docSections.find(s => s.items.some(i => i.href === pathname));
 const sectionTitle = section?.title || 'Documentation';

 const isHelpPage = pathname.startsWith('/docs/help');

 const jsonLd = {
 '@context': 'https://schema.org',
 '@type': 'TechArticle',
 headline: page.title,
 description: page.description,
 url: `https://www.superkabe.com${pathname}`,
 datePublished: '2025-11-01',
 dateModified: '2026-04-24',
 author: {
 '@id': 'https://www.superkabe.com/#organization',
 },
 publisher: {
 '@id': 'https://www.superkabe.com/#organization',
 },
 about: {
 '@id': 'https://www.superkabe.com/#software',
 },
 isPartOf: {
 '@type': 'WebSite',
 name: 'Superkabe Documentation',
 url: 'https://www.superkabe.com/docs',
 },
 articleSection: isHelpPage ? 'Help Center' : sectionTitle,
 };

 const breadcrumb = {
 '@context': 'https://schema.org',
 '@type': 'BreadcrumbList',
 itemListElement: [
 {
 '@type': 'ListItem',
 position: 1,
 name: 'Docs',
 item: 'https://www.superkabe.com/docs',
 },
 {
 '@type': 'ListItem',
 position: 2,
 name: sectionTitle,
 },
 {
 '@type': 'ListItem',
 position: 3,
 name: page.title,
 item: `https://www.superkabe.com${pathname}`,
 },
 ],
 };

 return (
 <>
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
 />
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
 />
 </>
 );
}

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
 <aside className="hidden xl:block fixed top-32 right-8 w-52 h-[calc(100vh-10rem)] overflow-y-auto scrollbar-hide z-30">
 <div className="bg-white border border-[#D1CBC5] p-4">
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
 const pathname = usePathname();
 const pageSeo = docsPageSeo[pathname];

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
 <div className="docs-body relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans overflow-hidden">

 {/* ================= JSON-LD (TechArticle + BreadcrumbList per page) ================= */}
 <DocJsonLd />

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
 <div className="flex">
 {/* Sidebar - fixed on desktop, stays frozen while scrolling */}
 <aside className={`
 hidden lg:block fixed top-32 left-6 w-72 h-[calc(100vh-10rem)] bg-white border border-[#D1CBC5] overflow-y-auto scrollbar-hide z-30
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
 fixed top-32 left-6 h-[calc(100vh-10rem)] w-72 bg-white border border-[#D1CBC5] overflow-y-auto scrollbar-hide
 transition-transform duration-300 z-40 lg:hidden
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
 {pageSeo?.tldr && <TldrBlock text={pageSeo.tldr} />}
 {children}
 {pageSeo?.faq && pageSeo.faq.length > 0 && (
 <>
 <FaqJsonLd items={pageSeo.faq} />
 <FaqSection items={pageSeo.faq} />
 </>
 )}
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
 flex items-center gap-3 px-3 py-2 transition-all duration-200
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
