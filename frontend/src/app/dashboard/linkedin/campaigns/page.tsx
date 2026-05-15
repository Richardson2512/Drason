'use client';

/**
 * Super LinkedIn - campaigns list.
 *
 * Reads `/api/sequencer/campaigns?channel=linkedin` for real data. Empty
 * orgs render a true zero-state CTA card - no demo/narrative scaffolding,
 * so operators never confuse fake rows for real campaigns.
 */

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, Rocket, MoreHorizontal, Search, Loader2, AlertCircle } from 'lucide-react';
import { apiClient } from '@/lib/api';

interface Campaign {
    id: string;
    name: string;
    status: 'draft' | 'ongoing' | 'paused' | 'finished';
    pending: number;
    in_sequence: number;
    finished: number;
    failed: number;
    cr_sent: number;
    cr_accept_rate: string;
    reply_rate: string;
    last_action: string;
}

interface PerfRow {
    campaign_id: string;
    sent: number;
    accepted: number;
    accept_rate: number;
    failed: number;
}

interface ApiCampaignRow {
    id: string;
    name: string;
    status: string;
    channel: string;
    total_leads: number;
    total_sent: number;
    total_replied: number;
    total_bounced: number;
    account_count: number;
    step_count: number;
    lead_count: number;
    launched_at: string | null;
    created_at: string;
}

function apiToRow(c: ApiCampaignRow): Campaign {
    const status: Campaign['status'] = c.status === 'active' || c.status === 'ongoing' ? 'ongoing'
        : c.status === 'paused' ? 'paused'
        : c.status === 'completed' || c.status === 'archived' || c.status === 'finished' ? 'finished'
        : 'draft';
    return {
        id: c.id,
        name: c.name,
        status,
        pending: Math.max(0, (c.total_leads ?? 0) - (c.total_sent ?? 0)),
        in_sequence: c.total_sent ?? 0,
        finished: c.lead_count ?? 0,
        failed: c.total_bounced ?? 0,
        cr_sent: c.total_sent ?? 0,
        cr_accept_rate: '-',
        reply_rate: c.total_sent && c.total_sent > 0 ? `${Math.round((c.total_replied / c.total_sent) * 100)}%` : '-',
        last_action: c.launched_at ? `Launched ${new Date(c.launched_at).toLocaleDateString()}` : `Created ${new Date(c.created_at).toLocaleDateString()}`,
    };
}

const STATUS_BADGE: Record<Campaign['status'], string> = {
    draft: 'bg-gray-100 text-gray-600',
    ongoing: 'bg-emerald-50 text-emerald-700',
    paused: 'bg-amber-50 text-amber-700',
    finished: 'bg-blue-50 text-blue-700',
};

export default function LinkedInCampaignsPage() {
    const router = useRouter();
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCampaigns = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            // Fan two reads in parallel: the campaign list, and the
            // 30-day LinkedIn performance summary. The list endpoint
            // gives us names, statuses, lead counts; the perf endpoint
            // gives us per-campaign acceptance + reply telemetry that the
            // list endpoint doesn't compute. We merge by campaign_id so
            // operators see live accept-rate %s on the list without an
            // extra round-trip per row.
            const [rows, perf] = await Promise.all([
                apiClient<ApiCampaignRow[] | { data: ApiCampaignRow[] }>(
                    '/api/sequencer/campaigns?channel=linkedin&limit=100',
                ),
                apiClient<PerfRow[] | { data: PerfRow[] }>(
                    '/api/linkedin/analytics/campaign-perf?range=30d',
                ).catch(() => [] as PerfRow[]),
            ]);
            const list: ApiCampaignRow[] = Array.isArray(rows) ? rows : (rows as any)?.data ?? [];
            const perfList: PerfRow[] = Array.isArray(perf) ? perf : (perf as any)?.data ?? [];
            const perfById = new Map(perfList.map(p => [p.campaign_id, p]));
            setCampaigns(list.map(c => {
                const row = apiToRow(c);
                const p = perfById.get(c.id);
                if (p) {
                    row.cr_sent = p.sent;
                    row.cr_accept_rate = p.sent > 0 ? `${Math.round(p.accept_rate * 100)}%` : '-';
                }
                return row;
            }));
        } catch (err: any) {
            setError(err?.message || 'Failed to load campaigns');
            setCampaigns([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

    // Refetch when the tab regains focus or the document becomes visible
    // again. Avoids the operator-confusing stale state where Launch in
    // one tab leaves the campaign as "draft" in another until they
    // manually reload. Cheaper than polling - only fires when the user
    // actually switches back.
    useEffect(() => {
        const onFocus = () => { void fetchCampaigns(); };
        const onVisibility = () => { if (document.visibilityState === 'visible') void fetchCampaigns(); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [fetchCampaigns]);

    const filtered = campaigns.filter(c => {
        if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
        if (statusFilter !== 'all' && c.status !== statusFilter) return false;
        return true;
    });

    const isEmpty = !loading && !error && campaigns.length === 0;
    const isFilteredEmpty = !loading && !error && campaigns.length > 0 && filtered.length === 0;

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        LinkedIn Campaigns
                        {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
                    </h1>
                    <p className="text-xs text-gray-500 mt-0.5">
                        {campaigns.length} campaigns · {campaigns.filter(c => c.status === 'ongoing').length} ongoing ·{' '}
                        <span className="text-gray-400">LinkedIn-only sequences. For mixed email + LinkedIn, use <Link href="/dashboard/sequencer/campaigns" className="underline">Super Sequencer</Link>.</span>
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Link
                        href="/dashboard/linkedin/campaigns/new"
                        className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors no-underline"
                    >
                        <Plus size={14} /> New campaign
                    </Link>
                </div>
            </div>

            {error && (
                <div className="premium-card flex items-start gap-2 !bg-rose-50 !border-rose-200 text-xs text-rose-800">
                    <AlertCircle size={14} className="mt-0.5 shrink-0" />
                    <div>
                        <div className="font-semibold">Couldn&apos;t load campaigns</div>
                        <div className="text-rose-700 mt-0.5">{error}</div>
                        <button onClick={fetchCampaigns} className="mt-1.5 text-rose-900 underline decoration-dotted">Retry</button>
                    </div>
                </div>
            )}

            {!isEmpty && (
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="relative flex-1 max-w-md">
                        <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text" value={search} onChange={e => setSearch(e.target.value)}
                            placeholder="Search campaigns by name…"
                            className="w-full pl-7 pr-3 py-1.5 text-xs rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                    </div>
                    <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
                        className="text-xs px-3 py-1.5 rounded-lg outline-none bg-white cursor-pointer"
                        style={{ border: '1px solid #D1CBC5' }}>
                        <option value="all">All statuses</option>
                        <option value="draft">Draft</option>
                        <option value="ongoing">Ongoing</option>
                        <option value="paused">Paused</option>
                        <option value="finished">Finished</option>
                    </select>
                    {(search || statusFilter !== 'all') && (
                        <button onClick={() => { setSearch(''); setStatusFilter('all'); }}
                            className="text-[11px] text-gray-500 hover:text-gray-900 underline decoration-dotted">Clear</button>
                    )}
                </div>
            )}

            {isEmpty ? (
                <div className="premium-card flex flex-col items-center justify-center py-16 px-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mb-3">
                        <Rocket size={20} className="text-gray-400" />
                    </div>
                    <h2 className="text-sm font-bold text-gray-900">No campaigns yet</h2>
                    <p className="text-xs text-gray-500 mt-1 max-w-sm">
                        Build a LinkedIn outreach sequence - connect a sender, attach an ICP, define your steps, and launch.
                    </p>
                    <Link
                        href="/dashboard/linkedin/campaigns/new"
                        className="mt-4 flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 transition-colors no-underline"
                    >
                        <Plus size={12} /> Create your first campaign
                    </Link>
                </div>
            ) : (
                <div className="premium-card !p-0 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-[#D1CBC5]">
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">In sequence</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Finished</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Failed</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" title="Connection-request acceptance rate over the last 30 days">Accept % (30d)</th>
                                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider" title="Lifetime reply rate - replies received / total sent across the entire campaign history">Reply % (life)</th>
                                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Last action</th>
                                <th className="w-12"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {isFilteredEmpty ? (
                                <tr>
                                    <td colSpan={10} className="px-4 py-10 text-center text-xs text-gray-500">
                                        No campaigns match the current filters.
                                    </td>
                                </tr>
                            ) : filtered.map(c => (
                                <tr key={c.id} className="hover:bg-gray-50/50 transition-colors cursor-pointer" onClick={() => router.push(`/dashboard/linkedin/campaigns/${c.id}`)}>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                                            <Rocket size={12} className="text-gray-400" /> {c.name}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_BADGE[c.status]}`}>{c.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-700 tabular-nums">{c.pending}</td>
                                    <td className="px-4 py-3 text-right text-sm text-blue-700 font-semibold tabular-nums">{c.in_sequence}</td>
                                    <td className="px-4 py-3 text-right text-sm text-emerald-700 tabular-nums">{c.finished}</td>
                                    <td className="px-4 py-3 text-right text-sm text-rose-600 tabular-nums">{c.failed}</td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold tabular-nums">{c.cr_accept_rate}</td>
                                    <td className="px-4 py-3 text-right text-sm text-gray-900 font-semibold tabular-nums">{c.reply_rate}</td>
                                    <td className="px-4 py-3 text-[0.7rem] text-gray-500">{c.last_action}</td>
                                    <td className="px-2 py-3 text-right">
                                        <button className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-700">
                                            <MoreHorizontal size={14} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
