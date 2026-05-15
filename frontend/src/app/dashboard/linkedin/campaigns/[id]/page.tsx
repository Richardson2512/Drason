'use client';

/**
 * LinkedIn campaign detail page - feature parity with the email-side
 * `/sequencer/campaigns/[id]/page.tsx`. Renders:
 *
 *   - Header: name + status pill + Sequence-schema / Edit / Launch /
 *     Pause / Resume / Delete buttons
 *   - Stats row: enrollment + reply-rate + accept-rate tiles
 *   - Schedule box: aggregated working-hours + daily caps across the
 *     LinkedIn sender pool
 *   - Settings box: stop-on-reply, channel discipline
 *   - Leads-by-status box: pending / in-sequence / finished / replied
 *   - Sender pool table
 *   - Sequence summary (links into the schema page for the full diagram)
 *
 * Pause/Resume/Delete use the shared Sequencer endpoints (PATCH/DELETE on
 * /api/sequencer/campaigns/:id) since LinkedIn and Sequencer share the
 * Campaign table. Launch uses /api/linkedin/campaigns/:id/launch which
 * runs the LinkedIn-specific pre-launch validator before flipping status.
 */

import { useEffect, useState, useCallback, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, GitBranch, Pause, Play, Loader2, Rocket, Users,
    AlertTriangle, CheckCircle2, MessageCircle, Send, UserCheck,
    Settings as SettingsIcon, Pencil, Trash2, Clock, Globe, Linkedin, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

interface PreLaunchIssue {
    severity: 'ERROR' | 'WARN' | 'INFO';
    code: string;
    message: string;
    details?: Record<string, unknown>;
}

interface PreLaunchReport {
    can_launch: boolean;
    errors: PreLaunchIssue[];
    warnings: PreLaunchIssue[];
    info: PreLaunchIssue[];
    buckets: {
        total: number;
        no_linkedin_profile: number;
        connected_to_any_sender: number;
        not_connected: number;
    };
    capacity: {
        invites_per_week_total: number;
        invites_needed: number;
        sufficient: boolean;
    };
}

interface WorkingHours {
    tz?: string;
    days?: number[];          // 1=Mon … 7=Sun
    start?: string;           // 'HH:MM'
    end?: string;
}

interface SenderRow {
    id: string;
    linkedin_account_id: string;
    display_name: string;
    account_type: string;
    status: string;
    max_invites_per_day: number;
    max_messages_per_day: number;
    max_inmails_per_day: number;
    rotation_priority: number;
    enabled: boolean;
    working_hours?: WorkingHours | null;
}

interface StepRow {
    id: string;
    step_number: number;
    step_type: string;
    delay_days: number | null;
    delay_hours: number | null;
    subject: string | null;
    body: string | null;
}

interface CampaignDetail {
    campaign: {
        id: string;
        name: string;
        status: string;
        stop_on_reply: boolean;
        created_at: string;
        updated_at: string;
        launched_at?: string | null;
    };
    senders: SenderRow[];
    steps: StepRow[];
    counts: {
        total_leads: number;
        pending: number;
        in_sequence: number;
        finished: number;
        replied: number;
        // Optional, surfaced when the backend computes lifetime aggregates.
        cr_sent?: number;
        accepted?: number;
        dms_sent?: number;
        accept_rate?: number;
        reply_rate?: number;
    };
}

const STATUS_PILL: Record<string, { bg: string; fg: string; label: string }> = {
    draft:     { bg: '#F3F4F6', fg: '#374151', label: 'Draft' },
    active:    { bg: '#DCFCE7', fg: '#15803D', label: 'Active' },
    ongoing:   { bg: '#DCFCE7', fg: '#15803D', label: 'Ongoing' },
    paused:    { bg: '#FEF3C7', fg: '#B45309', label: 'Paused' },
    finished:  { bg: '#E0F2FE', fg: '#075985', label: 'Finished' },
    completed: { bg: '#E0F2FE', fg: '#075985', label: 'Completed' },
};

const STEP_LABEL: Record<string, { label: string; icon: React.ReactNode; tint: string }> = {
    linkedin_connection_request: { label: 'Connection request',  icon: <UserCheck className="w-3 h-3" />, tint: '#0A66C2' },
    linkedin_message:            { label: 'Direct message',       icon: <MessageCircle className="w-3 h-3" />, tint: '#16A34A' },
    linkedin_inmail:             { label: 'InMail',               icon: <Send className="w-3 h-3" />, tint: '#8B5CF6' },
    linkedin_view_profile:       { label: 'View profile',         icon: <UserCheck className="w-3 h-3" />, tint: '#F59E0B' },
    linkedin_follow:             { label: 'Follow',               icon: <UserCheck className="w-3 h-3" />, tint: '#06B6D4' },
    linkedin_like_post:          { label: 'Like recent post',     icon: <UserCheck className="w-3 h-3" />, tint: '#EC4899' },
};

const DAY_LABEL = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function LinkedInCampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const router = useRouter();
    const [data, setData] = useState<CampaignDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [acting, setActing] = useState<'pause' | 'resume' | 'launch' | 'delete' | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [validationReport, setValidationReport] = useState<PreLaunchReport | null>(null);
    const [validating, setValidating] = useState(false);
    const [showLaunchModal, setShowLaunchModal] = useState(false);

    const fetchDetail = useCallback(async () => {
        setLoading(true);
        try {
            const d = await apiClient<CampaignDetail>(`/api/linkedin/campaigns/${id}`);
            setData(d);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load campaign');
            setData(null);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => { fetchDetail(); }, [fetchDetail]);

    // Refetch on focus / visibility - catches status changes the operator
    // made in another tab (or that the dispatcher / supervisor wrote
    // server-side). See campaigns list page for the same pattern.
    useEffect(() => {
        const onFocus = () => { void fetchDetail(); };
        const onVisibility = () => { if (document.visibilityState === 'visible') void fetchDetail(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [fetchDetail]);

    const togglePause = async () => {
        if (!data) return;
        const isPausing = data.campaign.status !== 'paused';
        setActing(isPausing ? 'pause' : 'resume');
        try {
            // Hit the LinkedIn-channel-scoped pause/resume routes - same
            // underlying Campaign row as the sequencer pair, but the URL
            // and validation stay under /api/linkedin/* so cross-controller
            // changes don't silently leak into the LinkedIn UX path.
            await apiClient(`/api/linkedin/campaigns/${id}/${isPausing ? 'pause' : 'resume'}`, {
                method: 'POST',
            });
            toast.success(isPausing ? 'Campaign paused' : 'Campaign resumed');
            await fetchDetail();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to update campaign');
        } finally {
            setActing(null);
        }
    };

    // Click Launch → run the pre-launch validator and open the confirm
    // modal. The actual /launch call only fires after the operator
    // reviews the report and confirms (or aborts on hard errors).
    const handleLaunch = async () => {
        if (!data) return;
        setValidating(true);
        setShowLaunchModal(true);
        setValidationReport(null);
        try {
            const resp = await apiClient<{ success: boolean; data: PreLaunchReport } | PreLaunchReport>(
                `/api/linkedin/campaigns/${id}/validate`,
                { method: 'POST' },
            );
            const report: PreLaunchReport = (resp as any)?.data ?? resp;
            setValidationReport(report);
        } catch (err: any) {
            toast.error(err?.message || 'Validation failed');
            setShowLaunchModal(false);
        } finally {
            setValidating(false);
        }
    };

    const confirmLaunch = async () => {
        if (!data || !validationReport?.can_launch) return;
        setActing('launch');
        try {
            await apiClient(`/api/linkedin/campaigns/${id}/launch`, { method: 'POST' });
            toast.success('Campaign launched');
            setShowLaunchModal(false);
            setValidationReport(null);
            await fetchDetail();
        } catch (err: any) {
            toast.error(err?.message || 'Failed to launch campaign');
        } finally {
            setActing(null);
        }
    };

    const confirmDelete = async () => {
        setActing('delete');
        try {
            await apiClient(`/api/sequencer/campaigns/${id}`, { method: 'DELETE' });
            toast.success('Campaign deleted');
            router.push('/dashboard/linkedin/campaigns');
        } catch (err: any) {
            toast.error(err?.message || 'Failed to delete campaign');
            setActing(null);
            setShowDeleteConfirm(false);
        }
    };

    const status = data?.campaign.status ? STATUS_PILL[data.campaign.status] ?? { bg: '#F3F4F6', fg: '#374151', label: data.campaign.status } : null;
    const isPaused = data?.campaign.status === 'paused';
    const isActive = data?.campaign.status === 'active' || data?.campaign.status === 'ongoing';
    const isDraft = data?.campaign.status === 'draft';

    // Aggregate the LinkedIn sender pool's working_hours + daily caps so
    // the Schedule box has something concrete to show. If every sender
    // shares the same window, we display it once; otherwise we show
    // "varies by sender" and let the operator drill into the pool table.
    const schedule = (() => {
        if (!data || data.senders.length === 0) return null;
        const whs = data.senders.map(s => s.working_hours).filter((w): w is WorkingHours => Boolean(w));
        const tzs = new Set(whs.map(w => w.tz || ''));
        const windows = new Set(whs.map(w => `${w.start ?? ''}-${w.end ?? ''}`));
        const dayKeys = new Set(whs.map(w => (w.days ?? []).slice().sort().join(',')));
        const tz = tzs.size === 1 ? Array.from(tzs)[0] || '-' : 'varies';
        const window = windows.size === 1 ? Array.from(windows)[0] || '-' : 'varies';
        const days = (() => {
            if (dayKeys.size !== 1) return 'varies';
            const k = Array.from(dayKeys)[0];
            if (!k) return '-';
            return k.split(',').map(n => DAY_LABEL[Number(n)] || '?').join(', ');
        })();
        const invitesPerDay  = data.senders.reduce((s, x) => s + (x.max_invites_per_day ?? 0), 0);
        const messagesPerDay = data.senders.reduce((s, x) => s + (x.max_messages_per_day ?? 0), 0);
        const inmailsPerDay  = data.senders.reduce((s, x) => s + (x.max_inmails_per_day ?? 0), 0);
        return { tz, window, days, invitesPerDay, messagesPerDay, inmailsPerDay };
    })();

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center gap-2 flex-wrap">
                <Link href="/dashboard/linkedin/campaigns" className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="w-3 h-3" /> Campaigns
                </Link>
            </div>

            {loading ? (
                <div className="premium-card flex items-center justify-center py-12 text-xs text-gray-500">
                    <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading campaign…
                </div>
            ) : error ? (
                <div className="premium-card flex flex-col items-center justify-center py-12">
                    <AlertTriangle className="w-6 h-6 text-rose-600 mb-2" />
                    <p className="text-sm text-rose-600 mb-3">{error}</p>
                    <button onClick={fetchDetail} className="px-3 py-1.5 bg-gray-900 text-white rounded-md text-xs font-semibold">Retry</button>
                </div>
            ) : data ? (
                <>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <Linkedin className="w-4 h-4 text-[#0A66C2]" />
                                <h1 className="text-xl font-bold text-gray-900 truncate">{data.campaign.name}</h1>
                                {status && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold" style={{ background: status.bg, color: status.fg }}>
                                        {status.label}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Created {new Date(data.campaign.created_at).toLocaleDateString()}
                                {data.campaign.launched_at ? ` · Launched ${new Date(data.campaign.launched_at).toLocaleDateString()}` : ''}
                                {' · '}{data.campaign.stop_on_reply ? 'Stops on reply' : 'Continues after reply'}
                            </p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
                            <Link
                                href={`/dashboard/linkedin/campaigns/${id}/sequence`}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 border border-[#D1CBC5] text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-50 no-underline"
                            >
                                <GitBranch className="w-3.5 h-3.5" /> Sequence schema
                            </Link>
                            {(isDraft || isActive || isPaused) && (
                                <Link
                                    href={`/dashboard/linkedin/campaigns/new?id=${id}`}
                                    className="flex items-center gap-1.5 px-3 py-1.5 text-gray-700 border border-[#D1CBC5] text-xs font-semibold rounded-lg cursor-pointer hover:bg-gray-50 no-underline"
                                >
                                    <Pencil className="w-3.5 h-3.5" /> Edit
                                </Link>
                            )}
                            {isDraft && (
                                <button
                                    onClick={handleLaunch}
                                    disabled={!!acting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {acting === 'launch' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                    Launch
                                </button>
                            )}
                            {isActive && (
                                <button
                                    onClick={togglePause}
                                    disabled={!!acting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-amber-700 disabled:opacity-50"
                                >
                                    {acting === 'pause' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Pause className="w-3.5 h-3.5" />}
                                    Pause
                                </button>
                            )}
                            {isPaused && (
                                <button
                                    onClick={togglePause}
                                    disabled={!!acting}
                                    className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
                                >
                                    {acting === 'resume' ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                                    Resume
                                </button>
                            )}
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                disabled={!!acting}
                                className="flex items-center gap-1.5 px-3 py-1.5 text-red-600 border border-red-200 text-xs font-semibold rounded-lg cursor-pointer hover:bg-red-50 disabled:opacity-50"
                            >
                                <Trash2 className="w-3.5 h-3.5" /> Delete
                            </button>
                        </div>
                    </div>

                    {/* Stats row - enrollment + rate cards */}
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                        <StatCard label="Total leads"  value={data.counts.total_leads} />
                        <StatCard label="In sequence"  value={data.counts.in_sequence} accent="#0A66C2" />
                        <StatCard label="Replied"      value={data.counts.replied}     accent="#8B5CF6" />
                        <StatCard label="Accept rate"  value={data.counts.accept_rate != null ? `${Math.round(data.counts.accept_rate * 100)}%` : '-'} accent="#16A34A" />
                        <StatCard label="Reply rate"   value={data.counts.reply_rate  != null ? `${Math.round(data.counts.reply_rate  * 100)}%` : '-'} accent="#8B5CF6" />
                        <StatCard label="Finished"     value={data.counts.finished} />
                    </div>

                    {/* Schedule + Settings */}
                    <div className="grid md:grid-cols-2 gap-3">
                        <div className="premium-card p-3">
                            <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                                <Clock size={12} /> Schedule
                                {schedule == null && (
                                    <span className="text-[10px] font-normal text-gray-400">- no senders</span>
                                )}
                            </h2>
                            {schedule ? (
                                <>
                                    <Row label="Timezone"        value={schedule.tz} icon={<Globe size={10} />} />
                                    <Row label="Window"          value={schedule.window} />
                                    <Row label="Days"            value={schedule.days} />
                                    <Row label="Invites / day"   value={`${schedule.invitesPerDay} total`} />
                                    <Row label="Messages / day"  value={`${schedule.messagesPerDay} total`} />
                                    <Row label="InMails / day"   value={`${schedule.inmailsPerDay} total`} />
                                </>
                            ) : (
                                <p className="text-xs text-gray-500 py-2">No senders attached - add LinkedIn accounts to set working hours and caps.</p>
                            )}
                        </div>
                        <div className="premium-card p-3">
                            <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                                <SettingsIcon size={12} /> Settings
                            </h2>
                            <Row label="Channel"        value="LinkedIn-only" />
                            <Row label="Stop on reply"  value={data.campaign.stop_on_reply ? 'On' : 'Off'} />
                            <Row label="Steps"          value={`${data.steps.length}`} />
                            <Row label="Senders"        value={`${data.senders.length} in rotation`} />
                            <Row label="Last updated"   value={new Date(data.campaign.updated_at).toLocaleString()} />
                        </div>
                    </div>

                    {/* Leads by status */}
                    <div className="premium-card p-3">
                        <h2 className="text-xs font-bold text-gray-900 mb-2 flex items-center gap-1.5">
                            <Users size={12} /> Leads by status
                        </h2>
                        <div className="flex flex-wrap gap-2">
                            <StatusChip label="Pending"      count={data.counts.pending} />
                            <StatusChip label="In sequence"  count={data.counts.in_sequence} accent="#0A66C2" />
                            <StatusChip label="Finished"     count={data.counts.finished}    accent="#16A34A" />
                            <StatusChip label="Replied"      count={data.counts.replied}     accent="#8B5CF6" />
                            {data.counts.total_leads > 0 && data.counts.pending === 0 && data.counts.in_sequence === 0 && data.counts.finished === 0 && data.counts.replied === 0 && (
                                <span className="text-[11px] text-gray-500 px-2 py-1">No leads enrolled yet.</span>
                            )}
                        </div>
                    </div>

                    {/* Sender pool */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #D1CBC5' }}>
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <Users className="w-3.5 h-3.5 text-gray-700" />
                                Sender pool
                                <span className="text-[11px] font-normal text-gray-500">{data.senders.length} accounts</span>
                            </h2>
                        </div>
                        {data.senders.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-gray-500">
                                No LinkedIn senders attached. Add one before launching the campaign.
                            </div>
                        ) : (
                            <table className="w-full">
                                <thead>
                                    <tr style={{ borderBottom: '1px solid #E8E3DC' }}>
                                        <th className="text-left px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Sender</th>
                                        <th className="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Invites/day</th>
                                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Messages/day</th>
                                        <th className="text-right px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">InMails/day</th>
                                        <th className="text-center px-3 py-2 text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Enabled</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {data.senders.map(s => (
                                        <tr key={s.id} className="hover:bg-gray-50/50">
                                            <td className="px-3 py-2">
                                                <div className="text-xs font-semibold text-gray-900">{s.display_name}</div>
                                                <div className="text-[10px] text-gray-500">{s.account_type.replace(/_/g, ' ')}</div>
                                            </td>
                                            <td className="px-3 py-2 text-center">
                                                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: s.status === 'OK' ? '#DCFCE7' : '#FEF3C7', color: s.status === 'OK' ? '#15803D' : '#B45309' }}>
                                                    {s.status}
                                                </span>
                                            </td>
                                            <td className="px-3 py-2 text-right text-xs tabular-nums text-gray-700">{s.max_invites_per_day}</td>
                                            <td className="px-3 py-2 text-right text-xs tabular-nums text-gray-700">{s.max_messages_per_day}</td>
                                            <td className="px-3 py-2 text-right text-xs tabular-nums text-gray-700">{s.max_inmails_per_day}</td>
                                            <td className="px-3 py-2 text-center">
                                                {s.enabled ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 inline" /> : <Pause className="w-3.5 h-3.5 text-gray-400 inline" />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Mixed-step corruption banner - Super LinkedIn campaigns
                        are supposed to be linkedin_* only. If a non-linkedin
                        step landed (legacy data, direct DB write, bad import),
                        the dispatcher will silently skip it. Surface the
                        anomaly loudly so the operator can fix it in the
                        wizard or have someone clean the row. */}
                    {(() => {
                        const offending = data.steps.filter(s => !s.step_type.startsWith('linkedin_'));
                        if (offending.length === 0) return null;
                        return (
                            <div className="premium-card !bg-rose-50 !border-rose-200 flex items-start gap-2 text-xs text-rose-900">
                                <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-rose-700" />
                                <div>
                                    <div className="font-bold">
                                        {offending.length} step{offending.length === 1 ? '' : 's'} are not LinkedIn steps - the dispatcher will skip them.
                                    </div>
                                    <div className="text-rose-800 mt-0.5">
                                        Found:{' '}
                                        {offending.map(s => `#${s.step_number} (${s.step_type})`).join(', ')}.
                                        Edit the campaign and replace these with linkedin_* steps, or delete the campaign and rebuild it in the wizard.
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Sequence summary */}
                    <div className="premium-card !p-0 overflow-hidden">
                        <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: '1px solid #D1CBC5' }}>
                            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                <SettingsIcon className="w-3.5 h-3.5 text-gray-700" />
                                Sequence steps
                                <span className="text-[11px] font-normal text-gray-500">{data.steps.length} steps</span>
                            </h2>
                            <Link
                                href={`/dashboard/linkedin/campaigns/${id}/sequence`}
                                className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1"
                            >
                                <GitBranch className="w-3 h-3" /> Open schema
                            </Link>
                        </div>
                        {data.steps.length === 0 ? (
                            <div className="px-4 py-8 text-center text-xs text-gray-500">
                                No steps configured. Open the schema to build the sequence.
                            </div>
                        ) : (
                            <ol className="divide-y divide-gray-100">
                                {data.steps.map(step => {
                                    const meta = STEP_LABEL[step.step_type] ?? { label: step.step_type, icon: <Send className="w-3 h-3" />, tint: '#6B7280' };
                                    return (
                                        <li key={step.id} className="px-4 py-3 flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold" style={{ background: '#F3F4F6', color: '#374151' }}>
                                                {step.step_number}
                                            </div>
                                            <div className="flex items-center gap-2 px-2 py-1 rounded-md" style={{ background: `${meta.tint}15`, color: meta.tint }}>
                                                {meta.icon}
                                                <span className="text-[11px] font-semibold">{meta.label}</span>
                                            </div>
                                            <div className="text-[11px] text-gray-500 flex-1 truncate">
                                                {step.delay_days || step.delay_hours
                                                    ? `Wait ${step.delay_days ?? 0}d ${step.delay_hours ?? 0}h`
                                                    : 'Send immediately'}
                                                {step.subject && <> · &ldquo;{step.subject}&rdquo;</>}
                                            </div>
                                        </li>
                                    );
                                })}
                            </ol>
                        )}
                    </div>

                    {/* Pre-launch validation modal - surfaces the validator's
                        errors / warnings / info plus capacity + bucket
                        counts so the operator can fix issues BEFORE the
                        /launch call goes out. Confirm button is disabled
                        when there are hard ERRORs in the report. */}
                    {showLaunchModal && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
                            style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
                            onClick={(e) => { if (e.target === e.currentTarget && acting !== 'launch') setShowLaunchModal(false); }}
                        >
                            <div
                                className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col"
                                style={{ border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)' }}
                            >
                                <div className="p-4 flex items-center justify-between" style={{ borderBottom: '1px solid #D1CBC5' }}>
                                    <div className="flex items-center gap-2">
                                        <div className="w-7 h-7 rounded-full bg-emerald-50 flex items-center justify-center">
                                            <Rocket size={13} className="text-emerald-700" />
                                        </div>
                                        <h2 className="text-sm font-bold text-gray-900">Pre-launch check</h2>
                                    </div>
                                    <button
                                        onClick={() => { if (acting !== 'launch') setShowLaunchModal(false); }}
                                        disabled={acting === 'launch'}
                                        className="text-gray-400 hover:text-gray-600 cursor-pointer bg-transparent border-none disabled:opacity-50"
                                        aria-label="Close"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="p-4 overflow-y-auto flex-1">
                                    {validating || !validationReport ? (
                                        <div className="flex items-center gap-2 text-xs text-gray-500 py-6 justify-center">
                                            <Loader2 size={12} className="animate-spin" /> Running validation…
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {/* Top-line verdict */}
                                            {validationReport.can_launch ? (
                                                <div className="flex items-start gap-2 text-xs bg-emerald-50 border border-emerald-200 rounded-md px-3 py-2">
                                                    <CheckCircle2 size={13} className="text-emerald-700 mt-0.5 shrink-0" />
                                                    <div className="text-emerald-900">
                                                        Ready to launch.
                                                        {validationReport.warnings.length > 0 && (
                                                            <> {validationReport.warnings.length} warning{validationReport.warnings.length === 1 ? '' : 's'} - review below.</>
                                                        )}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-start gap-2 text-xs bg-rose-50 border border-rose-200 rounded-md px-3 py-2">
                                                    <AlertTriangle size={13} className="text-rose-700 mt-0.5 shrink-0" />
                                                    <div className="text-rose-900">
                                                        Can&apos;t launch - fix {validationReport.errors.length} error{validationReport.errors.length === 1 ? '' : 's'} below.
                                                    </div>
                                                </div>
                                            )}

                                            {/* Buckets + capacity */}
                                            <div className="grid grid-cols-4 gap-2">
                                                <div className="p-2 rounded-md bg-gray-50 border border-gray-200">
                                                    <div className="text-[0.6rem] text-gray-500 uppercase">Total leads</div>
                                                    <div className="text-sm font-bold text-gray-900">{validationReport.buckets.total.toLocaleString()}</div>
                                                </div>
                                                <div className="p-2 rounded-md bg-gray-50 border border-gray-200">
                                                    <div className="text-[0.6rem] text-gray-500 uppercase">Connected</div>
                                                    <div className="text-sm font-bold text-gray-900">{validationReport.buckets.connected_to_any_sender.toLocaleString()}</div>
                                                </div>
                                                <div className="p-2 rounded-md bg-gray-50 border border-gray-200">
                                                    <div className="text-[0.6rem] text-gray-500 uppercase">Not connected</div>
                                                    <div className="text-sm font-bold text-gray-900">{validationReport.buckets.not_connected.toLocaleString()}</div>
                                                </div>
                                                <div className="p-2 rounded-md bg-gray-50 border border-gray-200">
                                                    <div className="text-[0.6rem] text-gray-500 uppercase">No profile</div>
                                                    <div className="text-sm font-bold text-gray-900">{validationReport.buckets.no_linkedin_profile.toLocaleString()}</div>
                                                </div>
                                            </div>

                                            <div className={`p-2.5 rounded-md text-[0.7rem] border ${validationReport.capacity.sufficient ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900' : 'bg-amber-50 border-amber-200 text-amber-900'}`}>
                                                <span className="font-semibold">Capacity (week 1):</span>{' '}
                                                {validationReport.capacity.invites_per_week_total.toLocaleString()} invites available · {validationReport.capacity.invites_needed.toLocaleString()} needed
                                                {!validationReport.capacity.sufficient && ' - not enough sender capacity to clear week 1 in one cycle.'}
                                            </div>

                                            {/* Issues */}
                                            {validationReport.errors.length > 0 && (
                                                <IssueList title="Errors" issues={validationReport.errors} tone="rose" />
                                            )}
                                            {validationReport.warnings.length > 0 && (
                                                <IssueList title="Warnings" issues={validationReport.warnings} tone="amber" />
                                            )}
                                            {validationReport.info.length > 0 && (
                                                <IssueList title="Info" issues={validationReport.info} tone="gray" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 flex justify-end gap-2" style={{ borderTop: '1px solid #E8E3DC', background: '#FAFAF8' }}>
                                    <button
                                        onClick={() => setShowLaunchModal(false)}
                                        disabled={acting === 'launch'}
                                        className="px-4 py-1.5 text-xs text-gray-700 rounded-lg cursor-pointer hover:bg-white disabled:opacity-50"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmLaunch}
                                        disabled={acting === 'launch' || validating || !validationReport?.can_launch}
                                        className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-600 text-white text-xs font-semibold rounded-lg cursor-pointer hover:bg-emerald-700 disabled:opacity-50"
                                    >
                                        {acting === 'launch' ? <Loader2 size={11} className="animate-spin" /> : <Rocket size={11} />}
                                        {acting === 'launch' ? 'Launching…' : 'Confirm launch'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Delete confirmation modal */}
                    {showDeleteConfirm && (
                        <div
                            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
                            style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
                            onClick={(e) => { if (e.target === e.currentTarget && acting !== 'delete') setShowDeleteConfirm(false); }}
                        >
                            <div
                                className="bg-white rounded-2xl w-full max-w-md"
                                style={{ border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)' }}
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
                                        <X size={14} />
                                    </button>
                                </div>
                                <div className="p-4">
                                    <p className="text-xs text-gray-700 mb-1">
                                        You&apos;re about to delete <span className="font-semibold text-gray-900">&ldquo;{data.campaign.name}&rdquo;</span>.
                                    </p>
                                    <p className="text-[11px] text-gray-500">
                                        This removes {data.counts.total_leads.toLocaleString()} campaign lead record{data.counts.total_leads === 1 ? '' : 's'}, {data.steps.length} sequence step{data.steps.length === 1 ? '' : 's'}, and the LinkedIn sender attachments. The senders themselves are kept. This action can&apos;t be undone.
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
                                        {acting === 'delete' ? 'Deleting…' : 'Delete campaign'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </>
            ) : null}
        </div>
    );
}

function IssueList({ title, issues, tone }: { title: string; issues: PreLaunchIssue[]; tone: 'rose' | 'amber' | 'gray' }) {
    const palette = {
        rose:  { bg: 'bg-rose-50/50',  border: 'border-rose-200',  title: 'text-rose-900',  body: 'text-rose-800',  code: 'bg-rose-100 text-rose-900' },
        amber: { bg: 'bg-amber-50/50', border: 'border-amber-200', title: 'text-amber-900', body: 'text-amber-800', code: 'bg-amber-100 text-amber-900' },
        gray:  { bg: 'bg-gray-50',     border: 'border-gray-200',  title: 'text-gray-900',  body: 'text-gray-700',  code: 'bg-gray-100 text-gray-900' },
    }[tone];
    return (
        <div className={`rounded-md border ${palette.bg} ${palette.border} p-2.5`}>
            <div className={`text-[0.65rem] uppercase tracking-wide font-bold mb-1.5 ${palette.title}`}>{title}</div>
            <ul className="space-y-1.5">
                {issues.map((it, i) => (
                    <li key={i} className={`text-[0.72rem] leading-snug ${palette.body}`}>
                        <code className={`px-1 py-0.5 rounded text-[0.6rem] font-semibold ${palette.code} mr-1.5`}>{it.code}</code>
                        {it.message}
                    </li>
                ))}
            </ul>
        </div>
    );
}

function StatCard({ label, value, accent }: { label: string; value: number | string; accent?: string }) {
    return (
        <div className="premium-card p-2.5">
            <div className="text-[10px] font-semibold text-gray-500 mb-1">{label}</div>
            <p className="text-lg font-bold tabular-nums" style={{ color: accent ?? '#111827' }}>
                {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
        </div>
    );
}

function StatusChip({ label, count, accent }: { label: string; count: number; accent?: string }) {
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] bg-gray-50">
            <span className="text-gray-600">{label}:</span>
            <span className="font-semibold tabular-nums" style={{ color: accent ?? '#111827' }}>{count.toLocaleString()}</span>
        </span>
    );
}

function Row({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
    return (
        <div className="flex items-center justify-between py-1 text-[11px] border-b border-gray-50 last:border-b-0">
            <span className="text-gray-500 flex items-center gap-1">{icon}{label}</span>
            <span className="text-gray-900 font-medium text-right truncate ml-3">{value}</span>
        </div>
    );
}
