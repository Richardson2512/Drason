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
                fetch('/api/health').then(r => r.json()).catch(() => null),
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
            healthy: '#16a34a',
            ok: '#16a34a',
            degraded: '#ca8a04',
            unhealthy: '#dc2626'
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
                background: activeTab === tab ? '#fff' : 'transparent',
                color: activeTab === tab ? 'var(--text)' : 'var(--muted)',
                boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
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
            <div className="page-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '0.5rem', color: '#111827', letterSpacing: '-0.025em' }}>System Status</h1>
                        <div style={{ color: '#6B7280', fontSize: '1.1rem' }}>Real-time usage & health monitoring</div>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.875rem', color: '#64748B', fontWeight: 500 }}>Auto-refresh: 30s</span>
                        <button
                            onClick={fetchAll}
                            disabled={loading}
                            className="premium-btn"
                            style={{
                                padding: '0.6rem 1.25rem',
                                fontSize: '0.875rem'
                            }}
                        >
                            {loading ? (
                                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <svg className="animate-spin" style={{ width: '1rem', height: '1rem' }} viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Refreshing
                                </span>
                            ) : 'Refresh Now'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Health Overview Cards */}
            <div className="grid grid-cols-4 gap-6" style={{ marginBottom: '2rem', flexShrink: 0 }}>
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Overall Status</div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', gap: '0.75rem' }}>
                        <StatusIndicator status={health?.status || 'unknown'} />
                        {health?.status?.toUpperCase() || 'CHECKING...'}
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Database</div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', gap: '0.75rem' }}>
                        <StatusIndicator status={health?.components?.database || 'unknown'} />
                        {health?.components?.database?.toUpperCase() || '-'}
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>API</div>
                    <div style={{ display: 'flex', alignItems: 'center', fontSize: '1.5rem', fontWeight: 800, color: '#1E293B', gap: '0.75rem' }}>
                        <StatusIndicator status={health?.components?.api || 'unknown'} />
                        {health?.components?.api?.toUpperCase() || '-'}
                    </div>
                </div>
                <div className="premium-card" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ color: '#64748B', fontSize: '0.875rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Version</div>
                    <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#1E293B' }}>
                        {health?.version || '-'}
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="premium-card" style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', padding: '0', borderRadius: '24px' }}>
                <div style={{ padding: '1.5rem 1.5rem 0 1.5rem', borderBottom: '1px solid #F1F5F9', background: '#FFFFFF' }}>
                    <div style={{ display: 'flex', gap: '2rem' }}>
                        {[{ id: 'health', label: 'System Health' }, { id: 'transitions', label: 'State Transitions' }, { id: 'events', label: 'Raw Events' }].map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                style={{
                                    paddingBottom: '1rem',
                                    background: 'transparent',
                                    color: activeTab === t.id ? '#2563EB' : '#64748B',
                                    border: 'none',
                                    borderBottom: activeTab === t.id ? '2px solid #2563EB' : '2px solid transparent',
                                    cursor: 'pointer',
                                    fontSize: '1rem',
                                    fontWeight: activeTab === t.id ? 700 : 500,
                                    transition: 'all 0.2s',
                                    marginBottom: '-1px'
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ flex: 1, overflow: 'hidden', padding: '1.5rem', background: '#FAFAFA' }}>
                    {activeTab === 'health' && (
                        <div style={{ overflowY: 'auto', height: '100%', paddingRight: '0.5rem' }}>
                            <div className="grid grid-cols-2 gap-6" style={{ marginBottom: '2rem' }}>
                                <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.125rem', color: '#1E293B' }}>Database</h3>
                                    <div style={{ fontSize: '0.875rem', color: '#64748B' }}>PostgreSQL connection status</div>
                                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: health?.components?.database === 'healthy' ? '#15803d' : '#b91c1c' }}>
                                        {health?.components?.database === 'healthy' ? (
                                            <><span style={{ fontSize: '1.25rem' }}>✓</span> Connected & Operational</>
                                        ) : (
                                            <><span style={{ fontSize: '1.25rem' }}>✗</span> Connection Failed</>
                                        )}
                                    </div>
                                </div>
                                <div style={{ background: '#FFFFFF', padding: '1.5rem', borderRadius: '16px', border: '1px solid #E2E8F0', boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}>
                                    <h3 style={{ fontWeight: 700, marginBottom: '0.5rem', fontSize: '1.125rem', color: '#1E293B' }}>API Server</h3>
                                    <div style={{ fontSize: '0.875rem', color: '#64748B' }}>Express server status</div>
                                    <div style={{ marginTop: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 600, color: health?.components?.api === 'healthy' ? '#15803d' : '#b91c1c' }}>
                                        {health?.components?.api === 'healthy' ? (
                                            <><span style={{ fontSize: '1.25rem' }}>✓</span> Running Smoothly</>
                                        ) : (
                                            <><span style={{ fontSize: '1.25rem' }}>✗</span> Not Responding</>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontWeight: 700, marginBottom: '1rem', fontSize: '1.125rem', color: '#1E293B' }}>System Capabilities (Phases 1-8)</h3>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
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
                                            background: '#ECFDF5',
                                            border: '1px solid #A7F3D0',
                                            padding: '1rem',
                                            borderRadius: '12px',
                                            fontSize: '0.875rem'
                                        }}>
                                            <div style={{ color: '#047857', fontWeight: 700, marginBottom: '0.25rem' }}>PHASE {cap.phase}</div>
                                            <div style={{ color: '#064E3B', fontWeight: 600 }}>{cap.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'transitions' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B' }}>State Transitions (Phase 3)</h2>
                                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>History of all state changes for mailboxes, domains, and leads.</p>
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1, borderRadius: '12px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC', zIndex: 10 }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Time</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Entity</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Transition</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Trigger</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stateTransitions.length > 0 ? stateTransitions.map((t: any) => (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem', color: '#475569' }}>
                                                    {new Date(t.created_at).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                                    <span style={{
                                                        background: '#F1F5F9',
                                                        padding: '0.25rem 0.5rem',
                                                        borderRadius: '6px',
                                                        fontSize: '0.75rem',
                                                        fontWeight: 600,
                                                        color: '#475569',
                                                        textTransform: 'uppercase'
                                                    }}>
                                                        {t.entity_type}
                                                    </span>
                                                </td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', fontWeight: 600 }}>
                                                    <span style={{ color: '#EF4444' }}>{t.from_state}</span>
                                                    <span style={{ color: '#94A3B8', margin: '0 0.5rem' }}>→</span>
                                                    <span style={{ color: '#10B981' }}>{t.to_state}</span>
                                                </td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '0.875rem' }}>{t.triggered_by}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '0.875rem' }}>{t.reason}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', fontStyle: 'italic' }}>No transitions recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            <div style={{ marginBottom: '1rem' }}>
                                <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1E293B' }}>Raw Events (Phase 2)</h2>
                                <p style={{ color: '#64748B', fontSize: '0.875rem' }}>Immutable event-sourced log of all system activities.</p>
                            </div>
                            <div style={{ overflowY: 'auto', flex: 1, borderRadius: '12px', border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
                                <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0' }}>
                                    <thead style={{ position: 'sticky', top: 0, background: '#F8FAFC', zIndex: 10 }}>
                                        <tr>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Time</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Event</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Entity</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>Source</th>
                                            <th style={{ padding: '1rem', textAlign: 'left', borderBottom: '1px solid #E2E8F0', fontSize: '0.75rem', fontWeight: 700, color: '#64748B', textTransform: 'uppercase' }}>State</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rawEvents.length > 0 ? rawEvents.map((e: any) => (
                                            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', fontSize: '0.875rem', color: '#475569' }}>
                                                    {new Date(e.created_at).toLocaleString()}
                                                </td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', fontWeight: 600, color: '#1E293B' }}>{e.event_type}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                                    <span style={{ color: '#64748B', fontSize: '0.75rem', fontWeight: 500, marginRight: '0.25rem' }}>{e.entity_type}:</span>
                                                    <span style={{ fontSize: '0.8rem', fontFamily: 'monospace', background: '#F1F5F9', padding: '0.1rem 0.3rem', borderRadius: '4px' }}>{e.entity_id?.substring(0, 8)}...</span>
                                                </td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9', color: '#64748B', fontSize: '0.875rem' }}>{e.source}</td>
                                                <td style={{ padding: '1rem', borderBottom: '1px solid #F1F5F9' }}>
                                                    {e.processed_at ? (
                                                        <span style={{ color: '#166534', background: '#DCFCE7', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>PROCESSED</span>
                                                    ) : (
                                                        <span style={{ color: '#854D0E', background: '#FEF9C3', padding: '0.1rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600 }}>PENDING</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#9CA3AF', fontStyle: 'italic' }}>No events recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
