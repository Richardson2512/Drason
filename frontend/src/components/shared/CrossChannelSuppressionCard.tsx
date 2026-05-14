'use client';

/**
 * CrossChannelSuppressionCard — workspace-level "what happens when a lead
 * replies on one channel" setting. Same card is mounted on both the
 * Sequencer settings page and the Super LinkedIn settings page; the
 * value is org-scoped, so editing it in either place flips the policy
 * for every campaign across both channels.
 *
 * Reads + writes /api/sequencer/settings/suppression-mode. (Endpoint
 * lives under the sequencer namespace by accident of history but is
 * cross-module org config; we reuse it from both surfaces rather than
 * duplicating the route.)
 *
 * Four modes — see crossChannelSuppressionService.ts for the source of
 * truth on what each one does at dispatch time.
 */

import { useEffect, useState } from 'react';
import { ShieldCheck, Loader2, Check } from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';

type SuppressionMode = 'OFF' | 'HARD' | 'CLASSIFIED' | 'ASYMMETRIC';

interface ModeOption {
    key: SuppressionMode;
    label: string;
    summary: string;
    detail: string;
    isDefault?: boolean;
}

const MODES: ModeOption[] = [
    {
        key: 'OFF',
        label: 'Off',
        summary: 'Each channel handles its own reply.',
        detail: 'When a lead replies on email, only their email campaigns pause. When they reply on LinkedIn, only LinkedIn pauses. Use this when your team explicitly nurtures the same lead on both channels in parallel.',
    },
    {
        key: 'HARD',
        label: 'Hard',
        summary: 'Any reply on any channel pauses both.',
        detail: 'Most conservative. The instant a lead sends any kind of reply on either channel, every active enrollment for that lead pauses across both email and LinkedIn. Useful if you want to avoid even the appearance of double-tapping.',
    },
    {
        key: 'CLASSIFIED',
        label: 'Classified',
        summary: 'Only intent-bearing replies pause the other channel.',
        detail: 'Replies are auto-classified into nine classes by the reply classifier. The other channel pauses only on Positive, Qualified, Hard-no, or Angry. Generic / auto-replies / soft-no / objection / referral stay channel-scoped — they don\'t silence the other side.',
        isDefault: true,
    },
    {
        key: 'ASYMMETRIC',
        label: 'Asymmetric',
        summary: 'Email replies always pause LinkedIn. LinkedIn replies pause email only if intent-bearing.',
        detail: 'Reflects how most teams actually treat the two channels — email is the higher-intent surface, LinkedIn is more conversational. Any reply on email is treated as a signal worth honouring; LinkedIn replies only stop email when the classifier sees clear intent.',
    },
];

export default function CrossChannelSuppressionCard() {
    const [mode, setMode] = useState<SuppressionMode>('CLASSIFIED');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<SuppressionMode | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await apiClient<{ mode: SuppressionMode }>('/api/sequencer/settings/suppression-mode');
                if (!cancelled && data?.mode) setMode(data.mode);
            } catch (e) {
                if (!cancelled) setError((e as Error)?.message || 'Failed to load suppression mode');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const handlePick = async (next: SuppressionMode) => {
        if (next === mode || saving) return;
        const prev = mode;
        setSaving(next);
        setError(null);
        // Optimistic update so the selection feels instant; revert on failure.
        setMode(next);
        try {
            await apiClient('/api/sequencer/settings/suppression-mode', {
                method: 'PATCH',
                body: JSON.stringify({ mode: next }),
            });
            toast.success(`Cross-channel suppression set to ${next.charAt(0) + next.slice(1).toLowerCase()}`);
        } catch (e) {
            setMode(prev);
            toast.error((e as Error)?.message || 'Failed to update mode');
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="premium-card">
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-start gap-2">
                    <ShieldCheck size={14} className="text-gray-500 mt-0.5" />
                    <div>
                        <h2 className="text-sm font-bold text-gray-900">Cross-channel suppression</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">
                            When a lead replies on one channel (email or LinkedIn), should the OTHER channel's active enrollments auto-pause? This is workspace-wide and applies to every campaign in both Super Sequencer and Super LinkedIn.
                        </p>
                    </div>
                </div>
                {loading && <Loader2 size={12} className="animate-spin text-gray-400" />}
            </div>

            {error && (
                <div className="rounded-md p-2 mb-2 text-[11px]" style={{ background: '#FEE2E2', border: '1px solid #FCA5A5', color: '#991B1B' }}>
                    {error}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-3">
                {MODES.map(opt => {
                    const isActive = mode === opt.key;
                    const isSaving = saving === opt.key;
                    return (
                        <button
                            key={opt.key}
                            onClick={() => handlePick(opt.key)}
                            disabled={loading || !!saving}
                            className="text-left rounded-lg p-3 cursor-pointer transition-colors disabled:cursor-not-allowed"
                            style={{
                                background: isActive ? '#F0FDF4' : '#FFFFFF',
                                border: isActive ? '2px solid #16A34A' : '1px solid #E8E3DC',
                            }}
                        >
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold text-gray-900">{opt.label}</span>
                                    {opt.isDefault && (
                                        <span className="text-[9px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded" style={{ background: '#F3F4F6', color: '#6B7280' }}>
                                            Default
                                        </span>
                                    )}
                                </div>
                                {isActive && !isSaving && <Check size={12} className="text-emerald-700" />}
                                {isSaving && <Loader2 size={12} className="animate-spin text-emerald-700" />}
                            </div>
                            <p className="text-[11px] font-semibold text-gray-700 mb-1">{opt.summary}</p>
                            <p className="text-[10px] text-gray-500 leading-relaxed">{opt.detail}</p>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
