'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const PHASE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string; progress: number }> = {
    paused: { label: 'Paused', color: '#991B1B', bg: '#FEF2F2', border: '#FECACA', progress: 0 },
    quarantine: { label: 'Quarantine', color: '#92400E', bg: '#FFFBEB', border: '#FDE68A', progress: 25 },
    restricted_send: { label: 'Restricted Send', color: '#1E40AF', bg: '#EFF6FF', border: '#BFDBFE', progress: 50 },
    warm_recovery: { label: 'Warm Recovery', color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0', progress: 75 },
    healthy: { label: 'Healthy', color: '#166534', bg: '#F0FDF4', border: '#BBF7D0', progress: 100 },
};

function formatDuration(ms: number): string {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    if (hours < 1) return '<1h';
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d ${hours % 24}h`;
}

function RecoveryEntityRow({
    label, phase, resilience, volumeLimit, phaseEnteredAt, cleanSends,
    cooldownUntil, bounceRate, relapseCount, consecutivePauses,
}: {
    label: string;
    phase: string;
    resilience?: number;
    volumeLimit?: number;
    phaseEnteredAt?: string;
    cleanSends?: number;
    cooldownUntil?: string;
    bounceRate?: number;
    relapseCount?: number;
    consecutivePauses?: number;
}) {
    const cfg = PHASE_CONFIG[phase] || PHASE_CONFIG.paused;
    const timeInPhase = phaseEnteredAt
        ? formatDuration(Date.now() - new Date(phaseEnteredAt).getTime())
        : null;

    const getGraduationInfo = () => {
        if (cleanSends === undefined) return null;
        switch (phase) {
            case 'paused':
                return null;
            case 'quarantine':
                return { label: 'Status', value: 'DNS Check Needed' };
            case 'restricted_send':
                const needed = (consecutivePauses || 0) > 1 ? 25 : 15;
                return { label: 'Progress', value: `${cleanSends}/${needed}`, isProgress: true };
            case 'warm_recovery':
                return { label: 'Progress', value: `${cleanSends}/50`, isProgress: true };
            default:
                return null;
        }
    };

    const [cooldownRemaining, setCooldownRemaining] = useState<string | null>(null);

    useEffect(() => {
        if (phase === 'paused' && cooldownUntil) {
            const updateCooldown = () => {
                const now = Date.now();
                const until = new Date(cooldownUntil).getTime();
                const diff = until - now;

                if (diff <= 0) {
                    setCooldownRemaining('Ready');
                } else {
                    const hours = Math.floor(diff / (1000 * 60 * 60));
                    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                    setCooldownRemaining(`${hours}h ${minutes}m`);
                }
            };

            updateCooldown();
            const interval = setInterval(updateCooldown, 60000);
            return () => clearInterval(interval);
        }
    }, [phase, cooldownUntil]);

    const getNextPhaseInfo = () => {
        switch (phase) {
            case 'paused':
                return cooldownRemaining === 'Ready' ? 'Next: Quarantine' : null;
            case 'quarantine':
                return 'Next: Restricted Send (DNS check required)';
            case 'restricted_send':
                const needed = (consecutivePauses || 0) > 1 ? 25 : 15;
                const remaining = needed - (cleanSends || 0);
                return remaining > 0
                    ? `Next: Warm Recovery (need ${remaining} more clean sends)`
                    : 'Next: Warm Recovery';
            case 'warm_recovery':
                const warmRemaining = 50 - (cleanSends || 0);
                return warmRemaining > 0
                    ? `Next: Healthy (need ${warmRemaining} more sends, 3+ days, <2% bounce)`
                    : 'Next: Healthy (3+ days required, <2% bounce)';
            default:
                return null;
        }
    };

    const graduationInfo = getGraduationInfo();
    const nextPhaseInfo = getNextPhaseInfo();

    return (
        <div className="py-[0.875rem] px-5 rounded-[14px] transition-all duration-200" style={{
            background: cfg.bg, border: `1px solid ${cfg.border}`,
        }}>
            <div className="flex items-center gap-4">
                <div className="py-1 px-[0.7rem] rounded-full text-[0.7rem] font-bold uppercase tracking-wide whitespace-nowrap" style={{
                    background: `${cfg.color}12`, border: `1px solid ${cfg.color}30`,
                    color: cfg.color,
                }}>
                    {cfg.label}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="font-bold text-slate-800 text-[0.85rem] truncate flex items-center gap-2">
                        {label}
                        {relapseCount !== undefined && relapseCount > 0 && (
                            <span className="py-[0.125rem] px-[0.4rem] rounded-full bg-[#FEF2F2] border border-[#FEE2E2] text-[#DC2626] text-[0.65rem] font-bold">
                                {relapseCount} relapse{relapseCount > 1 ? 's' : ''}
                            </span>
                        )}
                    </div>
                    <div className="mt-[0.35rem] h-1 rounded-sm bg-gray-200 overflow-hidden">
                        <div className="h-full rounded-sm transition-[width] duration-[600ms] ease-in-out" style={{
                            width: `${cfg.progress}%`,
                            background: `linear-gradient(90deg, ${cfg.color}80, ${cfg.color})`,
                        }} />
                    </div>
                </div>

                <div className="flex gap-3 shrink-0">
                    {phase === 'paused' && cooldownRemaining && (
                        <div className="text-center">
                            <div className="text-[0.6rem] text-gray-400 font-semibold uppercase">Cooldown</div>
                            <div className="text-[0.85rem] font-extrabold" style={{
                                color: cooldownRemaining === 'Ready' ? '#16A34A' : '#DC2626',
                            }}>
                                {cooldownRemaining}
                            </div>
                        </div>
                    )}

                    {graduationInfo && (
                        <div className="text-center">
                            <div className="text-[0.6rem] text-gray-400 font-semibold uppercase">
                                {graduationInfo.label}
                            </div>
                            <div className="text-[0.85rem] font-extrabold text-gray-700">
                                {graduationInfo.value}
                            </div>
                        </div>
                    )}

                    {bounceRate !== undefined && bounceRate !== null && (
                        <div className="text-center">
                            <div className="text-[0.6rem] text-gray-400 font-semibold uppercase">Bounce</div>
                            <div className="text-[0.85rem] font-extrabold" style={{
                                color: bounceRate < 0.02 ? '#16A34A' : bounceRate < 0.03 ? '#F59E0B' : '#EF4444',
                            }}>
                                {(bounceRate * 100).toFixed(1)}%
                            </div>
                        </div>
                    )}

                    {resilience !== undefined && resilience !== null && (
                        <div className="text-center">
                            <div className="text-[0.6rem] text-gray-400 font-semibold uppercase">Resilience</div>
                            <div className="text-[0.85rem] font-extrabold" style={{
                                color: resilience >= 70 ? '#16A34A' : resilience >= 30 ? '#F59E0B' : '#EF4444',
                            }}>
                                {resilience}
                            </div>
                        </div>
                    )}

                    {volumeLimit !== undefined && volumeLimit !== null && (
                        <div className="text-center">
                            <div className="text-[0.6rem] text-gray-400 font-semibold uppercase">Vol. Limit</div>
                            <div className="text-[0.85rem] font-extrabold text-gray-700">
                                {volumeLimit}%
                            </div>
                        </div>
                    )}

                    {timeInPhase && (
                        <div className="text-center">
                            <div className="text-[0.6rem] text-gray-400 font-semibold uppercase">In Phase</div>
                            <div className="text-[0.85rem] font-bold text-gray-500">
                                {timeInPhase}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {nextPhaseInfo && (
                <div className="mt-3 pt-3" style={{
                    borderTop: `1px solid ${cfg.border}`,
                }}>
                    <div className="text-[0.7rem] text-gray-500 flex items-center gap-2">
                        <span className="opacity-70">&rarr;</span>
                        <span className="font-semibold">{nextPhaseInfo}</span>
                    </div>
                </div>
            )}
        </div>
    );
}

interface RecoveryStatusPanelProps {
    recoveryData: Record<string, any> | null;
}

export default function RecoveryStatusPanel({ recoveryData }: RecoveryStatusPanelProps) {
    if (!recoveryData || !recoveryData.summary || recoveryData.summary.totalRecovering <= 0) return null;

    return (
        <div className="premium-card rounded-[20px]">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🩺 Recovery Status
                </h2>
                <div className="flex gap-2">
                    <span className="py-[0.3rem] px-3 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                        {recoveryData.summary.mailboxCount} mailboxes
                    </span>
                    <span className="py-[0.3rem] px-3 rounded-full text-xs font-semibold bg-[#F5F3FF] text-[#7C3AED] border border-[#DDD6FE]">
                        {recoveryData.summary.domainCount} domains
                    </span>
                </div>
            </div>

            {recoveryData.mailboxes && recoveryData.mailboxes.length > 0 && (
                <div className="mb-4">
                    <div className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2 pl-1">
                        Mailboxes
                    </div>
                    <div className="flex flex-col gap-2">
                        {(recoveryData.mailboxes as Array<Record<string, any>>).slice(0, 5).map((mb) => {
                            const bounceRate = mb.total_sent_count > 0
                                ? mb.hard_bounce_count / mb.total_sent_count
                                : undefined;
                            return (
                                <RecoveryEntityRow
                                    key={mb.id}
                                    label={mb.email}
                                    phase={mb.recovery_phase}
                                    resilience={mb.resilience_score}
                                    volumeLimit={mb.volumeLimit}
                                    phaseEnteredAt={mb.phase_entered_at}
                                    cleanSends={mb.clean_sends_since_phase}
                                    cooldownUntil={mb.cooldown_until}
                                    bounceRate={bounceRate}
                                    relapseCount={mb.relapse_count}
                                    consecutivePauses={mb.consecutive_pauses}
                                />
                            );
                        })}
                    </div>
                    {(recoveryData.mailboxes as Array<Record<string, any>>).length > 5 && (
                        <Link
                            href="/dashboard/mailboxes?status=quarantine,restricted_send,warm_recovery,paused"
                            className="mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                        >
                            View all {(recoveryData.mailboxes as Array<Record<string, any>>).length} mailboxes in recovery &rarr;
                        </Link>
                    )}
                </div>
            )}

            {recoveryData.domains && recoveryData.domains.length > 0 && (
                <div>
                    <div className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2 pl-1">
                        Domains
                    </div>
                    <div className="flex flex-col gap-2">
                        {(recoveryData.domains as Array<Record<string, any>>).slice(0, 5).map((d) => (
                            <RecoveryEntityRow
                                key={d.id}
                                label={d.domain}
                                phase={d.recovery_phase}
                                resilience={d.resilience_score}
                                volumeLimit={d.volumeLimit}
                                phaseEnteredAt={d.phase_entered_at}
                                cleanSends={d.clean_sends_since_phase}
                                cooldownUntil={d.cooldown_until}
                                relapseCount={d.relapse_count}
                                consecutivePauses={d.consecutive_pauses}
                            />
                        ))}
                    </div>
                    {(recoveryData.domains as Array<Record<string, any>>).length > 5 && (
                        <Link
                            href="/dashboard/domains?status=quarantine,paused"
                            className="mt-3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                        >
                            View all {(recoveryData.domains as Array<Record<string, any>>).length} domains in recovery &rarr;
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
