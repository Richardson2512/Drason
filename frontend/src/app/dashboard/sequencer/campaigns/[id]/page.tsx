'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Play, Pause, Trash2, Loader2, Users, Mail, MousePointerClick,
    MessageSquare, AlertTriangle, Clock, Send, Zap, ShieldCheck, Eye, Pencil,
    FileText, Database, Hand, Webhook, GitMerge, X,
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import ScheduleCalendarView from '@/components/sequencer/ScheduleCalendarView';
import RecipientPreviewPanel from '@/components/sequencer/RecipientPreviewPanel';
import toast from 'react-hot-toast';

interface Variant {
    id: string;
    label: string;
    subject: string;
    body_html: string;
    weight: number;
    sends?: number;
    opens?: number;
    replies?: number;
}

interface Step {
    id: string;
    step_number: number;
    delay_days: number;
    delay_hours: number;
    subject: string;
    body_html: string;
    variants: Variant[];
}

interface Account {
    account: {
        id: string;
        email: string;
        display_name: string | null;
        provider: string;
        connection_status: string;
    };
}

interface Campaign {
    id: string;
    name: string;
    status: string;
    tags: string[];
    schedule_timezone: string;
    schedule_start_time: string | null;
    schedule_end_time: string | null;
    schedule_days: string[];
    daily_limit: number;
    send_gap_minutes: number;
    esp_routing: boolean;
    stop_on_reply: boolean;
    stop_on_bounce: boolean;
    track_opens: boolean;
    track_clicks: boolean;
    total_leads: number;
    total_sent: number;
    total_opened: number;
    total_clicked: number;
    total_replied: number;
    total_bounced: number;
    total_unsubscribed: number;
    lead_count: number;
    leads_summary: Record<string, number>;
    lead_imports?: LeadImportRow[];
    steps: Step[];
    accounts: Account[];
    created_at: string;
    launched_at: string | null;
}

interface LeadImportRow {
    id: string;
    source: string;            // csv | clay | crm | manual | api | database
    source_file: string | null;
    source_label: string | null;
    total_submitted: number;
    added_count: number;
    blocked_count: number;
    duplicate_count: number;
    created_at: string;
}

const statusStyles: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 border border-gray-200',
    active: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    paused: 'bg-amber-50 text-amber-700 border border-amber-200',
    completed: 'bg-blue-50 text-blue-700 border border-blue-200',
    archived: 'bg-gray-100 text-gray-500 border border-gray-200',
};

export default function CampaignDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = Array.isArray(params?.id) ? params.id[0] : (params?.id as string);

    const [campaign, setCampaign] = useState<Campaign | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acting, setActing] = useState<null | 'launch' | 'pause' | 'resume' | 'delete'>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [previewModalStepId, setPreviewModalStepId] = useState<string | null>(null);
    const [previewModalVariantIdx, setPreviewModalVariantIdx] = useState(0);
    useEffect(() => {
        if (!previewModalStepId) return;
        window.dispatchEvent(new Event('recipient-preview-open'));
        return () => {
            window.dispatchEvent(new Event('recipient-preview-close'));
        };
    }, [previewModalStepId]);

    const fetchCampaign = async () => {
        try {
            const res = await apiClient<any>(`/api/sequencer/campaigns/${id}`);
            // apiClient unwraps `data` → returns the campaign object directly
            setCampaign(res as Campaign);
        } catch (err: any) {
            setError(err?.message ||'Failed to load campaign');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) fetchCampaign();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const doAction = async (action: 'launch' | 'pause' | 'resume' | 'delete') => {
        if (!campaign) return;
        if (action === 'delete') {
            setShowDeleteConfirm(true);
            return;
        }
        setActing(action);
        try {
            await apiClient(`/api/sequencer/campaigns/${id}/${action}`, { method: 'POST' });
            toast.success(`Campaign ${action}${action === 'launch' ? 'ed' : 'd'}`);
            await fetchCampaign();
        } catch {
            // apiClient auto-toasts
        } finally {
            setActing(null);
        }
    };

    const confirmDelete = async () => {
        setActing('delete');
        try {
            await apiClient(`/api/sequencer/campaigns/${id}`, { method: 'DELETE' });
            toast.success('Campaign deleted');
            router.push('/dashboard/sequencer/campaigns');
        } catch {
            setActing(null);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex items-center justify-center min-h-[60vh]">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    if (error || !campaign) {
        return (
            <div className="p-6 flex flex-col items-center justify-center min-h-[60vh] gap-3">
                <p className="text-sm text-red-600">{error ||'Campaign not found'}</p>
                <Link href="/dashboard/sequencer/campaigns" className="text-xs text-gray-600 underline">← Back to campaigns</Link>
            </div>
        );
    }

    const scheduleLine = campaign.schedule_start_time && campaign.schedule_end_time
        ? `${campaign.schedule_start_time} – ${campaign.schedule_end_time}`
        : 'Not set';
    const daysLine = campaign.schedule_days?.length
        ? campaign.schedule_days.map(d => d.charAt(0).toUpperCase() + d.slice(1)).join(', ')
        : 'Not set';

    return (
        <div className="p-4 flex flex-col gap-4">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 min-w-0">
                    <button
                        onClick={() => router.push('/dashboard/sequencer/campaigns')}
                        className="mt-1 p-1 rounded hover:bg-gray-100 cursor-pointer border-none bg-transparent"
                        aria-label="Back"
                    >
                        <ArrowLeft size={16} className="text-gray-600" />
                    </button>
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-xl font-bold text-gray-900 truncate">{campaign.name}</h1>
                            <span className={`text-[10px] font-semibold capitalize px-2 py-0.5 rounded ${statusStyles[campaign.status] ||statusStyles.draft}`}>
                                {campaign.status}
                            </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">
                            Created {new Date(campaign.created_at).toLocaleDateString()}
                            {campaign.launched_at ? ` · Launched ${new Date(campaign.launched_at).toLocaleDateString()}` : ''}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    {(campaign.status === 'draft' || campaign.status === 'active' || campaign.status === 'paused') && (
                        <Link
                            href={`/dashboard/sequencer/campaigns/new?id=${campaign.id}`}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 border border-[#D1CBC5] text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-50"
                        >
                            <Pencil size={12} /> Edit
                        </Link>
                    )}
                    {campaign.status === 'draft' && (
                        <button
                            onClick={() => doAction('launch')}
                            disabled={!!acting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {acting === 'launch' ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Launch
                        </button>
                    )}
                    {campaign.status === 'active' && (
                        <button
                            onClick={() => doAction('pause')}
                            disabled={!!acting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-amber-700 disabled:opacity-50"
                        >
                            {acting === 'pause' ? <Loader2 size={12} className="animate-spin" /> : <Pause size={12} />} Pause
                        </button>
                    )}
                    {campaign.status === 'paused' && (
                        <button
                            onClick={() => doAction('resume')}
                            disabled={!!acting}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
                        >
                            {acting === 'resume' ? <Loader2 size={12} className="animate-spin" /> : <Play size={12} />} Resume
                        </button>
                    )}
                    <button
                        onClick={() => doAction('delete')}
                        disabled={!!acting}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 text-xs font-semibold rounded-lg cursor-pointer hover:bg-red-50 disabled:opacity-50"
                    >
                        {acting === 'delete' ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />} Delete
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                <StatCard icon={<Users size={13} />} label="Leads" value={campaign.lead_count ||campaign.total_leads ||0} />
                <StatCard icon={<Send size={13} />} label="Sent" value={campaign.total_sent ||0} />
                <StatCard icon={<Eye size={13} />} label="Opened" value={campaign.total_opened ||0} />
                <StatCard icon={<MousePointerClick size={13} />} label="Clicked" value={campaign.total_clicked ||0} />
                <StatCard icon={<MessageSquare size={13} />} label="Replied" value={campaign.total_replied ||0} />
                <StatCard icon={<AlertTriangle size={13} />} label="Bounced" value={campaign.total_bounced ||0} />
            </div>

            {/* Schedule visualization */}
            <ScheduleCalendarView
                timezone={campaign.schedule_timezone}
                days={campaign.schedule_days}
                startTime={campaign.schedule_start_time}
                endTime={campaign.schedule_end_time}
            />

            {/* Schedule (text) + Settings */}
            <div className="grid md:grid-cols-2 gap-3">
                <div className="premium-card p-3">
                    <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                        <Clock size={12} /> Schedule
                    </h2>
                    <Row label="Timezone" value={campaign.schedule_timezone} />
                    <Row label="Window" value={scheduleLine} />
                    <Row label="Days" value={daysLine} />
                    <Row label="Daily limit" value={String(campaign.daily_limit)} />
                    <Row label="Send gap" value={`${campaign.send_gap_minutes} min`} />
                </div>
                <div className="premium-card p-3">
                    <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                        <Zap size={12} /> Settings
                    </h2>
                    <Row label="ESP routing" value={campaign.esp_routing ? 'On' : 'Off'} />
                    <Row label="Stop on reply" value={campaign.stop_on_reply ? 'On' : 'Off'} />
                    <Row label="Stop on bounce" value={campaign.stop_on_bounce ? 'On' : 'Off'} />
                    <Row label="Track opens" value={campaign.track_opens ? 'On' : 'Off'} />
                    <Row label="Track clicks" value={campaign.track_clicks ? 'On' : 'Off'} />
                </div>
            </div>

            {/* Steps */}
            <div className="premium-card p-3">
                <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                    <Mail size={12} /> Sequence <span className="text-gray-400 font-normal">({campaign.steps.length} step{campaign.steps.length === 1 ? '' : 's'})</span>
                </h2>
                {campaign.steps.length === 0 ? (
                    <p className="text-xs text-gray-500 py-2">No steps configured.</p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {campaign.steps.map((step) => (
                            <div key={step.id} className="rounded-lg p-2.5" style={{ border: '1px solid #E8E3DC' }}>
                                <div className="flex items-center justify-between mb-1">
                                    <span className="text-[11px] font-semibold text-gray-900">Step {step.step_number}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] text-gray-500">
                                            {step.step_number === 1
                                                ? 'Send immediately'
                                                : `+${step.delay_days}d ${step.delay_hours}h delay`}
                                        </span>
                                        <button
                                            onClick={() => { setPreviewModalVariantIdx(0); setPreviewModalStepId(step.id); }}
                                            className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-700 hover:text-gray-900 cursor-pointer bg-transparent border-none px-1.5 py-0.5 rounded hover:bg-gray-50"
                                            title="Preview as recipient"
                                        >
                                            <Eye size={11} />
                                            Preview as recipient
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-900 font-medium truncate">{step.subject || '(no subject)'}</p>
                                {step.variants && step.variants.length > 0 && (
                                    <p className="text-[10px] text-gray-400 mt-1">
                                        {step.variants.length} variant{step.variants.length === 1 ? '' : 's'}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Leads by status */}
            {Object.keys(campaign.leads_summary || {}).length > 0 && (
                <div className="premium-card p-3">
                    <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                        <Users size={12} /> Leads by status
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {Object.entries(campaign.leads_summary).map(([status, count]) => (
                            <span key={status} className="text-[11px] px-2 py-1 rounded bg-gray-50 text-gray-700 capitalize">
                                {status}: <span className="font-semibold">{count}</span>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Lead sources — provenance panel. One row per CampaignLeadImport
                batch (CSV upload, Clay ingest, manual add, API push). For CSV
                rows the filename is shown so users can audit which file added
                which leads. Empty state hides the section to avoid clutter on
                fresh campaigns. */}
            {campaign.lead_imports && campaign.lead_imports.length > 0 && (
                <div className="premium-card p-3">
                    <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                        <GitMerge size={12} /> Lead sources <span className="text-gray-400 font-normal">({campaign.lead_imports.length})</span>
                    </h2>
                    <div className="flex flex-col gap-1.5">
                        {campaign.lead_imports.map(imp => (
                            <LeadSourceRow key={imp.id} imp={imp} />
                        ))}
                    </div>
                </div>
            )}

            {/* Connected accounts */}
            <div className="premium-card p-3">
                <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                    <ShieldCheck size={12} /> Sending mailboxes <span className="text-gray-400 font-normal">({campaign.accounts.length})</span>
                </h2>
                {campaign.accounts.length === 0 ? (
                    <p className="text-xs text-gray-500 py-2">No mailboxes connected to this campaign.</p>
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {campaign.accounts.map((a) => (
                            <div key={a.account.id} className="flex items-center justify-between text-xs">
                                <div className="min-w-0 flex-1">
                                    <p className="text-gray-900 truncate">{a.account.display_name || a.account.email}</p>
                                    <p className="text-[10px] text-gray-500">{a.account.email} · {a.account.provider}</p>
                                </div>
                                <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded capitalize ${
                                    a.account.connection_status === 'active' ? 'bg-emerald-50 text-emerald-700' :
                                    a.account.connection_status === 'error' ? 'bg-red-50 text-red-700' :
                                    'bg-gray-100 text-gray-600'
                                }`}>{a.account.connection_status}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal — platform-themed */}
            {showDeleteConfirm && (
                <div
                    className="fixed inset-0 bg-black/50 backdrop-blur-[4px] flex items-center justify-center z-[9998] p-4"
                    onClick={(e) => { if (e.target === e.currentTarget && acting !== 'delete') setShowDeleteConfirm(false); }}
                >
                    <div
                        className="bg-white rounded-xl w-full max-w-md"
                        style={{ border: '1px solid #D1CBC5', boxShadow: '0 25px 50px rgba(0,0,0,0.15)' }}
                    >
                        <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #D1CBC5' }}>
                            <div className="flex items-center gap-2">
                                <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center">
                                    <Trash2 size={13} className="text-red-600" />
                                </div>
                                <h2 className="text-sm font-bold text-gray-900">Delete campaign</h2>
                            </div>
                            <button
                                onClick={() => { if (acting !== 'delete') setShowDeleteConfirm(false); }}
                                disabled={acting === 'delete'}
                                className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none disabled:opacity-50"
                                aria-label="Close"
                            >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-gray-700 mb-1">
                                You&apos;re about to delete <span className="font-semibold text-gray-900">&ldquo;{campaign.name}&rdquo;</span>.
                            </p>
                            <p className="text-[11px] text-gray-500">
                                This also removes {campaign.lead_count?.toLocaleString() || 0} campaign lead record{campaign.lead_count === 1 ? '' : 's'} and {campaign.steps.length} sequence step{campaign.steps.length === 1 ? '' : 's'}. This action can&apos;t be undone.
                            </p>
                        </div>
                        <div className="p-3 flex justify-end gap-2" style={{ borderTop: '1px solid #E8E3DC', background: '#FAFAF8' }}>
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={acting === 'delete'}
                                className="px-4 py-1.5 text-xs text-gray-700 rounded-lg cursor-pointer hover:bg-white disabled:opacity-50"
                                style={{ border: '1px solid #D1CBC5' }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={acting === 'delete'}
                                className="flex items-center gap-1.5 px-4 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-red-700 disabled:opacity-50"
                            >
                                {acting === 'delete' ? <Loader2 size={11} className="animate-spin" /> : <Trash2 size={11} />}
                                {acting === 'delete' ? 'Deleting...' : 'Delete campaign'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Recipient Preview Modal — full-bleed, with client + device pickers */}
            {previewModalStepId && (() => {
                const step = campaign.steps.find(s => s.id === previewModalStepId);
                if (!step) return null;
                const allVariants = [
                    { label: 'A', subject: step.subject, body_html: step.body_html },
                    ...(step.variants || []).map(v => ({ label: v.label, subject: v.subject, body_html: v.body_html })),
                ];
                const activeIdx = Math.min(previewModalVariantIdx, allVariants.length - 1);
                const active = allVariants[activeIdx];
                const senderAccount = campaign.accounts?.[0]?.account;
                return (
                    <div
                        className="fixed inset-0 bg-black/60 backdrop-blur-[4px] flex items-center justify-center z-[9998] p-4"
                        onClick={(e) => { if (e.target === e.currentTarget) setPreviewModalStepId(null); }}
                    >
                        <div className="bg-white rounded-2xl w-full max-w-[1480px] h-[94vh] flex flex-col shadow-2xl overflow-hidden" style={{ border: '1px solid #E5E5E5' }}>
                            <div className="px-6 py-4 flex items-center justify-between bg-white" style={{ borderBottom: '1px solid #E5E5E5' }}>
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center">
                                        <Eye size={16} />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-semibold text-neutral-900">Preview as recipient</h2>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            Step {step.step_number} · this is exactly what your prospect saw when they received this email.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    {allVariants.length > 1 && (
                                        <div className="inline-flex rounded-lg border border-neutral-200 bg-white p-0.5">
                                            {allVariants.map((v, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setPreviewModalVariantIdx(i)}
                                                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase ${
                                                        activeIdx === i ? 'bg-neutral-900 text-white' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-50'
                                                    }`}
                                                >
                                                    Variant {v.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                    <button
                                        onClick={() => setPreviewModalStepId(null)}
                                        className="inline-flex items-center gap-1.5 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50"
                                    >
                                        <X size={14} />
                                        Close
                                    </button>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-neutral-50 px-6 py-6">
                                <RecipientPreviewPanel
                                    subject={active.subject || ''}
                                    bodyHtml={active.body_html || ''}
                                    senderName={senderAccount?.display_name || senderAccount?.email?.split('@')[0] || 'You'}
                                    senderEmail={senderAccount?.email || 'you@yourdomain.com'}
                                />
                            </div>
                        </div>
                    </div>
                );
            })()}
        </div>
    );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) {
    return (
        <div className="premium-card p-2.5">
            <div className="flex items-center gap-1 text-[10px] text-gray-500 mb-1">
                {icon} {label}
            </div>
            <p className="text-lg font-bold text-gray-900">{typeof value === 'number' ? value.toLocaleString() : value}</p>
        </div>
    );
}

function Row({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between py-1 text-xs">
            <span className="text-gray-500">{label}</span>
            <span className="text-gray-900 font-medium">{value}</span>
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Lead source row — one CampaignLeadImport batch
// ────────────────────────────────────────────────────────────────────

function LeadSourceRow({ imp }: { imp: LeadImportRow }) {
    const meta = sourceMeta(imp.source);
    const Icon = meta.icon;

    // Primary label — filename takes precedence for CSV; everyone else falls
    // back to the human-readable source name ("Clay ingest", "Manual add").
    const primary = imp.source_file
        ? imp.source_file
        : imp.source_label || meta.label;
    const showFilenameSubtitle = !!imp.source_file && !!imp.source_label;

    return (
        <div
            className="flex items-center gap-3 px-3 py-2 rounded-lg border border-[#E8E3DC] bg-white"
        >
            <span
                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                style={{ background: meta.bg }}
            >
                <Icon size={13} style={{ color: meta.fg }} />
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-900 truncate">{primary}</span>
                    <span
                        className="text-[9px] uppercase tracking-wider font-bold px-1.5 py-0.5 rounded shrink-0"
                        style={{ background: meta.bg, color: meta.fg }}
                    >
                        {meta.label}
                    </span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                    {showFilenameSubtitle && <span className="text-gray-700">{imp.source_label} · </span>}
                    Added <span className="text-gray-700 font-medium">{imp.added_count}</span> of {imp.total_submitted}
                    {imp.blocked_count > 0 && <> · <span className="text-red-600">{imp.blocked_count} blocked</span></>}
                    {imp.duplicate_count > 0 && <> · <span className="text-amber-600">{imp.duplicate_count} dupes</span></>}
                    <span className="text-gray-400"> · {timeAgo(imp.created_at)}</span>
                </div>
            </div>
        </div>
    );
}

function sourceMeta(source: string): { label: string; icon: React.ComponentType<any>; bg: string; fg: string } {
    switch (source.toLowerCase()) {
        case 'csv':      return { label: 'CSV',      icon: FileText, bg: '#EFF6FF', fg: '#1D4ED8' };
        case 'clay':     return { label: 'Clay',     icon: Database, bg: '#F0FDF4', fg: '#15803D' };
        case 'database': return { label: 'Library',  icon: Database, bg: '#F5F3FF', fg: '#6D28D9' };
        case 'crm':      return { label: 'CRM',      icon: GitMerge, bg: '#FEF3C7', fg: '#92400E' };
        case 'api':      return { label: 'API',      icon: Webhook,  bg: '#F1F5F9', fg: '#334155' };
        case 'manual':   return { label: 'Manual',   icon: Hand,     bg: '#F5F5F4', fg: '#57534E' };
        default:         return { label: source.toUpperCase(), icon: GitMerge, bg: '#F5F5F4', fg: '#57534E' };
    }
}

function timeAgo(iso: string): string {
    const ms = Date.now() - new Date(iso).getTime();
    const s = Math.floor(ms / 1000);
    if (s < 60) return `${s}s ago`;
    const m = Math.floor(s / 60);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 48) return `${h}h ago`;
    const d = Math.floor(h / 24);
    return `${d}d ago`;
}
