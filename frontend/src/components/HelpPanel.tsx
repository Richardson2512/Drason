'use client';

import { useState, useEffect } from 'react';
import { X, Search, BookOpen, ChevronRight, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface HelpArticle {
    title: string;
    href: string;
    description: string;
    tags: string[];
}

const helpArticles: HelpArticle[] = [
    {
        title: 'Understanding Infrastructure Score',
        href: '/docs/help/infrastructure-score-explained',
        description: 'Learn the difference between infrastructure score and entity status',
        tags: ['infrastructure', 'score', 'dns', 'assessment']
    },
    {
        title: 'Why Is My Campaign Paused?',
        href: '/docs/help/campaign-paused',
        description: 'Understand the reasons campaigns get automatically paused',
        tags: ['campaign', 'paused', 'status', 'monitoring']
    },
    {
        title: 'How Auto-Healing Works',
        href: '/docs/help/auto-healing',
        description: 'Complete guide to the 5-phase healing pipeline',
        tags: ['healing', 'recovery', 'phases', 'automation']
    },
    {
        title: 'Status Colors Explained',
        href: '/docs/help/status-colors',
        description: 'What each color badge means (healthy, warning, paused)',
        tags: ['status', 'colors', 'badges', 'health']
    },
    {
        title: 'Lead Scoring System',
        href: '/docs/help/lead-scoring',
        description: 'How engagement scores are calculated',
        tags: ['leads', 'scoring', 'engagement']
    },
    {
        title: 'DNS Configuration Guide',
        href: '/docs/help/dns-setup',
        description: 'Setting up SPF, DKIM, and DMARC records',
        tags: ['dns', 'spf', 'dkim', 'dmarc', 'configuration']
    },
    {
        title: 'Execution Gate Explained',
        href: '/docs/execution-gate',
        description: 'How the pre-send validation gate works',
        tags: ['execution', 'gate', 'validation', 'sending']
    },
    {
        title: 'Monitoring Thresholds',
        href: '/docs/monitoring',
        description: 'Bounce rate thresholds and monitoring windows',
        tags: ['monitoring', 'thresholds', 'bounces']
    },
    {
        title: 'Smartlead Integration',
        href: '/docs/smartlead-integration',
        description: 'Connecting and syncing with Smartlead',
        tags: ['smartlead', 'integration', 'sync']
    },
    {
        title: 'Notifications Guide',
        href: '/docs/help/notifications',
        description: 'Understanding notification types and severity levels',
        tags: ['notifications', 'alerts', 'severity']
    }
];

// Context-aware help based on current page
const contextualHelp: Record<string, string[]> = {
    '/dashboard/infrastructure': ['infrastructure-score-explained', 'dns-setup', 'auto-healing'],
    '/dashboard/campaigns': ['campaign-paused', 'status-colors', 'auto-healing'],
    '/dashboard/leads': ['lead-scoring', 'status-colors'],
    '/dashboard/domains': ['dns-setup', 'status-colors', 'monitoring'],
    '/dashboard/mailboxes': ['status-colors', 'monitoring', 'auto-healing'],
    '/dashboard/notifications': ['notifications', 'status-colors'],
    '/dashboard/settings': ['smartlead-integration', 'dns-setup'],
};

interface HelpPanelProps {
    isOpen: boolean;
    onClose: () => void;
}

export function HelpPanel({ isOpen, onClose }: HelpPanelProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredArticles, setFilteredArticles] = useState(helpArticles);
    const pathname = usePathname();

    useEffect(() => {
        if (searchQuery.trim() === '') {
            setFilteredArticles(helpArticles);
        } else {
            const query = searchQuery.toLowerCase();
            const filtered = helpArticles.filter(
                article =>
                    article.title.toLowerCase().includes(query) ||
                    article.description.toLowerCase().includes(query) ||
                    article.tags.some(tag => tag.toLowerCase().includes(query))
            );
            setFilteredArticles(filtered);
        }
    }, [searchQuery]);

    // Get context-aware suggestions
    const contextKey = Object.keys(contextualHelp).find(key => pathname.startsWith(key));
    const suggestedSlugs = contextKey ? contextualHelp[contextKey] : [];
    const suggestedArticles = helpArticles.filter(article =>
        suggestedSlugs.some(slug => article.href.includes(slug))
    );

    return (
        <>
            {/* Overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/20 z-40 backdrop-blur-sm animate-in fade-in-0 duration-200"
                    onClick={onClose}
                />
            )}

            {/* Panel */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-full sm:w-[480px] bg-white shadow-2xl z-50
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    flex flex-col
                `}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
                            <BookOpen size={20} className="text-blue-600" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-gray-900">Help Center</h2>
                            <p className="text-xs text-gray-500">Get answers to your questions</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <X size={20} className="text-gray-500" />
                    </button>
                </div>

                {/* Search */}
                <div className="p-6 border-b border-gray-100">
                    <div className="relative">
                        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search help articles..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="
                                w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg
                                focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                text-sm
                            "
                        />
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {/* Context-aware suggestions */}
                    {suggestedArticles.length > 0 && searchQuery === '' && (
                        <div>
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                Suggested for this page
                            </h3>
                            <div className="space-y-2">
                                {suggestedArticles.map((article) => (
                                    <ArticleCard key={article.href} article={article} onClose={onClose} />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* All articles */}
                    <div>
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                            {searchQuery ? 'Search Results' : 'All Help Articles'}
                        </h3>
                        {filteredArticles.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">No articles found</p>
                                <p className="text-gray-400 text-xs mt-1">Try a different search term</p>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {filteredArticles.map((article) => (
                                    <ArticleCard key={article.href} article={article} onClose={onClose} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-100 bg-gray-50">
                    <Link
                        href="/docs"
                        target="_blank"
                        onClick={onClose}
                        className="
                            flex items-center justify-between w-full p-3 bg-white rounded-lg
                            border border-gray-200 hover:border-blue-300 hover:bg-blue-50
                            transition-colors group
                        "
                    >
                        <div className="flex items-center gap-3">
                            <BookOpen size={18} className="text-gray-400 group-hover:text-blue-600" />
                            <span className="text-sm font-medium text-gray-700 group-hover:text-blue-700">
                                View Full Documentation
                            </span>
                        </div>
                        <ExternalLink size={16} className="text-gray-400 group-hover:text-blue-600" />
                    </Link>
                </div>
            </div>
        </>
    );
}

function ArticleCard({ article, onClose }: { article: HelpArticle; onClose: () => void }) {
    return (
        <Link
            href={article.href}
            target="_blank"
            onClick={onClose}
            className="
                block p-4 bg-white border border-gray-200 rounded-lg
                hover:border-blue-300 hover:bg-blue-50 transition-colors group
            "
        >
            <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 mb-1">
                        {article.title}
                    </h4>
                    <p className="text-xs text-gray-500 line-clamp-2 mb-2">
                        {article.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                        {article.tags.slice(0, 3).map((tag) => (
                            <span
                                key={tag}
                                className="
                                    px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs
                                    group-hover:bg-blue-100 group-hover:text-blue-700
                                "
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
                <ChevronRight size={16} className="text-gray-400 group-hover:text-blue-600 flex-shrink-0 mt-1" />
            </div>
        </Link>
    );
}

export function HelpPanelTrigger({ onClick }: { onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className="
                fixed bottom-6 right-6 z-30
                w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg
                hover:bg-blue-700 hover:scale-110 transition-all duration-200
                flex items-center justify-center
                group
            "
            title="Open Help Center"
        >
            <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
        </button>
    );
}
