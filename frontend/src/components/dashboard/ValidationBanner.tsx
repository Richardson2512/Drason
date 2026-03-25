'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';

interface ValidationSummary {
    total: number;
    valid: number;
    risky: number;
    invalid: number;
    unknown: number;
}

interface ValidationEvent {
    id: string;
    email: string;
    status: string;
    score: number | null;
    created_at: string;
}

type BannerState = 'hidden' | 'validating' | 'complete';

export default function ValidationBanner() {
    const [state, setState] = useState<BannerState>('hidden');
    const [summary, setSummary] = useState<ValidationSummary>({ total: 0, valid: 0, risky: 0, invalid: 0, unknown: 0 });
    const [prevTotal, setPrevTotal] = useState<number>(0);
    const [dismissed, setDismissed] = useState(false);
    const [newBatchCount, setNewBatchCount] = useState(0);

    const checkActivity = useCallback(async () => {
        try {
            const data = await apiClient<{ summary: ValidationSummary; activity: ValidationEvent[] }>('/api/dashboard/validation-activity');
            if (!data?.summary) return;

            const currentTotal = data.summary.total;

            if (currentTotal > prevTotal && prevTotal > 0) {
                // New validations detected
                const newCount = currentTotal - prevTotal;
                setNewBatchCount(newCount);
                setSummary(data.summary);
                setState('validating');
                setDismissed(false);

                // After 3 seconds, switch to complete
                setTimeout(() => {
                    setState('complete');
                }, 3000);
            } else if (currentTotal > 0 && prevTotal === 0) {
                // First load — set baseline, don't show banner
                setPrevTotal(currentTotal);
                setSummary(data.summary);
                return;
            }

            setPrevTotal(currentTotal);
        } catch {
            // Silent fail
        }
    }, [prevTotal]);

    // Poll every 30 seconds
    useEffect(() => {
        checkActivity();
        const interval = setInterval(checkActivity, 30000);
        return () => clearInterval(interval);
    }, [checkActivity]);

    // Auto-dismiss after 15 seconds
    useEffect(() => {
        if (state === 'complete') {
            const timeout = setTimeout(() => setDismissed(true), 15000);
            return () => clearTimeout(timeout);
        }
    }, [state]);

    if (dismissed || state === 'hidden') return null;

    return (
        <div className="sticky top-0 z-30 shadow-sm" style={{
            background: state === 'validating'
                ? 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)'
                : summary.invalid > 0
                    ? 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)'
                    : 'linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)',
            borderBottom: state === 'validating'
                ? '2px solid #3B82F6'
                : summary.invalid > 0
                    ? '2px solid #EF4444'
                    : '2px solid #10B981',
            padding: '0.75rem 1.5rem',
        }}>
            <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    {state === 'validating' ? (
                        <>
                            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin shrink-0" />
                            <div>
                                <p className="m-0 text-sm font-bold text-blue-800">
                                    Validating {newBatchCount} new lead{newBatchCount !== 1 ? 's' : ''}...
                                </p>
                                <p className="m-0 text-xs text-blue-600 mt-0.5">
                                    Checking email validity before routing to campaigns
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <span className="text-lg shrink-0">
                                {summary.invalid > 0 ? '🛡️' : '✅'}
                            </span>
                            <div>
                                <p className="m-0 text-sm font-bold" style={{
                                    color: summary.invalid > 0 ? '#991B1B' : '#065F46'
                                }}>
                                    {newBatchCount} lead{newBatchCount !== 1 ? 's' : ''} validated
                                    {summary.invalid > 0 && ` — ${summary.invalid} blocked`}
                                </p>
                                <p className="m-0 text-xs mt-0.5 flex items-center gap-3" style={{
                                    color: summary.invalid > 0 ? '#7F1D1D' : '#047857'
                                }}>
                                    <span className="inline-flex items-center gap-1">
                                        <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
                                        {summary.valid} valid
                                    </span>
                                    {summary.risky > 0 && (
                                        <span className="inline-flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                                            {summary.risky} risky
                                        </span>
                                    )}
                                    {summary.invalid > 0 && (
                                        <span className="inline-flex items-center gap-1">
                                            <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                                            {summary.invalid} invalid
                                        </span>
                                    )}
                                    <Link
                                        href="/dashboard/leads?status=invalid"
                                        className="text-xs font-semibold underline ml-1"
                                        style={{ color: summary.invalid > 0 ? '#991B1B' : '#065F46' }}
                                    >
                                        View details →
                                    </Link>
                                </p>
                            </div>
                        </>
                    )}
                </div>
                <button
                    onClick={() => setDismissed(true)}
                    className="bg-transparent border-none cursor-pointer text-lg p-1 flex items-center justify-center rounded w-7 h-7 shrink-0 opacity-60 hover:opacity-100 transition-opacity"
                    style={{
                        color: state === 'validating' ? '#1E40AF' : summary.invalid > 0 ? '#991B1B' : '#065F46'
                    }}
                    title="Dismiss"
                >
                    ✕
                </button>
            </div>
        </div>
    );
}
