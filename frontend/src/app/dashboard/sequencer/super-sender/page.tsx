'use client';

import { useEffect, useMemo, useState } from 'react';
import {
    Zap, Shield, CheckCircle2, ExternalLink, Server, Lock, BarChart3, AlertCircle,
    Search as SearchIcon, X as XIcon, Loader2, Flame, Power, ArrowRight,
} from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

/**
 * Super Sender - dedicated IP product page.
 *
 * Two distinct surfaces depending on account state:
 *
 *   PRE-PURCHASE: Marketing pitch + Get Started CTA. CTA opens the
 *   workspace picker modal in agency mode (>1 workspace), or jumps
 *   straight to Polar checkout for single-workspace users. Tier gate
 *   surfaces a soft block for trial users.
 *
 *   POST-PURCHASE: One card per workspace showing IP state. Five
 *   states drive the card UI:
 *     pending_payment | provisioning | warming | active | failed
 *   Plus a "Pending IPs" inbox at the top listing IPs that haven't
 *   been allocated to a workspace yet.
 *
 * The page polls /api/super-sender every 10s while any IP is in a
 * non-terminal state so users see provisioning → warming → active
 * progress without manual refresh.
 */

const POLL_INTERVAL_MS = 10_000;

// ────────────────────────────────────────────────────────────────────
// Types - mirrors the controller response. Keep field names matching
// what `superSenderController.ts` emits.
// ────────────────────────────────────────────────────────────────────

interface DedicatedIp {
    id: string;
    organization_id: string | null;
    workspace_name: string | null;
    state: 'pending_payment' | 'provisioning' | 'warming' | 'active' | 'failed' | 'canceled';
    ses_pool_name: string | null;
    ses_ip_address: string | null;
    warmup_day: number;
    daily_cap: number;
    sends_today: number;
    sends_reset_at: string;
    bounce_count_24h: number;
    complaint_count_24h: number;
    delivered_count_24h: number;
    paused_reason: string | null;
    paused_at: string | null;
    activated_at: string | null;
    warmup_completed_at: string | null;
    canceled_at: string | null;
    last_error: string | null;
    polar_subscription_id: string | null;
    created_at: string;
}

interface MailboxRouting {
    ip_state: string;
    ip_paused: boolean;
    eligible: { id: string; email: string; provider: string }[];
    native_only: { id: string; email: string; provider: string; status: string }[];
}

interface WorkspaceRow {
    id: string;
    name: string;
    slug: string;
    has_ip: boolean;
}

interface OverviewSummary {
    has_any_ip: boolean;
    agency_mode: boolean;
    can_purchase: boolean;
    purchase_blocked_reason: string | null;
    price_per_ip_usd: number;
    reassign_cooldown_hours: number;
}

interface OverviewData {
    summary: OverviewSummary;
    ips: DedicatedIp[];
    workspaces: WorkspaceRow[];
}

// ────────────────────────────────────────────────────────────────────

async function fetchOverview(): Promise<OverviewData | null> {
    const res = await fetch('/api/super-sender', { credentials: 'include' });
    if (!res.ok) return null;
    const json = await res.json();
    return json?.data ?? null;
}

export default function SuperSenderPage() {
    const [data, setData] = useState<OverviewData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [pickerOpen, setPickerOpen] = useState(false);
    const [actionMsg, setActionMsg] = useState<string | null>(null);

    // Initial load + polling. Poll only while at least one IP is in a
    // non-terminal state - once everything is `active` or `failed` /
    // `canceled` we stop hitting the endpoint.
    useEffect(() => {
        let cancelled = false;
        let timer: ReturnType<typeof setInterval> | null = null;

        const load = async () => {
            const fresh = await fetchOverview();
            if (cancelled) return;
            if (fresh) {
                setData(fresh);
                setError(null);
            } else {
                setError('Could not load Super Sender state');
            }
            setLoading(false);
        };

        const poll = () => {
            if (cancelled) return;
            const hasInFlight = data?.ips?.some(ip =>
                ip.state === 'pending_payment' || ip.state === 'provisioning' || ip.state === 'warming',
            );
            if (hasInFlight) load();
        };

        load();
        timer = setInterval(poll, POLL_INTERVAL_MS);
        return () => {
            cancelled = true;
            if (timer) clearInterval(timer);
        };
        // We intentionally re-create the polling loop when `data` changes -
        // the in-flight check needs the latest snapshot.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data?.ips?.map(i => i.state).join(',')]);

    if (loading) {
        return (
            <div className="p-6 md:p-8 flex items-center gap-3 text-gray-500">
                <Loader2 size={16} className="animate-spin" />
                <span>Loading Super Sender…</span>
            </div>
        );
    }
    if (error || !data) {
        return (
            <div className="p-6 md:p-8">
                <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800 text-sm">
                    {error || 'Failed to load Super Sender'}
                </div>
            </div>
        );
    }

    const { summary, ips, workspaces } = data;
    const isAgency = summary.agency_mode && workspaces.length > 1;

    // Pre-purchase view - marketing landing.
    if (!summary.has_any_ip) {
        return (
            <>
                <PrePurchaseView
                    summary={summary}
                    isAgency={isAgency}
                    onGetStarted={() => {
                        if (isAgency) {
                            setPickerOpen(true);
                        } else {
                            // Single-workspace shortcut - checkout for 1 IP, no
                            // pre-allocation (the lone workspace gets it
                            // automatically once SES provisions).
                            startCheckout({ quantity: 1, workspaceIds: [workspaces[0]?.id].filter(Boolean) as string[] })
                                .then(({ url }) => { if (url) window.location.href = url; })
                                .catch(err => setError(err.message));
                        }
                    }}
                />
                {pickerOpen && (
                    <WorkspacePickerModal
                        workspaces={workspaces}
                        pricePerIpUsd={summary.price_per_ip_usd}
                        onClose={() => setPickerOpen(false)}
                        onConfirm={async (selectedIds) => {
                            try {
                                const { url } = await startCheckout({
                                    quantity: selectedIds.length,
                                    workspaceIds: selectedIds,
                                });
                                if (url) window.location.href = url;
                            } catch (err) {
                                setError((err as Error)?.message || 'Checkout failed');
                                setPickerOpen(false);
                            }
                        }}
                    />
                )}
            </>
        );
    }

    // Post-purchase view - cards per workspace + pending inbox.
    const pendingPool = ips.filter(ip => !ip.organization_id && ip.state !== 'canceled');
    const allocatedByWorkspace = new Map<string, DedicatedIp>();
    for (const ip of ips) {
        if (ip.organization_id) allocatedByWorkspace.set(ip.organization_id, ip);
    }

    return (
        <>
            <div className="p-6 md:p-8">
                <header className="mb-6">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 m-0 mb-1">Super Sender</h1>
                    <p className="text-sm text-gray-500 m-0">
                        Dedicated AWS SES IPs assigned to your workspaces. Powered by Amazon SES.
                    </p>
                </header>

                {actionMsg && (
                    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-3 text-blue-900 text-sm flex items-center justify-between">
                        <span>{actionMsg}</span>
                        <button onClick={() => setActionMsg(null)} className="text-blue-700 hover:text-blue-900">
                            <XIcon size={14} />
                        </button>
                    </div>
                )}

                {pendingPool.length > 0 && (
                    <PendingIpsInbox
                        ips={pendingPool}
                        workspaces={workspaces.filter(w => !w.has_ip)}
                        onAssigned={async () => {
                            const fresh = await fetchOverview();
                            if (fresh) setData(fresh);
                            setActionMsg('IP assigned. Provisioning will begin within a few minutes.');
                        }}
                        onError={(msg) => setActionMsg(msg)}
                    />
                )}

                <section className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-lg font-bold text-gray-900 m-0">Workspaces</h2>
                        {isAgency && summary.can_purchase && (
                            <button
                                onClick={() => setPickerOpen(true)}
                                className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 bg-transparent border-none cursor-pointer"
                            >
                                + Buy more IPs
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                        {workspaces.map(w => (
                            <WorkspaceCard
                                key={w.id}
                                workspace={w}
                                ip={allocatedByWorkspace.get(w.id) ?? null}
                                onChanged={async () => {
                                    const fresh = await fetchOverview();
                                    if (fresh) setData(fresh);
                                }}
                            />
                        ))}
                    </div>
                </section>
            </div>
            {pickerOpen && (
                <WorkspacePickerModal
                    workspaces={workspaces}
                    pricePerIpUsd={summary.price_per_ip_usd}
                    onClose={() => setPickerOpen(false)}
                    onConfirm={async (selectedIds) => {
                        try {
                            const { url } = await startCheckout({
                                quantity: selectedIds.length,
                                workspaceIds: selectedIds,
                            });
                            if (url) window.location.href = url;
                        } catch (err) {
                            setActionMsg((err as Error)?.message || 'Checkout failed');
                            setPickerOpen(false);
                        }
                    }}
                />
            )}
        </>
    );
}

// ────────────────────────────────────────────────────────────────────
// API helpers
// ────────────────────────────────────────────────────────────────────

async function startCheckout(input: { quantity: number; workspaceIds: string[] }): Promise<{ url: string }> {
    const res = await fetch('/api/super-sender/checkout', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity: input.quantity, workspace_ids: input.workspaceIds }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json?.error || 'Checkout failed');
    return { url: json.data.checkoutUrl };
}

async function assignIp(ipId: string, workspaceId: string): Promise<void> {
    const res = await fetch(`/api/super-sender/${ipId}/assign`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workspace_id: workspaceId }),
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json?.error || 'Assignment failed');
}

async function unassignIp(ipId: string): Promise<void> {
    const res = await fetch(`/api/super-sender/${ipId}/unassign`, {
        method: 'POST',
        credentials: 'include',
    });
    const json = await res.json();
    if (!res.ok || !json.success) throw new Error(json?.error || 'Unassignment failed');
}

// ────────────────────────────────────────────────────────────────────
// Pre-purchase marketing view
// ────────────────────────────────────────────────────────────────────

function PrePurchaseView({
    summary,
    isAgency,
    onGetStarted,
}: {
    summary: OverviewSummary;
    isAgency: boolean;
    onGetStarted: () => void;
}) {
    return (
        <div className="p-6 md:p-8">
            <div
                className="rounded-2xl p-8 md:p-10 mb-8 relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E3A8A 50%, #2563EB 100%)' }}
            >
                <div className="relative z-10 flex flex-col gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                            <Zap size={20} className="text-white" />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-blue-200">Super Sender</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight m-0">
                        Dedicated IPs for your workspace
                    </h1>
                    <p className="text-blue-100 text-sm md:text-base leading-relaxed max-w-2xl m-0">
                        Take full ownership of your sender reputation. A dedicated IP is yours alone - no neighbours, no
                        shared blacklist exposure, no surprise dips. Powered by Amazon SES.
                    </p>
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge icon={<Server size={11} />} label="Amazon SES backbone" />
                        <Badge icon={<Shield size={11} />} label="Auto-warmed (30 days)" />
                        <Badge icon={<Lock size={11} />} label="Yours alone" />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <FeatureCard icon={<TrendingUpIcon />} title="Better deliverability" body="A clean, isolated IP earns reputation faster than a shared pool." />
                <FeatureCard icon={<BarChart3 size={18} className="text-blue-700" />} title="Full visibility" body="Daily send caps, warmup progress, and SES status - all in one place." />
                <FeatureCard icon={<Shield size={18} className="text-blue-700" />} title="No shared risk" body="A neighbor on a shared pool can't blacklist you. Yours alone, fully isolated." />
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 mb-6">
                <h2 className="text-lg font-bold text-gray-900 m-0 mb-3">How it works</h2>
                <ol className="m-0 pl-5 text-sm text-gray-700 leading-relaxed flex flex-col gap-2">
                    <li><strong>Choose your workspaces</strong> - {isAgency ? 'pick which clients get a dedicated IP, or buy one for all.' : 'one IP for your workspace.'}</li>
                    <li><strong>Pay $39/IP/month</strong> via Polar - billed alongside your subscription.</li>
                    <li><strong>SES provisions</strong> - a fresh IP comes online in 5-15 minutes.</li>
                    <li><strong>30-day warmup</strong> - automatic ramp from 50 to 50,000 sends/day.</li>
                    <li><strong>Send</strong> - your relay mailboxes route through this IP automatically.</li>
                </ol>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6 flex items-center justify-between gap-4 flex-wrap">
                <div>
                    <div className="text-3xl font-bold text-gray-900">${summary.price_per_ip_usd}<span className="text-base font-medium text-gray-500">/IP/month</span></div>
                    <div className="text-sm text-gray-500 mt-1">Cancel anytime. SES infrastructure cost included.</div>
                </div>
                {summary.can_purchase ? (
                    <button
                        onClick={onGetStarted}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg px-6 py-3 cursor-pointer flex items-center gap-2 border-none"
                    >
                        Get Started <ArrowRight size={14} />
                    </button>
                ) : (
                    <div className="flex flex-col items-end">
                        <button disabled className="bg-gray-200 text-gray-500 font-semibold text-sm rounded-lg px-6 py-3 cursor-not-allowed border-none">
                            Get Started
                        </button>
                        {summary.purchase_blocked_reason && (
                            <div className="text-xs text-red-700 mt-2 flex items-center gap-1.5">
                                <AlertCircle size={12} /> {summary.purchase_blocked_reason}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

function Badge({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <span className="bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full inline-flex items-center gap-1.5 border border-white/20">
            {icon} {label}
        </span>
    );
}

function FeatureCard({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-2">
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">{icon}</div>
            <h3 className="text-sm font-bold text-gray-900 m-0 mt-1">{title}</h3>
            <p className="text-xs text-gray-600 m-0 leading-relaxed">{body}</p>
        </div>
    );
}

function TrendingUpIcon() {
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-700">
            <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline>
            <polyline points="16 7 22 7 22 13"></polyline>
        </svg>
    );
}

// ────────────────────────────────────────────────────────────────────
// Workspace picker modal - agency mode purchase flow.
// Shows a list of workspaces, each toggleable, with already-purchased
// rows disabled. Cost summary updates live. Confirm step before checkout.
// ────────────────────────────────────────────────────────────────────

function WorkspacePickerModal({
    workspaces,
    pricePerIpUsd,
    onClose,
    onConfirm,
}: {
    workspaces: WorkspaceRow[];
    pricePerIpUsd: number;
    onClose: () => void;
    onConfirm: (selectedIds: string[]) => Promise<void>;
}) {
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const [confirming, setConfirming] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [stepError, setStepError] = useState<string | null>(null);

    const eligible = workspaces.filter(w => !w.has_ip);
    const showSearch = workspaces.length > 10;

    const filtered = useMemo(() => {
        if (!search.trim()) return workspaces;
        const q = search.toLowerCase();
        return workspaces.filter(w => w.name.toLowerCase().includes(q) || w.slug.toLowerCase().includes(q));
    }, [workspaces, search]);

    const allEligibleSelected = eligible.length > 0 && eligible.every(w => selected.has(w.id));
    const toggle = (id: string) => {
        const next = new Set(selected);
        if (next.has(id)) next.delete(id); else next.add(id);
        setSelected(next);
    };
    const selectAll = () => setSelected(new Set(eligible.map(w => w.id)));
    const clearAll = () => setSelected(new Set());

    const monthly = selected.size * pricePerIpUsd;

    const handleProceed = () => {
        if (selected.size === 0) {
            setStepError('Select at least one workspace');
            return;
        }
        setStepError(null);
        setConfirming(true);
    };

    const handleConfirm = async () => {
        setSubmitting(true);
        try {
            await onConfirm(Array.from(selected));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}>
            <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col" style={{ border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)' }}>
                <header className="flex items-center justify-between p-5 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900 m-0">
                            {confirming ? 'Confirm purchase' : 'Choose workspaces'}
                        </h2>
                        {!confirming && (
                            <p className="text-xs text-gray-500 m-0 mt-1">
                                One dedicated IP per workspace. Already-assigned workspaces are disabled.
                            </p>
                        )}
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1">
                        <XIcon size={18} />
                    </button>
                </header>

                {!confirming ? (
                    <>
                        {showSearch && (
                            <div className="px-5 pt-4">
                                <div className="relative">
                                    <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type="text"
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        placeholder="Search workspaces…"
                                        className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </div>
                            </div>
                        )}

                        <div className="px-5 py-3 flex items-center justify-between text-xs">
                            <button
                                onClick={allEligibleSelected ? clearAll : selectAll}
                                disabled={eligible.length === 0}
                                className="text-blue-700 hover:text-blue-900 font-semibold bg-transparent border-none cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
                            >
                                {allEligibleSelected ? 'Clear all' : `Select all (${eligible.length})`}
                            </button>
                            <span className="text-gray-500">{selected.size} selected</span>
                        </div>

                        <div className="overflow-y-auto px-5 flex-1">
                            {filtered.length === 0 && (
                                <div className="py-6 text-center text-sm text-gray-500">No workspaces match.</div>
                            )}
                            <ul className="m-0 p-0 list-none flex flex-col gap-1">
                                {filtered.map(w => {
                                    const disabled = w.has_ip;
                                    const checked = selected.has(w.id);
                                    return (
                                        <li key={w.id}>
                                            <label
                                                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border ${disabled ? 'bg-gray-50 border-gray-100 cursor-not-allowed' : checked ? 'bg-blue-50 border-blue-200 cursor-pointer' : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer'}`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={checked}
                                                    disabled={disabled}
                                                    onChange={() => toggle(w.id)}
                                                    className="w-4 h-4 cursor-pointer disabled:cursor-not-allowed"
                                                />
                                                <span className="flex-1 text-sm text-gray-900 font-medium">{w.name}</span>
                                                {disabled && (
                                                    <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                                                        <CheckCircle2 size={11} /> Has IP
                                                    </span>
                                                )}
                                            </label>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {stepError && (
                            <div className="px-5 py-2 text-xs text-red-700 bg-red-50 border-t border-red-100">{stepError}</div>
                        )}

                        <footer className="border-t border-gray-100 p-5 flex items-center justify-between gap-4">
                            <div className="text-sm">
                                <div className="font-bold text-gray-900">${monthly.toFixed(0)}<span className="text-xs font-medium text-gray-500">/month</span></div>
                                <div className="text-xs text-gray-500">{selected.size} × ${pricePerIpUsd}/IP</div>
                            </div>
                            <button
                                disabled={selected.size === 0}
                                onClick={handleProceed}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg px-5 py-2.5 cursor-pointer disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed border-none"
                            >
                                Review →
                            </button>
                        </footer>
                    </>
                ) : (
                    <>
                        <div className="p-5 flex flex-col gap-4">
                            <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 text-sm text-blue-900">
                                You're about to purchase <strong>{selected.size} dedicated IP{selected.size === 1 ? '' : 's'}</strong> for{' '}
                                <strong>${monthly.toFixed(0)}/month</strong>. Each IP will be pre-assigned to its workspace.
                            </div>
                            <div className="text-sm text-gray-700">
                                <div className="font-semibold mb-2">Workspaces</div>
                                <ul className="m-0 p-0 list-none flex flex-col gap-1">
                                    {workspaces.filter(w => selected.has(w.id)).map(w => (
                                        <li key={w.id} className="flex items-center gap-2 text-sm">
                                            <CheckCircle2 size={14} className="text-emerald-600" />
                                            <span className="text-gray-900">{w.name}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                            <p className="text-xs text-gray-500 m-0">
                                After payment, IPs will provision in 5-15 minutes. A 30-day warmup ramps you to full send capacity.
                            </p>
                        </div>
                        <footer className="border-t border-gray-100 p-5 flex items-center justify-between gap-4">
                            <button
                                onClick={() => setConfirming(false)}
                                disabled={submitting}
                                className="text-sm text-gray-700 hover:text-gray-900 bg-transparent border-none cursor-pointer disabled:text-gray-400"
                            >
                                ← Back
                            </button>
                            <button
                                disabled={submitting}
                                onClick={handleConfirm}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm rounded-lg px-5 py-2.5 cursor-pointer flex items-center gap-2 border-none disabled:bg-blue-400"
                            >
                                {submitting ? <><Loader2 size={14} className="animate-spin" /> Redirecting…</> : <>Continue to checkout <ExternalLink size={12} /></>}
                            </button>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Pending IPs inbox - IPs with no workspace_id, awaiting allocation.
// Each row offers a workspace dropdown.
// ────────────────────────────────────────────────────────────────────

function PendingIpsInbox({
    ips,
    workspaces,
    onAssigned,
    onError,
}: {
    ips: DedicatedIp[];
    workspaces: WorkspaceRow[];
    onAssigned: () => Promise<void>;
    onError: (msg: string) => void;
}) {
    const [busyId, setBusyId] = useState<string | null>(null);
    const [selectedWorkspace, setSelectedWorkspace] = useState<Record<string, string>>({});

    const onAssign = async (ipId: string) => {
        const workspaceId = selectedWorkspace[ipId];
        if (!workspaceId) return;
        setBusyId(ipId);
        try {
            await assignIp(ipId, workspaceId);
            await onAssigned();
        } catch (err) {
            onError((err as Error)?.message || 'Failed to assign');
        } finally {
            setBusyId(null);
        }
    };

    return (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-center gap-2 mb-3">
                <AlertCircle size={16} className="text-amber-700" />
                <h2 className="text-sm font-bold text-amber-900 m-0">
                    {ips.length} IP{ips.length === 1 ? '' : 's'} awaiting allocation
                </h2>
            </div>
            <p className="text-xs text-amber-800 m-0 mb-3">
                You purchased {ips.length} dedicated IP{ips.length === 1 ? '' : 's'} that haven't been assigned to a workspace yet.
                Pick one for each below - the IP will start provisioning immediately.
            </p>
            <ul className="m-0 p-0 list-none flex flex-col gap-2">
                {ips.map(ip => (
                    <li key={ip.id} className="bg-white border border-amber-200 rounded-lg p-3 flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                            <div className="text-xs text-gray-500 font-mono truncate">IP #{ip.id.slice(0, 8)}</div>
                            <div className="text-xs text-gray-500">{ip.state === 'pending_payment' ? 'Awaiting payment' : 'Ready to allocate'}</div>
                        </div>
                        <div className="w-52" style={{ opacity: (busyId === ip.id || workspaces.length === 0) ? 0.5 : 1, pointerEvents: (busyId === ip.id || workspaces.length === 0) ? 'none' : 'auto' }}>
                            <CustomSelect
                                value={selectedWorkspace[ip.id] || ''}
                                onChange={(v) => setSelectedWorkspace({ ...selectedWorkspace, [ip.id]: v })}
                                options={[
                                    { value: '', label: workspaces.length === 0 ? 'No workspaces left' : 'Choose workspace…' },
                                    ...workspaces.map(w => ({ value: w.id, label: w.name })),
                                ]}
                            />
                        </div>
                        <button
                            disabled={!selectedWorkspace[ip.id] || busyId === ip.id}
                            onClick={() => onAssign(ip.id)}
                            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded px-3 py-1.5 cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed border-none"
                        >
                            {busyId === ip.id ? <Loader2 size={12} className="animate-spin" /> : 'Allocate'}
                        </button>
                    </li>
                ))}
            </ul>
        </section>
    );
}

// ────────────────────────────────────────────────────────────────────
// Workspace card - shows the IP for one workspace, in any of the 5
// states. Also handles the "no IP yet" case for workspaces in agency
// mode that the agency owner hasn't bought for.
// ────────────────────────────────────────────────────────────────────

function WorkspaceCard({
    workspace,
    ip,
    onChanged,
}: {
    workspace: WorkspaceRow;
    ip: DedicatedIp | null;
    onChanged: () => Promise<void>;
}) {
    const [unassigning, setUnassigning] = useState(false);
    const [pausing, setPausing] = useState(false);
    const [routing, setRouting] = useState<MailboxRouting | null>(null);
    const [routingExpanded, setRoutingExpanded] = useState(false);
    const [err, setErr] = useState<string | null>(null);

    // Lazy-load mailbox routing detail when the card is on a real IP. Cheap
    // - one fetch per card mount, refetches only when ip.id changes.
    useEffect(() => {
        if (!ip?.id) return;
        let cancelled = false;
        (async () => {
            try {
                const res = await fetch(`/api/super-sender/${ip.id}/mailboxes`, { credentials: 'include' });
                if (!res.ok) return;
                const json = await res.json();
                if (!cancelled && json?.success) setRouting(json.data);
            } catch { /* non-fatal */ }
        })();
        return () => { cancelled = true; };
    }, [ip?.id]);

    if (!ip) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-white p-5 flex flex-col gap-2 min-h-[200px]">
                <div className="text-sm font-semibold text-gray-900">{workspace.name}</div>
                <div className="text-xs text-gray-500">No dedicated IP assigned</div>
                <div className="mt-auto text-xs text-gray-400">This workspace is using shared infrastructure.</div>
            </div>
        );
    }

    const stateMeta = STATE_META[ip.state] ?? STATE_META.failed;
    const isPaused = !!ip.paused_reason;
    const total24h = ip.delivered_count_24h + ip.bounce_count_24h + ip.complaint_count_24h;
    const bounceRate = total24h > 0 ? (ip.bounce_count_24h / total24h) * 100 : 0;
    const complaintRate = total24h > 0 ? (ip.complaint_count_24h / total24h) * 100 : 0;

    const handlePauseToggle = async () => {
        setPausing(true);
        setErr(null);
        try {
            const path = isPaused ? `resume` : `pause`;
            const res = await fetch(`/api/super-sender/${ip.id}/${path}`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: isPaused ? undefined : JSON.stringify({ reason: 'manual' }),
            });
            const json = await res.json();
            if (!res.ok || !json.success) throw new Error(json?.error || 'Failed');
            await onChanged();
        } catch (e) {
            setErr((e as Error)?.message || 'Failed');
        } finally {
            setPausing(false);
        }
    };

    return (
        <div className={`rounded-xl border bg-white p-5 flex flex-col gap-3 ${isPaused ? 'border-red-200' : 'border-gray-200'}`}>
            <header className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                    <div className="text-sm font-bold text-gray-900 truncate">{workspace.name}</div>
                    {ip.ses_ip_address && (
                        <div className="text-xs text-gray-500 font-mono mt-0.5">{ip.ses_ip_address}</div>
                    )}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    {isPaused && (
                        <span className="text-[11px] font-semibold px-2 py-1 rounded-full bg-red-100 text-red-800 flex items-center gap-1">
                            <Power size={11} /> Paused
                        </span>
                    )}
                    <span className={`text-[11px] font-semibold px-2 py-1 rounded-full ${stateMeta.badgeClass} flex items-center gap-1.5`}>
                        {stateMeta.icon} {stateMeta.label}
                    </span>
                </div>
            </header>

            <p className="text-xs text-gray-600 m-0">{stateMeta.description}</p>

            {isPaused && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-900">
                    <div className="font-semibold mb-1">Send routing paused</div>
                    <div className="text-[11px] text-red-800">
                        Reason: <code className="bg-red-100 px-1 rounded">{ip.paused_reason}</code>.
                        Sends are falling back to each mailbox's native provider until you resume.
                    </div>
                </div>
            )}

            {ip.state === 'warming' && (
                <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
                    <div className="flex items-center justify-between text-xs font-semibold text-orange-900 mb-1.5">
                        <span>Warmup progress</span>
                        <span>Day {ip.warmup_day} / 30</span>
                    </div>
                    <div className="w-full h-1.5 bg-orange-200 rounded overflow-hidden">
                        <div
                            className="h-full bg-orange-500 transition-all"
                            style={{ width: `${Math.min(100, (ip.warmup_day / 30) * 100)}%` }}
                        />
                    </div>
                    <div className="text-[11px] text-orange-800 mt-1.5">
                        Today: <strong>{ip.sends_today.toLocaleString()}</strong> / {ip.daily_cap.toLocaleString()} sends
                    </div>
                </div>
            )}

            {ip.state === 'active' && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3 text-xs text-emerald-900">
                    Full send capacity. Today: <strong>{ip.sends_today.toLocaleString()}</strong> / {ip.daily_cap.toLocaleString()}.
                    {ip.warmup_completed_at ? ` Warmup completed ${formatDate(ip.warmup_completed_at)}.` : ''}
                </div>
            )}

            {(ip.state === 'warming' || ip.state === 'active') && total24h > 0 && (
                <div className="grid grid-cols-3 gap-2 text-center">
                    <Stat label="Delivered (24h)" value={ip.delivered_count_24h.toLocaleString()} tone="ok" />
                    <Stat label="Bounce rate" value={`${bounceRate.toFixed(2)}%`} tone={bounceRate > 4 ? 'bad' : bounceRate > 2 ? 'warn' : 'ok'} />
                    <Stat label="Complaint rate" value={`${complaintRate.toFixed(3)}%`} tone={complaintRate > 0.08 ? 'bad' : complaintRate > 0.04 ? 'warn' : 'ok'} />
                </div>
            )}

            {ip.state === 'failed' && ip.last_error && (
                <div className="rounded-lg bg-red-50 border border-red-100 p-3 text-xs text-red-900 break-words">
                    {ip.last_error}
                </div>
            )}

            {/* Mailbox eligibility - which mailboxes route through this IP. */}
            {(ip.state === 'warming' || ip.state === 'active') && routing && (
                <div className="rounded-lg border border-gray-100 bg-gray-50 p-3">
                    <button
                        onClick={() => setRoutingExpanded(v => !v)}
                        className="w-full flex items-center justify-between text-xs font-semibold text-gray-700 bg-transparent border-none cursor-pointer p-0"
                    >
                        <span>
                            Routing: <strong>{routing.eligible.length}</strong> mailbox{routing.eligible.length === 1 ? '' : 'es'} via this IP
                            {routing.native_only.length > 0 && <span className="text-gray-500">, {routing.native_only.length} stay on native provider</span>}
                        </span>
                        <span className="text-gray-400">{routingExpanded ? '−' : '+'}</span>
                    </button>
                    {routingExpanded && (
                        <div className="mt-2 flex flex-col gap-2">
                            {routing.eligible.length > 0 && (
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Routes via SES</div>
                                    <ul className="m-0 p-0 list-none flex flex-col gap-0.5">
                                        {routing.eligible.map(m => (
                                            <li key={m.id} className="text-[11px] text-gray-700 font-mono truncate">{m.email} <span className="text-gray-400">({m.provider})</span></li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                            {routing.native_only.length > 0 && (
                                <div>
                                    <div className="text-[10px] uppercase tracking-wider text-gray-500 mb-1">Native provider only</div>
                                    <ul className="m-0 p-0 list-none flex flex-col gap-0.5">
                                        {routing.native_only.map(m => (
                                            <li key={m.id} className="text-[11px] text-gray-500 font-mono truncate">{m.email} <span className="text-gray-400">({m.provider})</span></li>
                                        ))}
                                    </ul>
                                    <div className="text-[10px] text-gray-500 mt-1">
                                        OAuth providers (Gmail, Outlook) own their outbound IPs and can't route through SES.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}

            {err && <div className="text-xs text-red-700">{err}</div>}

            <div className="flex items-center justify-between mt-1 gap-2 flex-wrap">
                <div className="text-[11px] text-gray-400">
                    {ip.activated_at ? `Activated ${formatDate(ip.activated_at)}` : `Created ${formatDate(ip.created_at)}`}
                </div>
                <div className="flex items-center gap-3">
                    {(ip.state === 'active' || ip.state === 'warming') && (
                        <button
                            onClick={handlePauseToggle}
                            disabled={pausing}
                            className={`text-[11px] bg-transparent border-none cursor-pointer flex items-center gap-1 disabled:text-gray-300 disabled:cursor-not-allowed ${isPaused ? 'text-emerald-700 hover:text-emerald-900' : 'text-gray-500 hover:text-amber-700'}`}
                            title={isPaused ? 'Resume sends' : 'Pause sends'}
                        >
                            {pausing ? <Loader2 size={11} className="animate-spin" /> : <Power size={11} />} {isPaused ? 'Resume' : 'Pause'}
                        </button>
                    )}
                    {(ip.state === 'active' || ip.state === 'warming') && (
                        <button
                            onClick={async () => {
                                setUnassigning(true);
                                setErr(null);
                                try {
                                    await unassignIp(ip.id);
                                    await onChanged();
                                } catch (e) {
                                    setErr((e as Error)?.message || 'Failed');
                                } finally {
                                    setUnassigning(false);
                                }
                            }}
                            disabled={unassigning}
                            className="text-[11px] text-gray-500 hover:text-red-700 bg-transparent border-none cursor-pointer flex items-center gap-1 disabled:text-gray-300 disabled:cursor-not-allowed"
                            title="Return to pool"
                        >
                            {unassigning ? <Loader2 size={11} className="animate-spin" /> : <ArrowRight size={11} className="rotate-180" />} Unassign
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: 'ok' | 'warn' | 'bad' }) {
    const colors = {
        ok: 'text-emerald-700 bg-emerald-50 border-emerald-100',
        warn: 'text-amber-700 bg-amber-50 border-amber-100',
        bad: 'text-red-700 bg-red-50 border-red-100',
    }[tone];
    return (
        <div className={`rounded-md border px-2 py-1.5 ${colors}`}>
            <div className="text-sm font-bold leading-tight">{value}</div>
            <div className="text-[10px] uppercase tracking-wide leading-tight mt-0.5">{label}</div>
        </div>
    );
}

const STATE_META: Record<DedicatedIp['state'], { label: string; icon: React.ReactNode; badgeClass: string; description: string }> = {
    pending_payment: {
        label: 'Awaiting payment',
        icon: <Loader2 size={11} className="animate-spin" />,
        badgeClass: 'bg-gray-100 text-gray-700',
        description: 'Polar checkout in progress. The IP will start provisioning once payment confirms.',
    },
    provisioning: {
        label: 'Provisioning',
        icon: <Loader2 size={11} className="animate-spin" />,
        badgeClass: 'bg-blue-100 text-blue-800',
        description: 'AWS SES is bringing your dedicated IP online. Usually takes 5-15 minutes.',
    },
    warming: {
        label: 'Warming',
        icon: <Flame size={11} />,
        badgeClass: 'bg-orange-100 text-orange-800',
        description: 'Sending volume ramps daily over 30 days to build a healthy reputation.',
    },
    active: {
        label: 'Active',
        icon: <CheckCircle2 size={11} />,
        badgeClass: 'bg-emerald-100 text-emerald-800',
        description: 'Warmup complete. Ready for full-volume cold-email sending.',
    },
    failed: {
        label: 'Failed',
        icon: <AlertCircle size={11} />,
        badgeClass: 'bg-red-100 text-red-800',
        description: 'Provisioning failed. Contact support to investigate or refund.',
    },
    canceled: {
        label: 'Canceled',
        icon: <XIcon size={11} />,
        badgeClass: 'bg-gray-100 text-gray-700',
        description: 'Subscription canceled. Mailboxes have reverted to shared infrastructure.',
    },
};

function formatDate(iso: string): string {
    try {
        return new Date(iso).toLocaleDateString();
    } catch {
        return '';
    }
}
