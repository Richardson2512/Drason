/**
 * StatBadge Component
 *
 * Small card showing icon, label, and value for stats display
 */

interface StatBadgeProps {
    icon: string;
    label: string;
    value: string | number;
}

export function StatBadge({ icon, label, value }: StatBadgeProps) {
    return (
        <div className="stat-badge-hover">
            <div className="text-2xl mb-1">{icon}</div>
            <div className="text-xs text-slate-500 mb-1 font-medium">{label}</div>
            <div className="text-lg font-bold text-gray-900">{value}</div>
        </div>
    );
}
