'use client';
import { useEffect, useState } from 'react';

export default function DomainsPage() {
    const [domains, setDomains] = useState<any[]>([]);
    const [selectedDomain, setSelectedDomain] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);

    useEffect(() => {
        fetch('/api/dashboard/domains').then(res => res.json()).then(data => {
            setDomains(data);
            if (data && data.length > 0) {
                setSelectedDomain(data[0]);
            }
        });
    }, []);

    useEffect(() => {
        if (selectedDomain) {
            fetch(`/api/dashboard/audit-logs?entity=domain&entity_id=${selectedDomain.id}`)
                .then(res => res.json())
                .then(setAuditLogs);
        } else {
            setAuditLogs([]);
        }
    }, [selectedDomain]);

    return (
        <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
            {/* Left: List */}
            <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '1rem', height: '100%', overflow: 'hidden' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', flexShrink: 0 }}>Domains</h2>
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                    {domains.map(d => (
                        <div
                            key={d.id}
                            onClick={() => setSelectedDomain(d)}
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                background: selectedDomain?.id === d.id ? '#262626' : 'transparent',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: selectedDomain?.id === d.id ? '#525252' : 'transparent',
                                borderLeft: d.status === 'paused' ? '4px solid #ef4444' : (selectedDomain?.id === d.id ? '1px solid #525252' : '1px solid transparent'),
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                        >
                            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{d.domain}</div>
                            <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>{d.status.toUpperCase()}</div>
                        </div>
                    ))}
                    {domains.length === 0 && <div style={{ color: '#525252' }}>No domains.</div>}
                </div>
            </div>

            {/* Right: Details */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {selectedDomain ? (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{selectedDomain.domain}</h1>
                        <div style={{ color: '#a3a3a3', marginBottom: '2rem' }}>Reputation & Usage</div>

                        {selectedDomain.status === 'paused' && (
                            <div className="card" style={{ background: '#450a0a', border: '1px solid #ef4444', marginBottom: '2rem' }}>
                                <h3 style={{ color: '#ef4444', fontWeight: 'bold' }}>DOMAIN PAUSED</h3>
                                <p>{selectedDomain.paused_reason}</p>
                            </div>
                        )}

                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Bounce Analytics</h2>
                            <div className="grid grid-cols-2">
                                <div>
                                    <div style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>Trend</div>
                                    <div style={{ fontSize: '1.5rem' }}>{selectedDomain.aggregated_bounce_rate_trend.toFixed(2)}%</div>
                                </div>
                                <div>
                                    <div style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>Warnings Triggered</div>
                                    <div style={{ fontSize: '1.5rem' }}>{selectedDomain.warning_count}</div>
                                </div>
                            </div>
                        </div>

                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Domain Events Log</h2>
                            {auditLogs.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #262626', textAlign: 'left' }}>
                                            <th style={{ padding: '0.5rem', color: '#a3a3a3', fontSize: '0.75rem' }}>Time</th>
                                            <th style={{ padding: '0.5rem', color: '#a3a3a3', fontSize: '0.75rem' }}>Trigger</th>
                                            <th style={{ padding: '0.5rem', color: '#a3a3a3', fontSize: '0.75rem' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {auditLogs.map(log => (
                                            <tr key={log.id} style={{ borderBottom: '1px solid #171717' }}>
                                                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.8rem', color: '#525252' }}>
                                                    {new Date(log.timestamp).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem' }}>{log.trigger}</td>
                                                <td style={{ padding: '0.75rem 0.5rem', fontWeight: 500 }}>{log.action}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '1rem', textAlign: 'center', color: '#525252' }}>
                                    No events.
                                </div>
                            )}
                        </div>

                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Child Mailboxes</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Email</th>
                                        <th>Status</th>
                                        <th>Campaigns</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedDomain.mailboxes && selectedDomain.mailboxes.map((mb: any) => (
                                        <tr key={mb.id}>
                                            <td>{mb.email}</td>
                                            <td> {mb.status} </td>
                                            <td style={{ color: '#a3a3a3' }}>
                                                {mb.campaigns?.map((c: any) => c.name).join(', ') || '-'}
                                            </td>
                                        </tr>
                                    ))}
                                    {(!selectedDomain.mailboxes || selectedDomain.mailboxes.length === 0) && (
                                        <tr><td colSpan={3} style={{ textAlign: 'center', color: '#525252' }}>No mailboxes.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#525252' }}>Select a domain</div>
                )}
            </div>
        </div>
    );
}
