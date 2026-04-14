'use client';

import Link from 'next/link';

import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LogOut, User, LayoutDashboard, Bell, Users, Rocket, Mailbox, Globe, ShieldCheck, LineChart, Scale, Sparkles, HeartPulse, FileText, Settings, ScrollText, CreditCard, Wrench } from 'lucide-react';
import { logout as serverLogout, apiClient } from '@/lib/api';
import { HelpPanel, HelpPanelTrigger } from '@/components/HelpPanel';
import ErrorBoundary from '@/components/ErrorBoundary';
import ValidationBanner from '@/components/dashboard/ValidationBanner';
import { useDashboard } from '@/contexts/DashboardContext';
import type { AssessmentStatusResponse, Organization, UnreadCountResponse } from '@/types/api';

export default function DashboardShell({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const { user, subscription } = useDashboard();
    const [isCollapsed, setIsCollapsed] = useState(true);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const [helpPanelOpen, setHelpPanelOpen] = useState(false);
    const [systemMode, setSystemMode] = useState<string>('');
    const [observeBannerDismissed, setObserveBannerDismissed] = useState<boolean>(false);
    const [trialBannerDismissed, setTrialBannerDismissed] = useState<boolean>(false);
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [orgName, setOrgName] = useState<string>('');
    const [assessmentInProgress, setAssessmentInProgress] = useState<boolean>(false);
    const [assessmentJustFinished, setAssessmentJustFinished] = useState<boolean>(false);
    const [showTicketModal, setShowTicketModal] = useState(false);
    const [ticketForm, setTicketForm] = useState({ subject: '', description: '', category: 'general' });
    const [ticketSubmitting, setTicketSubmitting] = useState(false);
    const [ticketResult, setTicketResult] = useState<{ success: boolean; ticketId?: string; error?: string } | null>(null);

    // Poll assessment status every 15 seconds
    useEffect(() => {
        let interval: NodeJS.Timeout;
        let wasInProgress = false;

        const checkAssessment = () => {
            apiClient<AssessmentStatusResponse>('/api/assessment/status')
                .then(data => {
                    const inProgress = Boolean(data?.inProgress);
                    setAssessmentInProgress(inProgress);

                    // If assessment just finished, trigger a full data refresh
                    if (wasInProgress && !inProgress) {
                        setAssessmentJustFinished(true);
                        // Dispatch a custom event so child pages can refresh their data
                        window.dispatchEvent(new CustomEvent('assessment-complete'));
                        // Auto-clear the "complete" state after 2 seconds
                        setTimeout(() => {
                            setAssessmentJustFinished(false);
                        }, 2000);
                    }
                    wasInProgress = inProgress;
                })
                .catch(() => {});
        };

        checkAssessment();
        interval = setInterval(checkAssessment, 15000);

        return () => clearInterval(interval);
    }, []);

    // Derive user fields from context
    const userName = user ? user.name.split(' ')[0] : '';
    const userEmail = user?.email || '';
    const userRole = user?.role || '';

    // Derive trial days remaining from context subscription
    const daysRemaining = (() => {
        if (!subscription?.trialEndsAt) return null;
        const diff = new Date(subscription.trialEndsAt).getTime() - Date.now();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    })();

    // Show upgrade modal for expired/past_due/canceled subscriptions (skip for super_admin)
    useEffect(() => {
        if (subscription && ['expired', 'past_due', 'canceled'].includes(subscription.status) && userRole !== 'super_admin') {
            setShowUpgradeModal(true);
        }
    }, [subscription, userRole]);

    useEffect(() => {
        // Fetch organization info including system_mode
        apiClient<Organization & { data?: Organization }>('/api/organization').then((response) => {
            const org = response.data || response;
            if (org?.system_mode) setSystemMode(org.system_mode);
            if (org?.name) setOrgName(org.name);
        }).catch(err => console.error('[Layout] Failed to fetch organization info', err));

        // Fetch unread notification count
        const fetchUnreadCount = () => {
            apiClient<UnreadCountResponse & { data?: UnreadCountResponse }>('/api/dashboard/notifications/unread-count')
                .then(data => {
                    const count = data?.data?.count ?? data?.count;
                    if (count !== undefined) setUnreadCount(count);
                })
                .catch(err => console.error('[Layout] Failed to fetch unread count', err));
        };
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);

        return () => clearInterval(interval);
    }, []);

    // Listen for 403 subscription-expired events from API client
    useEffect(() => {
        const handler = () => setShowUpgradeModal(true);
        window.addEventListener('subscription-expired', handler);
        return () => window.removeEventListener('subscription-expired', handler);
    }, []);

    const handleLogout = async () => {
        await serverLogout();
    };

    const handleTicketSubmit = async () => {
        if (!ticketForm.subject.trim() || !ticketForm.description.trim()) return;
        setTicketSubmitting(true);
        setTicketResult(null);
        try {
            // apiClient unwraps { success, data } → returns the inner data object directly
            const ticket = await apiClient<{ ticket_id: string }>('/api/dashboard/tickets', {
                method: 'POST',
                body: JSON.stringify(ticketForm),
            });
            setTicketResult({ success: true, ticketId: ticket?.ticket_id });
            setTicketForm({ subject: '', description: '', category: 'general' });
        } catch (err: any) {
            setTicketResult({ success: false, error: err.message || 'Failed to submit ticket' });
        } finally {
            setTicketSubmitting(false);
        }
    };

    return (
        <div className="light-theme flex h-screen overflow-hidden bg-[#F7F2EB]">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600 focus:underline">Skip to main content</a>

            {/* Sidebar Wrapper */}
            <div className="relative shrink-0 z-20" style={{
                width: isCollapsed ? '56px' : '200px',
                transition: 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-2.5 top-[40px] rounded-full w-5 h-5 flex items-center justify-center cursor-pointer text-gray-600 z-40 hover:bg-gray-50"
                    style={{
                        background: '#FFFFFF',
                        border: '1px solid #D1CBC5',
                    }}
                >
                    {isCollapsed ? <ChevronRight size={10} /> : <ChevronLeft size={10} />}
                </button>

                <aside className="w-full h-full bg-white py-3 px-2 flex flex-col gap-2 overflow-y-auto relative" style={{
                    borderRight: '1px solid #D1CBC5',
                }}>
                    <div className="flex items-center overflow-hidden whitespace-nowrap h-9 px-1" style={{
                        gap: isCollapsed ? 0 : '8px',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                    }}>
                        <div className="shrink-0 w-6 h-6">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/image/logo-v2.png" alt="Superkabe" width={24} height={24} className="block" onError={(e) => {
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }} />
                            <div className="hidden w-6 h-6 rounded items-center justify-center text-white text-[0.75rem] font-black bg-gray-900">S</div>
                        </div>
                        {!isCollapsed && (
                            <span className="text-[0.875rem] font-semibold tracking-tight text-gray-900">
                                Superkabe
                            </span>
                        )}
                    </div>

                    {(() => {
                        const sections: Array<{ label?: string; items: Array<{ href: string; label: string; icon: React.ReactNode; badge?: number }> }> = [
                            { items: [
                                { href: '/dashboard', label: 'Overview', icon: <LayoutDashboard size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/notifications', label: 'Notifications', icon: <Bell size={14} strokeWidth={1.75} />, badge: unreadCount },
                            ]},
                            { label: 'Monitoring', items: [
                                { href: '/dashboard/leads', label: 'Leads', icon: <Users size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/campaigns', label: 'Campaigns', icon: <Rocket size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/mailboxes', label: 'Mailboxes', icon: <Mailbox size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/domains', label: 'Domains', icon: <Globe size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/infrastructure', label: 'Infra Health', icon: <ShieldCheck size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/analytics', label: 'Analytics', icon: <LineChart size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/load-balancing', label: 'Load Balancing', icon: <Scale size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/predictive-risks', label: 'Predictive Risks', icon: <Sparkles size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/healing', label: 'Healing', icon: <HeartPulse size={14} strokeWidth={1.75} /> },
                            ]},
                            { label: 'System', items: [
                                { href: '/dashboard/reports', label: 'Reports', icon: <FileText size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/configuration', label: 'Routing Config', icon: <Settings size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/audit', label: 'Audit Log', icon: <ScrollText size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/billing', label: 'Billing', icon: <CreditCard size={14} strokeWidth={1.75} /> },
                                { href: '/dashboard/settings', label: 'Settings', icon: <Wrench size={14} strokeWidth={1.75} /> },
                            ]},
                        ];
                        const isActive = (href: string) => href === '/dashboard' ? pathname === href : pathname?.startsWith(href);
                        return (
                            <nav className="flex flex-col gap-0.5">
                                {sections.map((section, si) => (
                                    <div key={si} className="flex flex-col gap-0.5">
                                        {section.label && !isCollapsed && (
                                            <div className="px-2.5 mt-3 mb-1 text-[10px] text-gray-400 uppercase tracking-[0.12em] font-semibold">
                                                {section.label}
                                            </div>
                                        )}
                                        {section.label && isCollapsed && <div className="h-2" />}
                                        {section.items.map((item) => {
                                            const active = isActive(item.href);
                                            return (
                                                <Link
                                                    key={item.href}
                                                    href={item.href}
                                                    className="nav-link"
                                                    data-active={active ? 'true' : undefined}
                                                    title={isCollapsed ? item.label : ''}
                                                >
                                                    <span className="nav-icon">
                                                        {item.icon}
                                                        {item.badge && item.badge > 0 ? (
                                                            <span className="nav-badge">{item.badge > 99 ? '99+' : item.badge}</span>
                                                        ) : null}
                                                    </span>
                                                    {!isCollapsed && <span className="nav-label">{item.label}</span>}
                                                </Link>
                                            );
                                        })}
                                    </div>
                                ))}
                            </nav>
                        );
                    })()}

                    <div className="mt-auto flex flex-col gap-1.5 pt-3 border-t border-gray-100">
                        {!isCollapsed && (
                            <Link href="/dashboard/profile" className="no-underline">
                                <div className="profile-card-hover p-2.5 rounded-xl border border-gray-200 cursor-pointer bg-white hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-2.5">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-gray-900">
                                            <User size={14} color="#fff" />
                                        </div>
                                        <div className="overflow-hidden min-w-0">
                                            <div className="text-xs font-semibold text-gray-900 truncate">{orgName || 'My Organization'}</div>
                                            <div className="text-[10px] text-gray-500 truncate">{userEmail}</div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="nav-link w-full text-left cursor-pointer text-gray-600 hover:text-red-600"
                            style={{
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                            }}
                            title={isCollapsed ? "Log Out" : ""}
                        >
                            <span className="min-w-[24px] flex justify-center">
                                <LogOut size={18} />
                            </span>
                            {!isCollapsed && <span>Log Out</span>}
                        </button>
                    </div>
                </aside>
            </div>

            <main id="main-content" className="scrollbar-hide flex-1 flex flex-col overflow-y-auto z-10">
                {/* Observe Mode Warning Banner */}
                {systemMode === 'observe' && !observeBannerDismissed && (
                    <div className="flex items-center justify-between gap-4 sticky top-0 z-30 shadow-md" style={{
                        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)',
                        borderBottom: '3px solid #F59E0B',
                        padding: '1rem 1.5rem',
                    }}>
                        <div className="flex items-center gap-4 flex-1">
                            <span className="text-2xl">⚠️</span>
                            <div>
                                <p className="m-0 text-[0.9rem] text-[#92400E] font-bold mb-1">
                                    Observe Mode Active - Limited Protection
                                </p>
                                <p className="m-0 text-[0.8rem] text-[#78350F] leading-[1.4]">
                                    Infrastructure pausing is active, but the execution gate allows new leads through even with issues.{' '}
                                    <Link href="/dashboard/settings" className="banner-link-hover text-[#78350F] underline font-bold">
                                        Switch to Enforce Mode for full protection →
                                    </Link>
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => setObserveBannerDismissed(true)}
                            className="banner-dismiss-hover bg-transparent border-none text-[#92400E] cursor-pointer text-xl p-1 flex items-center justify-center rounded w-7 h-7 shrink-0"
                            title="Dismiss (session only)"
                        >
                            ✕
                        </button>
                    </div>
                )}

                {/* Email Validation Activity Banner */}
                <ValidationBanner />

                {/* Infrastructure Assessment Progress Overlay — hidden on settings page where sync modal already shows health check progress */}
                {assessmentInProgress && pathname !== '/dashboard/settings' && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-[100]">
                        <div className="bg-white rounded-[20px] px-12 py-10 max-w-[440px] w-[90%] text-center" style={{
                            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
                            animation: 'slideIn 0.3s ease-out'
                        }}>
                            <div className="w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center" style={{
                                background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)',
                            }}>
                                <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full" style={{
                                    animation: 'spin 1s linear infinite'
                                }} />
                            </div>
                            <h3 className="m-0 mb-2 text-xl font-bold text-[#1E1B4B]">
                                Infrastructure Assessment Running
                            </h3>
                            <p className="m-0 mb-6 text-[0.9rem] text-gray-500 leading-normal">
                                Checking DNS records, bounce rates, and mailbox health across all domains. This takes a moment — data will refresh automatically when complete.
                            </p>
                            <div className="flex items-center justify-center gap-2 p-3 px-4 bg-[#F5F3FF] rounded-xl text-[0.8rem] text-[#7C3AED] font-semibold">
                                <span style={{ animation: 'pulse 1.5s infinite' }}>●</span>
                                Assessment in progress...
                            </div>
                        </div>
                    </div>
                )}

                {/* Assessment Complete Flash */}
                {assessmentJustFinished && !assessmentInProgress && (
                    <div className="fixed top-4 left-1/2 -translate-x-1/2 border-2 border-emerald-400 rounded-2xl p-4 px-6 flex items-center gap-3 z-[100]" style={{
                        background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        <span className="text-xl">✓</span>
                        <span className="text-[0.9rem] font-semibold text-[#065F46]">Assessment complete — data refreshed</span>
                    </div>
                )}

                {/* Trial Countdown Floating Popup */}
                {subscription?.status === 'trialing' && daysRemaining !== null && !trialBannerDismissed && (
                    <div className="fixed top-16 right-4 border-2 border-yellow-400 rounded-2xl p-4 px-5 flex items-center gap-4 z-50 max-w-[400px]" style={{
                        background: 'linear-gradient(135deg, #FEF3C7 0%, #FDE047 100%)',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15)',
                        animation: 'slideIn 0.3s ease-out'
                    }}>
                        <span className="text-2xl shrink-0">⏰</span>
                        <div className="flex-1">
                            <p className="m-0 text-[0.9rem] text-[#92400E] font-semibold mb-1">
                                Trial ends in <strong className="text-base text-[#78350F]">{daysRemaining} {daysRemaining === 1 ? 'day' : 'days'}</strong>
                            </p>
                            <Link href="/dashboard/billing" className="banner-link-hover text-[0.8rem] text-[#78350F] underline font-bold">
                                Upgrade now →
                            </Link>
                        </div>
                        <button
                            onClick={() => setTrialBannerDismissed(true)}
                            className="banner-dismiss-hover bg-transparent border-none text-[#92400E] cursor-pointer text-xl p-1 flex items-center justify-center rounded-full w-7 h-7 shrink-0"
                            title="Dismiss"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <div className="container min-h-full py-2 px-3">
                    <ErrorBoundary>
                        {children}
                    </ErrorBoundary>
                </div>
            </main>

            {/* Help Panel */}
            <HelpPanel isOpen={helpPanelOpen} onClose={() => setHelpPanelOpen(false)} />
            <HelpPanelTrigger onClick={() => setHelpPanelOpen(true)} />

            {/* Raise a Ticket Button — fixed bottom-right, above Help Panel trigger */}
            <button
                onClick={() => { setShowTicketModal(true); setTicketResult(null); }}
                className="btn-hover-lift btn-hover-lift-blue fixed bottom-[6.5rem] right-6 text-white border-none rounded-xl p-2 px-4 text-[0.8rem] font-semibold cursor-pointer z-30 flex items-center gap-[0.4rem]"
                style={{
                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                    boxShadow: '0 4px 12px rgba(99, 102, 241, 0.3)',
                }}
            >
                <span className="text-[0.9rem]">🎫</span>
                Raise a Ticket
            </button>

            {/* Support Ticket Modal */}
            {showTicketModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-[9998]" onClick={() => { if (!ticketSubmitting) setShowTicketModal(false); }}>
                    <div className="bg-white rounded-[20px] max-w-[520px] w-[90%] p-8" style={{
                        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                        animation: 'slideIn 0.3s ease-out',
                    }} onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="m-0 text-xl font-bold text-gray-900">
                                <span className="mr-2">🎫</span>Raise a Support Ticket
                            </h2>
                            <button onClick={() => setShowTicketModal(false)} className="bg-transparent border-none text-xl cursor-pointer text-gray-400 w-7 h-7 flex items-center justify-center rounded-full">✕</button>
                        </div>

                        {ticketResult?.success ? (
                            <div className="text-center py-6">
                                <div className="text-[3rem] mb-4">✅</div>
                                <h3 className="m-0 mb-2 text-[1.1rem] font-bold text-[#065F46]">Ticket Submitted!</h3>
                                <p className="m-0 mb-2 text-gray-500 text-[0.9rem]">Your ticket ID is:</p>
                                <p className="m-0 mb-6 text-[1.1rem] font-bold text-indigo-700 bg-indigo-50 p-2 px-4 rounded-lg inline-block">{ticketResult.ticketId}</p>
                                <p className="m-0 mb-6 text-gray-500 text-[0.85rem]">
                                    We&apos;ll get back to you as soon as possible.
                                </p>
                                <button onClick={() => setShowTicketModal(false)} className="text-white border-none rounded-[10px] py-2.5 px-6 text-[0.9rem] font-semibold cursor-pointer" style={{
                                    background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                }}>Close</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex flex-col gap-4">
                                    <div>
                                        <label className="block text-[0.8rem] font-semibold text-gray-700 mb-1.5">Category</label>
                                        <select
                                            value={ticketForm.category}
                                            onChange={(e) => setTicketForm(f => ({ ...f, category: e.target.value }))}
                                            className="w-full py-2.5 px-3 rounded-[10px] border border-gray-300 text-sm text-gray-900 bg-gray-50 outline-none"
                                        >
                                            <option value="general">General</option>
                                            <option value="bug">Bug Report</option>
                                            <option value="feature">Feature Request</option>
                                            <option value="billing">Billing</option>
                                            <option value="urgent">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-[0.8rem] font-semibold text-gray-700 mb-1.5">Subject *</label>
                                        <input
                                            type="text"
                                            value={ticketForm.subject}
                                            onChange={(e) => setTicketForm(f => ({ ...f, subject: e.target.value }))}
                                            placeholder="Brief summary of your issue"
                                            className="w-full py-2.5 px-3 rounded-[10px] border border-gray-300 text-sm text-gray-900 bg-gray-50 outline-none box-border"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[0.8rem] font-semibold text-gray-700 mb-1.5">Description *</label>
                                        <textarea
                                            value={ticketForm.description}
                                            onChange={(e) => setTicketForm(f => ({ ...f, description: e.target.value }))}
                                            placeholder="Describe your issue in detail..."
                                            rows={5}
                                            className="w-full py-2.5 px-3 rounded-[10px] border border-gray-300 text-sm text-gray-900 bg-gray-50 outline-none resize-y font-[inherit] box-border"
                                        />
                                    </div>
                                </div>

                                {ticketResult?.error && (
                                    <p className="text-red-600 text-[0.8rem] mt-3 mb-0 font-medium">
                                        {ticketResult.error}
                                    </p>
                                )}

                                <div className="flex justify-end gap-3 mt-5">
                                    <button onClick={() => setShowTicketModal(false)} disabled={ticketSubmitting} className="bg-gray-100 text-gray-700 border border-gray-300 rounded-[10px] py-2.5 px-5 text-sm font-medium cursor-pointer">Cancel</button>
                                    <button
                                        onClick={handleTicketSubmit}
                                        disabled={ticketSubmitting || !ticketForm.subject.trim() || !ticketForm.description.trim()}
                                        className="text-white border-none rounded-[10px] py-2.5 px-5 text-sm font-semibold"
                                        style={{
                                            background: ticketSubmitting ? '#9CA3AF' : 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                                            cursor: ticketSubmitting ? 'not-allowed' : 'pointer',
                                            opacity: (!ticketForm.subject.trim() || !ticketForm.description.trim()) ? 0.5 : 1,
                                        }}
                                    >{ticketSubmitting ? 'Submitting...' : 'Submit Ticket'}</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Non-dismissible Upgrade Modal for expired/past_due/canceled — exempt billing page so user can upgrade */}
            {showUpgradeModal && pathname !== '/dashboard/billing' && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[9999]">
                    <div className="bg-white rounded-3xl max-w-[480px] w-[90%] py-12 px-10 text-center" style={{
                        boxShadow: '0 25px 50px rgba(0,0,0,0.15)',
                    }}>
                        <div className="text-[3rem] mb-4">⏰</div>
                        <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
                            {subscription?.status === 'past_due' ? 'Payment Past Due' :
                             subscription?.status === 'canceled' ? 'Subscription Canceled' :
                             'Your Trial Has Ended'}
                        </h2>
                        <p className="text-gray-500 text-base leading-relaxed mb-8">
                            {subscription?.status === 'past_due'
                                ? 'Your payment method failed. Please update your payment details to continue using Superkabe.'
                                : subscription?.status === 'canceled'
                                ? 'Your subscription has been canceled. Resubscribe to a plan to regain access to Superkabe.'
                                : 'Your 14-day free trial has expired. Upgrade to a paid plan to continue using Superkabe and protect your outbound infrastructure.'}
                        </p>
                        <Link href="/dashboard/billing" className="btn-hover-lift btn-hover-lift-cta inline-block py-3.5 px-10 text-white rounded-xl font-bold text-base no-underline" style={{
                            background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
                            boxShadow: '0 4px 14px rgba(59,130,246,0.4)',
                        }}
                        >
                            Upgrade Now
                        </Link>
                    </div>
                </div>
            )}

            <style jsx>{`
        .nav-link {
          height: 28px;
          padding: 0 8px;
          border-radius: 6px;
          color: #4B5563;
          transition: background 0.12s ease, color 0.12s ease;
          text-decoration: none !important;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
          line-height: 1;
        }
        .nav-link .nav-icon {
          width: 16px;
          height: 16px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: #6B7280;
          position: relative;
        }
        .nav-link .nav-label {
          font-size: 0.75rem;
          color: inherit;
          letter-spacing: -0.005em;
        }
        .nav-link .nav-badge {
          position: absolute;
          top: -4px;
          right: -8px;
          background: #EF4444;
          color: #fff;
          font-size: 9px;
          font-weight: 700;
          min-width: 15px;
          height: 15px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 4px;
          line-height: 1;
        }
        .nav-link:hover {
          background: #F5F1EA;
          color: #111827;
        }
        .nav-link:hover .nav-icon {
          color: #111827;
        }
        .nav-link[data-active="true"] {
          background: #F7F2EB;
          color: #111827;
          font-weight: 600;
        }
        .nav-link[data-active="true"] .nav-icon {
          color: #111827;
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}
