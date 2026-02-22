'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface SubscriptionData {
    subscription: {
        tier: string;
        status: string;
        trialStartedAt: string | null;
        trialEndsAt: string | null;
        subscriptionStartedAt: string | null;
        nextBillingDate: string | null;
    };
    usage: {
        leads: number;
        domains: number;
        mailboxes: number;
    };
    limits: {
        leads: number;
        domains: number;
        mailboxes: number;
    };
}

interface TierInfo {
    name: string;
    price: string;
    limits: {
        leads: number;
        domains: number;
        mailboxes: number;
    };
    color: string;
}

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
            <span style={{
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                background: config.bg,
                color: config.text,
                fontSize: '0.875rem',
                fontWeight: 600
            }}>
                {config.label}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="premium-card" style={{ marginBottom: '2.5rem' }}>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading billing information...</div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="premium-card" style={{ marginBottom: '2.5rem' }}>
                <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>{error}</div>
            </div>
        );
    }

    const currentTier = data?.subscription.tier || 'trial';
    const tierInfo = TIER_INFO[currentTier] || TIER_INFO.trial;
    const daysRemaining = getDaysRemaining();

    return (
        <div className="premium-card" style={{ marginBottom: '2.5rem', borderLeft: `6px solid ${tierInfo.color}` }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Subscription & Billing</h2>
                    <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: '1.5' }}>
                        Manage your subscription, view usage, and upgrade your plan.
                    </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                    {getStatusBadge(data?.subscription.status || 'trialing')}
                </div>
            </div>

            {/* Trial Warning */}
            {data?.subscription.status === 'trialing' && daysRemaining !== null && daysRemaining < 7 && (
                <div style={{
                    padding: '1rem 1.5rem',
                    background: '#FEF3C7',
                    borderRadius: '12px',
                    border: '1px solid #FDE047',
                    marginBottom: '1.5rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem'
                }}>
                    <span style={{ fontSize: '1.5rem' }}>⏰</span>
                    <div>
                        <p style={{ color: '#92400E', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                            Your trial ends in <strong>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>. Upgrade now to continue using Drason.
                        </p>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '1rem 1.5rem',
                    background: '#FEE2E2',
                    borderRadius: '12px',
                    border: '1px solid #FCA5A5',
                    marginBottom: '1.5rem',
                    color: '#991B1B',
                    fontSize: '0.9rem'
                }}>
                    {error}
                </div>
            )}

            {/* Current Plan */}
            <div style={{
                padding: '1.5rem',
                background: '#F8FAFC',
                borderRadius: '16px',
                border: '1px solid #F1F5F9',
                marginBottom: '2rem'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                        <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.25rem' }}>Current Plan</div>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: tierInfo.color }}>{tierInfo.name}</div>
                    </div>
                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>{tierInfo.price}<span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 400 }}>/mo</span></div>
                </div>
                {data?.subscription.nextBillingDate && (
                    <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                        Next billing date: <strong>{new Date(data.subscription.nextBillingDate).toLocaleDateString()}</strong>
                    </div>
                )}
            </div>

            {/* Usage Metrics */}
            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1E293B' }}>Resource Usage</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
                {[
                    { label: 'Active Leads', current: data?.usage.leads || 0, limit: data?.limits.leads || 0, icon: '📧' },
                    { label: 'Domains', current: data?.usage.domains || 0, limit: data?.limits.domains || 0, icon: '🌐' },
                    { label: 'Mailboxes', current: data?.usage.mailboxes || 0, limit: data?.limits.mailboxes || 0, icon: '📮' }
                ].map(({ label, current, limit, icon }) => {
                    const percentage = getUsagePercentage(current, limit);
                    const isNearLimit = percentage > 80;

                    return (
                        <div key={label} style={{
                            padding: '1.5rem',
                            background: '#FFFFFF',
                            borderRadius: '12px',
                            border: isNearLimit ? '2px solid #F59E0B' : '1px solid #E2E8F0',
                            boxShadow: isNearLimit ? '0 4px 12px rgba(245, 158, 11, 0.15)' : 'none'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
                                <span style={{ fontSize: '1.5rem' }}>{icon}</span>
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase' }}>{label}</div>
                                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#111827' }}>
                                        {current.toLocaleString()} <span style={{ fontSize: '0.875rem', color: '#94A3B8', fontWeight: 400 }}>/ {limit === Infinity ? '∞' : limit.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>
                            <div style={{
                                width: '100%',
                                height: '8px',
                                background: '#F1F5F9',
                                borderRadius: '9999px',
                                overflow: 'hidden'
                            }}>
                                <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background: isNearLimit ? '#F59E0B' : tierInfo.color,
                                    borderRadius: '9999px',
                                    transition: 'width 0.3s ease'
                                }}></div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Upgrade Options */}
            {currentTier !== 'scale' && currentTier !== 'enterprise' && data?.subscription.status !== 'canceled' && (
                <>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1E293B' }}>Upgrade Your Plan</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
                        {Object.entries(TIER_INFO)
                            .filter(([key]) => !['trial', 'enterprise'].includes(key) && key !== currentTier)
                            .map(([key, info]) => (
                                <div
                                    key={key}
                                    style={{
                                        padding: '1.5rem',
                                        borderRadius: '16px',
                                        border: `1px solid #E2E8F0`,
                                        background: '#FFFFFF'
                                    }}
                                >
                                    <div style={{ marginBottom: '1rem' }}>
                                        <div style={{ fontSize: '1.25rem', fontWeight: 800, color: info.color, marginBottom: '0.25rem' }}>{info.name}</div>
                                        <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#111827' }}>{info.price}<span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 400 }}>/mo</span></div>
                                    </div>
                                    <div style={{ marginBottom: '1.5rem', fontSize: '0.875rem', color: '#64748B', lineHeight: '1.6' }}>
                                        <div>✓ {info.limits.leads.toLocaleString()} leads</div>
                                        <div>✓ {info.limits.domains} domains</div>
                                        <div>✓ {info.limits.mailboxes} mailboxes</div>
                                    </div>
                                    <button
                                        onClick={() => handleUpgrade(key)}
                                        disabled={actionLoading}
                                        style={{
                                            width: '100%',
                                            padding: '0.75rem',
                                            background: info.color,
                                            color: '#FFFFFF',
                                            border: 'none',
                                            borderRadius: '8px',
                                            fontSize: '0.875rem',
                                            fontWeight: 700,
                                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                                            opacity: actionLoading ? 0.6 : 1,
                                            transition: 'all 0.2s'
                                        }}
                                        onMouseEnter={(e) => !actionLoading && (e.currentTarget.style.transform = 'scale(1.02)')}
                                        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
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
                <div style={{ paddingTop: '2rem', borderTop: '1px solid #E2E8F0' }}>
                    <button
                        onClick={handleCancel}
                        disabled={actionLoading}
                        style={{
                            padding: '0.75rem 1.5rem',
                            background: '#FFFFFF',
                            color: '#EF4444',
                            border: '1px solid #FCA5A5',
                            borderRadius: '8px',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            opacity: actionLoading ? 0.6 : 1,
                            transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => !actionLoading && (e.currentTarget.style.background = '#FEE2E2')}
                        onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
                    >
                        Cancel Subscription
                    </button>
                </div>
            )}
        </div>
    );
}
