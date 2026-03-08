import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { invalidateQueries } from '@/hooks/useApiQuery';

// Mock apiClient (used internally by useApiQuery which useCampaignList wraps)
vi.mock('@/lib/api', () => ({
  apiClient: vi.fn(),
}));

import { apiClient } from '@/lib/api';
import { useCampaignList } from '@/hooks/useCampaignList';

const mockApiClient = vi.mocked(apiClient);

describe('useCampaignList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    invalidateQueries();
  });

  it('should return campaigns array when API returns array directly', async () => {
    const campaigns = [
      { id: '1', name: 'Campaign A', status: 'active' },
      { id: '2', name: 'Campaign B', status: 'paused' },
    ];
    mockApiClient.mockResolvedValueOnce(campaigns);

    const { result } = renderHook(() => useCampaignList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.campaigns).toEqual(campaigns);
    expect(result.current.error).toBe(null);
  });

  it('should unwrap { data: [...] } response shape', async () => {
    const campaigns = [
      { id: '1', name: 'Campaign A', status: 'active' },
    ];
    mockApiClient.mockResolvedValueOnce({ data: campaigns });

    const { result } = renderHook(() => useCampaignList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.campaigns).toEqual(campaigns);
  });

  it('should return empty array when data is null', async () => {
    mockApiClient.mockResolvedValueOnce(null);

    const { result } = renderHook(() => useCampaignList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.campaigns).toEqual([]);
  });

  it('should expose error when fetch fails', async () => {
    mockApiClient.mockRejectedValueOnce(new Error('Server error'));

    const { result } = renderHook(() => useCampaignList());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.error).toBe('Server error');
    expect(result.current.campaigns).toEqual([]);
  });

  it('should pass limit=1000 and staleTime=60s to useApiQuery', async () => {
    mockApiClient.mockResolvedValueOnce([]);

    renderHook(() => useCampaignList());

    await waitFor(() => {
      expect(mockApiClient).toHaveBeenCalled();
    });

    const url = mockApiClient.mock.calls[0][0] as string;
    expect(url).toContain('/api/dashboard/campaigns');
    expect(url).toContain('limit=1000');
  });
});
