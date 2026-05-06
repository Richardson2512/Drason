/**
 * Post-login routing resolver.
 *
 * Decides where to send a user immediately after successful sign-in. Right
 * now this reads localStorage (the frontend prototype), but the shape is
 * designed so the backend integration just swaps the data source:
 *
 *   - Real backend will return { role, workspace_id, account_id } in the
 *     login response. The same routing rules apply, just informed by the
 *     server-side identity instead of localStorage.
 *
 * Routing rules (in priority order):
 *
 *   1. Client user (email matches a workspace's clientLogin with status
 *      'active') → that workspace's dashboard. Hard-locked, no switcher.
 *      Backend will enforce this via JWT scoping.
 *
 *   2. Agency owner with Agency Mode on AND ≥1 client workspace →
 *      /dashboard/agency (fleet overview). They get the bird's-eye view by
 *      default; they can drill into a specific workspace from there.
 *
 *   3. Default (solo user, agency mode off, etc.) → /dashboard. Same as
 *      today.
 */

import type { MockWorkspace } from '@/hooks/useAgencyMode';

const WORKSPACES_STORAGE_KEY = 'superkabe-workspaces';
const AGENCY_MODE_KEY = 'superkabe-agency-mode';

function readWorkspaces(): MockWorkspace[] {
    if (typeof window === 'undefined') return [];
    try {
        const raw = localStorage.getItem(WORKSPACES_STORAGE_KEY);
        if (!raw) return [];
        return (JSON.parse(raw) as MockWorkspace[]).map((w) => ({ ...w, clientLogins: w.clientLogins ?? [] }));
    } catch {
        return [];
    }
}

export function resolvePostLoginRoute(email: string): string {
    if (typeof window === 'undefined') return '/dashboard';

    const normalized = email.trim().toLowerCase();
    const workspaces = readWorkspaces();

    // Rule 1 — client login match? Hard-route to that workspace.
    for (const w of workspaces) {
        const match = w.clientLogins.find(
            (cl) => cl.email.toLowerCase() === normalized && cl.status === 'active'
        );
        if (match) {
            return `/dashboard/agency/workspaces/${w.id}`;
        }
    }

    // Rule 2 — agency owner with agency mode on + multiple workspaces? Fleet view.
    const agencyModeOn = localStorage.getItem(AGENCY_MODE_KEY) === '1';
    if (agencyModeOn && workspaces.length > 1) {
        return '/dashboard/agency';
    }

    // Rule 3 — default landing.
    return '/dashboard';
}
