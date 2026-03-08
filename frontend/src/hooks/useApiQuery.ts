/**
 * useApiQuery — SWR-like data fetching hook with module-level cache.
 *
 * Replaces the repeated useState+useEffect+useCallback fetch pattern
 * that appears in every dashboard page.
 *
 * Features:
 *  - Automatic cache with configurable stale time (default 30s)
 *  - Stale-while-revalidate: serves cached data instantly, refetches in background
 *  - Params filtering: undefined/empty values are excluded from the URL
 *  - Conditional fetching: pass endpoint=null to disable
 *  - Unmount-safe: won't setState after component unmounts
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { apiClient } from '@/lib/api';

// ── Module-level cache ──────────────────────────────────────────────
const queryCache = new Map<string, { data: unknown; timestamp: number }>();

/** Invalidate cached entries whose key starts with `prefix`, or clear all. */
export function invalidateQueries(prefix?: string) {
  if (!prefix) {
    queryCache.clear();
    return;
  }
  for (const key of queryCache.keys()) {
    if (key.startsWith(prefix)) {
      queryCache.delete(key);
    }
  }
}

// ── Helpers ─────────────────────────────────────────────────────────
type ParamValue = string | number | boolean | undefined | null;

function buildUrl(
  endpoint: string,
  params?: Record<string, ParamValue>,
): string {
  if (!params) return endpoint;
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sp.set(key, String(value));
    }
  });
  const qs = sp.toString();
  return qs ? `${endpoint}?${qs}` : endpoint;
}

// ── Hook ────────────────────────────────────────────────────────────
export interface UseApiQueryResult<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useApiQuery<T = unknown>(
  endpoint: string | null,
  params?: Record<string, ParamValue>,
  options?: { staleTime?: number; enabled?: boolean },
): UseApiQueryResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const enabled = options?.enabled !== false;
  const staleTime = options?.staleTime ?? 30_000;

  // Stable serialisation of params so we can use it as a dep without
  // triggering infinite re-renders from new object references.
  const paramsKey = params ? JSON.stringify(params) : '';
  const cacheKey = endpoint ? `${endpoint}:${paramsKey}` : null;

  // Guard against setState after unmount
  const mountedRef = useRef(true);
  useEffect(() => () => { mountedRef.current = false; }, []);

  // Keep latest params in a ref so the callback closure always has fresh values
  // without needing `params` (unstable reference) in the dep array.
  const paramsRef = useRef(params);
  paramsRef.current = params;

  const refetch = useCallback(async () => {
    if (!endpoint || !enabled) return;

    const url = buildUrl(endpoint, paramsRef.current);
    setIsLoading(true);
    setError(null);

    try {
      const result = await apiClient<T>(url);
      if (!mountedRef.current) return;
      setData(result);
      if (cacheKey) {
        queryCache.set(cacheKey, { data: result, timestamp: Date.now() });
      }
    } catch (err: unknown) {
      if (!mountedRef.current) return;
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      if (mountedRef.current) setIsLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endpoint, paramsKey, cacheKey, enabled]);

  useEffect(() => {
    if (!endpoint || !cacheKey || !enabled) {
      setIsLoading(false);
      return;
    }

    // Serve from cache immediately
    const cached = queryCache.get(cacheKey);
    if (cached) {
      setData(cached.data as T);
      if (Date.now() - cached.timestamp < staleTime) {
        setIsLoading(false);
        return; // Cache is fresh — skip network
      }
      // Stale cache — show cached data, refetch in background
      setIsLoading(false);
    }

    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cacheKey, enabled]);

  return { data, isLoading, error, refetch };
}
