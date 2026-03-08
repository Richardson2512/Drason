'use client';
import { useEffect, useRef } from 'react';

interface Finding {
    title: string;
    severity: string;
    description?: string;
    details?: string;
    message?: string;
}

interface HealthEnforcementModalProps {
    isOpen: boolean;
    onClose: () => void;
    criticalCount: number;
    findings: Finding[];
    overallScore?: number;
    onPauseCampaigns: () => void;
    onViewDetails: () => void;
}

export default function HealthEnforcementModal({
    isOpen,
    onClose,
    criticalCount,
    findings,
    overallScore,
    onPauseCampaigns,
    onViewDetails
}: HealthEnforcementModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) {
            document.addEventListener('keydown', handleEscape);
            return () => document.removeEventListener('keydown', handleEscape);
        }
    }, [isOpen, onClose]);

    // Close on backdrop click
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 flex items-center justify-center z-[9999] p-4"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            onClick={handleBackdropClick}
            role="dialog"
            aria-modal="true"
            aria-labelledby="health-enforcement-modal-title"
        >
            <div
                ref={modalRef}
                className="animate-fade-in bg-white rounded-2xl max-w-[600px] w-full max-h-[90vh] overflow-auto shadow-xl"
            >
                {/* Header */}
                <div className="p-8 border-b border-gray-100 rounded-t-2xl" style={{ background: 'linear-gradient(135deg, #FEF2F2 0%, #FEE2E2 100%)' }}>
                    <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-500 flex items-center justify-center text-2xl shrink-0">
                            ⚠️
                        </div>
                        <div className="flex-1">
                            <h2 id="health-enforcement-modal-title" className="text-2xl font-extrabold text-red-800 mb-2 tracking-tight">
                                Critical Infrastructure Issues Detected
                            </h2>
                            <p className="text-red-900 text-[0.95rem] leading-relaxed m-0">
                                We found <strong>{criticalCount} critical {criticalCount === 1 ? 'issue' : 'issues'}</strong> that may harm your email deliverability and sender reputation.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <div className="p-8">
                    {overallScore !== null && overallScore !== undefined && (
                        <div className="rounded-xl p-4 mb-6 flex items-center gap-4" style={{
                            background: overallScore < 50 ? '#FEF2F2' : overallScore < 70 ? '#FFFBEB' : '#F0FDF4',
                            border: `2px solid ${overallScore < 50 ? '#FCA5A5' : overallScore < 70 ? '#FCD34D' : '#BBF7D0'}`
                        }}>
                            <div className="text-center">
                                <div className="text-[2rem] font-extrabold" style={{
                                    color: overallScore < 50 ? '#991B1B' : overallScore < 70 ? '#B45309' : '#166534'
                                }}>
                                    {overallScore}
                                </div>
                                <div className="text-[0.7rem] uppercase font-bold tracking-wide" style={{
                                    color: overallScore < 50 ? '#7F1D1D' : overallScore < 70 ? '#92400E' : '#14532D'
                                }}>
                                    Health Score
                                </div>
                            </div>
                            <div className="flex-1 text-sm leading-relaxed">
                                <strong className="text-gray-900">
                                    {overallScore < 50 ? 'Poor Health' : overallScore < 70 ? 'Fair Health' : 'Good Health'}
                                </strong>
                                <p className="text-gray-500 mt-1 mb-0">
                                    Your infrastructure health score is based on bounce rates, domain reputation, and mailbox configuration.
                                </p>
                            </div>
                        </div>
                    )}

                    <h3 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-4">
                        Top Issues
                    </h3>

                    <div className="flex flex-col gap-3 mb-8">
                        {findings.map((finding, index) => (
                            <div
                                key={index}
                                className="bg-red-50 border border-red-300 rounded-lg p-4 flex gap-3"
                            >
                                <div className="text-xl shrink-0">🔴</div>
                                <div className="flex-1">
                                    <div className="font-bold text-red-800 mb-1 text-[0.9rem]">
                                        {finding.title}
                                    </div>
                                    <div className="text-red-900 text-[0.85rem] leading-relaxed">
                                        {finding.description || finding.details || finding.message}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8">
                        <div className="flex gap-3">
                            <div className="text-xl shrink-0">💡</div>
                            <div>
                                <h4 className="text-sm font-bold text-amber-800 mb-2">
                                    Recommended Action
                                </h4>
                                <p className="text-sm text-amber-900 leading-relaxed m-0">
                                    We recommend <strong>pausing your campaigns immediately</strong> to prevent further damage to your sender reputation. Once paused, you can review the issues and take corrective action.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-4">
                        <button
                            onClick={onPauseCampaigns}
                            className="premium-btn flex-1 bg-red-500 text-white border-none py-3.5 px-6 font-bold"
                        >
                            ⏸️ Pause Campaigns Now
                        </button>
                        <button
                            onClick={onViewDetails}
                            className="premium-btn flex-1 bg-white text-slate-800 border border-slate-200 py-3.5 px-6 font-semibold"
                        >
                            View Full Report
                        </button>
                    </div>

                    <button
                        onClick={onClose}
                        className="hover:text-gray-900 w-full mt-4 p-3 bg-transparent border-none text-gray-500 text-sm font-semibold cursor-pointer transition-colors duration-200"
                    >
                        Dismiss
                    </button>
                </div>
            </div>
        </div>
    );
}
