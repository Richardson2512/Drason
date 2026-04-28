'use client';

import { useState, useMemo } from 'react';
import { X, AlertTriangle, Activity, Mail, MousePointer, MessageCircle, Ban, Loader2 } from 'lucide-react';

/**
 * Dual-Enrollment Detection Modal
 *
 * Shown when the operator is about to add leads to a campaign and one or more
 * of those leads is already enrolled in another campaign in the same org.
 *
 * Mirrors the Smartlead/Instantly pattern:
 *  - Show a per-lead breakdown of where the lead currently is (campaign, step,
 *    last sent) and any historical engagement (opens/clicks/replies).
 *  - Default toggle ON: exclude leads currently active/paused in another
 *    campaign. Operator can flip OFF for intentional dual-enrollment
 *    (e.g., BDR → AE handoff).
 *  - Org-wide suppressed leads (bounced / unsubscribed) are ALWAYS excluded
 *    regardless of toggle (CAN-SPAM / GDPR).
 *
 * Pagination is client-side: backend returns the full conflict list, we render
 * the first 100 rows with "show more" expansion.
 */

const PAGE_SIZE = 100;

export interface CampaignConflict {
    campaign_id: string;
    campaign_name: string;
    campaign_status: string;
    enrollment_status: string;
    current_step: number;
    last_sent_at: string | null;
    next_send_at: string | null;
    opened_count: number;
    clicked_count: number;
    replied_at: string | null;
    enrolled_at: string;
    kind: 'active' | 'historical';
}

export interface LeadConflictRecord {
    lead_id: string;
    email: string;
    activeConflicts: CampaignConflict[];
    historicalConflicts: CampaignConflict[];
    suppressed: boolean;
    suppressedReason: string | null;
}

export interface DualEnrollmentReport {
    totalLeads: number;
    activeConflictCount: number;
    historicalConflictCount: number;
    suppressedCount: number;
    cleanCount: number;
    leads: LeadConflictRecord[];
}

interface DualEnrollmentModalProps {
    open: boolean;
    campaignName: string;
    report: DualEnrollmentReport;
    submitting: boolean;
    onConfirm: (excludeDualEnrolled: boolean) => void | Promise<void>;
    onCancel: () => void;
}

export function DualEnrollmentModal({
    open,
    campaignName,
    report,
    submitting,
    onConfirm,
    onCancel,
}: DualEnrollmentModalProps) {
    // Default ON — safer for cold-email reputation (Smartlead/Instantly default)
    const [excludeDualEnrolled, setExcludeDualEnrolled] = useState(true);
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    // Only show leads that have any conflict or are suppressed.
    // Clean leads aren't worth surface area in the modal.
    const conflictLeads = useMemo(
        () => report.leads.filter(l =>
            l.activeConflicts.length > 0 ||
            l.historicalConflicts.length > 0 ||
            l.suppressed
        ),
        [report.leads]
    );

    const visibleLeads = conflictLeads.slice(0, visibleCount);
    const hasMore = visibleCount < conflictLeads.length;

    // What the toggle actually excludes when applied to commit
    const willExclude = useMemo(() => {
        let count = report.suppressedCount;  // always excluded
        if (excludeDualEnrolled) count += report.activeConflictCount;
        return count;
    }, [excludeDualEnrolled, report]);

    const willEnroll = report.totalLeads - willExclude;

    if (!open) return null;

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl w-full max-w-5xl max-h-[90vh] flex flex-col"
                 style={{ border: '1px solid #D1CBC5' }}>
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b" style={{ borderColor: '#D1CBC5' }}>
                    <div>
                        <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                            Lead conflicts detected
                        </h2>
                        <p className="text-sm text-gray-600 mt-1">
                            {report.totalLeads} lead{report.totalLeads === 1 ? '' : 's'} selected for{' '}
                            <span className="font-medium">{campaignName}</span> —{' '}
                            <span className="font-medium">{conflictLeads.length}</span> need{conflictLeads.length === 1 ? 's' : ''} review.
                        </p>
                    </div>
                    <button onClick={onCancel} disabled={submitting}
                            className="text-gray-400 hover:text-gray-600 disabled:opacity-50">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Summary cards */}
                <div className="grid grid-cols-4 gap-3 p-6 pb-4">
                    <SummaryCard
                        label="Active in another campaign"
                        value={report.activeConflictCount}
                        tone="amber"
                        icon={<Activity className="w-4 h-4" />}
                    />
                    <SummaryCard
                        label="Has prior engagement"
                        value={report.historicalConflictCount}
                        tone="blue"
                        icon={<Mail className="w-4 h-4" />}
                    />
                    <SummaryCard
                        label="Suppressed (bounce/unsub)"
                        value={report.suppressedCount}
                        tone="red"
                        icon={<Ban className="w-4 h-4" />}
                    />
                    <SummaryCard
                        label="Clean to enroll"
                        value={report.cleanCount}
                        tone="green"
                    />
                </div>

                {/* Toggle */}
                <div className="px-6 pb-4">
                    <label className="flex items-start gap-3 p-4 rounded-lg cursor-pointer"
                           style={{ background: '#FAF8F5', border: '1px solid #D1CBC5' }}>
                        <input
                            type="checkbox"
                            checked={excludeDualEnrolled}
                            onChange={(e) => setExcludeDualEnrolled(e.target.checked)}
                            disabled={submitting}
                            className="mt-1"
                        />
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                                Exclude leads currently active in another campaign
                            </div>
                            <div className="text-xs text-gray-600 mt-0.5">
                                Recommended. Prevents the same lead from being emailed by two
                                campaigns at once. Suppressed leads (bounced / unsubscribed) are
                                always excluded.
                            </div>
                        </div>
                    </label>
                </div>

                {/* Conflict table */}
                <div className="flex-1 overflow-y-auto px-6">
                    {conflictLeads.length === 0 ? (
                        <div className="text-center py-12 text-gray-500 text-sm">
                            No conflicts. All {report.totalLeads} leads will be enrolled.
                        </div>
                    ) : (
                        <table className="w-full text-sm">
                            <thead className="sticky top-0 bg-white border-b" style={{ borderColor: '#D1CBC5' }}>
                                <tr className="text-left text-xs text-gray-600 uppercase tracking-wide">
                                    <th className="py-2 pr-4">Lead</th>
                                    <th className="py-2 pr-4">Conflict</th>
                                    <th className="py-2 pr-4">Engagement</th>
                                    <th className="py-2 pr-4">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleLeads.map((lead) => (
                                    <ConflictRow key={lead.lead_id} lead={lead} />
                                ))}
                            </tbody>
                        </table>
                    )}

                    {hasMore && (
                        <div className="text-center py-3">
                            <button
                                onClick={() => setVisibleCount(c => c + PAGE_SIZE)}
                                className="text-sm text-gray-700 hover:text-gray-900 underline">
                                Show {Math.min(PAGE_SIZE, conflictLeads.length - visibleCount)} more
                                ({conflictLeads.length - visibleCount} remaining)
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t p-6 flex items-center justify-between" style={{ borderColor: '#D1CBC5' }}>
                    <div className="text-sm text-gray-700">
                        <span className="font-medium text-gray-900">{willEnroll}</span> lead{willEnroll === 1 ? '' : 's'} will be enrolled,{' '}
                        <span className="font-medium text-gray-900">{willExclude}</span> excluded.
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={onCancel}
                            disabled={submitting}
                            className="px-4 py-2 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-50"
                            style={{ border: '1px solid #D1CBC5' }}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onConfirm(excludeDualEnrolled)}
                            disabled={submitting || willEnroll === 0}
                            className="px-4 py-2 text-sm rounded-lg bg-gray-900 text-white hover:bg-gray-800 disabled:opacity-50 flex items-center gap-2"
                        >
                            {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                            {willEnroll === 0
                                ? 'Nothing to enroll'
                                : `Enroll ${willEnroll} lead${willEnroll === 1 ? '' : 's'}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// ============================================================================
// Sub-components
// ============================================================================

function SummaryCard({
    label,
    value,
    tone,
    icon,
}: {
    label: string;
    value: number;
    tone: 'amber' | 'blue' | 'red' | 'green';
    icon?: React.ReactNode;
}) {
    const toneClasses = {
        amber: 'text-amber-700 bg-amber-50',
        blue: 'text-blue-700 bg-blue-50',
        red: 'text-red-700 bg-red-50',
        green: 'text-green-700 bg-green-50',
    };
    return (
        <div className="rounded-lg p-3" style={{ border: '1px solid #D1CBC5' }}>
            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${toneClasses[tone]}`}>
                {icon}
                {value}
            </div>
            <div className="text-xs text-gray-600 mt-2">{label}</div>
        </div>
    );
}

function ConflictRow({ lead }: { lead: LeadConflictRecord }) {
    const allConflicts = [...lead.activeConflicts, ...lead.historicalConflicts];
    const primary = allConflicts[0]; // most severe shown inline

    return (
        <tr className="border-b last:border-b-0" style={{ borderColor: '#F0EBE3' }}>
            <td className="py-3 pr-4">
                <div className="text-sm text-gray-900 truncate">{lead.email}</div>
                {lead.suppressed && (
                    <div className="text-xs text-red-600 mt-0.5">
                        Suppressed: {lead.suppressedReason}
                    </div>
                )}
            </td>
            <td className="py-3 pr-4">
                {primary ? (
                    <div>
                        <div className="text-sm text-gray-900 truncate">{primary.campaign_name}</div>
                        <div className="text-xs text-gray-600">
                            Step {primary.current_step}
                            {primary.last_sent_at && ` · last sent ${formatDate(primary.last_sent_at)}`}
                        </div>
                        {allConflicts.length > 1 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                                +{allConflicts.length - 1} more campaign{allConflicts.length - 1 === 1 ? '' : 's'}
                            </div>
                        )}
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">—</span>
                )}
            </td>
            <td className="py-3 pr-4">
                {primary ? (
                    <div className="flex items-center gap-3 text-xs text-gray-700">
                        <span className="flex items-center gap-1" title="Opens">
                            <Mail className="w-3 h-3" /> {primary.opened_count}
                        </span>
                        <span className="flex items-center gap-1" title="Clicks">
                            <MousePointer className="w-3 h-3" /> {primary.clicked_count}
                        </span>
                        <span className="flex items-center gap-1" title="Replies">
                            <MessageCircle className="w-3 h-3" /> {primary.replied_at ? '1' : '0'}
                        </span>
                    </div>
                ) : (
                    <span className="text-xs text-gray-400">—</span>
                )}
            </td>
            <td className="py-3 pr-4">
                {primary && <StatusPill kind={primary.kind} status={primary.enrollment_status} />}
                {!primary && lead.suppressed && (
                    <span className="text-xs px-2 py-0.5 rounded bg-red-50 text-red-700">excluded</span>
                )}
            </td>
        </tr>
    );
}

function StatusPill({ kind, status }: { kind: 'active' | 'historical'; status: string }) {
    if (kind === 'active') {
        return (
            <span className="text-xs px-2 py-0.5 rounded bg-amber-50 text-amber-700">
                {status}
            </span>
        );
    }
    return (
        <span className="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">
            {status}
        </span>
    );
}

function formatDate(iso: string): string {
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    const now = Date.now();
    const ageMs = now - d.getTime();
    const days = Math.floor(ageMs / (24 * 60 * 60 * 1000));
    if (days < 1) return 'today';
    if (days < 30) return `${days}d ago`;
    if (days < 365) return `${Math.floor(days / 30)}mo ago`;
    return `${Math.floor(days / 365)}y ago`;
}
