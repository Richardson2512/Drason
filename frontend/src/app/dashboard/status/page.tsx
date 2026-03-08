'use client';
import { useEffect, useState } from 'react';

import { apiClient } from '@/lib/api';
import type { HealthCheckResponse, StateTransition, RawEvent, CampaignDiagnostic } from '@/types/api';

export default function StatusPage() {
    const [health, setHealth] = useState<HealthCheckResponse | null>(null);
    const [stateTransitions, setStateTransitions] = useState<StateTransition[]>([]);
    const [rawEvents, setRawEvents] = useState<RawEvent[]>([]);
    const [diagnostics, setDiagnostics] = useState<CampaignDiagnostic[]>([]);
    const [activeTab, setActiveTab] = useState<'health' | 'transitions' | 'events' | 'diagnostics'>('health');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAll();
        // Auto-refresh every 60 seconds
        const interval = setInterval(fetchAll, 60000);
        return () => clearInterval(interval);
    }, []);

    const fetchAll = async () => {
        setLoading(true);
        try {
            // Note: /api/health returns a direct object, not wrapped in { data: ... }
            // So we use apiClient but expect the direct response, OR we use fetch.
            // Let's use apiClient for consistency, but we need to know the type.
            // Actually, apiClient returns `data.data` if `data.success` is true.
            // /health returns { status: 'ok', ... } directly.
            // So apiClient will return the full object as `data.success` is undefined.

            const [healthRes, transitionsRes, eventsRes, diagRes] = await Promise.all([
                apiClient<HealthCheckResponse>('/api/health').catch(() => null),
                apiClient<StateTransition[] | { data: StateTransition[] }>('/api/dashboard/state-transitions?limit=50').catch(() => []),
                apiClient<RawEvent[] | { data: RawEvent[] }>('/api/dashboard/events?limit=50').catch(() => []),
                apiClient<CampaignDiagnostic[] | { data: CampaignDiagnostic[] }>('/api/diagnostics/campaign-mailboxes').catch(() => [])
            ]);

            setHealth(healthRes);
            setStateTransitions(Array.isArray(transitionsRes) ? transitionsRes : []);
            setRawEvents(Array.isArray(eventsRes) ? eventsRes : []);
            setDiagnostics(Array.isArray(diagRes) ? diagRes : diagRes?.data || []);
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
            <span
                className="inline-block w-2.5 h-2.5 rounded-full mr-2"
                style={{ background: colors[status] || '#525252' }}
            />
        );
    };

    return (
        <div className="h-[calc(100vh-4rem)] flex flex-col">
            <div className="page-header">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">System Status</h1>
                        <div className="text-gray-500 text-[1.1rem]">Real-time usage & health monitoring</div>
                    </div>
                    <div className="flex gap-4 items-center">
                        <span className="text-sm text-slate-500 font-medium">Auto-refresh: 60s</span>
                        <button
                            onClick={fetchAll}
                            disabled={loading}
                            className="premium-btn py-2.5 px-5 text-sm"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24">
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
            <div className="grid grid-cols-4 gap-6 mb-8 shrink-0">
                <div className="premium-card flex flex-col gap-2">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">Overall Status</div>
                    <div className="flex items-center text-2xl font-extrabold text-slate-800 gap-3">
                        <StatusIndicator status={health?.status || 'unknown'} />
                        {health?.status?.toUpperCase() || 'CHECKING...'}
                    </div>
                </div>
                <div className="premium-card flex flex-col gap-2">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">Database</div>
                    <div className="flex items-center text-2xl font-extrabold text-slate-800 gap-3">
                        <StatusIndicator status={health?.components?.database || 'unknown'} />
                        {health?.components?.database?.toUpperCase() || '-'}
                    </div>
                </div>
                <div className="premium-card flex flex-col gap-2">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">API</div>
                    <div className="flex items-center text-2xl font-extrabold text-slate-800 gap-3">
                        <StatusIndicator status={health?.components?.api || 'unknown'} />
                        {health?.components?.api?.toUpperCase() || '-'}
                    </div>
                </div>
                <div className="premium-card flex flex-col gap-2">
                    <div className="text-slate-500 text-sm font-bold uppercase tracking-wide">Version</div>
                    <div className="text-2xl font-extrabold text-slate-800">
                        {health?.version || '-'}
                    </div>
                </div>
            </div>

            {/* Tabs & Content */}
            <div className="premium-card flex-1 overflow-hidden flex flex-col p-0 rounded-3xl">
                <div className="px-6 pt-6 pb-0 border-b border-slate-100 bg-white">
                    <div className="flex gap-8">
                        {([{ id: 'health', label: 'System Health' }, { id: 'transitions', label: 'State Transitions' }, { id: 'events', label: 'Raw Events' }, { id: 'diagnostics', label: 'Campaign Diagnostics' }] as const).map(t => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id)}
                                className="pb-4 bg-transparent border-none cursor-pointer text-base transition-all duration-200 -mb-px"
                                style={{
                                    color: activeTab === t.id ? '#2563EB' : '#64748B',
                                    borderBottom: activeTab === t.id ? '2px solid #2563EB' : '2px solid transparent',
                                    fontWeight: activeTab === t.id ? 700 : 500
                                }}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden p-6 bg-gray-50">
                    {activeTab === 'health' && (
                        <div className="overflow-y-auto h-full pr-2">
                            <div className="grid grid-cols-2 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold mb-2 text-lg text-slate-800">Database</h3>
                                    <div className="text-sm text-slate-500">PostgreSQL connection status</div>
                                    <div className="mt-4 flex items-center gap-2 font-semibold" style={{ color: health?.components?.database === 'healthy' ? '#15803d' : '#b91c1c' }}>
                                        {health?.components?.database === 'healthy' ? (
                                            <><span className="text-xl">✓</span> Connected & Operational</>
                                        ) : (
                                            <><span className="text-xl">✗</span> Connection Failed</>
                                        )}
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold mb-2 text-lg text-slate-800">API Server</h3>
                                    <div className="text-sm text-slate-500">Express server status</div>
                                    <div className="mt-4 flex items-center gap-2 font-semibold" style={{ color: health?.components?.api === 'healthy' ? '#15803d' : '#b91c1c' }}>
                                        {health?.components?.api === 'healthy' ? (
                                            <><span className="text-xl">✓</span> Running Smoothly</>
                                        ) : (
                                            <><span className="text-xl">✗</span> Not Responding</>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="font-bold mb-4 text-lg text-slate-800">System Capabilities (Phases 1-8)</h3>
                                <div className="grid grid-cols-4 gap-4">
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
                                        <div key={cap.phase} className="bg-emerald-50 border border-emerald-200 p-4 rounded-xl text-sm">
                                            <div className="text-emerald-700 font-bold mb-1">PHASE {cap.phase}</div>
                                            <div className="text-emerald-900 font-semibold">{cap.name}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'transitions' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-slate-800">State Transitions (Phase 3)</h2>
                                <p className="text-slate-500 text-sm">History of all state changes for mailboxes, domains, and leads.</p>
                            </div>
                            <div className="overflow-y-auto flex-1 rounded-xl border border-slate-200 bg-white">
                                <table className="w-full border-separate" style={{ borderSpacing: '0' }}>
                                    <thead className="sticky top-0 bg-slate-50 z-10">
                                        <tr>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Time</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Entity</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Transition</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Trigger</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stateTransitions.length > 0 ? stateTransitions.map((t: StateTransition) => (
                                            <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {new Date(t.created_at).toLocaleString()}
                                                </td>
                                                <td className="p-4 border-b border-slate-100">
                                                    <span className="bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold text-slate-600 uppercase">
                                                        {t.entity_type}
                                                    </span>
                                                </td>
                                                <td className="p-4 border-b border-slate-100 font-semibold">
                                                    <span className="text-red-500">{t.from_state}</span>
                                                    <span className="text-slate-400 mx-2">→</span>
                                                    <span className="text-emerald-500">{t.to_state}</span>
                                                </td>
                                                <td className="p-4 border-b border-slate-100 text-slate-500 text-sm">{t.triggered_by}</td>
                                                <td className="p-4 border-b border-slate-100 text-slate-500 text-sm">{t.reason}</td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="text-center p-12 text-gray-400 italic">No transitions recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'events' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-slate-800">Raw Events (Phase 2)</h2>
                                <p className="text-slate-500 text-sm">Immutable event-sourced log of all system activities.</p>
                            </div>
                            <div className="overflow-y-auto flex-1 rounded-xl border border-slate-200 bg-white">
                                <table className="w-full border-separate" style={{ borderSpacing: '0' }}>
                                    <thead className="sticky top-0 bg-slate-50 z-10">
                                        <tr>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Time</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Event</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Entity</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Source</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">State</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rawEvents.length > 0 ? rawEvents.map((e: RawEvent) => (
                                            <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {new Date(e.created_at).toLocaleString()}
                                                </td>
                                                <td className="p-4 border-b border-slate-100 font-semibold text-slate-800">{e.event_type}</td>
                                                <td className="p-4 border-b border-slate-100">
                                                    <span className="text-slate-500 text-xs font-medium mr-1">{e.entity_type}:</span>
                                                    <span className="text-[0.8rem] font-mono bg-slate-100 px-1 py-0.5 rounded">{e.entity_id?.substring(0, 8)}...</span>
                                                </td>
                                                <td className="p-4 border-b border-slate-100 text-slate-500 text-sm">{e.source}</td>
                                                <td className="p-4 border-b border-slate-100">
                                                    {e.processed_at ? (
                                                        <span className="text-green-800 bg-green-100 px-2 py-0.5 rounded text-xs font-semibold">PROCESSED</span>
                                                    ) : (
                                                        <span className="text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded text-xs font-semibold">PENDING</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={5} className="text-center p-12 text-gray-400 italic">No events recorded.</td></tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeTab === 'diagnostics' && (
                        <div className="flex flex-col h-full">
                            <div className="mb-4">
                                <h2 className="text-xl font-semibold text-slate-800">Campaign-Mailbox Mappings</h2>
                                <p className="text-slate-500 text-sm">Diagnostic view of campaign-to-mailbox relationships.</p>
                            </div>
                            <div className="overflow-y-auto flex-1 rounded-xl border border-slate-200 bg-white">
                                <table className="w-full border-separate" style={{ borderSpacing: '0' }}>
                                    <thead className="sticky top-0 bg-slate-50 z-10">
                                        <tr>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Campaign</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Mailbox</th>
                                            <th className="p-4 text-left border-b border-slate-200 text-xs font-bold text-slate-500 uppercase">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {diagnostics.length > 0 ? diagnostics.map((d: CampaignDiagnostic, i: number) => (
                                            <tr key={i} className="hover:bg-gray-50 transition-colors">
                                                <td className="p-4 border-b border-slate-100 text-sm font-semibold text-slate-800">
                                                    {d.campaign_name || d.campaign_id}
                                                </td>
                                                <td className="p-4 border-b border-slate-100 text-sm text-slate-600">
                                                    {d.mailbox_email || d.mailbox_id}
                                                </td>
                                                <td className="p-4 border-b border-slate-100">
                                                    <span
                                                        className="px-2 py-0.5 rounded-full text-[0.7rem] font-semibold uppercase"
                                                        style={{
                                                            background: d.mailbox_status === 'healthy' ? '#DCFCE7' : d.mailbox_status === 'paused' ? '#FEE2E2' : '#FEF3C7',
                                                            color: d.mailbox_status === 'healthy' ? '#166534' : d.mailbox_status === 'paused' ? '#991B1B' : '#92400E'
                                                        }}
                                                    >
                                                        {d.mailbox_status || 'unknown'}
                                                    </span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr><td colSpan={3} className="text-center p-12 text-gray-400 italic">No campaign-mailbox data available.</td></tr>
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
