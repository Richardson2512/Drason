/**
 * Reusable Pagination Hook
 *
 * Manages pagination state and selection for data tables
 */

import { useState, useCallback } from 'react';

export interface PaginationMeta {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

export interface UsePaginationResult {
    meta: PaginationMeta;
    setMeta: (meta: PaginationMeta) => void;
    selectedIds: Set<string>;
    setSelectedIds: (ids: Set<string>) => void;
    toggleSelection: (e: React.MouseEvent, id: string) => void;
    toggleSelectAll: (items: any[]) => void;
    clearSelection: () => void;
    isSelected: (id: string) => boolean;
    isAllSelected: (items: any[]) => boolean;
    hasSelection: boolean;
}

/**
 * Hook for managing pagination and row selection in data tables
 *
 * @param initialPage - Starting page number (default: 1)
 * @param initialLimit - Items per page (default: 20)
 * @returns Pagination state and selection utilities
 *
 * @example
 * ```tsx
 * const { meta, setMeta, selectedIds, toggleSelection, toggleSelectAll } = usePagination();
 *
 * // After fetching data
 * setMeta(response.meta);
 *
 * // In table row
 * <input
 *   type="checkbox"
 *   checked={isSelected(item.id)}
 *   onChange={(e) => toggleSelection(e, item.id)}
 * />
 *
 * // Select all checkbox
 * <input
 *   type="checkbox"
 *   checked={isAllSelected(items)}
 *   onChange={() => toggleSelectAll(items)}
 * />
 * ```
 */
export function usePagination(
    initialPage: number = 1,
    initialLimit: number = 20
): UsePaginationResult {
    const [meta, setMeta] = useState<PaginationMeta>({
        total: 0,
        page: initialPage,
        limit: initialLimit,
        totalPages: 1
    });

    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    /**
     * Toggle selection of a single item
     * Prevents event propagation to avoid triggering row click
     */
    const toggleSelection = useCallback((e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    }, []);

    /**
     * Toggle selection of all items on current page
     * If all are selected, deselects all. Otherwise, selects all.
     */
    const toggleSelectAll = useCallback((items: any[]) => {
        const allIds = items.map(item => item.id);
        const allSelected = allIds.every(id => selectedIds.has(id));

        setSelectedIds(prev => {
            const newSet = new Set(prev);
            if (allSelected) {
                // Deselect all on current page
                allIds.forEach(id => newSet.delete(id));
            } else {
                // Select all on current page
                allIds.forEach(id => newSet.add(id));
            }
            return newSet;
        });
    }, [selectedIds]);

    /**
     * Clear all selections
     */
    const clearSelection = useCallback(() => {
        setSelectedIds(new Set());
    }, []);

    /**
     * Check if an item is selected
     */
    const isSelected = useCallback((id: string): boolean => {
        return selectedIds.has(id);
    }, [selectedIds]);

    /**
     * Check if all items on current page are selected
     */
    const isAllSelected = useCallback((items: any[]): boolean => {
        if (items.length === 0) return false;
        return items.every(item => selectedIds.has(item.id));
    }, [selectedIds]);

    /**
     * Check if any items are selected
     */
    const hasSelection = selectedIds.size > 0;

    return {
        meta,
        setMeta,
        selectedIds,
        setSelectedIds,
        toggleSelection,
        toggleSelectAll,
        clearSelection,
        isSelected,
        isAllSelected,
        hasSelection
    };
}

/**
 * Hook for managing simple pagination without selection
 * Use when you only need page state without row selection
 */
export function useSimplePagination(
    initialPage: number = 1,
    initialLimit: number = 20
) {
    const [meta, setMeta] = useState<PaginationMeta>({
        total: 0,
        page: initialPage,
        limit: initialLimit,
        totalPages: 1
    });

    return { meta, setMeta };
}
