'use client';

/**
 * ImportProgressTray — bottom-right floating tray that tracks Apollo + CRM
 * import jobs spawned from ImportLeadsModal. Polls each job's status until
 * it reaches a terminal state, then triggers a contacts refetch.
 *
 * Polling endpoints:
 *   - Apollo:    GET /api/integrations/apollo/jobs/:id
 *   - CRM:       GET /api/integrations/crm/connections/:connectionId
 *                  → finds the job by id in `recent_sync_jobs`
 *
 * Why not a per-job endpoint for CRM? The backend exposes job state via the
 * connection-detail endpoint already (recent_sync_jobs[]). Adding another
 * endpoint would duplicate behavior. Pulling the connection per poll is
 * fine for the small N of concurrent jobs we expect (<10).
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { CheckCircle2, X, Loader2, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { SpawnedJob, SpawnedJobSource } from './ImportLeadsModal';

type JobState = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled' | 'unknown';

interface TrackedJob extends SpawnedJob {
    state: JobState;
    processed: number;
    created: number;
    total: number | null;
    error: string | null;
}

interface Props {
    jobs: SpawnedJob[];
    onRemove: (id: string) => void;
    onAnyCompleted: () => void;
}

const POLL_INTERVAL_MS = 3000;
const AUTO_DISMISS_MS = 8000;
const TERMINAL_STATES: JobState[] = ['completed', 'failed', 'cancelled'];

export default function ImportProgressTray({ jobs, onRemove, onAnyCompleted }: Props) {
    const [tracked, setTracked] = useState<Record<string, TrackedJob>>({});
    const [collapsed, setCollapsed] = useState(false);
    const completionFiredRef = useRef<Set<string>>(new Set());

    // Sync tracked map when new jobs arrive. Don't blow away counters for
    // jobs we're already polling.
    useEffect(() => {
        setTracked(prev => {
            const next: Record<string, TrackedJob> = {};
            for (const j of jobs) {
                next[j.id] = prev[j.id] ?? {
                    ...j,
                    state: 'pending',
                    processed: 0,
                    created: 0,
                    total: null,
                    error: null,
                };
            }
            return next;
        });
    }, [jobs]);

    const activeJobs = useMemo(
        () => Object.values(tracked).filter(j => !TERMINAL_STATES.includes(j.state)),
        [tracked],
    );

    // Polling loop — fires while there's at least one active job.
    useEffect(() => {
        if (activeJobs.length === 0) return;

        let cancelled = false;
        const poll = async () => {
            const updates = await Promise.all(
                activeJobs.map(async (j): Promise<[string, Partial<TrackedJob>]> => {
                    try {
                        const update = await fetchJobStatus(j);
                        return [j.id, update];
                    } catch (err: any) {
                        return [j.id, { error: err?.message || 'Failed to fetch status' }];
                    }
                }),
            );
            if (cancelled) return;
            setTracked(prev => {
                const next = { ...prev };
                for (const [id, patch] of updates) {
                    const cur = next[id];
                    if (!cur) continue;
                    next[id] = { ...cur, ...patch };
                }
                return next;
            });
        };

        // Poll immediately then on interval.
        void poll();
        const t = setInterval(() => { void poll(); }, POLL_INTERVAL_MS);
        return () => { cancelled = true; clearInterval(t); };
    }, [activeJobs.map(j => j.id).join('|')]); // eslint-disable-line react-hooks/exhaustive-deps

    // When a job transitions to a terminal state, fire the completion callback
    // exactly once and schedule auto-dismiss.
    useEffect(() => {
        for (const j of Object.values(tracked)) {
            if (!TERMINAL_STATES.includes(j.state)) continue;
            if (completionFiredRef.current.has(j.id)) continue;
            completionFiredRef.current.add(j.id);
            if (j.state === 'completed') {
                onAnyCompleted();
            }
            const tid = setTimeout(() => onRemove(j.id), AUTO_DISMISS_MS);
            // No cleanup — the parent removing the job from the `jobs` prop will
            // unmount this card; the timeout is a no-op if it fires after that.
            void tid;
        }
    }, [tracked, onAnyCompleted, onRemove]);

    const all = Object.values(tracked);
    if (all.length === 0) return null;

    const runningCount = activeJobs.length;
    const headerLabel = runningCount > 0
        ? `Importing — ${runningCount} running`
        : `Imports finished`;

    return (
        <div
            className="fixed bottom-4 right-4 w-80 bg-white rounded-xl shadow-lg z-[9998] overflow-hidden"
            style={{ border: '1px solid #D1CBC5' }}
        >
            <button
                type="button"
                onClick={() => setCollapsed(c => !c)}
                className="w-full px-3 py-2 flex items-center justify-between cursor-pointer bg-transparent border-none"
                style={{ borderBottom: collapsed ? 'none' : '1px solid #E8E3DC', background: '#F7F2EB' }}
            >
                <div className="flex items-center gap-2">
                    {runningCount > 0
                        ? <Loader2 size={12} className="animate-spin text-gray-600" />
                        : <CheckCircle2 size={12} className="text-green-600" />}
                    <span className="text-[11px] font-bold text-gray-900">{headerLabel}</span>
                </div>
                {collapsed ? <ChevronUp size={12} className="text-gray-500" /> : <ChevronDown size={12} className="text-gray-500" />}
            </button>

            {!collapsed && (
                <div className="max-h-80 overflow-y-auto">
                    {all.map(j => (
                        <JobCard key={j.id} job={j} onDismiss={() => onRemove(j.id)} />
                    ))}
                </div>
            )}
        </div>
    );
}

function JobCard({ job, onDismiss }: { job: TrackedJob; onDismiss: () => void }) {
    const isTerminal = TERMINAL_STATES.includes(job.state);
    const pct = computePct(job);
    const stateColor = stateColorFor(job.state);

    return (
        <div className="px-3 py-2.5" style={{ borderBottom: '1px solid #F0EBE3' }}>
            <div className="flex items-start justify-between gap-2 mb-1.5">
                <div className="min-w-0 flex-1">
                    <div className="text-[11px] font-semibold text-gray-900 truncate">{job.label}</div>
                    <div className="text-[10px] text-gray-500 capitalize flex items-center gap-1">
                        <span style={{ color: stateColor }}>● {job.state}</span>
                        {(job.total != null || job.processed > 0) && (
                            <>
                                <span className="text-gray-300">·</span>
                                <span className="tabular-nums">
                                    {job.processed.toLocaleString()}{job.total != null ? ` / ${job.total.toLocaleString()}` : ''}
                                </span>
                            </>
                        )}
                        {job.created > 0 && (
                            <>
                                <span className="text-gray-300">·</span>
                                <span className="tabular-nums">+{job.created.toLocaleString()} new</span>
                            </>
                        )}
                    </div>
                </div>
                {isTerminal && (
                    <button
                        type="button"
                        onClick={onDismiss}
                        className="text-gray-400 hover:text-gray-700 cursor-pointer bg-transparent border-none flex-shrink-0 p-0.5"
                        aria-label="Dismiss"
                    >
                        <X size={11} />
                    </button>
                )}
            </div>

            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: '#E8E3DC' }}>
                <div
                    className="h-full transition-all duration-300"
                    style={{ width: `${pct}%`, background: barColorFor(job.state) }}
                />
            </div>

            {job.error && (
                <div className="mt-1.5 text-[10px] text-red-700 flex items-start gap-1">
                    <AlertTriangle size={10} className="mt-0.5 flex-shrink-0" />
                    <span>{job.error}</span>
                </div>
            )}
        </div>
    );
}

// ─── Status fetchers ────────────────────────────────────────────────────

async function fetchJobStatus(job: TrackedJob | SpawnedJob): Promise<Partial<TrackedJob>> {
    if (job.source === 'apollo') return fetchApolloStatus(job.id);
    return fetchCrmStatus(job.id, job.connectionId, job.source);
}

interface ApolloJobResponse {
    data?: {
        id: string;
        state: string;
        total_estimated: number | null;
        total_processed: number;
        total_created: number;
        total_failed: number;
        error_message: string | null;
    };
}

async function fetchApolloStatus(jobId: string): Promise<Partial<TrackedJob>> {
    const res = await apiClient<ApolloJobResponse>(`/api/integrations/apollo/jobs/${jobId}`);
    const d = res?.data;
    if (!d) return { error: 'Job not found' };
    return {
        state: normalizeState(d.state),
        processed: d.total_processed ?? 0,
        created: d.total_created ?? 0,
        total: d.total_estimated ?? null,
        error: d.error_message ?? null,
    };
}

interface CrmConnectionDetailResponse {
    data?: {
        recent_sync_jobs?: Array<{
            id: string;
            state: string;
            total_records: number | null;
            records_processed: number | null;
            records_created: number | null;
            records_failed: number | null;
            error_message: string | null;
        }>;
    };
}

async function fetchCrmStatus(jobId: string, connectionId: string, _source: SpawnedJobSource): Promise<Partial<TrackedJob>> {
    const res = await apiClient<CrmConnectionDetailResponse>(`/api/integrations/crm/connections/${connectionId}`);
    const job = res?.data?.recent_sync_jobs?.find(j => j.id === jobId);
    if (!job) {
        return { error: 'Job not found in connection history' };
    }
    return {
        state: normalizeState(job.state),
        processed: job.records_processed ?? 0,
        created: job.records_created ?? 0,
        total: job.total_records ?? null,
        error: job.error_message ?? null,
    };
}

function normalizeState(s: string): JobState {
    const norm = (s || '').toLowerCase();
    if (norm === 'pending' || norm === 'running' || norm === 'completed' || norm === 'failed' || norm === 'cancelled') {
        return norm;
    }
    return 'unknown';
}

function computePct(j: TrackedJob): number {
    if (j.state === 'completed') return 100;
    if (j.total && j.total > 0) {
        return Math.min(100, Math.round((j.processed / j.total) * 100));
    }
    if (j.state === 'pending') return 4;
    if (j.state === 'running') return 25;
    if (j.state === 'failed' || j.state === 'cancelled') return 100;
    return 0;
}

function stateColorFor(s: JobState): string {
    switch (s) {
        case 'completed': return '#15803D';
        case 'failed':
        case 'cancelled': return '#B91C1C';
        case 'running': return '#1D4ED8';
        default:          return '#6B7280';
    }
}

function barColorFor(s: JobState): string {
    switch (s) {
        case 'completed': return '#22C55E';
        case 'failed':
        case 'cancelled': return '#EF4444';
        default:          return '#3B82F6';
    }
}
