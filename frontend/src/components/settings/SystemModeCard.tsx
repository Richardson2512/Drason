'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';
import type { Organization } from '@/types/api';

export default function SystemModeCard() {
    const [systemMode, setSystemMode] = useState('observe');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        apiClient<Organization>('/api/organization')
            .then(response => {
                const org = response;
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
        <div className="bg-white rounded-3xl p-10 shadow-sm mb-8 border border-gray-200">
            <div className="flex justify-between items-start mb-8">
                <div>
                    <h2 className="text-2xl font-bold mb-2 text-gray-900">System Mode</h2>
                    <p className="text-gray-500 text-[0.95rem]">Control how Superkabe reacts to detected infrastructure risks.</p>
                </div>
            </div>

            {msg && (
                <div className="p-4 mb-8 rounded-xl text-[0.9rem]" style={{
                    background: msg.includes('Error') || msg.includes('Failed') ? '#FEF2F2' : '#F0FDF4',
                    color: msg.includes('Error') || msg.includes('Failed') ? '#991B1B' : '#166534',
                    border: `1px solid ${msg.includes('Error') || msg.includes('Failed') ? '#FECACA' : '#BBF7D0'}`
                }}>
                    {msg}
                </div>
            )}

            <div className="grid gap-4 mb-8" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
                {Object.entries(modeDescriptions).map(([key, info]) => {
                    const isActive = systemMode === key;
                    return (
                        <div
                            key={key}
                            onClick={() => !loading && handleSystemModeChange(key)}
                            className="p-6 rounded-2xl transition-all duration-200"
                            style={{
                                border: `2px solid ${isActive ? info.color : '#E5E7EB'}`,
                                background: isActive ? info.activeBg : '#FFFFFF',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                opacity: loading && !isActive ? 0.6 : 1
                            }}
                        >
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-xl">{info.icon}</span>
                                <h3 className="text-[1.1rem] font-bold m-0" style={{
                                    color: isActive ? info.color : '#374151'
                                }}>
                                    {info.title}
                                </h3>
                                {isActive && (
                                    <span className="ml-auto text-xs font-bold py-1 px-2 rounded-full uppercase" style={{
                                        background: info.badgeBg,
                                        color: info.badgeColor
                                    }}>Current</span>
                                )}
                            </div>
                            <p className="m-0 text-[0.9rem] text-gray-500 leading-relaxed">{info.desc}</p>
                        </div>
                    );
                })}
            </div>
            {systemMode === 'observe' && (
                <div className="bg-amber-50 p-4 rounded-xl border-l-4 border-amber-500">
                    <p className="m-0 text-amber-800 text-[0.9rem] font-medium">
                        <strong className="font-extrabold">Warning:</strong> Your infrastructure is currently unprotected. Switch to <strong className="text-blue-600">Suggest</strong> or <strong className="text-purple-600">Enforce Mode</strong> for production use.
                    </p>
                </div>
            )}
        </div>
    );
}
