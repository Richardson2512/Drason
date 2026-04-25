'use client';

/**
 * Interactive stat pills used across Leads, Mailboxes, Domains, and
 * Campaigns. When `onToggle` is provided, each pill acts as a filter
 * button — clicking "Healthy" shows only healthy entities, clicking the
 * "All" pill clears filters. This replaces the old pattern where the
 * page rendered stat pills AND a separate filter dropdown/tab row that
 * duplicated the same taxonomy.
 *
 * Color discipline: semantic color appears only as a 6px dot next to
 * the label. The pill chrome (bg, border, text) is grayscale. Active
 * state flips to a solid dark fill. This keeps the protection pages
 * from feeling like a rainbow while preserving the status signal.
 */

interface StatItem {
    /** Filter key. Defaults to lowercased label. */
    key?: string;
    label: string;
    value: number;
    /** Small dot color — green/amber/red/blue semantic hint. */
    color: string;
}

interface EntityStatsBarProps {
    stats: StatItem[];
    total: number;
    totalLabel?: string;
    /** Value assigned to the "All" pill. Default: 'all'. */
    totalKey?: string;
    /**
     * Active filter keys. For single-select callers (e.g. leads tab),
     * pass `[currentTab]` or `[]` when tab is 'all'. For multi-select
     * callers (e.g. mailboxes status), pass the full selected array.
     */
    activeKeys?: string[];
    /**
     * When provided, pills become buttons. Callers decide single vs
     * multi select semantics by what they do with the key.
     */
    onToggle?: (key: string) => void;
}

export default function EntityStatsBar({
    stats,
    total,
    totalLabel = 'All',
    totalKey = 'all',
    activeKeys = [],
    onToggle,
}: EntityStatsBarProps) {
    const interactive = !!onToggle;
    const isAllActive = activeKeys.length === 0 || activeKeys.includes(totalKey);

    return (
        <div className="flex items-center gap-1.5 flex-wrap">
            <Pill
                active={isAllActive}
                interactive={interactive}
                onClick={() => onToggle?.(totalKey)}
                label={totalLabel}
                value={total}
            />
            {stats.map((stat) => {
                const key = stat.key ?? stat.label.toLowerCase();
                const active = activeKeys.includes(key);
                return (
                    <Pill
                        key={key}
                        active={active}
                        interactive={interactive}
                        onClick={() => onToggle?.(key)}
                        dotColor={stat.color}
                        label={stat.label}
                        value={stat.value}
                    />
                );
            })}
        </div>
    );
}

function Pill({
    active,
    interactive,
    onClick,
    dotColor,
    label,
    value,
}: {
    active: boolean;
    interactive: boolean;
    onClick: () => void;
    dotColor?: string;
    label: string;
    value: number;
}) {
    const baseClasses = 'flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap';
    const style: React.CSSProperties = active
        ? { background: '#111827', color: '#FFFFFF', border: '1px solid #111827' }
        : { background: '#F9FAFB', color: '#4B5563', border: '1px solid #E5E7EB' };

    const inner = (
        <>
            {dotColor && (
                <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ background: active ? '#FFFFFF' : dotColor }}
                />
            )}
            <span className="font-medium">{label}</span>
            <span className={active ? 'font-bold' : 'font-bold text-gray-900'}>
                {value.toLocaleString()}
            </span>
        </>
    );

    if (interactive) {
        return (
            <button
                type="button"
                onClick={onClick}
                className={`${baseClasses} cursor-pointer hover:opacity-90`}
                style={style}
            >
                {inner}
            </button>
        );
    }
    return (
        <div className={baseClasses} style={style}>
            {inner}
        </div>
    );
}
