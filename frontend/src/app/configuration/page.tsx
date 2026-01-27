'use client';
import { useEffect, useState } from 'react';

export default function Configuration() {
    const [rules, setRules] = useState<any[]>([]);
    const [formData, setFormData] = useState({
        persona: '',
        min_score: 0,
        target_campaign_id: '',
        priority: 0,
    });

    const fetchRules = () => {
        fetch('/api/dashboard/routing-rules').then(res => res.json()).then(setRules);
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetch('/api/dashboard/routing-rules', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
        });
        fetchRules();
        setFormData({ persona: '', min_score: 0, target_campaign_id: '', priority: 0 });
    };

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>Routing Configuration</h1>

            <div className="grid grid-cols-2">
                {/* Form */}
                <div className="card">
                    <h2 style={{ marginBottom: '1rem' }}>Add Routing Rule</h2>
                    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a3a3a3' }}>
                                ICP Persona
                            </label>
                            <input
                                className="input"
                                type="text"
                                value={formData.persona}
                                onChange={e => setFormData({ ...formData, persona: e.target.value })}
                                placeholder="e.g. CEO"
                                required
                                style={{ width: '100%', padding: '0.5rem', background: '#0a0a0a', border: '1px solid #262626', color: 'white', borderRadius: '4px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a3a3a3' }}>
                                Min Lead Score
                            </label>
                            <input
                                className="input"
                                type="number"
                                value={formData.min_score}
                                onChange={e => setFormData({ ...formData, min_score: parseInt(e.target.value) })}
                                placeholder="0"
                                required
                                style={{ width: '100%', padding: '0.5rem', background: '#0a0a0a', border: '1px solid #262626', color: 'white', borderRadius: '4px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a3a3a3' }}>
                                Target Campaign ID
                            </label>
                            <input
                                className="input"
                                type="text"
                                value={formData.target_campaign_id}
                                onChange={e => setFormData({ ...formData, target_campaign_id: e.target.value })}
                                placeholder="e.g. camp_1"
                                required
                                style={{ width: '100%', padding: '0.5rem', background: '#0a0a0a', border: '1px solid #262626', color: 'white', borderRadius: '4px' }}
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#a3a3a3' }}>
                                Priority
                            </label>
                            <input
                                className="input"
                                type="number"
                                value={formData.priority}
                                onChange={e => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                                placeholder="0"
                                required
                                style={{ width: '100%', padding: '0.5rem', background: '#0a0a0a', border: '1px solid #262626', color: 'white', borderRadius: '4px' }}
                            />
                        </div>

                        <button type="submit" className="btn" style={{ marginTop: '0.5rem' }}>
                            Create Rule
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column', height: '100%', maxHeight: 'calc(100vh - 8rem)', overflow: 'hidden' }}>
                    <h2 style={{ marginBottom: '1rem', flexShrink: 0 }}>Active Rules</h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', overflowY: 'auto', flex: 1, paddingRight: '0.5rem' }}>
                        {rules.map((rule) => (
                            <div key={rule.id} style={{
                                padding: '1rem',
                                background: '#0a0a0a',
                                borderRadius: '6px',
                                border: '1px solid #262626',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                flexShrink: 0
                            }}>
                                <div>
                                    <div style={{ fontWeight: '600' }}>{rule.persona} (Score &ge; {rule.min_score})</div>
                                    <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>&rarr; {rule.target_campaign_id}</div>
                                </div>
                                <div className="badge badge-neutral">Pri: {rule.priority}</div>
                            </div>
                        ))}
                        {rules.length === 0 && <div style={{ color: '#525252', fontStyle: 'italic' }}>No rules defined.</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}
