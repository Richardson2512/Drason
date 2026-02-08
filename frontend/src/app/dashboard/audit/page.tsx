'use client';
import { useEffect, useState } from 'react';

export default function Audit() {
    const [logs, setLogs] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetch('/api/dashboard/audit-logs').then(res => res.json()).then(setLogs);
    }, []);

    const filteredLogs = activeTab === 'all' ? logs : logs.filter(log => log.entity === activeTab);

    return (
        <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem', flexShrink: 0 }}>Audit Log (Immutable)</h1>

            <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.125rem' }}>System Log</h2>
                    <div style={{ display: 'flex', background: '#262626', padding: '0.25rem', borderRadius: '6px' }}>
                        {['all', 'lead', 'mailbox', 'domain'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '4px',
                                    background: activeTab === tab ? '#0a0a0a' : 'transparent',
                                    color: activeTab === tab ? '#fff' : '#a3a3a3',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    textTransform: 'capitalize'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ position: 'sticky', top: 0, background: '#171717', zIndex: 10 }}>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626' }}>Timestamp</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626' }}>Entity</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626' }}>Trigger</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626' }}>Action</th>
                                <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id} style={{ borderBottom: '1px solid #262626' }}>
                                    <td style={{ padding: '0.75rem', color: '#a3a3a3', fontSize: '0.875rem' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                                            {log.entity}
                                        </span>
                                        <span style={{ marginLeft: '0.5rem', fontSize: '0.875rem' }}>{log.entity_id}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem' }}>{log.trigger}</td>
                                    <td style={{ padding: '0.75rem' }}>
                                        <span style={{ fontWeight: 500 }}>{log.action}</span>
                                    </td>
                                    <td style={{ padding: '0.75rem', color: '#a3a3a3' }}>{log.details}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#525252' }}>
                                        No {activeTab} logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
