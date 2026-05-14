'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useCampaignList } from '@/hooks/useCampaignList';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import DatePicker from '@/components/ui/DatePicker';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import {
    Rocket, FileText, MessageSquare, Zap, Flame, Ban, TrendingUp,
    Users, Mail, Globe, CheckCircle2, Scale, ScrollText,
    User, Contact, Briefcase, Radio, Inbox, Repeat, Droplet, Bot, Target,
    ClipboardList, Send, Shield, Clock, ChevronDown, CalendarRange, X as XIcon,
    type LucideIcon,
} from 'lucide-react';

// ---- Types ----

interface ReportTypeOption {
    key: string;
    label: string;
    icon: LucideIcon;
    description: string;
}

interface RecentReport {
    id: string;
    type: string;
    label: string;
    filterSummary: string;
    timestamp: string;
}

interface DomainOption {
    id: string;
    domain: string;
}

// ---- Constants ----

type ReportGroup = 'sequencer' | 'protect' | 'linkedin' | 'full';

interface GroupedReportTypeOption extends ReportTypeOption { group: ReportGroup }

const REPORT_TYPES: GroupedReportTypeOption[] = [
    // ── Super Sequencer ─────────────────────────────────────────────
    { group: 'sequencer', key: 'campaigns',         label: 'Campaigns Report',          icon: Rocket,         description: 'Campaign performance, mailbox counts, send volumes' },
    { group: 'sequencer', key: 'sequences',         label: 'Sequences Report',          icon: FileText,       description: 'Saved multi-step sequences with AI provenance' },
    { group: 'sequencer', key: 'reply_quality',     label: 'Reply Quality Report',      icon: MessageSquare,  description: 'Classified inbound replies (positive / hard_no / OOO / etc.)' },
    { group: 'sequencer', key: 'super_sender',      label: 'Super Sender Report',       icon: Zap,            description: 'Dedicated IPs — state, warmup day, 24h bounce/complaint stats' },
    { group: 'sequencer', key: 'warmup',            label: 'Warmup Pool Report',        icon: Flame,          description: 'Mailboxes in the cross-tenant warmup pool, ramp progress' },
    { group: 'sequencer', key: 'suppression',       label: 'Suppression Report',        icon: Ban,            description: 'Org-wide reply suppressions + per-campaign rules' },
    { group: 'sequencer', key: 'analytics',         label: 'Analytics Report',          icon: TrendingUp,     description: 'Daily campaign metrics over time' },

    // ── Super Protect ───────────────────────────────────────────────
    { group: 'protect',   key: 'leads',             label: 'Leads Report',              icon: Users,          description: 'All leads with scores, validation status, engagement metrics' },
    { group: 'protect',   key: 'mailboxes',         label: 'Mailboxes Report',          icon: Mail,           description: 'Mailbox health, recovery phases, bounce rates' },
    { group: 'protect',   key: 'domains',           label: 'Domains Report',            icon: Globe,          description: 'Domain health, DNS status, mailbox distribution' },
    { group: 'protect',   key: 'email_validation',  label: 'Email Validation Report',   icon: CheckCircle2,   description: 'Per-lead validation attempts (valid / risky / invalid / unknown) with source + score' },
    { group: 'protect',   key: 'load_balancing',    label: 'Load Balancing Report',     icon: Scale,          description: 'Mailbox load distribution across campaigns' },
    { group: 'protect',   key: 'audit_logs',        label: 'Audit Log Report',          icon: ScrollText,     description: 'Complete action history and system events' },

    // ── Super LinkedIn ──────────────────────────────────────────────
    { group: 'linkedin',  key: 'linkedin_accounts',   label: 'LinkedIn Accounts Report',   icon: User,         description: 'Connected accounts — type, status, capacity counters, in-campaign count' },
    { group: 'linkedin',  key: 'linkedin_contacts',   label: 'LinkedIn Contacts Report',   icon: Contact,      description: 'LinkedIn profiles cached locally — connection state, ICP match, source' },
    { group: 'linkedin',  key: 'linkedin_campaigns',  label: 'LinkedIn Campaigns Report',  icon: Briefcase,    description: 'Multi-channel campaigns — sent / accepted / replied per sender pool' },
    { group: 'linkedin',  key: 'linkedin_signals',    label: 'Engagement Signals Report',  icon: Radio,        description: 'Polled engagement events (reactions / comments / shares) with mode + action taken' },
    { group: 'linkedin',  key: 'linkedin_unibox',     label: 'LinkedIn Unibox Report',     icon: Inbox,        description: 'DM threads + auto-tag classifications (Interested / Not Interested / Generic)' },
    { group: 'linkedin',  key: 'linkedin_sequences',  label: 'Step Executions Report',     icon: Repeat,       description: 'Per-step execution audit — sent / skipped / branched / failed with reasons' },
    { group: 'linkedin',  key: 'linkedin_enrichment', label: 'Enrichment Waterfall Report', icon: Droplet,     description: 'Provider attempts per lead (HIT / EMPTY / RATE_LIMITED). BYOK — your vendor invoice is the source of truth for spend.' },
    { group: 'linkedin',  key: 'linkedin_agents',     label: 'Agent Runs Report',          icon: Bot,          description: 'LLM agent telemetry — supervisor / ICP / enrichment / classifier with cost + latency' },
    { group: 'linkedin',  key: 'linkedin_icp',        label: 'ICP Profiles Report',        icon: Target,       description: 'Workspace ICP filter sets and 30d match counts' },

    // ── Catch-all ───────────────────────────────────────────────────
    { group: 'full',      key: 'full', label: 'Full Report', icon: ClipboardList, description: 'Everything — all data across every section' },
];

const REPORT_GROUPS: { key: ReportGroup; label: string; icon: LucideIcon; description: string; accent: string }[] = [
    { key: 'sequencer', label: 'Super Sequencer', icon: Send,      description: 'Email outreach, sequences, reply intelligence, warmup, dedicated IPs', accent: '#2563EB' },
    { key: 'protect',   label: 'Super Protect',   icon: Shield,    description: 'Lead health, validation, mailbox + domain protection, audit log',     accent: '#7C3AED' },
    { key: 'linkedin',  label: 'Super LinkedIn',  icon: Briefcase, description: 'LinkedIn accounts, contacts, signal feed, agent runs, enrichment',   accent: '#0A66C2' },
];

const STATUS_OPTIONS: Record<string, string[]> = {
    leads: ['held', 'active', 'paused', 'bounced', 'invalid', 'unsubscribed', 'opted_out', 'completed'],
    campaigns: ['draft', 'active', 'paused', 'completed', 'archived', 'STARTED', 'INPROGRESS', 'COMPLETED', 'PAUSED', 'STOPPED'],
    mailboxes: ['healthy', 'warning', 'paused', 'quarantine', 'restricted_send', 'warm_recovery'],
    domains: ['healthy', 'warning', 'paused', 'quarantine'],
    analytics: [],
    audit_logs: [],
    load_balancing: [],
    sequences: [],
    super_sender: ['pending_payment', 'provisioning', 'warming', 'active', 'failed', 'canceled'],
    reply_quality: ['positive', 'qualified', 'objection', 'referral', 'soft_no', 'hard_no', 'angry', 'auto', 'unclassified'],
    suppression: [],
    warmup: ['warming', 'maintenance', 'paused', 'error'],
    email_validation: ['valid', 'risky', 'invalid', 'unknown', 'error'],
    linkedin_accounts: ['OK', 'CONNECTING', 'CREDENTIALS', 'ERROR', 'SYNC_SUCCESS', 'DELETED'],
    linkedin_contacts: [],
    linkedin_campaigns: ['draft', 'active', 'ongoing', 'paused', 'finished'],
    linkedin_signals: ['REACTION', 'COMMENT', 'SHARE', 'REPOST'],
    linkedin_unibox: ['Interested', 'Not Interested', 'Generic'],
    linkedin_sequences: ['SCHEDULED', 'SENT', 'FAILED', 'SKIPPED', 'BRANCHED'],
    linkedin_enrichment: ['HIT', 'EMPTY', 'ERROR', 'RATE_LIMITED', 'SKIPPED_HAS_FIELD'],
    linkedin_agents: ['supervisor', 'signal_monitoring', 'icp_matcher', 'enrichment', 'reply_classifier'],
    linkedin_icp: [],
    full: [],
};

const STORAGE_KEY = 'superkabe_recent_reports';
const PREVIEW_ROW_LIMIT = 50;

// Minimal RFC 4180-ish CSV parser — handles quoted fields and "" escapes,
// which is enough for the backend's csv-stringify output.
function parseCsvRows(text: string, maxRows: number): { header: string[]; rows: string[][]; totalDataRows: number } {
    const rawLines = text.split(/\r?\n/);
    const dataLines: string[] = [];
    for (const l of rawLines) {
        const t = l.trim();
        if (!t) continue;
        // Skip section dividers from the "full" report. We preview the first
        // section only — the divider marks the start of the next section.
        if (t.startsWith('---') && dataLines.length > 0) break;
        if (t.startsWith('---')) continue;
        dataLines.push(l);
    }
    if (dataLines.length === 0) return { header: [], rows: [], totalDataRows: 0 };

    const parseLine = (line: string): string[] => {
        const out: string[] = [];
        let cur = '';
        let inQ = false;
        for (let i = 0; i < line.length; i++) {
            const c = line[i];
            if (inQ) {
                if (c === '"' && line[i + 1] === '"') { cur += '"'; i++; }
                else if (c === '"') { inQ = false; }
                else cur += c;
            } else {
                if (c === ',') { out.push(cur); cur = ''; }
                else if (c === '"') { inQ = true; }
                else cur += c;
            }
        }
        out.push(cur);
        return out;
    };

    const header = parseLine(dataLines[0]);
    const rowSource = dataLines.slice(1);
    const rows = rowSource.slice(0, maxRows).map(parseLine);
    return { header, rows, totalDataRows: rowSource.length };
}

function getDefaultDates() {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - 30);
    return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
    };
}

function loadRecentReports(): RecentReport[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch {
        return [];
    }
}

function saveRecentReport(report: RecentReport) {
    const existing = loadRecentReports();
    // Keep up to 200 globally so per-type slices still have something to show
    // even for less-used report types, and the paginated history (10/page)
    // has meaningful depth. Modal shows all; the inline section filters
    // down to the selected type.
    const updated = [report, ...existing].slice(0, 200);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

// ---- Component ----

export default function ReportsPage() {
    const defaults = getDefaultDates();
    const { campaigns } = useCampaignList();

    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [startDate, setStartDate] = useState(defaults.startDate);
    const [endDate, setEndDate] = useState(defaults.endDate);
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
    const [selectedCampaignIds, setSelectedCampaignIds] = useState<string[]>([]);
    const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
    const [selectedEngagement, setSelectedEngagement] = useState<string>('');
    const [domains, setDomains] = useState<DomainOption[]>([]);
    const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
    // Custom date filter for the *history* (recent reports list) — both the
    // inline scoped section and the modal use this same range.
    const [historyStart, setHistoryStart] = useState<string>('');
    const [historyEnd, setHistoryEnd] = useState<string>('');
    const [historyDateOpen, setHistoryDateOpen] = useState(false);
    // 1-based current page for the inline scoped recent-reports list.
    const [recentPage, setRecentPage] = useState(1);
    // 1-based current page for the modal recent-reports list.
    const [modalRecentPage, setModalRecentPage] = useState(1);
    const RECENT_PAGE_SIZE = 10;
    // Which group accordion is open on the index view. Single-open at a
    // time so the page doesn't get long; defaults to the first group.
    const [expandedGroup, setExpandedGroup] = useState<ReportGroup | null>('sequencer');
    // Same single-open accordion behaviour for the left rail once a report
    // has been selected. Auto-tracks the active report's group so users
    // always see their current selection without an extra click.
    const [railExpandedGroup, setRailExpandedGroup] = useState<ReportGroup | null>('sequencer');
    const [generating, setGenerating] = useState(false);
    const [previewing, setPreviewing] = useState(false);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [preview, setPreview] = useState<{ header: string[]; rows: string[][]; totalDataRows: number } | null>(null);
    const [recentOpen, setRecentOpen] = useState(false);

    useEffect(() => {
        setRecentReports(loadRecentReports());
    }, []);

    useEffect(() => {
        apiClient<any>('/api/dashboard/domains?limit=200')
            .then(result => {
                const list = Array.isArray(result) ? result : result?.data || [];
                setDomains(list.map((d: any) => ({ id: d.id, domain: d.domain })));
            })
            .catch(() => {});
    }, []);

    useEffect(() => {
        setSelectedStatuses([]);
        setSelectedCampaignIds([]);
        setSelectedDomainIds([]);
        setSelectedEngagement('');
        // Reset history pagination when switching report types so we
        // don't land on an out-of-range page.
        setRecentPage(1);
        // Whenever the user picks a new report, make sure the left-rail
        // accordion is showing the group it belongs to.
        if (selectedType) {
            const grp = REPORT_TYPES.find(r => r.key === selectedType)?.group;
            if (grp) setRailExpandedGroup(grp);
        }
    }, [selectedType]);

    // Pull the history date filter back to page 1 whenever the range changes
    // so users don't see a confusing "no rows on page 7" state.
    useEffect(() => { setRecentPage(1); }, [historyStart, historyEnd]);
    useEffect(() => { setModalRecentPage(1); }, [historyStart, historyEnd, recentOpen]);

    // Filter recent reports by the user-chosen history date range. Inclusive
    // of both endpoints. Empty strings = no bound on that side.
    const filterByHistoryDate = useCallback((list: RecentReport[]) => {
        if (!historyStart && !historyEnd) return list;
        const startMs = historyStart ? new Date(historyStart + 'T00:00:00').getTime() : -Infinity;
        const endMs = historyEnd ? new Date(historyEnd + 'T23:59:59.999').getTime() : Infinity;
        return list.filter(r => {
            const t = new Date(r.timestamp).getTime();
            return t >= startMs && t <= endMs;
        });
    }, [historyStart, historyEnd]);

    const selectedReport = selectedType ? REPORT_TYPES.find(r => r.key === selectedType) : null;

    const showCampaignFilter = selectedType === 'leads' || selectedType === 'analytics' || selectedType === 'reply_quality' || selectedType === 'full';
    const showDomainFilter = selectedType === 'mailboxes' || selectedType === 'domains' || selectedType === 'full';
    const showStatusFilter = selectedType && (STATUS_OPTIONS[selectedType]?.length || 0) > 0;
    const showEngagementFilter = selectedType === 'leads';

    const ENGAGEMENT_OPTIONS: { value: string; label: string }[] = [
        { value: 'replied',         label: 'Replied' },
        { value: 'opened',          label: 'Opened' },
        { value: 'clicked',         label: 'Clicked' },
        { value: 'bounced',         label: 'Bounced' },
        { value: 'unsubscribed',    label: 'Unsubscribed' },
        { value: 'no_engagement',   label: 'Sent · no engagement' },
        { value: 'not_sent',        label: 'Not yet sent' },
    ];

    const buildParams = useCallback(() => {
        if (!selectedType) return null;
        const params = new URLSearchParams({ report_type: selectedType });
        if (startDate) params.set('start_date', startDate);
        if (endDate) params.set('end_date', endDate);
        if (selectedStatuses.length > 0) params.set('status', selectedStatuses.join(','));
        if (selectedCampaignIds.length > 0) params.set('campaign_id', selectedCampaignIds.join(','));
        if (selectedDomainIds.length > 0) params.set('domain_id', selectedDomainIds.join(','));
        if (selectedEngagement) params.set('engagement', selectedEngagement);
        params.set('format', 'csv');
        return params;
    }, [selectedType, startDate, endDate, selectedStatuses, selectedCampaignIds, selectedDomainIds, selectedEngagement]);

    const handlePreview = useCallback(async () => {
        const params = buildParams();
        if (!params) return;
        setPreviewing(true);
        setPreviewOpen(true);
        setPreview(null);
        try {
            const response = await fetch(`/api/dashboard/reports/generate?${params}`, {
                credentials: 'include',
            });
            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || `Request failed with status ${response.status}`);
            }
            const csv = await response.text();
            setPreview(parseCsvRows(csv, PREVIEW_ROW_LIMIT));
        } catch (err: any) {
            toast.error(err.message || 'Failed to load preview');
            setPreviewOpen(false);
        } finally {
            setPreviewing(false);
        }
    }, [buildParams]);

    const handleGenerate = useCallback(async () => {
        if (!selectedType) return;
        const params = buildParams();
        if (!params) return;
        setGenerating(true);

        try {
            const response = await fetch(`/api/dashboard/reports/generate?${params}`, {
                credentials: 'include',
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => null);
                throw new Error(errData?.error || `Request failed with status ${response.status}`);
            }

            const blob = await response.blob();
            const disposition = response.headers.get('content-disposition') || '';
            const filenameMatch = disposition.match(/filename="?([^"]+)"?/);
            const filename = filenameMatch?.[1] || `superkabe-${selectedType}-report.csv`;

            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);

            const typeLabel = REPORT_TYPES.find(t => t.key === selectedType)?.label || selectedType;
            const filterParts: string[] = [];
            if (startDate && endDate) filterParts.push(`${startDate} to ${endDate}`);
            if (selectedStatuses.length > 0) filterParts.push(`Status: ${selectedStatuses.join(', ')}`);
            if (selectedCampaignIds.length > 0) filterParts.push(`${selectedCampaignIds.length} campaign(s)`);
            if (selectedDomainIds.length > 0) filterParts.push(`${selectedDomainIds.length} domain(s)`);
            if (selectedEngagement) {
                const lab = ENGAGEMENT_OPTIONS.find(o => o.value === selectedEngagement)?.label ?? selectedEngagement;
                filterParts.push(`Engagement: ${lab}`);
            }

            const newReport: RecentReport = {
                id: Date.now().toString(),
                type: selectedType,
                label: typeLabel,
                filterSummary: filterParts.join(' | ') || 'No filters',
                timestamp: new Date().toISOString(),
            };
            saveRecentReport(newReport);
            setRecentReports(loadRecentReports());
        } catch (err: any) {
            toast.error(err.message || 'Failed to generate report');
        } finally {
            setGenerating(false);
        }
    }, [selectedType, startDate, endDate, selectedStatuses, selectedCampaignIds, selectedDomainIds, selectedEngagement]);

    return (
        <div className="p-4 flex flex-col gap-3" style={{ minHeight: 'calc(100vh - 5rem)' }}>
            <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                    <h1 className="text-xl font-bold text-gray-900">Reports</h1>
                    <p className="text-xs text-gray-500 mt-1">
                        {selectedReport
                            ? 'Pick a different report on the left, or configure filters on the right'
                            : 'Generate and download CSV reports for your data'}
                    </p>
                </div>
                <div className="flex items-center gap-2 relative">
                    {/* History date filter — applies to both the inline scoped
                        list and the modal. Empty range = no filter. */}
                    <button
                        onClick={() => setHistoryDateOpen(v => !v)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-gray-900 hover:bg-[#FAFAF8] cursor-pointer"
                        style={{ border: '1px solid #D1CBC5' }}
                        title="Filter history by date"
                    >
                        <CalendarRange className="w-3.5 h-3.5" />
                        {historyStart || historyEnd
                            ? `${historyStart || '…'} → ${historyEnd || '…'}`
                            : 'Custom date'}
                        {(historyStart || historyEnd) && (
                            <span
                                role="button"
                                aria-label="Clear date filter"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setHistoryStart('');
                                    setHistoryEnd('');
                                }}
                                className="ml-1 inline-flex items-center justify-center w-4 h-4 rounded hover:bg-gray-200"
                            >
                                <XIcon className="w-3 h-3" />
                            </span>
                        )}
                    </button>
                    {historyDateOpen && (
                        <div
                            className="absolute right-[120px] top-full mt-1 z-50 bg-white rounded-lg p-3 flex flex-col gap-2 w-[320px]"
                            style={{ border: '1px solid #D1CBC5', boxShadow: '0 6px 18px rgba(0,0,0,0.08)' }}
                        >
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">From</label>
                                    <DatePicker value={historyStart} onChange={setHistoryStart} />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-semibold text-gray-600 mb-1">To</label>
                                    <DatePicker value={historyEnd} onChange={setHistoryEnd} />
                                </div>
                            </div>
                            <div className="flex justify-between items-center pt-1">
                                <button
                                    onClick={() => { setHistoryStart(''); setHistoryEnd(''); }}
                                    className="text-[11px] font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                                >
                                    Clear
                                </button>
                                <button
                                    onClick={() => setHistoryDateOpen(false)}
                                    className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-[11px] font-semibold hover:bg-gray-800 cursor-pointer"
                                >
                                    Done
                                </button>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={() => setRecentOpen(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-gray-900 hover:bg-[#FAFAF8] cursor-pointer"
                        style={{ border: '1px solid #D1CBC5' }}
                    >
                        <Clock className="w-3.5 h-3.5" />
                        Recent reports
                        {recentReports.length > 0 && (
                            <span className="ml-1 px-1.5 py-0.5 rounded-md bg-gray-900 text-white text-[10px]">
                                {recentReports.length}
                            </span>
                        )}
                    </button>
                </div>
            </div>

            {/* Index view — 3 expandable group cards (Super Sequencer /
                Super Protect / Super LinkedIn). Clicking a group opens an
                inner grid of that group's reports. "Full Report" sits as a
                separate full-width tile below since it spans all groups.
                As soon as a report is picked, this swaps for the split
                layout (left rail + right panel). */}
            {!selectedReport ? (
                <div className="flex flex-col gap-3">
                    {REPORT_GROUPS.map(g => {
                        const isOpen = expandedGroup === g.key;
                        const groupReports = REPORT_TYPES.filter(r => r.group === g.key);
                        const GIcon = g.icon;
                        return (
                            <div key={g.key} className="premium-card !p-0 overflow-hidden">
                                <button
                                    type="button"
                                    onClick={() => setExpandedGroup(isOpen ? null : g.key)}
                                    aria-expanded={isOpen}
                                    className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-[#FAFAF8] transition-colors"
                                >
                                    <div
                                        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                        style={{ background: `${g.accent}15`, color: g.accent }}
                                    >
                                        <GIcon className="w-4 h-4" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold text-gray-900">{g.label}</div>
                                        <div className="text-[11px] text-gray-500 mt-0.5">{g.description}</div>
                                    </div>
                                    <span className="text-[10px] font-semibold text-gray-500 mr-2">
                                        {groupReports.length} report{groupReports.length === 1 ? '' : 's'}
                                    </span>
                                    <ChevronDown
                                        className="shrink-0 text-gray-500 transition-transform"
                                        width={14}
                                        height={14}
                                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                    />
                                </button>
                                {isOpen && (
                                    <div className="px-3 pb-3 pt-1" style={{ borderTop: '1px solid #E8E3DC' }}>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 mt-2">
                                            {groupReports.map(rt => {
                                                const RIcon = rt.icon;
                                                return (
                                                    <button
                                                        key={rt.key}
                                                        onClick={() => setSelectedType(rt.key)}
                                                        className="text-left p-3 rounded-lg bg-white hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                                                        style={{ border: '1px solid #D1CBC5' }}
                                                    >
                                                        <div
                                                            className="w-7 h-7 rounded-md flex items-center justify-center mb-2"
                                                            style={{ background: `${g.accent}15`, color: g.accent }}
                                                        >
                                                            <RIcon className="w-3.5 h-3.5" />
                                                        </div>
                                                        <div className="font-semibold text-gray-900 text-xs">{rt.label}</div>
                                                        <div className="text-[11px] text-gray-500 mt-1 leading-relaxed">{rt.description}</div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {/* Full report — separate tile since it spans every group. */}
                    {REPORT_TYPES.filter(r => r.group === 'full').map(rt => {
                        const RIcon = rt.icon;
                        return (
                            <button
                                key={rt.key}
                                onClick={() => setSelectedType(rt.key)}
                                className="premium-card text-left flex items-center gap-3 hover:bg-[#FAFAF8] transition-colors cursor-pointer"
                            >
                                <div
                                    className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                    style={{ background: '#11182715', color: '#111827' }}
                                >
                                    <RIcon className="w-4 h-4" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-gray-900">{rt.label}</div>
                                    <div className="text-[11px] text-gray-500 mt-0.5">{rt.description}</div>
                                </div>
                            </button>
                        );
                    })}
                </div>
            ) : (
            <div className="flex flex-col md:flex-row gap-3 flex-1 min-h-0">
                {/* ── Left rail: report type picker (collapsible groups) ── */}
                <div className="md:w-[280px] md:shrink-0">
                    <div className="premium-card !p-2 flex flex-col gap-1 h-full">
                        <div className="px-2 py-1.5 text-[11px] font-semibold text-gray-500">
                            Report type
                        </div>
                        <div className="flex flex-col gap-1.5">
                            {REPORT_GROUPS.map(g => {
                                const isOpen = railExpandedGroup === g.key;
                                const groupReports = REPORT_TYPES.filter(r => r.group === g.key);
                                const GIcon = g.icon;
                                return (
                                    <div
                                        key={g.key}
                                        className="rounded-lg overflow-hidden"
                                        style={{ border: '1px solid #E8E3DC' }}
                                    >
                                        <button
                                            type="button"
                                            onClick={() => setRailExpandedGroup(isOpen ? null : g.key)}
                                            aria-expanded={isOpen}
                                            className="w-full flex items-center gap-2 px-2 py-1.5 text-left cursor-pointer hover:bg-[#FAFAF8] transition-colors"
                                        >
                                            <div
                                                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0"
                                                style={{ background: `${g.accent}15`, color: g.accent }}
                                            >
                                                <GIcon className="w-3 h-3" />
                                            </div>
                                            <span className="flex-1 text-[11px] font-bold text-gray-900 truncate">
                                                {g.label}
                                            </span>
                                            <span className="text-[10px] font-semibold text-gray-500">
                                                {groupReports.length}
                                            </span>
                                            <ChevronDown
                                                className="shrink-0 text-gray-500 transition-transform"
                                                width={12}
                                                height={12}
                                                style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                                            />
                                        </button>
                                        {isOpen && (
                                            <div className="flex flex-col gap-1 p-1.5" style={{ borderTop: '1px solid #E8E3DC' }}>
                                                {groupReports.map(rt => {
                                                    const isActive = selectedType === rt.key;
                                                    const RIcon = rt.icon;
                                                    return (
                                                        <button
                                                            key={rt.key}
                                                            onClick={() => setSelectedType(rt.key)}
                                                            title={rt.description}
                                                            className={`
                                                                text-left rounded-md px-2 py-1.5 transition-colors cursor-pointer
                                                                flex items-center gap-2 w-full
                                                                ${isActive
                                                                    ? 'bg-gray-900 text-white'
                                                                    : 'bg-white text-gray-700 hover:bg-[#FAFAF8]'}
                                                            `}
                                                        >
                                                            <RIcon className="w-3.5 h-3.5 shrink-0" />
                                                            <span className="text-[11px] font-semibold leading-tight truncate min-w-0">
                                                                {rt.label}
                                                            </span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Full report — flat tile under the groups since
                                it spans every category. */}
                            {REPORT_TYPES.filter(r => r.group === 'full').map(rt => {
                                const isActive = selectedType === rt.key;
                                const RIcon = rt.icon;
                                return (
                                    <button
                                        key={rt.key}
                                        onClick={() => setSelectedType(rt.key)}
                                        title={rt.description}
                                        className={`
                                            text-left rounded-lg px-2 py-2 transition-colors cursor-pointer
                                            flex items-center gap-2 w-full
                                            ${isActive
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-white text-gray-700 hover:bg-[#FAFAF8]'}
                                        `}
                                        style={!isActive ? { border: '1px solid #E8E3DC' } : undefined}
                                    >
                                        <RIcon className="w-3.5 h-3.5 shrink-0" />
                                        <span className="text-[11px] font-bold leading-tight truncate min-w-0">
                                            {rt.label}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* ── Right panel: filters + recent reports ─────────── */}
                <div className="flex-1 min-w-0 flex flex-col gap-3">
                            <div className="premium-card flex-1">
                                <div className="flex items-start gap-3 mb-4">
                                    {(() => {
                                        const RIcon = selectedReport.icon;
                                        const accent = REPORT_GROUPS.find(g => g.key === selectedReport.group)?.accent ?? '#111827';
                                        return (
                                            <div
                                                className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ background: `${accent}15`, color: accent }}
                                            >
                                                <RIcon className="w-4 h-4" />
                                            </div>
                                        );
                                    })()}
                                    <div className="min-w-0">
                                        <h2 className="text-sm font-semibold text-gray-900">{selectedReport.label}</h2>
                                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{selectedReport.description}</p>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-5">
                                    {/* Date Range */}
                                    <div className="flex items-end gap-4 flex-wrap">
                                        <div className="flex-1 min-w-[180px]">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                Start Date
                                            </label>
                                            <DatePicker value={startDate} onChange={setStartDate} />
                                        </div>
                                        <div className="flex-1 min-w-[180px]">
                                            <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                End Date
                                            </label>
                                            <DatePicker value={endDate} onChange={setEndDate} />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {showStatusFilter && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Status filter
                                                </label>
                                                <MultiSelectDropdown
                                                    placeholder="All statuses"
                                                    selected={selectedStatuses}
                                                    onChange={setSelectedStatuses}
                                                    searchable="auto"
                                                    searchPlaceholder="Search statuses…"
                                                    options={(STATUS_OPTIONS[selectedType!] || []).map(s => ({
                                                        value: s,
                                                        label: s.replace(/_/g, ' '),
                                                    }))}
                                                />
                                            </div>
                                        )}

                                        {showCampaignFilter && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Campaign filter
                                                </label>
                                                <MultiSelectDropdown
                                                    placeholder={campaigns.length === 0 ? 'No campaigns' : 'All campaigns'}
                                                    selected={selectedCampaignIds}
                                                    onChange={setSelectedCampaignIds}
                                                    searchable
                                                    searchPlaceholder="Search campaigns…"
                                                    options={campaigns.map(c => ({ value: c.id, label: c.name }))}
                                                />
                                            </div>
                                        )}

                                        {showDomainFilter && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Domain filter
                                                </label>
                                                <MultiSelectDropdown
                                                    placeholder={domains.length === 0 ? 'No domains' : 'All domains'}
                                                    selected={selectedDomainIds}
                                                    onChange={setSelectedDomainIds}
                                                    searchable
                                                    searchPlaceholder="Search domains…"
                                                    options={domains.map(d => ({ value: d.id, label: d.domain }))}
                                                />
                                            </div>
                                        )}

                                        {showEngagementFilter && (
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                                                    Engagement
                                                </label>
                                                <MultiSelectDropdown
                                                    placeholder="All engagement states"
                                                    selected={selectedEngagement ? [selectedEngagement] : []}
                                                    onChange={(arr) => {
                                                        const next = arr.find(v => v !== selectedEngagement) ?? arr[arr.length - 1] ?? '';
                                                        setSelectedEngagement(next || '');
                                                    }}
                                                    options={ENGAGEMENT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
                                                />
                                            </div>
                                        )}
                                    </div>

                                    <div className="pt-1 flex flex-wrap gap-2">
                                        <button
                                            onClick={handlePreview}
                                            disabled={previewing || generating}
                                            className="px-4 py-2 bg-white text-gray-900 text-xs font-semibold rounded-lg hover:bg-[#FAFAF8] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        >
                                            {previewing ? 'Loading preview…' : 'Preview'}
                                        </button>
                                        <button
                                            onClick={handleGenerate}
                                            disabled={generating || previewing}
                                            className="px-4 py-2 bg-gray-900 text-white text-xs font-semibold rounded-lg hover:bg-gray-800 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {generating ? (
                                                <span className="flex items-center gap-2">
                                                    <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Generating…
                                                </span>
                                            ) : (
                                                'Generate & Download CSV'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>

                    {(() => {
                        // Inline section scoped to the currently-selected report
                        // type. The global "Recent reports" button in the header
                        // still shows everything across all types.
                        const allScoped = filterByHistoryDate(recentReports.filter(r => r.type === selectedType));
                        if (allScoped.length === 0 && (historyStart || historyEnd)) {
                            return (
                                <div className="premium-card text-[11px] text-gray-500">
                                    No {selectedReport?.label.toLowerCase()} history in the chosen date range.
                                </div>
                            );
                        }
                        if (allScoped.length === 0) return null;
                        const totalPages = Math.max(1, Math.ceil(allScoped.length / RECENT_PAGE_SIZE));
                        const safePage = Math.min(recentPage, totalPages);
                        const startIdx = (safePage - 1) * RECENT_PAGE_SIZE;
                        const scoped = allScoped.slice(startIdx, startIdx + RECENT_PAGE_SIZE);
                        return (
                        <div className="premium-card flex flex-col min-h-0">
                            <div className="flex items-center justify-between mb-3">
                                <h2 className="text-sm font-semibold text-gray-900">
                                    Recent {selectedReport?.label}
                                    <span className="ml-2 text-[11px] font-normal text-gray-500">
                                        {allScoped.length} total
                                    </span>
                                </h2>
                            </div>
                            <div className="flex flex-col gap-1.5 overflow-y-auto" style={{ maxHeight: '60vh' }}>
                                {scoped.map(r => {
                                    const rt = REPORT_TYPES.find(t => t.key === r.type);
                                    const RIcon = rt?.icon ?? FileText;
                                    const accent = rt ? (REPORT_GROUPS.find(g => g.key === rt.group)?.accent ?? '#111827') : '#111827';
                                    const formattedDate = new Date(r.timestamp).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    });
                                    return (
                                        <div
                                            key={r.id}
                                            className="flex items-center gap-3 p-2.5 rounded-lg bg-[#FAFAF8]"
                                            style={{ border: '1px solid #E8E3DC' }}
                                        >
                                            <div
                                                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                                                style={{ background: `${accent}15`, color: accent }}
                                            >
                                                <RIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold text-gray-900">{r.label}</div>
                                                <div className="text-[11px] text-gray-500 truncate">{r.filterSummary}</div>
                                            </div>
                                            <div className="text-[11px] text-gray-400 whitespace-nowrap">{formattedDate}</div>
                                        </div>
                                    );
                                })}
                            </div>
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between gap-2 pt-3 mt-2" style={{ borderTop: '1px solid #E8E3DC' }}>
                                    <span className="text-[11px] text-gray-500">
                                        Page {safePage} of {totalPages}
                                    </span>
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={() => setRecentPage(p => Math.max(1, p - 1))}
                                            disabled={safePage === 1}
                                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        >
                                            Prev
                                        </button>
                                        <button
                                            onClick={() => setRecentPage(p => Math.min(totalPages, p + 1))}
                                            disabled={safePage === totalPages}
                                            className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                            style={{ border: '1px solid #D1CBC5' }}
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                        );
                    })()}
                </div>
            </div>
            )}

            {/* Preview modal — portalled to body so it's never clipped by the
                dashboard's overflow:hidden shells. Renders the first N rows of
                exactly what the CSV download would contain, parsed client-side
                so there's no backend change. */}
            {previewOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
                    onClick={() => setPreviewOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl flex flex-col overflow-hidden"
                        style={{ width: '98vw', height: '92vh', border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div
                            className="flex items-start justify-between gap-3 px-4 py-3"
                            style={{ borderBottom: '1px solid #D1CBC5', background: '#FAF7F1' }}
                        >
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                    {selectedReport && (() => {
                                        const RIcon = selectedReport.icon;
                                        return <RIcon className="w-4 h-4 text-gray-700" />;
                                    })()}
                                    {selectedReport?.label} — Preview
                                </h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {previewing
                                        ? 'Fetching report…'
                                        : preview
                                            ? `Showing first ${preview.rows.length} of ${preview.totalDataRows} row${preview.totalDataRows === 1 ? '' : 's'}`
                                            : ''}
                                    {selectedType === 'full' && preview && (
                                        <span className="ml-1 text-amber-700">· Full report has multiple sections — only the first is shown</span>
                                    )}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    onClick={() => { setPreviewOpen(false); handleGenerate(); }}
                                    disabled={generating || previewing || !preview}
                                    className="px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Download CSV
                                </button>
                                <button
                                    onClick={() => setPreviewOpen(false)}
                                    className="px-3 py-1.5 rounded-lg bg-white text-gray-900 text-xs font-semibold hover:bg-[#FAFAF8] cursor-pointer"
                                    style={{ border: '1px solid #D1CBC5' }}
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 min-h-0 overflow-auto">
                            {previewing && (
                                <div className="p-10 text-center text-xs text-gray-500">Loading preview…</div>
                            )}
                            {!previewing && preview && preview.header.length === 0 && (
                                <div className="p-10 text-center text-xs text-gray-500">
                                    Report is empty for the current filters.
                                </div>
                            )}
                            {!previewing && preview && preview.header.length > 0 && (
                                <table className="text-[11px] border-collapse" style={{ minWidth: '100%' }}>
                                    <thead className="sticky top-0 z-10" style={{ background: '#FAF7F1' }}>
                                        <tr>
                                            {preview.header.map((h, i) => (
                                                <th
                                                    key={i}
                                                    className="text-left font-semibold text-gray-700 px-2.5 py-2 whitespace-nowrap"
                                                    style={{ borderBottom: '1px solid #D1CBC5' }}
                                                >
                                                    {h}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {preview.rows.length === 0 ? (
                                            <tr>
                                                <td colSpan={preview.header.length} className="px-3 py-8 text-center text-xs text-gray-500">
                                                    No data rows for the current filters.
                                                </td>
                                            </tr>
                                        ) : (
                                            preview.rows.map((row, ri) => (
                                                <tr key={ri} style={{ background: ri % 2 === 0 ? '#FFFFFF' : '#FAFAF8' }}>
                                                    {preview.header.map((_, ci) => (
                                                        <td
                                                            key={ci}
                                                            className="px-2.5 py-1.5 text-gray-800 align-top whitespace-nowrap"
                                                            style={{ borderBottom: '1px solid #F0EBE3', maxWidth: '240px', overflow: 'hidden', textOverflow: 'ellipsis' }}
                                                            title={row[ci] ?? ''}
                                                        >
                                                            {row[ci] ?? ''}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            )}
                        </div>
                    </div>
                </div>,
                document.body,
            )}

            {/* Recent reports modal — accessible from the page header so users
                can pull up history without first picking a report type. */}
            {recentOpen && typeof document !== 'undefined' && createPortal(
                <div
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    style={{ background: 'rgba(15, 15, 15, 0.55)', backdropFilter: 'blur(2px)' }}
                    onClick={() => setRecentOpen(false)}
                >
                    <div
                        className="bg-white rounded-2xl flex flex-col w-full max-w-xl overflow-hidden"
                        style={{ maxHeight: '80vh', border: '1px solid #D1CBC5', boxShadow: '0 12px 40px rgba(0,0,0,0.22), 0 4px 12px rgba(0,0,0,0.08)' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <div
                            className="flex items-start justify-between gap-3 px-4 py-3"
                            style={{ borderBottom: '1px solid #D1CBC5', background: '#FAF7F1' }}
                        >
                            <div className="min-w-0">
                                <h3 className="text-sm font-semibold text-gray-900">Recent reports</h3>
                                <p className="text-[11px] text-gray-500 mt-0.5">
                                    {recentReports.length === 0
                                        ? 'No reports generated yet'
                                        : `Last ${recentReports.length} report${recentReports.length === 1 ? '' : 's'} you generated on this device`}
                                </p>
                            </div>
                            <button
                                onClick={() => setRecentOpen(false)}
                                className="px-3 py-1.5 rounded-lg bg-white text-gray-900 text-xs font-semibold hover:bg-[#FAFAF8] cursor-pointer shrink-0"
                                style={{ border: '1px solid #D1CBC5' }}
                            >
                                Close
                            </button>
                        </div>

                        {/* Custom date filter row — same state as the header
                            button so the inline list and the modal stay in
                            sync. Empty = no filter. */}
                        <div className="px-4 py-3 flex items-end gap-2 flex-wrap" style={{ borderBottom: '1px solid #E8E3DC', background: '#FFFFFF' }}>
                            <div className="flex-1 min-w-[140px]">
                                <label className="block text-[10px] font-semibold text-gray-600 mb-1">From</label>
                                <DatePicker value={historyStart} onChange={setHistoryStart} />
                            </div>
                            <div className="flex-1 min-w-[140px]">
                                <label className="block text-[10px] font-semibold text-gray-600 mb-1">To</label>
                                <DatePicker value={historyEnd} onChange={setHistoryEnd} />
                            </div>
                            <button
                                onClick={() => { setHistoryStart(''); setHistoryEnd(''); }}
                                disabled={!historyStart && !historyEnd}
                                className="px-3 py-2 rounded-lg text-xs font-semibold bg-white text-gray-900 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                style={{ border: '1px solid #D1CBC5' }}
                            >
                                Clear
                            </button>
                        </div>

                        {(() => {
                            const filtered = filterByHistoryDate(recentReports);
                            const totalPages = Math.max(1, Math.ceil(filtered.length / RECENT_PAGE_SIZE));
                            const safePage = Math.min(modalRecentPage, totalPages);
                            const startIdx = (safePage - 1) * RECENT_PAGE_SIZE;
                            const pageRows = filtered.slice(startIdx, startIdx + RECENT_PAGE_SIZE);
                            return (
                        <>
                        <div className="flex-1 min-h-0 overflow-auto p-3 flex flex-col gap-1.5">
                            {recentReports.length === 0 ? (
                                <div className="p-10 text-center text-xs text-gray-500">
                                    Generate a report to see it listed here.
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="p-10 text-center text-xs text-gray-500">
                                    No reports in the chosen date range.
                                </div>
                            ) : (
                                pageRows.map(r => {
                                    const rt = REPORT_TYPES.find(t => t.key === r.type);
                                    const RIcon = rt?.icon ?? FileText;
                                    const accent = rt ? (REPORT_GROUPS.find(g => g.key === rt.group)?.accent ?? '#111827') : '#111827';
                                    const formattedDate = new Date(r.timestamp).toLocaleString('en-US', {
                                        month: 'short', day: 'numeric', year: 'numeric',
                                        hour: '2-digit', minute: '2-digit',
                                    });
                                    return (
                                        <button
                                            key={r.id}
                                            onClick={() => {
                                                setSelectedType(r.type);
                                                setRecentOpen(false);
                                            }}
                                            className="text-left flex items-center gap-3 p-2.5 rounded-lg bg-[#FAFAF8] hover:bg-[#F5F1EA] cursor-pointer"
                                            style={{ border: '1px solid #E8E3DC' }}
                                            title="Open this report type"
                                        >
                                            <div
                                                className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                                                style={{ background: `${accent}15`, color: accent }}
                                            >
                                                <RIcon className="w-3.5 h-3.5" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-semibold text-gray-900">{r.label}</div>
                                                <div className="text-[11px] text-gray-500 truncate">{r.filterSummary}</div>
                                            </div>
                                            <div className="text-[11px] text-gray-400 whitespace-nowrap">{formattedDate}</div>
                                        </button>
                                    );
                                })
                            )}
                        </div>
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between gap-2 px-4 py-2.5" style={{ borderTop: '1px solid #E8E3DC', background: '#FAF7F1' }}>
                                <span className="text-[11px] text-gray-500">
                                    Page {safePage} of {totalPages} · {filtered.length} report{filtered.length === 1 ? '' : 's'}
                                </span>
                                <div className="flex items-center gap-1">
                                    <button
                                        onClick={() => setModalRecentPage(p => Math.max(1, p - 1))}
                                        disabled={safePage === 1}
                                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    >
                                        Prev
                                    </button>
                                    <button
                                        onClick={() => setModalRecentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={safePage === totalPages}
                                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-white text-gray-700 hover:bg-[#FAFAF8] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                        </>
                            );
                        })()}
                    </div>
                </div>,
                document.body,
            )}
        </div>
    );
}
