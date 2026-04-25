'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Plus, Play, Pause, Trash2, MoreHorizontal, Users, Mail } from 'lucide-react';
import { apiClient } from '@/lib/api';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

interface Campaign {
    id: string;
    name: string;
    status: string;
    daily_limit: number;
    schedule_timezone?: string;
    total_sent: number;
    total_replied: number;
    total_opened: number;
    total_bounced: number;
    created_at: string;
    updated_at?: string;
    lead_count: number;
    step_count: number;
    account_count?: number;
}

const statusBadge: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    active: 'bg-emerald-50 text-emerald-700',
    paused: 'bg-amber-50 text-amber-700',
    completed: 'bg-blue-50 text-blue-700',
};

export default function SequencerCampaignsPage() {
    const [campaigns, setCampaigns] = useState<Campaign[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchCampaigns() {
            try {
                const res = await apiClient<any>('/api/sequencer/campaigns');
                // apiClient auto-unwraps `{success, data}` → returns the array directly.
                // Keep fallbacks for the `{campaigns: [...]}` shape in case the backend changes.
                const list = Array.isArray(res) ? res : (res?.campaigns ?? res?.data ?? []);
                setCampaigns(list);
            } catch (err: any) {
                setError(err.message ?? 'Failed to load campaigns');
            } finally {
                setLoading(false);
            }
        }
        fetchCampaigns();
    }, []);

    function formatDate(iso: string) {
        return new Date(iso).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    return (
        <div className="p-4 flex flex-col gap-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Campaigns</h1>
                    <p className="text-sm text-gray-500 mt-1">Create and manage email campaigns</p>
                </div>
                <Link
                    href="/dashboard/sequencer/campaigns/new"
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                >
                    <Plus size={14} />
                    Create Campaign
                </Link>
            </div>

            {/* Loading state */}
            {loading && (
                <div className="premium-card p-6">
                    <LoadingSkeleton type="table" rows={5} />
                </div>
            )}

            {/* Error state */}
            {!loading && error && (
                <div className="premium-card flex flex-col items-center justify-center py-12">
                    <p className="text-sm text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => { setLoading(true); setError(null); window.location.reload(); }}
                        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                        Retry
                    </button>
                </div>
            )}

            {/* Empty state */}
            {!loading && !error && campaigns.length === 0 && (
                <div className="premium-card flex flex-col items-center justify-center py-16">
                    <div className="text-4xl mb-4">🚀</div>
                    <h2 className="text-lg font-bold text-gray-900 mb-2">No campaigns yet</h2>
                    <p className="text-sm text-gray-500 text-center max-w-md mb-6">
                        Create your first campaign to start sending cold emails with native deliverability protection.
                    </p>
                    <Link
                        href="/dashboard/sequencer/campaigns/new"
                        className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-lg text-sm font-semibold hover:bg-gray-800 transition-colors"
                    >
                        <Plus size={14} />
                        Create Campaign
                    </Link>
                </div>
            )}

            {/* Campaigns table */}
            {!loading && !error && campaigns.length > 0 && (
                <div className="premium-card overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="border-b border-gray-200">
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Campaign</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Leads</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Steps</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Sent</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Replied</th>
                                <th className="px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Created</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {campaigns.map((campaign) => (
                                <tr key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-4 py-3">
                                        <Link
                                            href={`/dashboard/sequencer/campaigns/${campaign.id}`}
                                            className="text-sm font-medium text-gray-900 hover:text-gray-700 transition-colors"
                                            style={{ textDecoration: 'none' }}
                                        >
                                            {campaign.name}
                                        </Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadge[campaign.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                            {campaign.status}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                                            <Users size={12} className="text-gray-400" />
                                            {campaign.lead_count}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs text-gray-600">{campaign.step_count}</span>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-1 text-xs text-gray-600">
                                            <Mail size={12} className="text-gray-400" />
                                            {campaign.total_sent}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-center">
                                        <span className="text-xs text-gray-600">{campaign.total_replied}</span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className="text-xs text-gray-500">{formatDate(campaign.created_at)}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
