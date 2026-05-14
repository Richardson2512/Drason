'use client';

/**
 * Watchlist create wizard — five compact stages so operators can't
 * accidentally configure a watchlist that would blow past LinkedIn's
 * per-account action budget. Each stage is gated on the previous.
 *
 *   1. Basics            — name + 1-5 keywords
 *   2. Audience filter   — pick an ICP profile
 *   3. Exclusions        — slugs / company terms to drop
 *   4. Volume + cadence  — min_reaction_count + daily_signal_budget
 *   5. Routing           — manual review vs auto-push to a campaign
 */

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    ArrowLeft, ArrowRight, Plus, Trash2, Hash, Target, Filter as FilterIcon,
    Gauge, Rocket, CheckCircle2, Loader2, Radar, AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

interface IcpOption { id: string; name: string }
interface CampaignOption { id: string; name: string; status: string }

export default function WatchlistWizardPage() {
    const router = useRouter();
    const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);

    // Stage 1
    const [name, setName] = useState('');
    const [keywordInput, setKeywordInput] = useState('');
    const [keywords, setKeywords] = useState<string[]>([]);

    // Stage 2
    const [icps, setIcps] = useState<IcpOption[]>([]);
    const [icpId, setIcpId] = useState<string>('');

    // Stage 3
    const [exclSlugInput, setExclSlugInput] = useState('');
    const [excludedSlugs, setExcludedSlugs] = useState<string[]>([]);
    const [exclCompanyInput, setExclCompanyInput] = useState('');
    const [excludedCompanies, setExcludedCompanies] = useState<string[]>([]);

    // Stage 4
    const [minReactions, setMinReactions] = useState(20);
    const [dailyBudget, setDailyBudget] = useState(50);

    // Stage 5
    const [routingMode, setRoutingMode] = useState<'manual_review' | 'auto_push'>('manual_review');
    const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
    const [targetCampaignId, setTargetCampaignId] = useState<string>('');

    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        apiClient<IcpOption[]>('/api/linkedin/icp')
            .then(r => setIcps(Array.isArray(r) ? r : []))
            .catch(() => {});
        apiClient<{ items: CampaignOption[] }>('/api/sequencer/campaigns?limit=100&channel=linkedin')
            .then(r => {
                const items = (r as any)?.items ?? (r as unknown as CampaignOption[]);
                setCampaigns(Array.isArray(items) ? items.filter((c: any) => c.channel === 'linkedin' || true) : []);
            })
            .catch(() => {});
    }, []);

    const addKeyword = () => {
        const k = keywordInput.trim();
        if (!k) return;
        if (keywords.includes(k)) return;
        if (keywords.length >= 5) {
            toast.error('Maximum 5 keywords per watchlist (LinkedIn rate-limit safe)');
            return;
        }
        setKeywords([...keywords, k]);
        setKeywordInput('');
    };

    const addExcl = (kind: 'slug' | 'company') => {
        if (kind === 'slug') {
            const s = exclSlugInput.trim().toLowerCase().replace(/^https?:\/\/(www\.)?linkedin\.com\/in\//, '').replace(/\/.*$/, '');
            if (!s || excludedSlugs.includes(s)) { setExclSlugInput(''); return; }
            setExcludedSlugs([...excludedSlugs, s]);
            setExclSlugInput('');
        } else {
            const c = exclCompanyInput.trim();
            if (!c || excludedCompanies.includes(c)) { setExclCompanyInput(''); return; }
            setExcludedCompanies([...excludedCompanies, c]);
            setExclCompanyInput('');
        }
    };

    const stage1Valid = name.trim().length > 0 && keywords.length > 0;
    const stage2Valid = true; // ICP optional
    const stage3Valid = true; // exclusions optional
    const stage4Valid = dailyBudget >= 1 && dailyBudget <= 100 && minReactions >= 0;
    const stage5Valid = routingMode === 'manual_review' || (routingMode === 'auto_push' && targetCampaignId);

    const handleCreate = useCallback(async () => {
        if (!stage1Valid || !stage4Valid || !stage5Valid) return;
        setSubmitting(true);
        try {
            const r = await apiClient<{ id: string; name: string }>('/api/linkedin/watchlists', {
                method: 'POST',
                body: JSON.stringify({
                    name: name.trim(),
                    keywords,
                    icp_profile_id: icpId || null,
                    excluded_profile_slugs: excludedSlugs,
                    excluded_company_terms: excludedCompanies,
                    min_reaction_count: minReactions,
                    daily_signal_budget: dailyBudget,
                    routing_mode: routingMode,
                    target_campaign_id: routingMode === 'auto_push' ? targetCampaignId : null,
                }),
            });
            toast.success(`Watchlist "${r.name}" created`);
            router.push(`/dashboard/linkedin/signals/watchlists/${r.id}`);
        } catch (err: any) {
            toast.error(err?.message || 'Failed to create watchlist');
        } finally {
            setSubmitting(false);
        }
    }, [stage1Valid, stage4Valid, stage5Valid, name, keywords, icpId, excludedSlugs, excludedCompanies, minReactions, dailyBudget, routingMode, targetCampaignId, router]);

    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <Link
                    href="/dashboard/linkedin/signals/watchlists"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 mb-2 no-underline"
                >
                    <ArrowLeft size={11} /> Watchlists
                </Link>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Radar size={18} strokeWidth={1.75} className="text-[#0A66C2]" /> New topics watchlist
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                    Tell us what to watch. We'll surface engagers who match your ICP without burning your LinkedIn account's daily action budget.
                </p>
            </div>

            {/* Stage indicator */}
            <div className="premium-card flex items-center justify-between !py-2.5">
                {([1, 2, 3, 4, 5] as const).map(s => {
                    const labels = ['Basics', 'Audience', 'Exclude', 'Volume', 'Routing'];
                    return (
                        <button
                            key={s}
                            onClick={() => setStage(s)}
                            disabled={
                                (s === 2 && !stage1Valid) ||
                                (s === 3 && !stage1Valid) ||
                                (s === 4 && !stage1Valid) ||
                                (s === 5 && !stage1Valid)
                            }
                            className="flex-1 flex items-center gap-2 px-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer bg-transparent border-none"
                        >
                            <div
                                className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                                style={{ background: stage === s ? '#0A66C2' : (stage > s ? '#16A34A' : '#F3F4F6'), color: stage === s || stage > s ? '#FFFFFF' : '#6B7280' }}
                            >
                                {stage > s ? <CheckCircle2 size={12} /> : s}
                            </div>
                            <span className="text-[11px] font-semibold text-gray-900 hidden md:inline">{labels[s - 1]}</span>
                        </button>
                    );
                })}
            </div>

            {/* Stage 1 — Basics */}
            {stage === 1 && (
                <div className="premium-card flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Watchlist name *</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder='e.g. "Founders posting about cold outbound — Q3"'
                            className="w-full px-3 py-2 text-sm rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                    </div>
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-gray-700">Keywords * <span className="text-gray-400 font-normal">(up to 5 — each runs its own search per scan)</span></label>
                            <span className="text-[10px] text-gray-500 tabular-nums">{keywords.length} / 5</span>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                value={keywordInput}
                                onChange={e => setKeywordInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(); } }}
                                placeholder='e.g. "cold outbound", "founder-led sales"'
                                disabled={keywords.length >= 5}
                                className="flex-1 px-3 py-2 text-sm rounded-lg outline-none bg-white disabled:opacity-50"
                                style={{ border: '1px solid #D1CBC5' }}
                            />
                            <button
                                onClick={addKeyword}
                                disabled={keywords.length >= 5 || !keywordInput.trim()}
                                className="flex items-center gap-1 px-3 py-2 rounded-md bg-gray-900 text-white text-xs font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus size={12} /> Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {keywords.map(k => (
                                <span key={k} className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800">
                                    <Hash size={9} /> {k}
                                    <button onClick={() => setKeywords(keywords.filter(x => x !== k))} className="ml-1 text-blue-600 hover:text-blue-900 cursor-pointer bg-transparent border-none">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setStage(2)}
                            disabled={!stage1Valid}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next: Audience <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            )}

            {/* Stage 2 — Audience filter */}
            {stage === 2 && (
                <div className="premium-card flex flex-col gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Target size={12} /> ICP filter</h2>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Only engagers matching this ICP will be surfaced. Leave blank to accept any engager (be ready for noise).
                        </p>
                    </div>
                    <select
                        value={icpId}
                        onChange={e => setIcpId(e.target.value)}
                        className="w-full px-3 py-2 text-sm rounded-lg outline-none bg-white cursor-pointer"
                        style={{ border: '1px solid #D1CBC5' }}
                    >
                        <option value="">— No ICP filter (accept all engagers) —</option>
                        {icps.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
                    </select>
                    {icps.length === 0 && (
                        <p className="text-[11px] text-gray-500">
                            No ICPs configured yet. <Link href="/dashboard/linkedin/icp" className="underline">Create one</Link> to filter watchlist matches.
                        </p>
                    )}
                    <div className="flex justify-between">
                        <button onClick={() => setStage(1)} className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-none flex items-center gap-1"><ArrowLeft size={12} /> Back</button>
                        <button onClick={() => setStage(3)} className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold cursor-pointer">Next: Exclude <ArrowRight size={14} /></button>
                    </div>
                </div>
            )}

            {/* Stage 3 — Exclusions */}
            {stage === 3 && (
                <div className="premium-card flex flex-col gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><FilterIcon size={12} /> Exclude</h2>
                        <p className="text-[11px] text-gray-500 mt-1">
                            Drop engagers whose profile slug or current company matches the entries below. Useful for filtering out your team, partners, and active customers (the customer registry already runs a separate exclusion, so this is for everything else).
                        </p>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Profile slugs to exclude</label>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                value={exclSlugInput}
                                onChange={e => setExclSlugInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExcl('slug'); } }}
                                placeholder='linkedin.com/in/jdoe — or just "jdoe"'
                                className="flex-1 px-3 py-1.5 text-xs rounded-lg outline-none bg-white"
                                style={{ border: '1px solid #D1CBC5' }}
                            />
                            <button onClick={() => addExcl('slug')} className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold cursor-pointer">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {excludedSlugs.map(s => (
                                <span key={s} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700">
                                    {s}
                                    <button onClick={() => setExcludedSlugs(excludedSlugs.filter(x => x !== s))} className="ml-1 text-gray-500 hover:text-gray-900 cursor-pointer bg-transparent border-none">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Company name terms to exclude</label>
                        <div className="flex items-center gap-2 mb-2">
                            <input
                                value={exclCompanyInput}
                                onChange={e => setExclCompanyInput(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExcl('company'); } }}
                                placeholder={`e.g. "Acme" — matches anywhere in the engager's headline`}
                                className="flex-1 px-3 py-1.5 text-xs rounded-lg outline-none bg-white"
                                style={{ border: '1px solid #D1CBC5' }}
                            />
                            <button onClick={() => addExcl('company')} className="px-3 py-1.5 rounded-md bg-gray-900 text-white text-xs font-semibold cursor-pointer">Add</button>
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {excludedCompanies.map(c => (
                                <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-gray-100 text-gray-700">
                                    {c}
                                    <button onClick={() => setExcludedCompanies(excludedCompanies.filter(x => x !== c))} className="ml-1 text-gray-500 hover:text-gray-900 cursor-pointer bg-transparent border-none">×</button>
                                </span>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-between">
                        <button onClick={() => setStage(2)} className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-none flex items-center gap-1"><ArrowLeft size={12} /> Back</button>
                        <button onClick={() => setStage(4)} className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold cursor-pointer">Next: Volume <ArrowRight size={14} /></button>
                    </div>
                </div>
            )}

            {/* Stage 4 — Volume / cadence */}
            {stage === 4 && (
                <div className="premium-card flex flex-col gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Gauge size={12} /> Volume + cadence</h2>
                        <p className="text-[11px] text-gray-500 mt-1">
                            We cap each watchlist's daily output to protect your LinkedIn accounts from automation blocks. These defaults are conservative — raise them after a few clean scans.
                        </p>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Minimum reactions on a post</label>
                        <input
                            type="number" min={0} max={1000}
                            value={minReactions}
                            onChange={e => setMinReactions(parseInt(e.target.value) || 0)}
                            className="w-32 px-3 py-1.5 text-sm rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                        <p className="text-[10px] text-gray-500 mt-1">Posts below this threshold are skipped before we hydrate engagers — keeps low-engagement noise out + saves API budget.</p>
                    </div>
                    <div>
                        <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Daily signal budget (max matches per day) — capped at 100</label>
                        <input
                            type="number" min={1} max={100}
                            value={dailyBudget}
                            onChange={e => setDailyBudget(parseInt(e.target.value) || 1)}
                            className="w-32 px-3 py-1.5 text-sm rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                        <p className="text-[10px] text-gray-500 mt-1">The scan stops once this many matches are recorded for the day. 50 is comfortable for a single-account workspace.</p>
                    </div>
                    <div
                        className="rounded-md p-2 text-[11px]"
                        style={{ background: '#FFFBEB', border: '1px solid #FDE68A', color: '#92400E' }}
                    >
                        <strong>Why these limits?</strong> Each scan makes ~1 search call per keyword + 2 hydration calls per post above threshold. LinkedIn caps automated actions at ~100/day per connected account; we distribute calls across all your connected accounts but the ceiling is real.
                    </div>
                    <div className="flex justify-between">
                        <button onClick={() => setStage(3)} className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-none flex items-center gap-1"><ArrowLeft size={12} /> Back</button>
                        <button onClick={() => setStage(5)} disabled={!stage4Valid} className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold cursor-pointer disabled:opacity-50">Next: Routing <ArrowRight size={14} /></button>
                    </div>
                </div>
            )}

            {/* Stage 5 — Routing */}
            {stage === 5 && (
                <div className="premium-card flex flex-col gap-4">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-1.5"><Rocket size={12} /> Routing</h2>
                        <p className="text-[11px] text-gray-500 mt-1">
                            What happens when an engager matches.
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {([
                            { key: 'manual_review', title: 'Manual review', desc: 'Matches land in the watchlist detail page. You click to push into a campaign.' },
                            { key: 'auto_push', title: 'Auto-push', desc: 'Every match gets enrolled into the target LinkedIn campaign immediately. No human in the loop.' },
                        ] as const).map(opt => (
                            <button
                                key={opt.key}
                                onClick={() => setRoutingMode(opt.key as 'manual_review' | 'auto_push')}
                                className="text-left rounded-lg p-3 cursor-pointer transition-colors"
                                style={{
                                    background: routingMode === opt.key ? '#EFF6FF' : '#FFFFFF',
                                    border: routingMode === opt.key ? '2px solid #0A66C2' : '1px solid #E8E3DC',
                                }}
                            >
                                <div className="text-xs font-bold text-gray-900 mb-1">{opt.title}</div>
                                <p className="text-[11px] text-gray-600 leading-relaxed">{opt.desc}</p>
                            </button>
                        ))}
                    </div>
                    {routingMode === 'auto_push' && (
                        <div>
                            <label className="block text-[11px] font-semibold text-gray-700 mb-1.5">Target LinkedIn campaign *</label>
                            <select
                                value={targetCampaignId}
                                onChange={e => setTargetCampaignId(e.target.value)}
                                className="w-full px-3 py-2 text-sm rounded-lg outline-none bg-white cursor-pointer"
                                style={{ border: '1px solid #D1CBC5' }}
                            >
                                <option value="">— Pick a LinkedIn campaign —</option>
                                {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                            {campaigns.length === 0 && (
                                <p className="text-[11px] text-amber-700 mt-1 flex items-center gap-1">
                                    <AlertTriangle size={11} /> No LinkedIn campaigns yet. <Link href="/dashboard/linkedin/campaigns/new" className="underline">Create one</Link> first.
                                </p>
                            )}
                        </div>
                    )}
                    <div className="flex justify-between">
                        <button onClick={() => setStage(4)} className="text-xs text-gray-600 hover:text-gray-900 cursor-pointer bg-transparent border-none flex items-center gap-1"><ArrowLeft size={12} /> Back</button>
                        <button
                            onClick={handleCreate}
                            disabled={!stage5Valid || submitting}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Rocket size={14} />}
                            {submitting ? 'Creating…' : 'Create watchlist'}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
