'use client';
import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';

interface ValidationAttempt {
    id: string;
    email: string;
    source: string;
    status: string;
    score: number;
    details: any;
    duration_ms: number | null;
    created_at: string;
}

interface ValidationSummary {
    total: number;
    valid: number;
    risky: number;
    invalid: number;
    unknown: number;
}

interface ValidationActivityData {
    summary: ValidationSummary;
    activity: ValidationAttempt[];
}

function getStatusIcon(status: string) {
    switch (status) {
        case 'valid': return { icon: '✓', bg: '#DCFCE7', color: '#166534' };
        case 'risky': return { icon: '!', bg: '#FEF3C7', color: '#92400E' };
        case 'invalid': return { icon: '✕', bg: '#FEE2E2', color: '#991B1B' };
        case 'unknown': return { icon: '?', bg: '#FFF7ED', color: '#C2410C' };
        default: return { icon: '·', bg: '#F3F4F6', color: '#6B7280' };
    }
}

function timeAgo(dateStr: string) {
    const ms = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(ms / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
}

interface ValidationActivityPanelProps {
    isExpanded: boolean;
    onToggle: () => void;
}

export default function ValidationActivityPanel({ isExpanded, onToggle }: ValidationActivityPanelProps) {
    const [data, setData] = useState<ValidationActivityData | null>(null);
    const [loading, setLoading] = useState(true);

    const fetchActivity = useCallback(async () => {
        try {
            const result = await apiClient<ValidationActivityData>('/api/dashboard/validation-activity?limit=15');
            // Handle both wrapped and unwrapped response
            const activityData = (result as any)?.data || result;
            if (activityData?.summary) {
                setData(activityData);
            }
        } catch {
            // Silent — validation activity is supplementary
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchActivity();
        // Auto-refresh every 30 seconds to show new validations
        const interval = setInterval(fetchActivity, 30000);
        return () => clearInterval(interval);
    }, [fetchActivity]);

    if (loading || !data || data.summary.total === 0) return null;

    const { summary, activity } = data;
    const passRate = summary.total > 0 ? Math.round((summary.valid / summary.total) * 100) : 0;

    return (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {/* Header — always visible */}
            <button
                onClick={onToggle}
                className="w-full px-4 py-3 flex items-center justify-between bg-transparent border-none cursor-pointer hover:bg-gray-50 transition-colors"
            >
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-200 flex items-center justify-center">
                        <span className="text-blue-600 text-sm font-bold">V</span>
                    </div>
                    <div className="text-left">
                        <div className="text-sm font-semibold text-gray-900">Email Validation</div>
                        <div className="text-xs text-gray-500">{summary.total} validated (24h) · {passRate}% pass rate</div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {summary.invalid > 0 && (
                        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-red-50 text-red-600 border border-red-200">
                            {summary.invalid} blocked
                        </span>
                    )}
                    {summary.risky > 0 && (
                        <span className="text-[0.65rem] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                            {summary.risky} risky
                        </span>
                    )}
                    <span className={`text-gray-400 text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▾
                    </span>
                </div>
            </button>

            {/* Expanded: Summary bar + activity feed */}
            {isExpanded && (
                <div className="border-t border-gray-100">
                    {/* Summary bar */}
                    <div className="px-4 py-3 flex items-center gap-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-xs font-semibold text-gray-600">{summary.valid} valid</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-amber-500" />
                            <span className="text-xs font-semibold text-gray-600">{summary.risky} risky</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500" />
                            <span className="text-xs font-semibold text-gray-600">{summary.invalid} invalid</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className="text-xs font-semibold text-gray-600">{summary.unknown} unknown</span>
                        </div>
                        {/* Visual progress bar */}
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden flex">
                            {summary.valid > 0 && <div className="bg-green-500 h-full" style={{ width: `${(summary.valid / summary.total) * 100}%` }} />}
                            {summary.risky > 0 && <div className="bg-amber-400 h-full" style={{ width: `${(summary.risky / summary.total) * 100}%` }} />}
                            {summary.invalid > 0 && <div className="bg-red-500 h-full" style={{ width: `${(summary.invalid / summary.total) * 100}%` }} />}
                            {summary.unknown > 0 && <div className="bg-gray-400 h-full" style={{ width: `${(summary.unknown / summary.total) * 100}%` }} />}
                        </div>
                    </div>

                    {/* Tier-gating info */}
                    <div className="px-4 py-2 text-xs text-gray-400 leading-relaxed">
                        Starter plans use internal validation (syntax, MX, disposable checks). Growth and Scale plans additionally use MillionVerifier API for risky leads.
                    </div>

                    {/* Activity feed */}
                    <div className="max-h-[280px] overflow-y-auto divide-y divide-gray-50">
                        {activity.map(a => {
                            const st = getStatusIcon(a.status);
                            return (
                                <div key={a.id} className="px-4 py-2.5 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                    <div
                                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                                        style={{ background: st.bg, color: st.color }}
                                    >
                                        {st.icon}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-900 font-medium truncate">{a.email}</div>
                                        <div className="text-xs text-gray-400 flex items-center gap-2">
                                            <span className="capitalize">{a.source}</span>
                                            {a.score >= 0 && <span>· {a.score}/100</span>}
                                            {a.duration_ms && <span>· {a.duration_ms}ms</span>}
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <div className="text-[0.65rem] font-bold uppercase" style={{ color: st.color }}>
                                            {a.status}
                                        </div>
                                        <div className="text-[0.6rem] text-gray-400">{timeAgo(a.created_at)}</div>
                                    </div>
                                </div>
                            );
                        })}
                        {activity.length === 0 && (
                            <div className="px-4 py-8 text-center text-gray-400 text-sm">
                                No validation activity yet. Leads will appear here as they are ingested.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
