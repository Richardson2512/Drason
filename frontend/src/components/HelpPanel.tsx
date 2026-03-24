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
    // ── Help Center Articles ──
    {
        title: '24/7 Infrastructure Monitoring',
        href: '/docs/help/24-7-monitoring',
        description: 'How automated background syncing protects your infrastructure 24/7 with continuous health checks every 20 minutes',
        tags: ['monitoring', 'automation', 'sync', 'real-time', '24/7', 'background', 'health check', 'continuous']
    },
    {
        title: 'Understanding Infrastructure Score',
        href: '/docs/help/infrastructure-score-explained',
        description: 'Learn the difference between infrastructure score and entity status. The score is calculated from DNS, bounce rates, engagement, and connection health.',
        tags: ['infrastructure', 'score', 'dns', 'assessment', 'health score', 'resilience', 'rating', 'calculated']
    },
    {
        title: 'Why Is My Campaign Paused?',
        href: '/docs/help/campaign-paused',
        description: 'Campaigns are paused when all mailboxes are unhealthy or removed. Understand automatic and manual pause reasons and how to resume.',
        tags: ['campaign', 'paused', 'status', 'monitoring', 'stopped', 'inactive', 'resume', 'stalled', 'frozen']
    },
    {
        title: 'How Auto-Healing Works',
        href: '/docs/help/auto-healing',
        description: 'Complete guide to the 5-phase healing pipeline: pause, cooldown, restricted send, warm recovery, and monitoring',
        tags: ['healing', 'recovery', 'phases', 'automation', 'cooldown', 'restricted', 'warm', 'pipeline', 'self-healing']
    },
    {
        title: 'Notifications Guide',
        href: '/docs/help/notifications',
        description: 'Understanding notification types, severity levels, and how to configure alerts for infrastructure events',
        tags: ['notifications', 'alerts', 'severity', 'warning', 'critical', 'info', 'bell']
    },
    {
        title: 'Connection Errors Guide',
        href: '/docs/help/connection-errors',
        description: 'Troubleshoot SMTP/IMAP connection failures, OAuth token expiry, certificate errors, and mailbox disconnects',
        tags: ['connection', 'errors', 'smtp', 'imap', 'troubleshoot', 'oauth', 'token', 'expired', 'disconnected', 'failed']
    },
    {
        title: 'Mailbox Load Balancing',
        href: '/docs/help/load-balancing',
        description: 'How effective load is calculated for mailboxes. A mailbox is overloaded when it carries too much sending burden across campaigns. Optimal is 1-3 effective load, underutilized is below 1.',
        tags: ['load balancing', 'campaigns', 'mailboxes', 'distribution', 'overloaded', 'optimal', 'underutilized', 'effective load', 'rebalance', 'redundancy', 'sole sender', 'capacity']
    },
    {
        title: 'Audit Logs Guide',
        href: '/docs/help/audit-logs',
        description: 'Track every system action with full audit trail — pauses, resumes, rotations, bounces, and all automated decisions',
        tags: ['audit', 'logs', 'history', 'tracking', 'timeline', 'activity', 'events', 'actions']
    },
    {
        title: 'Billing & Subscription',
        href: '/docs/help/billing',
        description: 'Manage your plan, billing, and subscription details',
        tags: ['billing', 'subscription', 'plan', 'payment', 'upgrade', 'pricing', 'invoice']
    },
    {
        title: 'Bounce Classification',
        href: '/docs/help/bounce-classification',
        description: 'How bounces are classified as hard, soft, or transient. Hard bounces permanently damage reputation. Bounce rate is total bounces divided by total sends.',
        tags: ['bounce', 'classification', 'hard', 'soft', 'deliverability', 'bounced', 'bounce rate', 'reputation', 'failed', 'rejected']
    },
    {
        title: 'Account Management',
        href: '/docs/help/account-management',
        description: 'Manage your account settings, team, and organization',
        tags: ['account', 'settings', 'team', 'organization', 'profile', 'password', 'email']
    },
    {
        title: 'Analytics Dashboard',
        href: '/docs/help/analytics',
        description: 'Understanding your analytics: open rate, click rate, reply rate, bounce rate trends, and engagement metrics over time',
        tags: ['analytics', 'metrics', 'performance', 'stats', 'open rate', 'click rate', 'reply rate', 'trend', 'chart', 'graph']
    },
    // ── Concept Explainers (in-app help for dashboard data) ──
    {
        title: 'Mailbox Status Explained',
        href: '/docs/help/24-7-monitoring',
        description: 'Mailboxes can be healthy, warning, or paused. Healthy means normal operation. Warning means approaching thresholds. Paused means removed from campaigns due to health issues.',
        tags: ['mailbox', 'status', 'healthy', 'warning', 'paused', 'active', 'state', 'color', 'green', 'yellow', 'red']
    },
    {
        title: 'Domain Status Explained',
        href: '/docs/help/24-7-monitoring',
        description: 'Domains are paused when 50% or more of their mailboxes are unhealthy. A paused domain means all its mailboxes are removed from campaigns.',
        tags: ['domain', 'status', 'healthy', 'warning', 'paused', 'blacklist', 'dns', 'reputation']
    },
    {
        title: 'Lead Scoring & Status',
        href: '/docs/risk-scoring',
        description: 'Lead score (0-100) combines engagement signals: opens, clicks, replies. Lead status can be held, active, paused, or bounced. Bounced leads had hard bounce failures.',
        tags: ['lead', 'score', 'scoring', 'status', 'held', 'active', 'paused', 'bounced', 'engagement', 'opens', 'clicks', 'replies', 'failed']
    },
    {
        title: 'Engagement Rate Explained',
        href: '/docs/help/analytics',
        description: 'Engagement rate measures the percentage of sent emails that received a positive response (open, click, or reply). Low engagement may indicate spam folder placement.',
        tags: ['engagement', 'rate', 'open', 'click', 'reply', 'spam', 'inbox', 'placement', 'low engagement']
    },
    {
        title: 'Health Score Explained',
        href: '/docs/help/infrastructure-score-explained',
        description: 'Health score (0-100) is calculated from bounce rate, engagement rate, connection status, cooldown state, and domain warnings. Below 50 is considered unhealthy.',
        tags: ['health', 'score', 'calculation', 'formula', 'unhealthy', 'low', 'high', 'good', 'bad', 'number']
    },
    {
        title: 'Total Sent & Send Volume',
        href: '/docs/help/analytics',
        description: 'Total sent shows the lifetime email count sent through a mailbox or campaign. High volume with low engagement or high bounces signals deliverability problems.',
        tags: ['total sent', 'sent', 'volume', 'emails', 'count', 'lifetime', 'sends', 'sending']
    },
    {
        title: 'Mailbox Rotation',
        href: '/docs/help/auto-healing',
        description: 'When a mailbox is paused, Superkabe automatically rotates in a standby mailbox to keep campaigns sending. Standby mailboxes must be healthy and on the same domain.',
        tags: ['rotation', 'rotate', 'standby', 'replacement', 'automatic', 'swap', 'backup']
    },
    {
        title: 'Campaign Health & Stalled Campaigns',
        href: '/docs/help/campaign-paused',
        description: 'A campaign is stalled when it has active leads but no healthy mailboxes to send through. Campaigns never pause on bounce rate alone — only when all mailboxes are paused or removed.',
        tags: ['campaign', 'health', 'stalled', 'stuck', 'no mailboxes', 'sending stopped', 'not sending']
    },
    // ── Core Documentation ──
    {
        title: 'Getting Started',
        href: '/docs/getting-started',
        description: 'Quick start guide to set up your account and connect platforms',
        tags: ['getting started', 'setup', 'onboarding', 'quickstart', 'new', 'first time', 'connect']
    },
    {
        title: 'Configuration',
        href: '/docs/configuration',
        description: 'Configure thresholds, rules, and platform settings',
        tags: ['configuration', 'settings', 'thresholds', 'rules', 'customize', 'configure']
    },
    {
        title: 'Execution Gate',
        href: '/docs/execution-gate',
        description: 'How the pre-send validation gate classifies leads as GREEN, YELLOW, or RED before they reach campaigns',
        tags: ['execution', 'gate', 'validation', 'sending', 'green', 'yellow', 'red', 'blocked', 'classification', 'pre-send']
    },
    {
        title: 'Monitoring Thresholds',
        href: '/docs/monitoring',
        description: 'Bounce rate thresholds (2-3%), monitoring windows (1h, 24h, 7d), and when Superkabe triggers automatic pauses',
        tags: ['monitoring', 'thresholds', 'bounces', 'percentage', 'limit', 'window', 'automatic', 'trigger', 'pause']
    },
    {
        title: 'Risk Scoring',
        href: '/docs/risk-scoring',
        description: 'How mailbox, domain, and lead risk scores are calculated from bounce rates, engagement, and infrastructure signals',
        tags: ['risk', 'scoring', 'health', 'assessment', 'calculated', 'formula', 'factors', 'weight']
    },
    {
        title: 'State Machine',
        href: '/docs/state-machine',
        description: 'Entity lifecycle states and transition rules — how mailboxes, domains, and leads move between healthy, warning, paused, and recovery states',
        tags: ['state', 'machine', 'lifecycle', 'transitions', 'flow', 'diagram', 'status change']
    },
    {
        title: 'Warmup & Recovery',
        href: '/docs/warmup-recovery',
        description: 'Mailbox warmup phases and recovery workflows after being paused',
        tags: ['warmup', 'recovery', 'healing', 'phases', 'warm up', 'ramp', 'gradual']
    },
    {
        title: 'Platform Rules',
        href: '/docs/platform-rules',
        description: 'Platform-specific sending rules, rate limits, and API constraints for Smartlead, Instantly, and EmailBison',
        tags: ['rules', 'platform', 'rate limits', 'sending', 'limits', 'api', 'constraints', 'daily limit']
    },
    {
        title: 'Infrastructure Assessment',
        href: '/docs/infrastructure-assessment',
        description: 'How initial infrastructure health assessment works at onboarding — DNS checks, bounce rate analysis, and connection validation',
        tags: ['infrastructure', 'assessment', 'onboarding', 'dns', 'initial', 'first sync', 'evaluation']
    },
    {
        title: 'Data Sync Coverage',
        href: '/docs/data-sync-coverage',
        description: 'What data syncs from each platform and what starts at zero',
        tags: ['sync', 'data', 'coverage', 'smartlead', 'instantly', 'emailbison', 'import', 'missing data']
    },
    {
        title: 'Multi-Platform Sync',
        href: '/docs/multi-platform-sync',
        description: 'How Superkabe syncs across Smartlead, Instantly, and EmailBison simultaneously',
        tags: ['multi-platform', 'sync', 'smartlead', 'instantly', 'emailbison', 'parallel', 'multiple']
    },
    // ── Integration Guides ──
    {
        title: 'Smartlead Integration',
        href: '/docs/smartlead-integration',
        description: 'Connecting and syncing with Smartlead — API key setup, webhook configuration, and campaign sync',
        tags: ['smartlead', 'integration', 'sync', 'api key', 'webhook', 'connect']
    },
    {
        title: 'EmailBison Integration',
        href: '/docs/emailbison-integration',
        description: 'Connecting and syncing with EmailBison',
        tags: ['emailbison', 'integration', 'sync', 'connect']
    },
    {
        title: 'Instantly Integration',
        href: '/docs/instantly-integration',
        description: 'Connecting and syncing with Instantly',
        tags: ['instantly', 'integration', 'sync', 'connect']
    },
    {
        title: 'Clay Integration',
        href: '/docs/clay-integration',
        description: 'Connect Clay for lead enrichment and webhook ingestion',
        tags: ['clay', 'integration', 'leads', 'webhook', 'enrichment', 'import']
    },
    {
        title: 'Slack Integration',
        href: '/docs/slack-integration',
        description: 'Set up Slack alerts for real-time infrastructure notifications',
        tags: ['slack', 'integration', 'alerts', 'notifications', 'channel', 'webhook']
    },
    {
        title: 'API Integration',
        href: '/docs/api-integration',
        description: 'REST API reference for programmatic access',
        tags: ['api', 'integration', 'rest', 'endpoints', 'programmatic', 'developer']
    },
    // ── Technical Documentation ──
    {
        title: 'Technical Architecture',
        href: '/docs/technical-architecture',
        description: 'System design, data flow, and architecture overview',
        tags: ['architecture', 'technical', 'design', 'system', 'how it works']
    },
    {
        title: 'Deployment Guide',
        href: '/docs/deployment',
        description: 'Deploy and configure Superkabe infrastructure',
        tags: ['deployment', 'railway', 'infrastructure', 'hosting', 'deploy', 'install']
    },
];

// Context-aware help based on current page
const contextualHelp: Record<string, string[]> = {
    '/dashboard/infrastructure': ['infrastructure-score-explained', 'infrastructure-assessment', '24-7-monitoring', 'auto-healing'],
    '/dashboard/campaigns': ['campaign-paused', '24-7-monitoring', 'auto-healing', 'monitoring'],
    '/dashboard/leads': ['analytics', 'risk-scoring', 'clay-integration'],
    '/dashboard/domains': ['infrastructure-score-explained', '24-7-monitoring', 'monitoring', 'bounce-classification'],
    '/dashboard/mailboxes': ['connection-errors', '24-7-monitoring', 'monitoring', 'auto-healing', 'warmup-recovery'],
    '/dashboard/notifications': ['notifications', '24-7-monitoring'],
    '/dashboard/settings': ['smartlead-integration', 'emailbison-integration', 'instantly-integration', 'configuration', 'account-management'],
    '/dashboard/billing': ['billing'],
    '/dashboard/predictive-risks': ['risk-scoring', 'monitoring', '24-7-monitoring', 'bounce-classification'],
    '/dashboard/load-balancing': ['load-balancing', 'campaign-paused', 'monitoring'],
    '/dashboard/audit-logs': ['audit-logs', '24-7-monitoring'],
    '/dashboard/analytics': ['analytics', 'data-sync-coverage', 'monitoring'],
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
            const query = searchQuery.toLowerCase().trim();
            // Split query into words for flexible matching
            // "why my mailboxes are showing overloaded" → matches articles with "mailbox" OR "overloaded"
            const stopWords = new Set([
                'why', 'is', 'my', 'are', 'the', 'a', 'an', 'in', 'on', 'to', 'for', 'of', 'it',
                'do', 'does', 'how', 'what', 'when', 'where', 'can', 'i', 'am', 'not', 'im', 'its',
                'showing', 'show', 'shows', 'seeing', 'see', 'mean', 'means', 'getting', 'got',
                'being', 'been', 'was', 'were', 'has', 'have', 'had', 'this', 'that', 'with',
                'but', 'and', 'or', 'so', 'if', 'just', 'very', 'too', 'also', 'about', 'some',
                'there', 'here', 'all', 'any', 'each', 'which', 'their', 'them', 'they',
            ]);

            // Simple stemming: strip common suffixes to match variations
            const stem = (word: string): string[] => {
                const stems = [word];
                // Strip plural/verb endings
                if (word.endsWith('es') && word.length > 4) stems.push(word.slice(0, -2));
                if (word.endsWith('s') && !word.endsWith('ss') && word.length > 3) stems.push(word.slice(0, -1));
                if (word.endsWith('ed') && word.length > 4) stems.push(word.slice(0, -2), word.slice(0, -1));
                if (word.endsWith('ing') && word.length > 5) stems.push(word.slice(0, -3), word.slice(0, -3) + 'e');
                if (word.endsWith('ies') && word.length > 4) stems.push(word.slice(0, -3) + 'y');
                return [...new Set(stems)];
            };

            // Synonyms: map common user terms to terms used in our docs
            const synonyms: Record<string, string[]> = {
                'overloaded': ['load balancing', 'overloaded', 'effective load', 'capacity', 'too many'],
                'overload': ['load balancing', 'overloaded', 'effective load'],
                'burned': ['burned', 'burnout', 'blacklist', 'damaged', 'reputation'],
                'burn': ['burned', 'burnout', 'blacklist', 'damaged'],
                'stuck': ['stalled', 'stuck', 'frozen', 'not sending'],
                'broken': ['connection', 'errors', 'failed', 'disconnected'],
                'spam': ['deliverability', 'inbox', 'placement', 'reputation', 'spam'],
                'stop': ['paused', 'stopped', 'inactive'],
                'stopped': ['paused', 'stopped', 'inactive', 'stalled'],
                'down': ['paused', 'unhealthy', 'failed', 'disconnected'],
                'fix': ['recovery', 'healing', 'resume', 'troubleshoot'],
                'repair': ['recovery', 'healing', 'resume', 'troubleshoot'],
                'email': ['mailbox', 'email', 'sending', 'smtp'],
                'emails': ['mailbox', 'email', 'sending', 'smtp'],
                'send': ['sending', 'volume', 'sends', 'sent'],
                'cost': ['billing', 'pricing', 'plan', 'payment'],
                'price': ['billing', 'pricing', 'plan', 'payment'],
                'money': ['billing', 'pricing', 'plan', 'payment'],
            };

            const queryWords = query.split(/\s+/).filter(w => w.length > 1 && !stopWords.has(w));

            // Expand query words with stems and synonyms
            const expandedWords: string[] = [];
            for (const word of queryWords) {
                const stemmed = stem(word);
                expandedWords.push(...stemmed);
                for (const s of stemmed) {
                    if (synonyms[s]) expandedWords.push(...synonyms[s]);
                }
            }
            const words = [...new Set(expandedWords)];

            const scored = helpArticles.map(article => {
                const titleLower = article.title.toLowerCase();
                const descLower = article.description.toLowerCase();
                const tagsLower = article.tags.map(t => t.toLowerCase());

                let score = 0;

                // Exact full query match (highest weight)
                if (titleLower.includes(query)) score += 10;
                if (descLower.includes(query)) score += 5;
                if (tagsLower.some(tag => tag.includes(query))) score += 8;

                // Per-word matching (includes stems + synonyms)
                for (const word of words) {
                    if (titleLower.includes(word)) score += 3;
                    if (descLower.includes(word)) score += 2;
                    if (tagsLower.some(tag => tag.includes(word))) score += 4;
                }

                return { article, score };
            });

            const filtered = scored
                .filter(s => s.score > 0)
                .sort((a, b) => b.score - a.score)
                .map(s => s.article);

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
                        aria-label="Close help panel"
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
            aria-label="Open help center"
        >
            <BookOpen size={24} className="group-hover:scale-110 transition-transform" />
        </button>
    );
}
