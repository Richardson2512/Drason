'use client';
import { useEffect, useState, useCallback } from 'react';
import { apiClient } from '@/lib/api';
import type { AuditLog } from '@/types/api';
import { useSimplePagination } from '@/hooks/usePagination';

export default function Audit() {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const { meta, setMeta } = useSimplePagination(1, 50);

    const fetchLogs = useCallback(() => {
        const query = new URLSearchParams({
            page: meta.page.toString(),
            limit: meta.limit.toString(),
        });
        if (activeTab !== 'all') query.append('entity', activeTab);
        apiClient<{ data: AuditLog[]; meta: { total: number; page: number; limit: number; totalPages: number } }>(`/api/dashboard/audit-logs?${query}`)
            .then(data => {
                if (data?.data) {
                    setLogs(Array.isArray(data.data) ? data.data : []);
                    if (data.meta) setMeta(data.meta);
                } else {
                    setLogs(Array.isArray(data) ? data : []);
                }
            })
            .catch(() => setLogs([]));
    }, [meta.page, meta.limit, activeTab, setMeta]);

    useEffect(() => {
        fetchLogs();
    }, [fetchLogs]);

    const filteredLogs = activeTab === 'all' ? logs : logs.filter(log => log.entity === activeTab);

    return (
        <div className="flex flex-col" style={{ height: 'calc(100vh - 4rem)' }}>
            <div className="page-header">
                <h1 className="text-4xl font-extrabold mb-2 text-gray-900 tracking-tight">System Audit Log</h1>
                <div className="text-gray-500 text-[1.1rem]">Immutable record of all system events and triggers</div>
            </div>

            <div className="premium-card flex-1 overflow-hidden flex flex-col p-0 rounded-3xl">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h2 className="text-xl font-bold text-slate-800">Event History</h2>
                    <div className="flex bg-gray-100 p-1 rounded-xl">
                        {['all', 'lead', 'mailbox', 'domain'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className="py-1.5 px-4 rounded-lg border-none cursor-pointer text-sm font-semibold capitalize transition-all duration-200"
                                style={{
                                    background: activeTab === tab ? '#FFFFFF' : 'transparent',
                                    color: activeTab === tab ? '#111827' : '#6B7280',
                                    boxShadow: activeTab === tab ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-y-auto flex-1">
                    <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0' }}>
                        <thead className="sticky top-0 z-10">
                            <tr className="bg-slate-50">
                                <th scope="col" className="p-4 text-left border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wide">Timestamp</th>
                                <th scope="col" className="p-4 text-left border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wide">Entity</th>
                                <th scope="col" className="p-4 text-left border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wide">Trigger</th>
                                <th scope="col" className="p-4 text-left border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wide">Action</th>
                                <th scope="col" className="p-4 text-left border-b border-slate-200 text-slate-500 text-xs font-bold uppercase tracking-wide">Details</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="p-4 border-b border-slate-100 text-slate-600 text-sm whitespace-nowrap">
                                        {new Date(log.timestamp).toLocaleString()}
                                    </td>
                                    <td className="p-4 border-b border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span className="uppercase text-[0.7rem] font-bold py-0.5 px-2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                                                {log.entity}
                                            </span>
                                            <span className="text-sm font-mono text-slate-700">{log.entity_id}</span>
                                        </div>
                                    </td>
                                    <td className="p-4 border-b border-slate-100 text-slate-800 font-medium">{log.trigger}</td>
                                    <td className="p-4 border-b border-slate-100">
                                        <span className="font-semibold text-blue-600">{log.action}</span>
                                    </td>
                                    <td className="p-4 border-b border-slate-100 text-slate-500 text-sm">{log.details}</td>
                                </tr>
                            ))}
                            {filteredLogs.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-gray-400 italic">
                                        No {activeTab} logs found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
                {meta.totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 flex justify-center gap-2">
                        <button
                            disabled={meta.page <= 1}
                            onClick={() => setMeta({ ...meta, page: meta.page - 1 })}
                            className="py-1.5 px-3 rounded-md border border-slate-200 bg-white text-[0.8rem] font-semibold"
                            style={{ cursor: meta.page <= 1 ? 'not-allowed' : 'pointer', opacity: meta.page <= 1 ? 0.5 : 1 }}
                        >
                            Previous
                        </button>
                        <span className="py-1.5 px-3 text-[0.8rem] text-slate-500">
                            Page {meta.page} of {meta.totalPages}
                        </span>
                        <button
                            disabled={meta.page >= meta.totalPages}
                            onClick={() => setMeta({ ...meta, page: meta.page + 1 })}
                            className="py-1.5 px-3 rounded-md border border-slate-200 bg-white text-[0.8rem] font-semibold"
                            style={{ cursor: meta.page >= meta.totalPages ? 'not-allowed' : 'pointer', opacity: meta.page >= meta.totalPages ? 0.5 : 1 }}
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
