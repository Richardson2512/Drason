'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export interface BulkAction {
    label: string;
    icon: string;
    variant: 'default' | 'danger' | 'warning' | 'success';
    onClick: (selectedIds: Set<string>) => Promise<void>;
    confirmMessage?: string;
}

interface BulkActionBarProps {
    selectedCount: number;
    totalCount: number;
    entityName: string;
    actions: BulkAction[];
    selectedIds: Set<string>;
    onClearSelection: () => void;
}

const variantStyles: Record<string, { bg: string; border: string; text: string; hover: string }> = {
    default: { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-700', hover: 'hover:bg-gray-100' },
    danger: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-700', hover: 'hover:bg-red-100' },
    warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-700', hover: 'hover:bg-amber-100' },
    success: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-700', hover: 'hover:bg-green-100' },
};

export default function BulkActionBar({ selectedCount, totalCount, entityName, actions, selectedIds, onClearSelection }: BulkActionBarProps) {
    const [loading, setLoading] = useState<string | null>(null);
    const [confirmAction, setConfirmAction] = useState<BulkAction | null>(null);

    if (selectedCount === 0) return null;

    const handleAction = async (action: BulkAction) => {
        if (action.confirmMessage && !confirmAction) {
            setConfirmAction(action);
            return;
        }
        setConfirmAction(null);
        setLoading(action.label);
        try {
            await action.onClick(selectedIds);
            onClearSelection();
        } catch (err) {
            console.error('Bulk action failed:', err);
        } finally {
            setLoading(null);
        }
    };

    return (
        <>
            <div className="sticky top-0 z-20 flex items-center justify-between gap-4 px-5 py-3 rounded-xl border shadow-sm"
                style={{
                    background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)',
                    borderColor: '#BFDBFE',
                }}
            >
                <div className="flex items-center gap-3">
                    <div className="bg-blue-600 text-white rounded-full w-7 h-7 flex items-center justify-center text-xs font-bold">
                        {selectedCount}
                    </div>
                    <span className="text-sm font-semibold text-blue-800">
                        {selectedCount} of {totalCount} {entityName}{selectedCount !== 1 ? 's' : ''} selected
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {actions.map(action => {
                        const style = variantStyles[action.variant] || variantStyles.default;
                        const isLoading = loading === action.label;
                        return (
                            <button
                                key={action.label}
                                onClick={() => handleAction(action)}
                                disabled={!!loading}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${style.bg} ${style.border} ${style.text} ${style.hover} disabled:opacity-50`}
                            >
                                {isLoading ? (
                                    <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <span>{action.icon}</span>
                                )}
                                {action.label}
                            </button>
                        );
                    })}

                    <button
                        onClick={onClearSelection}
                        className="p-1.5 rounded-lg hover:bg-blue-100 transition-colors text-blue-400 hover:text-blue-600"
                        title="Clear selection"
                    >
                        <X size={16} />
                    </button>
                </div>
            </div>

            {/* Confirmation overlay */}
            {confirmAction && (
                <div className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm flex items-center justify-center" onClick={() => setConfirmAction(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-sm w-[90%] shadow-xl" onClick={e => e.stopPropagation()}>
                        <div className="text-center mb-4">
                            <div className="text-3xl mb-2">{confirmAction.icon}</div>
                            <h3 className="text-lg font-bold text-gray-900">{confirmAction.label}</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                {confirmAction.confirmMessage?.replace('{count}', String(selectedCount))}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setConfirmAction(null)}
                                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleAction(confirmAction)}
                                className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors ${
                                    confirmAction.variant === 'danger' ? 'bg-red-600 hover:bg-red-700'
                                        : confirmAction.variant === 'warning' ? 'bg-amber-600 hover:bg-amber-700'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                }`}
                            >
                                Confirm
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
