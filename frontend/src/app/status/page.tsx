'use client';
import { useEffect, useState } from 'react';

export default function Status() {
    const [domains, setDomains] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/dashboard/domains').then(res => res.json()).then(setDomains);
    }, []);

    return (
        <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>System Status</h1>

            <div className="grid">
                {domains.map((domain) => (
                    <div key={domain.id} className="card">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.125rem' }}>{domain.domain}</h2>
                                <div style={{ fontSize: '0.875rem', color: '#a3a3a3' }}>ID: {domain.id}</div>
                            </div>
                            <div className={`badge badge-${domain.status === 'healthy' ? 'success' : 'danger'}`}>
                                {domain.status.toUpperCase()}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '0.5rem', fontWeight: '500' }}>
                            Mailboxes ({domain.mailboxes.length})
                        </h3>

                        <div style={{ display: 'grid', gap: '0.5rem', maxHeight: '300px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                            {domain.mailboxes.map((mb: any) => (
                                <div key={mb.id} style={{
                                    padding: '0.75rem',
                                    background: '#0a0a0a',
                                    borderRadius: '6px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    fontSize: '0.875rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: mb.status === 'active' ? '#22c55e' : '#ef4444' }}></div>
                                        {mb.email}
                                    </div>
                                    <div style={{ display: 'flex', gap: '1rem', color: '#737373', fontSize: '0.75rem' }}>
                                        <span>Bounces: {mb.hard_bounce_count}</span>
                                        <span>Failures: {mb.delivery_failure_count}</span>
                                    </div>
                                </div>
                            ))}
                            {domain.mailboxes.length === 0 && <div style={{ fontStyle: 'italic', color: '#525252' }}>No mailboxes connected.</div>}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
