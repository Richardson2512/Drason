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
        <div className="light-theme flex h-screen overflow-hidden bg-[#F5F8FF]">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-blue-600 focus:underline">Skip to main content</a>
            {/* Ambient Background Effects */}
            <div className="hero-blur pointer-events-none opacity-30 z-0">
                <div className="blur-blob blur-purple w-[400px] h-[400px] -top-[10%] -left-[10%]"></div>
                <div className="blur-blob blur-blue w-[400px] h-[400px] -bottom-[10%] -right-[10%]"></div>
            </div>


            {/* Sidebar Wrapper — holds collapse button outside aside's overflow context */}
            <div className="relative shrink-0 m-2 z-20" style={{
                width: isCollapsed ? '88px' : '220px',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            }}>
                {/* Toggle Button — positioned on wrapper edge, outside aside */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    className="absolute -right-[14px] top-[48px] border-2 border-white rounded-full w-7 h-7 flex items-center justify-center cursor-pointer text-white z-40 hover:scale-110"
                    style={{
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <aside className="w-full h-full bg-white/80 backdrop-blur-[12px] border-r border-[var(--border)] py-6 px-4 flex flex-col gap-4 overflow-y-auto rounded-3xl shadow-md relative" style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                }}>

                    <div className="flex items-center text-xl font-extrabold -tracking-[0.025em] text-gray-900 overflow-hidden whitespace-nowrap min-h-[40px] py-1" style={{
                        gap: isCollapsed ? 0 : '12px',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                    }}>
                        <div className="shrink-0 w-8 h-8">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} className="block" onError={(e) => {
                                // Fallback: show a branded icon if image fails to load
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }} />
                            <div className="hidden w-8 h-8 rounded-lg items-center justify-center text-white text-[1.1rem] font-black" style={{ background: 'linear-gradient(135deg, #6366F1, #8B5CF6)' }}>S</div>
                        </div>
                        <span className="overflow-hidden transition-opacity duration-200 bg-clip-text" style={{
                            opacity: isCollapsed ? 0 : 1,
                            width: isCollapsed ? 0 : 'auto',
                            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                        }}>
                            Superkabe
                        </span>
                    </div>

                    <nav className="flex flex-col gap-1">
                        <Link href="/dashboard" className="nav-link" title={isCollapsed ? "Overview" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><LayoutDashboard size={18} /></span>
                            {!isCollapsed && <span>Overview</span>}
                        </Link>
                        <Link href="/dashboard/notifications" className="nav-link relative" title={isCollapsed ? "Notifications" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center relative text-gray-600">
                                <Bell size={18} />
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1 -right-1.5 bg-red-500 text-white text-[0.6rem] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 leading-none" style={{
                                        boxShadow: '0 1px 3px rgba(239,68,68,0.4)'
                                    }}>
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </span>
                            {!isCollapsed && <span>Notifications</span>}
                        </Link>

                        {!isCollapsed && (
                            <div className="pl-4 mt-3 mb-1 text-[0.65rem] text-gray-400 uppercase tracking-[0.1em] font-bold whitespace-nowrap">
                                Monitoring
                            </div>
                        )}
                        {isCollapsed && <div className="h-3" />}

                        <Link href="/dashboard/leads" className="nav-link" title={isCollapsed ? "Leads" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><Users size={18} /></span>
                            {!isCollapsed && <span>Leads</span>}
                        </Link>
                        <Link href="/dashboard/campaigns" className="nav-link" title={isCollapsed ? "Campaigns" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><Rocket size={18} /></span>
                            {!isCollapsed && <span>Campaigns</span>}
                        </Link>
                        <Link href="/dashboard/mailboxes" className="nav-link" title={isCollapsed ? "Mailboxes" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><Mailbox size={18} /></span>
                            {!isCollapsed && <span>Mailboxes</span>}
                        </Link>
                        <Link href="/dashboard/domains" className="nav-link" title={isCollapsed ? "Domains" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><Globe size={18} /></span>
                            {!isCollapsed && <span>Domains</span>}
                        </Link>
                        <Link href="/dashboard/infrastructure" className="nav-link" title={isCollapsed ? "Infra Health" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><ShieldCheck size={18} /></span>
                            {!isCollapsed && <span>Infra Health</span>}
                        </Link>
                        <Link href="/dashboard/analytics" className="nav-link" title={isCollapsed ? "Analytics" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><LineChart size={18} /></span>
                            {!isCollapsed && <span>Analytics</span>}
                        </Link>
                        <Link href="/dashboard/load-balancing" className="nav-link" title={isCollapsed ? "Load Balancing" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><Scale size={18} /></span>
                            {!isCollapsed && <span>Load Balancing</span>}
                        </Link>
                        <Link href="/dashboard/predictive-risks" className="nav-link" title={isCollapsed ? "Predictive Risks" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><Sparkles size={18} /></span>
                            {!isCollapsed && <span>Predictive Risks</span>}
                        </Link>
                        <Link href="/dashboard/healing" className="nav-link" title={isCollapsed ? "Healing" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><HeartPulse size={18} /></span>
                            {!isCollapsed && <span>Healing</span>}
                        </Link>

                        {!isCollapsed && (
                            <div className="pl-4 mt-3 mb-1 text-[0.65rem] text-gray-400 uppercase tracking-[0.1em] font-bold whitespace-nowrap">
                                System
                            </div>
                        )}
                        {isCollapsed && <div className="h-3" />}

                        <Link href="/dashboard/reports" className="nav-link" title={isCollapsed ? "Reports" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><FileText size={18} /></span>
                            {!isCollapsed && <span>Reports</span>}
                        </Link>
                        <Link href="/dashboard/configuration" className="nav-link" title={isCollapsed ? "Routing Config" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><Settings size={18} /></span>
                            {!isCollapsed && <span>Routing Config</span>}
                        </Link>
                        <Link href="/dashboard/audit" className="nav-link" title={isCollapsed ? "Audit Log" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><ScrollText size={18} /></span>
                            {!isCollapsed && <span>Audit Log</span>}
                        </Link>
                        <Link href="/dashboard/billing" className="nav-link" title={isCollapsed ? "Billing" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><CreditCard size={18} /></span>
                            {!isCollapsed && <span>Billing</span>}
                        </Link>
                        <Link href="/dashboard/settings" className="nav-link" title={isCollapsed ? "Settings" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span className="min-w-[24px] flex justify-center text-gray-600"><Wrench size={18} /></span>
                            {!isCollapsed && <span>Settings</span>}
                        </Link>
                    </nav>

                    <div className="mt-auto flex flex-col gap-2">
                        {!isCollapsed && (
                            <Link href="/dashboard/profile" className="no-underline">
                                <div className="profile-card-hover p-3 rounded-xl border border-blue-200 cursor-pointer" style={{ background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)' }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{ background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' }}>
                                            <User size={16} color="#fff" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <div className="text-sm font-semibold text-blue-800 truncate">{orgName || 'My Organization'}</div>
                                            <div className="text-[0.7rem] text-blue-400 truncate">{userEmail}</div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        <button
                            onClick={handleLogout}
                            className="nav-link bg-red-50 border border-red-200 w-full text-left cursor-pointer text-red-600 text-[0.8rem] flex items-center gap-3"
                            style={{
                                justifyContent: isCollapsed ? 'center' : 'flex-start',
                            }}
                            title={isCollapsed ? "Log Out" : ""}
                        >
                            <div className="min-w-[24px] flex justify-center">
                                <LogOut size={20} />
                            </div>
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

                <div className="container min-h-full pt-1 pr-3 pb-0 pl-4">
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
          padding: 0.5rem 0.75rem;
          border-radius: 10px;
          color: #4B5563;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 14px;
          font-size: 0.82rem;
          font-weight: 500;
          border: 1px solid transparent;
        }
        .nav-link span:first-child {
          min-width: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .nav-link:hover {
          background: #FFFFFF;
          color: #111827;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
          transform: translateX(4px);
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
