'use client';

/**
 * SuppressionPicker - unified control for "don't include these leads."
 *
 * Three modes, mutually exclusive:
 *   - 'none'           - no suppression. Default for new campaigns.
 *   - 'all_campaigns'  - drop leads whose email appears in any other
 *                        campaign in this org (legacy boolean equivalent).
 *   - 'campaigns'      - drop leads from a user-picked subset of campaigns;
 *                        optionally add individual emails via the
 *                        "specific leads" sub-picker.
 *
 * The component is intentionally stateless about persistence - it emits
 * the canonical `SuppressionRule[]` shape the backend stores. Hosts use
 * this both in the new-campaign wizard and the edit add-leads flow.
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown, ChevronRight as ChevronRightIcon, Search, X, Loader2 } from 'lucide-react';
import { apiClient } from '@/lib/api';

export type SuppressionMode = 'none' | 'all_campaigns' | 'campaigns';

export interface SuppressionRule {
    kind: 'all_campaigns' | 'campaign' | 'email';
    suppressed_campaign_id?: string | null;
    suppressed_email?: string | null;
}

interface CampaignOption {
    id: string;
    name: string;
    total_leads: number;
}

interface PickerLead {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    company: string | null;
    campaign_id: string;
    campaign_name: string | null;
}

interface Props {
    /** Hide this campaign from the source list (so we don't suggest
     *  filtering against itself). Pass when editing an existing campaign. */
    currentCampaignId?: string | null;
    rules: SuppressionRule[];
    onChange: (rules: SuppressionRule[]) => void;
}

/** Initial mode inference from rules. Used to seed local mode state on
 *  mount + when the parent swaps the rules array (edit-mode hydration). */
function inferMode(rules: SuppressionRule[]): SuppressionMode {
    if (rules.some(r => r.kind === 'all_campaigns')) return 'all_campaigns';
    if (rules.some(r => r.kind === 'campaign' || r.kind === 'email')) return 'campaigns';
    return 'none';
}

export default function SuppressionPicker({ currentCampaignId, rules, onChange }: Props) {
    // Mode is local UI state. Once the user picks a mode, we never re-derive
    // it from rules - clicking "Pick campaigns" with no rules yet is a valid
    // intermediate state (user is about to tick their first campaign), and
    // auto-syncing from inferMode(rules) would bounce them back to 'none'.
    //
    // The one exception is edit-mode hydration: the parent loads rules async
    // from the server, so the FIRST time rules transitions from empty to
    // non-empty we align local mode. After that, mode is purely user-driven.
    const [mode, setModeState] = useState<SuppressionMode>(() => inferMode(rules));
    const hasHydratedRef = useRef<boolean>(rules.length > 0);
    useEffect(() => {
        if (!hasHydratedRef.current && rules.length > 0) {
            setModeState(inferMode(rules));
            hasHydratedRef.current = true;
        }
    }, [rules]);

    const pickedCampaignIds = useMemo(
        () => new Set(rules.filter(r => r.kind === 'campaign' && r.suppressed_campaign_id)
            .map(r => r.suppressed_campaign_id as string)),
        [rules],
    );
    const pickedEmails = useMemo(
        () => rules.filter(r => r.kind === 'email' && r.suppressed_email)
            .map(r => r.suppressed_email as string),
        [rules],
    );

    const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
    const [campaignsLoading, setCampaignsLoading] = useState(false);
    const [leadModalOpen, setLeadModalOpen] = useState(false);

    // Fetch the campaign list when we're in (or just entered) 'campaigns'
    // mode. Only fires once - campaigns are stable enough that one load per
    // picker mount is fine; if the user adds a campaign elsewhere mid-edit
    // we'd miss it, but that's a rare enough flow to not warrant polling.
    //
    // apiClient auto-unwraps {success, data} envelopes - so the response is
    // already the array, not the wrapper. Don't read .data off it.
    useEffect(() => {
        if (mode !== 'campaigns') return;
        if (campaignsLoading || campaigns.length > 0) return;
        let cancelled = false;
        setCampaignsLoading(true);
        (async () => {
            try {
                const list = await apiClient<CampaignOption[]>(
                    '/api/sequencer/campaigns?limit=200',
                );
                if (cancelled) return;
                const filtered = (Array.isArray(list) ? list : []).filter(
                    (c: CampaignOption) => c.id !== currentCampaignId,
                );
                setCampaigns(filtered);
            } catch { /* non-fatal */ }
            finally { if (!cancelled) setCampaignsLoading(false); }
        })();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mode, currentCampaignId]);

    const setMode = (next: SuppressionMode) => {
        // Flip local UI state first so the panel can render with an empty
        // rules array (the user hasn't ticked anything yet). Then mirror
        // the change into rules so persistence stays consistent. Mark the
        // ref as hydrated so the parent's empty-rules render after our
        // onChange([]) doesn't re-run the edit-mode hydration path.
        setModeState(next);
        hasHydratedRef.current = true;
        if (next === 'none') return onChange([]);
        if (next === 'all_campaigns') return onChange([{ kind: 'all_campaigns' }]);
        if (next === 'campaigns') {
            // Drop any 'all_campaigns' rule; preserve campaign/email picks.
            const kept = rules.filter(r => r.kind !== 'all_campaigns');
            onChange(kept);
        }
    };

    const toggleCampaign = (id: string) => {
        const has = pickedCampaignIds.has(id);
        const next = rules.filter(r => !(r.kind === 'campaign' && r.suppressed_campaign_id === id));
        if (!has) next.push({ kind: 'campaign', suppressed_campaign_id: id });
        onChange(next);
    };

    const removeEmail = (email: string) => {
        onChange(rules.filter(r => !(r.kind === 'email' && r.suppressed_email === email)));
    };

    const onPickLeads = (emails: string[]) => {
        // Dedupe against existing email rules.
        const have = new Set(pickedEmails.map(e => e.toLowerCase()));
        const additions: SuppressionRule[] = [];
        for (const e of emails) {
            const norm = e.trim().toLowerCase();
            if (!norm || have.has(norm)) continue;
            additions.push({ kind: 'email', suppressed_email: norm });
            have.add(norm);
        }
        onChange([...rules, ...additions]);
    };

    return (
        <div className="rounded-lg" style={{ border: '1px solid #D1CBC5', background: '#FAFAF8' }}>
            <div className="p-3 flex items-center gap-3">
                <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900">Suppression rules</div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                        Drop matching leads before they enter this campaign. Applies on every lead-add.
                    </div>
                </div>
                <div className="inline-flex rounded-lg border border-gray-200 bg-white p-0.5 shrink-0">
                    {(['none', 'all_campaigns', 'campaigns'] as SuppressionMode[]).map(m => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => setMode(m)}
                            className={`text-[11px] px-2.5 py-1 rounded-md font-semibold cursor-pointer border-none ${
                                mode === m ? 'bg-gray-900 text-white' : 'bg-transparent text-gray-600 hover:bg-gray-50'
                            }`}
                        >
                            {m === 'none' ? 'No filter' : m === 'all_campaigns' ? 'All campaigns' : 'Pick campaigns'}
                        </button>
                    ))}
                </div>
            </div>

            {mode === 'campaigns' && (
                <div className="px-3 pb-3 flex flex-col gap-3">
                    <div className="text-[11px] font-semibold text-gray-700">
                        Drop leads from these campaigns
                    </div>
                    <div className="rounded-md bg-white max-h-48 overflow-y-auto" style={{ border: '1px solid #E8E3DC' }}>
                        {campaignsLoading && (
                            <div className="px-3 py-3 text-[11px] text-gray-500 flex items-center gap-2">
                                <Loader2 size={11} className="animate-spin" /> Loading campaigns…
                            </div>
                        )}
                        {!campaignsLoading && campaigns.length === 0 && (
                            <div className="px-3 py-3 text-[11px] text-gray-500">
                                No other campaigns in this organization yet.
                            </div>
                        )}
                        {!campaignsLoading && campaigns.map(c => {
                            const checked = pickedCampaignIds.has(c.id);
                            // Pull into a const so Turbopack's nullish-coalescing transform
                            // doesn't synthesize a ReferenceError-prone temp inside JSX.
                            const totalLeads = typeof c.total_leads === 'number' ? c.total_leads : 0;
                            return (
                                <label
                                    key={c.id}
                                    className="flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-gray-50"
                                    style={{ borderBottom: '1px solid #F0EBE3' }}
                                >
                                    <input
                                        type="checkbox"
                                        checked={checked}
                                        onChange={() => toggleCampaign(c.id)}
                                        className="w-3.5 h-3.5 cursor-pointer"
                                    />
                                    <span className="flex-1 text-xs text-gray-900 truncate">{c.name}</span>
                                    <span className="text-[10px] text-gray-400 shrink-0">{totalLeads} leads</span>
                                </label>
                            );
                        })}
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="text-[11px] font-semibold text-gray-700">
                            Also skip specific leads {pickedEmails.length > 0 && <span className="text-gray-400 font-normal">({pickedEmails.length})</span>}
                        </div>
                        <button
                            type="button"
                            disabled={pickedCampaignIds.size === 0}
                            onClick={() => setLeadModalOpen(true)}
                            className="text-[11px] font-semibold text-blue-700 hover:text-blue-900 bg-transparent border-none cursor-pointer disabled:text-gray-400 disabled:cursor-not-allowed"
                            title={pickedCampaignIds.size === 0 ? 'Pick at least one campaign first' : 'Pick individual leads to skip'}
                        >
                            + Pick leads
                        </button>
                    </div>

                    {pickedEmails.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                            {pickedEmails.map(e => (
                                <span
                                    key={e}
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-mono"
                                    style={{ border: '1px solid #BFDBFE' }}
                                >
                                    {e}
                                    <button
                                        type="button"
                                        onClick={() => removeEmail(e)}
                                        className="bg-transparent border-none cursor-pointer text-blue-700 hover:text-blue-900 p-0 flex"
                                        title={`Remove ${e}`}
                                    >
                                        <X size={9} />
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {leadModalOpen && (
                <LeadPickerModal
                    campaignIds={Array.from(pickedCampaignIds)}
                    alreadyPicked={new Set(pickedEmails.map(e => e.toLowerCase()))}
                    onClose={() => setLeadModalOpen(false)}
                    onConfirm={(emails) => {
                        onPickLeads(emails);
                        setLeadModalOpen(false);
                    }}
                />
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Modal - paginated lead picker scoped to the chosen source campaigns
// ────────────────────────────────────────────────────────────────────

function LeadPickerModal({
    campaignIds,
    alreadyPicked,
    onClose,
    onConfirm,
}: {
    campaignIds: string[];
    alreadyPicked: Set<string>;
    onClose: () => void;
    onConfirm: (emails: string[]) => void;
}) {
    const PAGE_SIZE = 50;
    const [search, setSearch] = useState('');
    const [debounced, setDebounced] = useState('');
    const [offset, setOffset] = useState(0);
    const [total, setTotal] = useState(0);
    const [rows, setRows] = useState<PickerLead[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selected, setSelected] = useState<Set<string>>(new Set());

    useEffect(() => {
        const t = setTimeout(() => setDebounced(search), 250);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        setOffset(0);
    }, [debounced]);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        setError(null);
        (async () => {
            try {
                const qs = new URLSearchParams({
                    campaign_ids: campaignIds.join(','),
                    offset: String(offset),
                    limit: String(PAGE_SIZE),
                });
                if (debounced.trim()) qs.set('search', debounced.trim());
                // apiClient unwraps the envelope, so the response is already
                // { total, leads }, not { data: { total, leads } }.
                const payload = await apiClient<{ total: number; offset: number; limit: number; leads: PickerLead[] }>(
                    `/api/sequencer/campaigns/lead-picker?${qs.toString()}`,
                );
                if (cancelled) return;
                setTotal(payload?.total ?? 0);
                setRows(Array.isArray(payload?.leads) ? payload.leads : []);
            } catch (e) {
                if (!cancelled) setError((e as Error)?.message || 'Failed to load leads');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, [campaignIds, debounced, offset]);

    const toggle = (email: string) => {
        const norm = email.toLowerCase();
        if (alreadyPicked.has(norm)) return;
        const next = new Set(selected);
        if (next.has(norm)) next.delete(norm); else next.add(norm);
        setSelected(next);
    };
    const page = Math.floor(offset / PAGE_SIZE) + 1;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
                <header className="flex items-center justify-between p-4 border-b border-gray-100">
                    <div>
                        <h2 className="text-base font-bold text-gray-900 m-0">Pick leads to skip</h2>
                        <p className="text-[11px] text-gray-500 m-0 mt-0.5">
                            Showing leads from {campaignIds.length} selected campaign{campaignIds.length === 1 ? '' : 's'}. Selected leads will be excluded from this campaign.
                        </p>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 bg-transparent border-none cursor-pointer p-1">
                        <X size={18} />
                    </button>
                </header>

                <div className="p-4 pb-2">
                    <div className="relative">
                        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by email, name, or company…"
                            className="w-full text-sm border border-gray-200 rounded-lg pl-9 pr-3 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto px-4">
                    {error && <div className="text-xs text-red-700 py-2">{error}</div>}
                    {loading && (
                        <div className="flex items-center gap-2 py-4 text-xs text-gray-500">
                            <Loader2 size={12} className="animate-spin" /> Loading…
                        </div>
                    )}
                    {!loading && rows.length === 0 && (
                        <div className="py-6 text-center text-xs text-gray-500">No leads match.</div>
                    )}
                    {!loading && rows.length > 0 && (
                        <ul className="m-0 p-0 list-none flex flex-col">
                            {rows.map(r => {
                                const norm = r.email.toLowerCase();
                                const already = alreadyPicked.has(norm);
                                const checked = already || selected.has(norm);
                                const name = [r.first_name, r.last_name].filter(Boolean).join(' ');
                                return (
                                    <li key={r.id}>
                                        <label
                                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer ${
                                                already ? 'opacity-50 cursor-not-allowed' : checked ? 'bg-blue-50' : 'hover:bg-gray-50'
                                            }`}
                                        >
                                            <input
                                                type="checkbox"
                                                disabled={already}
                                                checked={checked}
                                                onChange={() => toggle(r.email)}
                                                className="w-3.5 h-3.5 cursor-pointer disabled:cursor-not-allowed"
                                            />
                                            <span className="flex-1 min-w-0">
                                                <span className="block text-xs text-gray-900 font-mono truncate">{r.email}</span>
                                                <span className="block text-[10px] text-gray-500 truncate">
                                                    {[name, r.company, r.campaign_name].filter(Boolean).join(' · ')}
                                                </span>
                                            </span>
                                            {already && <span className="text-[10px] text-gray-400 shrink-0">Already added</span>}
                                        </label>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </div>

                <footer className="border-t border-gray-100 p-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                        <button
                            type="button"
                            disabled={offset === 0 || loading}
                            onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer bg-transparent border-none"
                        >
                            <ChevronDown size={12} className="rotate-90" />
                        </button>
                        <span className="tabular-nums">
                            {total === 0 ? '0' : `${offset + 1}–${Math.min(offset + PAGE_SIZE, total)} of ${total}`}
                        </span>
                        <button
                            type="button"
                            disabled={page >= totalPages || loading}
                            onClick={() => setOffset(offset + PAGE_SIZE)}
                            className="p-1 rounded hover:bg-gray-100 disabled:opacity-30 cursor-pointer bg-transparent border-none"
                        >
                            <ChevronRightIcon size={12} />
                        </button>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-[11px] text-gray-700"><strong>{selected.size}</strong> selected</span>
                        <button
                            type="button"
                            onClick={onClose}
                            className="text-xs text-gray-700 hover:text-gray-900 bg-transparent border-none cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            disabled={selected.size === 0}
                            onClick={() => onConfirm(Array.from(selected))}
                            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-md px-3 py-1.5 cursor-pointer border-none disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                        >
                            Add {selected.size} {selected.size === 1 ? 'lead' : 'leads'}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
