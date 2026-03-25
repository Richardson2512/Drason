'use client';
import Link from 'next/link';

interface WarmupProgressPanelProps {
    warmupData: Record<string, any> | null;
    onCheckNow: () => Promise<void>;
    warmupChecking: boolean;
    checkResult?: { checked: number; graduated: number; errors: number } | null;
}

export default function WarmupProgressPanel({ warmupData, onCheckNow, warmupChecking, checkResult }: WarmupProgressPanelProps) {
    if (!warmupData || warmupData.totalRecovering <= 0) return null;

    return (
        <div className="premium-card rounded-[20px]">
            <div className="flex justify-between items-center mb-5">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🔥 Warmup Progress
                </h2>
                <div className="flex gap-3 items-center">
                    <div className="flex gap-2">
                        {warmupData.quarantine > 0 && (
                            <span className="py-[0.3rem] px-3 rounded-full text-xs font-semibold bg-[#FEF2F2] text-[#DC2626] border border-[#FCA5A5]">
                                {warmupData.quarantine} quarantine
                            </span>
                        )}
                        {warmupData.restrictedSend > 0 && (
                            <span className="py-[0.3rem] px-3 rounded-full text-xs font-semibold bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]">
                                {warmupData.restrictedSend} restricted
                            </span>
                        )}
                        {warmupData.warmRecovery > 0 && (
                            <span className="py-[0.3rem] px-3 rounded-full text-xs font-semibold bg-[#EFF6FF] text-[#2563EB] border border-[#BFDBFE]">
                                {warmupData.warmRecovery} warm recovery
                            </span>
                        )}
                    </div>
                    <button
                        onClick={onCheckNow}
                        disabled={warmupChecking}
                        className="py-[0.4rem] px-3 text-[#475569] border border-slate-200 rounded-lg text-xs font-semibold transition-all duration-200"
                        style={{
                            background: warmupChecking ? '#E5E7EB' : '#F8FAFC',
                            cursor: warmupChecking ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {warmupChecking ? 'Checking...' : 'Check Now'}
                    </button>
                </div>
            </div>

            {/* Check Result Banner */}
            {checkResult && (
                <div className={`mb-4 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-3 ${
                    checkResult.errors > 0
                        ? 'bg-red-50 border border-red-200 text-red-800'
                        : checkResult.graduated > 0
                        ? 'bg-green-50 border border-green-200 text-green-800'
                        : 'bg-blue-50 border border-blue-200 text-blue-800'
                }`}>
                    <span className="text-lg">
                        {checkResult.errors > 0 ? '⚠️' : checkResult.graduated > 0 ? '🎓' : 'ℹ️'}
                    </span>
                    <div>
                        <div className="font-bold">
                            {checkResult.errors > 0
                                ? 'Check completed with errors'
                                : checkResult.graduated > 0
                                ? `${checkResult.graduated} mailbox${checkResult.graduated > 1 ? 'es' : ''} graduated!`
                                : 'No mailboxes ready to graduate yet'
                            }
                        </div>
                        <div className="text-xs opacity-75 mt-0.5">
                            Checked {checkResult.checked} mailbox{checkResult.checked !== 1 ? 'es' : ''} in the healing pipeline
                            {checkResult.graduated > 0 && ` · ${checkResult.graduated} moved to next phase`}
                            {checkResult.errors > 0 && ` · ${checkResult.errors} error${checkResult.errors > 1 ? 's' : ''}`}
                        </div>
                    </div>
                </div>
            )}

            {warmupData.avgDaysInRecovery > 0 && (
                <div className="text-sm text-slate-500 mb-4">
                    Average time in recovery: <strong>{warmupData.avgDaysInRecovery} days</strong>
                </div>
            )}

            {warmupData.estimatedGraduations && warmupData.estimatedGraduations.length > 0 && (
                <div className="flex flex-col gap-2">
                    {(warmupData.estimatedGraduations as Array<Record<string, any>>).slice(0, 5).map((est) => {
                        const progress = est.targetProgress > 0 ? Math.min(100, (est.currentProgress / est.targetProgress) * 100) : 0;
                        const phaseLabel = est.recoveryPhase === 'quarantine' ? 'Quarantine' :
                            est.recoveryPhase === 'restricted_send' ? 'Restricted Send' : 'Warm Recovery';
                        const phaseColor = est.recoveryPhase === 'quarantine' ? '#DC2626' :
                            est.recoveryPhase === 'restricted_send' ? '#D97706' : '#2563EB';
                        return (
                            <div key={est.mailboxId} className="py-3 px-4 bg-slate-50 rounded-xl border border-slate-100">
                                <div className="flex justify-between items-center mb-2">
                                    <div className="text-sm font-semibold text-slate-800">
                                        {est.mailboxEmail}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[0.7rem] font-bold uppercase" style={{ color: phaseColor }}>
                                            {phaseLabel}
                                        </span>
                                        {est.estimatedDays > 0 && (
                                            <span className="text-xs text-slate-400">
                                                ~{est.estimatedDays}d left
                                            </span>
                                        )}
                                    </div>
                                </div>
                                {est.recoveryPhase !== 'quarantine' && (
                                    <div className="w-full h-[6px] bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full rounded-full transition-[width] duration-300 ease-in-out" style={{
                                            width: `${progress}%`,
                                            background: phaseColor,
                                        }} />
                                    </div>
                                )}
                                {est.recoveryPhase === 'quarantine' && (
                                    <div className="text-xs text-slate-400">
                                        Waiting for DNS/blacklist checks to pass
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    {(warmupData.estimatedGraduations as Array<Record<string, any>>).length > 5 && (
                        <Link
                            href="/dashboard/mailboxes?status=quarantine,restricted_send,warm_recovery"
                            className="mt-2 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-100 hover:text-gray-800 transition-colors"
                        >
                            View all {(warmupData.estimatedGraduations as Array<Record<string, any>>).length} mailboxes in warmup &rarr;
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
