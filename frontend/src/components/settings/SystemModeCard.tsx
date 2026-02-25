'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function SystemModeCard() {
    const [systemMode, setSystemMode] = useState('observe');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        apiClient<any>('/api/organization')
            .then(response => {
                const org = response.data || response;
                if (org?.system_mode) setSystemMode(org.system_mode);
            })
            .catch(() => {
                setMsg('Failed to fetch organization details');
            });
    }, []);

    const handleSystemModeChange = async (mode: string) => {
        setLoading(true);
        try {
            await apiClient('/api/organization', {
                method: 'PATCH',
                body: JSON.stringify({ system_mode: mode })
            });
            setSystemMode(mode);
            setMsg(`System mode changed to ${mode.toUpperCase()}`);
        } catch (err: any) {
            setMsg(err.message || 'Error updating system mode.');
        } finally {
            setLoading(false);
        }
    };

    const modeDescriptions: Record<string, { title: string; desc: string; icon: string; color: string; activeBg: string; badgeBg: string; badgeColor: string }> = {
        'observe': {
            title: 'Observe Mode',
            desc: 'Risks are logged and alerts are sent, but traffic is not actively blocked.',
            icon: '👀',
            color: '#D97706',
            activeBg: '#FFFBEB',
            badgeBg: '#FDE68A',
            badgeColor: '#92400E'
        },
        'suggest': {
            title: 'Suggest Mode',
            desc: 'Balanced protection. Infrastructure pauses automatically and shows recommendations before blocking.',
            icon: '⚡',
            color: '#2563EB',
            activeBg: '#EFF6FF',
            badgeBg: '#BFDBFE',
            badgeColor: '#1E40AF'
        },
        'enforce': {
            title: 'Enforce Mode',
            desc: 'Full protection. Traffic to burned domains is paused; toxic leads are auto-killed.',
            icon: '🛡️',
            color: '#7C3AED',
            activeBg: '#F5F3FF',
            badgeBg: '#DDD6FE',
            badgeColor: '#5B21B6'
        }
    };

    return (
        <div style={{
            background: '#FFFFFF', borderRadius: '24px', padding: '2.5rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', marginBottom: '2rem', border: '1px solid #E5E7EB'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>System Mode</h2>
                    <p style={{ color: '#6B7280', fontSize: '0.95rem' }}>Control how Superkabe reacts to detected infrastructure risks.</p>
                </div>
            </div>

            {msg && (
                <div style={{
                    padding: '1rem', marginBottom: '2rem', borderRadius: '12px', fontSize: '0.9rem',
                    background: msg.includes('Error') || msg.includes('Failed') ? '#FEF2F2' : '#F0FDF4',
                    color: msg.includes('Error') || msg.includes('Failed') ? '#991B1B' : '#166534',
                    border: `1px solid ${msg.includes('Error') || msg.includes('Failed') ? '#FECACA' : '#BBF7D0'}`
                }}>
                    {msg}
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {Object.entries(modeDescriptions).map(([key, info]) => {
                    const isActive = systemMode === key;
                    return (
                        <div
                            key={key}
                            onClick={() => !loading && handleSystemModeChange(key)}
                            style={{
                                padding: '1.5rem',
                                borderRadius: '16px',
                                border: `2px solid ${isActive ? info.color : '#E5E7EB'}`,
                                background: isActive ? info.activeBg : '#FFFFFF',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: loading && !isActive ? 0.6 : 1
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                                <span style={{ fontSize: '1.25rem' }}>{info.icon}</span>
                                <h3 style={{
                                    fontSize: '1.1rem', fontWeight: 700, margin: 0,
                                    color: isActive ? info.color : '#374151'
                                }}>
                                    {info.title}
                                </h3>
                                {isActive && (
                                    <span style={{
                                        marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 700, padding: '0.25rem 0.5rem',
                                        borderRadius: '999px', background: info.badgeBg, textTransform: 'uppercase',
                                        color: info.badgeColor
                                    }}>Current</span>
                                )}
                            </div>
                            <p style={{ margin: 0, fontSize: '0.9rem', color: '#6B7280', lineHeight: 1.5 }}>{info.desc}</p>
                        </div>
                    );
                })}
            </div>
            {systemMode === 'observe' && (
                <div style={{ background: '#FEF3C7', padding: '1rem', borderRadius: '12px', borderLeft: '4px solid #F59E0B' }}>
                    <p style={{ margin: 0, color: '#92400E', fontSize: '0.9rem', fontWeight: 500 }}>
                        <strong style={{ fontWeight: 800 }}>Warning:</strong> Your infrastructure is currently unprotected. Switch to <strong style={{ color: '#2563EB' }}>Suggest</strong> or <strong style={{ color: '#7C3AED' }}>Enforce Mode</strong> for production use.
                    </p>
                </div>
            )}
        </div>
    );
}
