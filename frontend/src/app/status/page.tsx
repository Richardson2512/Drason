'use client';
import { useEffect, useState } from 'react';

export default function StatusPage() {
    const [health, setHealth] = useState<any>(null);
    const [stateTransitions, setStateTransitions] = useState<any[]>([]);
    const [rawEvents, setRawEvents] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<'health' | 'transitions' | 'events'>('health');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchAll, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            const [healthRes, transitionsRes, eventsRes] = await Promise.all([
                fetch('/health').then(r => r.json()).catch(() => null),
                fetch('/api/dashboard/state-transitions?limit=50').then(r => r.json()).catch(() => []),
                fetch('/api/dashboard/events?limit=50').then(r => r.json()).catch(() => [])
            ]);
            setHealth(healthRes);
            setStateTransitions(transitionsRes || []);
            setRawEvents(eventsRes || []);
        } catch (e) {
            console.error('Status fetch error:', e);
        }
        setLoading(false);
    };

    const StatusIndicator = ({ status }: { status: string }) => {
        const colors: Record<string, string> = {
            healthy: '#22c55e',
            ok: '#22c55e',
            degraded: '#eab308',
            unhealthy: '#ef4444'
        };
        return (
            <span style={{
                display: 'inline-block',
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: colors[status] || '#525252',
                marginRight: '0.5rem'
            }} />
        );
    };

    const TabButton = ({ tab, label }: { tab: typeof activeTab, label: string }) => (
        <button
            onClick={() => setActiveTab(tab)}
            style={{
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                background: activeTab === tab ? '#262626' : 'transparent',
                color: activeTab === tab ? '#fff' : '#a3a3a3',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
            }}
        >
            {label}
        </button>
    );

    return (
        <div style={{ height: 'calc(100vh - 4rem)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexShrink: 0 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '600' }}>System Status</h1>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: '#525252' }}>Auto-refresh: 30s</span>
                    <button
                        onClick={fetchAll}
                        disabled={loading}
                        style={{
                            padding: '0.5rem 1rem',
                            background: '#262626',
                            color: '#fff',
                            borderRadius: '4px',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '0.875rem'
                        }}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </button>
                </div>
            </div>

            {/* Health Overview Cards */}
            <div className="grid grid-cols-4" style={{ marginBottom: '1.5rem', flexShrink: 0 }}>
                <div className="card">
                    <div style={{ color: '#a3a3a3', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Overall Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                        <StatusIndicator status={health?.status || 'unknown'} />
                        {health?.status?.toUpperCase() || 'CHECKING...'}
                    </div>
                </div>
                <div className="card">
                    <div style={{ color: '#a3a3a3', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Database</div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                        <StatusIndicator status={health?.components?.database || 'unknown'} />
                        {health?.components?.database?.toUpperCase() || '-'}
                    </div>
                </div>
                <div className="card">
                    <div style={{ color: '#a3a3a3', fontSize: '0.75rem', marginBottom: '0.25rem' }}>API</div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.25rem', fontWeight: 600 }}>
                        <StatusIndicator status={health?.components?.api || 'unknown'} />
                        {health?.components?.api?.toUpperCase() || '-'}
                    </div>
                </div>
                <div className="card">
                    <div style={{ color: '#a3a3a3', fontSize: '0.75rem', marginBottom: '0.25rem' }}>Version</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                        {health?.version || '-'}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexShrink: 0 }}>
                <TabButton tab="health" label="System Health" />
                <TabButton tab="transitions" label="State Transitions" />
                <TabButton tab="events" label="Raw Events" />
            </div>

            {/* Tab Content */}
            <div className="card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '1rem' }}>
                {activeTab === 'health' && (
                    <div>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Component Health Details</h2>
                        <div className="grid grid-cols-2" style={{ gap: '1rem' }}>
                            <div style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '8px', border: '1px solid #262626' }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>Database</h3>
                                <div style={{ fontSize: '0.875rem', color: '#a3a3a3' }}>
                                    PostgreSQL connection status
                                </div>
                                <div style={{ marginTop: '0.5rem', color: health?.components?.database === 'healthy' ? '#22c55e' : '#ef4444' }}>
                                    {health?.components?.database === 'healthy' ? '✓ Connected' : '✗ Connection failed'}
                                </div>
                            </div>
                            <div style={{ background: '#0a0a0a', padding: '1rem', borderRadius: '8px', border: '1px solid #262626' }}>
                                <h3 style={{ fontWeight: 600, marginBottom: '0.5rem' }}>API Server</h3>
                                <div style={{ fontSize: '0.875rem', color: '#a3a3a3' }}>
                                    Express server status
                                </div>
                                <div style={{ marginTop: '0.5rem', color: health?.components?.api === 'healthy' ? '#22c55e' : '#ef4444' }}>
                                    {health?.components?.api === 'healthy' ? '✓ Running' : '✗ Not responding'}
                                </div>
                            </div>
                        </div>

                        <div style={{ marginTop: '2rem' }}>
                            <h3 style={{ fontWeight: 600, marginBottom: '1rem' }}>System Capabilities (Phases 1-8)</h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
                                {[
                                    { name: 'Multi-Tenancy', phase: 1, status: 'active' },
                                    { name: 'Event Sourcing', phase: 2, status: 'active' },
                                    { name: 'State Machine', phase: 3, status: 'active' },
                                    { name: 'Metrics Engine', phase: 4, status: 'active' },
                                    { name: 'System Modes', phase: 5, status: 'active' },
                                    { name: 'RBAC Security', phase: 6, status: 'active' },
                                    { name: 'Observability', phase: 7, status: 'active' },
                                    { name: 'Compliance', phase: 8, status: 'active' }
                                ].map(cap => (
                                    <div key={cap.phase} style={{
                                        background: '#052e16',
                                        border: '1px solid #22c55e',
                                        padding: '0.75rem',
                                        borderRadius: '6px',
                                        fontSize: '0.75rem'
                                    }}>
                                        <div style={{ color: '#22c55e', fontWeight: 600 }}>Phase {cap.phase}</div>
                                        <div style={{ color: '#d4d4d4' }}>{cap.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'transitions' && (
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', flexShrink: 0 }}>
                            State Transitions (Phase 3)
                        </h2>
                        <p style={{ color: '#a3a3a3', fontSize: '0.875rem', marginBottom: '1rem', flexShrink: 0 }}>
                            History of all state changes for mailboxes, domains, and leads.
                        </p>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ position: 'sticky', top: 0, background: '#171717', zIndex: 10 }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>Time</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>Entity</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>From → To</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>Trigger</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {stateTransitions.map((t: any) => (
                                        <tr key={t.id} style={{ borderBottom: '1px solid #262626' }}>
                                            <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#525252' }}>
                                                {new Date(t.created_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{
                                                    background: '#262626',
                                                    padding: '0.125rem 0.5rem',
                                                    borderRadius: '4px',
                                                    fontSize: '0.75rem',
                                                    textTransform: 'uppercase'
                                                }}>
                                                    {t.entity_type}
                                                </span>
                                            </td>
                                            <td style={{ padding: '0.75rem', fontWeight: 500 }}>
                                                <span style={{ color: '#ef4444' }}>{t.from_state}</span>
                                                <span style={{ color: '#525252', margin: '0 0.5rem' }}>→</span>
                                                <span style={{ color: '#22c55e' }}>{t.to_state}</span>
                                            </td>
                                            <td style={{ padding: '0.75rem', color: '#a3a3a3', fontSize: '0.875rem' }}>{t.triggered_by}</td>
                                            <td style={{ padding: '0.75rem', color: '#a3a3a3', fontSize: '0.875rem' }}>{t.reason}</td>
                                        </tr>
                                    ))}
                                    {stateTransitions.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#525252' }}>
                                                No state transitions recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'events' && (
                    <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem', flexShrink: 0 }}>
                            Raw Events (Phase 2)
                        </h2>
                        <p style={{ color: '#a3a3a3', fontSize: '0.875rem', marginBottom: '1rem', flexShrink: 0 }}>
                            Event-sourced log of all system events. Immutable for replay and debugging.
                        </p>
                        <div style={{ overflowY: 'auto', flex: 1 }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ position: 'sticky', top: 0, background: '#171717', zIndex: 10 }}>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>Time</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>Event Type</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>Entity</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>Source</th>
                                        <th style={{ padding: '0.75rem', textAlign: 'left', borderBottom: '1px solid #262626', fontSize: '0.75rem', color: '#a3a3a3' }}>Processed</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rawEvents.map((e: any) => (
                                        <tr key={e.id} style={{ borderBottom: '1px solid #262626' }}>
                                            <td style={{ padding: '0.75rem', fontSize: '0.8rem', color: '#525252' }}>
                                                {new Date(e.created_at).toLocaleString()}
                                            </td>
                                            <td style={{ padding: '0.75rem', fontWeight: 500 }}>{e.event_type}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                <span style={{ color: '#a3a3a3', fontSize: '0.75rem' }}>{e.entity_type}:</span>
                                                <span style={{ marginLeft: '0.25rem', fontSize: '0.8rem' }}>{e.entity_id?.substring(0, 8)}...</span>
                                            </td>
                                            <td style={{ padding: '0.75rem', color: '#a3a3a3', fontSize: '0.875rem' }}>{e.source}</td>
                                            <td style={{ padding: '0.75rem' }}>
                                                {e.processed_at ? (
                                                    <span style={{ color: '#22c55e' }}>✓</span>
                                                ) : (
                                                    <span style={{ color: '#eab308' }}>Pending</span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {rawEvents.length === 0 && (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#525252' }}>
                                                No raw events recorded yet.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
