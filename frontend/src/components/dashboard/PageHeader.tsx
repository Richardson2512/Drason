import React from 'react';

/**
 * Shared dashboard page header — unifies the Protection + Sequencer pages
 * under the same visual rhythm:
 *   - text-2xl bold title
 *   - text-sm gray subtitle
 *   - right-aligned action slot (typically a primary or ghost button)
 *
 * Pair with an outer wrapper `<div className="p-4 flex flex-col gap-4">`
 * for the canonical page scaffold.
 */
export default function PageHeader({
    title,
    subtitle,
    actions,
    icon,
}: {
    title: string;
    subtitle?: string;
    actions?: React.ReactNode;
    icon?: React.ReactNode;
}) {
    return (
        <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-3">
                {icon && (
                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-700 mt-0.5">
                        {icon}
                    </div>
                )}
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
                    {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
                </div>
            </div>
            {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
        </div>
    );
}
