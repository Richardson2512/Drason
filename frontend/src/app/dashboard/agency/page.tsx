'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Building2, TrendingUp, AlertTriangle, ArrowUpRight, Mailbox, Send, Plus, KeyRound, X, Search, RefreshCw, Sprout } from 'lucide-react';
import { useAgencyMode } from '@/hooks/useAgencyMode';

const HEALTH_STYLE: Record<'healthy' | 'warning' | 'paused', { bg: string; border: string; text: string; dot: string; label: string }> = {
    healthy: { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', dot: '#10B981', label: 'Healthy' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', dot: '#F59E0B', label: 'Warning' },
    paused:  { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', dot: '#EF4444', label: 'Paused' },
};

export default function AgencyOverviewPage() {
    const { enabled, workspaces, isEligible, setActiveWorkspaceId, addWorkspace } = useAgencyMode();
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newClient, setNewClient] = useState('');
    const [search, setSearch] = useState('');

    const filteredWorkspaces = useMemo(() => {
        if (!search.trim()) return workspaces;
        const q = search.trim().toLowerCase();
        return workspaces.filter((w) =>
            w.name.toLowerCase().includes(q) ||
            (w.clientCompany?.toLowerCase().includes(q) ?? false)
        );
    }, [workspaces, search]);

    if (!isEligible) {
        return <NotEligibleState />;
    }
    if (!enabled) {
        return <NotEnabledState />;
    }

    // First-time agency mode — show the onboarding state when:
    //   1. No workspaces exist (e.g. user just deleted their last one), OR
    //   2. Only the seeded default workspace exists with no engagement yet.
    const isFirstTime =
        workspaces.length === 0 || (
            workspaces.length === 1 &&
            workspaces[0]?.id === 'ws-default' &&
            workspaces[0]?.clientLogins.length === 0
        );
    if (isFirstTime) {
        return <FirstTimeAgencyState onCreate={() => setCreating(true)} creating={creating} newName={newName} setNewName={setNewName} newClient={newClient} setNewClient={setNewClient} setCreating={setCreating} addWorkspace={addWorkspace} setActiveWorkspaceId={setActiveWorkspaceId} />;
    }

    // Aggregate stats
    const totalSends = workspaces.reduce((s, w) => s + w.sends30d, 0);
    const totalMailboxes = workspaces.reduce((s, w) => s + w.mailboxCount, 0);
    const weightedBounceRate = totalSends > 0
        ? workspaces.reduce((s, w) => s + w.bounceRate * w.sends30d, 0) / totalSends
        : 0;
    const weightedReplyRate = totalSends > 0
        ? workspaces.reduce((s, w) => s + w.replyRate * w.sends30d, 0) / totalSends
        : 0;
    const warningCount = workspaces.filter((w) => w.health === 'warning').length;
    const pausedCount = workspaces.filter((w) => w.health === 'paused').length;

    return (
        <div className="px-6 py-6">
            {/* Header */}
            <div className="flex items-end justify-between mb-6 flex-wrap gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Building2 size={20} className="text-gray-700" />
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">Fleet overview</h1>
                    </div>
                    <p className="text-xs text-gray-500">
                        Aggregate health and activity across {workspaces.length} client workspace{workspaces.length === 1 ? '' : 's'}.
                    </p>
                </div>
                <button
                    onClick={() => setCreating(true)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors"
                >
                    <Plus size={12} />
                    New workspace
                </button>
            </div>

            {/* Aggregate stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <StatCard
                    label="Workspaces"
                    value={workspaces.length}
                    icon={<Building2 size={14} />}
                    sub={pausedCount > 0 ? `${pausedCount} paused · ${warningCount} warning` : warningCount > 0 ? `${warningCount} warning` : 'All healthy'}
                    subTone={pausedCount > 0 ? 'red' : warningCount > 0 ? 'amber' : 'green'}
                />
                <StatCard
                    label="Mailboxes"
                    value={totalMailboxes}
                    icon={<Mailbox size={14} />}
                    sub="across all workspaces"
                />
                <StatCard
                    label="Sends · 30d"
                    value={totalSends.toLocaleString()}
                    icon={<Send size={14} />}
                    sub={`${(weightedReplyRate * 100).toFixed(1)}% reply rate`}
                    subTone="green"
                />
                <StatCard
                    label="Bounce rate"
                    value={`${(weightedBounceRate * 100).toFixed(2)}%`}
                    icon={<TrendingUp size={14} />}
                    sub={weightedBounceRate < 0.02 ? 'within safe band' : 'monitor closely'}
                    subTone={weightedBounceRate < 0.02 ? 'green' : 'amber'}
                />
            </div>

            {/* Workspaces toolbar — title + search + attention pill */}
            <div className="mb-3 flex items-center gap-3 flex-wrap">
                <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest shrink-0">Client workspaces</h2>
                <div className="relative flex-1 min-w-[220px] max-w-md">
                    <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search workspaces by name or client…"
                        className="w-full pl-9 pr-8 py-2 text-[12px] border border-gray-200 rounded-lg focus:outline-none focus:border-gray-400 bg-white"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-0.5 text-gray-400 hover:text-gray-700 rounded"
                        >
                            <X size={12} />
                        </button>
                    )}
                </div>
                {search.trim() && (
                    <span className="text-[10px] text-gray-500 font-medium">
                        {filteredWorkspaces.length} of {workspaces.length}
                    </span>
                )}
                {(warningCount + pausedCount) > 0 && !search.trim() && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-900 text-[10px] font-bold ml-auto">
                        <AlertTriangle size={10} />
                        {warningCount + pausedCount} need attention
                    </span>
                )}
            </div>

            {filteredWorkspaces.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-10 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <Search size={20} className="text-gray-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">No workspaces match "{search}"</h3>
                    <p className="text-[11px] text-gray-500 mb-4 max-w-md mx-auto">
                        Try a different search term, or clear the filter to see all workspaces.
                    </p>
                    <button
                        onClick={() => setSearch('')}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-gray-900 text-white text-[11px] font-semibold hover:bg-black transition-colors"
                    >
                        <RefreshCw size={11} />
                        Clear search
                    </button>
                </div>
            ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {filteredWorkspaces.map((w) => {
                    const style = HEALTH_STYLE[w.health];
                    return (
                        <Link
                            key={w.id}
                            href={`/dashboard/agency/workspaces/${w.id}`}
                            onClick={() => setActiveWorkspaceId(w.id)}
                            className="group relative bg-white rounded-2xl border border-gray-200 p-5 hover:border-gray-400 hover:shadow-md transition-all cursor-pointer no-underline block"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-0.5">
                                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: style.dot }} />
                                        <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: style.text }}>{style.label}</span>
                                        {w.id === 'ws-default' && (
                                            <span
                                                className="inline-flex items-center gap-0.5 px-1.5 py-0 rounded-full text-[8px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700"
                                                title="Seed workspace — created automatically with Agency Mode. Cannot be deleted."
                                            >
                                                <Sprout size={8} />
                                                Seed
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm font-bold text-gray-900 truncate">{w.name}</div>
                                    {w.clientCompany && (
                                        <div className="text-[10px] text-gray-500 truncate">{w.clientCompany}</div>
                                    )}
                                </div>
                                <ArrowUpRight size={14} className="text-gray-300 group-hover:text-gray-700 transition-colors shrink-0" />
                            </div>

                            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-gray-100">
                                <MiniStat label="Mailboxes" value={String(w.mailboxCount)} />
                                <MiniStat label="Active" value={String(w.activeCampaigns)} />
                                <MiniStat label="Sends 30d" value={w.sends30d.toLocaleString()} />
                            </div>

                            <div className="grid grid-cols-2 gap-2 pt-2 mt-2 border-t border-gray-100">
                                <MiniStat label="Bounce" value={`${(w.bounceRate * 100).toFixed(2)}%`} accent={w.bounceRate >= 0.02 ? 'amber' : undefined} />
                                <MiniStat label="Reply" value={`${(w.replyRate * 100).toFixed(1)}%`} accent="green" />
                            </div>

                            {/* Client logins indicator */}
                            <div className="flex items-center gap-1.5 pt-2 mt-2 border-t border-gray-100 text-[10px] text-gray-500">
                                <KeyRound size={10} />
                                <span className="font-semibold text-gray-700">{w.clientLogins.length}</span>
                                <span>client login{w.clientLogins.length === 1 ? '' : 's'}</span>
                                {w.clientLogins.length === 0 && (
                                    <span className="ml-auto text-amber-700 font-semibold">Set up client access →</span>
                                )}
                            </div>
                        </Link>
                    );
                })}

                {/* Add new workspace card — hidden during search to avoid mixing
                    a non-result tile in with filtered matches. Use the "New
                    workspace" button in the header instead. */}
                {!search.trim() && (
                    <button
                        onClick={() => setCreating(true)}
                        className="flex flex-col items-center justify-center gap-2 min-h-[200px] bg-white rounded-2xl border-2 border-dashed border-gray-300 p-5 hover:border-gray-500 hover:bg-gray-50 transition-all"
                    >
                        <span className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-900">
                            <Plus size={18} className="text-white" />
                        </span>
                        <span className="text-xs font-semibold text-gray-900">Add a workspace</span>
                        <span className="text-[10px] text-gray-500 text-center max-w-[200px] leading-relaxed">
                            Spin up a new isolated environment for a client
                        </span>
                    </button>
                )}
            </div>
            )}

            {/* Create workspace modal */}
            {creating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setCreating(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Create a workspace</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Each workspace is fully isolated — its own mailboxes, domains, healing.</p>
                            </div>
                            <button onClick={() => setCreating(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1">Workspace name <span className="text-red-500">*</span></label>
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Acme — Q2 outbound"
                                    autoFocus
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1">Client company <span className="text-gray-400">(optional)</span></label>
                                <input
                                    value={newClient}
                                    onChange={(e) => setNewClient(e.target.value)}
                                    placeholder="Acme Inc."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setCreating(false)} className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newName.trim()) return;
                                    try {
                                        const ws = await addWorkspace(newName.trim(), newClient.trim() || undefined);
                                        setActiveWorkspaceId(ws.id);
                                        setCreating(false);
                                        setNewName(''); setNewClient('');
                                    } catch (err) {
                                        console.error('[fleet] create workspace failed', err);
                                    }
                                }}
                                disabled={!newName.trim()}
                                className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Create workspace
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="mt-8 p-4 rounded-xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 leading-relaxed">
                <span className="font-semibold text-gray-900">Frontend prototype.</span> Workspace data shown here is mock data
                stored in your browser. Backend (Account → Organization mapping, per-workspace data isolation) lands in the
                next iteration; the UI you're seeing is the target shape.
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, sub, subTone }: { label: string; value: string | number; icon: React.ReactNode; sub: string; subTone?: 'green' | 'amber' | 'red' }) {
    const subColor = subTone === 'green' ? 'text-emerald-700' : subTone === 'amber' ? 'text-amber-700' : subTone === 'red' ? 'text-red-700' : 'text-gray-500';
    return (
        <div className="bg-white rounded-2xl border border-gray-200 p-4">
            <div className="flex items-center gap-1.5 mb-1.5 text-gray-500">
                {icon}
                <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
            </div>
            <div className="text-xl font-bold text-gray-900 mb-0.5 tracking-tight">{value}</div>
            <div className={`text-[10px] font-medium ${subColor}`}>{sub}</div>
        </div>
    );
}

function MiniStat({ label, value, accent }: { label: string; value: string; accent?: 'amber' | 'green' }) {
    const valColor = accent === 'amber' ? 'text-amber-700' : accent === 'green' ? 'text-emerald-700' : 'text-gray-900';
    return (
        <div>
            <div className="text-[8px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
            <div className={`text-[11px] font-bold ${valColor}`}>{value}</div>
        </div>
    );
}

function NotEligibleState() {
    return (
        <div className="px-6 py-12 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Building2 size={28} className="text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Agency Mode requires Scale or Enterprise</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
                The fleet overview is part of Agency Mode, available on Scale and Enterprise plans. Upgrade to manage unlimited
                client workspaces with full per-client isolation.
            </p>
            <Link href="/pricing" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors no-underline">
                See pricing
                <ArrowUpRight size={12} />
            </Link>
        </div>
    );
}

function NotEnabledState() {
    return (
        <div className="px-6 py-12 max-w-2xl mx-auto text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                <Building2 size={28} className="text-gray-400" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Agency Mode is off</h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6">
                Turn on Agency Mode in Settings to manage multiple client workspaces and unlock the fleet overview.
            </p>
            <Link href="/dashboard/profile" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors no-underline">
                Open Profile
                <ArrowUpRight size={12} />
            </Link>
        </div>
    );
}

interface FirstTimeProps {
    onCreate: () => void;
    creating: boolean;
    newName: string;
    setNewName: (s: string) => void;
    newClient: string;
    setNewClient: (s: string) => void;
    setCreating: (b: boolean) => void;
    addWorkspace: (name: string, clientCompany?: string) => Promise<{ id: string }>;
    setActiveWorkspaceId: (id: string) => void;
}

function FirstTimeAgencyState({ onCreate, creating, newName, setNewName, newClient, setNewClient, setCreating, addWorkspace, setActiveWorkspaceId }: FirstTimeProps) {
    return (
        <div className="px-6 py-10">
            <div className="max-w-3xl mx-auto">
                {/* Hero */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        Agency Mode active
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Let's create your first client workspace</h1>
                    <p className="text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
                        Each workspace is a fully isolated environment for one client — its own mailboxes, domains, healing
                        pipelines, and reporting. Spin up as many as you need.
                    </p>
                </div>

                {/* Steps card */}
                <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                    <h2 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">How it works</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FirstTimeStep
                            n={1}
                            icon={<Building2 size={14} />}
                            title="Create a workspace"
                            desc="Name it after the client. Optionally tag the client company."
                        />
                        <FirstTimeStep
                            n={2}
                            icon={<KeyRound size={14} />}
                            title="Invite the client"
                            desc="Send a magic-link invite. They set their own password and land directly on the workspace."
                        />
                        <FirstTimeStep
                            n={3}
                            icon={<ArrowUpRight size={14} />}
                            title="Manage the fleet"
                            desc="Switch between workspaces from the sidebar. The fleet overview aggregates health across all clients."
                        />
                    </div>
                </div>

                {/* Primary CTA */}
                <div className="text-center">
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-1.5 px-5 py-3 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-black transition-colors"
                    >
                        <Plus size={14} />
                        Create your first workspace
                    </button>
                    <div className="text-[10px] text-gray-400 mt-2">
                        No charge — workspaces are unlimited on Scale.
                    </div>
                </div>

                {/* Mini-CTA: skip for now */}
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                    <p className="text-[11px] text-gray-500 leading-relaxed">
                        Not ready to add a client yet? You can use the default workspace as your own and create more later.
                    </p>
                </div>
            </div>

            {/* Reuse the create modal */}
            {creating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4" onClick={() => setCreating(false)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h3 className="text-base font-bold text-gray-900">Create a workspace</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Each workspace is fully isolated.</p>
                            </div>
                            <button onClick={() => setCreating(false)} className="p-1 rounded-md hover:bg-gray-100 text-gray-500">
                                <X size={16} />
                            </button>
                        </div>
                        <div className="space-y-3 mb-4">
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1">Workspace name <span className="text-red-500">*</span></label>
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="e.g. Acme — Q2 outbound"
                                    autoFocus
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-gray-700 mb-1">Client company <span className="text-gray-400">(optional)</span></label>
                                <input
                                    value={newClient}
                                    onChange={(e) => setNewClient(e.target.value)}
                                    placeholder="Acme Inc."
                                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button onClick={() => setCreating(false)} className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors">
                                Cancel
                            </button>
                            <button
                                onClick={async () => {
                                    if (!newName.trim()) return;
                                    try {
                                        const ws = await addWorkspace(newName.trim(), newClient.trim() || undefined);
                                        setActiveWorkspaceId(ws.id);
                                        setCreating(false);
                                        setNewName(''); setNewClient('');
                                    } catch (err) {
                                        console.error('[fleet] create workspace failed', err);
                                    }
                                }}
                                disabled={!newName.trim()}
                                className="px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                Create workspace
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function FirstTimeStep({ n, icon, title, desc }: { n: number; icon: React.ReactNode; title: string; desc: string }) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-2">
                <span className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold">{n}</span>
                <span className="w-6 h-6 rounded-md bg-gray-100 text-gray-700 flex items-center justify-center">{icon}</span>
            </div>
            <div className="text-xs font-bold text-gray-900 mb-0.5">{title}</div>
            <p className="text-[11px] text-gray-500 leading-relaxed">{desc}</p>
        </div>
    );
}
