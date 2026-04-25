'use client';
import { useEffect, useState, useRef } from 'react';
import { apiClient } from '@/lib/api';
import { PlatformBadge } from '@/components/ui/PlatformBadge';
import type { CampaignSummary, RoutingRule } from '@/types/api';
import { useCampaignList } from '@/hooks/useCampaignList';
import CustomSelect from '@/components/ui/CustomSelect';

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
    const [deleteConfirm, setDeleteConfirm] = useState<{ id: string; persona: string; campaign: string } | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const dropdownTriggerRef = useRef<HTMLDivElement>(null);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });

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

    const openDropdown = () => {
        if (dropdownTriggerRef.current) {
            const rect = dropdownTriggerRef.current.getBoundingClientRect();
            setDropdownPos({ top: rect.bottom + 4, left: rect.left, width: rect.width });
        }
        setShowDropdown(true);
    };

    const handleDeleteClick = (rule: RoutingRule) => {
        const campaign = campaignMap.get(rule.target_campaign_id);
        setDeleteConfirm({
            id: rule.id,
            persona: rule.persona,
            campaign: campaign?.name || rule.target_campaign_id,
        });
        setDeleteError(null);
    };

    const executeDelete = async () => {
        if (!deleteConfirm) return;
        setDeleteLoading(true);
        setDeleteError(null);
        try {
            await apiClient(`/api/dashboard/routing-rules/${deleteConfirm.id}`, { method: 'DELETE' });
            setDeleteConfirm(null);
            fetchRules();
        } catch (err: any) {
            setDeleteError(err?.message || 'Failed to delete routing rule');
        } finally {
            setDeleteLoading(false);
        }
    };

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
        <div className="p-4 flex flex-col gap-4 pb-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Routing Configuration</h1>
                <p className="text-sm text-gray-500 mt-1">Route leads to campaigns across platforms</p>
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Form */}
                <div className="premium-card">
                    <h2 className="text-xl font-bold mb-3 text-slate-800">Add New Rule</h2>
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
                            <CustomSelect
                                value={selectedPlatform}
                                onChange={v => {
                                    setSelectedPlatform(v);
                                    // Clear campaign selection when platform changes
                                    setFormData({ ...formData, target_campaign_id: '' });
                                    setCampaignSearch('');
                                }}
                                options={[
                                    { value: 'all', label: 'All Platforms' },
                                    ...platforms.map(p => ({ value: p, label: p.charAt(0).toUpperCase() + p.slice(1) })),
                                ]}
                            />
                        </div>

                        {/* Campaign Selector with Platform Badges */}
                        <div ref={dropdownTriggerRef}>
                            <label className="block mb-2 text-sm font-semibold text-gray-700">
                                Target Campaign
                            </label>

                            {/* Selected campaign display or search input */}
                            {selectedCampaign && !showDropdown ? (
                                <div
                                    onClick={openDropdown}
                                    className="w-full px-3 py-2 rounded-lg bg-white cursor-pointer flex items-center justify-between gap-2 transition-colors hover:bg-[#F5F1EA]"
                                    style={{ border: '1px solid #D1CBC5' }}
                                >
                                    <div className="flex items-center gap-2 min-w-0">
                                        <PlatformBadge platform={selectedCampaign.source_platform || 'unknown'} />
                                        <span className="text-xs text-gray-900 font-medium truncate">
                                            {selectedCampaign.name}
                                        </span>
                                    </div>
                                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </div>
                            ) : (
                                <input
                                    className="w-full px-3 py-2 rounded-lg text-xs outline-none bg-white"
                                    style={{ border: '1px solid #D1CBC5' }}
                                    type="text"
                                    value={campaignSearch}
                                    onChange={e => {
                                        setCampaignSearch(e.target.value);
                                        openDropdown();
                                    }}
                                    onFocus={openDropdown}
                                    placeholder="Search campaigns by name or platform..."
                                />
                            )}
                        </div>

                        {/* Campaign Dropdown — fixed position, escapes card overflow */}
                        {showDropdown && (
                            <>
                                <div className="fixed inset-0 z-[9998]" onClick={() => setShowDropdown(false)} />
                                <div
                                    className="fixed z-[9999] bg-white overflow-y-auto scrollbar-hide"
                                    style={{
                                        top: dropdownPos.top,
                                        left: dropdownPos.left,
                                        width: dropdownPos.width,
                                        maxHeight: '320px',
                                        border: '1px solid #D1CBC5',
                                        borderRadius: '8px',
                                    }}
                                >
                                    {Object.keys(groupedCampaigns).length === 0 ? (
                                        <div className="p-4 text-center text-gray-400 text-xs">
                                            {campaigns.length === 0 ? 'No campaigns synced yet. Run a sync in Settings first.' : 'No campaigns match your search.'}
                                        </div>
                                    ) : (
                                        Object.entries(groupedCampaigns).map(([platform, platformCampaigns]) => (
                                            <div key={platform}>
                                                <div className="px-3 py-1.5 bg-[#F7F2EB] flex items-center gap-2 sticky top-0" style={{ borderBottom: '1px solid #D1CBC5' }}>
                                                    <PlatformBadge platform={platform} />
                                                    <span className="text-[10px] text-gray-500 font-medium">
                                                        {platformCampaigns.length} campaign{platformCampaigns.length !== 1 ? 's' : ''}
                                                    </span>
                                                </div>
                                                {platformCampaigns.map(campaign => (
                                                    <div
                                                        key={campaign.id}
                                                        onClick={() => {
                                                            setFormData({ ...formData, target_campaign_id: campaign.id });
                                                            setCampaignSearch('');
                                                            setShowDropdown(false);
                                                        }}
                                                        className="px-3 py-2 cursor-pointer flex items-center justify-between gap-2 transition-colors hover:bg-[#F5F1EA]"
                                                        style={{ borderBottom: '1px solid #F0EBE3' }}
                                                    >
                                                        <div className="min-w-0">
                                                            <div className="text-xs font-medium text-gray-900 truncate">{campaign.name}</div>
                                                        </div>
                                                        <span className="text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0" style={{
                                                            background: campaign.status === 'active' ? '#D1FAE5' : campaign.status === 'paused' ? '#FEE2E2' : '#FEF3C7',
                                                            color: campaign.status === 'active' ? '#065F46' : campaign.status === 'paused' ? '#991B1B' : '#92400E',
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
                    <h2 className="text-xl font-bold mb-3 text-slate-800 shrink-0">Active Rules</h2>
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
                                    <div className="flex items-center gap-2 shrink-0">
                                        <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold uppercase">
                                            Pri: {rule.priority}
                                        </div>
                                        <button
                                            onClick={() => handleDeleteClick(rule)}
                                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors border-none bg-transparent cursor-pointer"
                                            title="Delete rule"
                                        >
                                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="3 6 5 6 21 6"></polyline>
                                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                        {rules.length === 0 && (
                            <div className="text-center p-10 border border-dashed border-slate-200 rounded-xl">
                                <div className="text-xl mb-2">🎯</div>
                                <div className="text-gray-700 font-semibold mb-2">No routing rules yet</div>
                                <div className="text-gray-400 text-sm max-w-[280px] mx-auto leading-relaxed">
                                    Create your first rule to start routing leads to campaigns automatically. Click the guide above for examples.
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => !deleteLoading && setDeleteConfirm(null)}>
                    <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-red-600"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">Delete Routing Rule</h3>
                        </div>
                        <p className="text-gray-600 mb-2">Are you sure you want to delete this routing rule?</p>
                        <div className="bg-gray-50 rounded-xl p-4 mb-4 text-sm">
                            <p className="text-gray-700"><span className="font-semibold">Persona:</span> {deleteConfirm.persona}</p>
                            <p className="text-gray-700"><span className="font-semibold">Target Campaign:</span> {deleteConfirm.campaign}</p>
                        </div>
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3">
                            <p className="text-amber-800 text-sm">Leads matching this persona will no longer be routed to the target campaign. They will stay in the holding pool until a new rule matches.</p>
                        </div>
                        {deleteError && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                                <p className="text-red-700 text-sm">{deleteError}</p>
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(null)}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={executeDelete}
                                disabled={deleteLoading}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleteLoading ? 'Deleting...' : 'Delete Rule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
