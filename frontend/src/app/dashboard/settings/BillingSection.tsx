'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import type { SubscriptionData, TierInfo } from '@/types/api';

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

export default function BillingSection() {
    const [data, setData] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchSubscription();
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
            <span className="py-2 px-4 rounded-full text-sm font-semibold" style={{
                background: config.bg,
                color: config.text
            }}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="premium-card mb-3">
                <LoadingSkeleton type="card" rows={2} />
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="premium-card mb-3">
                <div className="p-8 text-center text-red-500">{error}</div>
            </div>
        );
    }

    const currentTier = data?.subscription.tier || 'trial';
    const tierInfo = TIER_INFO[currentTier] || TIER_INFO.trial;
    const daysRemaining = getDaysRemaining();

    return (
        <div className="premium-card mb-3" style={{ borderLeft: `6px solid ${tierInfo.color}` }}>
            {/* Header */}
            <div className="flex justify-between items-start mb-3">
                <div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">Subscription & Billing</h2>
                    <p className="text-slate-500 text-base leading-relaxed">
                        Manage your subscription, view usage, and upgrade your plan.
                    </p>
                </div>
                <div className="text-right">
                    {getStatusBadge(data?.subscription.status || 'trialing')}
                </div>
            </div>

            {/* Trial Warning */}
            {data?.subscription.status === 'trialing' && daysRemaining !== null && daysRemaining < 7 && (
                <div className="py-4 px-6 bg-amber-50 rounded-xl border border-yellow-300 mb-3 flex items-center gap-4">
                    <span className="text-2xl">⏰</span>
                    <div>
                        <p className="text-amber-800 text-[0.9rem] m-0 font-semibold">
                            Your trial ends in <strong>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>. Upgrade now to continue using Superkabe.
                        </p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="py-4 px-6 bg-red-100 rounded-xl border border-red-300 mb-3 text-red-800 text-[0.9rem]">
                    {error}
                </div>
            )}

            {/* Current Plan */}
            <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 mb-3">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <div className="text-xs text-slate-400 font-semibold uppercase mb-1">Current Plan</div>
                        <div className="text-2xl font-bold" style={{ color: tierInfo.color }}>{tierInfo.name}</div>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{tierInfo.price}<span className="text-base text-slate-500 font-normal">/mo</span></div>
                </div>
                {data?.subscription.nextBillingDate && (
                    <div className="text-sm text-slate-500">
                        Next billing date: <strong>{new Date(data.subscription.nextBillingDate).toLocaleDateString()}</strong>
                    </div>
                )}
            </div>

            {/* Usage Metrics */}
            <h3 className="text-lg font-bold mb-4 text-slate-800">Resource Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                {[
                    { label: 'Active Leads', current: data?.usage.leads || 0, limit: data?.limits.leads || 0, icon: '📧' },
                    { label: 'Domains (protection)', current: data?.usage.domains || 0, limit: data?.limits.domains || 0, icon: '🌐' },
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
                                    <div className="text-xs text-slate-400 font-semibold uppercase">{label}</div>
                                    <div className="text-2xl font-bold text-gray-900">
                                        {current.toLocaleString()} <span className="text-sm text-slate-400 font-normal">/ {limit === Infinity ? '∞' : limit.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div className="h-full rounded-full transition-all duration-300" style={{
                                    width: `${percentage}%`,
                                    background: isNearLimit ? '#F59E0B' : tierInfo.color
                                }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Upgrade Options */}
            {currentTier !== 'scale' && currentTier !== 'enterprise' && data?.subscription.status !== 'canceled' && (
                <>
                    <h3 className="text-lg font-bold mb-4 text-slate-800">Upgrade Your Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                        {Object.entries(TIER_INFO)
                            .filter(([key]) => !['trial', 'enterprise'].includes(key) && key !== currentTier)
                            .map(([key, info]) => (
                                <div
                                    key={key}
                                    className="p-6 rounded-2xl border border-slate-200 bg-white"
                                >
                                    <div className="mb-4">
                                        <div className="text-xl font-bold mb-1" style={{ color: info.color }}>{info.name}</div>
                                        <div className="text-2xl font-bold text-gray-900">{info.price}<span className="text-sm text-slate-500 font-normal">/mo</span></div>
                                    </div>
                                    <div className="mb-3 text-sm text-slate-500 leading-relaxed">
                                        <div>✓ {info.limits.leads.toLocaleString()} leads</div>
                                        <div>✓ {info.limits.domains} domains <span className="text-xs text-slate-400">(protection limit)</span></div>
                                        <div>✓ {info.limits.mailboxes} mailboxes</div>
                                    </div>
                                    <button
                                        onClick={() => handleUpgrade(key)}
                                        disabled={actionLoading}
                                        className="btn-hover-scale w-full p-3 text-white border-none rounded-lg text-sm font-bold transition-all duration-200"
                                        style={{
                                            background: info.color,
                                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                                            opacity: actionLoading ? 0.6 : 1
                                        }}
                                    >
                                        {actionLoading ? 'Processing...' : `Upgrade to ${info.name}`}
                                    </button>
                                </div>
                            ))}
                    </div>
                </>
            )}

            {/* Cancel Subscription */}
            {data?.subscription.status === 'active' && (
                <div className="pt-8 border-t border-slate-200">
                    <button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        className="btn-hover-red py-3 px-6 bg-white text-red-500 border border-red-300 rounded-lg text-sm font-semibold transition-all duration-200"
                        style={{
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1
                        }}
                    >
                        Cancel Subscription
                    </button>
                </div>
            )}
        </div>
    );
}
