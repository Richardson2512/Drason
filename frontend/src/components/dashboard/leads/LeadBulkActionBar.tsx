'use client';
import { useState } from 'react';
import type { Lead } from '@/types/api';
import { apiClient } from '@/lib/api';
import BatchRecommendationsModal from '@/components/dashboard/BatchRecommendationsModal';

interface LeadBulkActionBarProps {
    selectedLeadIds: Set<string>;
    leads: Lead[];
    onClearSelection: () => void;
    onRefresh?: () => void;
}

export default function LeadBulkActionBar({ selectedLeadIds, leads, onClearSelection, onRefresh }: LeadBulkActionBarProps) {
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);
    const [loading, setLoading] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<{ label: string; message: string; action: () => Promise<void> } | null>(null);

    if (selectedLeadIds.size === 0) return null;

    const handleExportCSV = async () => {
        setLoading('export');
        try {
            const ids = Array.from(selectedLeadIds);
            const selectedLeads = leads.filter(l => ids.includes(l.id));
            const headers = ['email', 'status', 'lead_score', 'health_classification', 'emails_sent', 'emails_opened', 'emails_replied', 'bounced'];
            const rows = selectedLeads.map(l =>
                headers.map(h => {
                    const val = (l as any)[h];
                    const str = val === null || val === undefined ? '' : String(val);
                    return str.includes(',') ? `"${str}"` : str;
                }).join(',')
            );
            const csv = [headers.join(','), ...rows].join('\n');
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            URL.revokeObjectURL(url);
        } finally {
            setLoading(null);
        }
    };

    const executeConfirm = async () => {
        if (!confirmAction) return;
        setLoading(confirmAction.label);
        try {
            await confirmAction.action();
            onClearSelection();
            onRefresh?.();
        } catch (err) {
            console.error('Bulk action failed:', err);
        } finally {
            setLoading(null);
            setConfirmAction(null);
        }
    };

    const actions = [
        {
            label: 'Recommendations',
            icon: '🎯',
            onClick: () => setShowRecommendationsModal(true),
        },
        {
            label: 'Export CSV',
            icon: '📥',
            onClick: handleExportCSV,
        },
    ];

    return (
        <>
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-6 py-3 rounded-2xl shadow-xl" style={{
                background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
            }}>
                <div className="bg-white/20 rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold text-white">
                    {selectedLeadIds.size}
                </div>
                <span className="text-sm font-semibold text-white">
                    lead{selectedLeadIds.size !== 1 ? 's' : ''} selected
                </span>
                <div className="w-px h-6 bg-white/20" />
                {actions.map(action => (
                    <button
                        key={action.label}
                        onClick={action.onClick}
                        disabled={!!loading}
                        className="px-3 py-1.5 rounded-lg text-white text-[0.8rem] font-semibold cursor-pointer transition-all duration-200 flex items-center gap-1.5 disabled:opacity-50"
                        style={{ border: '1px solid rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.12)' }}
                    >
                        {loading === action.label ? (
                            <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            <span>{action.icon}</span>
                        )}
                        {action.label}
                    </button>
                ))}
                <button
                    onClick={onClearSelection}
                    className="px-2 py-1.5 rounded-lg text-white/60 hover:text-white text-xs transition-colors"
                >
                    ✕
                </button>
            </div>

            {/* Confirmation Modal */}
            {confirmAction && (
                <div className="fixed inset-0 z-[60] bg-black/30 backdrop-blur-sm flex items-center justify-center" onClick={() => setConfirmAction(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-xl" onClick={e => e.stopPropagation()}>
                        <p className="text-sm text-gray-600 mb-4">{confirmAction.message}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setConfirmAction(null)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50">Cancel</button>
                            <button onClick={executeConfirm} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700">Confirm</button>
                        </div>
                    </div>
                </div>
            )}

            <BatchRecommendationsModal
                isOpen={showRecommendationsModal}
                onClose={() => setShowRecommendationsModal(false)}
                leadIds={Array.from(selectedLeadIds)}
                leads={leads.filter(l => selectedLeadIds.has(l.id)).map(l => ({ id: l.id, email: l.email }))}
            />
        </>
    );
}
