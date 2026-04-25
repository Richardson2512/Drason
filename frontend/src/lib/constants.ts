/**
 * Shared frontend constants.
 * Only put truly static values here. Anything that might change per-org or
 * over time should be fetched from the API.
 */

// Supported sending platforms for the Protection layer.
// Used by mailboxes/page.tsx and domains/page.tsx filter dropdowns.
export const PROTECTION_PLATFORMS = ['smartlead', 'instantly', 'emailbison'] as const;
export type ProtectionPlatform = typeof PROTECTION_PLATFORMS[number];
