'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

// ── Phase Configuration ──────────────────────────────────────────────────────
const PHASE_CONFIG: Record<string, {
    label: string; color: string; bg: string; border: string;
    progress: number; icon: string; description: string;
}> = {
    paused: {
        label: 'Paused', color: '#EF4444', bg: '#FEF2F2', border: '#FECACA',
        progress: 0, icon: '\u23F8', description: 'Cooling down before quarantine entry',
    },
    quarantine: {
        label: 'Quarantine', color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A',
        progress: 25, icon: '\uD83D\uDD0D', description: 'Waiting for DNS verification',
    },
    restricted_send: {
        label: 'Restricted Send', color: '#3B82F6', bg: '#EFF6FF', border: '#BFDBFE',
        progress: 50, icon: '\uD83D\uDEE1', description: 'Limited sending with monitoring',
    },
    warm_recovery: {
        label: 'Warm Recovery', color: '#22C55E', bg: '#ECFDF5', border: '#A7F3D0',
        progress: 75, icon: '\uD83D\uDCC8', description: 'Ramping back to full volume',
    },
    healthy: {
        label: 'Healthy', color: '#166534', bg: '#F0FDF4', border: '#BBF7D0',
        progress: 100, icon: '\u2705', description: 'Fully recovered',
    },
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function formatDuration(ms: number): string {
    if (ms <= 0) return '0m';
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 1) {
        const minutes = Math.floor(ms / (1000 * 60));
        return `${minutes}m`;
    }
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    const remainHours = hours % 24;
    return remainHours > 0 ? `${days}d ${remainHours}h` : `${days}d`;
}

function formatTimeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}

function getCooldownRemaining(cooldownUntil: string): string {
    const diff = new Date(cooldownUntil).getTime() - Date.now();
    if (diff <= 0) return 'Ready';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
}

function getProgressPercent(phase: string, cleanSends: number, consecutivePauses: number): number {
    switch (phase) {
        case 'paused': return 5;
        case 'quarantine': return 25;
        case 'restricted_send': {
            const target = consecutivePauses > 1 ? 25 : 15;
            const base = 25;
            const range = 25; // 25% to 50%
            return base + Math.min(range, (cleanSends / target) * range);
        }
        case 'warm_recovery': {
            const base = 50;
            const range = 50; // 50% to 100%
            return base + Math.min(range, (cleanSends / 50) * range);
        }
        case 'healthy': return 100;
        default: return 0;
    }
}

// ── Pipeline Summary Card ────────────────────────────────────────────────────
function SummaryCard({ label, count, color, icon }: {
    label: string; count: number; color: string; icon: string;
}) {
    return (
        <div className="premium-card rounded-[16px] relative overflow-hidden" style={{ borderLeft: `4px solid ${color}` }}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="text-3xl font-extrabold text-gray-900">{count}</div>
                    <div className="text-sm font-semibold text-gray-500 mt-1">{label}</div>
                </div>
                <div className="text-2xl opacity-40">{icon}</div>
            </div>
        </div>
    );
}

// ── Recovery Entity Card ─────────────────────────────────────────────────────
function RecoveryEntityCard({ entity, type }: {
    entity: Record<string, any>; type: 'mailbox' | 'domain';
}) {
    const phase = entity.recovery_phase || 'paused';
    const cfg = PHASE_CONFIG[phase] || PHASE_CONFIG.paused;
    const cleanSends = entity.clean_sends_since_phase || 0;
    const consecutivePauses = entity.consecutive_pauses || 0;
    const relapseCount = entity.relapse_count || 0;
    const resilience = entity.resilience_score;
    const phaseEnteredAt = entity.phase_entered_at;
    const cooldownUntil = entity.cooldown_until;
    const bounceRate = entity.total_sent_count > 0
        ? (entity.hard_bounce_count / entity.total_sent_count)
        : 0;

    const timeInPhase = phaseEnteredAt
        ? formatDuration(Date.now() - new Date(phaseEnteredAt).getTime())
        : null;

    const progress = getProgressPercent(phase, cleanSends, consecutivePauses);

    // Graduation criteria per phase
    const getGraduationText = (): string => {
        switch (phase) {
            case 'paused': {
                if (!cooldownUntil) return 'Waiting for cooldown timer...';
                const remaining = getCooldownRemaining(cooldownUntil);
                return remaining === 'Ready'
                    ? 'Cooldown expired — ready for quarantine'
                    : `Cooldown expires in ${remaining}`;
            }
            case 'quarantine':
                return 'DNS checks must pass (SPF, DKIM, no blacklists)';
            case 'restricted_send': {
                const target = consecutivePauses > 1 ? 25 : 15;
                const remaining = target - cleanSends;
                return remaining > 0
                    ? `Need ${remaining} more clean sends with 0 bounces`
                    : 'Clean send target met — checking for graduation';
            }
            case 'warm_recovery': {
                const remaining = 50 - cleanSends;
                return remaining > 0
                    ? `Need ${remaining} more sends over 3+ days, bounce rate < 2%`
                    : 'Send target met — checking time and bounce requirements';
            }
            default:
                return 'Fully recovered';
        }
    };

    const getNextPhaseName = (): string | null => {
        switch (phase) {
            case 'paused': return 'Quarantine';
            case 'quarantine': return 'Restricted Send';
            case 'restricted_send': return 'Warm Recovery';
            case 'warm_recovery': return 'Healthy';
            default: return null;
        }
    };

    const nextPhase = getNextPhaseName();
    const label = type === 'mailbox' ? entity.email : entity.domain;

    // Estimated graduation time (rough)
    const getEstimatedGraduation = (): string | null => {
        switch (phase) {
            case 'paused': {
                if (!cooldownUntil) return null;
                const remaining = getCooldownRemaining(cooldownUntil);
                return remaining === 'Ready' ? 'Now' : `~${remaining}`;
            }
            case 'restricted_send': {
                const target = consecutivePauses > 1 ? 25 : 15;
                const remaining = target - cleanSends;
                if (remaining <= 0) return 'Soon';
                return `~${remaining}d`;
            }
            case 'warm_recovery': {
                const remaining = 50 - cleanSends;
                if (remaining <= 0) return 'Soon';
                return `~${Math.max(3, remaining)}d`;
            }
            default: return null;
        }
    };
    const estGrad = getEstimatedGraduation();

    return (
        <div className="premium-card rounded-[16px] p-5" style={{
            borderLeft: `4px solid ${cfg.color}`,
        }}>
            {/* Header row */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 min-w-0">
                    <span className="font-bold text-gray-900 text-[0.95rem] truncate">{label}</span>
                    {relapseCount > 0 && (
                        <span className="shrink-0 py-[0.125rem] px-[0.5rem] rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-[0.65rem] font-bold">
                            {relapseCount} relapse{relapseCount > 1 ? 's' : ''}
                        </span>
                    )}
                </div>
                <div className="shrink-0 py-1 px-3 rounded-full text-[0.7rem] font-bold uppercase tracking-wide" style={{
                    background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`, color: cfg.color,
                }}>
                    {cfg.label}
                </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-[10px] bg-gray-100 rounded-full overflow-hidden mb-4">
                <div
                    className="h-full rounded-full transition-[width] duration-700 ease-out"
                    style={{
                        width: `${progress}%`,
                        background: `linear-gradient(90deg, ${cfg.color}90, ${cfg.color})`,
                    }}
                />
            </div>
            <div className="text-xs text-gray-400 mb-4 -mt-2">
                {Math.round(progress)}% through pipeline
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 mb-4">
                {(phase === 'restricted_send' || phase === 'warm_recovery') && (
                    <div>
                        <div className="text-[0.65rem] text-gray-400 font-semibold uppercase tracking-wide">Clean Sends</div>
                        <div className="text-[0.9rem] font-extrabold text-gray-800">
                            {cleanSends}/{phase === 'warm_recovery' ? 50 : (consecutivePauses > 1 ? 25 : 15)}
                        </div>
                    </div>
                )}
                {phase === 'paused' && cooldownUntil && (
                    <div>
                        <div className="text-[0.65rem] text-gray-400 font-semibold uppercase tracking-wide">Cooldown</div>
                        <CooldownTimer cooldownUntil={cooldownUntil} />
                    </div>
                )}
                {phase === 'paused' && (
                    <div>
                        <div className="text-[0.65rem] text-gray-400 font-semibold uppercase tracking-wide">Consecutive Pauses</div>
                        <div className="text-[0.9rem] font-extrabold text-gray-800">{consecutivePauses}</div>
                    </div>
                )}
                {phase === 'quarantine' && (
                    <div className="col-span-2">
                        <div className="text-[0.65rem] text-gray-400 font-semibold uppercase tracking-wide">DNS Status</div>
                        <div className="flex items-center gap-2 mt-0.5">
                            <DnsIndicator label="SPF" pass={entity.spf_pass} />
                            <DnsIndicator label="DKIM" pass={entity.dkim_pass} />
                            <DnsIndicator label="Blacklist" pass={entity.blacklisted === false} inverse />
                        </div>
                    </div>
                )}
                <div>
                    <div className="text-[0.65rem] text-gray-400 font-semibold uppercase tracking-wide">Bounce Rate</div>
                    <div className="text-[0.9rem] font-extrabold" style={{
                        color: bounceRate < 0.02 ? '#16A34A' : bounceRate < 0.03 ? '#F59E0B' : '#EF4444',
                    }}>
                        {(bounceRate * 100).toFixed(1)}%
                    </div>
                </div>
                {resilience !== undefined && resilience !== null && (
                    <div>
                        <div className="text-[0.65rem] text-gray-400 font-semibold uppercase tracking-wide">Resilience</div>
                        <div className="text-[0.9rem] font-extrabold" style={{
                            color: resilience >= 70 ? '#16A34A' : resilience >= 30 ? '#F59E0B' : '#EF4444',
                        }}>
                            {resilience}
                        </div>
                    </div>
                )}
                {timeInPhase && (
                    <div>
                        <div className="text-[0.65rem] text-gray-400 font-semibold uppercase tracking-wide">Time in Phase</div>
                        <div className="text-[0.9rem] font-bold text-gray-500">{timeInPhase}</div>
                    </div>
                )}
                {estGrad && (
                    <div>
                        <div className="text-[0.65rem] text-gray-400 font-semibold uppercase tracking-wide">Est. Graduation</div>
                        <div className="text-[0.9rem] font-bold text-gray-500">{estGrad}</div>
                    </div>
                )}
                {type === 'domain' && entity.mailbox_count !== undefined && (
                    <div>
                        <div className="text-[0.65rem] text-gray-400 font-semibold uppercase tracking-wide">Mailboxes</div>
                        <div className="text-[0.9rem] font-extrabold text-gray-800">{entity.mailbox_count}</div>
                    </div>
                )}
            </div>

            {/* Next phase info */}
            {nextPhase && (
                <div className="pt-3" style={{ borderTop: `1px solid ${cfg.border}` }}>
                    <div className="text-[0.75rem] text-gray-500 flex items-center gap-2">
                        <span className="opacity-60">&rarr;</span>
                        <span>
                            <span className="font-semibold">Next: {nextPhase}</span>
                            <span className="text-gray-400"> &mdash; {getGraduationText()}</span>
                        </span>
                    </div>
                </div>
            )}
        </div>
    );
}

// ── Cooldown Timer (live-updating) ───────────────────────────────────────────
function CooldownTimer({ cooldownUntil }: { cooldownUntil: string }) {
    const [remaining, setRemaining] = useState<string>(getCooldownRemaining(cooldownUntil));

    useEffect(() => {
        const update = () => setRemaining(getCooldownRemaining(cooldownUntil));
        update();
        const interval = setInterval(update, 60000);
        return () => clearInterval(interval);
    }, [cooldownUntil]);

    return (
        <div className="text-[0.9rem] font-extrabold" style={{
            color: remaining === 'Ready' ? '#16A34A' : '#DC2626',
        }}>
            {remaining}
        </div>
    );
}

// ── DNS Indicator ────────────────────────────────────────────────────────────
function DnsIndicator({ label, pass, inverse }: {
    label: string; pass?: boolean; inverse?: boolean;
}) {
    // For blacklist: pass=true means NOT blacklisted (good)
    const isGood = pass === true;
    const isUnknown = pass === undefined || pass === null;
    return (
        <span className="text-[0.75rem] font-semibold flex items-center gap-1" style={{
            color: isUnknown ? '#9CA3AF' : isGood ? '#16A34A' : '#EF4444',
        }}>
            <span>{isUnknown ? '\u25CB' : isGood ? '\u2713' : '\u2717'}</span>
            <span>{inverse && !isUnknown ? (isGood ? `No ${label}` : label) : label}</span>
        </span>
    );
}

// ── Loading Skeleton ─────────────────────────────────────────────────────────
function SkeletonCard() {
    return (
        <div className="premium-card rounded-[16px] animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-1/4 mb-2" />
            <div className="h-2 bg-gray-100 rounded w-full" />
        </div>
    );
}

// ── Main Page Component ──────────────────────────────────────────────────────
export default function HealingPipelinePage() {
    const [recoveryData, setRecoveryData] = useState<Record<string, any> | null>(null);
    const [warmupData, setWarmupData] = useState<Record<string, any> | null>(null);
    const [auditLogs, setAuditLogs] = useState<Array<Record<string, any>>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Manual check state
    const [checking, setChecking] = useState(false);
    const [checkResult, setCheckResult] = useState<{
        checked: number; graduated: number; errors: number;
    } | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [recovery, warmup, logs] = await Promise.allSettled([
                apiClient<Record<string, any>>('/api/healing/recovery-status'),
                apiClient<Record<string, any>>('/api/dashboard/warmup-status'),
                apiClient<Array<Record<string, any>>>('/api/dashboard/audit-logs?action=phase_transitioned&limit=20'),
            ]);

            if (recovery.status === 'fulfilled' && recovery.value) {
                setRecoveryData(recovery.value);
            }
            if (warmup.status === 'fulfilled' && warmup.value) {
                setWarmupData(warmup.value);
            }
            if (logs.status === 'fulfilled' && logs.value) {
                setAuditLogs(Array.isArray(logs.value) ? logs.value : []);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to load healing data');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    // Auto-refresh every 60s
    useEffect(() => {
        const interval = setInterval(fetchData, 60000);
        return () => clearInterval(interval);
    }, [fetchData]);

    const handleCheckGraduation = async () => {
        setChecking(true);
        setCheckResult(null);
        try {
            const result = await apiClient<{ checked: number; graduated: number; errors: number }>(
                '/api/dashboard/warmup/check', { method: 'POST' }
            );
            if (result) setCheckResult(result);
            await fetchData();
        } catch (err: any) {
            console.error('Graduation check failed:', err);
            setCheckResult({ checked: 0, graduated: 0, errors: 1 });
        } finally {
            setChecking(false);
            setTimeout(() => setCheckResult(null), 8000);
        }
    };

    // ── Derive counts per phase ──────────────────────────────────────────────
    const allMailboxes: Array<Record<string, any>> = recoveryData?.mailboxes || [];
    const allDomains: Array<Record<string, any>> = recoveryData?.domains || [];
    const allEntities = [...allMailboxes, ...allDomains];

    const phaseCounts = {
        paused: allEntities.filter(e => e.recovery_phase === 'paused').length,
        quarantine: allEntities.filter(e => e.recovery_phase === 'quarantine').length,
        restricted_send: allEntities.filter(e => e.recovery_phase === 'restricted_send').length,
        warm_recovery: allEntities.filter(e => e.recovery_phase === 'warm_recovery').length,
    };

    // Recently recovered: audit logs with transition to healthy in last 7 days
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentlyRecovered = auditLogs.filter(log => {
        const meta = log.metadata || log.details || {};
        const toPhase = meta.to_phase || meta.new_phase || meta.toPhase || '';
        const createdAt = new Date(log.created_at || log.timestamp || 0).getTime();
        return toPhase === 'healthy' && createdAt > sevenDaysAgo;
    });

    const recoveredCount = recentlyRecovered.length;

    const totalRecovering = (recoveryData?.summary?.totalRecovering ?? 0);

    return (
        <div className="max-w-[1400px] mx-auto">
            {/* ── Header ──────────────────────────────────────────────────── */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Healing Pipeline</h1>
                <p className="text-gray-500 mt-1">
                    Monitor and track the recovery progress of paused mailboxes and domains
                </p>
            </div>

            {error && (
                <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm font-medium">
                    {error}
                </div>
            )}

            {/* ── Section 1: Pipeline Summary Cards ───────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
                {loading ? (
                    <>
                        <SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard /><SkeletonCard />
                    </>
                ) : (
                    <>
                        <SummaryCard label="Paused" count={phaseCounts.paused} color="#EF4444" icon={PHASE_CONFIG.paused.icon} />
                        <SummaryCard label="Quarantine" count={phaseCounts.quarantine} color="#F59E0B" icon={PHASE_CONFIG.quarantine.icon} />
                        <SummaryCard label="Restricted Send" count={phaseCounts.restricted_send} color="#3B82F6" icon={PHASE_CONFIG.restricted_send.icon} />
                        <SummaryCard label="Warm Recovery" count={phaseCounts.warm_recovery} color="#22C55E" icon={PHASE_CONFIG.warm_recovery.icon} />
                        <SummaryCard label="Recovered (7d)" count={recoveredCount} color="#166534" icon={PHASE_CONFIG.healthy.icon} />
                    </>
                )}
            </div>

            {/* Empty state */}
            {!loading && totalRecovering === 0 && recoveredCount === 0 && (
                <div className="premium-card rounded-[20px] text-center py-16">
                    <div className="text-4xl mb-4 opacity-40">{PHASE_CONFIG.healthy.icon}</div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">All clear</h3>
                    <p className="text-gray-500 text-sm max-w-md mx-auto">
                        No mailboxes or domains are currently in the healing pipeline. When entities get paused due to deliverability issues, they will appear here as they progress through recovery.
                    </p>
                </div>
            )}

            {/* ── Section 2: Active Recovery — Mailboxes ──────────────────── */}
            {!loading && allMailboxes.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            Active Recovery &mdash; Mailboxes
                        </h2>
                        <span className="py-[0.3rem] px-3 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                            {allMailboxes.length} mailbox{allMailboxes.length !== 1 ? 'es' : ''}
                        </span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {allMailboxes.map((mb) => (
                            <RecoveryEntityCard key={mb.id} entity={mb} type="mailbox" />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Section 3: Active Recovery — Domains ────────────────────── */}
            {!loading && allDomains.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            Active Recovery &mdash; Domains
                        </h2>
                        <span className="py-[0.3rem] px-3 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                            {allDomains.length} domain{allDomains.length !== 1 ? 's' : ''}
                        </span>
                    </div>
                    <div className="flex flex-col gap-4">
                        {allDomains.map((d) => (
                            <RecoveryEntityCard key={d.id} entity={d} type="domain" />
                        ))}
                    </div>
                </div>
            )}

            {/* ── Section 4: Manual Actions ───────────────────────────────── */}
            {!loading && totalRecovering > 0 && (
                <div className="mb-8">
                    <div className="premium-card rounded-[20px]">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Manual Actions</h2>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Trigger an immediate graduation check for all entities in the pipeline
                                </p>
                            </div>
                            <button
                                onClick={handleCheckGraduation}
                                disabled={checking}
                                className="py-2.5 px-5 rounded-xl text-sm font-bold transition-all duration-200"
                                style={{
                                    background: checking ? '#E5E7EB' : '#1E293B',
                                    color: checking ? '#9CA3AF' : '#FFFFFF',
                                    cursor: checking ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {checking ? 'Checking...' : 'Check Graduation Now'}
                            </button>
                        </div>

                        {/* Check result banner */}
                        {checkResult && (
                            <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
                                checkResult.errors > 0
                                    ? 'bg-red-50 border border-red-200 text-red-800'
                                    : checkResult.graduated > 0
                                    ? 'bg-green-50 border border-green-200 text-green-800'
                                    : 'bg-blue-50 border border-blue-200 text-blue-800'
                            }`}>
                                <div>
                                    <div className="font-bold">
                                        {checkResult.errors > 0
                                            ? 'Check completed with errors'
                                            : checkResult.graduated > 0
                                            ? `${checkResult.graduated} entit${checkResult.graduated > 1 ? 'ies' : 'y'} graduated!`
                                            : 'No entities ready to graduate yet'
                                        }
                                    </div>
                                    <div className="text-xs opacity-75 mt-0.5">
                                        Checked {checkResult.checked} entit{checkResult.checked !== 1 ? 'ies' : 'y'} in the healing pipeline
                                        {checkResult.graduated > 0 && ` \u00B7 ${checkResult.graduated} moved to next phase`}
                                        {checkResult.errors > 0 && ` \u00B7 ${checkResult.errors} error${checkResult.errors > 1 ? 's' : ''}`}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── Section 5: Recently Recovered ───────────────────────────── */}
            {!loading && recentlyRecovered.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            Recently Recovered
                        </h2>
                        <span className="text-sm text-gray-400 font-medium">Last 7 days</span>
                    </div>
                    <div className="premium-card rounded-[20px]">
                        <div className="flex flex-col divide-y divide-gray-100">
                            {recentlyRecovered.map((log, idx) => {
                                const meta = log.metadata || log.details || {};
                                const entityName = meta.email || meta.domain || meta.entity_name || 'Unknown';
                                const recoveredAt = log.created_at || log.timestamp;
                                const fromPhase = meta.from_phase || meta.old_phase || meta.fromPhase || '';
                                const resilience = meta.resilience_score;
                                const duration = meta.recovery_duration_ms
                                    ? formatDuration(meta.recovery_duration_ms)
                                    : meta.recovery_duration || null;

                                return (
                                    <div key={log.id || idx} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <span className="text-lg shrink-0">{PHASE_CONFIG.healthy.icon}</span>
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-gray-900 truncate">{entityName}</div>
                                                <div className="text-xs text-gray-400">
                                                    {fromPhase && (
                                                        <span>From {PHASE_CONFIG[fromPhase]?.label || fromPhase} &rarr; Healthy</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 shrink-0">
                                            {duration && (
                                                <div className="text-right">
                                                    <div className="text-[0.6rem] text-gray-400 font-semibold uppercase">Duration</div>
                                                    <div className="text-xs font-bold text-gray-600">{duration}</div>
                                                </div>
                                            )}
                                            {resilience !== undefined && resilience !== null && (
                                                <div className="text-right">
                                                    <div className="text-[0.6rem] text-gray-400 font-semibold uppercase">Resilience</div>
                                                    <div className="text-xs font-bold" style={{
                                                        color: resilience >= 70 ? '#16A34A' : resilience >= 30 ? '#F59E0B' : '#EF4444',
                                                    }}>
                                                        {resilience}
                                                    </div>
                                                </div>
                                            )}
                                            {recoveredAt && (
                                                <div className="text-right">
                                                    <div className="text-[0.6rem] text-gray-400 font-semibold uppercase">Recovered</div>
                                                    <div className="text-xs font-bold text-gray-500">{formatTimeAgo(recoveredAt)}</div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}

            {/* ── Warmup Estimated Graduations (from warmup endpoint) ─────── */}
            {!loading && warmupData && warmupData.estimatedGraduations && warmupData.estimatedGraduations.length > 0 && (
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">
                            Estimated Graduation Timeline
                        </h2>
                        {warmupData.avgDaysInRecovery > 0 && (
                            <span className="text-sm text-gray-400 font-medium">
                                Avg. recovery: {warmupData.avgDaysInRecovery}d
                            </span>
                        )}
                    </div>
                    <div className="premium-card rounded-[20px]">
                        <div className="flex flex-col gap-3">
                            {(warmupData.estimatedGraduations as Array<Record<string, any>>).map((est) => {
                                const progress = est.targetProgress > 0
                                    ? Math.min(100, (est.currentProgress / est.targetProgress) * 100)
                                    : 0;
                                const phaseCfg = PHASE_CONFIG[est.recoveryPhase] || PHASE_CONFIG.quarantine;
                                return (
                                    <div key={est.mailboxId} className="py-3 px-4 rounded-xl" style={{
                                        background: phaseCfg.bg, border: `1px solid ${phaseCfg.border}`,
                                    }}>
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-sm font-semibold text-gray-800">{est.mailboxEmail}</div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[0.7rem] font-bold uppercase" style={{ color: phaseCfg.color }}>
                                                    {phaseCfg.label}
                                                </span>
                                                {est.estimatedDays > 0 && (
                                                    <span className="text-xs text-gray-400">~{est.estimatedDays}d left</span>
                                                )}
                                            </div>
                                        </div>
                                        {est.recoveryPhase !== 'quarantine' ? (
                                            <div className="w-full h-[6px] bg-gray-200 rounded-full overflow-hidden">
                                                <div className="h-full rounded-full transition-[width] duration-300 ease-in-out" style={{
                                                    width: `${progress}%`,
                                                    background: phaseCfg.color,
                                                }} />
                                            </div>
                                        ) : (
                                            <div className="text-xs text-gray-400">
                                                Waiting for DNS and blacklist checks to pass
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
