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
            <div className="page-header">
                <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>System Audit Log</h1>
                <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>Immutable record of all system events and triggers</div>
            </div>

            <div className="premium-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0', borderRadius: '24px' }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid #F1F5F9', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#FFFFFF' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1E293B' }}>Event History</h2>
                    <div style={{ display: 'flex', background: '#F3F4F6', padding: '0.25rem', borderRadius: '12px' }}>
                        {['all', 'lead', 'mailbox', 'domain'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{
                                    padding: '0.375rem 1rem',
                                    borderRadius: '8px',
                                    background: activeTab === tab ? '#FFFFFF' : 'transparent',
                                    color: activeTab === tab ? '#111827' : '#6B7280',
                                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.875rem',
                                    fontWeight: 600,
                                    textTransform: 'capitalize',
                                    transition: 'all 0.2s'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowY: 'auto', flex: 1 }}>
                    <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr style={{ background: '#F8FAFC' }}>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Timestamp</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Entity</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Trigger</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                                <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', color: '#64748B', fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id} style={{ transition: 'background 0.1s' }} className="hover:bg-gray-50">
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#475569', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <span style={{
                                                textTransform: 'uppercase',
                                                fontSize: '0.7rem',
                                                fontWeight: 700,
                                                padding: '0.125rem 0.5rem',
                                                borderRadius: '4px',
                                                background: '#F1F5F9',
                                                color: '#475569',
                                                border: '1px solid #E2E8F0'
                                            }}>
                                                {log.entity}
                                            </span>
                                            <span style={{ fontSize: '0.875rem', fontFamily: 'monospace', color: '#334155' }}>{log.entity_id}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#1E293B', fontWeight: 500 }}>{log.trigger}</td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                        <span style={{ fontWeight: 600, color: '#2563EB' }}>{log.action}</span>
                                    </td>
                                    <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '0.875rem' }}>{log.details}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', fontStyle: 'italic' }}>
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
