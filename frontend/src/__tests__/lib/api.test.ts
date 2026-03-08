import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// We need to mock window.location before importing apiClient
const mockAssign = vi.fn();
Object.defineProperty(window, 'location', {
  value: { pathname: '/dashboard', assign: mockAssign },
  writable: true,
});

// Mock react-hot-toast
vi.mock('react-hot-toast', () => ({
  toast: { error: vi.fn(), success: vi.fn() },
}));

import { apiClient } from '@/lib/api';

describe('apiClient', () => {
  let fetchSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('should auto-unwrap { success: true, data: X } and return X', async () => {
    const payload = { success: true, data: { items: [1, 2, 3] } };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(payload),
    });

    const result = await apiClient('/api/test', { retries: 0 });
    expect(result).toEqual({ items: [1, 2, 3] });
  });

  it('should return raw data when response is not wrapped in { success, data }', async () => {
    const payload = { items: [4, 5, 6] };
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve(payload),
    });

    const result = await apiClient('/api/test', { retries: 0 });
    expect(result).toEqual({ items: [4, 5, 6] });
  });

  it('should throw on non-200 responses with error message from body', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 400,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ success: false, error: 'Validation failed' }),
    });

    await expect(apiClient('/api/test', { retries: 0 })).rejects.toThrow('Validation failed');
  });

  it('should include credentials and JSON headers in fetch call', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: true,
      status: 200,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({ ok: true }),
    });

    await apiClient('/api/test', { retries: 0 });

    expect(fetchSpy).toHaveBeenCalledWith(
      '/api/test',
      expect.objectContaining({
        credentials: 'include',
        headers: expect.objectContaining({
          'Content-Type': 'application/json',
          Accept: 'application/json',
        }),
      }),
    );
  });

  it('should throw generic message when error body has no error field', async () => {
    fetchSpy.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers({ 'content-type': 'application/json' }),
      json: () => Promise.resolve({}),
    });

    await expect(apiClient('/api/test', { retries: 0 })).rejects.toThrow(
      'Request failed with status 500',
    );
  });
});
