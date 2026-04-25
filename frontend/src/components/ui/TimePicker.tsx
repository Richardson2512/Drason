'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Clock } from 'lucide-react';

interface TimePickerProps {
    value: string; // HH:MM 24-hour (matches native <input type="time">)
    onChange: (value: string) => void;
    placeholder?: string;
    minuteStep?: number; // default 15
    className?: string;
    disabled?: boolean;
}

function parseTime(s: string | undefined): { h: number; m: number } | null {
    if (!s) return null;
    const match = /^(\d{1,2}):(\d{2})$/.exec(s.trim());
    if (!match) return null;
    const h = Math.min(23, Math.max(0, Number(match[1])));
    const m = Math.min(59, Math.max(0, Number(match[2])));
    return { h, m };
}

function toHHMM(h: number, m: number): string {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function formatDisplay(h: number, m: number): string {
    // 12-hour with am/pm for display; underlying value stays 24-hour
    const period = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 === 0 ? 12 : h % 12;
    return `${hour12}:${String(m).padStart(2, '0')} ${period}`;
}

export default function TimePicker({ value, onChange, placeholder = 'Select time', minuteStep = 15, className = '', disabled = false }: TimePickerProps) {
    const parsed = useMemo(() => parseTime(value), [value]);
    const [open, setOpen] = useState(false);
    const [hour, setHour] = useState(parsed?.h ?? 9);
    const [minute, setMinute] = useState(parsed?.m ?? 0);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const hourColRef = useRef<HTMLDivElement>(null);
    const minuteColRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (parsed) {
            setHour(parsed.h);
            setMinute(parsed.m);
        }
    }, [parsed]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    // Scroll selected hour/minute into view when opening
    useEffect(() => {
        if (!open) return;
        requestAnimationFrame(() => {
            hourColRef.current?.querySelector<HTMLElement>('[data-selected="true"]')?.scrollIntoView({ block: 'center' });
            minuteColRef.current?.querySelector<HTMLElement>('[data-selected="true"]')?.scrollIntoView({ block: 'center' });
        });
    }, [open]);

    const hours = Array.from({ length: 24 }, (_, i) => i);
    const minutes = Array.from({ length: Math.ceil(60 / minuteStep) }, (_, i) => i * minuteStep);

    const commit = (h: number, m: number) => {
        setHour(h);
        setMinute(m);
        onChange(toHHMM(h, m));
    };

    return (
        <div ref={wrapperRef} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setOpen(v => !v)}
                className="w-full px-3 py-2 rounded-lg text-xs text-left bg-white flex items-center justify-between gap-2 cursor-pointer transition-colors hover:bg-[#FAFAF8] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ border: '1px solid #D1CBC5' }}
            >
                <span className={parsed ? 'text-gray-900' : 'text-gray-400'}>
                    {parsed ? formatDisplay(parsed.h, parsed.m) : placeholder}
                </span>
                <Clock size={12} className="text-gray-400 shrink-0" />
            </button>

            {open && (
                <div
                    className="absolute left-0 mt-1 bg-white z-[9999] rounded-lg overflow-hidden flex"
                    style={{ border: '1px solid #D1CBC5', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', minWidth: 220 }}
                >
                    {/* Hour column */}
                    <div ref={hourColRef} className="flex flex-col overflow-y-auto max-h-56" style={{ minWidth: 90, borderRight: '1px solid #E8E3DC' }}>
                        <div className="sticky top-0 px-2 py-1 text-[9px] font-bold uppercase text-gray-400 tracking-wider bg-[#FAFAF8]" style={{ borderBottom: '1px solid #E8E3DC' }}>
                            Hour
                        </div>
                        {hours.map(h => {
                            const isSel = h === hour;
                            return (
                                <button
                                    key={h}
                                    type="button"
                                    data-selected={isSel}
                                    onClick={() => commit(h, minute)}
                                    className={`px-3 py-1 text-xs cursor-pointer transition-colors border-none text-left ${
                                        isSel
                                            ? 'bg-gray-900 text-white font-semibold'
                                            : 'bg-transparent text-gray-700 hover:bg-[#F5F1EA]'
                                    }`}
                                >
                                    {formatDisplay(h, 0).replace(':00', '')}
                                </button>
                            );
                        })}
                    </div>

                    {/* Minute column */}
                    <div ref={minuteColRef} className="flex flex-col overflow-y-auto max-h-56 flex-1">
                        <div className="sticky top-0 px-2 py-1 text-[9px] font-bold uppercase text-gray-400 tracking-wider bg-[#FAFAF8]" style={{ borderBottom: '1px solid #E8E3DC' }}>
                            Minute
                        </div>
                        {minutes.map(m => {
                            const isSel = m === minute;
                            return (
                                <button
                                    key={m}
                                    type="button"
                                    data-selected={isSel}
                                    onClick={() => commit(hour, m)}
                                    className={`px-3 py-1 text-xs cursor-pointer transition-colors border-none text-left ${
                                        isSel
                                            ? 'bg-gray-900 text-white font-semibold'
                                            : 'bg-transparent text-gray-700 hover:bg-[#F5F1EA]'
                                    }`}
                                >
                                    :{String(m).padStart(2, '0')}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}
