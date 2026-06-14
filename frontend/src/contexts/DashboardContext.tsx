'use client';

/**
 * DashboardContext - shared state for user info and subscription data.
 *
 * Eliminates duplicate fetches across DashboardShell, overview page,
 * and billing page. Fetch once at the layout level, consume everywhere.
 */

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from 'react';
import { apiClient } from '@/lib/api';

// ── Types ───────────────────────────────────────────────────────────
export interface DashboardUser {
  name: string;
  email: string;
  role: string;
  isAgencyOwner: boolean;
  scopedOrganizationId: string | null;
  capabilities: string[];
  /** The canonical list of every capability the backend recognizes - served
   *  by /api/user/me so adding a new capability backend-side automatically
   *  shows up in the invite modal's checkbox grid without a frontend deploy. */
  capabilityKeys: string[];
}

export interface DashboardSubscription {
  status: string;
  tier: string;
  trialEndsAt: string | null;
  trialStartedAt: string | null;
  subscriptionStartedAt: string | null;
  nextBillingDate: string | null;
}

interface DashboardContextValue {
  user: DashboardUser | null;
  subscription: DashboardSubscription | null;
  /** True when the requesting user has the named capability on their active
   *  workspace. Wildcard '*' (agency owners + legacy) returns true for any cap. */
  hasCapability: (cap: string) => boolean;
  refetchUser: () => Promise<void>;
  refetchSubscription: () => Promise<void>;
}

// ── Context ─────────────────────────────────────────────────────────
const DashboardContext = createContext<DashboardContextValue | null>(null);

export function DashboardProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [subscription, setSubscription] = useState<DashboardSubscription | null>(null);

  const refetchUser = useCallback(async () => {
    try {
      const data = await apiClient<Record<string, any>>('/api/user/me');
      const u = data?.data || data;
      if (u) {
        setUser({
          name: u.name || u.email || '',
          email: u.email || '',
          role: u.role || '',
          isAgencyOwner: !!u.is_agency_owner,
          scopedOrganizationId: u.scoped_organization_id ?? null,
          capabilities: Array.isArray(u.capabilities) ? u.capabilities : [],
          capabilityKeys: Array.isArray(u.capabilityKeys) ? u.capabilityKeys : [],
        });
      }
    } catch (err) {
      console.error('[DashboardContext] Failed to fetch user', err);
    }
  }, []);

  const refetchSubscription = useCallback(async () => {
    try {
      const data = await apiClient<Record<string, any>>('/api/billing/subscription');
      // API returns { subscription: { status, tier, ... }, usage: {...}, limits: {...} }
      // or { data: { subscription: {...} } } depending on unwrap
      const sub = data?.subscription || data?.data?.subscription || data;
      if (sub?.status) {
        setSubscription({
          status: sub.status,
          tier: sub.tier || 'trial',
          trialEndsAt: sub.trialEndsAt || sub.trial_ends_at || null,
          trialStartedAt: sub.trialStartedAt || sub.trial_started_at || null,
          subscriptionStartedAt: sub.subscriptionStartedAt || sub.subscription_started_at || null,
          nextBillingDate: sub.nextBillingDate || sub.next_billing_date || null,
        });
      }
    } catch (err) {
      console.error('[DashboardContext] Failed to fetch subscription', err);
    }
  }, []);

  useEffect(() => {
    refetchUser();
    refetchSubscription();
  }, [refetchUser, refetchSubscription]);

  const hasCapability = useCallback((cap: string): boolean => {
    if (!user) return false;
    if (user.capabilities.includes('*')) return true;
    return user.capabilities.includes(cap);
  }, [user]);

  const value = useMemo(
    () => ({ user, subscription, hasCapability, refetchUser, refetchSubscription }),
    [user, subscription, hasCapability, refetchUser, refetchSubscription]
  );

  return (
    <DashboardContext.Provider value={value}>
      {children}
    </DashboardContext.Provider>
  );
}

export function useDashboard() {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error('useDashboard must be used within a DashboardProvider');
  return ctx;
}
