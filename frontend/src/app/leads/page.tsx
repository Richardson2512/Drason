'use client';
import { useEffect, useState } from 'react';

export default function LeadsPage() {
    const [leads, setLeads] = useState<any[]>([]);
    const [selectedLead, setSelectedLead] = useState<any>(null);
    const [auditLogs, setAuditLogs] = useState<any[]>([]);
    const [leadTab, setLeadTab] = useState('all');

    useEffect(() => {
        fetch('/api/dashboard/leads').then(res => res.json()).then(data => {
            setLeads(data);
            if (data && data.length > 0) {
                setSelectedLead(data[0]);
            }
        });
    }, []);

    // Fetch logs when a lead is selected
    useEffect(() => {
        if (selectedLead) {
            fetch(`/api/dashboard/audit-logs?entity=lead&entity_id=${selectedLead.id}`)
                .then(res => res.json())
                .then(setAuditLogs);
        } else {
            setAuditLogs([]);
        }
    }, [selectedLead]);

    const filteredLeads = leadTab === 'all' ? leads : leads.filter(l => l.status === leadTab);

    // Deterministic Status Explanation Logic (Based on PRD System States)
    const getSystemNotice = (lead: any) => {
        if (lead.status === 'paused') {
            return { type: 'danger', title: 'System Pause', msg: 'Lead processing has been halted. This typically occurs when the associated mailbox or domain triggers a "Warning" or "Paused" health state due to bounce rates exceeding 2%.' };
        }
        if (lead.status === 'held') {
            return { type: 'warning', title: 'Holding Pool', msg: 'Lead is currently in the Holding Pool. It is waiting for the "Execution Gate" to verify mailbox capacity and domain health before transitioning to Active.' };
        }
        if (lead.status === 'active') {
            return { type: 'success', title: 'Active Execution', msg: 'Lead has passed all health checks and routed to a campaign. It is currently available for outreach by the external sender (Smartlead).' };
        }
        return null;
    };

    const StatusBadge = ({ status }: { status: string }) => {
        let color = 'gray';
        if (status === 'active') color = 'success';
        if (status === 'paused') color = 'danger';
        if (status === 'held') color = 'warning';
        return <span className={`badge badge-${color}`}>{status.toUpperCase()}</span>;
    };

    const TabButton = ({ label, value, current, set }: any) => (
        <button
            onClick={() => set(value)}
            style={{
                padding: '0.25rem 0.75rem',
                borderRadius: '4px',
                background: current === value ? '#0a0a0a' : 'transparent',
                color: current === value ? '#fff' : '#a3a3a3',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'capitalize'
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
            {/* Left: Lead List */}
            <div className="card" style={{ width: '350px', display: 'flex', flexDirection: 'column', padding: '1rem', height: '100%', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexShrink: 0 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Leads</h2>
                    <div style={{ display: 'flex', background: '#262626', padding: '0.25rem', borderRadius: '6px' }}>
                        {['all', 'held', 'active', 'paused'].map(t => (
                            <button
                                key={t}
                                onClick={() => setLeadTab(t)}
                                style={{
                                    padding: '0.125rem 0.5rem',
                                    borderRadius: '4px',
                                    background: leadTab === t ? '#0a0a0a' : 'transparent',
                                    color: leadTab === t ? '#fff' : '#a3a3a3',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                    textTransform: 'capitalize'
                                }}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                    {filteredLeads.map(l => (
                        <div
                            key={l.id}
                            onClick={() => setSelectedLead(l)}
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                background: selectedLead?.id === l.id ? '#262626' : 'transparent',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: selectedLead?.id === l.id ? '#525252' : 'transparent',
                                borderLeft: l.status === 'paused' ? '4px solid #ef4444' : (selectedLead?.id === l.id ? '1px solid #525252' : '1px solid transparent'),
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                        >
                            <div style={{ fontWeight: 500, marginBottom: '0.25rem', fontSize: '0.875rem' }}>{l.email}</div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>Score: {l.lead_score}</div>
                                <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>{l.status.toUpperCase()}</div>
                            </div>
                        </div>
                    ))}
                    {filteredLeads.length === 0 && <div style={{ color: '#525252', textAlign: 'center', padding: '1rem' }}>No leads found.</div>}
                </div>
            </div>

            {/* Right: Details */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {selectedLead ? (
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '0.5rem' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>{selectedLead.email}</h1>
                            <StatusBadge status={selectedLead.status} />
                        </div>
                        <div style={{ color: '#a3a3a3', marginBottom: '2rem' }}>ID: {selectedLead.id}</div>

                        {/* SYSTEM STATUS EXPLANATION (Deterministic) */}
                        {(() => {
                            const notice = getSystemNotice(selectedLead);
                            if (notice) return (
                                <div className="card" style={{
                                    borderLeft: `4px solid ${notice.type === 'danger' ? '#ef4444' : (notice.type === 'warning' ? '#eab308' : '#3b82f6')}`,
                                    marginBottom: '2rem'
                                }}>
                                    <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: notice.type === 'danger' ? '#ef4444' : (notice.type === 'warning' ? '#eab308' : '#3b82f6') }}>
                                        {notice.title}
                                    </h3>
                                    <p style={{ fontSize: '0.925rem', lineHeight: '1.5', color: '#d4d4d4' }}>{notice.msg}</p>
                                </div>
                            );
                        })()}

                        <div className="grid grid-cols-2" style={{ marginBottom: '2rem' }}>
                            <div className="card">
                                <h3 style={{ fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '0.5rem' }}>Lead Profile</h3>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Persona:</strong> <span style={{ color: '#d4d4d4' }}>{selectedLead.persona}</span>
                                    <div style={{ fontSize: '0.75rem', color: '#525252' }}>The role category used for routing rules.</div>
                                </div>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Score:</strong> <span style={{ color: '#d4d4d4' }}>{selectedLead.lead_score}</span>
                                    <div style={{ fontSize: '0.75rem', color: '#525252' }}>Qualification score (0-100). Minimum 50 required for most campaigns.</div>
                                </div>
                                <div>
                                    <strong>Source:</strong> <span style={{ color: '#d4d4d4' }}>{selectedLead.source}</span>
                                </div>
                            </div>
                            <div className="card">
                                <h3 style={{ fontSize: '0.875rem', color: '#a3a3a3', marginBottom: '0.5rem' }}>Execution Context</h3>
                                <div style={{ marginBottom: '0.5rem' }}>
                                    <strong>Campaign:</strong> <span style={{ color: '#d4d4d4' }}>{selectedLead.assigned_campaign_id || 'Unassigned'}</span>
                                    <div style={{ fontSize: '0.75rem', color: '#525252' }}>The outreach campaign targeted for this lead.</div>
                                </div>
                                <div>
                                    <strong>Health State:</strong> <span style={{ color: selectedLead.health_state === 'healthy' ? '#22c55e' : '#ef4444' }}>{selectedLead.health_state.toUpperCase()}</span>
                                    <div style={{ fontSize: '0.75rem', color: '#525252' }}>Internal signal health. 'Warning' implies this specific lead is causing errors.</div>
                                </div>
                            </div>
                        </div>

                        <div className="card">
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Activity Log</h2>
                            {auditLogs.length > 0 ? (
                                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                    <thead>
                                        <tr style={{ borderBottom: '1px solid #262626', textAlign: 'left' }}>
                                            <th style={{ padding: '0.5rem', color: '#a3a3a3', fontSize: '0.75rem' }}>Time</th>
                                            <th style={{ padding: '0.5rem', color: '#a3a3a3', fontSize: '0.75rem' }}>System Trigger</th>
                                            <th style={{ padding: '0.5rem', color: '#a3a3a3', fontSize: '0.75rem' }}>Action Taken</th>
                                            <th style={{ padding: '0.5rem', color: '#a3a3a3', fontSize: '0.75rem' }}>Details</th>
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
                                                <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.875rem', color: '#a3a3a3' }}>{log.details}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#525252', background: '#0a0a0a', borderRadius: '8px' }}>
                                    No activity recorded for this lead yet.
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#525252' }}>Select a lead to view timeline</div>
                )}
            </div>
        </div>
    );
}
