'use client';

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Info, Trash2, Plus, Save, RotateCcw } from 'lucide-react';

interface BuiltinWeights {
    base: number;
    per_open: number;
    max_open: number;
    per_click: number;
    max_click: number;
    per_reply: number;
    max_reply: number;
    per_bounce: number;
    recency_7d: number;
    recency_30d: number;
    recency_90d: number;
    recency_older: number;
    frequency_high: number;
    frequency_mid: number;
    frequency_low: number;
    frequency_min: number;
}

interface CustomEvent {
    key: string;
    label: string;
    points: number;
    color?: string;
}

const DEFAULTS: BuiltinWeights = {
    base: 20, per_open: 2, max_open: 10, per_click: 4, max_click: 10,
    per_reply: 5, max_reply: 15, per_bounce: -10,
    recency_7d: 30, recency_30d: 22, recency_90d: 12, recency_older: 5,
    frequency_high: 20, frequency_mid: 15, frequency_low: 10, frequency_min: 6,
};

type Section = {
    title: string;
    hint: string;
    rows: Array<{ key: keyof BuiltinWeights; label: string; min?: number; max?: number }>;
};

const SECTIONS: Section[] = [
    {
        title: 'Engagement events',
        hint: 'Points each event contributes, capped per category. Bounce is a penalty (negative).',
        rows: [
            { key: 'base',       label: 'Starting points',     min: 0, max: 50 },
            { key: 'per_open',   label: 'Per open',            min: 0, max: 50 },
            { key: 'max_open',   label: 'Cap (opens)',         min: 0, max: 50 },
            { key: 'per_click',  label: 'Per click',           min: 0, max: 50 },
            { key: 'max_click',  label: 'Cap (clicks)',        min: 0, max: 50 },
            { key: 'per_reply',  label: 'Per reply',           min: 0, max: 50 },
            { key: 'max_reply',  label: 'Cap (replies)',       min: 0, max: 50 },
            { key: 'per_bounce', label: 'Per bounce (penalty)', min: -50, max: 0 },
        ],
    },
    {
        title: 'Recency bonus',
        hint: 'Extra points based on how recent the last engagement was.',
        rows: [
            { key: 'recency_7d',    label: '≤ 7 days ago',  min: 0, max: 50 },
            { key: 'recency_30d',   label: '≤ 30 days',     min: 0, max: 50 },
            { key: 'recency_90d',   label: '≤ 90 days',     min: 0, max: 50 },
            { key: 'recency_older', label: 'Older / none',  min: 0, max: 50 },
        ],
    },
    {
        title: 'Frequency bonus',
        hint: 'Extra points based on total engagement count (opens + clicks + replies).',
        rows: [
            { key: 'frequency_high', label: '11+ events',  min: 0, max: 50 },
            { key: 'frequency_mid',  label: '6–10 events', min: 0, max: 50 },
            { key: 'frequency_low',  label: '3–5 events',  min: 0, max: 50 },
            { key: 'frequency_min',  label: '1–2 events',  min: 0, max: 50 },
        ],
    },
];

export default function LeadScoringPanel() {
    const [weights, setWeights] = useState<BuiltinWeights>(DEFAULTS);
    const [events, setEvents] = useState<CustomEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [dirty, setDirty] = useState(false);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const res = await apiClient<{ success: boolean; data: { weights: BuiltinWeights; events: CustomEvent[] } }>('/api/leads/scoring/config');
            setWeights({ ...DEFAULTS, ...res.data.weights });
            setEvents(Array.isArray(res.data.events) ? res.data.events : []);
            setDirty(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to load scoring config');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { load(); }, [load]);

    const updateWeight = (key: keyof BuiltinWeights, value: number) => {
        setWeights(w => ({ ...w, [key]: value }));
        setDirty(true);
    };

    const addEvent = () => {
        const base: CustomEvent = { key: `event_${Date.now()}`, label: 'New event', points: 10, color: '#16A34A' };
        setEvents(e => [...e, base]);
        setDirty(true);
    };

    const updateEvent = (idx: number, patch: Partial<CustomEvent>) => {
        setEvents(prev => prev.map((e, i) => i === idx ? { ...e, ...patch } : e));
        setDirty(true);
    };

    const removeEvent = (idx: number) => {
        setEvents(prev => prev.filter((_, i) => i !== idx));
        setDirty(true);
    };

    const resetDefaults = () => {
        setWeights(DEFAULTS);
        setDirty(true);
    };

    const save = async () => {
        // Client-side validation: event keys must be unique + non-empty.
        const seen = new Set<string>();
        for (const e of events) {
            const k = e.key.trim();
            if (!k || !e.label.trim()) {
                toast.error('Every custom event needs a key and a label');
                return;
            }
            if (seen.has(k)) {
                toast.error(`Duplicate event key: ${k}`);
                return;
            }
            seen.add(k);
        }
        setSaving(true);
        try {
            await apiClient('/api/leads/scoring/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weights, events }),
            });
            toast.success('Scoring config saved');
            setDirty(false);
        } catch (e: any) {
            toast.error(e.message || 'Failed to save');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="premium-card mt-4 p-6 text-center text-xs text-gray-500">
                Loading scoring config…
            </div>
        );
    }

    return (
        <div className="mt-4 flex flex-col gap-3">
            {/* Heads-up banner — required by spec. Edits only affect FUTURE
                engagement; existing lead_score and adjustments are immutable. */}
            <div
                className="flex items-start gap-2 px-3 py-2.5 rounded-lg"
                style={{ background: '#FEF7E6', border: '1px solid #F2C97A' }}
            >
                <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
                <div className="text-[12px] text-amber-900 leading-relaxed">
                    <strong>Heads up — changes apply to upcoming engagement only.</strong>{' '}
                    Existing lead scores stay frozen. New opens, clicks, replies, and custom events use the values you save here.
                </div>
            </div>

            {/* Built-in weights */}
            {SECTIONS.map(section => (
                <div key={section.title} className="premium-card">
                    <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5 mb-3">{section.hint}</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        {section.rows.map(row => (
                            <label key={row.key} className="flex flex-col gap-1">
                                <span className="text-[11px] font-semibold text-gray-700">{row.label}</span>
                                <input
                                    type="number"
                                    value={weights[row.key]}
                                    min={row.min}
                                    max={row.max}
                                    onChange={e => updateWeight(row.key, Number(e.target.value))}
                                    className="w-full px-2 py-1.5 rounded-lg text-xs outline-none bg-white"
                                    style={{ border: '1px solid #D1CBC5' }}
                                />
                            </label>
                        ))}
                    </div>
                </div>
            ))}

            {/* Custom events */}
            <div className="premium-card">
                <div className="flex items-start justify-between gap-3 mb-3">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900">Custom events</h2>
                        <p className="text-[11px] text-gray-500 mt-0.5">
                            Define your own scoring events (e.g. &quot;Booked demo&quot;, &quot;Visited pricing&quot;). Operators can log these from a lead&apos;s row to bump its score.
                        </p>
                    </div>
                    <button
                        onClick={addEvent}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer shrink-0"
                    >
                        <Plus size={12} /> Add event
                    </button>
                </div>

                {events.length === 0 ? (
                    <div className="text-[12px] text-gray-500 px-3 py-6 text-center rounded-lg" style={{ background: '#FAFAF8', border: '1px dashed #D1CBC5' }}>
                        No custom events yet. Add one to give operators a way to record manual signals on a lead.
                    </div>
                ) : (
                    <div className="flex flex-col gap-2">
                        {events.map((ev, idx) => (
                            <div
                                key={idx}
                                className="grid grid-cols-12 gap-2 items-center p-2 rounded-lg bg-[#FAFAF8]"
                                style={{ border: '1px solid #E8E3DC' }}
                            >
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        value={ev.label}
                                        onChange={e => updateEvent(idx, { label: e.target.value })}
                                        placeholder="Label (e.g. Booked demo)"
                                        className="w-full px-2 py-1.5 rounded-lg text-xs outline-none bg-white"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <input
                                        type="text"
                                        value={ev.key}
                                        onChange={e => updateEvent(idx, { key: e.target.value.replace(/\s+/g, '_').toLowerCase() })}
                                        placeholder="key (snake_case)"
                                        className="w-full px-2 py-1.5 rounded-lg text-xs outline-none bg-white font-mono"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <input
                                        type="number"
                                        value={ev.points}
                                        onChange={e => updateEvent(idx, { points: Number(e.target.value) })}
                                        placeholder="points"
                                        className="w-full px-2 py-1.5 rounded-lg text-xs outline-none bg-white"
                                        style={{ border: '1px solid #D1CBC5' }}
                                    />
                                </div>
                                <div className="col-span-3 flex items-center gap-2">
                                    <input
                                        type="color"
                                        value={ev.color || '#16A34A'}
                                        onChange={e => updateEvent(idx, { color: e.target.value })}
                                        className="w-8 h-8 rounded cursor-pointer"
                                        style={{ border: '1px solid #D1CBC5' }}
                                        title="Pill color on the lead row"
                                    />
                                    <span className="text-[11px] text-gray-500">Pill color</span>
                                </div>
                                <div className="col-span-1 flex justify-end">
                                    <button
                                        onClick={() => removeEvent(idx)}
                                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 cursor-pointer"
                                        title="Remove event"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action bar */}
            <div className="flex items-center justify-between gap-2 sticky bottom-0 bg-white py-2 -mx-0 mt-1">
                <button
                    onClick={resetDefaults}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white text-gray-700 text-xs font-semibold hover:bg-[#FAFAF8] cursor-pointer"
                    style={{ border: '1px solid #D1CBC5' }}
                >
                    <RotateCcw size={12} /> Reset built-in weights to defaults
                </button>
                <div className="flex items-center gap-2">
                    {dirty && <span className="text-[11px] text-amber-700 font-semibold">Unsaved changes</span>}
                    <button
                        onClick={save}
                        disabled={saving || !dirty}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Save size={12} />
                        {saving ? 'Saving…' : 'Save changes'}
                    </button>
                </div>
            </div>
        </div>
    );
}
