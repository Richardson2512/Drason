'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X, Book, Shield, Activity, GitBranch, TrendingUp, Settings, Zap } from 'lucide-react';
import Footer from '@/components/Footer';

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

export default function DocsLayout({ children }: { children: React.ReactNode }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans overflow-hidden">

            {/* ================= FLOATING GLASS NAVBAR (Matching Landing/Pricing) ================= */}
            <header className="absolute top-8 left-0 right-0 flex justify-center z-50">
                <div className="glass-nav px-10 py-4 flex items-center gap-10 shadow-sm bg-white/60 backdrop-blur-md border border-white/20 rounded-full">
                    <Link href="/" className="font-bold text-xl tracking-tight">Drason</Link>
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
            <div className="relative z-10 flex pt-40">
                {/* Sidebar */}
                <aside className={`
                    fixed top-32 left-6 h-[calc(100vh-9rem)] w-72 bg-white/70 backdrop-blur-md border border-white/30 rounded-3xl overflow-y-auto
                    transition-transform duration-300 z-40 shadow-xl shadow-gray-200/50
                    ${sidebarOpen ? 'translate-x-0' : '-translate-x-[120%] lg:translate-x-0'}
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

                {/* Main content */}
                <main className="flex-1 lg:ml-80 min-h-[calc(100vh-10rem)] px-6 lg:pr-12">
                    <div className="max-w-4xl py-12 lg:py-16">
                        {children}
                    </div>
                    <div className="pb-12">
                        <Footer />
                    </div>
                </main>
            </div>

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-30 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
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
