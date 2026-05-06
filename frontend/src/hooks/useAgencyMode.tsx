'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { useDashboard } from '@/contexts/DashboardContext';
import { apiClient } from '@/lib/api';

const STORAGE_KEY = 'superkabe-agency-mode';
const CLIENT_LOGINS_STORAGE_KEY = 'superkabe-client-logins';
const ACTIVE_WORKSPACE_KEY = 'superkabe-active-workspace';
const AGENCY_PROFILE_KEY = 'superkabe-agency-profile';
const ELIGIBLE_TIERS = new Set(['scale', 'enterprise']);

// All capability keys the agency can grant on a per-client basis.
//
// IMPORTANT: this list is a static fallback. The runtime source of truth is
// the backend, which serves it as `capabilityKeys` on /api/user/me (see
// DashboardContext.user.capabilityKeys). Components rendering the invite
// modal's checkbox grid should prefer the dynamic list so a new backend
// capability shows up without a frontend deploy.
//
// This list MUST stay in sync with the backend's CAPABILITY_KEYS in
// requireCapability.ts. The backend treats it as the whitelist for invites
// (inviteController.VALID_CAPABILITIES); a stale frontend list just means
// the checkbox UI shows fewer options than exist on the server.
export const CAPABILITY_KEYS = [
    'view_campaigns',
    'view_analytics',
    'view_leads',
    'view_unibox',
    'reply_to_messages',
    'launch_pause_campaigns',
    'create_campaigns',
    'edit_sequences',
    'add_leads',
    'remove_leads',
    'connect_mailboxes',
    'connect_domains',
    'run_assessment',
    'access_integrations',
] as const;

export type Capability = typeof CAPABILITY_KEYS[number];

export interface CapabilityMeta {
    key: Capability;
    label: string;
    group: 'view' | 'engage' | 'build' | 'configure';
}

export const CAPABILITY_META: CapabilityMeta[] = [
    { key: 'view_campaigns',           label: 'View campaigns',                    group: 'view' },
    { key: 'view_analytics',           label: 'View analytics',                    group: 'view' },
    { key: 'view_leads',               label: 'View leads',                        group: 'view' },
    { key: 'view_unibox',              label: 'View Unibox (replies)',             group: 'view' },
    { key: 'reply_to_messages',        label: 'Reply to inbox messages',           group: 'engage' },
    { key: 'launch_pause_campaigns',   label: 'Launch / pause existing campaigns', group: 'engage' },
    { key: 'create_campaigns',         label: 'Create new campaigns',              group: 'build' },
    { key: 'edit_sequences',           label: 'Edit campaign sequences',           group: 'build' },
    { key: 'add_leads',                label: 'Add leads',                         group: 'build' },
    { key: 'remove_leads',             label: 'Remove leads',                      group: 'build' },
    { key: 'connect_mailboxes',        label: 'Connect mailboxes',                 group: 'configure' },
    { key: 'connect_domains',          label: 'Connect / verify domains',          group: 'configure' },
    { key: 'run_assessment',           label: 'Run infrastructure assessment',     group: 'configure' },
    { key: 'access_integrations',      label: 'Access integrations',               group: 'configure' },
];

export const PRESETS: Record<'read_only' | 'limited' | 'full', { label: string; description: string; caps: Capability[] }> = {
    read_only: {
        label: 'Read-only',
        description: 'Views everything, changes nothing.',
        caps: ['view_campaigns', 'view_analytics', 'view_leads', 'view_unibox'],
    },
    limited: {
        label: 'Limited',
        description: 'View + reply + launch existing campaigns.',
        caps: ['view_campaigns', 'view_analytics', 'view_leads', 'view_unibox', 'reply_to_messages', 'launch_pause_campaigns'],
    },
    full: {
        label: 'Full access',
        description: 'Everything except billing, branding, user management.',
        caps: [...CAPABILITY_KEYS],
    },
};

export interface ClientLogin {
    id: string;
    email: string;
    displayName: string | null;
    capabilities: Capability[];
    createdAt: string;
    lastSeenAt: string | null;
    status: 'pending_invite' | 'active' | 'disabled';
    inviteToken: string | null;
    inviteExpiresAt: string | null;
}

export interface MockWorkspace {
    id: string;
    name: string;
    slug: string;
    isSeed: boolean;
    clientCompany: string | null;
    mailboxCount: number;
    activeCampaigns: number;
    health: 'healthy' | 'warning' | 'paused';
    sends30d: number;
    bounceRate: number;
    replyRate: number;
    createdAt: string;
    clientLogins: ClientLogin[];
}

export interface FleetStats {
    workspaceCount: number;
    healthyCount: number;
    warningCount: number;
    pausedCount: number;
    totalMailboxes: number;
    totalSends30d: number;
    weightedBounceRate: number;
    weightedReplyRate: number;
}

export interface AgencyProfile {
    agencyName: string;
    agencyCompany: string;
}

const DEFAULT_AGENCY_PROFILE: AgencyProfile = { agencyName: '', agencyCompany: '' };

/** Backend response shape from GET /api/agency/workspaces. */
interface APIWorkspace {
    id: string;
    name: string;
    slug: string;
    clientCompany: string | null;
    isSeed: boolean;
    health: 'healthy' | 'warning' | 'paused';
    mailboxCount: number;
    activeCampaigns: number;
    sends30d: number;
    bounceRate: number;
    replyRate: number;
    clientLoginCount: number;
    createdAt: string;
}

/** Per-workspace client-login mock data (until Phase 2 wires real invites). */
type ClientLoginsMap = Record<string, ClientLogin[]>;

function readClientLoginsMap(): ClientLoginsMap {
    if (typeof window === 'undefined') return {};
    try {
        const raw = localStorage.getItem(CLIENT_LOGINS_STORAGE_KEY);
        return raw ? (JSON.parse(raw) as ClientLoginsMap) : {};
    } catch {
        return {};
    }
}

function writeClientLoginsMap(map: ClientLoginsMap): void {
    if (typeof window !== 'undefined') {
        localStorage.setItem(CLIENT_LOGINS_STORAGE_KEY, JSON.stringify(map));
    }
}


interface AgencyModeContextValue {
    enabled: boolean;
    setEnabled: (next: boolean) => void;
    isEligible: boolean;
    tier: string;
    workspaces: MockWorkspace[];
    fleetStats: FleetStats | null;
    /** Re-pull the workspaces list from the backend. Mutations call this
     *  after a successful create/rename/delete so the UI stays in sync
     *  without a manual refresh. */
    refetchWorkspaces: () => Promise<void>;
    /** Re-pull /api/agency/fleet-stats. Mutations call this alongside
     *  refetchWorkspaces so the fleet-overview tiles update immediately. */
    refetchFleetStats: () => Promise<void>;
    addWorkspace: (name: string, clientCompany?: string) => Promise<MockWorkspace>;
    updateWorkspace: (id: string, patch: Partial<Omit<MockWorkspace, 'id' | 'clientLogins' | 'isSeed'>>) => Promise<void>;
    deleteWorkspace: (id: string) => Promise<void>;
    activeWorkspace: MockWorkspace | undefined;
    activeWorkspaceId: string;
    setActiveWorkspaceId: (id: string) => void;
    /** Backend-aware workspace switch: re-issues JWT, hard-reloads to refresh
     *  every API-fetched surface under the new scope. */
    switchWorkspaceOnBackend: (id: string) => Promise<void>;
    addClientLogin: (workspaceId: string, login: { email: string; displayName: string | null; capabilities: Capability[] }) => Promise<ClientLogin>;
    updateClientLogin: (workspaceId: string, loginId: string, patch: Partial<ClientLogin>) => void;
    deleteClientLogin: (workspaceId: string, loginId: string) => void;
    regenerateInvite: (workspaceId: string, loginId: string) => Promise<ClientLogin | null>;
    agencyProfile: AgencyProfile;
    setAgencyProfile: (next: AgencyProfile) => void;
}

const AgencyModeContext = createContext<AgencyModeContextValue | null>(null);

/**
 * Single source of truth for Agency Mode state — workspaces, client logins,
 * agency profile, on/off toggle. Lives at the dashboard-layout level so every
 * consuming component (sidebar switcher, settings card, fleet overview,
 * workspace detail) sees the same instance and re-renders on every change.
 *
 * Backend follow-up will swap localStorage for API calls; the context shape
 * stays identical so consumer components don't need to change.
 */
export function AgencyModeProvider({ children }: { children: ReactNode }) {
    const { subscription } = useDashboard();
    const tier = subscription?.tier ?? 'trial';
    const isEligible = ELIGIBLE_TIERS.has(tier);

    const [enabled, setEnabledState] = useState(false);
    const [workspaces, setWorkspacesState] = useState<MockWorkspace[]>([]);
    const [fleetStats, setFleetStats] = useState<FleetStats | null>(null);
    const [activeWorkspaceId, setActiveWorkspaceIdState] = useState<string>('');
    const [agencyProfile, setAgencyProfileState] = useState<AgencyProfile>(DEFAULT_AGENCY_PROFILE);

    /**
     * Fetch workspaces from the backend and merge in client logins from
     * localStorage (still mock until Phase 2 of the backend build lands).
     * API is the source of truth for workspace identity, name, slug, stats.
     * localStorage holds the per-workspace client-login mocks keyed by ws id.
     */
    const apiToMock = (w: APIWorkspace, loginsMap: ClientLoginsMap): MockWorkspace => ({
        id: w.id,
        name: w.name,
        slug: w.slug,
        isSeed: w.isSeed,
        clientCompany: w.clientCompany,
        mailboxCount: w.mailboxCount,
        activeCampaigns: w.activeCampaigns,
        health: w.health,
        sends30d: w.sends30d,
        bounceRate: w.bounceRate,
        replyRate: w.replyRate,
        createdAt: w.createdAt,
        clientLogins: loginsMap[w.id] ?? [],
    });

    const refetchWorkspaces = useCallback(async () => {
        try {
            const data = await apiClient<APIWorkspace[]>('/api/agency/workspaces');
            if (!Array.isArray(data)) return;

            const loginsMap = readClientLoginsMap();
            const merged: MockWorkspace[] = data.map((w) => apiToMock(w, loginsMap));
            setWorkspacesState(merged);

            // If active id isn't in the new list, default to the first workspace.
            const storedActive = typeof window !== 'undefined'
                ? localStorage.getItem(ACTIVE_WORKSPACE_KEY)
                : null;
            const validActive = merged.find((w) => w.id === storedActive)?.id ?? merged[0]?.id ?? '';
            setActiveWorkspaceIdState(validActive);
        } catch (err) {
            console.warn('[useAgencyMode] Failed to load workspaces', err);
        }
    }, []);

    const refetchFleetStats = useCallback(async () => {
        try {
            const stats = await apiClient<FleetStats>('/api/agency/fleet-stats');
            setFleetStats(stats);
        } catch (err) {
            console.warn('[useAgencyMode] Failed to load fleet stats', err);
        }
    }, []);

    // Load static localStorage state (toggle, profile, active id) once.
    useEffect(() => {
        if (typeof window === 'undefined') return;
        try {
            const storedEnabled = localStorage.getItem(STORAGE_KEY);
            if (storedEnabled === '1' && isEligible) setEnabledState(true);

            const rawProfile = localStorage.getItem(AGENCY_PROFILE_KEY);
            if (rawProfile) setAgencyProfileState(JSON.parse(rawProfile) as AgencyProfile);
        } catch { /* localStorage corruption — fall through to defaults */ }
    }, [isEligible]);

    // Hydrate workspaces + fleet stats from the backend whenever Agency
    // Mode flips on. Both endpoints come from the same data, but they're
    // separate API calls so the fleet-overview tiles stay accurate even
    // when only some workspaces change.
    useEffect(() => {
        if (enabled) {
            void refetchWorkspaces();
            void refetchFleetStats();
        } else {
            setWorkspacesState([]);
            setFleetStats(null);
        }
    }, [enabled, refetchWorkspaces, refetchFleetStats]);

    // If tier downgrades below eligibility, force agency mode off.
    useEffect(() => {
        if (!isEligible && enabled) {
            setEnabledState(false);
            if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, '0');
        }
    }, [isEligible, enabled]);

    /**
     * Persist the per-workspace client-login mocks. Workspace identity
     * (id/name/slug/etc.) lives on the backend now — we only checkpoint the
     * client-login arrays, keyed by workspace id. Phase 2 will replace this
     * with /api/agency/workspaces/:id/invites round-trips.
     */
    const persistWorkspaces = (next: MockWorkspace[]) => {
        const map: ClientLoginsMap = {};
        next.forEach((w) => { map[w.id] = w.clientLogins; });
        writeClientLoginsMap(map);
    };

    const setEnabled = useCallback((next: boolean) => {
        if (next && !isEligible) return;
        setEnabledState(next);
        if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, next ? '1' : '0');
    }, [isEligible]);

    const setActiveWorkspaceId = useCallback((id: string) => {
        setActiveWorkspaceIdState(id);
        if (typeof window !== 'undefined') localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
    }, []);

    /**
     * Switch the agency owner's active workspace. Round-trips to the backend
     * to re-issue the JWT cookie with the new orgId, then hard-reloads the
     * page so every dashboard surface re-fetches under the new scope.
     *
     * Hard reload is intentional: dashboard data is fetched in many places
     * (DashboardContext + each page) and isn't centrally invalidatable yet.
     * Phase 3 can replace this with a granular cache invalidation if needed.
     */
    const switchWorkspaceOnBackend = useCallback(async (id: string): Promise<void> => {
        try {
            await apiClient('/api/agency/switch-workspace', {
                method: 'POST',
                body: JSON.stringify({ workspaceId: id }),
            });
            setActiveWorkspaceIdState(id);
            if (typeof window !== 'undefined') {
                localStorage.setItem(ACTIVE_WORKSPACE_KEY, id);
                window.location.reload();
            }
        } catch (err) {
            console.error('[useAgencyMode] switchWorkspace failed', err);
            throw err;
        }
    }, []);

    const addWorkspace = useCallback(async (name: string, clientCompany?: string): Promise<MockWorkspace> => {
        const created = await apiClient<APIWorkspace>('/api/agency/workspaces', {
            method: 'POST',
            body: JSON.stringify({ name, clientCompany: clientCompany ?? '' }),
        });
        const newWs = apiToMock(created, readClientLoginsMap());
        setWorkspacesState((prev) => [...prev, newWs]);
        // Workspace count + fleet aggregates change → re-pull stats.
        void refetchFleetStats();
        return newWs;
    }, [refetchFleetStats]);

    const updateWorkspace = useCallback(async (
        id: string,
        patch: Partial<Omit<MockWorkspace, 'id' | 'clientLogins' | 'isSeed'>>,
    ): Promise<void> => {
        // Map MockWorkspace fields to the API's PATCH body shape.
        const apiPatch: Record<string, unknown> = {};
        if (typeof patch.name === 'string') apiPatch.name = patch.name;
        if (typeof patch.slug === 'string') apiPatch.slug = patch.slug;
        if ('clientCompany' in patch) apiPatch.clientCompany = patch.clientCompany ?? '';

        if (Object.keys(apiPatch).length > 0) {
            const updated = await apiClient<APIWorkspace>(`/api/agency/workspaces/${id}`, {
                method: 'PATCH',
                body: JSON.stringify(apiPatch),
            });
            setWorkspacesState((prev) =>
                prev.map((w) => (w.id === id ? {
                    ...w,
                    name: updated.name,
                    slug: updated.slug,
                    clientCompany: updated.clientCompany,
                } : w))
            );
            // Renaming a workspace doesn't change fleet aggregates, but health
            // / mailbox counts may have shifted server-side since last fetch.
            void refetchFleetStats();
        } else {
            // No API-tracked fields changed (e.g., caller patched stats only) —
            // just patch React state. Phase 2 doesn't model writeable stats.
            setWorkspacesState((prev) => prev.map((w) => (w.id === id ? { ...w, ...patch } : w)));
        }
    }, [refetchFleetStats]);

    const deleteWorkspace = useCallback(async (id: string): Promise<void> => {
        await apiClient(`/api/agency/workspaces/${id}`, { method: 'DELETE' });
        setWorkspacesState((prev) => prev.filter((w) => w.id !== id));
        setActiveWorkspaceIdState((prevActive) => (prevActive === id ? '' : prevActive));
        // Workspace count drops → fleet aggregates change.
        void refetchFleetStats();
    }, [refetchFleetStats]);

    const addClientLogin = useCallback(async (
        workspaceId: string,
        login: { email: string; displayName: string | null; capabilities: Capability[] },
    ): Promise<ClientLogin> => {
        // Real backend invite — sends the magic-link email server-side and
        // returns the metadata (incl. magicLinkUrl which the modal surfaces
        // in dev as a fallback when SMTP isn't configured locally).
        const created = await apiClient<{
            id: string;
            email: string;
            displayName: string | null;
            capabilities: Capability[];
            status: 'pending_invite' | 'active' | 'disabled';
            createdAt: string;
            expiresAt: string;
            magicLinkUrl: string;
        }>(`/api/agency/workspaces/${workspaceId}/invites`, {
            method: 'POST',
            body: JSON.stringify({
                email: login.email,
                displayName: login.displayName,
                capabilities: login.capabilities,
            }),
        });

        // The token isn't sent back as a separate field (we only get the
        // composed magic link). The modal already extracts it from the URL
        // for the dev-only "show link" UI.
        const tokenFromLink = (() => {
            try {
                const u = new URL(created.magicLinkUrl);
                return u.searchParams.get('token');
            } catch { return null; }
        })();

        const newLogin: ClientLogin = {
            id: created.id,
            email: created.email,
            displayName: created.displayName,
            capabilities: created.capabilities,
            createdAt: created.createdAt,
            lastSeenAt: null,
            status: created.status,
            inviteToken: tokenFromLink,
            inviteExpiresAt: created.expiresAt,
        };

        setWorkspacesState((prev) => {
            const next = prev.map((w) =>
                w.id === workspaceId ? { ...w, clientLogins: [...w.clientLogins, newLogin] } : w
            );
            persistWorkspaces(next);
            return next;
        });
        return newLogin;
    }, []);

    const updateClientLogin = useCallback((workspaceId: string, loginId: string, patch: Partial<ClientLogin>) => {
        setWorkspacesState((prev) => {
            const next = prev.map((w) =>
                w.id === workspaceId
                    ? { ...w, clientLogins: w.clientLogins.map((cl) => (cl.id === loginId ? { ...cl, ...patch } : cl)) }
                    : w
            );
            persistWorkspaces(next);
            return next;
        });
    }, []);

    const deleteClientLogin = useCallback((workspaceId: string, loginId: string) => {
        setWorkspacesState((prev) => {
            const next = prev.map((w) =>
                w.id === workspaceId
                    ? { ...w, clientLogins: w.clientLogins.filter((cl) => cl.id !== loginId) }
                    : w
            );
            persistWorkspaces(next);
            return next;
        });
    }, []);

    const regenerateInvite = useCallback(async (workspaceId: string, loginId: string): Promise<ClientLogin | null> => {
        // Find the existing login so we can re-invite the same email with
        // the same capabilities. The backend revokes the prior unconsumed
        // invite + creates a new one (see WorkspaceInvite.updateMany in
        // inviteController.createWorkspaceInvite).
        const ws = workspaces.find((w) => w.id === workspaceId);
        const existing = ws?.clientLogins.find((cl) => cl.id === loginId);
        if (!existing) return null;

        const created = await apiClient<{
            id: string;
            email: string;
            displayName: string | null;
            capabilities: Capability[];
            status: 'pending_invite' | 'active' | 'disabled';
            createdAt: string;
            expiresAt: string;
            magicLinkUrl: string;
        }>(`/api/agency/workspaces/${workspaceId}/invites`, {
            method: 'POST',
            body: JSON.stringify({
                email: existing.email,
                displayName: existing.displayName,
                capabilities: existing.capabilities,
            }),
        });

        const tokenFromLink = (() => {
            try {
                const u = new URL(created.magicLinkUrl);
                return u.searchParams.get('token');
            } catch { return null; }
        })();

        const fresh: ClientLogin = {
            id: created.id, // backend creates a NEW invite row → new id
            email: created.email,
            displayName: created.displayName,
            capabilities: created.capabilities,
            createdAt: created.createdAt,
            lastSeenAt: null,
            status: 'pending_invite',
            inviteToken: tokenFromLink,
            inviteExpiresAt: created.expiresAt,
        };

        setWorkspacesState((prev) => {
            const next = prev.map((w) => {
                if (w.id !== workspaceId) return w;
                return {
                    ...w,
                    // Replace the old entry (matched by old loginId) with the
                    // refreshed one carrying the new token + new id.
                    clientLogins: w.clientLogins.map((cl) => (cl.id === loginId ? fresh : cl)),
                };
            });
            persistWorkspaces(next);
            return next;
        });
        return fresh;
    }, [workspaces]);

    const setAgencyProfile = useCallback((next: AgencyProfile) => {
        setAgencyProfileState(next);
        if (typeof window !== 'undefined') localStorage.setItem(AGENCY_PROFILE_KEY, JSON.stringify(next));
    }, []);

    const activeWorkspace = workspaces.find((w) => w.id === activeWorkspaceId) ?? workspaces[0];

    const value: AgencyModeContextValue = {
        enabled,
        setEnabled,
        isEligible,
        tier,
        workspaces,
        fleetStats,
        refetchWorkspaces,
        refetchFleetStats,
        addWorkspace,
        updateWorkspace,
        deleteWorkspace,
        activeWorkspace,
        activeWorkspaceId,
        setActiveWorkspaceId,
        switchWorkspaceOnBackend,
        addClientLogin,
        updateClientLogin,
        deleteClientLogin,
        regenerateInvite,
        agencyProfile,
        setAgencyProfile,
    };

    return <AgencyModeContext.Provider value={value}>{children}</AgencyModeContext.Provider>;
}

/**
 * Consume the shared Agency Mode state. Must be used inside an
 * AgencyModeProvider. Every consumer re-renders together when state changes.
 */
export function useAgencyMode(): AgencyModeContextValue {
    const ctx = useContext(AgencyModeContext);
    if (!ctx) {
        throw new Error('useAgencyMode must be used within an AgencyModeProvider');
    }
    return ctx;
}
