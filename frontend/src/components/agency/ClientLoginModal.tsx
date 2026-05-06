'use client';
import { useState, useEffect } from 'react';
import { X, Mail, Copy, Check, Send, RefreshCw, Code2 } from 'lucide-react';
import CapabilityPicker from './CapabilityPicker';
import { type Capability, type ClientLogin, PRESETS } from '@/hooks/useAgencyMode';

interface SaveResult {
    /** The login row that was just created or edited (carries the new invite token if applicable). */
    login: ClientLogin;
}

interface Props {
    open: boolean;
    onClose: () => void;
    /**
     * Save the form. Returns the resulting ClientLogin so the modal can
     * surface the invite-sent state with the active token. The caller
     * (workspace detail page) is the source of truth — it adds or updates
     * inside `useAgencyMode`.
     */
    onSave: (data: { email: string; displayName: string | null; capabilities: Capability[] }) => SaveResult | Promise<SaveResult>;
    /** Resend the invite (regenerate the token and "send" the email again). */
    onResend?: () => SaveResult | Promise<SaveResult>;
    workspaceName: string;
    editing?: ClientLogin | null;
}

export default function ClientLoginModal({ open, onClose, onSave, onResend, workspaceName, editing }: Props) {
    const [email, setEmail] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [capabilities, setCapabilities] = useState<Capability[]>([...PRESETS.read_only.caps]);
    const [submitted, setSubmitted] = useState<ClientLogin | null>(null);
    const [showDevLink, setShowDevLink] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);
    const [resending, setResending] = useState(false);

    useEffect(() => {
        if (open) {
            if (editing) {
                setEmail(editing.email);
                setDisplayName(editing.displayName ?? '');
                setCapabilities(editing.capabilities);
                setSubmitted(null);
            } else {
                setEmail('');
                setDisplayName('');
                setCapabilities([...PRESETS.read_only.caps]);
                setSubmitted(null);
            }
            setShowDevLink(false);
            setLinkCopied(false);
        }
    }, [open, editing]);

    if (!open) return null;

    const handleSubmit = async () => {
        if (!email.trim() || !email.includes('@')) return;
        const result = await onSave({
            email: email.trim().toLowerCase(),
            displayName: displayName.trim() || null,
            capabilities,
        });
        if (!editing) {
            // New login → surface invite-sent confirmation. For edits, just close.
            setSubmitted(result.login);
        } else {
            onClose();
        }
    };

    const handleResend = async () => {
        if (!onResend) return;
        setResending(true);
        try {
            const result = await onResend();
            setSubmitted(result.login);
            setShowDevLink(false);
            setLinkCopied(false);
        } finally {
            setResending(false);
        }
    };

    const magicLink = submitted?.inviteToken
        ? `${typeof window !== 'undefined' ? window.location.origin : ''}/set-password?token=${submitted.inviteToken}`
        : '';

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(magicLink);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 1500);
        } catch {/* ignore */}
    };

    const emailValid = email.includes('@') && email.includes('.');

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto" onClick={onClose}>
            <div
                className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-8 max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-start justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">
                            {editing ? 'Edit client login' : submitted ? 'Invite sent' : 'Invite a client'}
                        </h2>
                        <p className="text-xs text-gray-500 mt-0.5">
                            For workspace <span className="font-semibold text-gray-700">{workspaceName}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-md hover:bg-gray-100 transition-colors text-gray-500">
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 space-y-5 overflow-y-auto flex-1">
                    {/* Invite-sent confirmation (only for new logins after submit) */}
                    {submitted && (
                        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-5 space-y-4">
                            <div className="flex items-start gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-600 flex items-center justify-center shrink-0">
                                    <Send size={16} className="text-white" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-bold text-emerald-900 mb-0.5">
                                        Invite email sent to {submitted.email}
                                    </div>
                                    <div className="text-[11px] text-emerald-800 leading-relaxed">
                                        {submitted.displayName ? `${submitted.displayName} ` : 'They '}
                                        will receive a magic link from <span className="font-mono">noreply@superkabe.com</span> to
                                        set their password. The link expires in 7 days. After they sign in they'll land directly
                                        on this workspace — they can't see or access anything else.
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1">
                                {onResend && (
                                    <button
                                        onClick={handleResend}
                                        disabled={resending}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-semibold text-emerald-800 border border-emerald-300 bg-white hover:bg-emerald-100 transition-colors disabled:opacity-50"
                                    >
                                        <RefreshCw size={11} className={resending ? 'animate-spin' : ''} />
                                        {resending ? 'Resending…' : 'Resend invite'}
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className="inline-flex items-center px-3 py-1.5 rounded-full text-[11px] font-semibold bg-gray-900 text-white hover:bg-black transition-colors ml-auto"
                                >
                                    Done
                                </button>
                            </div>

                            {/* Dev-only: surface the actual link so the prototype is testable */}
                            <div className="pt-3 border-t border-emerald-200">
                                {!showDevLink ? (
                                    <button
                                        onClick={() => setShowDevLink(true)}
                                        className="inline-flex items-center gap-1.5 text-[10px] text-emerald-800/70 hover:text-emerald-900 transition-colors"
                                    >
                                        <Code2 size={10} />
                                        Show magic link (dev only — prototype, real email pipeline lands with backend)
                                    </button>
                                ) : (
                                    <div className="space-y-2">
                                        <div className="text-[10px] text-emerald-800/80 italic">
                                            Frontend prototype: emails aren't actually being sent yet. Use this link to test the
                                            set-password flow.
                                        </div>
                                        <div className="flex items-center gap-1.5 p-2 bg-white border border-emerald-300 rounded-md">
                                            <code className="flex-1 text-[10px] font-mono text-gray-700 truncate">{magicLink}</code>
                                            <button
                                                onClick={copyLink}
                                                className="px-2 py-1 rounded text-[9px] font-bold text-emerald-900 bg-emerald-100 hover:bg-emerald-200 transition-colors flex items-center gap-1 shrink-0"
                                            >
                                                {linkCopied ? <><Check size={9} /> Copied</> : <><Copy size={9} /> Copy</>}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Form (visible until the invite has been "sent") */}
                    {!submitted && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                                        Client email <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Mail size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="bob@acme.com"
                                            disabled={!!editing}
                                            className="w-full pl-8 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500 disabled:bg-gray-50 disabled:text-gray-500"
                                        />
                                    </div>
                                    <div className="text-[10px] text-gray-500 mt-1">
                                        The magic-link invite goes here. Same email can be used on different workspaces.
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[11px] font-bold text-gray-700 mb-1.5">
                                        Display name <span className="text-gray-400">(optional)</span>
                                    </label>
                                    <input
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        placeholder="Bob Smith"
                                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-gray-500"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[11px] font-bold text-gray-700 mb-2">
                                    Capabilities ({capabilities.length}/14 enabled)
                                </label>
                                <CapabilityPicker value={capabilities} onChange={setCapabilities} />
                            </div>
                        </>
                    )}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="flex items-center justify-between p-6 border-t border-gray-100 bg-gray-50/50">
                        <div className="text-[10px] text-gray-500 leading-relaxed max-w-xs">
                            {editing
                                ? 'Edits apply immediately. The client keeps their existing password.'
                                : 'On submit, an invite email goes to the client with a 7-day magic link to set their password.'}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={onClose}
                                className="px-4 py-2 rounded-full text-xs font-semibold text-gray-700 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!emailValid}
                                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-gray-900 text-white hover:bg-black disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                            >
                                {editing ? 'Save changes' : (
                                    <>
                                        <Send size={11} />
                                        Send invite
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
