'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import { logout as serverLogout } from '@/lib/api';

interface OrgSummary {
    id: string;
    name: string;
    slug: string;
    system_mode: string;
    subscription_tier: string;
    subscription_status: string;
    created_at: string;
    trial_ends_at: string | null;
    _count: { users: number; campaigns: number; mailboxes: number; domains: number; leads: number };
}

interface ImpactReport {
    organization: { name: string; slug: string; system_mode: string; subscription_tier: string; created_at: string };
    infrastructure: { totalMailboxes: number; totalDomains: number; totalCampaigns: number; totalLeads: number };
    protectionActions: {
        mailboxesPaused: number; mailboxesHealed: number; leadsBlocked: number;
        leadsValidated: number; invalidLeadsBlocked: number; campaignsPaused: number; domainsPaused: number;
    };
    bounceStats: { totalHardBounces: number; totalSoftBounces: number };
    inRecovery: number;
    healthDistribution: { status: string; _count: number }[];
    domainHealthDistribution: { status: string; _count: number }[];
    leadDistribution: { status: string; _count: number }[];
    recentActions: { id: string; entity: string; entity_id: string; action: string; trigger: string; details: string; timestamp: string }[];
}

const STATUS_COLORS: Record<string, string> = {
    healthy: '#22c55e', active: '#22c55e', warning: '#f59e0b', paused: '#ef4444',
    quarantine: '#f97316', restricted_send: '#3b82f6', warm_recovery: '#8b5cf6',
    held: '#6b7280', bounced: '#ef4444', invalid: '#dc2626', blocked: '#991b1b',
    completed: '#06b6d4', deleted: '#9ca3af',
};

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    trial: { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    starter: { bg: '#EFF6FF', text: '#1E40AF', border: '#BFDBFE' },
    growth: { bg: '#F0FDF4', text: '#166534', border: '#BBF7D0' },
    scale: { bg: '#F5F3FF', text: '#5B21B6', border: '#DDD6FE' },
    enterprise: { bg: '#111827', text: '#F9FAFB', border: '#374151' },
};

export default function AdminConsole() {
    const router = useRouter();
    const [orgs, setOrgs] = useState<OrgSummary[]>([]);
    const [selectedOrg, setSelectedOrg] = useState<OrgSummary | null>(null);
    const [report, setReport] = useState<ImpactReport | null>(null);
    const [loading, setLoading] = useState(true);
    const [reportLoading, setReportLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [csvLoading, setCsvLoading] = useState(false);

    const fetchOrgs = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await apiClient<OrgSummary[]>('/api/admin/organizations');
            if (Array.isArray(data)) setOrgs(data);
            else setError('Failed to load organizations');
        } catch (err: any) {
            if (err?.message?.includes('403') || err?.message?.includes('401')) {
                setError('Access denied. Super admin role required.');
            } else {
                setError('Failed to connect to server');
            }
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchOrgs(); }, [fetchOrgs]);

    const selectOrg = async (org: OrgSummary) => {
        setSelectedOrg(org);
        setReportLoading(true);
        try {
            const data = await apiClient<ImpactReport>(`/api/admin/organizations/${org.id}/impact`);
            setReport(data);
        } catch {
            setReport(null);
        } finally {
            setReportLoading(false);
        }
    };

    const downloadCsv = async () => {
        if (!selectedOrg) return;
        setCsvLoading(true);
        try {
            const token = document.cookie.split('; ').find(c => c.startsWith('token='))?.split('=')[1];
            const res = await fetch(`/api/admin/organizations/${selectedOrg.id}/impact/csv`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok) throw new Error('Download failed');
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `superkabe-impact-report-${selectedOrg.slug}-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('CSV download failed:', err);
        } finally {
            setCsvLoading(false);
        }
    };

    const handleLogout = async () => {
        await serverLogout();
        router.push('/login');
    };

    const tierStyle = (tier: string) => TIER_COLORS[tier] || TIER_COLORS.trial;

    // Health bar component
    const HealthBar = ({ data, label }: { data: { status: string; _count: number }[]; label: string }) => {
        const total = data.reduce((s, d) => s + d._count, 0);
        if (total === 0) return null;
        return (
            <div>
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{label}</div>
                <div className="flex h-6 rounded-lg overflow-hidden">
                    {data.map(d => (
                        <div key={d.status} style={{ width: `${(d._count / total) * 100}%`, backgroundColor: STATUS_COLORS[d.status] || '#9ca3af' }} title={`${d.status}: ${d._count}`} />
                    ))}
                </div>
                <div className="flex flex-wrap gap-3 mt-2">
                    {data.map(d => (
                        <div key={d.status} className="flex items-center gap-1.5 text-xs text-gray-600">
                            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: STATUS_COLORS[d.status] || '#9ca3af' }} />
                            {d.status}: <strong>{d._count}</strong>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0f0f1a] text-gray-100">
            {/* Top Bar */}
            <header className="sticky top-0 z-50 bg-[#0f0f1a]/95 backdrop-blur-xl border-b border-white/5">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image src="/image/logo-v2.png" alt="Superkabe" width={28} height={28} />
                        <span className="font-bold text-white text-lg">Superkabe</span>
                        <span className="px-2 py-0.5 rounded-md bg-violet-500/20 text-violet-300 text-[0.65rem] font-bold uppercase tracking-wider border border-violet-500/30">Admin Console</span>
                    </div>
                    <div className="flex items-center gap-4">
                        {selectedOrg && (
                            <button onClick={() => { setSelectedOrg(null); setReport(null); }} className="text-xs text-gray-400 hover:text-white transition-colors">
                                &larr; All Organizations
                            </button>
                        )}
                        <button onClick={handleLogout} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-medium text-gray-400 hover:text-white hover:bg-white/10 transition-all">
                            Log Out
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 py-6">
                {/* Error State */}
                {error && (
                    <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6 text-center">
                        <div className="text-red-400 font-semibold mb-2">{error}</div>
                        <button onClick={fetchOrgs} className="text-xs text-red-300 underline">Retry</button>
                    </div>
                )}

                {/* Loading State */}
                {loading && !error && (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                )}

                {/* ── ORGANIZATION LIST ── */}
                {!loading && !error && !selectedOrg && (
                    <>
                        <div className="mb-6">
                            <h1 className="text-2xl font-bold text-white">Organizations</h1>
                            <p className="text-sm text-gray-500 mt-1">{orgs.length} customer{orgs.length !== 1 ? 's' : ''} across the platform</p>
                        </div>

                        {/* Summary Cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">{orgs.length}</div>
                                <div className="text-xs text-gray-500 mt-1">Organizations</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">{orgs.reduce((s, o) => s + o._count.mailboxes, 0)}</div>
                                <div className="text-xs text-gray-500 mt-1">Total Mailboxes</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">{orgs.reduce((s, o) => s + o._count.domains, 0)}</div>
                                <div className="text-xs text-gray-500 mt-1">Total Domains</div>
                            </div>
                            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
                                <div className="text-2xl font-bold text-white">{orgs.reduce((s, o) => s + o._count.leads, 0).toLocaleString()}</div>
                                <div className="text-xs text-gray-500 mt-1">Total Leads</div>
                            </div>
                        </div>

                        {/* Org Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {orgs.map(org => {
                                const ts = tierStyle(org.subscription_tier);
                                return (
                                    <div
                                        key={org.id}
                                        onClick={() => selectOrg(org)}
                                        className="bg-white/[0.03] border border-white/10 rounded-xl p-5 cursor-pointer hover:bg-white/[0.06] hover:border-violet-500/30 transition-all group"
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div>
                                                <div className="font-bold text-white group-hover:text-violet-300 transition-colors">{org.name}</div>
                                                <div className="text-xs text-gray-500">{org.slug}</div>
                                            </div>
                                            <span className="px-2 py-0.5 rounded-md text-[0.65rem] font-bold uppercase" style={{ backgroundColor: ts.bg, color: ts.text, border: `1px solid ${ts.border}` }}>
                                                {org.subscription_tier}
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-5 gap-2 text-center">
                                            {[
                                                { label: 'Users', val: org._count.users },
                                                { label: 'Campaigns', val: org._count.campaigns },
                                                { label: 'Mailboxes', val: org._count.mailboxes },
                                                { label: 'Domains', val: org._count.domains },
                                                { label: 'Leads', val: org._count.leads },
                                            ].map(s => (
                                                <div key={s.label}>
                                                    <div className="text-sm font-bold text-gray-300">{s.val}</div>
                                                    <div className="text-[0.6rem] text-gray-600">{s.label}</div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                                            <span className="text-[0.65rem] text-gray-600">Mode: <strong className="text-gray-400">{org.system_mode}</strong></span>
                                            <span className="text-[0.65rem] text-gray-600">Since {new Date(org.created_at).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </>
                )}

                {/* ── IMPACT REPORT ── */}
                {selectedOrg && (
                    <>
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h1 className="text-2xl font-bold text-white">{selectedOrg.name}</h1>
                                <p className="text-sm text-gray-500 mt-1">Impact report and infrastructure overview</p>
                            </div>
                            <button
                                onClick={downloadCsv}
                                disabled={csvLoading || !report}
                                className="px-4 py-2 rounded-lg bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                {csvLoading ? (
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : '📥'}
                                Download Report
                            </button>
                        </div>

                        {reportLoading ? (
                            <div className="flex items-center justify-center py-20">
                                <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : report ? (
                            <div className="space-y-5">
                                {/* Hero Stats */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[
                                        { label: 'Mailboxes Protected', value: report.infrastructure.totalMailboxes, color: '#3b82f6' },
                                        { label: 'Domains Monitored', value: report.infrastructure.totalDomains, color: '#8b5cf6' },
                                        { label: 'Leads Validated', value: report.protectionActions.leadsValidated, color: '#22c55e' },
                                        { label: 'Invalid Leads Blocked', value: report.protectionActions.invalidLeadsBlocked, color: '#ef4444' },
                                    ].map(s => (
                                        <div key={s.label} className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                                            <div className="text-3xl font-bold" style={{ color: s.color }}>{s.value.toLocaleString()}</div>
                                            <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                                        </div>
                                    ))}
                                </div>

                                {/* Protection Actions + Bounce Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                                        <h2 className="text-sm font-bold text-white mb-4">Protection Actions Taken</h2>
                                        <div className="space-y-3">
                                            {[
                                                { label: 'Mailboxes Auto-Paused', value: report.protectionActions.mailboxesPaused, icon: '⏸️' },
                                                { label: 'Mailboxes Healed', value: report.protectionActions.mailboxesHealed, icon: '🩺' },
                                                { label: 'Campaigns Paused', value: report.protectionActions.campaignsPaused, icon: '🚫' },
                                                { label: 'Domains Paused', value: report.protectionActions.domainsPaused, icon: '🌐' },
                                                { label: 'Leads Blocked', value: report.protectionActions.leadsBlocked, icon: '🛡️' },
                                                { label: 'Currently In Recovery', value: report.inRecovery, icon: '🔄' },
                                            ].map(a => (
                                                <div key={a.label} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                                                    <span className="text-sm text-gray-400 flex items-center gap-2"><span>{a.icon}</span>{a.label}</span>
                                                    <span className="text-sm font-bold text-white">{a.value}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                                            <h2 className="text-sm font-bold text-white mb-4">Bounce Prevention</h2>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <div className="text-2xl font-bold text-red-400">{report.bounceStats.totalHardBounces}</div>
                                                    <div className="text-xs text-gray-500">Hard Bounces Caught</div>
                                                </div>
                                                <div>
                                                    <div className="text-2xl font-bold text-amber-400">{report.bounceStats.totalSoftBounces}</div>
                                                    <div className="text-xs text-gray-500">Soft Bounces Detected</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                                            <h2 className="text-sm font-bold text-white mb-4">Infrastructure Overview</h2>
                                            <div className="grid grid-cols-2 gap-4">
                                                {[
                                                    { label: 'Campaigns', value: report.infrastructure.totalCampaigns },
                                                    { label: 'Total Leads', value: report.infrastructure.totalLeads },
                                                ].map(s => (
                                                    <div key={s.label}>
                                                        <div className="text-2xl font-bold text-gray-200">{s.value.toLocaleString()}</div>
                                                        <div className="text-xs text-gray-500">{s.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Health Distribution */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                                        <HealthBar data={report.healthDistribution} label="Mailbox Health" />
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                                        <HealthBar data={report.domainHealthDistribution} label="Domain Health" />
                                    </div>
                                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                                        <HealthBar data={report.leadDistribution} label="Lead Status" />
                                    </div>
                                </div>

                                {/* Recent Actions */}
                                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-5">
                                    <h2 className="text-sm font-bold text-white mb-4">Recent System Actions</h2>
                                    <div className="max-h-[400px] overflow-y-auto space-y-1">
                                        {report.recentActions.map(a => (
                                            <div key={a.id} className="flex items-start gap-3 py-2 border-b border-white/5 last:border-0">
                                                <div className="text-[0.65rem] text-gray-600 whitespace-nowrap pt-0.5 min-w-[110px]">
                                                    {new Date(a.timestamp).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="px-1.5 py-0.5 rounded text-[0.6rem] font-bold uppercase bg-white/10 text-gray-400">{a.entity}</span>
                                                        <span className="text-xs font-semibold text-gray-300">{a.action}</span>
                                                    </div>
                                                    {a.details && <div className="text-[0.7rem] text-gray-600 mt-0.5 truncate">{a.details}</div>}
                                                </div>
                                            </div>
                                        ))}
                                        {report.recentActions.length === 0 && (
                                            <div className="text-center py-8 text-gray-600 text-sm italic">No actions recorded yet</div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-20 text-gray-600">Failed to load report</div>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
