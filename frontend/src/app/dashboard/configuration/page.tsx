'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

interface Campaign {
    id: string;
    name: string;
    status: string;
    source_platform: string;
}

interface RoutingRule {
    id: string;
    persona: string;
    min_score: number;
    target_campaign_id: string;
    priority: number;
    campaign?: Campaign;
}

const PLATFORM_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    smartlead: { label: 'Smartlead', color: '#2563EB', bg: '#EFF6FF', border: '#BFDBFE' },
    emailbison: { label: 'EmailBison', color: '#7C3AED', bg: '#F5F3FF', border: '#DDD6FE' },
    instantly: { label: 'Instantly', color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
    replyio: { label: 'Reply.io', color: '#DC2626', bg: '#FEF2F2', border: '#FECACA' },
};

function PlatformBadge({ platform }: { platform: string }) {
    const config = PLATFORM_CONFIG[platform] || { label: platform, color: '#6B7280', bg: '#F3F4F6', border: '#E5E7EB' };
    return (
        <span style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: config.color,
            background: config.bg,
            border: `1px solid ${config.border}`,
            padding: '2px 8px',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            whiteSpace: 'nowrap',
        }}>
            {config.label}
        </span>
    );
}

export default function Configuration() {
    const [rules, setRules] = useState<RoutingRule[]>([]);
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [formData, setFormData] = useState({
        persona: '',
        min_score: 0,
        target_campaign_id: '',
        priority: 0,
    });
    const [campaignSearch, setCampaignSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    const fetchRules = () => {
        apiClient<any>('/api/dashboard/routing-rules')
            .then(data => setRules(Array.isArray(data) ? data : (data?.data || [])))
            .catch(() => setRules([]));
    };

    const fetchCampaigns = () => {
        apiClient<any>('/api/dashboard/campaigns?limit=1000')
            .then(data => {
                const campaignList = Array.isArray(data) ? data : (data?.data || []);
                setCampaigns(campaignList);
            })
            .catch(() => setCampaigns([]));
    };

    useEffect(() => {
        fetchRules();
        fetchCampaigns();
    }, []);

    // Build a campaign lookup map for the rules list
    const campaignMap = new Map<string, Campaign>();
    campaigns.forEach(c => campaignMap.set(c.id, c));

    // Filter campaigns based on search input
    const filteredCampaigns = campaigns.filter(c => {
        const term = campaignSearch.toLowerCase();
        return c.name.toLowerCase().includes(term) ||
            c.source_platform.toLowerCase().includes(term) ||
            c.id.toLowerCase().includes(term);
    });

    // Group filtered campaigns by platform
    const groupedCampaigns = filteredCampaigns.reduce<Record<string, Campaign[]>>((acc, c) => {
        const platform = c.source_platform || 'unknown';
        if (!acc[platform]) acc[platform] = [];
        acc[platform].push(c);
        return acc;
    }, {});

    const selectedCampaign = campaignMap.get(formData.target_campaign_id);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.target_campaign_id) return;
        await apiClient<any>('/api/dashboard/routing-rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        fetchRules();
        setFormData({ persona: '', min_score: 0, target_campaign_id: '', priority: 0 });
        setCampaignSearch('');
    };

    return (
        <div style={{ height: 'calc(100vh - 4rem)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header">
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>Routing Configuration</h1>
                <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>Route leads to campaigns across platforms</div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8" style={{ flex: 1, minHeight: 0 }}>
                {/* Form */}
                <div className="premium-card">
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1E293B' }}>Add New Rule</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                ICP Persona
                            </label>
                            <input
                                className="premium-input w-full"
                                type="text"
                                value={formData.persona}
                                onChange={e => setFormData({ ...formData, persona: e.target.value })}
                                placeholder="e.g. CEO, Founder, Marketing Director"
                                required
                                style={{ width: '100%' }}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                    Min Score
                                </label>
                                <input
                                    className="premium-input w-full"
                                    type="number"
                                    value={formData.min_score}
                                    onChange={e => setFormData({ ...formData, min_score: parseInt(e.target.value) })}
                                    placeholder="0-100"
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                    Priority
                                </label>
                                <input
                                    className="premium-input w-full"
                                    type="number"
                                    value={formData.priority}
                                    onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                    placeholder="Order"
                                    required
                                    style={{ width: '100%' }}
                                />
                            </div>
                        </div>

                        {/* Campaign Selector with Platform Badges */}
                        <div style={{ position: 'relative' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                Target Campaign
                            </label>

                            {/* Selected campaign display or search input */}
                            {selectedCampaign && !showDropdown ? (
                                <div
                                    onClick={() => setShowDropdown(true)}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.875rem',
                                        borderRadius: '10px',
                                        border: '1px solid #E2E8F0',
                                        background: '#FFFFFF',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        gap: '0.5rem',
                                        transition: 'border-color 0.2s',
                                    }}
                                    className="hover:border-blue-300"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', minWidth: 0 }}>
                                        <PlatformBadge platform={selectedCampaign.source_platform} />
                                        <span style={{ fontSize: '0.875rem', color: '#1E293B', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
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
                                    style={{ width: '100%' }}
                                />
                            )}

                            {/* Dropdown */}
                            {showDropdown && (
                                <>
                                    {/* Backdrop to close dropdown */}
                                    <div
                                        style={{ position: 'fixed', inset: 0, zIndex: 40 }}
                                        onClick={() => setShowDropdown(false)}
                                    />

                                    <div style={{
                                        position: 'absolute',
                                        top: '100%',
                                        left: 0,
                                        right: 0,
                                        marginTop: '4px',
                                        background: '#FFFFFF',
                                        borderRadius: '12px',
                                        border: '1px solid #E2E8F0',
                                        boxShadow: '0 10px 25px rgba(0,0,0,0.1), 0 4px 10px rgba(0,0,0,0.05)',
                                        maxHeight: '280px',
                                        overflowY: 'auto',
                                        zIndex: 50,
                                    }}>
                                        {Object.keys(groupedCampaigns).length === 0 ? (
                                            <div style={{ padding: '1.5rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>
                                                {campaigns.length === 0 ? 'No campaigns synced yet' : 'No campaigns match your search'}
                                            </div>
                                        ) : (
                                            Object.entries(groupedCampaigns).map(([platform, platformCampaigns]) => (
                                                <div key={platform}>
                                                    {/* Platform group header */}
                                                    <div style={{
                                                        padding: '0.5rem 0.875rem',
                                                        background: '#F8FAFC',
                                                        borderBottom: '1px solid #F1F5F9',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.5rem',
                                                        position: 'sticky',
                                                        top: 0,
                                                        zIndex: 1,
                                                    }}>
                                                        <PlatformBadge platform={platform} />
                                                        <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 500 }}>
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
                                                            style={{
                                                                padding: '0.625rem 0.875rem',
                                                                cursor: 'pointer',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'space-between',
                                                                gap: '0.5rem',
                                                                borderBottom: '1px solid #F8FAFC',
                                                                transition: 'background 0.15s',
                                                            }}
                                                            className="hover:bg-blue-50"
                                                        >
                                                            <div style={{ minWidth: 0 }}>
                                                                <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#1E293B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                                    {campaign.name}
                                                                </div>
                                                                <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontFamily: 'monospace' }}>
                                                                    {campaign.id.substring(0, 12)}...
                                                                </div>
                                                            </div>
                                                            <span style={{
                                                                fontSize: '0.7rem',
                                                                padding: '2px 6px',
                                                                borderRadius: '4px',
                                                                fontWeight: 600,
                                                                background: campaign.status === 'active' ? '#ECFDF5' : '#FEF3C7',
                                                                color: campaign.status === 'active' ? '#059669' : '#D97706',
                                                                flexShrink: 0,
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
                            className="premium-btn"
                            style={{ marginTop: '1rem', width: '100%' }}
                            disabled={!formData.target_campaign_id}
                        >
                            Create Rule
                        </button>
                    </form>
                </div>

                {/* Active Rules List */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1E293B', flexShrink: 0 }}>Active Rules</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                        {rules.map((rule) => {
                            const campaign = campaignMap.get(rule.target_campaign_id);
                            return (
                                <div key={rule.id} style={{
                                    padding: '1.25rem',
                                    background: '#FFFFFF',
                                    borderRadius: '12px',
                                    border: '1px solid #F1F5F9',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                    transition: 'all 0.2s',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }} className="hover:shadow-md hover:border-blue-100">
                                    <div style={{ minWidth: 0, flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.375rem' }}>{rule.persona}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                            <span style={{ fontWeight: 500, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>
                                                Min Score: {rule.min_score}
                                            </span>
                                            <span>&rarr;</span>
                                            {campaign ? (
                                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}>
                                                    <PlatformBadge platform={campaign.source_platform} />
                                                    <span style={{ fontWeight: 500, color: '#374151', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '200px' }}>
                                                        {campaign.name}
                                                    </span>
                                                </span>
                                            ) : (
                                                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: '#94A3B8' }}>
                                                    {rule.target_campaign_id.substring(0, 16)}...
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div style={{
                                        background: '#F3F4F6',
                                        color: '#4B5563',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: '700',
                                        textTransform: 'uppercase',
                                        flexShrink: 0,
                                    }}>
                                        Pri: {rule.priority}
                                    </div>
                                </div>
                            );
                        })}
                        {rules.length === 0 && <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '3rem', fontStyle: 'italic', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>No rules defined.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
