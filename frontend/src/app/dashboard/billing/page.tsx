'use client';
import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
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

interface Invoice {
    id: string;
    date: string;
    amount: number;
    currency: string;
    status: string;
    url?: string;
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
    const [data, setData] = useState<SubscriptionData | null>(null);
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [invoicesLoading, setInvoicesLoading] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [actionLoading, setActionLoading] = useState(false);
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
            {/* Page Header */}
            <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: 800, color: '#111827', marginBottom: '0.5rem' }}>Billing & Usage</h1>
                <p style={{ color: '#64748B', fontSize: '1rem' }}>Manage your subscription, view usage, and download invoices.</p>
            </div>

            {/* Tab Bar */}
            <div style={{
                display: 'flex',
                gap: '0.25rem',
                background: '#F1F5F9',
                padding: '0.25rem',
                borderRadius: '12px',
                marginBottom: '1.5rem',
                width: 'fit-content'
            }}>
                {(['usage', 'billing'] as const).map((tab) => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        style={{
                            padding: '0.625rem 1.5rem',
                            borderRadius: '10px',
                            border: 'none',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                            transition: 'all 0.2s',
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
                    <p style={{ color: '#92400E', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                        Your free trial ends in <strong>{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>. Add payment details to continue with the {tierInfo.name} plan ({tierInfo.price}/mo).
                    </p>
                </div>
            )}
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
                    <p style={{ color: '#991B1B', fontSize: '0.9rem', margin: 0, fontWeight: 600 }}>
                        Your trial has expired. Subscribe to a plan below to restore access to your account.
                    </p>
                </div>
            )}
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

            {/* ==================== USAGE TAB ==================== */}
            {activeTab === 'usage' && (
                <div className="grid gap-6">
                    {/* Current Plan Card */}
                    <div className="premium-card" style={{ borderLeft: `6px solid ${tierInfo.color}` }}>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                {getStatusBadge(data?.subscription.status || 'trialing')}
                                <div style={{ textAlign: 'right' }}>
                                    {data?.subscription.status === 'trialing' ? (
                                        <>
                                            <div style={{ fontSize: '2rem', fontWeight: 800, color: '#10B981' }}>$0</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Then {tierInfo.price}/mo</div>
                                        </>
                                    ) : (
                                        <div style={{ fontSize: '2rem', fontWeight: 800, color: '#111827' }}>
                                            {tierInfo.price}<span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 400 }}>/mo</span>
                                        </div>
                                    )}
                                </div>
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
                            <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', fontSize: '0.875rem', color: '#64748B' }}>
                                {data.subscription.subscriptionStartedAt && (
                                    <div>Billing started: <strong>{new Date(data.subscription.subscriptionStartedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
                                )}
                                {data.subscription.nextBillingDate && (
                                    <div>Next bill: <strong>{new Date(data.subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</strong></div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Resource Usage */}
                    <div className="premium-card">
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1E293B' }}>Resource Usage</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                                        <div style={{ width: '100%', height: '8px', background: '#F1F5F9', borderRadius: '9999px', overflow: 'hidden' }}>
                                            <div style={{
                                                width: `${percentage}%`,
                                                height: '100%',
                                                background: isNearLimit ? '#F59E0B' : tierInfo.color,
                                                borderRadius: '9999px',
                                                transition: 'width 0.3s ease'
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
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1E293B' }}>
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
                                            <div key={key} style={{
                                                padding: '1.5rem',
                                                borderRadius: '16px',
                                                border: isCurrentTier ? `2px solid ${info.color}` : '1px solid #E2E8F0',
                                                background: isCurrentTier ? `${info.color}10` : '#FFFFFF',
                                                position: 'relative'
                                            }}>
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
                        </div>
                    )}
                </div>
            )}

            {/* ==================== BILLING TAB ==================== */}
            {activeTab === 'billing' && (
                <div className="grid gap-6">
                    {/* Payment Overview */}
                    <div className="premium-card" style={{ borderLeft: `6px solid ${tierInfo.color}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#111827', marginBottom: '0.25rem' }}>Payment Status</h2>
                                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Your current subscription and billing details.</p>
                            </div>
                            {getStatusBadge(data?.subscription.status || 'trialing')}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Plan</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: tierInfo.color }}>{tierInfo.name}</div>
                                <div style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>{tierInfo.price}/mo</div>
                            </div>
                            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Next Payment</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                                    {data?.subscription.nextBillingDate
                                        ? new Date(data.subscription.nextBillingDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : '—'}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
                                    {data?.subscription.status === 'trialing' ? 'After trial ends' : 'Recurring'}
                                </div>
                            </div>
                            <div style={{ padding: '1.25rem', background: '#F8FAFC', borderRadius: '12px', border: '1px solid #F1F5F9' }}>
                                <div style={{ fontSize: '0.75rem', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '0.5rem' }}>Billing Started</div>
                                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#111827' }}>
                                    {data?.subscription.subscriptionStartedAt
                                        ? new Date(data.subscription.subscriptionStartedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                        : data?.subscription.trialStartedAt
                                            ? new Date(data.subscription.trialStartedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                                            : '—'}
                                </div>
                                <div style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }}>
                                    {data?.subscription.subscriptionStartedAt ? 'Subscription start' : 'Trial start'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Invoices */}
                    <div className="premium-card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1E293B', marginBottom: '0.25rem' }}>Invoices</h3>
                                <p style={{ fontSize: '0.875rem', color: '#64748B' }}>View and download your payment history.</p>
                            </div>
                        </div>

                        {invoicesLoading ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>Loading invoices...</div>
                        ) : invoices.length > 0 ? (
                            <div style={{ overflowX: 'auto' }}>
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '2px solid #F1F5F9' }}>
                                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                                            <th style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                                            <th style={{ textAlign: 'right', padding: '0.75rem 1rem', fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Invoice</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {invoices.map((invoice) => {
                                            const statusStyle = getInvoiceStatusStyle(invoice.status);
                                            return (
                                                <tr key={invoice.id} style={{ borderBottom: '1px solid #F1F5F9' }}>
                                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#374151', fontWeight: 500 }}>
                                                        {new Date(invoice.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                    </td>
                                                    <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#111827', fontWeight: 700 }}>
                                                        ${(invoice.amount / 100).toFixed(2)} {invoice.currency?.toUpperCase() || 'USD'}
                                                    </td>
                                                    <td style={{ padding: '1rem' }}>
                                                        <span style={{
                                                            padding: '0.25rem 0.75rem',
                                                            borderRadius: '9999px',
                                                            background: statusStyle.bg,
                                                            color: statusStyle.text,
                                                            fontSize: '0.75rem',
                                                            fontWeight: 600,
                                                            textTransform: 'capitalize'
                                                        }}>
                                                            {invoice.status}
                                                        </span>
                                                    </td>
                                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                                        {invoice.url ? (
                                                            <a
                                                                href={invoice.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                style={{
                                                                    fontSize: '0.875rem',
                                                                    color: '#3B82F6',
                                                                    fontWeight: 600,
                                                                    textDecoration: 'none'
                                                                }}
                                                                onMouseEnter={(e) => (e.currentTarget.style.textDecoration = 'underline')}
                                                                onMouseLeave={(e) => (e.currentTarget.style.textDecoration = 'none')}
                                                            >
                                                                Download
                                                            </a>
                                                        ) : (
                                                            <span style={{ fontSize: '0.875rem', color: '#94A3B8' }}>—</span>
                                                        )}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <div style={{
                                padding: '3rem 2rem',
                                textAlign: 'center',
                                background: '#F8FAFC',
                                borderRadius: '12px',
                                border: '1px solid #F1F5F9'
                            }}>
                                <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📄</div>
                                <div style={{ fontSize: '1rem', fontWeight: 600, color: '#374151', marginBottom: '0.25rem' }}>No invoices yet</div>
                                <p style={{ fontSize: '0.875rem', color: '#94A3B8', margin: 0 }}>
                                    Invoices will appear here once you subscribe to a paid plan.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Cancel Subscription */}
                    {data?.subscription.status === 'active' && (
                        <div className="premium-card" style={{ border: '1px solid #FEE2E2' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#991B1B', marginBottom: '0.25rem' }}>Cancel Subscription</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748B', margin: 0 }}>
                                        You'll retain access until the end of your current billing period.
                                    </p>
                                </div>
                                <button
                                    onClick={handleCancel}
                                    disabled={actionLoading}
                                    style={{
                                        padding: '0.625rem 1.25rem',
                                        background: '#FFFFFF',
                                        color: '#EF4444',
                                        border: '1px solid #FCA5A5',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        fontWeight: 600,
                                        cursor: actionLoading ? 'not-allowed' : 'pointer',
                                        opacity: actionLoading ? 0.6 : 1,
                                        transition: 'all 0.2s',
                                        whiteSpace: 'nowrap'
                                    }}
                                    onMouseEnter={(e) => !actionLoading && (e.currentTarget.style.background = '#FEE2E2')}
                                    onMouseLeave={(e) => (e.currentTarget.style.background = '#FFFFFF')}
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
            <div style={{ padding: '2rem', textAlign: 'center', color: '#9CA3AF' }}>
                Loading billing information...
            </div>
        }>
            <BillingContent />
        </Suspense>
    );
}
