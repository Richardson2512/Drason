'use client';

import { useEffect, useState, useCallback } from 'react';
import { X, CheckCircle, AlertTriangle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface SyncProgress {
    step: 'campaigns' | 'mailboxes' | 'leads' | 'health_check' | 'complete';
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    current?: number;
    total?: number;
    count?: number;
    error?: string;
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
}

interface SyncProgressModalProps {
    isOpen: boolean;
    sessionId: string | null;
    onClose: () => void;
    onPauseCampaigns?: () => Promise<void>;
    onViewHealthReport?: () => void;
}

const STEP_LABELS = {
    campaigns: 'Syncing Campaigns',
    mailboxes: 'Syncing Mailboxes',
    leads: 'Syncing Leads',
    health_check: 'Running Health Check',
    complete: 'Sync Complete'
};

export default function SyncProgressModal({
    isOpen,
    sessionId,
    onClose,
    onPauseCampaigns,
    onViewHealthReport
}: SyncProgressModalProps) {
    const [progress, setProgress] = useState<Record<string, SyncProgress>>({
        campaigns: { step: 'campaigns', status: 'pending' },
        mailboxes: { step: 'mailboxes', status: 'pending' },
        leads: { step: 'leads', status: 'pending' },
        health_check: { step: 'health_check', status: 'pending' }
    });
    const [result, setResult] = useState<SyncResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [inProgressSince, setInProgressSince] = useState<Record<string, number>>({});
    const [pausingCampaigns, setPausingCampaigns] = useState(false);

    useEffect(() => {
        if (!isOpen || !sessionId) return;

        // Reset state when modal opens
        setProgress({
            campaigns: { step: 'campaigns', status: 'pending' },
            mailboxes: { step: 'mailboxes', status: 'pending' },
            leads: { step: 'leads', status: 'pending' },
            health_check: { step: 'health_check', status: 'pending' }
        });
        setResult(null);
        setError(null);
        setIsComplete(false);

        // Connect to SSE endpoint (use relative URL like apiClient does)
        let retryCount = 0;
        const MAX_RETRIES = 3;
        let completed = false;

        const eventSource = new EventSource(`/api/sync-progress/${sessionId}`);

        eventSource.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'progress') {
                retryCount = 0; // Reset on successful message

                // If transitioning TO in_progress, record the time
                if (data.status === 'in_progress') {
                    setInProgressSince(prev => ({ ...prev, [data.step]: Date.now() }));
                    setProgress(prev => ({
                        ...prev,
                        [data.step]: {
                            step: data.step,
                            status: data.status,
                            current: data.current,
                            total: data.total,
                            count: data.count
                        }
                    }));
                } else if (data.status === 'completed') {
                    // Ensure minimum 1.5s visibility of in_progress state
                    const MIN_DISPLAY_MS = 1500;
                    setInProgressSince(prev => {
                        const startedAt = prev[data.step];
                        const elapsed = startedAt ? Date.now() - startedAt : MIN_DISPLAY_MS;
                        const delay = Math.max(0, MIN_DISPLAY_MS - elapsed);

                        setTimeout(() => {
                            setProgress(p => ({
                                ...p,
                                [data.step]: {
                                    step: data.step,
                                    status: 'completed',
                                    current: data.current,
                                    total: data.total,
                                    count: data.count
                                }
                            }));
                        }, delay);

                        return prev;
                    });
                } else {
                    setProgress(prev => ({
                        ...prev,
                        [data.step]: {
                            step: data.step,
                            status: data.status,
                            current: data.current,
                            total: data.total,
                            count: data.count
                        }
                    }));
                }
            } else if (data.type === 'complete') {
                completed = true;
                setResult(data.result);
                setIsComplete(true);
                eventSource.close();
            } else if (data.type === 'error') {
                completed = true;
                setError(data.error);
                setIsComplete(true);
                eventSource.close();
            }
        };

        eventSource.onerror = () => {
            // Don't show error if sync already completed
            if (completed) {
                eventSource.close();
                return;
            }

            retryCount++;
            if (retryCount >= MAX_RETRIES) {
                setError('Connection lost. Please refresh to see latest status.');
                setIsComplete(true);
                eventSource.close();
            }
            // Otherwise, EventSource will auto-reconnect
        };

        return () => {
            completed = true;
            eventSource.close();
        };
    }, [isOpen, sessionId]);

    const handlePauseCampaigns = async () => {
        if (!onPauseCampaigns) return;
        setPausingCampaigns(true);
        try {
            await onPauseCampaigns();
        } finally {
            setPausingCampaigns(false);
        }
    };

    const getStepIcon = (stepProgress: SyncProgress) => {
        switch (stepProgress.status) {
            case 'completed':
                return <CheckCircle className="text-green-600" size={20} />;
            case 'in_progress':
                return <Loader2 className="text-blue-600 animate-spin" size={20} />;
            case 'failed':
                return <XCircle className="text-red-600" size={20} />;
            default:
                return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
        }
    };

    const getProgressText = (stepProgress: SyncProgress) => {
        if (stepProgress.status === 'completed' && stepProgress.count !== undefined) {
            return `${stepProgress.count} synced`;
        }
        if (stepProgress.status === 'completed' && stepProgress.step === 'health_check') {
            return 'Done';
        }
        if (stepProgress.status === 'in_progress' && stepProgress.current && stepProgress.total) {
            return `${stepProgress.current}/${stepProgress.total}`;
        }
        if (stepProgress.status === 'in_progress' && stepProgress.step === 'health_check') {
            return 'Analyzing...';
        }
        return '';
    };

    const hasCriticalHealthIssues = result?.health_check?.has_critical_issues;
    const overallScore = result?.health_check?.overall_score ?? 0;

    if (!isOpen) return null;

    return (
        <>
            <style>{`
            @keyframes indeterminate {
                0% { transform: translateX(-100%); }
                50% { transform: translateX(150%); }
                100% { transform: translateX(-100%); }
            }
        `}</style>
            <div
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                onClick={onClose}
            >
                <div
                    className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isComplete ? 'Sync Complete' : 'Syncing Smartlead Data'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            title="Close"
                        >
                            <X size={24} />
                        </button>
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
                                <div className="space-y-4 mb-6">
                                    {Object.entries(progress).map(([key, stepProgress]) => (
                                        <div key={key} className="flex items-center gap-4">
                                            {getStepIcon(stepProgress)}
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className={`font-medium ${stepProgress.status === 'in_progress' ? 'text-blue-600' :
                                                        stepProgress.status === 'completed' ? 'text-gray-900' :
                                                            'text-gray-400'
                                                        }`}>
                                                        {STEP_LABELS[stepProgress.step]}
                                                    </span>
                                                    <span className="text-sm text-gray-500">
                                                        {getProgressText(stepProgress)}
                                                    </span>
                                                </div>
                                                {stepProgress.status === 'in_progress' && (
                                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                                        {stepProgress.total ? (
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                                style={{ width: `${(stepProgress.current! / stepProgress.total) * 100}%` }}
                                                            />
                                                        ) : (
                                                            <div
                                                                className="bg-blue-600 h-2 rounded-full"
                                                                style={{
                                                                    width: '40%',
                                                                    animation: 'indeterminate 1.5s ease-in-out infinite'
                                                                }}
                                                            />
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
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
                                                <p className="text-red-700 mb-4">
                                                    We detected {result.health_check?.critical_findings?.length || 0} critical issue(s)
                                                    that could impact your email deliverability. Consider pausing campaigns until these are resolved.
                                                </p>
                                                <div className="flex gap-3">
                                                    {onPauseCampaigns && (
                                                        <button
                                                            onClick={handlePauseCampaigns}
                                                            disabled={pausingCampaigns}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
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
                                            All data synced successfully. Infrastructure health score: <span className="font-bold">{overallScore}/100</span>
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
        </>
    );
}
