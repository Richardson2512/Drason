'use client';

import React from 'react';

interface RowLimitSelectorProps {
    limit: number;
    onLimitChange: (limit: number) => void;
}

export function RowLimitSelector({ limit, onLimitChange }: RowLimitSelectorProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>Rows per page:</span>
            <select
                value={limit}
                onChange={(e) => onLimitChange(Number(e.target.value))}
                style={{
                    padding: '0.25rem 0.5rem',
                    borderRadius: '0.375rem',
                    border: '1px solid #E5E7EB',
                    fontSize: '0.875rem',
                    color: '#374151',
                    background: '#FFFFFF',
                    cursor: 'pointer',
                    outline: 'none'
                }}
            >
                <option value={20}>20</option>
                <option value={50}>50</option>
            </select>
        </div>
    );
}
