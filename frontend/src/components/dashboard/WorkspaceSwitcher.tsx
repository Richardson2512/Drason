'use client';
import { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, Plus, LayoutGrid, Check, Search } from 'lucide-react';
import { useAgencyMode } from '@/hooks/useAgencyMode';

interface Props {
    isCollapsed: boolean;
    /** Called when the user clicks the switcher while the sidebar is collapsed.
     *  The shell expands the sidebar so the dropdown has room to render. */
    onRequestExpand?: () => void;
}

const HEALTH_DOT: Record<'healthy' | 'warning' | 'paused', string> = {
    healthy: '#10B981',
    warning: '#F59E0B',
    paused: '#EF4444',
};

/**
 * Agency-mode sidebar panel — renders only when Agency Mode is on.
 * Stacks four pieces of UI:
 *   1. Agency brand row (letter avatar + agency name)
 *   2. Active-workspace brand row (letter avatar + workspace + client co.)
 *   3. Workspace switcher dropdown
 *   4. "Workspaces" nav button → fleet overview
 */
export default function WorkspaceSwitcher({ isCollapsed, onRequestExpand }: Props) {
    const router = useRouter();
    const {
        enabled, workspaces, activeWorkspace, setActiveWorkspaceId, switchWorkspaceOnBackend,
        addWorkspace, agencyProfile,
    } = useAgencyMode();
    const [open, setOpen] = useState(false);
    const [creating, setCreating] = useState(false);
    const [newName, setNewName] = useState('');
    const [newClient, setNewClient] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);

    const showSearch = workspaces.length > 5;
    const filteredWorkspaces = useMemo(() => {
        if (!searchQuery.trim()) return workspaces;
        const q = searchQuery.toLowerCase();
        return workspaces.filter((w) =>
            w.name.toLowerCase().includes(q) || (w.clientCompany?.toLowerCase().includes(q) ?? false)
        );
    }, [workspaces, searchQuery]);

    // Reset search when dropdown closes
    useEffect(() => {
        if (!open) setSearchQuery('');
    }, [open]);

    useEffect(() => {
        if (!open) return;
        const onClick = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, [open]);

    if (!enabled) return null;

    const handleSelect = async (id: string) => {
        if (id === activeWorkspace?.id) {
            setOpen(false);
            return;
        }
        setOpen(false);
        try {
            await switchWorkspaceOnBackend(id);
            // window.location.reload() inside the helper takes over from here.
        } catch (err) {
            console.error('[WorkspaceSwitcher] switch failed', err);
            // Fall back to local-only switch so the UI doesn't lock up.
            setActiveWorkspaceId(id);
        }
    };

    const handleCreate = async () => {
        if (!newName.trim()) return;
        try {
            const ws = await addWorkspace(newName.trim(), newClient.trim() || undefined);
            setActiveWorkspaceId(ws.id);
            setNewName('');
            setNewClient('');
            setCreating(false);
        } catch (err) {
            console.error('[WorkspaceSwitcher] create failed', err);
        }
        setOpen(false);
    };

    const handleOverview = () => {
        router.push('/dashboard/agency');
        setOpen(false);
    };

    const agencyDisplay = agencyProfile.agencyName || 'Set agency name';
    const agencyLetter = (agencyProfile.agencyName || 'A').slice(0, 1).toUpperCase();
    const clientDisplay = activeWorkspace?.clientCompany || activeWorkspace?.name || 'No workspace';
    const clientLetter = (activeWorkspace?.clientCompany || activeWorkspace?.name || 'W').slice(0, 1).toUpperCase();

    return (
        <div className="px-1 mb-2 space-y-1">
            {/* ── Agency brand row (always shown when agency mode is on) ── */}
            <BrandRow
                letter={agencyLetter}
                primary={agencyDisplay}
                secondary="Outbound partner"
                isCollapsed={isCollapsed}
                accent="brand-agency"
                emphasis={!agencyProfile.agencyName}
                title={isCollapsed ? agencyDisplay : undefined}
            />

            {/* ── Current workspace brand row ── */}
            <div ref={ref} className="relative">
                <button
                    onClick={() => {
                        if (isCollapsed) {
                            // Sidebar is collapsed — first expand it so the dropdown
                            // has room to render, then queue the dropdown open for
                            // the next paint.
                            onRequestExpand?.();
                            setTimeout(() => setOpen(true), 50);
                        } else {
                            setOpen(!open);
                        }
                    }}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-colors text-left cursor-pointer"
                    style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}
                    title={isCollapsed ? `${clientDisplay} — click to switch` : undefined}
                >
                    <span
                        className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                        style={{ background: 'linear-gradient(135deg, #1F2937, #4B5563)' }}
                    >
                        {clientLetter}
                    </span>
                    {!isCollapsed && (
                        <>
                            <span className="flex-1 min-w-0">
                                <span className="block text-[11px] font-bold text-gray-900 truncate">
                                    {clientDisplay}
                                </span>
                                <span className="block text-[9px] text-gray-500 truncate">
                                    {activeWorkspace?.clientCompany ? activeWorkspace.name : `${workspaces.length} workspace${workspaces.length === 1 ? '' : 's'}`}
                                </span>
                            </span>
                            <ChevronDown size={11} className={`text-gray-400 transition-transform shrink-0 ${open ? 'rotate-180' : ''}`} />
                        </>
                    )}
                </button>

                {open && !isCollapsed && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                        <div className="px-3 py-2 text-[9px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-100 flex items-center justify-between">
                            <span>Switch workspace</span>
                            <span className="text-[8px] font-semibold text-gray-400">{workspaces.length}</span>
                        </div>
                        {showSearch && (
                            <div className="p-2 border-b border-gray-100">
                                <div className="relative">
                                    <Search size={11} className="absolute left-2 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        autoFocus
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search workspaces…"
                                        className="w-full pl-7 pr-2 py-1.5 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                                    />
                                </div>
                            </div>
                        )}
                        <div className="max-h-72 overflow-y-auto">
                            {filteredWorkspaces.length === 0 ? (
                                <div className="px-3 py-4 text-center text-[10px] text-gray-400">
                                    No matches for "{searchQuery}"
                                </div>
                            ) : (
                                filteredWorkspaces.map((w) => (
                                    <button
                                        key={w.id}
                                        onClick={() => handleSelect(w.id)}
                                        className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                                    >
                                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: HEALTH_DOT[w.health] }} />
                                        <span className="flex-1 min-w-0">
                                            <span className="block text-[11px] font-semibold text-gray-900 truncate">{w.name}</span>
                                            {w.clientCompany && (
                                                <span className="block text-[9px] text-gray-500 truncate">{w.clientCompany}</span>
                                            )}
                                        </span>
                                        {w.id === activeWorkspace?.id && <Check size={12} className="text-emerald-600 shrink-0" />}
                                    </button>
                                ))
                            )}
                        </div>

                        {creating ? (
                            <div className="border-t border-gray-100 p-3 bg-gray-50/50">
                                <input
                                    value={newName}
                                    onChange={(e) => setNewName(e.target.value)}
                                    placeholder="Workspace name"
                                    className="w-full px-2.5 py-1.5 mb-2 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                                    autoFocus
                                />
                                <input
                                    value={newClient}
                                    onChange={(e) => setNewClient(e.target.value)}
                                    placeholder="Client company (optional)"
                                    className="w-full px-2.5 py-1.5 mb-2 text-[11px] border border-gray-200 rounded-md focus:outline-none focus:border-gray-400"
                                />
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={() => { setCreating(false); setNewName(''); setNewClient(''); }}
                                        className="flex-1 px-2 py-1.5 text-[10px] font-semibold text-gray-600 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleCreate}
                                        disabled={!newName.trim()}
                                        className="flex-1 px-2 py-1.5 text-[10px] font-semibold text-white bg-gray-900 rounded-md hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Create
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="border-t border-gray-100">
                                <button
                                    onClick={() => setCreating(true)}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left cursor-pointer"
                                >
                                    <Plus size={12} className="text-gray-500" />
                                    <span className="text-[11px] font-semibold text-gray-700">New workspace</span>
                                </button>
                                <button
                                    onClick={handleOverview}
                                    className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors text-left cursor-pointer border-t border-gray-100"
                                >
                                    <LayoutGrid size={12} className="text-gray-500" />
                                    <span className="text-[11px] font-semibold text-gray-700">Fleet overview</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

        </div>
    );
}

function BrandRow({
    letter, primary, secondary, isCollapsed, accent, emphasis, title,
}: {
    letter: string;
    primary: string;
    secondary: string;
    isCollapsed: boolean;
    accent: 'brand-agency';
    emphasis?: boolean;
    title?: string;
}) {
    const bg = accent === 'brand-agency'
        ? 'linear-gradient(135deg, #6366F1, #8B5CF6)'
        : 'linear-gradient(135deg, #1F2937, #4B5563)';
    // When collapsed, drop the emphasis dashed border — there's no text label
    // for it to emphasize, and a dashed avatar circle reads as broken.
    const showEmphasisFrame = emphasis && !isCollapsed;
    return (
        <div
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
            title={title || primary}
            style={{
                background: showEmphasisFrame ? '#FFFBEB' : 'transparent',
                border: showEmphasisFrame ? '1px dashed #FCD34D' : '1px solid transparent',
                justifyContent: isCollapsed ? 'center' : 'flex-start',
            }}
        >
            <span
                className="w-6 h-6 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold text-white"
                style={{ background: bg }}
            >
                {letter}
            </span>
            {!isCollapsed && (
                <span className="flex-1 min-w-0">
                    <span className={`block text-[11px] truncate ${emphasis ? 'text-amber-900 italic font-normal' : 'font-bold text-gray-900'}`}>
                        {primary}
                    </span>
                    <span className="block text-[9px] text-gray-500 truncate">{secondary}</span>
                </span>
            )}
        </div>
    );
}
