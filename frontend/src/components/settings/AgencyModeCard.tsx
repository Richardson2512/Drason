'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, ArrowUpRight, Lock, Sparkles, Save, Pencil } from 'lucide-react';
import { useAgencyMode } from '@/hooks/useAgencyMode';

export default function AgencyModeCard() {
    const { enabled, setEnabled, isEligible, tier, workspaces, agencyProfile, setAgencyProfile } = useAgencyMode();
    const [confirming, setConfirming] = useState(false);
    const [editingProfile, setEditingProfile] = useState(false);
    const [draftAgencyName, setDraftAgencyName] = useState(agencyProfile.agencyName);
    const [draftAgencyCompany, setDraftAgencyCompany] = useState(agencyProfile.agencyCompany);

    useEffect(() => {
        setDraftAgencyName(agencyProfile.agencyName);
        setDraftAgencyCompany(agencyProfile.agencyCompany);
    }, [agencyProfile]);

    const handleToggle = () => {
        if (!isEligible) return;
        if (enabled) {
            setConfirming(true);
        } else {
            setEnabled(true);
        }
    };

    const handleConfirmDisable = () => {
        setEnabled(false);
        setConfirming(false);
    };

    return (
        <div className="profile-card mb-6">
            <div className="flex items-start gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: enabled ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #6B7280, #4B5563)' }}>
                    <Building2 size={16} color="#fff" />
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                        <h2 className="text-base font-semibold text-gray-900 m-0">Agency Mode</h2>
                        {enabled && (
                            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                <span className="w-1 h-1 rounded-full bg-emerald-500" />
                                Active
                            </span>
                        )}
                    </div>
                    <p className="text-gray-500 text-xs leading-relaxed">
                        Manage multiple client workspaces under one account. Each client gets isolated mailboxes, domains,
                        healing pipelines, and reporting.
                    </p>
                </div>
            </div>

            {/* Tier-gated state */}
            {!isEligible ? (
                <div className="rounded-lg p-4 border" style={{ background: '#FFFBEB', borderColor: '#FDE68A' }}>
                    <div className="flex items-start gap-2.5">
                        <Lock size={14} className="text-amber-700 shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h3 className="text-xs font-bold text-amber-900 mb-1">Available on Scale and Enterprise</h3>
                            <p className="text-[11px] text-amber-800 leading-relaxed mb-3">
                                Agency Mode unlocks unlimited workspaces, a fleet-overview dashboard, and per-client isolation
                                across mailboxes, domains, and healing. You're currently on <span className="font-semibold capitalize">{tier}</span>.
                            </p>
                            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-900 text-amber-50 text-[10px] font-semibold hover:bg-amber-950 transition-colors no-underline">
                                <Sparkles size={10} />
                                Upgrade to Scale
                                <ArrowUpRight size={10} />
                            </Link>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {/* Toggle row */}
                    <div className="flex items-center justify-between p-3 rounded-lg border border-gray-200 bg-gray-50/50 mb-3">
                        <div className="min-w-0 flex-1">
                            <div className="text-xs font-semibold text-gray-900 mb-0.5">
                                {enabled ? 'Agency Mode is on' : 'Agency Mode is off'}
                            </div>
                            <div className="text-[11px] text-gray-500 truncate">
                                {enabled
                                    ? `${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'} · switcher in sidebar`
                                    : 'Turn on to enable the workspace switcher and create client workspaces.'}
                            </div>
                        </div>
                        <button
                            onClick={handleToggle}
                            role="switch"
                            aria-checked={enabled}
                            className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 ml-3"
                            style={{ background: enabled ? '#10B981' : '#D1D5DB' }}
                        >
                            <span
                                className="pointer-events-none inline-block h-4 w-4 mt-1 ml-1 rounded-full bg-white shadow transform transition-transform"
                                style={{ transform: enabled ? 'translateX(20px)' : 'translateX(0)' }}
                            />
                        </button>
                    </div>

                    {enabled && (
                        <>
                            {/* Agency profile editor */}
                            <div className="rounded-lg border border-gray-200 p-3 mb-3 bg-white">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="min-w-0">
                                        <div className="text-[11px] font-bold text-gray-900">Your agency profile</div>
                                        <div className="text-[10px] text-gray-500 truncate">
                                            Shown in the sidebar so clients see their outbound partner.
                                        </div>
                                    </div>
                                    {!editingProfile && (
                                        <button
                                            onClick={() => setEditingProfile(true)}
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors shrink-0"
                                        >
                                            <Pencil size={10} />
                                            Edit
                                        </button>
                                    )}
                                </div>
                                {editingProfile ? (
                                    <div className="space-y-2">
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Agency name</label>
                                            <input
                                                value={draftAgencyName}
                                                onChange={(e) => setDraftAgencyName(e.target.value)}
                                                placeholder="e.g. Acme Outbound"
                                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-[10px] font-bold text-gray-600 mb-1">Company / legal name (optional)</label>
                                            <input
                                                value={draftAgencyCompany}
                                                onChange={(e) => setDraftAgencyCompany(e.target.value)}
                                                placeholder="Acme Outbound LLC"
                                                className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-500"
                                            />
                                        </div>
                                        <div className="flex gap-1.5 pt-1">
                                            <button
                                                onClick={() => {
                                                    setDraftAgencyName(agencyProfile.agencyName);
                                                    setDraftAgencyCompany(agencyProfile.agencyCompany);
                                                    setEditingProfile(false);
                                                }}
                                                className="px-3 py-1 rounded-full text-[10px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setAgencyProfile({
                                                        agencyName: draftAgencyName.trim(),
                                                        agencyCompany: draftAgencyCompany.trim(),
                                                    });
                                                    setEditingProfile(false);
                                                }}
                                                className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-semibold bg-gray-900 text-white hover:bg-black transition-colors"
                                            >
                                                <Save size={10} />
                                                Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        <div className="p-3 rounded-md bg-gray-50">
                                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Agency name</div>
                                            <div className="text-xs font-semibold text-gray-900">
                                                {agencyProfile.agencyName || <span className="text-gray-400 italic font-normal">Not set</span>}
                                            </div>
                                        </div>
                                        <div className="p-3 rounded-md bg-gray-50">
                                            <div className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Company</div>
                                            <div className="text-xs font-semibold text-gray-900">
                                                {agencyProfile.agencyCompany || <span className="text-gray-400 italic font-normal">Not set</span>}
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="text-[9px] text-gray-400 italic mt-2">
                                    Logo upload comes later - right now agency &amp; client brands show as letter avatars in the sidebar.
                                </div>
                            </div>

                            <Link href="/dashboard/agency" className="flex items-center justify-between p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-200 hover:bg-emerald-100/70 transition-colors no-underline">
                                <div className="text-[11px] text-emerald-900 truncate">
                                    Manage workspaces &amp; client logins in the <span className="font-semibold">Workspaces</span> section
                                </div>
                                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 shrink-0 ml-2">
                                    Open
                                    <ArrowUpRight size={11} />
                                </span>
                            </Link>
                        </>
                    )}
                </>
            )}

            {/* Disable confirmation modal */}
            {confirming && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirming(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">Turn off Agency Mode?</h3>
                        <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                            The workspace switcher will hide and you'll go back to a single-workspace view. Your client workspaces
                            and their data are preserved - you can re-enable Agency Mode any time to bring them back.
                        </p>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setConfirming(false)}
                                className="px-4 py-2 rounded-full text-sm font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Keep it on
                            </button>
                            <button
                                onClick={handleConfirmDisable}
                                className="px-4 py-2 rounded-full text-sm font-semibold bg-gray-900 text-white hover:bg-black transition-colors"
                            >
                                Turn off
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

