'use client';

/**
 * Schedule calendar view — visualizes a campaign's send window across the
 * week. Each enabled day is rendered as a column with a shaded band over
 * the active hour range. The "now" line indicates current time in the
 * campaign's timezone, so the user can see at a glance whether sending is
 * happening right now or queued for later.
 *
 * Renders ZERO numbers as text — pure visual schedule. Pair with the
 * existing text "Schedule" card if you also want explicit values.
 */

const DAYS: { key: string; short: string }[] = [
    { key: 'mon', short: 'Mon' },
    { key: 'tue', short: 'Tue' },
    { key: 'wed', short: 'Wed' },
    { key: 'thu', short: 'Thu' },
    { key: 'fri', short: 'Fri' },
    { key: 'sat', short: 'Sat' },
    { key: 'sun', short: 'Sun' },
];

interface Props {
    timezone: string | null;
    days: string[]; // lowercase 3-letter codes: ['mon', 'tue', ...]
    startTime: string | null; // 'HH:MM'
    endTime: string | null;   // 'HH:MM'
}

function parseTime(t: string | null): number | null {
    if (!t) return null;
    const [h, m] = t.split(':').map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return h + m / 60;
}

export default function ScheduleCalendarView({ timezone, days, startTime, endTime }: Props) {
    const startHr = parseTime(startTime);
    const endHr = parseTime(endTime);
    const hasWindow = startHr !== null && endHr !== null && endHr > startHr;
    const enabledDays = new Set((days || []).map(d => d.toLowerCase()));

    // Get current day-of-week + hour in the campaign's timezone for the "now" marker.
    const tz = timezone || 'UTC';
    let nowDay: string = 'mon';
    let nowHr = 0;
    try {
        const parts = new Intl.DateTimeFormat('en-US', {
            timeZone: tz,
            weekday: 'short',
            hour: '2-digit',
            minute: '2-digit',
            hourCycle: 'h23',
        }).formatToParts(new Date());
        const w = parts.find(p => p.type === 'weekday')?.value || 'Mon';
        nowDay = ({ Sun: 'sun', Mon: 'mon', Tue: 'tue', Wed: 'wed', Thu: 'thu', Fri: 'fri', Sat: 'sat' } as Record<string, string>)[w] || 'mon';
        const h = Number(parts.find(p => p.type === 'hour')?.value || '0');
        const m = Number(parts.find(p => p.type === 'minute')?.value || '0');
        nowHr = h + m / 60;
    } catch { /* fall back to defaults */ }

    return (
        <div className="premium-card p-3 flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-gray-900 m-0">Schedule</h2>
                <span className="text-[10px] text-gray-400">{tz}</span>
            </div>

            {/* Calendar grid — 8 columns: 1 hour-axis + 7 days */}
            <div className="grid gap-0.5" style={{ gridTemplateColumns: '28px repeat(7, 1fr)' }}>
                {/* Header row */}
                <div />
                {DAYS.map(d => (
                    <div
                        key={d.key}
                        className={`text-center text-[10px] font-semibold uppercase tracking-wider py-1 rounded ${
                            d.key === nowDay ? 'text-gray-900 bg-amber-50' : 'text-gray-500'
                        }`}
                    >
                        {d.short}
                    </div>
                ))}
            </div>

            {/* Day columns with hour shading */}
            <div className="grid gap-0.5 relative" style={{ gridTemplateColumns: '28px repeat(7, 1fr)', height: 168 }}>
                {/* Hour ruler — 0, 6, 12, 18 labels */}
                <div className="relative h-full text-[9px] text-gray-400 flex flex-col">
                    {[0, 6, 12, 18, 24].map(h => (
                        <div
                            key={h}
                            className="absolute right-1 -translate-y-1/2 tabular-nums"
                            style={{ top: `${(h / 24) * 100}%` }}
                        >
                            {h.toString().padStart(2, '0')}
                        </div>
                    ))}
                </div>

                {/* Day cells */}
                {DAYS.map(d => {
                    const isEnabled = enabledDays.size === 0 || enabledDays.has(d.key);
                    const isToday = d.key === nowDay;

                    return (
                        <div
                            key={d.key}
                            className="relative rounded overflow-hidden"
                            style={{
                                // Off days = soft striped pattern; enabled days = clean white so the
                                // active band reads as "the schedule is here" instead of inverse.
                                background: isEnabled
                                    ? '#FFFFFF'
                                    : 'repeating-linear-gradient(45deg, #F5F5F5 0px, #F5F5F5 4px, #FAFAFA 4px, #FAFAFA 8px)',
                                border: isToday ? '1px solid #FBBF24' : '1px solid #E8E3DC',
                            }}
                        >
                            {/* Hour gridlines */}
                            {[6, 12, 18].map(h => (
                                <div
                                    key={h}
                                    className="absolute left-0 right-0 border-t border-gray-100"
                                    style={{ top: `${(h / 24) * 100}%` }}
                                />
                            ))}

                            {/* Active send window — brand-green tinted band with the
                                range labelled inside on the today column for orientation. */}
                            {isEnabled && hasWindow && (
                                <div
                                    className="absolute left-0 right-0 flex flex-col items-center justify-center"
                                    style={{
                                        top: `${(startHr! / 24) * 100}%`,
                                        height: `${((endHr! - startHr!) / 24) * 100}%`,
                                        background: '#1C4532',
                                        opacity: 0.18,
                                    }}
                                />
                            )}
                            {/* Solid edges for the band — top + bottom 1px lines so
                                the boundaries are crisp even when the fill is faint. */}
                            {isEnabled && hasWindow && (
                                <>
                                    <div
                                        className="absolute left-0 right-0"
                                        style={{
                                            top: `${(startHr! / 24) * 100}%`,
                                            height: '1px',
                                            background: '#1C4532',
                                            opacity: 0.5,
                                        }}
                                    />
                                    <div
                                        className="absolute left-0 right-0"
                                        style={{
                                            top: `${(endHr! / 24) * 100}%`,
                                            height: '1px',
                                            background: '#1C4532',
                                            opacity: 0.5,
                                        }}
                                    />
                                </>
                            )}
                            {/* Time label inside the band on the today column — gives
                                a single point of orientation without cluttering every
                                column with redundant text. */}
                            {isToday && isEnabled && hasWindow && (
                                <div
                                    className="absolute left-0 right-0 flex items-center justify-center text-[9px] font-semibold text-emerald-900 pointer-events-none"
                                    style={{
                                        top: `${(startHr! / 24) * 100}%`,
                                        height: `${((endHr! - startHr!) / 24) * 100}%`,
                                    }}
                                >
                                    {startTime}–{endTime}
                                </div>
                            )}

                            {/* "Now" line on today */}
                            {isToday && (
                                <div
                                    className="absolute left-0 right-0 h-px bg-amber-500"
                                    style={{ top: `${(nowHr / 24) * 100}%` }}
                                >
                                    <div className="absolute -left-0.5 -top-1 w-1.5 h-1.5 rounded-full bg-amber-500" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Legend */}
            <div className="flex items-center gap-3 text-[10px] text-gray-500 pt-1">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded" style={{ background: '#1C4532', opacity: 0.18, border: '1px solid #1C4532' }} />
                    <span>Sending</span>
                </div>
                <div className="flex items-center gap-1">
                    <div
                        className="w-2 h-2 rounded border border-gray-200"
                        style={{ background: 'repeating-linear-gradient(45deg, #F5F5F5 0px, #F5F5F5 2px, #FAFAFA 2px, #FAFAFA 4px)' }}
                    />
                    <span>Off</span>
                </div>
                <div className="flex items-center gap-1">
                    <div className="w-2 h-px bg-amber-500" />
                    <span>Now</span>
                </div>
                {!hasWindow && <span className="ml-auto italic">No send window set</span>}
            </div>
        </div>
    );
}
