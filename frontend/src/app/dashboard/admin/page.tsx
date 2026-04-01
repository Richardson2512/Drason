'use client';

import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';

// ---- Types ----

interface OrgSummary {
    id: string;
    name: string;
    tier: string;
    status: string;
    created_at: string;
    counts: {
        users: number;
        campaigns: number;
        mailboxes: number;
        domains: number;
        leads: number;
    };
}

interface HeroStats {
    mailboxes_protected: number;
    domains_monitored: number;
    leads_validated: number;
    invalid_leads_blocked: number;
}

interface ProtectionActions {
    mailboxes_auto_paused: number;
    mailboxes_healed: number;
    campaigns_paused: number;
    domains_paused: number;
    leads_blocked: number;
}

interface HealthDistribution {
    mailbox_health: Record<string, number>;
    lead_status: Record<string, number>;
}

interface AuditEntry {
    id: string;
    timestamp: string;
    entity_type: string;
    entity_id: string;
    action: string;
    details: string;
}

interface ImpactReport {
    hero: HeroStats;
    protection_actions: ProtectionActions;
    health_distribution: HealthDistribution;
    recent_actions: AuditEntry[];
}

// ---- Color Maps ----

const TIER_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    trial:   { bg: '#FEF3C7', text: '#92400E', border: '#FDE68A' },
    starter: { bg: '#DBEAFE', text: '#1E40AF', border: '#93C5FD' },
    growth:  { bg: '#D1FAE5', text: '#065F46', border: '#6EE7B7' },
    scale:   { bg: '#EDE9FE', text: '#5B21B6', border: '#C4B5FD' },
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
    active:   { bg: '#D1FAE5', text: '#065F46' },
    inactive: { bg: '#FEE2E2', text: '#991B1B' },
    suspended:{ bg: '#FEF3C7', text: '#92400E' },
};

const MAILBOX_HEALTH_COLORS: Record<string, string> = {
    healthy:          '#10B981',
    warning:          '#F59E0B',
    paused:           '#EF4444',
    quarantine:       '#7C3AED',
    restricted_send:  '#F97316',
    warm_recovery:    '#3B82F6',
};

const LEAD_STATUS_COLORS: Record<string, string> = {
    active:    '#10B981',
    held:      '#F59E0B',
    paused:    '#F97316',
    bounced:   '#EF4444',
    invalid:   '#991B1B',
    completed: '#6366F1',
};

// ---- Helpers ----

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
    });
}

function formatTimestamp(dateStr: string): string {
    return new Date(dateStr).toLocaleString('en-US', {
        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
}

function Badge({ label, bg, text, border }: { label: string; bg: string; text: string; border?: string }) {
    return (
        <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-bold uppercase tracking-wider"
            style={{ background: bg, color: text, border: border ? `1px solid ${border}` : undefined }}
        >
            {label}
        </span>
    );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
    return (
        <div className="premium-card flex flex-col items-center justify-center p-5 rounded-2xl text-center" style={{
            background: 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(139,92,246,0.06) 100%)',
            border: '1px solid rgba(99,102,241,0.12)',
        }}>
            <span className="text-2xl mb-1">{icon}</span>
            <span className="text-[2rem] font-extrabold text-gray-900 leading-none">{value.toLocaleString()}</span>
            <span className="text-[0.75rem] text-gray-500 mt-1 font-medium">{label}</span>
        </div>
    );
}

function HealthBar({ data, colorMap }: { data: Record<string, number>; colorMap: Record<string, string> }) {
    const total = Object.values(data).reduce((a, b) => a + b, 0);
    if (total === 0) return <p className="text-[0.8rem] text-gray-400 italic">No data</p>;

    return (
        <div className="flex flex-col gap-2">
            {/* Stacked bar */}
            <div className="flex h-5 rounded-full overflow-hidden" style={{ background: '#F3F4F6' }}>
                {Object.entries(data).map(([status, count]) => {
                    const pct = (count / total) * 100;
                    if (pct === 0) return null;
                    return (
                        <div
                            key={status}
                            title={`${status}: ${count} (${pct.toFixed(1)}%)`}
                            style={{
                                width: `${pct}%`,
                                background: colorMap[status] || '#9CA3AF',
                                minWidth: pct > 0 ? '4px' : 0,
                            }}
                        />
                    );
                })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-3 mt-1">
                {Object.entries(data).map(([status, count]) => (
                    <div key={status} className="flex items-center gap-1.5 text-[0.7rem] text-gray-600">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: colorMap[status] || '#9CA3AF' }} />
                        <span className="capitalize">{status.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-gray-800">{count}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

// ---- Main Component ----

export default function AdminDashboardPage() {
    const [orgs, setOrgs] = useState<OrgSummary[]>([]);
    const [orgsLoading, setOrgsLoading] = useState(true);
    const [orgsError, setOrgsError] = useState('');
    const [selectedOrgId, setSelectedOrgId] = useState<string | null>(null);
    const [impact, setImpact] = useState<ImpactReport | null>(null);
    const [impactLoading, setImpactLoading] = useState(false);
    const [impactError, setImpactError] = useState('');
    const [csvDownloading, setCsvDownloading] = useState(false);

    // Fetch organizations
    useEffect(() => {
        setOrgsLoading(true);
        apiClient<{ organizations: OrgSummary[]; platformStats: any }>('/api/admin/organizations')
            .then(data => {
                const orgs = Array.isArray(data) ? data : (data?.organizations || []);
                setOrgs(orgs as OrgSummary[]);
                setOrgsError('');
            })
            .catch(err => setOrgsError(err.message || 'Failed to load organizations'))
            .finally(() => setOrgsLoading(false));
    }, []);

    // Fetch impact report when org is selected
    useEffect(() => {
        if (!selectedOrgId) {
            setImpact(null);
            return;
        }
        setImpactLoading(true);
        setImpactError('');
        apiClient<ImpactReport>(`/api/admin/organizations/${selectedOrgId}/impact`)
            .then(data => {
                setImpact(data);
                setImpactError('');
            })
            .catch(err => setImpactError(err.message || 'Failed to load impact report'))
            .finally(() => setImpactLoading(false));
    }, [selectedOrgId]);

    // CSV download
    const handleDownloadCsv = useCallback(async () => {
        if (!selectedOrgId) return;
        setCsvDownloading(true);
        try {
            const response = await fetch(`/api/admin/organizations/${selectedOrgId}/impact/csv`, {
                credentials: 'include',
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || `Request failed with status ${response.status}`);
            }
            const blob = await response.blob();
            const disposition = response.headers.get('content-disposition') || '';
            const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
            const filename = filenameMatch?.[1] || `impact-report-${selectedOrgId}.csv`;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('CSV download failed:', err);
        } finally {
            setCsvDownloading(false);
        }
    }, [selectedOrgId]);

    const selectedOrg = orgs.find(o => o.id === selectedOrgId);

    return (
        <div className="p-8 space-y-8 max-w-[1400px] mx-auto">
            {/* Page Header */}
            <div>
                <h1 className="text-[2.25rem] font-bold text-gray-900 tracking-tight">Admin Dashboard</h1>
                <p className="text-lg text-gray-500 mt-1">Cross-organization management and impact reports</p>
            </div>

            {/* Organization List */}
            <section>
                <h2 className="text-[1rem] font-bold text-gray-700 mb-4 uppercase tracking-wide">Organizations</h2>
                {orgsLoading && (
                    <div className="flex items-center gap-2 text-gray-400 text-sm py-8 justify-center">
                        <span className="animate-spin inline-block w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
                        Loading organizations...
                    </div>
                )}
                {orgsError && (
                    <div className="rounded-xl p-4 text-sm text-red-700 border border-red-200" style={{ background: '#FEF2F2' }}>
                        {orgsError}
                    </div>
                )}
                {!orgsLoading && !orgsError && orgs.length === 0 && (
                    <p className="text-gray-400 text-sm italic">No organizations found.</p>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {orgs.map(org => {
                        const tier = TIER_COLORS[org.tier] || TIER_COLORS.trial;
                        const status = STATUS_COLORS[org.status] || STATUS_COLORS.active;
                        const isSelected = selectedOrgId === org.id;
                        return (
                            <div
                                key={org.id}
                                onClick={() => setSelectedOrgId(isSelected ? null : org.id)}
                                className="cursor-pointer rounded-2xl p-5 transition-all duration-200"
                                style={{
                                    background: isSelected
                                        ? 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.10) 100%)'
                                        : 'white',
                                    border: isSelected
                                        ? '2px solid rgba(99,102,241,0.4)'
                                        : '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: isSelected
                                        ? '0 4px 20px rgba(99,102,241,0.15)'
                                        : '0 1px 3px rgba(0,0,0,0.04)',
                                }}
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-[0.95rem] font-bold text-gray-900 leading-snug">{org.name}</h3>
                                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                                        <Badge label={org.tier} bg={tier.bg} text={tier.text} border={tier.border} />
                                        <Badge label={org.status} bg={status.bg} text={status.text} />
                                    </div>
                                </div>
                                <p className="text-[0.7rem] text-gray-400 mb-3">Created {formatDate(org.created_at)}</p>
                                <div className="grid grid-cols-5 gap-2">
                                    {[
                                        { label: 'Users', value: org.counts.users },
                                        { label: 'Campaigns', value: org.counts.campaigns },
                                        { label: 'Mailboxes', value: org.counts.mailboxes },
                                        { label: 'Domains', value: org.counts.domains },
                                        { label: 'Leads', value: org.counts.leads },
                                    ].map(item => (
                                        <div key={item.label} className="text-center">
                                            <div className="text-[1.1rem] font-extrabold text-gray-800">{item.value.toLocaleString()}</div>
                                            <div className="text-[0.6rem] text-gray-400 uppercase tracking-wider font-medium">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* Impact Report Panel */}
            {selectedOrgId && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-[1.2rem] font-bold text-gray-800">
                                Impact Report{selectedOrg ? ` — ${selectedOrg.name}` : ''}
                            </h2>
                            <p className="text-[0.8rem] text-gray-400 mt-0.5">Protection metrics and activity for this organization</p>
                        </div>
                        <button
                            onClick={handleDownloadCsv}
                            disabled={csvDownloading || impactLoading}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-[0.8rem] font-semibold text-white transition-all duration-200 disabled:opacity-50"
                            style={{
                                background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                            }}
                        >
                            {csvDownloading ? (
                                <>
                                    <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full" />
                                    Downloading...
                                </>
                            ) : (
                                <>Download Report (CSV)</>
                            )}
                        </button>
                    </div>

                    {impactLoading && (
                        <div className="flex items-center gap-2 text-gray-400 text-sm py-12 justify-center">
                            <span className="animate-spin inline-block w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full" />
                            Loading impact report...
                        </div>
                    )}

                    {impactError && (
                        <div className="rounded-xl p-4 text-sm text-red-700 border border-red-200" style={{ background: '#FEF2F2' }}>
                            {impactError}
                        </div>
                    )}

                    {impact && !impactLoading && (
                        <div className="space-y-6">
                            {/* Hero Stats Row */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <StatCard icon="📫" label="Mailboxes Protected" value={impact.hero.mailboxes_protected} />
                                <StatCard icon="🌐" label="Domains Monitored" value={impact.hero.domains_monitored} />
                                <StatCard icon="✅" label="Leads Validated" value={impact.hero.leads_validated} />
                                <StatCard icon="🚫" label="Invalid Leads Blocked" value={impact.hero.invalid_leads_blocked} />
                            </div>

                            {/* Protection Actions Card */}
                            <div className="rounded-2xl p-6" style={{
                                background: 'white',
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                                <h3 className="text-[0.85rem] font-bold text-gray-700 uppercase tracking-wide mb-4">Protection Actions</h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {[
                                        { label: 'Mailboxes Auto-Paused', value: impact.protection_actions.mailboxes_auto_paused, color: '#EF4444' },
                                        { label: 'Mailboxes Healed', value: impact.protection_actions.mailboxes_healed, color: '#10B981' },
                                        { label: 'Campaigns Paused', value: impact.protection_actions.campaigns_paused, color: '#F59E0B' },
                                        { label: 'Domains Paused', value: impact.protection_actions.domains_paused, color: '#7C3AED' },
                                        { label: 'Leads Blocked', value: impact.protection_actions.leads_blocked, color: '#991B1B' },
                                    ].map(item => (
                                        <div key={item.label} className="text-center">
                                            <div className="text-[1.5rem] font-extrabold" style={{ color: item.color }}>
                                                {item.value.toLocaleString()}
                                            </div>
                                            <div className="text-[0.7rem] text-gray-500 mt-0.5 font-medium">{item.label}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Health Distribution */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="rounded-2xl p-6" style={{
                                    background: 'white',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                }}>
                                    <h3 className="text-[0.85rem] font-bold text-gray-700 uppercase tracking-wide mb-4">Mailbox Health</h3>
                                    <HealthBar data={impact.health_distribution.mailbox_health} colorMap={MAILBOX_HEALTH_COLORS} />
                                </div>
                                <div className="rounded-2xl p-6" style={{
                                    background: 'white',
                                    border: '1px solid rgba(0,0,0,0.06)',
                                    boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                }}>
                                    <h3 className="text-[0.85rem] font-bold text-gray-700 uppercase tracking-wide mb-4">Lead Status</h3>
                                    <HealthBar data={impact.health_distribution.lead_status} colorMap={LEAD_STATUS_COLORS} />
                                </div>
                            </div>

                            {/* Recent Actions Timeline */}
                            <div className="rounded-2xl p-6" style={{
                                background: 'white',
                                border: '1px solid rgba(0,0,0,0.06)',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                            }}>
                                <h3 className="text-[0.85rem] font-bold text-gray-700 uppercase tracking-wide mb-4">Recent Actions</h3>
                                {impact.recent_actions.length === 0 ? (
                                    <p className="text-[0.8rem] text-gray-400 italic">No recent actions recorded.</p>
                                ) : (
                                    <div className="max-h-[400px] overflow-y-auto space-y-0 divide-y divide-gray-100">
                                        {impact.recent_actions.map(entry => (
                                            <div key={entry.id} className="flex items-start gap-4 py-3 first:pt-0 last:pb-0">
                                                <div className="text-[0.7rem] text-gray-400 whitespace-nowrap pt-0.5 min-w-[110px]">
                                                    {formatTimestamp(entry.timestamp)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="text-[0.7rem] font-bold text-indigo-600 uppercase tracking-wider">
                                                            {entry.entity_type}
                                                        </span>
                                                        <span className="text-[0.75rem] font-semibold text-gray-800">
                                                            {entry.action}
                                                        </span>
                                                    </div>
                                                    {entry.details && (
                                                        <p className="text-[0.7rem] text-gray-500 mt-0.5 truncate">{entry.details}</p>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
