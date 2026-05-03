'use client';

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';
import { Key, Copy, Check, Trash2, Plus, Shield, Eye, EyeOff, Code, Cpu } from 'lucide-react';

// ────────────────────────────────────────────────────────────────────
// Types
// ────────────────────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://api.superkabe.com';
const API_BASE_NORMALIZED = API_BASE.replace(/\/$/, '');
// The bare /mcp URL is back-compat. The per-org `/mcp/<slug>` URL is the
// recommended shape (binds the resulting OAuth grant to a specific org so
// agencies can wire one Claude.ai account up to multiple client orgs as
// separate connectors). The current org's slug is fetched at mount time.
const MCP_URL_BARE = `${API_BASE_NORMALIZED}/mcp`;

interface ApiKeyData {
    id: string;
    key_prefix: string;
    name: string;
    scopes: string[];
    last_used_at: string | null;
    expires_at: string | null;
    created_at: string;
    revoked_at: string | null;
}

const SCOPE_GROUPS: { label: string; scopes: { value: string; label: string }[] }[] = [
    {
        label: 'Leads',
        scopes: [
            { value: 'leads:read', label: 'Read leads' },
            { value: 'leads:write', label: 'Create/import leads' },
        ]
    },
    {
        label: 'Campaigns',
        scopes: [
            { value: 'campaigns:read', label: 'Read campaigns' },
            { value: 'campaigns:write', label: 'Create/update/launch campaigns' },
        ]
    },
    {
        label: 'Validation',
        scopes: [
            { value: 'validation:read', label: 'Read validation results' },
            { value: 'validation:trigger', label: 'Trigger validation' },
        ]
    },
    {
        label: 'Infrastructure',
        scopes: [
            { value: 'mailboxes:read', label: 'Read mailboxes' },
            { value: 'domains:read', label: 'Read domains' },
        ]
    },
    {
        label: 'Replies',
        scopes: [
            { value: 'replies:read', label: 'Read replies' },
            { value: 'replies:send', label: 'Send replies' },
        ]
    },
    {
        label: 'Other',
        scopes: [
            { value: 'reports:read', label: 'Read reports' },
            { value: 'account:read', label: 'Read account info' },
        ]
    },
];

const ALL_SCOPES = SCOPE_GROUPS.flatMap(g => g.scopes.map(s => s.value));

// ────────────────────────────────────────────────────────────────────
// Copy button
// ────────────────────────────────────────────────────────────────────

function CopyBtn({ text }: { text: string }) {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <button onClick={handleCopy} className="p-1.5 rounded-md hover:bg-slate-100 transition-colors border-none bg-transparent cursor-pointer" title="Copy">
            {copied ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} className="text-slate-400" />}
        </button>
    );
}

// ────────────────────────────────────────────────────────────────────
// API Endpoints reference
// ────────────────────────────────────────────────────────────────────

const ENDPOINTS = [
    { method: 'POST', path: '/api/v1/leads/bulk', desc: 'Import leads (JSON array)', scope: 'leads:write' },
    { method: 'GET', path: '/api/v1/leads', desc: 'List leads with filters', scope: 'leads:read' },
    { method: 'GET', path: '/api/v1/leads/:id', desc: 'Get single lead', scope: 'leads:read' },
    { method: 'POST', path: '/api/v1/leads/validate', desc: 'Trigger email validation', scope: 'validation:trigger' },
    { method: 'GET', path: '/api/v1/validation/results', desc: 'Validation analytics', scope: 'validation:read' },
    { method: 'POST', path: '/api/v1/campaigns', desc: 'Create campaign with steps + leads', scope: 'campaigns:write' },
    { method: 'GET', path: '/api/v1/campaigns', desc: 'List campaigns', scope: 'campaigns:read' },
    { method: 'GET', path: '/api/v1/campaigns/:id', desc: 'Get campaign details', scope: 'campaigns:read' },
    { method: 'PATCH', path: '/api/v1/campaigns/:id', desc: 'Update campaign', scope: 'campaigns:write' },
    { method: 'POST', path: '/api/v1/campaigns/:id/launch', desc: 'Launch campaign', scope: 'campaigns:write' },
    { method: 'POST', path: '/api/v1/campaigns/:id/pause', desc: 'Pause campaign', scope: 'campaigns:write' },
    { method: 'GET', path: '/api/v1/campaigns/:id/report', desc: 'Campaign performance report', scope: 'reports:read' },
    { method: 'GET', path: '/api/v1/campaigns/:id/replies', desc: 'List campaign replies', scope: 'replies:read' },
    { method: 'POST', path: '/api/v1/replies', desc: 'Send a reply', scope: 'replies:send' },
    { method: 'GET', path: '/api/v1/mailboxes', desc: 'List mailboxes with health', scope: 'mailboxes:read' },
    { method: 'GET', path: '/api/v1/domains', desc: 'List domains with health', scope: 'domains:read' },
    { method: 'GET', path: '/api/v1/account', desc: 'Account info, usage, limits', scope: 'account:read' },
];

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
    GET: { bg: '#DBEAFE', text: '#1D4ED8' },
    POST: { bg: '#D1FAE5', text: '#065F46' },
    PATCH: { bg: '#FEF3C7', text: '#92400E' },
    DELETE: { bg: '#FEE2E2', text: '#991B1B' },
};

// ────────────────────────────────────────────────────────────────────
// Page
// ────────────────────────────────────────────────────────────────────

export default function ApiMcpPage() {
    const [keys, setKeys] = useState<ApiKeyData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [newKeyName, setNewKeyName] = useState('');
    const [selectedScopes, setSelectedScopes] = useState<string[]>([...ALL_SCOPES]);
    const [expiryDays, setExpiryDays] = useState<number | null>(null);
    const [creating, setCreating] = useState(false);
    const [newRawKey, setNewRawKey] = useState<string | null>(null);
    const [showRawKey, setShowRawKey] = useState(false);
    const [activeTab, setActiveTab] = useState<'keys' | 'endpoints' | 'mcp'>('keys');
    const [revoking, setRevoking] = useState<string | null>(null);
    const [orgSlug, setOrgSlug] = useState<string | null>(null);
    const [orgName, setOrgName] = useState<string | null>(null);

    const mcpUrl = orgSlug ? `${API_BASE_NORMALIZED}/mcp/${orgSlug}` : MCP_URL_BARE;

    const fetchKeys = async () => {
        try {
            const result = await apiClient<{ keys: ApiKeyData[] }>('/api/api-keys');
            setKeys(result?.keys || []);
        } catch {
            setKeys([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchKeys(); }, []);

    // Pull the current org's slug so we can render the per-org MCP URL.
    // Falls back to the bare /mcp URL if /me 404s for any reason — the
    // page stays usable rather than blocking on this lookup.
    useEffect(() => {
        (async () => {
            try {
                const me = await apiClient<{
                    success: boolean;
                    data: { organization?: { slug?: string; name?: string } };
                }>('/api/user/me');
                const slug = me?.data?.organization?.slug || null;
                const name = me?.data?.organization?.name || null;
                if (slug) setOrgSlug(slug);
                if (name) setOrgName(name);
            } catch {
                // Leave orgSlug null; UI shows the bare URL.
            }
        })();
    }, []);

    const handleCreate = async () => {
        if (!newKeyName.trim()) return;
        setCreating(true);
        try {
            const result = await apiClient<{ key: ApiKeyData & { raw_key: string } }>('/api/api-keys', {
                method: 'POST',
                body: JSON.stringify({
                    name: newKeyName.trim(),
                    scopes: selectedScopes,
                    expires_in_days: expiryDays,
                }),
            });
            setNewRawKey(result?.key?.raw_key || null);
            setShowRawKey(true);
            await fetchKeys();
        } catch (err: any) {
            toast.error(err.message || 'Failed to create API key');
        } finally {
            setCreating(false);
        }
    };

    const [revokeTarget, setRevokeTarget] = useState<ApiKeyData | null>(null);
    const handleRevoke = (key: ApiKeyData) => setRevokeTarget(key);
    const confirmRevoke = async () => {
        if (!revokeTarget) return;
        const id = revokeTarget.id;
        setRevoking(id);
        try {
            await apiClient(`/api/api-keys/${id}`, { method: 'DELETE' });
            toast.success('API key revoked');
            await fetchKeys();
            setRevokeTarget(null);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to revoke API key');
        } finally {
            setRevoking(null);
        }
    };

    const toggleScope = (scope: string) => {
        setSelectedScopes(prev =>
            prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
        );
    };

    const activeKeys = keys.filter(k => !k.revoked_at);
    const revokedKeys = keys.filter(k => k.revoked_at);

    return (
        <div className="p-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-gray-900 mb-0.5">API & MCP</h1>
                <p className="text-xs text-slate-500">Manage API keys, explore endpoints, and connect Superkabe to Claude or other AI agents.</p>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit bg-slate-100">
                {([
                    { key: 'keys', label: 'API Keys', icon: <Key size={13} /> },
                    { key: 'endpoints', label: 'Endpoints', icon: <Code size={13} /> },
                    { key: 'mcp', label: 'MCP Server', icon: <Cpu size={13} /> },
                ] as const).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className="rounded-[10px] border-none text-sm font-semibold cursor-pointer transition-all duration-200 px-5 py-2.5 flex items-center gap-2"
                        style={{
                            background: activeTab === tab.key ? '#FFFFFF' : 'transparent',
                            color: activeTab === tab.key ? '#111827' : '#64748B',
                            boxShadow: activeTab === tab.key ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                    >
                        {tab.icon}
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* ═══════════ API KEYS TAB ═══════════ */}
            {activeTab === 'keys' && (
                <div className="flex flex-col gap-6">
                    {/* Newly created key alert */}
                    {newRawKey && (
                        <div className="bg-emerald-50 border-2 border-emerald-300 rounded-xl p-5">
                            <div className="flex items-center gap-2 mb-2">
                                <Shield size={16} className="text-emerald-600" />
                                <span className="text-sm font-bold text-emerald-800">API Key Created — Save It Now</span>
                            </div>
                            <p className="text-xs text-emerald-700 mb-3">This key will not be shown again. Copy it and store it securely.</p>
                            <div className="flex items-center gap-2 bg-white rounded-lg border border-emerald-200 p-3">
                                <code className="flex-1 text-sm font-mono text-gray-900 break-all select-all">
                                    {showRawKey ? newRawKey : '••••••••••••••••••••••••••••••••••••••••'}
                                </code>
                                <button onClick={() => setShowRawKey(!showRawKey)} className="p-1.5 rounded-md hover:bg-emerald-50 transition-colors border-none bg-transparent cursor-pointer">
                                    {showRawKey ? <EyeOff size={14} className="text-slate-500" /> : <Eye size={14} className="text-slate-500" />}
                                </button>
                                <CopyBtn text={newRawKey} />
                            </div>
                            <button onClick={() => { setNewRawKey(null); setShowCreate(false); setNewKeyName(''); }} className="mt-3 text-xs font-semibold text-emerald-700 bg-transparent border-none cursor-pointer underline">
                                I&apos;ve saved it — dismiss
                            </button>
                        </div>
                    )}

                    {/* Create key section */}
                    {!showCreate && !newRawKey && (
                        <button
                            onClick={() => setShowCreate(true)}
                            className="premium-card flex items-center gap-3 cursor-pointer border-dashed transition-colors hover:bg-slate-50"
                            style={{ border: '2px dashed #D1CBC5' }}
                        >
                            <div className="w-9 h-9 rounded-lg bg-gray-900 flex items-center justify-center">
                                <Plus size={16} className="text-white" />
                            </div>
                            <div className="text-left">
                                <div className="text-sm font-bold text-gray-900">Create API Key</div>
                                <div className="text-xs text-slate-500">Generate a key for external integrations or MCP server</div>
                            </div>
                        </button>
                    )}

                    {showCreate && !newRawKey && (
                        <div className="premium-card">
                            <h3 className="text-base font-bold text-gray-900 mb-4">Create New API Key</h3>

                            <div className="flex flex-col gap-4">
                                {/* Name */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Key Name</label>
                                    <input
                                        type="text"
                                        value={newKeyName}
                                        onChange={e => setNewKeyName(e.target.value)}
                                        placeholder="e.g., Claude MCP, Zapier, Internal Script"
                                        className="w-full py-2.5 px-3 rounded-lg border border-slate-200 text-sm text-gray-900 bg-white outline-none"
                                    />
                                </div>

                                {/* Expiry */}
                                <div>
                                    <label className="block text-xs font-semibold text-gray-700 mb-1.5">Expiry</label>
                                    <div className="flex gap-2">
                                        {[
                                            { label: 'Never', value: null },
                                            { label: '30 days', value: 30 },
                                            { label: '90 days', value: 90 },
                                            { label: '1 year', value: 365 },
                                        ].map(opt => (
                                            <button
                                                key={opt.label}
                                                onClick={() => setExpiryDays(opt.value)}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold border cursor-pointer transition-colors"
                                                style={{
                                                    background: expiryDays === opt.value ? '#111827' : '#FFFFFF',
                                                    color: expiryDays === opt.value ? '#FFFFFF' : '#374151',
                                                    borderColor: expiryDays === opt.value ? '#111827' : '#E2E8F0',
                                                }}
                                            >
                                                {opt.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Scopes */}
                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <label className="text-xs font-semibold text-gray-700">Permissions</label>
                                        <button
                                            onClick={() => setSelectedScopes(selectedScopes.length === ALL_SCOPES.length ? [] : [...ALL_SCOPES])}
                                            className="text-[10px] font-semibold text-blue-600 bg-transparent border-none cursor-pointer"
                                        >
                                            {selectedScopes.length === ALL_SCOPES.length ? 'Deselect all' : 'Select all'}
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {SCOPE_GROUPS.map(group => (
                                            <div key={group.label} className="bg-slate-50 rounded-lg p-3">
                                                <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">{group.label}</div>
                                                {group.scopes.map(scope => (
                                                    <label key={scope.value} className="flex items-center gap-2 cursor-pointer mb-1.5 last:mb-0">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedScopes.includes(scope.value)}
                                                            onChange={() => toggleScope(scope.value)}
                                                            className="w-3.5 h-3.5 rounded accent-gray-900"
                                                        />
                                                        <span className="text-xs text-gray-700">{scope.label}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={() => { setShowCreate(false); setNewKeyName(''); }}
                                        className="px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-600 cursor-pointer"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={creating || !newKeyName.trim() || selectedScopes.length === 0}
                                        className="px-5 py-2.5 rounded-lg border-none bg-gray-900 text-white text-sm font-bold cursor-pointer transition-opacity"
                                        style={{ opacity: creating || !newKeyName.trim() || selectedScopes.length === 0 ? 0.5 : 1 }}
                                    >
                                        {creating ? 'Creating...' : 'Create Key'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Active keys */}
                    {loading ? (
                        <LoadingSkeleton type="list" rows={3} />
                    ) : activeKeys.length > 0 ? (
                        <div className="premium-card">
                            <h3 className="text-sm font-bold text-gray-900 mb-4">Active Keys</h3>
                            <div className="flex flex-col gap-3">
                                {activeKeys.map(key => (
                                    <div key={key.id} className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-8 h-8 rounded-lg bg-gray-900 flex items-center justify-center shrink-0">
                                                <Key size={14} className="text-white" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="text-sm font-bold text-gray-900">{key.name}</div>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    <code className="text-[11px] font-mono text-slate-500">{key.key_prefix}</code>
                                                    <span className="text-[10px] text-slate-400">
                                                        {key.scopes.length} {key.scopes.length === 1 ? 'scope' : 'scopes'}
                                                    </span>
                                                    {key.last_used_at && (
                                                        <span className="text-[10px] text-slate-400">
                                                            Last used {new Date(key.last_used_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    )}
                                                    {key.expires_at && (
                                                        <span className="text-[10px] text-amber-600">
                                                            Expires {new Date(key.expires_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRevoke(key)}
                                            disabled={revoking === key.id}
                                            className="p-2 rounded-lg border border-red-200 bg-white text-red-500 cursor-pointer hover:bg-red-50 transition-colors"
                                            title="Revoke key"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : !showCreate && !newRawKey ? (
                        <div className="premium-card text-center py-12">
                            <Key size={32} className="text-slate-300 mx-auto mb-3" />
                            <div className="text-base font-semibold text-gray-700 mb-1">No API keys yet</div>
                            <p className="text-sm text-slate-500 m-0">Create your first API key to start integrating with external tools.</p>
                        </div>
                    ) : null}

                    {/* Revoked keys */}
                    {revokedKeys.length > 0 && (
                        <div className="premium-card">
                            <h3 className="text-sm font-bold text-slate-400 mb-3">Revoked Keys</h3>
                            <div className="flex flex-col gap-2">
                                {revokedKeys.map(key => (
                                    <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 opacity-50">
                                        <Key size={12} className="text-slate-400" />
                                        <span className="text-xs text-slate-500">{key.name}</span>
                                        <code className="text-[10px] font-mono text-slate-400">{key.key_prefix}</code>
                                        <span className="text-[10px] text-red-400 ml-auto">Revoked {new Date(key.revoked_at!).toLocaleDateString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ═══════════ ENDPOINTS TAB ═══════════ */}
            {activeTab === 'endpoints' && (
                <div className="flex flex-col gap-6">
                    {/* Quick start */}
                    <div className="premium-card">
                        <h3 className="text-base font-bold text-gray-900 mb-3">Quick Start</h3>
                        <p className="text-sm text-slate-500 mb-4">All API requests require an API key via the <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">Authorization</code> header.</p>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                            <pre className="text-sm font-mono text-emerald-400 m-0 whitespace-pre">{`curl -H "Authorization: Bearer sk_live_your_key_here" \\
     -H "Content-Type: application/json" \\
     ${typeof window !== 'undefined' ? window.location.origin : 'https://api.superkabe.com'}/api/v1/account`}</pre>
                        </div>
                    </div>

                    {/* Endpoint list */}
                    <div className="premium-card">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Available Endpoints</h3>
                        <div className="flex flex-col gap-1">
                            {ENDPOINTS.map((ep, i) => {
                                const mc = METHOD_COLORS[ep.method] || METHOD_COLORS.GET;
                                return (
                                    <div key={i} className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-slate-50 transition-colors">
                                        <span
                                            className="text-[10px] font-bold rounded px-2 py-0.5 shrink-0 w-14 text-center"
                                            style={{ background: mc.bg, color: mc.text }}
                                        >
                                            {ep.method}
                                        </span>
                                        <code className="text-xs font-mono text-gray-900 flex-1">{ep.path}</code>
                                        <span className="text-xs text-slate-500 hidden md:block">{ep.desc}</span>
                                        <code className="text-[10px] text-slate-400 shrink-0">{ep.scope}</code>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Example payloads */}
                    <div className="premium-card">
                        <h3 className="text-base font-bold text-gray-900 mb-3">Example: Import Leads + Create Campaign</h3>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto">
                            <pre className="text-xs font-mono text-emerald-400 m-0 whitespace-pre">{`# 1. Import leads
curl -X POST /api/v1/leads/bulk \\
  -d '{ "leads": [
    { "email": "john@acme.com", "persona": "cto" },
    { "email": "jane@startup.io", "persona": "founder" }
  ]}'

# 2. Validate them
curl -X POST /api/v1/leads/validate \\
  -d '{ "emails": ["john@acme.com", "jane@startup.io"] }'

# 3. Create campaign with sequence
curl -X POST /api/v1/campaigns \\
  -d '{ "name": "Q2 Outreach",
    "lead_ids": ["lead-id-1", "lead-id-2"],
    "steps": [{
      "subject": "Quick question, {{first_name}}",
      "body_html": "<p>Hi {{first_name}}, ...</p>",
      "delay_days": 0
    }, {
      "subject": "Following up",
      "body_html": "<p>Just bumping this...</p>",
      "delay_days": 3
    }],
    "schedule": { "timezone": "America/New_York",
      "start_time": "09:00", "end_time": "17:00" }
  }'

# 4. Launch it
curl -X POST /api/v1/campaigns/:id/launch

# 5. Check performance
curl /api/v1/campaigns/:id/report`}</pre>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════ MCP SERVER TAB ═══════════ */}
            {activeTab === 'mcp' && (
                <div className="flex flex-col gap-6">
                    {/* What is MCP */}
                    <div className="premium-card" style={{ borderLeft: '6px solid #6366F1' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-indigo-100 rounded-lg flex items-center justify-center">
                                <Cpu size={18} className="text-indigo-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 m-0">Model Context Protocol (MCP)</h3>
                                <p className="text-xs text-slate-500 m-0">Connect Superkabe to Claude and other AI agents</p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-0">
                            MCP lets AI agents like Claude discover and use Superkabe&apos;s API automatically. Once connected, you can manage leads, run campaigns, validate emails, and send replies — all through natural language prompts.
                        </p>
                    </div>

                    {/* Remote MCP — Claude.ai browser */}
                    <div className="premium-card" style={{ borderLeft: '6px solid #10B981' }}>
                        <div className="flex items-center gap-3 mb-3">
                            <div className="w-9 h-9 bg-emerald-100 rounded-lg flex items-center justify-center">
                                <Code size={18} className="text-emerald-600" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 m-0">Connect to Claude.ai (browser)</h3>
                                <p className="text-xs text-slate-500 m-0">
                                    {orgName
                                        ? <>This URL is scoped to <strong>{orgName}</strong>. Paste it into Claude.ai → Settings → Integrations.</>
                                        : <>Paste this URL into Claude.ai → Settings → Integrations.</>}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">
                            In Claude.ai, go to <strong>Settings → Integrations → Add Integration</strong> and paste the URL below. Claude redirects you to a Superkabe consent screen — sign in (if you aren&apos;t already) and click Authorize. The 17 Superkabe tools become available in any conversation.
                        </p>
                        <div className="bg-gray-900 rounded-xl p-4 overflow-x-auto relative">
                            <div className="absolute top-2 right-2">
                                <CopyBtn text={mcpUrl} />
                            </div>
                            <pre className="text-sm font-mono text-emerald-400 m-0 whitespace-pre">{mcpUrl}</pre>
                        </div>
                        {orgSlug && (
                            <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-100">
                                <p className="text-xs text-indigo-900 m-0 leading-relaxed">
                                    <strong>Managing multiple orgs from one Claude.ai account?</strong> Each org has its own URL, so you can add them as separate connectors in Claude (e.g. &quot;Acme&quot;, &quot;Beta&quot;) and pick the right one per conversation. Switching connectors never requires re-authorizing — each holds its own grant.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Setup instructions */}
                    <div className="premium-card">
                        <h3 className="text-base font-bold text-gray-900 mb-1">Setup with Claude Desktop, Code, or Cursor</h3>
                        <p className="text-xs text-slate-500 mb-4">Local clients spawn the MCP server as a stdio process and authenticate with one of your API keys above. <a href="/docs/mcp-server" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">Full Claude / MCP docs →</a></p>
                        <div className="space-y-4">
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">1</div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Create an API key</div>
                                    <p className="text-xs text-slate-500 m-0 mt-1">Go to the API Keys tab above and create a key with all scopes enabled.</p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">2</div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Add to your client config</div>
                                    <p className="text-xs text-slate-500 m-0 mt-1">Same JSON works for Claude Desktop, Claude Code, Cursor, and Continue — only the config-file path differs. <a href="/docs/mcp-server#local-clients" target="_blank" rel="noreferrer" className="text-indigo-600 hover:underline">See client paths →</a></p>
                                    <div className="bg-gray-900 rounded-xl p-4 mt-2 overflow-x-auto relative">
                                        <div className="absolute top-2 right-2">
                                            <CopyBtn text={`{
  "mcpServers": {
    "superkabe": {
      "command": "npx",
      "args": ["-y", "@superkabe/mcp-server"],
      "env": {
        "SUPERKABE_API_KEY": "sk_live_your_key_here",
        "SUPERKABE_API_URL": "${API_BASE}"
      }
    }
  }
}`} />
                                        </div>
                                        <pre className="text-xs font-mono text-emerald-400 m-0 whitespace-pre">{`{
  "mcpServers": {
    "superkabe": {
      "command": "npx",
      "args": ["-y", "@superkabe/mcp-server"],
      "env": {
        "SUPERKABE_API_KEY": "sk_live_your_key_here",
        "SUPERKABE_API_URL": "${API_BASE}"
      }
    }
  }
}`}</pre>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">3</div>
                                <div>
                                    <div className="text-sm font-semibold text-gray-900">Start prompting</div>
                                    <p className="text-xs text-slate-500 m-0 mt-1">Restart Claude Desktop. You can now use prompts like:</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Example prompts */}
                    <div className="premium-card">
                        <h3 className="text-base font-bold text-gray-900 mb-4">Example Prompts</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {[
                                '"Import these 50 leads into Superkabe and validate their emails"',
                                '"Create a 3-step campaign called Q2 Outreach targeting CTOs"',
                                '"Launch the Q2 Outreach campaign"',
                                '"Show me the performance report for Q2 Outreach"',
                                '"What replies did we get on the Q2 campaign?"',
                                '"Reply to John at Acme saying we\'d love to schedule a call"',
                                '"List all my domains and their health status"',
                                '"How many leads have we validated this month?"',
                            ].map((prompt, i) => (
                                <div key={i} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                    <p className="text-xs text-slate-600 m-0 italic">{prompt}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Available tools */}
                    <div className="premium-card">
                        <h3 className="text-base font-bold text-gray-900 mb-3">Tools Available to Claude</h3>
                        <p className="text-xs text-slate-500 mb-4">When connected via MCP, Claude can use these 17 tools. Each tool is gated by the matching scope on your API key — grant only what the agent needs.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {[
                                { tool: 'get_account', desc: 'Check usage, limits, and plan info' },
                                { tool: 'import_leads', desc: 'Import a list of leads into Superkabe' },
                                { tool: 'list_leads', desc: 'Search and filter your lead database' },
                                { tool: 'get_lead', desc: 'Get full details for a single lead by ID' },
                                { tool: 'validate_leads', desc: 'Run email validation on leads' },
                                { tool: 'get_validation_results', desc: 'Org-wide validation breakdown by status' },
                                { tool: 'create_campaign', desc: 'Create a campaign with email sequence' },
                                { tool: 'list_campaigns', desc: 'List all campaigns with status + counts' },
                                { tool: 'get_campaign', desc: 'Get full campaign incl. steps and leads' },
                                { tool: 'update_campaign', desc: 'Edit campaign name, schedule, daily limit' },
                                { tool: 'launch_campaign', desc: 'Start sending a campaign' },
                                { tool: 'pause_campaign', desc: 'Pause an active campaign' },
                                { tool: 'get_campaign_report', desc: 'Get opens, clicks, replies, bounces' },
                                { tool: 'get_campaign_replies', desc: 'List replies from a campaign' },
                                { tool: 'send_reply', desc: 'Reply to a lead from a connected mailbox' },
                                { tool: 'list_mailboxes', desc: 'View mailbox health and status' },
                                { tool: 'list_domains', desc: 'View domain health and reputation' },
                            ].map(t => (
                                <div key={t.tool} className="flex items-center gap-2.5 py-2 px-3 rounded-lg hover:bg-slate-50">
                                    <code className="text-[11px] font-mono text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded shrink-0">{t.tool}</code>
                                    <span className="text-xs text-slate-500">{t.desc}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
            {/* Mount the revoke confirmation modal only when there's a
                target. Always-mounting with optional-chained props
                (revokeTarget?.name / revokeTarget?.id) was the suspected
                source of a `ReferenceError: _ref is not defined` thrown
                during prod render — Next 16 + Turbopack emits destructured-
                param wrappers that can mis-handle nullable prop reads
                routed through forwardRef children. Conditional mount sidesteps
                the null path entirely. */}
            {revokeTarget && (
                <ConfirmActionModal
                    isOpen={true}
                    title="Revoke API key"
                    icon="🔑"
                    message={`Revoke "${revokeTarget.name}"? Any integrations using this key will stop working immediately.`}
                    consequences={[
                        'All requests using this key will return 401',
                        'Connected MCP clients (Claude, ChatGPT) will lose access',
                        'This action cannot be undone',
                    ]}
                    confirmLabel="Revoke key"
                    variant="danger"
                    loading={revoking === revokeTarget.id}
                    onConfirm={confirmRevoke}
                    onCancel={() => setRevokeTarget(null)}
                />
            )}
        </div>
    );
}
