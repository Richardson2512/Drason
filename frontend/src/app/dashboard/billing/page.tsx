'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import type { SubscriptionData, Invoice, TierInfo } from '@/types/api';

const TIER_INFO: Record<string, TierInfo> = {
    trial: {
        name: 'Free Trial',
        price: '$0',
        limits: { leads: 10000, domains: 20, mailboxes: 75 },
        color: '#6B7280'
    },
    starter: {
        name: 'Starter',
        price: '$49',
        limits: { leads: 10000, domains: 20, mailboxes: 75 },
        color: '#3b82f6'
    },
    growth: {
        name: 'Growth',
        price: '$199',
        limits: { leads: 50000, domains: 75, mailboxes: 350 },
        color: '#8b5cf6'
    },
    scale: {
        name: 'Scale',
        price: '$349',
        limits: { leads: 100000, domains: 150, mailboxes: 700 },
        color: '#22c55e'
    },
    enterprise: {
        name: 'Enterprise',
        price: 'Custom',
        limits: { leads: Infinity, domains: Infinity, mailboxes: Infinity },
        color: '#f59e0b'
    }
};

function BillingContent() {
    const searchParams = useSearchParams();
    const [data, setData] = useState<SubscriptionData | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
    const [refreshingUsage, setRefreshingUsage] = useState(false);
    const [activeTab, setActiveTab] = useState<'usage' | 'billing'>('usage');

    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) setActionLoading(false);
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') setActionLoading(false);
        };
        window.addEventListener('pageshow', handlePageShow);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('pageshow', handlePageShow);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    const fetchSubscription = async () => {
        try {
            const result = await apiClient<SubscriptionData>('/api/billing/subscription');
            setData(result);
        } catch (err: any) {
            setError(err.message || 'Failed to load subscription data');
        } finally {
            setLoading(false);
        }
    };

    const fetchInvoices = async () => {
        setInvoicesLoading(true);
        try {
            const result = await apiClient<{ invoices: Invoice[] }>('/api/billing/invoices');
            setInvoices(result?.invoices || []);
        } catch {
            // Invoices endpoint may not exist yet — graceful fallback
            setInvoices([]);
        } finally {
            setInvoicesLoading(false);
        }
    };

    const handleUpgrade = async (tier: string) => {
        setActionLoading(true);
        try {
            const result = await apiClient<{ checkoutUrl: string }>('/api/billing/create-checkout', {
                method: 'POST',
                body: JSON.stringify({ tier })
            });
            window.location.href = result.checkoutUrl;
        } catch (err: any) {
            setError(err.message || 'Failed to create checkout');
            setActionLoading(false);
        }
    };

    const handleCancel = async () => {
        if (!confirm('Are you sure you want to cancel your subscription? You\'ll retain access until the end of your billing period.')) {
            return;
        }
        setActionLoading(true);
        try {
            await apiClient('/api/billing/cancel', { method: 'POST' });
            setError('Subscription canceled. Access will continue until billing period ends.');
            await fetchSubscription();
        } catch (err: any) {
            setError(err.message || 'Failed to cancel subscription');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRefreshUsage = async () => {
        setRefreshingUsage(true);
        try {
            await apiClient('/api/billing/refresh-usage', { method: 'POST' });
            await fetchSubscription();
        } catch (err: any) {
            console.error('Failed to refresh usage:', err);
        } finally {
            setRefreshingUsage(false);
        }
    };

    const getDaysRemaining = (): number | null => {
        if (!data?.subscription.trialEndsAt) return null;
        const endDate = new Date(data.subscription.trialEndsAt);
        const now = new Date();
        const diff = endDate.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    };

    const getUsagePercentage = (current: number, limit: number): number => {
        if (limit === Infinity) return 0;
        return Math.min(100, (current / limit) * 100);
    };

    useEffect(() => {
        fetchSubscription();
        fetchInvoices();

        const upgradeTier = searchParams.get('upgrade');
        if (upgradeTier && ['starter', 'growth', 'scale'].includes(upgradeTier)) {
            const url = new URL(window.location.href);
            url.searchParams.delete('upgrade');
            window.history.replaceState({}, '', url.toString());
            setTimeout(() => { handleUpgrade(upgradeTier); }, 500);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const getStatusBadge = (status: string) => {
        const statusColors: Record<string, { bg: string; text: string; label: string }> = {
            trialing: { bg: '#DBEAFE', text: '#1E40AF', label: 'Trial Active' },
            active: { bg: '#D1FAE5', text: '#065F46', label: 'Active' },
            past_due: { bg: '#FEE2E2', text: '#991B1B', label: 'Payment Due' },
            canceled: { bg: '#FEF3C7', text: '#92400E', label: 'Canceled' },
            expired: { bg: '#F3F4F6', text: '#1F2937', label: 'Expired' }
        };
        const config = statusColors[status] || statusColors.active;
        return (
            <span
                className="px-4 py-2 rounded-full text-sm font-semibold"
                style={{ background: config.bg, color: config.text }}
            >
                {config.label}
            </span>
        );
    };

    const getInvoiceStatusStyle = (status: string) => {
        switch (status) {
            case 'paid': return { bg: '#D1FAE5', text: '#065F46' };
            case 'pending': return { bg: '#FEF3C7', text: '#92400E' };
            case 'failed': return { bg: '#FEE2E2', text: '#991B1B' };
            default: return { bg: '#F3F4F6', text: '#374151' };
        }
    };

    if (loading) {
        return (
            <div className="p-8">
                <LoadingSkeleton type="stat" rows={3} />
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="premium-card">
                <div className="p-8 text-center text-red-500">{error}</div>
            </div>
        );
    }

    const currentTier = data?.subscription.tier || 'trial';
    const tierInfo = TIER_INFO[currentTier] || TIER_INFO.trial;
    const daysRemaining = getDaysRemaining();

    return (
        <div className="p-8">
            {/* Page Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Billing & Usage</h1>
                <p className="text-base text-slate-500">Manage your subscription, view usage, and download invoices.</p>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-1 p-1 rounded-xl mb-6 w-fit bg-slate-100">
                {(['usage', 'billing'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className="rounded-[10px] border-none text-sm font-semibold cursor-pointer transition-all duration-200 px-6 py-2.5"
                        style={{
                            background: activeTab === tab ? '#FFFFFF' : 'transparent',
                            color: activeTab === tab ? '#111827' : '#64748B',
                            boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                        }}
                    >
                        {tab === 'usage' ? 'Usage' : 'Billing'}
                    </button>
                ))}
            </div>

            {/* Warnings (shown on both tabs) */}
            {data?.subscription.status === 'trialing' && daysRemaining !== null && daysRemaining < 7 && (
                <div className="px-6 py-4 rounded-xl border mb-6 flex items-center gap-4 bg-amber-50 border-yellow-300">
                    <span className="text-2xl">⏰</span>
                    <p className="m-0 font-semibold text-[#92400E] text-[0.9rem]">
                        Your free trial ends in <strong>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>. Add payment details to continue with the {tierInfo.name} plan ({tierInfo.price}/mo).
                    </p>
                </div>
            )}
            {data?.subscription.status === 'expired' && (
                <div className="px-6 py-4 rounded-xl border mb-6 flex items-center gap-4 bg-red-100 border-red-300">
                    <span className="text-2xl">⛔</span>
                    <p className="m-0 font-semibold text-[#991B1B] text-[0.9rem]">
                        Your trial has expired. Subscribe to a plan below to restore access to your account.
                    </p>
                </div>
            )}
            {error && (
                <div className="px-6 py-4 rounded-xl border mb-6 bg-red-100 border-red-300 text-[#991B1B] text-[0.9rem]">
                    {error}
                </div>
            )}

            {/* ==================== USAGE TAB ==================== */}
            {activeTab === 'usage' && (
                <div className="grid gap-6">
                    {/* Current Plan Card */}
                    <div className="premium-card" style={{ borderLeft: `6px solid ${tierInfo.color}` }}>
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <div className="text-xs font-semibold uppercase mb-1 text-[#94A3B8]">Current Plan</div>
                                <div className="text-2xl font-extrabold" style={{ color: tierInfo.color }}>
                                    {tierInfo.name}
                                    {data?.subscription.status === 'trialing' && currentTier !== 'trial' && (
                                        <span className="text-sm font-semibold ml-2 text-emerald-500">
                                            (Free Trial)
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                {getStatusBadge(data?.subscription.status || 'trialing')}
                                <div className="text-right">
                                    {data?.subscription.status === 'trialing' ? (
                                        <>
                                            <div className="text-3xl font-extrabold text-emerald-500">$0</div>
                                            <div className="text-xs text-slate-500">Then {tierInfo.price}/mo</div>
                                        </>
                                    ) : (
                                        <div className="text-3xl font-extrabold text-gray-900">
                                            {tierInfo.price}<span className="text-base font-normal text-slate-500">/mo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                        {data?.subscription.status === 'trialing' && daysRemaining !== null && (
                            <div className="text-sm font-semibold p-3 rounded-lg text-emerald-500 bg-emerald-100">
                                ✓ {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining in your free trial
                            </div>
                        )}
                        {data?.subscription.status === 'active' && (
                            <div className="flex gap-6 flex-wrap text-sm text-slate-500">
                                {data.subscription.subscriptionStartedAt && (
                                    <div>Billing started: <strong>{new Date(data.subscription.subscriptionStartedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
                                )}
                                {data.subscription.nextBillingDate && (
                                    <div>Next bill: <strong>{new Date(data.subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Emails Validated */}
                    <div className="premium-card">
                        <div className="flex items-center justify-between">
                            <div>
                                <div className="text-xs font-semibold uppercase mb-1 text-[#94A3B8]">Total Emails Validated</div>
                                <div className="text-2xl font-extrabold text-gray-900">
                                    {(data?.usage.emailsValidated ?? 0).toLocaleString()}
                                </div>
                                <div className="text-sm mt-1 text-slate-500">
                                    Lifetime validations across all sources (internal + MillionVerifier)
                                </div>
                            </div>
                            <div className="text-3xl">✉️</div>
                        </div>
                    </div>

                    {/* Resource Usage */}
                    <div className="premium-card">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold text-slate-800">Resource Usage</h3>
                            <button
                                onClick={handleRefreshUsage}
                                disabled={refreshingUsage}
                                className="text-xs font-semibold rounded-lg border transition-all duration-200 px-3 py-1.5 text-[#475569] border-[#E2E8F0]"
                                style={{
                                    background: refreshingUsage ? '#E5E7EB' : '#F8FAFC',
                                    cursor: refreshingUsage ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {refreshingUsage ? 'Refreshing...' : 'Refresh Usage'}
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {[
                                { label: 'Active Leads', current: data?.usage.leads || 0, limit: data?.limits.leads || 0, icon: '📧' },
                                { label: 'Domains', current: data?.usage.domains || 0, limit: data?.limits.domains || 0, icon: '🌐' },
                                { label: 'Mailboxes', current: data?.usage.mailboxes || 0, limit: data?.limits.mailboxes || 0, icon: '📮' }
                            ].map(({ label, current, limit, icon }) => {
                                const percentage = getUsagePercentage(current, limit);
                                const isNearLimit = percentage > 80;
                                return (
                                    <div key={label} className="p-6 bg-white rounded-xl" style={{
                                        border: isNearLimit ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                                        boxShadow: isNearLimit ? '0 4px 12px rgba(245, 158, 11, 0.15)' : 'none'
                                    }}>
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-2xl">{icon}</span>
                                            <div>
                                                <div className="text-xs font-semibold uppercase text-[#94A3B8]">{label}</div>
                                                <div className="text-2xl font-extrabold text-gray-900">
                                                    {current.toLocaleString()} <span className="text-sm font-normal text-[#94A3B8]">/ {limit === Infinity ? '∞' : limit.toLocaleString()}</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="w-full h-2 rounded-full overflow-hidden bg-slate-100">
                                            <div className="h-full rounded-full transition-all duration-300" style={{
                                                width: `${percentage}%`,
                                                background: isNearLimit ? '#F59E0B' : tierInfo.color,
                                            }} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Upgrade Options */}
                    {currentTier !== 'scale' && currentTier !== 'enterprise' && data?.subscription.status !== 'canceled' && (
                        <div className="premium-card">
                            <h3 className="text-lg font-bold mb-5 text-slate-800">
                                {data?.subscription.status === 'trialing' ? 'Continue or Switch Plans' : data?.subscription.status === 'active' ? 'Upgrade Your Plan' : 'Choose a Plan'}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {Object.entries(TIER_INFO)
                                    .filter(([key]) => !['trial', 'enterprise'].includes(key))
                                    .map(([key, info]) => {
                                        const isCurrentTier = key === currentTier;
                                        const tierOrder: Record<string, number> = { trial: 0, starter: 1, growth: 2, scale: 3, enterprise: 4 };
                                        const currentTierRank = tierOrder[currentTier] || 0;
                                        const thisTierRank = tierOrder[key] || 0;
                                        const isLowerTier = thisTierRank <= currentTierRank && !isCurrentTier;
                                        if (data?.subscription.status === 'active' && isLowerTier) return null;

                                        const buttonText = data?.subscription.status === 'trialing'
                                            ? (isCurrentTier ? `Continue with ${info.name}` : `Switch to ${info.name}`)
                                            : data?.subscription.status === 'active'
                                                ? `Upgrade to ${info.name}`
                                                : `Subscribe to ${info.name}`;

                                        return (
                                            <div key={key} className="p-6 rounded-2xl relative" style={{
                                                border: isCurrentTier ? `2px solid ${info.color}` : '1px solid #E2E8F0',
                                                background: isCurrentTier ? `${info.color}10` : '#FFFFFF',
                                            }}>
                                                {isCurrentTier && data?.subscription.status === 'trialing' && (
                                                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-white px-4 py-1 rounded-full text-xs font-bold" style={{ background: info.color }}>
                                                        CURRENT TRIAL
                                                    </div>
                                                )}
                                                <div className={`mb-4 ${isCurrentTier && data?.subscription.status === 'trialing' ? 'mt-2' : 'mt-0'}`}>
                                                    <div className="text-xl font-extrabold mb-1" style={{ color: info.color }}>{info.name}</div>
                                                    <div className="font-extrabold text-gray-900 text-[1.75rem]">{info.price}<span className="text-sm font-normal text-slate-500">/mo</span></div>
                                                </div>
                                                <div className="mb-6 text-sm leading-relaxed text-slate-500">
                                                    <div>✓ {info.limits.leads.toLocaleString()} leads</div>
                                                    <div>✓ {info.limits.domains} domains</div>
                                                    <div>✓ {info.limits.mailboxes} mailboxes</div>
                                                </div>
                                                <button
                                                    onClick={() => handleUpgrade(key)}
                                                    disabled={actionLoading || (data?.subscription.status === 'active' && isCurrentTier)}
                                                    className="btn-hover-scale w-full p-3 text-white border-none rounded-lg text-sm font-bold transition-all duration-200"
                                                    style={{
                                                        background: info.color,
                                                        cursor: (actionLoading || (data?.subscription.status === 'active' && isCurrentTier)) ? 'not-allowed' : 'pointer',
                                                        opacity: (actionLoading || (data?.subscription.status === 'active' && isCurrentTier)) ? 0.6 : 1,
                                                    }}
                                                >
                                                    {actionLoading ? 'Processing...' : (data?.subscription.status === 'active' && isCurrentTier) ? 'Current Plan' : buttonText}
                                                </button>
                                            </div>
                                        );
                                    })}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* ==================== BILLING TAB ==================== */}
            {activeTab === 'billing' && (
                <div className="grid gap-6">
                    {/* Payment Overview */}
                    <div className="premium-card" style={{ borderLeft: `6px solid ${tierInfo.color}` }}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-xl font-bold text-gray-900 mb-1">Payment Status</h2>
                                <p className="text-sm text-slate-500">Your current subscription and billing details.</p>
                            </div>
                            {getStatusBadge(data?.subscription.status || 'trialing')}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="p-5 rounded-xl border bg-slate-50 border-slate-100">
                                <div className="text-xs font-semibold uppercase mb-2 text-[#94A3B8]">Plan</div>
                                <div className="text-xl font-extrabold" style={{ color: tierInfo.color }}>{tierInfo.name}</div>
                                <div className="text-sm mt-1 text-slate-500">{tierInfo.price}/mo</div>
                            </div>
                            <div className="p-5 rounded-xl border bg-slate-50 border-slate-100">
                                <div className="text-xs font-semibold uppercase mb-2 text-[#94A3B8]">Next Payment</div>
                                <div className="text-xl font-extrabold text-gray-900">
                                    {data?.subscription.nextBillingDate
                                        ? new Date(data.subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : '—'}
                                </div>
                                <div className="text-sm mt-1 text-slate-500">
                                    {data?.subscription.status === 'trialing' ? 'After trial ends' : 'Recurring'}
                                </div>
                            </div>
                            <div className="p-5 rounded-xl border bg-slate-50 border-slate-100">
                                <div className="text-xs font-semibold uppercase mb-2 text-[#94A3B8]">Billing Started</div>
                                <div className="text-xl font-extrabold text-gray-900">
                                    {data?.subscription.subscriptionStartedAt
                                        ? new Date(data.subscription.subscriptionStartedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : data?.subscription.trialStartedAt
                                            ? new Date(data.subscription.trialStartedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : '—'}
                                </div>
                                <div className="text-sm mt-1 text-slate-500">
                                    {data?.subscription.subscriptionStartedAt ? 'Subscription start' : 'Trial start'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoices */}
                    <div className="premium-card">
                        <div className="flex justify-between items-center mb-5">
                            <div>
                                <h3 className="text-lg font-bold mb-1 text-slate-800">Invoices</h3>
                                <p className="text-sm text-slate-500">View and download your payment history.</p>
                            </div>
                        </div>

                        {invoicesLoading ? (
                            <LoadingSkeleton type="list" rows={4} />
                        ) : invoices.length > 0 ? (
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100">
                                            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Date</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Amount</th>
                                            <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Status</th>
                                            <th className="text-right px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#94A3B8]">Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((invoice) => {
                                            const statusStyle = getInvoiceStatusStyle(invoice.status);
                                            return (
                                                <tr key={invoice.id} className="border-b border-slate-100">
                                                    <td className="p-4 text-sm font-medium text-gray-700">
                                                        {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td className="p-4 text-sm font-bold text-gray-900">
                                                        ${(invoice.amount / 100).toFixed(2)} {invoice.currency?.toUpperCase() || 'USD'}
                                                    </td>
                                                    <td className="p-4">
                                                        <span
                                                            className="px-3 py-1 rounded-full text-xs font-semibold capitalize"
                                                            style={{ background: statusStyle.bg, color: statusStyle.text }}
                                                        >
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td className="p-4 text-right">
                                                        {(invoice.url || invoice.id) ? (
                                                            <a
                                                                href={invoice.url || `/api/billing/invoices/${invoice.id}/pdf`}
                                                                download
                                                                className="btn-hover-blue inline-flex items-center gap-1.5 text-sm font-semibold no-underline px-3 py-1.5 rounded-md transition-all duration-200 text-blue-500"
                                                            >
                                                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                                                                PDF
                                                            </a>
                                                        ) : (
                                                            <span className="text-sm text-[#94A3B8]">—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div className="py-12 px-8 text-center rounded-xl border bg-slate-50 border-slate-100">
                                <div className="text-3xl mb-3">📄</div>
                                <div className="text-base font-semibold text-gray-700 mb-1">No invoices yet</div>
                                <p className="text-sm m-0 text-[#94A3B8]">
                                    Invoices will appear here once you subscribe to a paid plan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Cancel Subscription */}
                    {data?.subscription.status === 'active' && (
                        <div className="premium-card border border-red-100">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-bold mb-1 text-[#991B1B]">Cancel Subscription</h3>
                                    <p className="text-sm m-0 text-slate-500">
                                        You'll retain access until the end of your current billing period.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                    className="btn-hover-red bg-white text-red-500 border rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-200 px-5 py-2.5 border-red-300"
                                    style={{
                                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                                        opacity: actionLoading ? 0.6 : 1,
                                    }}
                                >
                                    Cancel Subscription
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div className="p-8">
                <LoadingSkeleton type="card" rows={2} />
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}
