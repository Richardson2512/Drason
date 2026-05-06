'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, Building2, Mail, Plus, Trash2, Edit3, KeyRound, Clock,
    AlertTriangle, MoreHorizontal, Save, Pencil, Power, Check, Send, Sprout
} from 'lucide-react';
import { useAgencyMode, type ClientLogin, CAPABILITY_META } from '@/hooks/useAgencyMode';
import ClientLoginModal from '@/components/agency/ClientLoginModal';

const STATUS_STYLE: Record<ClientLogin['status'], { bg: string; text: string; label: string }> = {
    pending_invite: { bg: '#FFFBEB', text: '#92400E', label: 'Invite pending' },
    active:         { bg: '#ECFDF5', text: '#065F46', label: 'Active' },
    disabled:       { bg: '#F3F4F6', text: '#374151', label: 'Disabled' },
};

export default function WorkspaceDetailPage() {
    const params = useParams<{ workspaceId: string }>();
    const router = useRouter();
    const {
        workspaces, updateWorkspace, deleteWorkspace,
        addClientLogin, updateClientLogin, deleteClientLogin, regenerateInvite,
        enabled, isEligible,
    } = useAgencyMode();

    const workspace = workspaces.find((w) => w.id === params.workspaceId);

    const [editingProfile, setEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState(workspace?.name ?? '');
    const [profileClient, setProfileClient] = useState(workspace?.clientCompany ?? '');

    const [modalOpen, setModalOpen] = useState(false);
    /** ID of the most recently created login — drives the modal's onResend wiring. */
    const [lastCreatedLoginId, setLastCreatedLoginId] = useState<string | null>(null);
    const [editingLogin, setEditingLogin] = useState<ClientLogin | null>(null);
    const [confirmDelete, setConfirmDelete] = useState<{ kind: 'workspace' } | { kind: 'login'; login: ClientLogin } | null>(null);
    const [actionMenu, setActionMenu] = useState<string | null>(null);
    const [toast, setToast] = useState<string | null>(null);

    if (!isEligible) {
        return (
            <div className="px-6 py-12 max-w-2xl mx-auto text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-2">Agency Mode requires Scale or Enterprise</h1>
                <Link href="/pricing" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors no-underline">
                    See pricing
                </Link>
            </div>
        );
    }
    if (!enabled) {
        return (
            <div className="px-6 py-12 max-w-2xl mx-auto text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-2">Agency Mode is off</h1>
                <Link href="/dashboard/profile" className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-gray-900 text-white text-xs font-semibold hover:bg-black transition-colors no-underline">
                    Open Profile
                </Link>
            </div>
        );
    }
    if (!workspace) {
        return (
            <div className="px-6 py-12 max-w-2xl mx-auto text-center">
                <h1 className="text-xl font-bold text-gray-900 mb-2">Workspace not found</h1>
                <Link href="/dashboard/agency" className="text-blue-600 hover:underline text-sm">Back to fleet overview</Link>
            </div>
        );
    }

    const startEditProfile = () => {
        setProfileName(workspace.name);
        setProfileClient(workspace.clientCompany ?? '');
        setEditingProfile(true);
    };

    const saveProfile = () => {
        updateWorkspace(workspace.id, {
            name: profileName.trim() || workspace.name,
            clientCompany: profileClient.trim() || null,
        });
        setEditingProfile(false);
    };

    const handleSaveLogin = async (data: { email: string; displayName: string | null; capabilities: typeof workspace.clientLogins[number]['capabilities'] }) => {
        if (editingLogin) {
            updateClientLogin(workspace.id, editingLogin.id, data);
            const updated = { ...editingLogin, ...data };
            return { login: updated };
        }
        const created = await addClientLogin(workspace.id, data);
        setLastCreatedLoginId(created.id);
        return { login: created };
    };

    const fireToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3500);
    };

    const handleResendInvite = async (loginId: string) => {
        const updated = await regenerateInvite(workspace.id, loginId);
        if (!updated) {
            // Login was deleted between renders — fall back gracefully.
            return { login: editingLogin! };
        }
        return { login: updated };
    };

    const handleDeleteWorkspace = () => {
        deleteWorkspace(workspace.id);
        router.push('/dashboard/agency');
    };

    return (
        <div className="px-6 py-6">
            {/* Breadcrumb */}
            <div className="mb-4">
                <Link
                    href="/dashboard/agency"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-gray-500 hover:text-gray-900 transition-colors no-underline"
                >
                    <ArrowLeft size={12} />
                    Fleet overview
                </Link>
            </div>

            {/* Header / profile card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
                <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                        <div className="w-12 h-12 rounded-xl bg-gray-900 flex items-center justify-center text-white shrink-0">
                            <Building2 size={20} />
                        </div>
                        <div className="flex-1 min-w-0">
                            {editingProfile ? (
                                <div className="space-y-2">
                                    <input
                                        value={profileName}
                                        onChange={(e) => setProfileName(e.target.value)}
                                        placeholder="Workspace name"
                                        className="w-full px-2.5 py-1.5 text-sm font-bold border border-gray-200 rounded-md focus:outline-none focus:border-gray-500"
                                    />
                                    <input
                                        value={profileClient}
                                        onChange={(e) => setProfileClient(e.target.value)}
                                        placeholder="Client company (optional)"
                                        className="w-full px-2.5 py-1.5 text-xs border border-gray-200 rounded-md focus:outline-none focus:border-gray-500"
                                    />
                                </div>
                            ) : (
                                <>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h1 className="text-xl font-bold text-gray-900 truncate">{workspace.name}</h1>
                                        {workspace.id === 'ws-default' && (
                                            <span
                                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-indigo-50 border border-indigo-200 text-indigo-700"
                                                title="The seed workspace is created automatically when Agency Mode is turned on. It can't be deleted, but you can rename it and assign client logins to it like any other workspace."
                                            >
                                                <Sprout size={10} />
                                                Seed
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-gray-500 truncate">
                                        {workspace.clientCompany || 'No client company set'}
                                    </p>
                                </>
                            )}
                        </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                        {editingProfile ? (
                            <>
                                <button
                                    onClick={() => setEditingProfile(false)}
                                    className="px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={saveProfile}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-gray-900 text-white hover:bg-black transition-colors"
                                >
                                    <Save size={11} />
                                    Save
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={startEditProfile}
                                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
                                >
                                    <Pencil size={11} />
                                    Edit profile
                                </button>
                                <button
                                    onClick={() => workspace.id !== 'ws-default' && setConfirmDelete({ kind: 'workspace' })}
                                    disabled={workspace.id === 'ws-default'}
                                    title={workspace.id === 'ws-default' ? "The seed workspace can't be deleted. Rename it or create new workspaces alongside it." : 'Delete this workspace and all its client logins'}
                                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-colors ${
                                        workspace.id === 'ws-default'
                                            ? 'text-gray-400 border border-gray-200 bg-gray-50 cursor-not-allowed'
                                            : 'text-red-700 border border-red-200 hover:bg-red-50 cursor-pointer'
                                    }`}
                                >
                                    <Trash2 size={11} />
                                    Delete
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* At-a-glance stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 pt-4 border-t border-gray-100">
                    <Stat label="Mailboxes" value={workspace.mailboxCount} />
                    <Stat label="Active campaigns" value={workspace.activeCampaigns} />
                    <Stat label="Sends 30d" value={workspace.sends30d.toLocaleString()} />
                    <Stat label="Bounce rate" value={`${(workspace.bounceRate * 100).toFixed(2)}%`} />
                </div>
            </div>

            {/* Client logins section */}
            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-bold text-gray-900">Client logins</h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                        Each login is hard-locked to this workspace and inherits the capabilities you grant.
                    </p>
                </div>
                <button
                    onClick={() => { setEditingLogin(null); setModalOpen(true); }}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-full bg-gray-900 text-white text-[11px] font-semibold hover:bg-black transition-colors"
                >
                    <Plus size={11} />
                    Create login
                </button>
            </div>

            {workspace.clientLogins.length === 0 ? (
                <div className="bg-white rounded-2xl border-2 border-dashed border-gray-200 p-8 text-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                        <KeyRound size={20} className="text-gray-400" />
                    </div>
                    <h3 className="text-sm font-bold text-gray-900 mb-1">No client logins yet</h3>
                    <p className="text-[11px] text-gray-500 mb-4 max-w-md mx-auto leading-relaxed">
                        Create a login to give your client access to this workspace. You decide exactly what they can see and do.
                    </p>
                    <button
                        onClick={() => { setEditingLogin(null); setModalOpen(true); }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gray-900 text-white text-[11px] font-semibold hover:bg-black transition-colors"
                    >
                        <Plus size={11} />
                        Create the first login
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
                    {workspace.clientLogins.map((login, idx) => {
                        const status = STATUS_STYLE[login.status];
                        const capLabels = login.capabilities.length === 14
                            ? 'Full access'
                            : login.capabilities.length === 0
                                ? 'No access (display only)'
                                : `${login.capabilities.length} capabilit${login.capabilities.length === 1 ? 'y' : 'ies'}`;
                        const isMenuOpen = actionMenu === login.id;

                        return (
                            <div key={login.id} className={`p-4 flex items-start gap-3 hover:bg-gray-50/50 transition-colors ${idx > 0 ? 'border-t border-gray-100' : ''}`}>
                                <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-700 font-bold text-xs shrink-0">
                                    {(login.displayName || login.email).slice(0, 1).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="text-sm font-semibold text-gray-900 truncate">
                                            {login.displayName || login.email}
                                        </span>
                                        <span
                                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider"
                                            style={{ background: status.bg, color: status.text }}
                                        >
                                            {status.label}
                                        </span>
                                    </div>
                                    {login.displayName && (
                                        <div className="flex items-center gap-1 text-[11px] text-gray-500 truncate">
                                            <Mail size={10} />
                                            {login.email}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 mt-1.5 text-[10px] text-gray-500">
                                        <span className="font-semibold text-gray-700">{capLabels}</span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={9} />
                                            {login.lastSeenAt ? `Seen ${new Date(login.lastSeenAt).toLocaleDateString()}` : 'Never logged in'}
                                        </span>
                                    </div>
                                    {/* Capability chips */}
                                    {login.capabilities.length > 0 && login.capabilities.length < 14 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {login.capabilities.slice(0, 5).map((c) => (
                                                <span key={c} className="px-2 py-0.5 rounded-full text-[9px] bg-gray-100 text-gray-600">
                                                    {CAPABILITY_META.find((m) => m.key === c)?.label ?? c}
                                                </span>
                                            ))}
                                            {login.capabilities.length > 5 && (
                                                <span className="px-2 py-0.5 rounded-full text-[9px] bg-gray-100 text-gray-500">
                                                    +{login.capabilities.length - 5} more
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                                <div className="relative">
                                    <button
                                        onClick={() => setActionMenu(isMenuOpen ? null : login.id)}
                                        className="p-1.5 rounded-md hover:bg-gray-100 text-gray-500 transition-colors"
                                    >
                                        <MoreHorizontal size={14} />
                                    </button>
                                    {isMenuOpen && (
                                        <>
                                            <div className="fixed inset-0 z-40" onClick={() => setActionMenu(null)} />
                                            <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden min-w-[180px]">
                                                <button
                                                    onClick={() => { setEditingLogin(login); setModalOpen(true); setActionMenu(null); }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                                >
                                                    <Edit3 size={11} />
                                                    Edit capabilities
                                                </button>
                                                {login.status === 'pending_invite' && (
                                                    <button
                                                        onClick={() => {
                                                            handleResendInvite(login.id);
                                                            fireToast(`Invite resent to ${login.email}`);
                                                            setActionMenu(null);
                                                        }}
                                                        className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                                    >
                                                        <Send size={11} />
                                                        Resend invite
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => {
                                                        updateClientLogin(workspace.id, login.id, { status: login.status === 'disabled' ? 'active' : 'disabled' });
                                                        setActionMenu(null);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-gray-700 hover:bg-gray-50 transition-colors text-left"
                                                >
                                                    <Power size={11} />
                                                    {login.status === 'disabled' ? 'Re-enable' : 'Disable'}
                                                </button>
                                                <div className="h-px bg-gray-100" />
                                                <button
                                                    onClick={() => { setConfirmDelete({ kind: 'login', login }); setActionMenu(null); }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-[11px] text-red-600 hover:bg-red-50 transition-colors text-left"
                                                >
                                                    <Trash2 size={11} />
                                                    Remove login
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Modal */}
            <ClientLoginModal
                open={modalOpen}
                onClose={() => { setModalOpen(false); setEditingLogin(null); setLastCreatedLoginId(null); }}
                onSave={handleSaveLogin}
                onResend={lastCreatedLoginId ? () => handleResendInvite(lastCreatedLoginId) : undefined}
                workspaceName={workspace.name}
                editing={editingLogin}
            />

            {/* Toast */}
            {toast && (
                <div className="fixed bottom-6 right-6 z-50 max-w-sm rounded-xl bg-gray-900 text-white px-4 py-3 shadow-2xl text-xs font-medium animate-in fade-in slide-in-from-bottom-2">
                    {toast}
                </div>
            )}

            {/* Delete confirm */}
            {confirmDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setConfirmDelete(null)}>
                    <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-start gap-3 mb-4">
                            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                                <AlertTriangle size={18} className="text-red-700" />
                            </div>
                            <div>
                                <h3 className="text-base font-bold text-gray-900 mb-1">
                                    {confirmDelete.kind === 'workspace' ? `Delete "${workspace.name}"?` : 'Remove this client login?'}
                                </h3>
                                <p className="text-xs text-gray-600 leading-relaxed">
                                    {confirmDelete.kind === 'workspace'
                                        ? 'This permanently removes the workspace and all its client logins. Mailboxes, campaigns, and analytics under this workspace will no longer be accessible.'
                                        : `${confirmDelete.login.displayName || confirmDelete.login.email} will lose access immediately. You can re-create the login later if needed.`}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2 justify-end">
                            <button
                                onClick={() => setConfirmDelete(null)}
                                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    if (confirmDelete.kind === 'workspace') handleDeleteWorkspace();
                                    else deleteClientLogin(workspace.id, confirmDelete.login.id);
                                    setConfirmDelete(null);
                                }}
                                className="px-4 py-2 rounded-full text-xs font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors"
                            >
                                {confirmDelete.kind === 'workspace' ? 'Delete workspace' : 'Remove login'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function Stat({ label, value }: { label: string; value: string | number }) {
    return (
        <div>
            <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{label}</div>
            <div className="text-sm font-bold text-gray-900">{value}</div>
        </div>
    );
}
