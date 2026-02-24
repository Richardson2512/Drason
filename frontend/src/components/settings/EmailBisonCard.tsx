'use client';
import { useState, useEffect } from 'react';
import { apiClient } from '@/lib/api';

export default function EmailBisonCard() {
    const [ebApiKey, setEbApiKey] = useState('');
    const [loading, setLoading] = useState(false);
    const [msg, setMsg] = useState('');

    useEffect(() => {
        apiClient<any>('/api/settings')
            .then(data => {
                if (data) {
                    const settingsData = Array.isArray(data) ? data : [];
                    const ebKeySetting = settingsData.find((s: any) => s.key === 'EMAILBISON_API_KEY');
                    if (ebKeySetting) setEbApiKey(ebKeySetting.value);
                }
            })
            .catch(() => { });
    }, []);

    const handleSaveEmailBison = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiClient('/api/settings', {
                method: 'POST',
                body: JSON.stringify({ EMAILBISON_API_KEY: ebApiKey })
            });
            setMsg('EmailBison API key saved successfully.');
        } catch (err: any) {
            setMsg(err.message || 'Error saving EmailBison settings.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            background: '#FFFFFF', borderRadius: '24px', padding: '2.5rem',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.05)', marginBottom: '2rem', border: '1px solid #E5E7EB'
        }}>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.5rem', color: '#111827' }}>EmailBison Integration</h2>
            <p style={{ color: '#6B7280', fontSize: '0.95rem', marginBottom: '2rem' }}>Connect your EmailBison account to sync mailboxes and enable health tracking.</p>

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

            <form onSubmit={handleSaveEmailBison} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div>
                    <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: 600, color: '#374151', marginBottom: '0.5rem' }}>
                        EmailBison API Key
                    </label>
                    <input
                        type="password"
                        placeholder="Paste your key here..."
                        value={ebApiKey}
                        onChange={e => setEbApiKey(e.target.value)}
                        style={{
                            width: '100%', padding: '0.75rem 1rem', borderRadius: '12px',
                            border: '1px solid #E5E7EB', outline: 'none', transition: 'all 0.2s',
                            boxShadow: '0 1px 2px rgb(0 0 0 / 0.05)', fontSize: '1rem', color: '#111827'
                        }}
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    style={{
                        alignSelf: 'flex-start', padding: '0.75rem 2rem', borderRadius: '999px',
                        background: loading ? '#9CA3AF' : '#111827', color: '#FFFFFF', fontWeight: 600,
                        border: 'none', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '1rem',
                        transition: 'all 0.2s', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                    }}
                >
                    {loading ? 'Saving...' : 'Save EmailBison Key'}
                </button>
            </form>
        </div>
    );
}
