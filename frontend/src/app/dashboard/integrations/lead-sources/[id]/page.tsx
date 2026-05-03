'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import { ChevronLeft, AlertTriangle, CheckCircle2, Loader2, RotateCw } from 'lucide-react';

type Provider = 'apollo' | 'zoominfo';

interface RecentJob {
    id: string;
    state: string;
    source_kind: string | null;
    source_url: string | null;
    total_estimated: number;
    total_processed: number;
    total_created: number;
    total_updated: number;
    total_skipped: number;
    total_failed: number;
    credits_consumed: number;
    started_at: string | null;
    finished_at: string | null;
    error_message: string | null;
    created_at: string;
}

interface ConnectionDetail {
    id: string;
    provider: Provider;
    status: string;
    external_account_name: string | null;
    external_account_id: string | null;
    connected_at: string;
    last_validated_at: string | null;
    last_used_at: string | null;
    last_error: string | null;
    disconnected_at: string | null;
    recent_jobs: RecentJob[];
}

interface Campaign {
    id: string;
    name: string;
    status?: string;
}

interface ParsePreview {
    kind: 'people_search' | 'saved_list' | 'saved_search';
    summary: string[];
    estimated_count: number | null;
    parsed: unknown;
}

const STATE_STYLE: Record<string, { bg: string; fg: string }> = {
    pending:    { bg: '#F3F4F6', fg: '#6B7280' },
    running:    { bg: '#DBEAFE', fg: '#1E40AF' },
    completed:  { bg: '#D1FAE5', fg: '#065F46' },
    failed:     { bg: '#FEE2E2', fg: '#991B1B' },
    cancelled:  { bg: '#F3F4F6', fg: '#6B7280' },
};

function formatDate(iso: string | null): string {
    if (!iso) return '—';
    return new Date(iso).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
    });
}

export default function LeadSourceDetailPage() {
    const params = useParams<{ id: string }>();
    const id = params?.id as string;

    const [conn, setConn] = useState<ConnectionDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);

    // Wizard state
    const [url, setUrl] = useState('');
    const [parsing, setParsing] = useState(false);
    const [preview, setPreview] = useState<ParsePreview | null>(null);
    const [parseErr, setParseErr] = useState<string | null>(null);
    const [reveal, setReveal] = useState(true);
    const [cap, setCap] = useState<string>('');
    const [targetCampaignId, setTargetCampaignId] = useState<string>('');
    const [submitting, setSubmitting] = useState(false);
    const [submitErr, setSubmitErr] = useState<string | null>(null);

    const refresh = async () => {
        try {
            const data = await apiClient<ConnectionDetail>(`/api/integrations/lead-sources/connections/${id}`);
            setConn(data);
            setError(null);
        } catch (err: any) {
            setError(err?.message || 'Failed to load connection');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!id) return;
        refresh();
        apiClient<{ data: Campaign[] }>('/api/dashboard/campaigns?limit=100&sortBy=name_asc')
            .then(res => setCampaigns(Array.isArray(res?.data) ? res.data : []))
            .catch(() => setCampaigns([]));
    }, [id]);

    // Poll active jobs every 5s
    const hasActiveJob = useMemo(
        () => (conn?.recent_jobs ?? []).some(j => j.state === 'pending' || j.state === 'running'),
        [conn],
    );
    useEffect(() => {
        if (!hasActiveJob) return;
        const t = setInterval(refresh, 5000);
        return () => clearInterval(t);
    }, [hasActiveJob]); // eslint-disable-line react-hooks/exhaustive-deps

    const onParse = async () => {
        const trimmed = url.trim();
        if (!trimmed) {
            setParseErr('Paste an Apollo URL first');
            return;
        }
        setParsing(true);
        setParseErr(null);
        setPreview(null);
        try {
            const res = await apiClient<ParsePreview>('/api/integrations/apollo/parse-url', {
                method: 'POST',
                body: JSON.stringify({ url: trimmed }),
                headers: { 'Content-Type': 'application/json' },
            });
            setPreview(res);
        } catch (err: any) {
            setParseErr(err?.message || 'Failed to parse URL');
        } finally {
            setParsing(false);
        }
    };

    const onStartImport = async () => {
        if (!preview) return;
        setSubmitting(true);
        setSubmitErr(null);
        try {
            const capNum = cap.trim() === '' ? undefined : Number(cap);
            await apiClient('/api/integrations/apollo/import', {
                method: 'POST',
                body: JSON.stringify({
                    url: url.trim(),
                    target_campaign_id: targetCampaignId || undefined,
                    reveal_personal_emails: reveal,
                    cap: capNum,
                }),
                headers: { 'Content-Type': 'application/json' },
            });
            // Reset wizard, refresh job list
            setUrl('');
            setPreview(null);
            setCap('');
            await refresh();
        } catch (err: any) {
            setSubmitErr(err?.message || 'Failed to start import');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return <div className="p-8"><LoadingSkeleton type="card" rows={3} /></div>;
    }
    if (error || !conn) {
        return (
            <div className="p-8">
                <Link href="/dashboard/integrations/lead-sources" className="inline-flex items-center gap-1 text-xs text-slate-500 mb-4">
                    <ChevronLeft size={14} /> Back
                </Link>
                <div className="bg-red-50 border border-red-100 text-red-700 p-4 rounded-xl text-sm">{error || 'Not found'}</div>
            </div>
        );
    }

    const providerName = conn.provider === 'apollo' ? 'Apollo.io' : 'ZoomInfo';
    const isApollo = conn.provider === 'apollo';

    return (
        <div className="p-8 max-w-4xl">
            {/* Header */}
            <div className="mb-6">
                <Link
                    href="/dashboard/integrations/lead-sources"
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 mb-3"
                >
                    <ChevronLeft size={14} />
                    Back to Contact Databases
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 mb-0.5">{providerName}</h1>
                        <p className="text-xs text-slate-500">
                            {conn.external_account_name ?? '—'} · connected {formatDate(conn.connected_at)}
                        </p>
                    </div>
                    {conn.last_error && (
                        <div className="text-[11px] bg-red-50 border border-red-100 rounded-lg px-3 py-2 text-red-700 flex items-start gap-1.5 max-w-sm">
                            <AlertTriangle size={12} className="mt-0.5 shrink-0" />
                            <span>{conn.last_error}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Import wizard */}
            {isApollo && (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 mb-6">
                    <div className="text-sm font-bold text-gray-900 mb-1">Import from Apollo URL</div>
                    <p className="text-xs text-slate-500 mb-4">
                        Paste a URL from <code className="text-[11px] bg-slate-100 px-1 py-0.5 rounded">app.apollo.io</code> — a people-search,
                        saved-search, or saved-list page. Superkabe replays the search via the official Apollo API.
                    </p>

                    <div className="flex items-center gap-2 mb-2">
                        <input
                            type="url"
                            value={url}
                            onChange={e => setUrl(e.target.value)}
                            placeholder="https://app.apollo.io/#/people?personTitles[]=CEO&…"
                            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                            disabled={parsing || submitting}
                        />
                        <button
                            onClick={onParse}
                            disabled={parsing || submitting || !url.trim()}
                            className="px-3 py-2 text-xs font-semibold rounded-md bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {parsing && <Loader2 size={12} className="animate-spin" />}
                            Preview
                        </button>
                    </div>
                    {parseErr && (
                        <div className="text-[11px] text-red-700 flex items-start gap-1 mb-3">
                            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                            {parseErr}
                        </div>
                    )}

                    {preview && (
                        <div className="border border-emerald-100 bg-emerald-50/40 rounded-lg p-3 mb-4">
                            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-800 mb-1.5">
                                <CheckCircle2 size={12} />
                                URL parsed — kind: {preview.kind}
                                {preview.estimated_count != null && (
                                    <span className="ml-auto text-emerald-900">
                                        ~{preview.estimated_count.toLocaleString()} contacts
                                    </span>
                                )}
                            </div>
                            <ul className="text-[11px] text-slate-700 list-disc pl-4 space-y-0.5">
                                {preview.summary.map((line, i) => <li key={i}>{line}</li>)}
                            </ul>
                        </div>
                    )}

                    {preview && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                    Cap (max contacts)
                                </label>
                                <input
                                    type="number"
                                    value={cap}
                                    onChange={e => setCap(e.target.value)}
                                    min={1}
                                    max={50000}
                                    placeholder="default 50,000"
                                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                    Enroll in campaign (optional)
                                </label>
                                <select
                                    value={targetCampaignId}
                                    onChange={e => setTargetCampaignId(e.target.value)}
                                    className="w-full px-3 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-slate-400 bg-white"
                                >
                                    <option value="">— none —</option>
                                    {campaigns.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1">
                                    Reveal personal emails
                                </label>
                                <label className="flex items-center gap-2 px-3 py-1.5 text-xs border border-slate-200 rounded-md cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={reveal}
                                        onChange={e => setReveal(e.target.checked)}
                                    />
                                    <span className="text-slate-700">Use credits to reveal</span>
                                </label>
                            </div>
                        </div>
                    )}

                    {preview && (
                        <div className="text-[11px] text-slate-500 mb-3">
                            <strong>Credits:</strong> Apollo charges 1 credit per contact when reveal is on.
                            Without reveal, Superkabe imports the basic profile only (work email may still be returned, depending on Apollo&apos;s cache).
                            Set a cap to avoid surprise charges.
                        </div>
                    )}

                    {submitErr && (
                        <div className="text-[11px] text-red-700 flex items-start gap-1 mb-3">
                            <AlertTriangle size={11} className="mt-0.5 shrink-0" />
                            {submitErr}
                        </div>
                    )}

                    {preview && (
                        <button
                            onClick={onStartImport}
                            disabled={submitting}
                            className="px-4 py-2 text-xs font-semibold rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1.5"
                        >
                            {submitting && <Loader2 size={12} className="animate-spin" />}
                            Start import
                        </button>
                    )}
                </div>
            )}

            {/* Recent jobs */}
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-bold text-gray-900">Recent imports</div>
                    <button
                        onClick={refresh}
                        className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                        <RotateCw size={11} /> Refresh
                    </button>
                </div>

                {conn.recent_jobs.length === 0 ? (
                    <div className="text-xs text-slate-500 py-6 text-center">
                        No imports yet. Paste an Apollo URL above to start your first one.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400 border-b border-slate-100">
                                    <th className="py-2 pr-3">Started</th>
                                    <th className="py-2 pr-3">Kind</th>
                                    <th className="py-2 pr-3">State</th>
                                    <th className="py-2 pr-3">Processed</th>
                                    <th className="py-2 pr-3">Created</th>
                                    <th className="py-2 pr-3">Updated</th>
                                    <th className="py-2 pr-3">Failed</th>
                                    <th className="py-2 pr-3">Credits</th>
                                </tr>
                            </thead>
                            <tbody>
                                {conn.recent_jobs.map(j => {
                                    const style = STATE_STYLE[j.state] || STATE_STYLE.pending;
                                    return (
                                        <tr key={j.id} className="border-b border-slate-50">
                                            <td className="py-2 pr-3 text-slate-700">{formatDate(j.started_at ?? j.created_at)}</td>
                                            <td className="py-2 pr-3 text-slate-700">{j.source_kind ?? '—'}</td>
                                            <td className="py-2 pr-3">
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[10px] font-semibold"
                                                    style={{ background: style.bg, color: style.fg }}
                                                >
                                                    {j.state}
                                                </span>
                                            </td>
                                            <td className="py-2 pr-3 text-slate-700">
                                                {j.total_processed.toLocaleString()}
                                                {j.total_estimated > 0 && (
                                                    <span className="text-slate-400"> / {j.total_estimated.toLocaleString()}</span>
                                                )}
                                            </td>
                                            <td className="py-2 pr-3 text-emerald-700">{j.total_created.toLocaleString()}</td>
                                            <td className="py-2 pr-3 text-slate-700">{j.total_updated.toLocaleString()}</td>
                                            <td className="py-2 pr-3 text-red-700">{j.total_failed > 0 ? j.total_failed.toLocaleString() : '—'}</td>
                                            <td className="py-2 pr-3 text-slate-700">{j.credits_consumed.toLocaleString()}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}
