'use client';

interface StatItem {
    label: string;
    value: number;
    color: string;
}

interface EntityStatsBarProps {
    stats: StatItem[];
    total: number;
    totalLabel?: string;
}

export default function EntityStatsBar({ stats, total, totalLabel = 'Total' }: EntityStatsBarProps) {
    return (
        <div className="flex items-center gap-2 flex-wrap">
            {/* Total */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-xs text-gray-500 font-medium">{totalLabel}</span>
                <span className="text-sm font-bold text-gray-900">{total.toLocaleString()}</span>
            </div>

            <div className="w-px h-5 bg-gray-200" />

            {/* Status breakdown */}
            {stats.map(stat => (
                <div
                    key={stat.label}
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg"
                    style={{ background: `${stat.color}10`, border: `1px solid ${stat.color}30` }}
                >
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: stat.color }} />
                    <span className="text-xs text-gray-600 font-medium">{stat.label}</span>
                    <span className="text-xs font-bold" style={{ color: stat.color }}>{stat.value.toLocaleString()}</span>
                </div>
            ))}
        </div>
    );
}
