'use client';

import React from 'react';

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
}

export function PaginationControls({ currentPage, totalPages, onPageChange }: PaginationControlsProps) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.875rem', color: '#6B7280' }}>
                Page <span style={{ fontWeight: 600, color: '#111827' }}>{currentPage}</span> of <span style={{ fontWeight: 600, color: '#111827' }}>{totalPages}</span>
            </span>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #E5E7EB',
                        background: currentPage <= 1 ? '#F3F4F6' : '#FFFFFF',
                        color: currentPage <= 1 ? '#9CA3AF' : '#374151',
                        cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    style={{
                        padding: '0.5rem',
                        borderRadius: '0.375rem',
                        border: '1px solid #E5E7EB',
                        background: currentPage >= totalPages ? '#F3F4F6' : '#FFFFFF',
                        color: currentPage >= totalPages ? '#9CA3AF' : '#374151',
                        cursor: currentPage >= totalPages ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>
        </div>
    );
}
