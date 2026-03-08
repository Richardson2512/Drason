'use client';

/**
 * DashboardContext — shared state for user info and subscription data.
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

  const value = useMemo(
    () => ({ user, subscription, refetchUser, refetchSubscription }),
    [user, subscription, refetchUser, refetchSubscription]
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
