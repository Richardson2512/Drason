'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface DatePickerProps {
    value: string; // YYYY-MM-DD (matches native <input type="date">)
    onChange: (value: string) => void;
    placeholder?: string;
    minDate?: string; // YYYY-MM-DD
    maxDate?: string; // YYYY-MM-DD
    className?: string;
    disabled?: boolean;
}

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DAY_LABELS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function parseYmd(s: string | undefined): Date | null {
    if (!s) return null;
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
    if (!m) return null;
    const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
    return isNaN(d.getTime()) ? null : d;
}

function toYmd(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
}

function sameYmd(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatDisplay(d: Date): string {
    return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function DatePicker({ value, onChange, placeholder = 'Select a date', minDate, maxDate, className = '', disabled = false }: DatePickerProps) {
    const selected = useMemo(() => parseYmd(value), [value]);
    const min = useMemo(() => parseYmd(minDate), [minDate]);
    const max = useMemo(() => parseYmd(maxDate), [maxDate]);

    const [open, setOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => selected || new Date());
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync the calendar view when the external value changes
    useEffect(() => {
        if (selected) setViewDate(selected);
    }, [selected]);

    useEffect(() => {
        if (!open) return;
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [open]);

    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const startWeekday = firstOfMonth.getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Build a 6-row grid of 42 cells
    const cells: Array<{ date: Date; inMonth: boolean }> = [];
    for (let i = 0; i < startWeekday; i++) {
        const d = new Date(year, month, -startWeekday + i + 1);
        cells.push({ date: d, inMonth: false });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push({ date: new Date(year, month, d), inMonth: true });
    }
    while (cells.length < 42) {
        const last = cells[cells.length - 1].date;
        cells.push({ date: new Date(last.getFullYear(), last.getMonth(), last.getDate() + 1), inMonth: false });
    }

    const today = new Date();
    const isDisabled = (d: Date): boolean => {
        if (min && d < new Date(min.getFullYear(), min.getMonth(), min.getDate())) return true;
        if (max && d > new Date(max.getFullYear(), max.getMonth(), max.getDate())) return true;
        return false;
    };

    const commit = (d: Date) => {
        if (isDisabled(d)) return;
        onChange(toYmd(d));
        setOpen(false);
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
                <span className={selected ? 'text-gray-900' : 'text-gray-400'}>
                    {selected ? formatDisplay(selected) : placeholder}
                </span>
                <Calendar size={12} className="text-gray-400 shrink-0" />
            </button>

            {open && (
                <div
                    className="absolute left-0 mt-1 bg-white z-[9999] rounded-lg overflow-hidden"
                    style={{ border: '1px solid #D1CBC5', boxShadow: '0 6px 16px rgba(0,0,0,0.08)', minWidth: 260 }}
                >
                    {/* Month header */}
                    <div className="flex items-center justify-between px-2 py-2" style={{ background: '#FAFAF8', borderBottom: '1px solid #E8E3DC' }}>
                        <button
                            type="button"
                            onClick={() => setViewDate(new Date(year, month - 1, 1))}
                            className="p-1 rounded hover:bg-white cursor-pointer bg-transparent border-none"
                            aria-label="Previous month"
                        >
                            <ChevronLeft size={14} className="text-gray-600" />
                        </button>
                        <span className="text-xs font-semibold text-gray-900">{MONTHS[month]} {year}</span>
                        <button
                            type="button"
                            onClick={() => setViewDate(new Date(year, month + 1, 1))}
                            className="p-1 rounded hover:bg-white cursor-pointer bg-transparent border-none"
                            aria-label="Next month"
                        >
                            <ChevronRight size={14} className="text-gray-600" />
                        </button>
                    </div>

                    {/* Day labels */}
                    <div className="grid grid-cols-7 px-2 pt-2">
                        {DAY_LABELS.map((d, i) => (
                            <div key={i} className="text-[9px] font-bold text-gray-400 uppercase text-center py-0.5">{d}</div>
                        ))}
                    </div>

                    {/* Day grid */}
                    <div className="grid grid-cols-7 px-2 pb-2 gap-0.5">
                        {cells.map((c, i) => {
                            const isSel = selected && sameYmd(selected, c.date);
                            const isToday = sameYmd(today, c.date);
                            const disabledCell = isDisabled(c.date);
                            return (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => commit(c.date)}
                                    disabled={disabledCell}
                                    className={`text-[11px] rounded h-7 flex items-center justify-center cursor-pointer transition-colors border-none ${
                                        isSel
                                            ? 'bg-gray-900 text-white font-semibold'
                                            : disabledCell
                                                ? 'bg-transparent text-gray-300 cursor-not-allowed'
                                                : c.inMonth
                                                    ? (isToday
                                                        ? 'bg-[#F5F1EA] text-gray-900 font-semibold hover:bg-[#E8E3DC]'
                                                        : 'bg-transparent text-gray-700 hover:bg-[#F5F1EA]')
                                                    : 'bg-transparent text-gray-300 hover:bg-[#F5F1EA]'
                                    }`}
                                >
                                    {c.date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center justify-between px-2 py-1.5" style={{ borderTop: '1px solid #E8E3DC', background: '#FAFAF8' }}>
                        <button
                            type="button"
                            onClick={() => commit(new Date())}
                            className="text-[10px] font-semibold text-gray-700 hover:text-gray-900 cursor-pointer bg-transparent border-none px-1.5 py-0.5 rounded hover:bg-white"
                        >
                            Today
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => { onChange(''); setOpen(false); }}
                                className="text-[10px] font-semibold text-gray-500 hover:text-red-600 cursor-pointer bg-transparent border-none px-1.5 py-0.5 rounded hover:bg-white"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
