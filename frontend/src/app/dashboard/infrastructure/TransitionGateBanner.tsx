'use client';

interface TransitionGateBannerProps {
    gateData: Record<string, any> | null;
    onAcknowledge: () => Promise<void>;
    acknowledging: boolean;
    ackResult: string | null;
}

export default function TransitionGateBanner({ gateData, onAcknowledge, acknowledging, ackResult }: TransitionGateBannerProps) {
    if (!gateData || gateData.canProceed || gateData.score === undefined) return null;

    return (
        <div className="premium-card rounded-[20px] px-8 py-7 relative overflow-hidden" style={{
            background: 'linear-gradient(135deg, #FEF3C7, #FFFBEB)',
            border: '2px solid #F59E0B',
        }}>
            <div className="absolute top-[-20px] right-[-20px] w-[120px] h-[120px] rounded-full bg-[rgba(245,158,11,0.08)]" />
            <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-2xl bg-[#FEF3C7] border-2 border-[#FDE68A] flex items-center justify-center text-[1.75rem] shrink-0">
                    ⚠️
                </div>
                <div className="flex-1">
                    <h3 className="text-[1.2rem] font-extrabold text-[#92400E] mb-2">
                        Infrastructure Score Below Threshold
                    </h3>
                    <p className="text-[#78350F] text-[0.9rem] leading-relaxed mb-3">
                        Your infrastructure scored <strong>{gateData.score}/100</strong>.
                        {gateData.pausedCount !== undefined && (
                            <> <strong>{gateData.pausedCount}</strong> of <strong>{gateData.totalCount}</strong> entities are paused.</>)}
                        {' '}The system requires your acknowledgment before allowing email operations on this infrastructure.
                    </p>
                    <p className="text-[#92400E] text-[0.8rem] leading-normal mb-4 italic">
                        By acknowledging, you confirm awareness that sending through degraded infrastructure may impact your email reputation.
                    </p>
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onAcknowledge}
                            disabled={acknowledging || gateData.score === 0}
                            className="px-6 py-3 rounded-[14px] text-white font-bold text-[0.9rem] border-none transition-all duration-200"
                            style={{
                                background: gateData.score === 0 ? '#D1D5DB' : 'linear-gradient(135deg, #F59E0B, #D97706)',
                                cursor: gateData.score === 0 ? 'not-allowed' : 'pointer',
                                boxShadow: gateData.score === 0 ? 'none' : '0 4px 14px rgba(245, 158, 11, 0.4)',
                                opacity: acknowledging ? 0.6 : 1,
                            }}
                        >
                            {acknowledging ? 'Acknowledging...' : gateData.score === 0
                                ? '🔒 All Entities Paused — Manual Healing Required'
                                : '✅ I Understand the Risks — Proceed'
                            }
                        </button>
                        <span className="text-xs text-[#92400E]">
                            Score must be above 0 to proceed
                        </span>
                    </div>
                    {ackResult && (
                        <div className="mt-3 px-4 py-[0.6rem] rounded-[10px] text-[0.85rem] font-medium" style={{
                            background: ackResult.includes('acknowledged') ? '#DCFCE7' : '#FEF2F2',
                            border: `1px solid ${ackResult.includes('acknowledged') ? '#BBF7D0' : '#FECACA'}`,
                            color: ackResult.includes('acknowledged') ? '#166534' : '#991B1B',
                        }}>
                            {ackResult}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
