'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';

export default function Configuration() {
    const [rules, setRules] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        persona: '',
        min_score: 0,
        target_campaign_id: '',
        priority: 0,
    });

    const fetchRules = () => {
        apiClient<any>('/api/dashboard/routing-rules')
            .then(data => setRules(Array.isArray(data) ? data : []))
            .catch(() => setRules([]));
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await apiClient<any>('/api/dashboard/routing-rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        fetchRules();
        setFormData({ persona: '', min_score: 0, target_campaign_id: '', priority: 0 });
    };

    return (
        <div style={{ height: 'calc(100vh - 4rem)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <div className="page-header">
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>Routing Configuration</h1>
                <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>Manage lead routing logic and rules</div>
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

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>
                                Target Campaign ID
                            </label>
                            <input
                                className="premium-input w-full"
                                type="text"
                                value={formData.target_campaign_id}
                                onChange={e => setFormData({ ...formData, target_campaign_id: e.target.value })}
                                placeholder="Campaign Identifier"
                                required
                                style={{ width: '100%' }}
                            />
                        </div>

                        <button type="submit" className="premium-btn" style={{ marginTop: '1rem', width: '100%' }}>
                            Create Rule
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: '#1E293B', flexShrink: 0 }}>Active Rules</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                        {rules.map((rule) => (
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
                                <div>
                                    <div style={{ fontWeight: 600, color: '#1E293B', marginBottom: '0.25rem' }}>{rule.persona}</div>
                                    <div style={{ fontSize: '0.8rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontWeight: 500, color: '#2563EB', background: '#EFF6FF', padding: '2px 8px', borderRadius: '4px' }}>Min Score: {rule.min_score}</span>
                                        <span>&rarr;</span>
                                        <span style={{ fontFamily: 'monospace' }}>{rule.target_campaign_id}</span>
                                    </div>
                                </div>
                                <div style={{
                                    background: '#F3F4F6',
                                    color: '#4B5563',
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: '700',
                                    textTransform: 'uppercase'
                                }}>
                                    Pri: {rule.priority}
                                </div>
                            </div>
                        ))}
                        {rules.length === 0 && <div style={{ color: '#9CA3AF', textAlign: 'center', padding: '3rem', fontStyle: 'italic', border: '1px dashed #E2E8F0', borderRadius: '12px' }}>No rules defined.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
