'use client';

/**
 * ReplyActionsCard - sequencer settings panel for per-class auto-actions.
 *
 * Reads + writes /api/sequencer/reply-actions. Lazy-seeds the default
 * ruleset server-side, so the first GET always returns something usable.
 *
 * UI: matrix of reply classes × actions, each cell a toggleable switch.
 * Operator picks which combinations are active. Suppress on hard_no is
 * the most impactful default - they should rarely turn it off but can.
 */

import { useEffect, useState } from 'react';
import { Bot, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

type ReplyClass = 'positive' | 'qualified' | 'objection' | 'referral' | 'soft_no' | 'hard_no' | 'angry' | 'auto';
type ActionKind = 'suppress' | 'pause_lead' | 'alert';

interface Rule {
    id: string;
    reply_class: ReplyClass;
    action_kind: ActionKind;
    enabled: boolean;
}

const CLASSES: { key: ReplyClass; label: string; description: string }[] = [
    { key: 'positive', label: 'Positive', description: 'Clearly interested replies' },
    { key: 'qualified', label: 'Qualified', description: 'Open with a condition' },
    { key: 'objection', label: 'Objection', description: 'Concrete reason it’s not a fit' },
    { key: 'referral', label: 'Referral', description: 'Pointing to someone else' },
    { key: 'soft_no', label: 'Soft no', description: 'Polite decline' },
    { key: 'hard_no', label: 'Hard no', description: 'Explicit no / unsubscribe' },
    { key: 'angry', label: 'Angry', description: 'Hostile or frustrated' },
    { key: 'auto', label: 'Auto / OOO', description: 'Autoresponder (OOO date handled separately)' },
];

const ACTIONS: { key: ActionKind; label: string; description: string }[] = [
    { key: 'suppress', label: 'Suppress', description: 'Block from all future campaigns' },
    { key: 'pause_lead', label: 'Pause lead', description: 'Pause in current campaign' },
    { key: 'alert', label: 'Alert', description: 'Send a notification' },
];

export default function ReplyActionsCard() {
    const [rules, setRules] = useState<Rule[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingKey, setSavingKey] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const data = await apiClient<Rule[]>('/api/sequencer/reply-actions');
                setRules(Array.isArray(data) ? data : []);
            } catch (e) {
                setError((e as Error)?.message || 'Failed to load reply actions');
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const isEnabled = (cls: ReplyClass, action: ActionKind): boolean => {
        return rules.some(r => r.reply_class === cls && r.action_kind === action && r.enabled);
    };

    const toggle = async (cls: ReplyClass, action: ActionKind) => {
        const key = `${cls}.${action}`;
        const current = isEnabled(cls, action);
        const next = !current;
        setSavingKey(key);
        setError(null);

        // Optimistic update so the toggle feels live; revert on failure.
        const prior = rules;
        const upd: Rule[] = (() => {
            const idx = rules.findIndex(r => r.reply_class === cls && r.action_kind === action);
            if (idx >= 0) {
                const copy = [...rules];
                copy[idx] = { ...copy[idx], enabled: next };
                return copy;
            }
            return [...rules, { id: `temp-${key}`, reply_class: cls, action_kind: action, enabled: next }];
        })();
        setRules(upd);

        try {
            await apiClient('/api/sequencer/reply-actions', {
                method: 'PUT',
                body: JSON.stringify({ reply_class: cls, action_kind: action, enabled: next }),
            });
        } catch (e) {
            setRules(prior);
            setError((e as Error)?.message || 'Failed to update rule');
        } finally {
            setSavingKey(null);
        }
    };

    return (
        <div className="premium-card">
            <div className="flex items-center gap-2 mb-1">
                <Bot size={14} className="text-gray-500" />
                <h2 className="text-sm font-bold text-gray-900">Reply auto-actions</h2>
            </div>
            <p className="text-[10px] text-gray-500 mb-4">
                For each reply class, choose what happens automatically. AI re-classifies ambiguous replies before these fire.
                <span className="block mt-0.5">OOO autoresponders are handled separately - the dispatcher pauses sends until the lead returns.</span>
            </p>

            {loading ? (
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Loader2 size={12} className="animate-spin" /> Loading rules…
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                        <thead>
                            <tr>
                                <th className="text-left text-[10px] uppercase tracking-wide text-gray-500 font-semibold pb-2">Reply class</th>
                                {ACTIONS.map(a => (
                                    <th key={a.key} className="text-center text-[10px] uppercase tracking-wide text-gray-500 font-semibold pb-2 px-2">
                                        <div title={a.description}>{a.label}</div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {CLASSES.map(c => (
                                <tr key={c.key} className="border-t border-gray-100">
                                    <td className="py-2 pr-3">
                                        <div className="text-xs font-semibold text-gray-900">{c.label}</div>
                                        <div className="text-[10px] text-gray-500">{c.description}</div>
                                    </td>
                                    {ACTIONS.map(a => {
                                        const k = `${c.key}.${a.key}`;
                                        const on = isEnabled(c.key, a.key);
                                        const busy = savingKey === k;
                                        return (
                                            <td key={a.key} className="px-2 py-2 text-center">
                                                <button
                                                    onClick={() => toggle(c.key, a.key)}
                                                    disabled={busy}
                                                    aria-pressed={on}
                                                    title={`${a.label} on ${c.label} replies`}
                                                    className="relative cursor-pointer border-none disabled:opacity-50"
                                                    style={{
                                                        width: 30,
                                                        height: 18,
                                                        background: on ? '#111827' : '#D1CBC5',
                                                        borderRadius: 999,
                                                        padding: 0,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            position: 'absolute',
                                                            top: 2,
                                                            left: on ? 14 : 2,
                                                            width: 14,
                                                            height: 14,
                                                            background: '#FFFFFF',
                                                            borderRadius: '50%',
                                                            transition: 'left 0.12s ease',
                                                            boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                                                        }}
                                                    />
                                                </button>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {error && <div className="text-[11px] text-red-700 mt-2">{error}</div>}
        </div>
    );
}
