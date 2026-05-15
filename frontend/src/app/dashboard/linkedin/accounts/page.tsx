'use client';

import { useCallback, useEffect, useState } from 'react';
import { Plus, MoreHorizontal, Clock, ShieldCheck, AlertTriangle, RefreshCcw, Linkedin, Search, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import PostConnectOnboardingModal, { isOnboardingDismissed } from '@/components/linkedin/PostConnectOnboardingModal';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';

// Matches LinkedInAccountView in services/linkedin/accountService.ts.
interface LinkedInAccount {
    id: string;
    unipile_account_id: string;
    display_name: string;
    account_type: 'CLASSIC' | 'PREMIUM' | 'SALES_NAV' | 'RECRUITER';
    status: 'OK' | 'CONNECTING' | 'CREDENTIALS' | 'ERROR' | 'SYNC_SUCCESS' | 'DELETED';
    inbox_sync_mode: 'all' | 'sequence_only';
    invites_today: number;
    invites_today_max: number;
    invites_week: number;
    invites_week_max: number;
    msgs_today: number;
    msgs_today_max: number;
    in_campaigns: number;
    connected_at: string;
    last_status_at: string | null;
}

interface LimitSummary {
    tier: string;
    base_limit: number;
    addon_count: number;
    effective_limit: number;
    current_usage: number;
    available: number;
    addon_unit_price_usd: number;
}

interface AccountsListResponse {
    accounts: LinkedInAccount[];
    limits: LimitSummary;
}

const TYPE_BADGE: Record<LinkedInAccount['account_type'], string> = {
    CLASSIC: 'bg-gray-100 text-gray-700',
    PREMIUM: 'bg-blue-50 text-blue-700',
    SALES_NAV: 'bg-violet-50 text-violet-700',
    RECRUITER: 'bg-amber-50 text-amber-700',
};

const STATUS_BADGE: Record<LinkedInAccount['status'], { label: string; tint: string; icon: React.ReactNode }> = {
    OK: { label: 'Connected', tint: 'bg-emerald-50 text-emerald-700', icon: <ShieldCheck size={11} /> },
    SYNC_SUCCESS: { label: 'Connected', tint: 'bg-emerald-50 text-emerald-700', icon: <ShieldCheck size={11} /> },
    CONNECTING: { label: 'Connecting', tint: 'bg-blue-50 text-blue-700', icon: <RefreshCcw size={11} className="animate-spin" /> },
    CREDENTIALS: { label: 'Re-auth needed', tint: 'bg-amber-50 text-amber-700', icon: <AlertTriangle size={11} /> },
    ERROR: { label: 'Error', tint: 'bg-rose-50 text-rose-700', icon: <AlertTriangle size={11} /> },
    DELETED: { label: 'Removed', tint: 'bg-gray-100 text-gray-500', icon: <AlertTriangle size={11} /> },
};

// Same gradient palette as the mock - picked deterministically by name hash
// so an account keeps the same avatar tint across renders.
const TINTS = [
    'from-blue-100 to-indigo-100',
    'from-rose-100 to-amber-100',
    'from-violet-100 to-fuchsia-100',
    'from-emerald-100 to-teal-100',
    'from-yellow-100 to-orange-100',
    'from-pink-100 to-rose-100',
    'from-cyan-100 to-sky-100',
    'from-lime-100 to-green-100',
];

function tintFor(name: string): string {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) >>> 0;
    return TINTS[h % TINTS.length];
}

function initials(name: string): string {
    return name.split(' ').filter(Boolean).map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'LI';
}

function CapacityBar({ value, max }: { value: number; max: number }) {
    const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
    const fill = pct >= 90 ? 'bg-rose-500' : pct >= 70 ? 'bg-amber-500' : 'bg-blue-500';
    return (
        <div className="flex items-center gap-2">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden min-w-[60px]">
                <div className={`h-full ${fill} transition-all`} style={{ width: `${pct}%` }} />
            </div>
            <span className="text-[0.65rem] text-gray-600 font-mono tabular-nums whitespace-nowrap">{value}/{max}</span>
        </div>
    );
}

export default function LinkedInAccountsPage() {
    const [accounts, setAccounts] = useState<LinkedInAccount[]>([]);
    const [limits, setLimits] = useState<LimitSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [connecting, setConnecting] = useState(false);
    const [purchasing, setPurchasing] = useState(false);
    const [openMenu, setOpenMenu] = useState<string | null>(null);
    const [showAddonModal, setShowAddonModal] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState(false);
    const [pendingDisconnect, setPendingDisconnect] = useState<{ id: string; name: string; inCampaigns: number } | null>(null);
    const [disconnecting, setDisconnecting] = useState(false);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const fetchAccounts = useCallback(async () => {
        try {
            const data = await apiClient<AccountsListResponse>('/api/linkedin/accounts');
            setAccounts(Array.isArray(data?.accounts) ? data.accounts : []);
            setLimits(data?.limits || null);
            setError(null);
        } catch (err: any) {
            setError(err.message || 'Failed to load accounts');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    // Notice query-string hints from Unipile redirect callbacks.
    useEffect(() => {
        const url = new URL(window.location.href);
        if (url.searchParams.get('connected') === '1') {
            toast.success('LinkedIn account connected');
            url.searchParams.delete('connected');
            window.history.replaceState({}, '', url.toString());
            fetchAccounts();
            // Show the onboarding modal unless this user has already dismissed
            // it permanently for this browser. The modal points to the four
            // next steps that turn the raw connection into actual outbound.
            if (!isOnboardingDismissed()) {
                setShowOnboarding(true);
            }
        }
        if (url.searchParams.get('connect_failed') === '1') {
            toast.error('Account connection failed - try again');
            url.searchParams.delete('connect_failed');
            window.history.replaceState({}, '', url.toString());
        }
        if (url.searchParams.get('reconnected') === '1') {
            toast.success('Account reconnected');
            url.searchParams.delete('reconnected');
            window.history.replaceState({}, '', url.toString());
            fetchAccounts();
        }
        // Polar add-on checkout return handlers.
        if (url.searchParams.get('checkout') === 'success') {
            toast.success('Payment confirmed - add-on slot is being provisioned');
            url.searchParams.delete('checkout');
            window.history.replaceState({}, '', url.toString());
            // Webhook may take a few seconds to bump the counter; refetch
            // twice to catch it.
            fetchAccounts();
            setTimeout(() => fetchAccounts(), 4000);
        }
        if (url.searchParams.get('checkout') === 'canceled') {
            toast('Checkout canceled - no charge was made', { icon: 'ℹ️' });
            url.searchParams.delete('checkout');
            window.history.replaceState({}, '', url.toString());
        }
    }, [fetchAccounts]);

    const handleConnect = async () => {
        // Gate locally on known capacity so we don't bounce the user through
        // a backend round-trip just to hit the 402 message.
        if (limits && limits.available <= 0) {
            setShowAddonModal(true);
            return;
        }
        setConnecting(true);
        try {
            const data = await apiClient<{ url: string }>('/api/linkedin/accounts/connect-link', {
                method: 'POST',
                body: JSON.stringify({}),
            });
            if (data?.url) window.location.href = data.url;
            else throw new Error('No URL returned from Unipile');
        } catch (err: any) {
            // Backend surfaces LINKEDIN_LIMIT_REACHED as 402; apiClient throws
            // a generic Error so we match on the message substring as a
            // best-effort signal to swap to the add-on flow.
            if (/limit reached|LINKEDIN_LIMIT_REACHED/i.test(err.message || '')) {
                setShowAddonModal(true);
            } else {
                toast.error(err.message || 'Failed to start connection flow');
            }
            setConnecting(false);
        }
    };

    const handlePurchaseAddon = async (quantity: number) => {
        setPurchasing(true);
        try {
            const data = await apiClient<{ mode: 'polar' | 'stub'; checkout_url?: string; limits?: LimitSummary }>(
                '/api/linkedin/accounts/addons/purchase',
                { method: 'POST', body: JSON.stringify({ quantity }) },
            );
            // Polar mode: redirect to hosted checkout. Increment happens on
            // the webhook after the user pays; we re-fetch on return via
            // the ?checkout=success query-param handler.
            if (data?.mode === 'polar' && data.checkout_url) {
                window.location.href = data.checkout_url;
                return;
            }
            // Stub mode: backend already incremented the counter.
            if (data?.limits) setLimits(data.limits);
            toast.success(`${quantity} add-on slot${quantity > 1 ? 's' : ''} added - $${quantity * 15}/mo`);
            setShowAddonModal(false);
        } catch (err: any) {
            toast.error(err.message || 'Failed to purchase add-on');
        } finally {
            setPurchasing(false);
        }
    };

    const handleReconnect = async (id: string) => {
        setOpenMenu(null);
        try {
            const data = await apiClient<{ url: string }>(`/api/linkedin/accounts/${id}/reconnect`, {
                method: 'POST',
                body: JSON.stringify({}),
            });
            if (data?.url) window.location.href = data.url;
            else throw new Error('No URL returned from Unipile');
        } catch (err: any) {
            toast.error(err.message || 'Failed to start reconnect flow');
        }
    };

    const requestDisconnect = (id: string, name: string, inCampaigns: number) => {
        // CampaignLinkedInSender rows cascade-delete on account delete,
        // so detached campaigns silently lose this sender on the next
        // dispatcher cycle. Surface that cost upfront.
        setOpenMenu(null);
        setPendingDisconnect({ id, name, inCampaigns });
    };

    const confirmDisconnect = async () => {
        if (!pendingDisconnect) return;
        setDisconnecting(true);
        try {
            await apiClient(`/api/linkedin/accounts/${pendingDisconnect.id}`, { method: 'DELETE' });
            toast.success('Account disconnected');
            setPendingDisconnect(null);
            fetchAccounts();
        } catch (err: any) {
            toast.error(err.message || 'Failed to disconnect');
        } finally {
            setDisconnecting(false);
        }
    };

    const filtered = accounts.filter(a => {
        if (search && !a.display_name.toLowerCase().includes(search.toLowerCase())) return false;
        if (typeFilter !== 'all' && a.account_type !== typeFilter) return false;
        if (statusFilter !== 'all' && a.status !== statusFilter) return false;
        return true;
    });

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">LinkedIn Accounts</h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {loading
                            ? 'Loading…'
                            : limits
                                ? <>
                                    <span className="font-semibold text-gray-700">{limits.current_usage}/{limits.effective_limit}</span> accounts on <span className="capitalize">{limits.tier}</span> tier ({limits.base_limit} included{limits.addon_count > 0 ? ` + ${limits.addon_count} add-on${limits.addon_count > 1 ? 's' : ''}` : ''})
                                </>
                                : `${accounts.length} accounts connected`}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    {/* "Add more accounts" is surfaced as soon as the operator
                        is within one slot of the cap, not only at 100% full.
                        Bumps to primary-button styling when they're actually
                        out of slots so the path forward is obvious. */}
                    {limits && (limits.available <= 1) && (
                        <button
                            onClick={() => setShowAddonModal(true)}
                            className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer transition-colors ${
                                limits.available <= 0
                                    ? 'bg-amber-600 text-white hover:bg-amber-700 border-none'
                                    : 'text-amber-900 bg-amber-50 hover:bg-amber-100'
                            }`}
                            style={limits.available > 0 ? { border: '1px solid #FDE68A' } : undefined}
                            title={limits.available <= 0
                                ? `At capacity (${limits.current_usage}/${limits.effective_limit}). Each new account is $${limits.addon_unit_price_usd}/mo.`
                                : `${limits.available} slot${limits.available === 1 ? '' : 's'} left on ${limits.tier}. Add more for $${limits.addon_unit_price_usd}/mo each.`}
                        >
                            <Plus size={12} /> Add more accounts
                            <span className="text-[10px] opacity-80 font-normal">${limits.addon_unit_price_usd}/mo each</span>
                        </button>
                    )}
                    <button
                        onClick={handleConnect}
                        disabled={connecting || (limits != null && limits.available <= 0)}
                        title={limits != null && limits.available <= 0 ? 'Buy an add-on slot first - your tier limit is reached.' : undefined}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {connecting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        {connecting ? 'Opening…' : 'Connect account'}
                    </button>
                </div>
            </div>

            {limits && limits.available <= 0 && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/60 border border-amber-200">
                    <AlertTriangle size={13} className="text-amber-700 mt-0.5 shrink-0" />
                    <div className="text-[0.75rem] text-amber-900">
                        <span className="font-semibold">You&apos;ve hit your {limits.tier} tier limit ({limits.effective_limit} {limits.effective_limit === 1 ? 'account' : 'accounts'}).</span>{' '}
                        Add more accounts for <span className="font-semibold">${limits.addon_unit_price_usd}/account/month</span> - or upgrade your plan for more included slots.
                    </div>
                </div>
            )}

            {showAddonModal && limits && (
                <AddonPurchaseModal
                    limits={limits}
                    purchasing={purchasing}
                    onClose={() => setShowAddonModal(false)}
                    onPurchase={handlePurchaseAddon}
                />
            )}

            <PostConnectOnboardingModal
                open={showOnboarding}
                onClose={() => setShowOnboarding(false)}
            />

            <ConfirmActionModal
                isOpen={!!pendingDisconnect}
                title="Disconnect LinkedIn account?"
                icon="🔌"
                message={pendingDisconnect ? `${pendingDisconnect.name} will stop receiving Unipile events immediately.` : ''}
                consequences={pendingDisconnect ? [
                    ...(pendingDisconnect.inCampaigns > 0 ? [
                        `${pendingDisconnect.inCampaigns} active campaign${pendingDisconnect.inCampaigns === 1 ? '' : 's'} use this sender - they'll stop sending until you attach a replacement or pause them.`,
                    ] : []),
                    'If this account was on a paid add-on slot, the slot is released so you stop being billed.',
                ] : []}
                confirmLabel="Disconnect"
                variant="danger"
                loading={disconnecting}
                onConfirm={confirmDisconnect}
                onCancel={() => !disconnecting && setPendingDisconnect(null)}
            />


            <div className="flex items-center gap-2 flex-wrap">
                <div className="relative flex-1 max-w-md">
                    <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text" value={search} onChange={e => setSearch(e.target.value)}
                        placeholder="Search accounts by name…"
                        className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none bg-white"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                </div>
                <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg outline-none bg-white cursor-pointer"
                    style={{ border: '1px solid #D1CBC5' }}>
                    <option value="all">All types</option>
                    <option value="CLASSIC">Classic</option>
                    <option value="PREMIUM">Premium</option>
                    <option value="SALES_NAV">Sales Navigator</option>
                    <option value="RECRUITER">Recruiter</option>
                </select>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                    className="text-xs px-3 py-1.5 rounded-lg outline-none bg-white cursor-pointer"
                    style={{ border: '1px solid #D1CBC5' }}>
                    <option value="all">All statuses</option>
                    <option value="OK">Connected</option>
                    <option value="CONNECTING">Connecting</option>
                    <option value="CREDENTIALS">Re-auth needed</option>
                    <option value="ERROR">Error</option>
                </select>
                {(search || typeFilter !== 'all' || statusFilter !== 'all') && (
                    <button onClick={() => { setSearch(''); setTypeFilter('all'); setStatusFilter('all'); }}
                        className="text-[11px] text-gray-500 hover:text-gray-900 underline decoration-dotted">Clear</button>
                )}
            </div>

            {loading ? (
                <div className="premium-card flex items-center justify-center py-16 text-sm text-gray-500">
                    <Loader2 size={14} className="animate-spin mr-2" /> Loading accounts…
                </div>
            ) : error ? (
                <div className="premium-card flex flex-col items-center justify-center py-12">
                    <p className="text-sm text-rose-600 mb-3">{error}</p>
                    <button onClick={() => { setLoading(true); fetchAccounts(); }}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800">
                        Retry
                    </button>
                </div>
            ) : accounts.length === 0 ? (
                <div className="premium-card flex flex-col items-center justify-center py-16">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mb-3">
                        <Linkedin size={20} className="text-blue-600" />
                    </div>
                    <h2 className="text-lg font-bold text-gray-900 mb-1">No LinkedIn accounts connected</h2>
                    <p className="text-sm text-gray-500 text-center max-w-md mb-5">
                        Connect a LinkedIn account via Unipile to start sending connection requests, monitoring engagement signals, and running campaigns.
                    </p>
                    <button onClick={handleConnect} disabled={connecting}
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
                        {connecting ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                        Connect your first account
                    </button>
                </div>
            ) : (
                <div className="premium-card !p-0 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#D1CBC5]">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Account</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[170px]">Invites today</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[170px]">Invites this week</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider min-w-[170px]">Messages today</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Sync mode</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">In campaigns</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(a => {
                                const status = STATUS_BADGE[a.status] || STATUS_BADGE.ERROR;
                                return (
                                    <tr key={a.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => { window.location.href = `/dashboard/linkedin/accounts/${a.id}`; }}>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${tintFor(a.display_name)} flex items-center justify-center text-xs font-semibold text-gray-700`}>
                                                    {initials(a.display_name)}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-semibold text-gray-900 hover:underline">{a.display_name}</div>
                                                    <div className="text-[0.7rem] text-gray-500 flex items-center gap-1">
                                                        <Linkedin size={9} /> unipile · {a.unipile_account_id.slice(0, 12)}…
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_BADGE[a.account_type]}`}>
                                                {a.account_type.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.tint}`}>
                                                {status.icon} {status.label}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3"><CapacityBar value={a.invites_today} max={a.invites_today_max} /></td>
                                        <td className="px-4 py-3"><CapacityBar value={a.invites_week} max={a.invites_week_max} /></td>
                                        <td className="px-4 py-3"><CapacityBar value={a.msgs_today} max={a.msgs_today_max} /></td>
                                        <td className="px-4 py-3">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.65rem] font-medium bg-gray-50 text-gray-700">
                                                {a.inbox_sync_mode === 'all' ? 'All threads' : 'Sequence only'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {a.in_campaigns > 0 ? <span className="text-blue-700 font-semibold text-sm">{a.in_campaigns}</span> : <span className="text-gray-400">-</span>}
                                        </td>
                                        <td className="px-2 py-3 text-right relative">
                                            <button onClick={() => setOpenMenu(openMenu === a.id ? null : a.id)}
                                                className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                                                <MoreHorizontal size={14} />
                                            </button>
                                            {openMenu === a.id && (
                                                <div className="absolute right-2 top-9 z-10 w-44 rounded-lg bg-white shadow-lg overflow-hidden"
                                                    style={{ border: '1px solid #D1CBC5' }}>
                                                    <button onClick={() => handleReconnect(a.id)}
                                                        className="w-full text-left px-3 py-2 text-xs hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                                                        <RefreshCcw size={11} /> Reconnect
                                                    </button>
                                                    <button onClick={() => requestDisconnect(a.id, a.display_name, a.in_campaigns)}
                                                        className="w-full text-left px-3 py-2 text-xs hover:bg-rose-50 flex items-center gap-2 text-rose-700 border-t border-[#D1CBC5]">
                                                        <AlertTriangle size={11} /> Disconnect
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}

            <p className="text-[0.7rem] text-gray-500">
                Tip: each connected account should run in at most 2 active campaigns at a time - LinkedIn&apos;s 40-action daily cap is shared across every campaign the account belongs to, so spreading thin slows all of them. New accounts should ramp at 20–25 CR/day.
            </p>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// AddonPurchaseModal - quantity stepper + price summary.
// Surfaced when the org hits its tier-default cap (or clicks the
// dedicated "Buy add-on slot" button).
// ────────────────────────────────────────────────────────────────────

function AddonPurchaseModal({
    limits,
    purchasing,
    onClose,
    onPurchase,
}: {
    limits: LimitSummary;
    purchasing: boolean;
    onClose: () => void;
    onPurchase: (qty: number) => void;
}) {
    const [qty, setQty] = useState(1);
    const total = qty * limits.addon_unit_price_usd;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
            onClick={onClose}
        >
            <div
                className="bg-white rounded-xl shadow-2xl w-[440px] max-w-[92vw] overflow-hidden"
                style={{ border: '1px solid #D1CBC5' }}
                onClick={e => e.stopPropagation()}
            >
                <div className="px-5 py-4 border-b border-[#D1CBC5]">
                    <h2 className="text-base font-bold text-gray-900">Add LinkedIn account slots</h2>
                    <p className="text-[0.75rem] text-gray-500 mt-0.5">
                        Your <span className="capitalize font-semibold">{limits.tier}</span> plan includes <span className="font-semibold">{limits.base_limit}</span> account{limits.base_limit === 1 ? '' : 's'}.
                        Buy extra slots at ${limits.addon_unit_price_usd}/account/month.
                    </p>
                </div>
                <div className="p-5 space-y-4">
                    <div className="flex items-center justify-between gap-4">
                        <span className="text-sm font-semibold text-gray-700">How many slots?</span>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setQty(Math.max(1, qty - 1))}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold hover:bg-gray-100"
                                style={{ border: '1px solid #D1CBC5' }}>−</button>
                            <span className="w-10 text-center text-sm font-bold tabular-nums">{qty}</span>
                            <button onClick={() => setQty(Math.min(20, qty + 1))}
                                className="w-7 h-7 rounded-md flex items-center justify-center text-sm font-bold hover:bg-gray-100"
                                style={{ border: '1px solid #D1CBC5' }}>+</button>
                        </div>
                    </div>
                    <div className="rounded-lg bg-[#F7F2EB]/60 p-3 space-y-1.5" style={{ border: '1px solid #D1CBC5' }}>
                        <div className="flex justify-between text-[0.75rem] text-gray-700">
                            <span>New cap</span>
                            <span className="font-semibold tabular-nums">{limits.effective_limit} → {limits.effective_limit + qty} accounts</span>
                        </div>
                        <div className="flex justify-between text-[0.75rem] text-gray-700">
                            <span>Monthly charge</span>
                            <span className="font-semibold tabular-nums">${total}/mo</span>
                        </div>
                        <div className="text-[0.65rem] text-gray-500 pt-1">
                            Billed on your next Polar invoice. Pro-rated for the remainder of the current cycle.
                        </div>
                    </div>
                </div>
                <div className="px-5 py-3 bg-[#F7F2EB]/40 border-t border-[#D1CBC5] flex justify-end gap-2">
                    <button onClick={onClose} disabled={purchasing}
                        className="px-3 py-2 text-sm font-semibold rounded-lg hover:bg-gray-100 text-gray-700">
                        Cancel
                    </button>
                    <button onClick={() => onPurchase(qty)} disabled={purchasing}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 disabled:opacity-50">
                        {purchasing ? <Loader2 size={14} className="animate-spin" /> : null}
                        {purchasing ? 'Processing…' : `Buy ${qty} slot${qty > 1 ? 's' : ''} · $${total}/mo`}
                    </button>
                </div>
            </div>
        </div>
    );
}
