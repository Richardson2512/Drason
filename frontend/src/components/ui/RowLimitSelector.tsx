'use client';

import React from 'react';
import CustomSelect from './CustomSelect';

interface RowLimitSelectorProps {
    limit: number;
    onLimitChange: (limit: number) => void;
}

const OPTIONS = [
    { value: '20', label: '20' },
    { value: '50', label: '50' },
];

export function RowLimitSelector({ limit, onLimitChange }: RowLimitSelectorProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Rows per page:</span>
            <div style={{ minWidth: 72 }}>
                <CustomSelect
                    value={String(limit)}
                    onChange={(v) => onLimitChange(Number(v))}
                    options={OPTIONS}
                />
            </div>
        </div>
    );
}
