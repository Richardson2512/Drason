/**
 * useSortFilterModal — manages the sort/filter modal pattern duplicated
 * across campaigns, leads, mailboxes, and domains pages.
 *
 * Owns both the "live" filter values used for queries AND the temporary
 * values shown inside the modal. On apply, temp -> live. On clear, both
 * reset to defaults.
 *
 * Usage:
 * ```tsx
 * const sf = useSortFilterModal({
 *   sortBy: 'name_asc',
 *   minSent: '',
 *   maxSent: '',
 * });
 *
 * // In fetch params:  sf.values.sortBy
 * // Open modal:       sf.open()
 * // Modal inputs:     value={sf.temp.sortBy}  onChange={v => sf.setTempValue('sortBy', v)}
 * // Apply button:     sf.apply()
 * // Clear button:     sf.clear()
 * // Has active filters: sf.hasActiveFilters
 * ```
 */

import { useState, useCallback } from 'react';

export function useSortFilterModal<T extends Record<string, string>>(defaults: T) {
  // Capture defaults once so the reference is stable across renders
  const [initialDefaults] = useState<T>(() => ({ ...defaults }));
  const [values, setValues] = useState<T>(() => ({ ...defaults }));
  const [temp, setTemp] = useState<T>(() => ({ ...defaults }));
  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => {
    setTemp(values);
    setIsOpen(true);
  }, [values]);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const apply = useCallback(() => {
    setValues(temp);
    setIsOpen(false);
  }, [temp]);

  /** Reset temp values inside modal (does NOT apply) */
  const reset = useCallback(() => {
    setTemp({ ...initialDefaults });
  }, [initialDefaults]);

  /** Clear all filters, apply defaults, and close modal */
  const clear = useCallback(() => {
    setValues({ ...initialDefaults });
    setTemp({ ...initialDefaults });
    setIsOpen(false);
  }, [initialDefaults]);

  const setTempValue = useCallback(<K extends keyof T>(key: K, value: T[K]) => {
    setTemp(prev => ({ ...prev, [key]: value }));
  }, []);

  /** True when any value differs from its default */
  const hasActiveFilters = Object.keys(initialDefaults).some(
    key => values[key] !== initialDefaults[key],
  );

  return {
    values,
    temp,
    isOpen,
    hasActiveFilters,
    open,
    close,
    apply,
    reset,
    clear,
    setTempValue,
  };
}
