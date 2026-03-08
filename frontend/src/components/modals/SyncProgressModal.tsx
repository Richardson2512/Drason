'use client';

import { useEffect, useState, useRef } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Loader2 } from 'lucide-react';

interface PostSyncSummary {
    mailboxes: Record<string, number>;
    domains: Record<string, number>;
    leads: Record<string, number>;
}

interface SyncResult {
    campaigns_synced: number;
    mailboxes_synced: number;
    leads_synced: number;
    health_check?: {
        overall_score: number;
        critical_findings: any[];
        has_critical_issues: boolean;
    };
    post_sync_summary?: PostSyncSummary;
}

interface SyncProgressModalProps {
    isOpen: boolean;
    sessionId: string | null;
    onClose: () => void;
    onPauseCampaigns?: () => Promise<void>;
    onViewHealthReport?: () => void;
    externalError?: string | null;
    externalResult?: SyncResult | null;
}

const STEPS = ['campaigns', 'mailboxes', 'leads', 'health_check'] as const;
type Step = typeof STEPS[number];

const STEP_CONFIG: Record<Step, { label: string; activeLabel: string; icon: string }> = {
    campaigns: { label: 'Campaigns', activeLabel: 'Syncing Campaigns...', icon: '📊' },
    mailboxes: { label: 'Mailboxes', activeLabel: 'Syncing Mailboxes...', icon: '📬' },
    leads: { label: 'Leads', activeLabel: 'Syncing Leads...', icon: '👥' },
    health_check: { label: 'Health Check', activeLabel: 'Running Health Check...', icon: '🔍' },
};

// Estimated duration per step in ms (campaigns take longest due to analytics fetch)
const STEP_DURATIONS: Record<Step, number> = {
    campaigns: 25000,
    mailboxes: 20000,
    leads: 30000,
    health_check: 15000,
};

export default function SyncProgressModal({
    isOpen,
    sessionId,
    onClose,
    onPauseCampaigns,
    onViewHealthReport,
    externalError,
    externalResult
}: SyncProgressModalProps) {
    const [activeStepIndex, setActiveStepIndex] = useState(0);
    const [stepProgress, setStepProgress] = useState(0); // 0-100 for current step
    const [result, setResult] = useState<SyncResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [pausingCampaigns, setPausingCampaigns] = useState(false);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);

    // Reset state when modal opens
    useEffect(() => {
        if (isOpen && sessionId) {
            setActiveStepIndex(0);
            setStepProgress(0);
            setResult(null);
            setError(null);
            setIsComplete(false);
            startTimeRef.current = Date.now();

            // Start the simulated progress timer
            timerRef.current = setInterval(() => {
                const elapsed = Date.now() - startTimeRef.current;
                let cumulative = 0;

                // Find which step we should be on based on elapsed time
                for (let i = 0; i < STEPS.length; i++) {
                    const duration = STEP_DURATIONS[STEPS[i]];
                    if (elapsed < cumulative + duration) {
                        const stepElapsed = elapsed - cumulative;
                        const pct = Math.min(95, (stepElapsed / duration) * 100);
                        setActiveStepIndex(i);
                        setStepProgress(pct);
                        return;
                    }
                    cumulative += duration;
                }

                // If we've exceeded all estimated durations, stay on last step at 95%
                setActiveStepIndex(STEPS.length - 1);
                setStepProgress(95);
            }, 200);

            return () => {
                if (timerRef.current) clearInterval(timerRef.current);
            };
        }
    }, [isOpen, sessionId]);

    // Handle external error
    useEffect(() => {
        if (externalError) {
            if (timerRef.current) clearInterval(timerRef.current);
            setError(externalError);
            setIsComplete(true);
        }
    }, [externalError]);

    // Handle external result (HTTP response)
    useEffect(() => {
        if (externalResult && !isComplete) {
            if (timerRef.current) clearInterval(timerRef.current);
            // Snap all steps to complete
            setActiveStepIndex(STEPS.length);
            setStepProgress(100);
            setResult(externalResult);
            setIsComplete(true);
        }
    }, [externalResult, isComplete]);

    const handlePauseCampaigns = async () => {
        if (!onPauseCampaigns) return;
        setPausingCampaigns(true);
        try {
            await onPauseCampaigns();
        } finally {
            setPausingCampaigns(false);
        }
    };

    const getStepStatus = (index: number): 'completed' | 'in_progress' | 'pending' => {
        if (isComplete && !error) return 'completed';
        if (index < activeStepIndex) return 'completed';
        if (index === activeStepIndex) return 'in_progress';
        return 'pending';
    };

    const getStepIcon = (index: number) => {
        const status = getStepStatus(index);
        switch (status) {
            case 'completed':
                return <CheckCircle className="text-green-600" size={22} />;
            case 'in_progress':
                return <Loader2 className="text-blue-600 animate-spin" size={22} />;
            default:
                return <div className="w-[22px] h-[22px] rounded-full border-2 border-gray-300" />;
        }
    };

    const getResultCount = (step: Step): string | null => {
        if (!result) return null;
        switch (step) {
            case 'campaigns': return `${result.campaigns_synced} synced`;
            case 'mailboxes': return `${result.mailboxes_synced} synced`;
            case 'leads': return `${result.leads_synced} synced`;
            case 'health_check': {
                const score = result.health_check?.overall_score;
                return score ? `Score: ${score}/100` : 'Done';
            }
        }
    };

    const hasCriticalHealthIssues = result?.health_check?.has_critical_issues;
    const overallScore = result?.health_check?.overall_score ?? 0;

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={isComplete ? onClose : undefined}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {error ? 'Sync Failed' : isComplete ? 'Sync Complete' : 'Syncing Platform Data'}
                    </h2>
                    {isComplete && (
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            <X size={24} />
                        </button>
                    )}
                </div>

                {/* Content */}
                <div className="p-6">
                    {error ? (
                        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                            <XCircle className="mx-auto text-red-600 mb-4" size={48} />
                            <h3 className="text-xl font-bold text-red-900 mb-2">Sync Failed</h3>
                            <p className="text-red-700">{error}</p>
                        </div>
                    ) : (
                        <>
                            {/* Progress Steps */}
                            <div className="space-y-3 mb-6">
                                {STEPS.map((step, index) => {
                                    const status = getStepStatus(index);
                                    const config = STEP_CONFIG[step];
                                    const resultCount = isComplete ? getResultCount(step) : null;

                                    return (
                                        <div key={step} className="flex items-center gap-4">
                                            {getStepIcon(index)}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`font-medium text-sm ${
                                                        status === 'in_progress' ? 'text-blue-700' :
                                                        status === 'completed' ? 'text-gray-900' :
                                                        'text-gray-400'
                                                    }`}>
                                                        {status === 'in_progress' ? config.activeLabel : config.label}
                                                    </span>
                                                    {resultCount && (
                                                        <span className="text-sm font-medium text-green-600">
                                                            {resultCount}
                                                        </span>
                                                    )}
                                                </div>
                                                {/* Progress bar for active step */}
                                                {status === 'in_progress' && (
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                                                            style={{ width: `${stepProgress}%` }}
                                                        />
                                                    </div>
                                                )}
                                                {/* Completed bar */}
                                                {status === 'completed' && (
                                                    <div className="w-full bg-green-100 rounded-full h-2">
                                                        <div className="bg-green-500 h-2 rounded-full w-full" />
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Results Summary */}
                            {isComplete && result && (
                                <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                    <h3 className="font-bold text-gray-900 mb-4">Sync Summary</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-purple-600">
                                                {result.campaigns_synced}
                                            </div>
                                            <div className="text-sm text-gray-600">Campaigns</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-blue-600">
                                                {result.mailboxes_synced}
                                            </div>
                                            <div className="text-sm text-gray-600">Mailboxes</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-3xl font-bold text-green-600">
                                                {result.leads_synced}
                                            </div>
                                            <div className="text-sm text-gray-600">Leads</div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Post-Sync Entity Status Breakdown */}
                            {isComplete && result?.post_sync_summary && (() => {
                                const summary = result.post_sync_summary;
                                const score = result.health_check?.overall_score ?? 0;
                                const scoreColor = score >= 80 ? '#16A34A' : score >= 60 ? '#D97706' : '#DC2626';

                                const StatusBar = ({ label, data, colors }: { label: string; data: Record<string, number>; colors: Record<string, string> }) => {
                                    const total = Object.values(data).reduce((a, b) => a + b, 0);
                                    if (total === 0) return null;
                                    return (
                                        <div className="mb-4">
                                            <div className="flex items-center justify-between mb-1.5">
                                                <span className="text-sm font-medium text-gray-700">{label}</span>
                                                <span className="text-xs text-gray-500">{total} total</span>
                                            </div>
                                            <div className="flex h-5 rounded-full overflow-hidden bg-gray-100">
                                                {Object.entries(data).map(([key, count]) => {
                                                    if (count === 0) return null;
                                                    const pct = (count / total) * 100;
                                                    return (
                                                        <div
                                                            key={key}
                                                            className="flex items-center justify-center text-[10px] font-bold text-white"
                                                            style={{ width: `${pct}%`, backgroundColor: colors[key] || '#9CA3AF', minWidth: count > 0 ? '24px' : 0 }}
                                                            title={`${key}: ${count}`}
                                                        >
                                                            {count}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                            <div className="flex gap-3 mt-1.5">
                                                {Object.entries(data).map(([key, count]) => (
                                                    <span key={key} className="flex items-center gap-1 text-[11px] text-gray-500">
                                                        <span className="w-2 h-2 rounded-full inline-block" style={{ backgroundColor: colors[key] || '#9CA3AF' }} />
                                                        {key}: {count}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                };

                                return (
                                    <div className="bg-gray-50 rounded-xl p-6 mb-6">
                                        <h3 className="font-bold text-gray-900 mb-4">Infrastructure Status</h3>
                                        {score > 0 && (
                                            <div className="mb-5">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-medium text-gray-700">Health Score</span>
                                                    <span className="text-sm font-bold" style={{ color: scoreColor }}>{score}/100</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                                                    <div className="h-3 rounded-full transition-all" style={{ width: `${score}%`, backgroundColor: scoreColor }} />
                                                </div>
                                            </div>
                                        )}
                                        <StatusBar
                                            label="Mailboxes"
                                            data={summary.mailboxes}
                                            colors={{ healthy: '#16A34A', warning: '#D97706', paused: '#DC2626' }}
                                        />
                                        <StatusBar
                                            label="Domains"
                                            data={summary.domains}
                                            colors={{ healthy: '#16A34A', warning: '#D97706', paused: '#DC2626' }}
                                        />
                                        <StatusBar
                                            label="Leads"
                                            data={summary.leads}
                                            colors={{ active: '#16A34A', held: '#D97706', blocked: '#DC2626' }}
                                        />
                                    </div>
                                );
                            })()}

                            {/* Health Warning */}
                            {isComplete && hasCriticalHealthIssues && (
                                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6">
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="text-red-600 flex-shrink-0" size={32} />
                                        <div className="flex-1">
                                            <h3 className="text-xl font-bold text-red-900 mb-2">
                                                Critical Health Issues Detected
                                            </h3>
                                            <p className="text-red-700 mb-4">
                                                Infrastructure score: <span className="font-bold">{overallScore}/100</span>
                                            </p>
                                            <div className="flex gap-3">
                                                {onPauseCampaigns && (
                                                    <button
                                                        onClick={handlePauseCampaigns}
                                                        disabled={pausingCampaigns}
                                                        className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                                                    >
                                                        {pausingCampaigns ? (
                                                            <>
                                                                <Loader2 className="animate-spin" size={16} />
                                                                Pausing...
                                                            </>
                                                        ) : (
                                                            'Pause All Campaigns'
                                                        )}
                                                    </button>
                                                )}
                                                {onViewHealthReport && (
                                                    <button
                                                        onClick={onViewHealthReport}
                                                        className="px-4 py-2 bg-white border border-red-300 text-red-700 rounded-lg font-medium hover:bg-red-50 transition-colors"
                                                    >
                                                        View Health Report
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Success Message */}
                            {isComplete && !hasCriticalHealthIssues && result && (
                                <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                                    <CheckCircle className="mx-auto text-green-600 mb-4" size={48} />
                                    <h3 className="text-xl font-bold text-green-900 mb-2">Sync Successful!</h3>
                                    <p className="text-green-700">
                                        All data synced successfully.
                                        {overallScore > 0 && (
                                            <> Infrastructure health score: <span className="font-bold">{overallScore}/100</span></>
                                        )}
                                    </p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Footer */}
                {isComplete && (
                    <div className="flex justify-end gap-3 p-6 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                        >
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
