'use client';
import { useEffect, useState } from 'react';

import MailboxesEmptyState from '@/components/dashboard/MailboxesEmptyState';

export default function MailboxesPage() {
    const [mailboxes, setMailboxes] = useState<any[]>([]);
    const [selectedMailbox, setSelectedMailbox] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        fetch('/api/dashboard/mailboxes').then(res => res.json()).then(data => {
            setMailboxes(data || []);
            if (data && data.length > 0) {
                setSelectedMailbox(data[0]);
            }
        }).finally(() => {
            setLoading(false);
        });
    }, []);

    if (loading) {
        return <div className="flex items-center justify-center h-full text-gray-500">Loading Mailboxes...</div>;
    }

    if (!mailboxes || mailboxes.length === 0) {
        return <MailboxesEmptyState />;
    }

    return (
        <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
            {/* Left: List */}
            <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '1rem', height: '100%', overflow: 'hidden' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', flexShrink: 0 }}>Mailboxes</h2>
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                    {mailboxes.map(mb => (
                        <div
                            key={mb.id}
                            onClick={() => setSelectedMailbox(mb)}
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                background: selectedMailbox?.id === mb.id ? '#262626' : 'transparent',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: selectedMailbox?.id === mb.id ? '#525252' : 'transparent',
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                        >
                            <div style={{ fontWeight: 500, marginBottom: '0.25rem', wordBreak: 'break-all' }}>{mb.email}</div>
                            <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Domain: {mb.domain?.domain}</div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Right: Details */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {selectedMailbox ? (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{selectedMailbox.email}</h1>
                        <div style={{ color: '#a3a3a3', marginBottom: '2rem' }}>Mailbox Health & Usage</div>

                        <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
                            <div className="card">
                                <h3 style={{ fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '0.5rem' }}>Associated Domain</h3>
                                <div style={{ fontSize: '1.25rem' }}>{selectedMailbox.domain?.domain}</div>
                                <div style={{ fontSize: '0.875rem', color: selectedMailbox.domain?.status === 'healthy' ? '#22c55e' : '#ef4444' }}>
                                    Status: {selectedMailbox.domain?.status.toUpperCase()}
                                </div>
                            </div>
                            <div className="card">
                                <h3 style={{ fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '0.5rem' }}>Activity Stats</h3>
                                <div>Sent (Window): {selectedMailbox.window_sent_count}</div>
                                <div>Bounces (Lifetime): {selectedMailbox.hard_bounce_count}</div>
                                <div>Failures (Lifetime): {selectedMailbox.delivery_failure_count}</div>
                            </div>
                        </div>

                        <div className="card">
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Active Campaigns</h2>
                            {selectedMailbox.campaigns && selectedMailbox.campaigns.length > 0 ? (
                                <ul style={{ listStyle: 'none', padding: 0 }}>
                                    {selectedMailbox.campaigns.map((c: any) => (
                                        <li key={c.id} style={{ padding: '0.5rem 0', borderBottom: '1px solid #262626' }}>
                                            {c.name} <span style={{ color: '#525252', fontSize: '0.8rem' }}>({c.id})</span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <div style={{ color: '#525252' }}>No campaigns assigned.</div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#525252' }}>Select a mailbox</div>
                )}
            </div>
        </div>
    );
}
