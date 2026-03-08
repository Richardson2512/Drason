'use client';
import type { Organization } from '@/types/api';
import CopyButton from '@/components/CopyButton';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';

export default function OrganizationDetailsCard({ org }: { org: Organization | null }) {
    return (
        <div className="premium-card mb-4">
            <h2 className="text-xl font-bold mb-6 text-slate-800">Organization Details</h2>
            {org ? (
                <div>
                    <div className="px-6 py-4 bg-blue-50 rounded-xl border border-blue-100 flex items-center gap-4 mb-6">
                        <span className="text-2xl">💡</span>
                        <div className="flex-1">
                            <p className="text-blue-800 text-[0.9rem] m-0">
                                <strong>Webhook Header Required:</strong> Include <code className="font-mono font-bold">x-organization-id</code> in your Clay, Smartlead, and EmailBison webhook configurations.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start flex-wrap">
                        <div className="w-[140px] shrink-0">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Name</label>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 font-semibold overflow-hidden text-ellipsis whitespace-nowrap">{org.name}</div>
                        </div>
                        <div className="w-[120px] shrink-0">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Slug</label>
                            <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-800 overflow-hidden text-ellipsis whitespace-nowrap">{org.slug}</div>
                        </div>
                        <div className="flex-1 min-w-[260px]">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-2">
                                Organization ID
                                <span className="text-[0.65rem] font-medium text-slate-400 normal-case ml-2">(UUID format)</span>
                            </label>
                            <div className="flex gap-2">
                                <code className="flex-1 p-3 bg-slate-100 border border-slate-200 rounded-lg text-slate-700 font-mono text-sm">{org.id}</code>
                                <CopyButton text={org.id} label="Copy" />
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <LoadingSkeleton type="card" rows={2} />
            )}
        </div>
    );
}
