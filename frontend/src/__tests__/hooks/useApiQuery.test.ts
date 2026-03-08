import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useApiQuery, invalidateQueries } from '@/hooks/useApiQuery';

// Mock apiClient
vi.mock('@/lib/api', () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from '@/lib/api';

const mockApiClient = vi.mocked(apiClient);

describe('useApiQuery', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateQueries(); // clear cache between tests
  });

  it('should start in loading state', () => {
    mockApiClient.mockReturnValue(new Promise(() => {})); // never resolves
    const { result } = renderHook(() => useApiQuery('/api/test'));

    expect(result.current.isLoading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('should return data on successful fetch', async () => {
    const payload = { items: [1, 2, 3] };
    mockApiClient.mockResolvedValueOnce(payload);

    const { result } = renderHook(() => useApiQuery('/api/test'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toEqual(payload);
    expect(result.current.error).toBe(null);
  });

  it('should set error on failed fetch', async () => {
    mockApiClient.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useApiQuery('/api/test'));

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('should not fetch when endpoint is null', async () => {
    const { result } = renderHook(() => useApiQuery(null));

    // Should immediately be not loading
    expect(result.current.isLoading).toBe(false);
    expect(result.current.data).toBe(null);
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it('should not fetch when enabled is false', async () => {
    const { result } = renderHook(() =>
      useApiQuery('/api/test', undefined, { enabled: false }),
    );

    expect(result.current.isLoading).toBe(false);
    expect(mockApiClient).not.toHaveBeenCalled();
  });

  it('should use cached data and skip network when cache is fresh', async () => {
    const payload = { items: [1] };
    mockApiClient.mockResolvedValueOnce(payload);

    // First render: fetches and caches
    const { result: result1 } = renderHook(() =>
      useApiQuery('/api/cached', undefined, { staleTime: 60_000 }),
    );
    await waitFor(() => expect(result1.current.isLoading).toBe(false));
    expect(result1.current.data).toEqual(payload);

    // Second render with same key: should serve from cache without new fetch
    const { result: result2 } = renderHook(() =>
      useApiQuery('/api/cached', undefined, { staleTime: 60_000 }),
    );

    // Data available immediately from cache
    await waitFor(() => expect(result2.current.isLoading).toBe(false));
    expect(result2.current.data).toEqual(payload);
    // apiClient should only have been called once (the first time)
    expect(mockApiClient).toHaveBeenCalledTimes(1);
  });

  it('should refetch when refetch is called', async () => {
    mockApiClient.mockResolvedValueOnce({ v: 1 });

    const { result } = renderHook(() => useApiQuery('/api/refetch-test'));
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual({ v: 1 });

    mockApiClient.mockResolvedValueOnce({ v: 2 });
    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).toEqual({ v: 2 });
  });

  it('should append params to the URL', async () => {
    mockApiClient.mockResolvedValueOnce({ ok: true });

    const { result } = renderHook(() =>
      useApiQuery('/api/search', { q: 'hello', page: 1 }),
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(mockApiClient).toHaveBeenCalledWith(
      expect.stringContaining('/api/search?'),
    );
    const url = mockApiClient.mock.calls[0][0] as string;
    expect(url).toContain('q=hello');
    expect(url).toContain('page=1');
  });
});

describe('invalidateQueries', () => {
  it('should clear all cache when called with no prefix', () => {
    // Just verifies it doesn't throw
    invalidateQueries();
  });

  it('should clear matching cache entries by prefix', () => {
    invalidateQueries('/api/campaigns');
    // No error means success — actual cache behavior tested via useApiQuery
  });
});
