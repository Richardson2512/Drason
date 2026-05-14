'use client';

/**
 * LinkedInSenderComparisonPanel — pick up to 2 LinkedIn accounts and view
 * a side-by-side daily breakdown of invites / messages / inmails over the
 * configured date window. Mirrors the role of MailboxComparisonPanel on
 * the email side, but slimmed down because the LinkedIn surface only has
 * three send types (no opens / clicks / bounces).
 */

import { useEffect, useMemo, useState } from 'react';
import { apiClient } from '@/lib/api';
import MultiSelectDropdown from '@/components/ui/MultiSelectDropdown';
import toast from 'react-hot-toast';
import { Users2, Loader2 } from 'lucide-react';

interface SenderMeta { id: string; display_name: string; account_type: string }

interface DayCell { day: string; invites: number; messages: number; inmails: number }

interface SeriesEntry {
    sender_id: string;
    display_name: string;
    account_type: string;
    daily: DayCell[];
}

interface ComparisonPayload {
    senders: SenderMeta[];
    series: SeriesEntry[];
}

const PALETTE = ['#0A66C2', '#16A34A'] as const;

export default function LinkedInSenderComparisonPanel({
    startDate, endDate,
}: { startDate: string; endDate: string }) {
    const [allSenders, setAllSenders] = useState<SenderMeta[]>([]);
    const [pickedIds, setPickedIds] = useState<string[]>([]);
    const [payload, setPayload] = useState<ComparisonPayload | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Bootstrap: list senders once so the picker has options.
    useEffect(() => {
        let cancelled = false;
        apiClient<any>('/api/linkedin/analytics/sender-perf?range=90d')
            .then(rows => {
                if (cancelled) return;
                const list: SenderMeta[] = (Array.isArray(rows) ? rows : []).map((r: any) => ({
                    id: r.account_id,
                    display_name: r.display_name,
                    account_type: r.account_type,
                }));
                setAllSenders(list);
                // Auto-pick the top 2 senders so the panel renders something
                // by default without the user having to fiddle with the picker.
                if (list.length >= 2) setPickedIds([list[0].id, list[1].id]);
                else if (list.length === 1) setPickedIds([list[0].id]);
            })
            .catch(() => {});
        return () => { cancelled = true; };
    }, []);

    useEffect(() => {
        if (pickedIds.length === 0) { setPayload(null); return; }
        let cancelled = false;
        setLoading(true);
        const qs = new URLSearchParams({
            sender_ids: pickedIds.join(','),
            start_date: startDate,
            end_date: endDate,
        });
        apiClient<ComparisonPayload>(`/api/linkedin/analytics/sender-comparison?${qs}`)
            .then(p => {
                if (cancelled) return;
                setPayload(p);
                setError(null);
            })
            .catch(err => {
                if (cancelled) return;
                setError(err?.message || 'Failed to load comparison');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, [pickedIds, startDate, endDate]);

    // Union of all days across both series so charts share an x-axis.
    const days = useMemo(() => {
        const set = new Set<string>();
        for (const s of payload?.series ?? []) for (const d of s.daily) set.add(d.day);
        return Array.from(set).sort();
    }, [payload]);

    const totalsFor = (entry: SeriesEntry | undefined) => {
        if (!entry) return { invites: 0, messages: 0, inmails: 0, all: 0 };
        let invites = 0, messages = 0, inmails = 0;
        for (const d of entry.daily) { invites += d.invites; messages += d.messages; inmails += d.inmails; }
        return { invites, messages, inmails, all: invites + messages + inmails };
    };

    return (
        <div className="premium-card !p-0 overflow-hidden">
            <div className="px-4 py-3 flex items-center justify-between gap-3 flex-wrap" style={{ borderBottom: '1px solid #D1CBC5' }}>
                <div className="flex items-center gap-2">
                    <Users2 className="w-4 h-4 text-gray-700" />
                    <h2 className="text-sm font-semibold text-gray-900">Sender comparison</h2>
                    <span className="text-[11px] text-gray-500">{startDate} → {endDate}</span>
                </div>
                <div className="min-w-[260px]">
                    <MultiSelectDropdown
                        placeholder={allSenders.length === 0 ? 'No senders' : 'Pick up to 2 senders…'}
                        selected={pickedIds}
                        onChange={(next) => {
                            if (next.length > 2) {
                                toast('You can compare at most 2 senders at a time', { icon: '⚠️' });
                                return;
                            }
                            setPickedIds(next);
                        }}
                        searchable
                        searchPlaceholder="Search senders…"
                        options={allSenders.map(s => ({ value: s.id, label: s.display_name }))}
                    />
                </div>
            </div>

            <div className="p-4">
                {pickedIds.length === 0 ? (
                    <div className="text-center text-xs text-gray-500 py-8">Pick at least one sender to compare</div>
                ) : loading ? (
                    <div className="flex items-center justify-center py-8 text-xs text-gray-500">
                        <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading comparison…
                    </div>
                ) : error ? (
                    <div className="text-center text-xs text-rose-600 py-8">{error}</div>
                ) : !payload ? null : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                        {payload.series.map((s, idx) => {
                            const t = totalsFor(s);
                            const max = Math.max(1, ...days.map(d => {
                                const cell = s.daily.find(x => x.day === d);
                                return (cell?.invites ?? 0) + (cell?.messages ?? 0) + (cell?.inmails ?? 0);
                            }));
                            const color = PALETTE[idx % PALETTE.length];
                            return (
                                <div key={s.sender_id} className="rounded-lg p-3" style={{ border: '1px solid #E8E3DC', background: '#FFFFFF' }}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                                        <div className="min-w-0 flex-1">
                                            <div className="text-xs font-semibold text-gray-900 truncate">{s.display_name}</div>
                                            <div className="text-[10px] text-gray-500">{s.account_type.replace(/_/g, ' ')}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-[10px] text-gray-500">Total</div>
                                            <div className="text-sm font-semibold text-gray-900">{t.all.toLocaleString()}</div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2 mb-3 text-center">
                                        <div className="rounded-md py-1.5" style={{ background: '#F3F4F6' }}>
                                            <div className="text-[10px] text-gray-500">Invites</div>
                                            <div className="text-xs font-semibold text-gray-900">{t.invites}</div>
                                        </div>
                                        <div className="rounded-md py-1.5" style={{ background: '#F3F4F6' }}>
                                            <div className="text-[10px] text-gray-500">Messages</div>
                                            <div className="text-xs font-semibold text-gray-900">{t.messages}</div>
                                        </div>
                                        <div className="rounded-md py-1.5" style={{ background: '#F3F4F6' }}>
                                            <div className="text-[10px] text-gray-500">InMails</div>
                                            <div className="text-xs font-semibold text-gray-900">{t.inmails}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-end gap-0.5 h-20">
                                        {days.map(d => {
                                            const cell = s.daily.find(x => x.day === d);
                                            const v = (cell?.invites ?? 0) + (cell?.messages ?? 0) + (cell?.inmails ?? 0);
                                            return (
                                                <div key={d} className="flex-1 flex flex-col justify-end h-full">
                                                    <div
                                                        className="rounded-t"
                                                        style={{ height: `${(v / max) * 100}%`, minHeight: v > 0 ? 2 : 0, background: color, opacity: v > 0 ? 0.85 : 0 }}
                                                        title={`${d}: ${v}`}
                                                    />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
