'use client';
import { useState } from 'react';
import type { Lead } from '@/types/api';
import BatchRecommendationsModal from '@/components/dashboard/BatchRecommendationsModal';

interface LeadBulkActionBarProps {
    selectedLeadIds: Set<string>;
    leads: Lead[];
    onClearSelection: () => void;
}

export default function LeadBulkActionBar({ selectedLeadIds, leads, onClearSelection }: LeadBulkActionBarProps) {
    const [showRecommendationsModal, setShowRecommendationsModal] = useState(false);

    return (
        <>
            {selectedLeadIds.size >= 2 && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-4 px-6 py-3 rounded-2xl shadow-xl" style={{
                    background: 'linear-gradient(135deg, #2563EB, #1D4ED8)',
                }}>
                    <span className="text-sm font-semibold text-white">
                        {selectedLeadIds.size} leads selected
                    </span>
                    <button
                        onClick={() => setShowRecommendationsModal(true)}
                        className="px-4 py-2 rounded-[10px] text-white text-[0.8rem] font-semibold cursor-pointer transition-all duration-200"
                        style={{
                            border: '1px solid rgba(255,255,255,0.3)',
                            background: 'rgba(255,255,255,0.15)',
                        }}
                    >
                        Get Campaign Recommendations
                    </button>
                    <button
                        onClick={onClearSelection}
                        className="px-3 py-2 rounded-[10px] border-none text-[0.8rem] font-medium cursor-pointer transition-all duration-200"
                        style={{
                            background: 'rgba(255,255,255,0.1)',
                            color: 'rgba(255,255,255,0.8)',
                        }}
                    >
                        Clear
                    </button>
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
