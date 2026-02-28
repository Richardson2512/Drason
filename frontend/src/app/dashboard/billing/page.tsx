'use client';
import { useEffect, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
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

function BillingContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [data, setData] = useState<SubscriptionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);

    // Reset processing state when user navigates back from Polar checkout
    // via browser back button (bfcache restore or visibility change)
    useEffect(() => {
        const handlePageShow = (event: PageTransitionEvent) => {
            if (event.persisted) {
                setActionLoading(false);
            }
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'visible') {
                setActionLoading(false);
            }
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

    // Initialize data and handle upgrade parameter
    useEffect(() => {
        fetchSubscription();

        // Check for upgrade parameter and auto-trigger checkout
        const upgradeTier = searchParams.get('upgrade');
        if (upgradeTier && ['starter', 'growth', 'scale'].includes(upgradeTier)) {
            // Clear the upgrade param from URL to prevent re-triggering on back nav
            const url = new URL(window.location.href);
            url.searchParams.delete('upgrade');
            window.history.replaceState({}, '', url.toString());

            // Small delay to let subscription data load first
            setTimeout(() => {
                handleUpgrade(upgradeTier);
            }, 500);
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
            <div className="premium-card">
                <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading billing information...</div>
            </div>
        );
    }

    if (error && !data) {
        return (
            <div className="premium-card">
                <div style={{ padding: '2rem', textAlign: 'center', color: '#EF4444' }}>{error}</div>
            </div>
        );
    }

    const currentTier = data?.subscription.tier || 'trial';
    const tierInfo = TIER_INFO[currentTier] || TIER_INFO.trial;
    const daysRemaining = getDaysRemaining();

    return (
        <div style={{ padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Billing & Usage</h1>
                <p style={{ color: '#64748B', fontSize: '1rem' }}>Manage your subscription, view usage, and download invoices.</p>
            </div>

            <div className="premium-card" style={{ borderLeft: `6px solid ${tierInfo.color}` }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>Current Subscription</h2>
                        <p style={{ color: '#64748B', fontSize: '1rem', lineHeight: '1.5' }}>
                            View your plan details and manage your subscription.
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
                                Your free trial ends in <strong>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>. Add payment details below to continue with the {tierInfo.name} plan ({tierInfo.price}/mo).
                            </p>
                        </div>
                    </div>
                )}

                {/* Expired Trial Warning */}
                {data?.subscription.status === 'expired' && (
                    <div style={{
                        padding: '1rem 1.5rem',
                        background: '#FEE2E2',
                        borderRadius: '12px',
                        border: '1px solid #FCA5A5',
                        marginBottom: '1.5rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                    }}>
                        <span style={{ fontSize: '1.5rem' }}>⛔</span>
                        <div>
                            <p style={{ color: '#991B1B', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                                Your trial has expired. Subscribe to a plan below to restore access to your account.
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
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: tierInfo.color }}>
                                {tierInfo.name}
                                {data?.subscription.status === 'trialing' && currentTier !== 'trial' && (
                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#10B981', marginLeft: '0.5rem' }}>
                                        (Free Trial)
                                    </span>
                                )}
                            </div>
                        </div>
                        <div>
                            {data?.subscription.status === 'trialing' ? (
                                <div style={{ textAlign: 'right' }}>
                                    <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>$0</div>
                                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                                        Then {tierInfo.price}/mo
                                    </div>
                                </div>
                            ) : (
                                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
                                    {tierInfo.price}<span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 400 }}>/mo</span>
                                </div>
                            )}
                        </div>
                    </div>
                    {data?.subscription.status === 'trialing' && daysRemaining !== null && (
                        <div style={{
                            fontSize: '0.875rem',
                            color: '#10B981',
                            background: '#D1FAE5',
                            padding: '0.75rem',
                            borderRadius: '8px',
                            fontWeight: 600
                        }}>
                            ✓ {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining in your free trial
                        </div>
                    )}
                    {data?.subscription.status === 'active' && (
                        <div style={{
                            display: 'flex',
                            gap: '1.5rem',
                            flexWrap: 'wrap',
                            fontSize: '0.875rem',
                            color: '#64748B'
                        }}>
                            {data.subscription.subscriptionStartedAt && (
                                <div>
                                    Billing started: <strong>{new Date(data.subscription.subscriptionStartedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                </div>
                            )}
                            {data.subscription.nextBillingDate && (
                                <div>
                                    Next bill: <strong>{new Date(data.subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong>
                                </div>
                            )}
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
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1rem', color: '#1E293B' }}>
                            {data?.subscription.status === 'trialing' ? 'Continue or Switch Plans' : data?.subscription.status === 'active' ? 'Upgrade Your Plan' : 'Choose a Plan'}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
                            {Object.entries(TIER_INFO)
                                .filter(([key]) => !['trial', 'enterprise'].includes(key))
                                .map(([key, info]) => {
                                    const isCurrentTier = key === currentTier;

                                    // Determine tier ranks for comparison
                                    const tierOrder: Record<string, number> = {
                                        'trial': 0,
                                        'starter': 1,
                                        'growth': 2,
                                        'scale': 3,
                                        'enterprise': 4
                                    };
                                    const currentTierRank = tierOrder[currentTier] || 0;
                                    const thisTierRank = tierOrder[key] || 0;
                                    const isLowerTier = thisTierRank <= currentTierRank && !isCurrentTier;

                                    // Skip lower tiers for active subscriptions
                                    if (data?.subscription.status === 'active' && isLowerTier) {
                                        return null;
                                    }

                                    const buttonText = data?.subscription.status === 'trialing'
                                        ? (isCurrentTier ? `Continue with ${info.name}` : `Switch to ${info.name}`)
                                        : data?.subscription.status === 'active'
                                            ? `Upgrade to ${info.name}`
                                            : `Subscribe to ${info.name}`;

                                    return (
                                        <div
                                            key={key}
                                            style={{
                                                padding: '1.5rem',
                                                borderRadius: '16px',
                                                border: isCurrentTier ? `2px solid ${info.color}` : `1px solid #E2E8F0`,
                                                background: isCurrentTier ? `${info.color}10` : '#FFFFFF',
                                                position: 'relative'
                                            }}
                                        >
                                            {isCurrentTier && data?.subscription.status === 'trialing' && (
                                                <div style={{
                                                    position: 'absolute',
                                                    top: '-10px',
                                                    left: '50%',
                                                    transform: 'translateX(-50%)',
                                                    background: info.color,
                                                    color: '#FFFFFF',
                                                    padding: '0.25rem 1rem',
                                                    borderRadius: '9999px',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 700
                                                }}>
                                                    CURRENT TRIAL
                                                </div>
                                            )}
                                            <div style={{ marginBottom: '1rem', marginTop: isCurrentTier && data?.subscription.status === 'trialing' ? '0.5rem' : '0' }}>
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
                                                disabled={actionLoading || (data?.subscription.status === 'active' && isCurrentTier)}
                                                style={{
                                                    width: '100%',
                                                    padding: '0.75rem',
                                                    background: info.color,
                                                    color: '#FFFFFF',
                                                    border: 'none',
                                                    borderRadius: '8px',
                                                    fontSize: '0.875rem',
                                                    fontWeight: 700,
                                                    cursor: (actionLoading || (data?.subscription.status === 'active' && isCurrentTier)) ? 'not-allowed' : 'pointer',
                                                    opacity: (actionLoading || (data?.subscription.status === 'active' && isCurrentTier)) ? 0.6 : 1,
                                                    transition: 'all 0.2s'
                                                }}
                                                onMouseEnter={(e) => !actionLoading && !(data?.subscription.status === 'active' && isCurrentTier) && (e.currentTarget.style.transform = 'scale(1.02)')}
                                                onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
                                            >
                                                {actionLoading ? 'Processing...' : (data?.subscription.status === 'active' && isCurrentTier) ? 'Current Plan' : buttonText}
                                            </button>
                                        </div>
                                    );
                                })}
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
        </div>
    );
}

export default function BillingPage() {
    return (
        <Suspense fallback={
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                Loading billing information...
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}
