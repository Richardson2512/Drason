'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import type { CampaignSummary, RoutingRule } from '@/types/api';
import { useCampaignList } from '@/hooks/useCampaignList';

export default function Configuration() {
    const [rules, setRules] = useState<RoutingRule[]>([]);
    const { campaigns } = useCampaignList();
    const [formData, setFormData] = useState({
        persona: '',
        min_score: 0,
        target_campaign_id: '',
        priority: 0,
    });
    const [campaignSearch, setCampaignSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all');

    // Derive unique platforms from synced campaigns
    const platforms = Array.from(new Set(campaigns.map(c => c.source_platform || 'unknown').filter(Boolean)));

    const fetchRules = () => {
        apiClient<RoutingRule[] | { data: RoutingRule[] }>('/api/dashboard/routing-rules')
            .then(data => setRules(Array.isArray(data) ? data : (data as { data: RoutingRule[] })?.data ?? []))
            .catch(() => setRules([]));
    };

    useEffect(() => {
        fetchRules();
    }, []);

    // Build a campaign lookup map for the rules list
    const campaignMap = new Map<string, CampaignSummary>();
    campaigns.forEach(c => campaignMap.set(c.id, c));

    // Filter campaigns based on platform selection and search input
    const filteredCampaigns = campaigns.filter(c => {
        const platformMatch = selectedPlatform === 'all' || (c.source_platform || 'unknown') === selectedPlatform;
        if (!platformMatch) return false;
        const term = campaignSearch.toLowerCase();
        return c.name.toLowerCase().includes(term) ||
            (c.source_platform || '').toLowerCase().includes(term) ||
            c.id.toLowerCase().includes(term);
    });

    // Group filtered campaigns by platform
    const groupedCampaigns = filteredCampaigns.reduce<Record<string, CampaignSummary[]>>((acc, c) => {
        const platform = c.source_platform || 'unknown';
        if (!acc[platform]) acc[platform] = [];
        acc[platform].push(c);
        return acc;
    }, {});

    const selectedCampaign = campaignMap.get(formData.target_campaign_id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.target_campaign_id) return;
        await apiClient<{ success: boolean }>('/api/dashboard/routing-rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        fetchRules();
        setFormData({ persona: '', min_score: 0, target_campaign_id: '', priority: 0 });
        setCampaignSearch('');
        setSelectedPlatform('all');
    };

    return (
        <div className="flex flex-col gap-6 pb-8">
            <div className="page-header">
                <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">Routing Configuration</h1>
                <div className="text-gray-500 text-lg">Route leads to campaigns across platforms</div>
            </div>

            {/* How Routing Works — Collapsible Guide */}
            <div className="premium-card">
                <details className="group">
                    <summary className="flex items-center justify-between cursor-pointer list-none">
                        <div className="flex items-center gap-3">
                            <span className="text-lg">💡</span>
                            <h2 className="text-base font-bold text-slate-800 m-0">How does routing work? (click to expand)</h2>
                        </div>
                        <span className="text-gray-400 group-open:rotate-180 transition-transform text-sm">▼</span>
                    </summary>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Flow explanation */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-3">The Flow</h3>
                                <div className="flex flex-col gap-2 text-sm text-gray-600">
                                    <div className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">1</span>
                                        <span>Lead arrives from Clay webhook or API with a <strong>persona</strong> (e.g., "CEO") and a <strong>lead score</strong> (0-100)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">2</span>
                                        <span>Email gets <strong>validated</strong> (syntax, MX, disposable check)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">3</span>
                                        <span>Health gate classifies lead as <strong className="text-green-600">GREEN</strong>, <strong className="text-amber-600">YELLOW</strong>, or <strong className="text-red-600">RED</strong></span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">4</span>
                                        <span>Routing engine matches the lead's <strong>persona</strong> against your rules (in priority order)</span>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <span className="bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">5</span>
                                        <span>If persona matches AND lead score ≥ <strong>min_score</strong> → lead is pushed to the <strong>target campaign</strong></span>
                                    </div>
                                </div>
                            </div>

                            {/* Example rules */}
                            <div>
                                <h3 className="text-sm font-bold text-slate-700 mb-3">Example Setup</h3>
                                <div className="space-y-2">
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                        <div className="font-semibold text-slate-800">Rule 1 — Priority 1</div>
                                        <div className="text-gray-500 mt-1">
                                            Persona: <strong>CEO</strong> · Min Score: <strong>60</strong> · Campaign: <strong>Enterprise Outreach</strong>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">CEOs with score 60+ go to your best campaign</div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                        <div className="font-semibold text-slate-800">Rule 2 — Priority 2</div>
                                        <div className="text-gray-500 mt-1">
                                            Persona: <strong>VP Marketing</strong> · Min Score: <strong>40</strong> · Campaign: <strong>Marketing Leaders</strong>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Marketing VPs with score 40+ go to a targeted campaign</div>
                                    </div>
                                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-sm">
                                        <div className="font-semibold text-slate-800">Rule 3 — Priority 3</div>
                                        <div className="text-gray-500 mt-1">
                                            Persona: <strong>*</strong> · Min Score: <strong>0</strong> · Campaign: <strong>General Outbound</strong>
                                        </div>
                                        <div className="text-xs text-gray-400 mt-1">Catch-all: any persona, any score → general campaign</div>
                                    </div>
                                </div>

                                <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
                                    <strong>Tip:</strong> Rules are evaluated in priority order (lowest number = highest priority). The first matching rule wins. Always add a catch-all rule with <strong>priority 99</strong> and <strong>min score 0</strong> to handle unmatched leads.
                                </div>
                            </div>
                        </div>

                        {/* Field explanations */}
                        <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 md:grid-cols-4 gap-3">
                            <div className="text-xs">
                                <div className="font-bold text-slate-700 mb-1">ICP Persona</div>
                                <div className="text-gray-500">The job title or role from Clay enrichment. Must match exactly (case-insensitive). Use <strong>*</strong> for a catch-all.</div>
                            </div>
                            <div className="text-xs">
                                <div className="font-bold text-slate-700 mb-1">Min Score</div>
                                <div className="text-gray-500">Minimum lead score (0-100) required. Leads below this score skip this rule and try the next one.</div>
                            </div>
                            <div className="text-xs">
                                <div className="font-bold text-slate-700 mb-1">Priority</div>
                                <div className="text-gray-500">Evaluation order. Lower number = checked first. Use 1-10 for specific rules, 99 for catch-all.</div>
                            </div>
                            <div className="text-xs">
                                <div className="font-bold text-slate-700 mb-1">Target Campaign</div>
                                <div className="text-gray-500">The campaign on Smartlead/Instantly/EmailBison where the lead gets pushed after matching.</div>
                            </div>
                        </div>
                    </div>
                </details>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form */}
                <div className="premium-card">
                    <h2 className="text-xl font-bold mb-6 text-slate-800">Add New Rule</h2>
                    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                ICP Persona
                            </label>
                            <input
                                className="premium-input w-full"
                                type="text"
                                value={formData.persona}
                                onChange={e => setFormData({ ...formData, persona: e.target.value })}
                                placeholder="e.g. CEO, VP Marketing, * (catch-all)"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Min Score
                                </label>
                                <input
                                    className="premium-input w-full"
                                    type="number"
                                    value={formData.min_score}
                                    onChange={e => setFormData({ ...formData, min_score: parseInt(e.target.value) })}
                                    placeholder="e.g. 60 (0 = accept all)"
                                    required
                                />
                            </div>
                            <div>
                                <label className="block mb-2 text-sm font-semibold text-gray-700">
                                    Priority
                                </label>
                                <input
                                    className="premium-input w-full"
                                    type="number"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                    placeholder="e.g. 1 (lower = first)"
                                    required
                                />
                            </div>
                        </div>

                        {/* Platform Selector */}
                        <div>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Platform
                            </label>
                            <select
                                className="premium-input w-full"
                                value={selectedPlatform}
                                onChange={e => {
                                    setSelectedPlatform(e.target.value);
                                    // Clear campaign selection when platform changes
                                    setFormData({ ...formData, target_campaign_id: '' });
                                    setCampaignSearch('');
                                }}
                            >
                                <option value="all">All Platforms</option>
                                {platforms.map(p => (
                                    <option key={p} value={p}>
                                        {p.charAt(0).toUpperCase() + p.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Campaign Selector with Platform Badges */}
                        <div className="relative">
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Target Campaign
                            </label>

                            {/* Selected campaign display or search input */}
                            {selectedCampaign && !showDropdown ? (
                                <div
                                    onClick={() => setShowDropdown(true)}
                                    className="w-full px-3.5 py-2.5 rounded-[10px] border border-slate-200 bg-white cursor-pointer flex items-center justify-between gap-2 transition-colors hover:border-blue-300"
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <PlatformBadge platform={selectedCampaign.source_platform || 'unknown'} />
                                        <span className="text-sm text-slate-800 font-medium truncate">
                                            {selectedCampaign.name}
                                        </span>
                                    </div>
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            ) : (
                                <input
                                    className="premium-input w-full"
                                    type="text"
                                    value={campaignSearch}
                                    onChange={e => {
                                        setCampaignSearch(e.target.value);
                                        setShowDropdown(true);
                                    }}
                                    onFocus={() => setShowDropdown(true)}
                                    placeholder="Search campaigns by name or platform..."
                                />
                            )}

                            {/* Dropdown */}
                            {showDropdown && (
                                <>
                                    {/* Backdrop to close dropdown */}
                                    <div
                                        className="fixed inset-0 z-40"
                                        onClick={() => setShowDropdown(false)}
                                    />

                                    <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-slate-200 shadow-lg max-h-[280px] overflow-y-auto z-50">
                                        {Object.keys(groupedCampaigns).length === 0 ? (
                                            <div className="p-6 text-center text-gray-400 text-sm">
                                                {campaigns.length === 0 ? 'No campaigns synced yet' : 'No campaigns match your search'}
                                            </div>
                                        ) : (
                                            Object.entries(groupedCampaigns).map(([platform, platformCampaigns]) => (
                                                <div key={platform}>
                                                    {/* Platform group header */}
                                                    <div className="px-3.5 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 sticky top-0 z-[1]">
                                                        <PlatformBadge platform={platform} />
                                                        <span className="text-[0.7rem] text-slate-400 font-medium">
                                                            {platformCampaigns.length} campaign{platformCampaigns.length !== 1 ? 's' : ''}
                                                        </span>
                                                    </div>

                                                    {/* Campaign items */}
                                                    {platformCampaigns.map(campaign => (
                                                        <div
                                                            key={campaign.id}
                                                            onClick={() => {
                                                                setFormData({ ...formData, target_campaign_id: campaign.id });
                                                                setCampaignSearch('');
                                                                setShowDropdown(false);
                                                            }}
                                                            className="px-3.5 py-2.5 cursor-pointer flex items-center justify-between gap-2 border-b border-slate-50 transition-colors hover:bg-blue-50"
                                                        >
                                                            <div className="min-w-0">
                                                                <div className="text-sm font-medium text-slate-800 truncate">
                                                                    {campaign.name}
                                                                </div>
                                                                <div className="text-[0.7rem] text-slate-400 font-mono">
                                                                    {campaign.id.substring(0, 12)}...
                                                                </div>
                                                            </div>
                                                            <span className="text-[0.7rem] px-1.5 py-0.5 rounded font-semibold shrink-0" style={{
                                                                background: campaign.status === 'active' ? '#ECFDF5' : campaign.status === 'paused' ? '#FEF2F2' : campaign.status === 'completed' ? '#FFF7ED' : '#FEF3C7',
                                                                color: campaign.status === 'active' ? '#059669' : campaign.status === 'paused' ? '#DC2626' : campaign.status === 'completed' ? '#C2410C' : '#D97706',
                                                            }}>
                                                                {campaign.status}
                                                            </span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <button
                            type="submit"
                            className="premium-btn mt-4 w-full"
                            disabled={!formData.target_campaign_id}
                        >
                            Create Rule
                        </button>
                    </form>
                </div>

                {/* Active Rules List */}
                <div className="premium-card flex flex-col">
                    <h2 className="text-xl font-bold mb-6 text-slate-800 shrink-0">Active Rules</h2>
                    <div className="flex flex-col gap-3 overflow-y-auto flex-1 pr-2">
                        {rules.map((rule) => {
                            const campaign = campaignMap.get(rule.target_campaign_id);
                            return (
                                <div key={rule.id} className="p-5 bg-white rounded-xl border border-slate-100 flex justify-between items-center shrink-0 transition-all duration-200 shadow-sm hover:shadow-md hover:border-blue-100">
                                    <div className="min-w-0 flex-1">
                                        <div className="font-semibold text-slate-800 mb-1.5">{rule.persona}</div>
                                        <div className="text-[0.8rem] text-slate-500 flex items-center gap-2 flex-wrap">
                                            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                                                Min Score: {rule.min_score}
                                            </span>
                                            <span>&rarr;</span>
                                            {campaign ? (
                                                <span className="inline-flex items-center gap-1.5">
                                                    <PlatformBadge platform={campaign.source_platform || 'unknown'} />
                                                    <span className="font-medium text-gray-700 truncate max-w-[200px]">
                                                        {campaign.name}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span className="font-mono text-xs text-slate-400">
                                                    {rule.target_campaign_id.substring(0, 16)}...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase shrink-0">
                                        Pri: {rule.priority}
                                    </div>
                                </div>
                            );
                        })}
                        {rules.length === 0 && (
                            <div className="text-center p-10 border border-dashed border-slate-200 rounded-xl">
                                <div className="text-3xl mb-3">🎯</div>
                                <div className="text-gray-700 font-semibold mb-2">No routing rules yet</div>
                                <div className="text-gray-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                                    Create your first rule to start routing leads to campaigns automatically. Click the guide above for examples.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
