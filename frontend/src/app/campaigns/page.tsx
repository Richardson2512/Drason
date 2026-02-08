'use client';
import { useEffect, useState } from 'react';

export default function CampaignsPage() {
    const [campaigns, setCampaigns] = useState<any[]>([]);
    const [selectedCampaign, setSelectedCampaign] = useState<any>(null);
    const [leads, setLeads] = useState<any[]>([]);

    useEffect(() => {
        // Fetch campaigns and leads
        Promise.all([
            fetch('/api/dashboard/campaigns').then(res => res.json()),
            fetch('/api/dashboard/leads').then(res => res.json())
        ]).then(([campsData, leadsData]) => {
            setCampaigns(campsData);
            setLeads(leadsData);
            if (campsData && campsData.length > 0) {
                setSelectedCampaign(campsData[0]);
            }
        });
    }, []);

    // Derived data for selected campaign
    const campaignLeads = selectedCampaign
        ? leads.filter(l => l.assigned_campaign_id === selectedCampaign.id)
        : [];

    // Specific Stats for THIS campaign only
    const activeLeads = campaignLeads.filter(l => l.status === 'active').length;
    const pausedLeads = campaignLeads.filter(l => l.status === 'paused').length;

    return (
        <div style={{ display: 'flex', height: '100%', gap: '2rem' }}>
            {/* Left: Campaign List */}
            <div className="card" style={{ width: '300px', display: 'flex', flexDirection: 'column', padding: '1rem', height: '100%', overflow: 'hidden' }}>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', flexShrink: 0 }}>Campaigns</h2>
                <div style={{ overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem', paddingRight: '0.5rem' }}>
                    {campaigns.map(c => (
                        <div
                            key={c.id}
                            onClick={() => setSelectedCampaign(c)}
                            style={{
                                padding: '1rem',
                                borderRadius: '8px',
                                background: selectedCampaign?.id === c.id ? '#262626' : 'transparent',
                                cursor: 'pointer',
                                border: '1px solid',
                                borderColor: selectedCampaign?.id === c.id ? '#525252' : 'transparent',
                                transition: 'all 0.2s',
                                flexShrink: 0
                            }}
                        >
                            <div style={{ fontWeight: 500, marginBottom: '0.25rem' }}>{c.name}</div>
                            <div style={{ fontSize: '0.75rem', color: '#a3a3a3' }}>ID: {c.id}</div>
                            <div style={{
                                fontSize: '0.75rem',
                                marginTop: '0.5rem',
                                display: 'inline-block',
                                padding: '0.125rem 0.375rem',
                                borderRadius: '4px',
                                background: c.status === 'active' ? '#052e16' : '#450a0a',
                                color: c.status === 'active' ? '#22c55e' : '#ef4444'
                            }}>
                                {c.status.toUpperCase()}
                            </div>
                        </div>
                    ))}
                    {campaigns.length === 0 && <div style={{ color: '#525252' }}>No campaigns found.</div>}
                </div>
            </div>

            {/* Right: Details View */}
            <div style={{ flex: 1, overflowY: 'auto' }}>
                {selectedCampaign ? (
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>{selectedCampaign.name}</h1>
                        <div style={{ color: '#a3a3a3', marginBottom: '2rem' }}>Campaign Performance Details</div>

                        {/* Top Stats - SPECIFIC TO CAMPAIGN */}
                        <div className="grid grid-cols-3" style={{ marginBottom: '2rem' }}>
                            <div className="card">
                                <div style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>Total Campaign Leads</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{campaignLeads.length}</div>
                            </div>
                            <div className="card">
                                <div style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>Active Execution</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#22c55e' }}>{activeLeads}</div>
                            </div>
                            <div className="card">
                                <div style={{ color: '#a3a3a3', fontSize: '0.875rem' }}>Paused</div>
                                <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{pausedLeads}</div>
                            </div>
                        </div>

                        {/* Mailboxes Section */}
                        <div className="card" style={{ marginBottom: '2rem' }}>
                            <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Connected Mailboxes & Domains</h2>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Mailbox Email</th>
                                        <th>Domain</th>
                                        <th>Status</th>
                                        <th>Win Sent</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {selectedCampaign.mailboxes && selectedCampaign.mailboxes.map((mb: any) => (
                                        <tr key={mb.id}>
                                            <td>{mb.email}</td>
                                            <td>
                                                {mb.domain?.domain}
                                                {mb.domain?.status === 'paused' && <span style={{ color: '#ef4444', marginLeft: '0.5rem' }}>(PAUSED)</span>}
                                            </td>
                                            <td> {mb.status} </td>
                                            <td>{mb.window_sent_count}</td>
                                        </tr>
                                    ))}
                                    {(!selectedCampaign.mailboxes || selectedCampaign.mailboxes.length === 0) && (
                                        <tr><td colSpan={4} style={{ textAlign: 'center', color: '#525252' }}>No mailboxes linked.</td></tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                    </div>
                ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#525252' }}>
                        Select a campaign to view details
                    </div>
                )}
            </div>
        </div>
    );
}
