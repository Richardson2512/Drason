/**
 * useCampaignList — shared hook for fetching the full campaign list.
 *
 * Used by analytics, leads, configuration, and mailboxes pages.
 * Leverages useApiQuery's module-level cache so navigating between
 * pages won't re-fetch if the data is still fresh (60s stale time).
 */

import { useApiQuery } from './useApiQuery';
import type { CampaignSummary } from '@/types/api';

interface CampaignListResponse {
  data: CampaignSummary[];
}

export function useCampaignList() {
  const { data, isLoading, error, refetch } = useApiQuery<CampaignListResponse | CampaignSummary[]>(
    '/api/dashboard/campaigns',
    { limit: 1000 },
    { staleTime: 60_000 },
  );

  const campaigns: CampaignSummary[] = Array.isArray(data)
    ? data
    : (data as CampaignListResponse)?.data ?? [];

  return { campaigns, isLoading, error, refetch };
}
