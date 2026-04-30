'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ExternalLink, Search } from 'lucide-react';
import type { SettingEntry } from '@/types/api';

// ────────────────────────────────────────────────────────────────────
// Integration definitions
// ──��─────────────────────────��───────────────────────────────────────

interface Integration {
    id: string;
    name: string;
    description: string;
    category: 'sending' | 'leads' | 'crm' | 'notifications' | 'sequencer' | 'developer' | 'migration' | 'ai';
    logo: string;           // path to /public asset or inline
    configPath: string;     // deep-link to configure
    settingKey?: string;    // key in settings API to check connection
    statusKey?: string;     // secondary key for status check
    comingSoon?: boolean;
    /** When true, the card is only rendered if the migration feature flag is on. */
    requiresMigrationFlag?: boolean;
}

const INTEGRATIONS: Integration[] = [
    // Lead Sources
    {
        id: 'clay',
        name: 'Clay',
        description: 'Ingest enriched leads directly from Clay tables via webhook.',
        category: 'leads',
        logo: '/clay.png',
        configPath: '/dashboard/settings',
        settingKey: '_CLAY_ALWAYS_ON_', // Clay is always available once org exists
    },

    // Sequencer — Mailbox Providers
    {
        id: 'google',
        name: 'Google Workspace',
        description: 'Connect Gmail accounts for sending via the Sequencer.',
        category: 'sequencer',
        logo: '_google_',
        configPath: '/dashboard/sequencer/accounts',
    },
    {
        id: 'microsoft',
        name: 'Microsoft 365',
        description: 'Connect Outlook accounts for sending via the Sequencer.',
        category: 'sequencer',
        logo: '_microsoft_',
        configPath: '/dashboard/sequencer/accounts',
    },
    {
        id: 'smtp',
        name: 'SMTP / Bulk Import',
        description: 'Connect mailboxes from Zapmail, Scaledmail, MissionInbox, and more.',
        category: 'sequencer',
        logo: '_smtp_',
        configPath: '/dashboard/sequencer/accounts',
    },

    // Notifications
    {
        id: 'slack',
        name: 'Slack',
        description: 'Receive real-time alerts for pauses, bounces, and health issues.',
        category: 'notifications',
        logo: '_slack_',
        configPath: '/dashboard/settings',
        settingKey: 'SLACK_CONNECTED',
        statusKey: 'SLACK_ALERTS_STATUS',
    },

    // AI Assistants
    {
        id: 'claude',
        name: 'Claude',
        description: 'Connect Claude.ai (browser) to Superkabe via OAuth. Run leads, campaigns, and replies from any Claude conversation — no install needed.',
        category: 'ai',
        logo: '/brands/claude.svg',
        configPath: '/dashboard/api-mcp',
    },

    // Developer
    {
        id: 'webhooks',
        name: 'Webhooks',
        description: 'POST callbacks for sending and protection events. HMAC-signed, retried, replayable.',
        category: 'developer',
        logo: '_webhook_',
        configPath: '/dashboard/integrations/webhooks',
        settingKey: '_WEBHOOKS_ALWAYS_ON_',
    },

    // Migration — one-time imports from competing platforms
    {
        id: 'smartlead-import',
        name: 'Import from Smartlead',
        description: 'One-time import of campaigns, sequences, leads, and mailbox metadata. API key auto-discards after 24 hours.',
        category: 'migration',
        logo: '/smartlead.webp',
        configPath: '/dashboard/migration/from-smartlead',
        requiresMigrationFlag: true,
    },
    {
        id: 'instantly-import',
        name: 'Import from Instantly',
        description: 'One-time import of campaigns, sequences, leads, block list, and mailbox metadata from Instantly v2. API key auto-discards after 24 hours. Mailboxes must be re-authenticated after import.',
        category: 'migration',
        logo: '/instantly.png',
        configPath: '/dashboard/migration/from-instantly',
        requiresMigrationFlag: true,
    },

    // CRM — Future
    {
        id: 'hubspot',
        name: 'HubSpot',
        description: 'Import contacts from HubSpot lists, push activity to the contact timeline, sync the suppression list.',
        category: 'crm',
        logo: '/brands/hubspot.svg',
        configPath: '/dashboard/integrations/crm',
    },
    {
        id: 'salesforce',
        name: 'Salesforce',
        description: 'Import contacts via SOQL or list view, write Tasks for activity, pull do-not-contact flags.',
        category: 'crm',
        logo: '/brands/salesforce.svg',
        configPath: '/dashboard/integrations/crm',
    },
];

const CATEGORIES: { key: string; label: string }[] = [
    { key: 'sequencer', label: 'Sending Mailboxes' },
    { key: 'leads', label: 'Lead Sources' },
    { key: 'ai', label: 'AI Assistants' },
    { key: 'notifications', label: 'Notifications' },
    { key: 'developer', label: 'Developer' },
    { key: 'migration', label: 'One-time Imports' },
    { key: 'crm', label: 'CRM' },
];

// ────────────────────────────────────────────────────────────────────
// Inline SVG logos for providers without image files
// ────���───────────────────────────────────────────────────────────────

function GoogleLogo() {
    return (
        <svg width="20" height="20" viewBox="0 0 48 48">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
    );
}

function MicrosoftLogo() {
    return (
        <svg width="18" height="18" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
            <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
        </svg>
    );
}

function SlackLogo() {
    return (
        <svg width="20" height="20" viewBox="0 0 127 127">
            <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2S.8 87.3.8 80s5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V80z" fill="#E01E5A"/>
            <path d="M47 27c-7.3 0-13.2-5.9-13.2-13.2S39.7.6 47 .6s13.2 5.9 13.2 13.2V27H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2H14c-7.3 0-13.2-5.9-13.2-13.2S6.7 33.7 14 33.7h33z" fill="#36C5F0"/>
            <path d="M99.9 46.9c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2-5.9 13.2-13.2 13.2H99.9V46.9zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2s-13.2-5.9-13.2-13.2V14c0-7.3 5.9-13.2 13.2-13.2s13.2 5.9 13.2 13.2v32.9z" fill="#2EB67D"/>
            <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2s5.9-13.2 13.2-13.2h33c7.3 0 13.2 5.9 13.2 13.2s-5.9 13.2-13.2 13.2h-33z" fill="#ECB22E"/>
        </svg>
    );
}

function SmtpIcon() {
    return (
        <div className="w-5 h-5 rounded bg-gray-800 flex items-center justify-center">
            <span className="text-[8px] font-black text-white leading-none">SMTP</span>
        </div>
    );
}

function PlaceholderLogo({ name }: { name: string }) {
    return (
        <div className="w-5 h-5 rounded bg-slate-200 flex items-center justify-center">
            <span className="text-[9px] font-bold text-slate-500 leading-none">{name[0]}</span>
        </div>
    );
}

function IntegrationLogo({ integration }: { integration: Integration }) {
    if (integration.logo === '_google_') return <GoogleLogo />;
    if (integration.logo === '_microsoft_') return <MicrosoftLogo />;
    if (integration.logo === '_slack_') return <SlackLogo />;
    if (integration.logo === '_smtp_') return <SmtpIcon />;
    if (integration.logo === '_webhook_') return <WebhookLogo />;
    if (integration.logo.startsWith('_')) return <PlaceholderLogo name={integration.name} />;
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={integration.logo} alt={integration.name} width={20} height={20} className="rounded" />;
}

function WebhookLogo() {
    return (
        <div className="w-5 h-5 rounded bg-gray-100 flex items-center justify-center">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 16.98h-5.99c-1.1 0-1.95.94-2.48 1.9A4 4 0 0 1 2 17c.01-.7.2-1.4.57-2" />
                <path d="m6 17 3.13-5.78c.53-.97.43-2.22-.26-3.07A4 4 0 0 1 17 6c0 .8-.42 1.66-.55 2" />
                <path d="m12 7-3.13 5.78c-.53.97-1.7 1.5-2.6 1.22a4 4 0 0 0-3.66 7c.69.86 1.91 1 2.83 1" />
            </svg>
        </div>
    );
}

// ───────────────��────────────────────────────────���───────────────────
// Connection status resolver
// ──────────────────────────────��────────────────────────────��────────

function getConnectionStatus(
    integration: Integration,
    settings: SettingEntry[],
    providerCounts: Record<string, number>,
    oauthClientCount: number,
    crmActiveProviders: Set<string>,
): 'connected' | 'error' | 'not_connected' | 'coming_soon' {
    if (integration.comingSoon) return 'coming_soon';

    // Clay is always available
    if (integration.id === 'clay') return 'connected';
    // Webhooks are always available — connection state lives per-endpoint inside the webhooks page.
    if (integration.id === 'webhooks') return 'connected';
    // Claude (and any future OAuth-MCP client) — connected when the user
    // has at least one active OAuth grant.
    if (integration.id === 'claude') {
        return oauthClientCount > 0 ? 'connected' : 'not_connected';
    }
    // CRM providers (hubspot, salesforce) — connected when an active
    // CrmConnection exists for that provider in the org.
    if (integration.id === 'hubspot' || integration.id === 'salesforce') {
        return crmActiveProviders.has(integration.id) ? 'connected' : 'not_connected';
    }

    // Sequencer mailbox providers — check the specific provider's connected account count.
    // Each provider (google / microsoft / smtp) is shown as its own card, so we can't
    // treat "any mailbox connected" as "all providers connected".
    if (integration.category === 'sequencer') {
        const count = providerCounts[integration.id] || 0;
        return count > 0 ? 'connected' : 'not_connected';
    }

    // Smartlead / Instantly import — feature is "available" when the flag is on;
    // per-org status (key on file? job running?) is reflected inside the wizard.
    if (integration.id === 'smartlead-import') return 'not_connected';
    if (integration.id === 'instantly-import') return 'not_connected';

    // Slack — check SLACK_CONNECTED + status
    if (integration.id === 'slack') {
        const isConnected = settings.find(s => s.key === 'SLACK_CONNECTED')?.value === 'true';
        if (!isConnected) return 'not_connected';
        const status = settings.find(s => s.key === 'SLACK_ALERTS_STATUS')?.value;
        return status === 'revoked' ? 'error' : 'connected';
    }

    // API key-based integrations
    if (integration.settingKey) {
        const hasKey = settings.some(s => s.key === integration.settingKey && s.value);
        return hasKey ? 'connected' : 'not_connected';
    }

    return 'not_connected';
}

const STATUS_CONFIG = {
    connected: { label: 'Connected', bg: '#D1FAE5', text: '#065F46', dot: '#10B981' },
    error: { label: 'Error', bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
    not_connected: { label: 'Not Connected', bg: '#F3F4F6', text: '#6B7280', dot: '#9CA3AF' },
    coming_soon: { label: 'Coming Soon', bg: '#EFF6FF', text: '#1D4ED8', dot: '#3B82F6' },
};

// ─────��────────────────────────────���─────────────────────────────────
// Page component
// ────────────────────────────��─────────────────────────────────��─────

export default function IntegrationsPage() {
    const [settings, setSettings] = useState<SettingEntry[]>([]);
    const [providerCounts, setProviderCounts] = useState<Record<string, number>>({});
    const [oauthClientCount, setOauthClientCount] = useState(0);
    const [crmActiveProviders, setCrmActiveProviders] = useState<Set<string>>(new Set());
    const [migrationEnabled, setMigrationEnabled] = useState(false);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        Promise.all([
            apiClient<any>('/api/settings')
                .then(res => setSettings(Array.isArray(res) ? res : (res?.data || []))),
            apiClient<any>('/api/sequencer/accounts')
                .then(res => {
                    // apiClient auto-unwraps `data`, so res is usually the array directly.
                    // Also handle `{accounts}` and wrapped shapes defensively.
                    const accounts: any[] = Array.isArray(res)
                        ? res
                        : (res?.accounts || res?.data?.accounts || res?.data || []);
                    const counts: Record<string, number> = {};
                    for (const a of accounts) {
                        const provider = String(a?.provider || '').toLowerCase();
                        if (!provider) continue;
                        counts[provider] = (counts[provider] || 0) + 1;
                    }
                    setProviderCounts(counts);
                })
                .catch(() => setProviderCounts({})),
            apiClient<{ enabled: boolean }>('/api/migration/from-smartlead/feature')
                .then(res => setMigrationEnabled(!!res?.enabled))
                .catch(() => setMigrationEnabled(false)),
            apiClient<Array<{ client_id: string }>>('/api/oauth/connections')
                .then(res => setOauthClientCount(Array.isArray(res) ? res.length : 0))
                .catch(() => setOauthClientCount(0)),
            apiClient<Array<{ provider: string; status: string }>>('/api/integrations/crm/connections')
                .then(res => {
                    const active = new Set<string>();
                    if (Array.isArray(res)) {
                        for (const c of res) {
                            if (c.status === 'active') active.add(c.provider);
                        }
                    }
                    setCrmActiveProviders(active);
                })
                .catch(() => setCrmActiveProviders(new Set())),
        ]).finally(() => setLoading(false));
    }, []);

    const visibleIntegrations = INTEGRATIONS.filter(i =>
        !i.requiresMigrationFlag || migrationEnabled,
    );

    if (loading) {
        return (
            <div className="p-8">
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-gray-900 mb-0.5">Integrations</h1>
                    <p className="text-xs text-slate-500">Manage all your connected services in one place.</p>
                </div>
                <LoadingSkeleton type="card" rows={3} />
            </div>
        );
    }

    const connectedCount = visibleIntegrations.filter(i => {
        const s = getConnectionStatus(i, settings, providerCounts, oauthClientCount, crmActiveProviders);
        return s === 'connected';
    }).length;

    const q = searchQuery.trim().toLowerCase();
    const matchesSearch = (i: Integration) => {
        if (!q) return true;
        return (
            i.name.toLowerCase().includes(q) ||
            i.description.toLowerCase().includes(q) ||
            i.id.toLowerCase().includes(q) ||
            i.category.toLowerCase().includes(q)
        );
    };
    const totalMatches = visibleIntegrations.filter(matchesSearch).length;

    return (
        <div className="p-8">
            {/* Header */}
            <div className="flex items-start justify-between mb-6 gap-4">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 mb-0.5">Integrations</h1>
                    <p className="text-xs text-slate-500">Manage all your connected services in one place.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-[#E2E8F0] flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="text-sm font-semibold text-gray-700">{connectedCount} connected</span>
                </div>
            </div>

            {/* Search */}
            <div className="relative mb-6 max-w-xl">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                <input
                    type="search"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search integrations by name, description, or category…"
                    className="w-full pl-9 pr-9 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-gray-400 placeholder:text-gray-400"
                />
                {searchQuery && (
                    <button
                        type="button"
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700"
                        aria-label="Clear search"
                    >
                        ×
                    </button>
                )}
            </div>

            {/* No-results state */}
            {q && totalMatches === 0 && (
                <div className="bg-white border border-[#E2E8F0] rounded-xl px-5 py-8 text-center">
                    <p className="text-sm font-semibold text-gray-900 mb-1">No integrations match &quot;{searchQuery}&quot;</p>
                    <p className="text-xs text-gray-500">Try a different keyword or browse the full list.</p>
                </div>
            )}

            {/* Categories */}
            <div className="flex flex-col gap-8">
                {CATEGORIES.map(cat => {
                    const items = visibleIntegrations.filter(i => i.category === cat.key && matchesSearch(i));
                    if (items.length === 0) return null;

                    return (
                        <div key={cat.key}>
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">{cat.label}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {items.map(integration => {
                                    const status = getConnectionStatus(integration, settings, providerCounts, oauthClientCount, crmActiveProviders);
                                    const cfg = STATUS_CONFIG[status];
                                    const isClickable = !integration.comingSoon;

                                    return (
                                        <div
                                            key={integration.id}
                                            className="bg-white rounded-xl p-5 flex flex-col gap-3 transition-all duration-150"
                                            style={{
                                                border: status === 'connected' ? '1px solid #A7F3D0' : '1px solid #E2E8F0',
                                                opacity: integration.comingSoon ? 0.6 : 1,
                                            }}
                                        >
                                            {/* Top row: logo + name + status */}
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                                                        <IntegrationLogo integration={integration} />
                                                    </div>
                                                    <div>
                                                        <div className="text-sm font-bold text-gray-900">{integration.name}</div>
                                                    </div>
                                                </div>
                                                <span
                                                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold shrink-0"
                                                    style={{ background: cfg.bg, color: cfg.text }}
                                                >
                                                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: cfg.dot }} />
                                                    {cfg.label}
                                                </span>
                                            </div>

                                            {/* Description */}
                                            <p className="text-xs text-slate-500 leading-relaxed m-0">{integration.description}</p>

                                            {/* Action */}
                                            {isClickable && (
                                                <Link
                                                    href={integration.configPath}
                                                    className="flex items-center gap-1.5 text-[11px] font-semibold mt-auto pt-1 no-underline transition-colors"
                                                    style={{ color: status === 'connected' ? '#059669' : '#3B82F6' }}
                                                >
                                                    {status === 'connected' ? 'Manage' : 'Configure'}
                                                    <ExternalLink size={10} />
                                                </Link>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
