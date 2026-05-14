'use client';

/**
 * Super LinkedIn — new campaign wizard.
 *
 * Single-channel by design: Super LinkedIn campaigns are LinkedIn-only.
 * Multi-channel sequences (LinkedIn touches mixed with email) live on
 * `/dashboard/sequencer/campaigns/new`.
 *
 * Three steps, no leaving the page:
 *   1. Basics      — name, stop-on-reply toggle
 *   2. Sender pool — pick connected LinkedIn accounts
 *   3. Sequence    — add touch points with day/hour gaps + per-step copy
 *
 * On Create we POST /api/linkedin/campaigns which writes the Campaign +
 * SequenceSteps + CampaignLinkedInSender attachments atomically and
 * returns the new campaign id; we then route the operator to
 * /campaigns/[id] where they add leads and click Launch.
 */

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, ArrowRight, Plus, Trash2, Loader2, UserCheck,
    MessageCircle, Send, Eye, UserPlus, Heart, Rocket, GripVertical,
    AlertTriangle, CheckCircle2, Linkedin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';

// ── Types ─────────────────────────────────────────────────────────────────────

type StepType =
    | 'linkedin_view_profile'
    | 'linkedin_follow'
    | 'linkedin_like_post'
    | 'linkedin_connection_request'
    | 'linkedin_message'
    | 'linkedin_inmail';

interface StepRow {
    id: string;
    step_type: StepType;
    delay_days: number;
    delay_hours: number;
    subject: string;
    body: string;
    note: string;            // for connection_request
    condition: string | null;
}

interface SenderOption {
    id: string;
    display_name: string;
    account_type: string;
    status: string;
}

interface SenderPick {
    linkedin_account_id: string;
    rotation_priority: number;
}

// ── Step-type metadata for the picker UI ──────────────────────────────────────

const STEP_META: Record<StepType, {
    label: string;
    icon: React.ReactNode;
    accent: string;
    description: string;
    needsBody: boolean;
    needsNote: boolean;
    needsSubject: boolean;
}> = {
    linkedin_view_profile: {
        label: 'View profile',
        icon: <Eye className="w-3.5 h-3.5" />,
        accent: '#F59E0B',
        description: 'Visit the lead\'s profile (warm-up — lead sees you in "viewed your profile").',
        needsBody: false, needsNote: false, needsSubject: false,
    },
    linkedin_follow: {
        label: 'Follow',
        icon: <UserPlus className="w-3.5 h-3.5" />,
        accent: '#06B6D4',
        description: 'Follow the lead. Must come before any connection request in the same sequence.',
        needsBody: false, needsNote: false, needsSubject: false,
    },
    linkedin_like_post: {
        label: 'Like a recent post',
        icon: <Heart className="w-3.5 h-3.5" />,
        accent: '#EC4899',
        description: 'React to a recent post (warm-up signal). Skips if the lead has no recent posts.',
        needsBody: false, needsNote: false, needsSubject: false,
    },
    linkedin_connection_request: {
        label: 'Connection request',
        icon: <UserCheck className="w-3.5 h-3.5" />,
        accent: '#0A66C2',
        description: 'Send a CR with an optional note. Skipped if the lead is already a 1st-degree connection.',
        needsBody: false, needsNote: true, needsSubject: false,
    },
    linkedin_message: {
        label: 'Direct message',
        icon: <MessageCircle className="w-3.5 h-3.5" />,
        accent: '#16A34A',
        description: 'Send a DM. Requires the lead to be a 1st-degree connection — schedule after a connection request.',
        needsBody: true, needsNote: false, needsSubject: false,
    },
    linkedin_inmail: {
        label: 'InMail',
        icon: <Send className="w-3.5 h-3.5" />,
        accent: '#8B5CF6',
        description: 'Send an InMail. Requires a paid tier — Premium (5-15/mo), Sales Navigator (~50/mo), or Recruiter (30-150+/mo). Credits consumed on closed profiles only. Classic / free accounts can\'t send InMail.',
        needsBody: true, needsNote: false, needsSubject: true,
    },
};

const STEP_TYPE_OPTIONS: StepType[] = [
    'linkedin_view_profile',
    'linkedin_follow',
    'linkedin_like_post',
    'linkedin_connection_request',
    'linkedin_message',
    'linkedin_inmail',
];

const STATUS_PILL: Record<string, { bg: string; fg: string }> = {
    OK:          { bg: '#DCFCE7', fg: '#15803D' },
    CONNECTING:  { bg: '#DBEAFE', fg: '#1D4ED8' },
    CREDENTIALS: { bg: '#FEF3C7', fg: '#B45309' },
    ERROR:       { bg: '#FEE2E2', fg: '#B91C1C' },
};

// ── Component ─────────────────────────────────────────────────────────────────

export default function LinkedInCampaignWizardPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('id');
    const isEditMode = !!editId;
    const [stage, setStage] = useState<1 | 2 | 3>(1);

    // Stage 1 — basics
    const [name, setName] = useState('');
    const [stopOnReply, setStopOnReply] = useState(true);

    // Stage 2 — senders
    const [allSenders, setAllSenders] = useState<SenderOption[]>([]);
    const [loadingSenders, setLoadingSenders] = useState(true);
    const [pickedSenderIds, setPickedSenderIds] = useState<string[]>([]);

    // Stage 3 — sequence
    const [steps, setSteps] = useState<StepRow[]>([
        // Sensible default: warm-up view → CR → message
        { id: cryptoId(), step_type: 'linkedin_view_profile',       delay_days: 0, delay_hours: 0, subject: '', body: '', note: '',                                                                       condition: null },
        { id: cryptoId(), step_type: 'linkedin_connection_request', delay_days: 2, delay_hours: 0, subject: '', body: '', note: 'Hi {{first_name}}, came across your profile — building something adjacent and would love to swap notes.', condition: null },
        { id: cryptoId(), step_type: 'linkedin_message',            delay_days: 3, delay_hours: 0, subject: '', body: 'Thanks for connecting, {{first_name}}! Quick thought — would love your read on...',   note: '', condition: 'if_connection' },
    ]);

    // Submit
    const [submitting, setSubmitting] = useState(false);
    const [prefillLoading, setPrefillLoading] = useState(false);

    // ── Edit-mode prefill ─────────────────────────────────────────────────────
    // When `?id=<campaign>` is in the URL, fetch the existing campaign and
    // populate every stage of the wizard from it. Handle the three step
    // shapes the controller may return:
    //   - CR steps:  step_config.note_template → form.note
    //   - DM steps:  step_config.body_template → form.body
    //   - InMail:    step_config.subject / .body → form.subject / form.body
    // Falls back to legacy body_html / subject columns when step_config
    // isn't populated yet.
    useEffect(() => {
        if (!editId) return;
        let cancelled = false;
        setPrefillLoading(true);
        apiClient<{
            campaign: { id: string; name: string; status: string; stop_on_reply: boolean };
            senders: Array<{ linkedin_account_id: string; rotation_priority: number }>;
            steps: Array<{ id: string; step_number: number; step_type: string; delay_days: number | null; delay_hours: number | null; subject: string | null; body_html?: string | null; body_text?: string | null; step_config?: Record<string, unknown> | null; condition?: string | null }>;
        }>(`/api/linkedin/campaigns/${editId}`)
            .then(d => {
                if (cancelled || !d) return;
                setName(d.campaign.name ?? '');
                setStopOnReply(d.campaign.stop_on_reply !== false);
                const senderIds = (d.senders ?? [])
                    .slice()
                    .sort((a, b) => (a.rotation_priority ?? 0) - (b.rotation_priority ?? 0))
                    .map(s => s.linkedin_account_id);
                if (senderIds.length > 0) setPickedSenderIds(senderIds);
                if (Array.isArray(d.steps) && d.steps.length > 0) {
                    const ordered = [...d.steps].sort((a, b) => a.step_number - b.step_number);
                    setSteps(ordered.map(s => {
                        const cfg = (s.step_config ?? {}) as Record<string, string | undefined>;
                        return {
                            id: s.id || cryptoId(),
                            step_type: s.step_type as StepType,
                            delay_days: s.delay_days ?? 0,
                            delay_hours: s.delay_hours ?? 0,
                            subject: (cfg.subject as string) ?? s.subject ?? '',
                            body:    (cfg.body_template as string)
                                  ?? (cfg.body as string)
                                  ?? s.body_text
                                  ?? s.body_html
                                  ?? '',
                            note: (cfg.note_template as string) ?? '',
                            condition: s.condition ?? null,
                        };
                    }));
                }
            })
            .catch(err => {
                toast.error(err?.message || 'Failed to load campaign for editing');
            })
            .finally(() => { if (!cancelled) setPrefillLoading(false); });
        return () => { cancelled = true; };
    }, [editId]);

    // ── Load connected accounts ───────────────────────────────────────────────
    const fetchSenders = useCallback(async (autoPickFirst: boolean) => {
        try {
            const r = await apiClient<{ accounts: Array<{ id: string; display_name: string; account_type: string; status: string }> }>('/api/linkedin/accounts');
            const list = (r?.accounts ?? []).map(a => ({
                id: a.id, display_name: a.display_name, account_type: a.account_type, status: a.status,
            }));
            setAllSenders(list);
            // Only auto-pick the first account on the initial load — a
            // focus-triggered refetch should preserve whatever the user
            // already selected.
            if (autoPickFirst && list.length > 0) setPickedSenderIds([list[0].id]);
        } catch {
            // ignore — keep the previous list visible
        } finally {
            setLoadingSenders(false);
        }
    }, []);

    useEffect(() => {
        void fetchSenders(true);
    }, [fetchSenders]);

    // Refetch on focus / visibility so a sender connected in the
    // Accounts page (other tab) shows up in the wizard without a full
    // reload. Subsequent refetches don't auto-pick — the wizard
    // preserves the operator's existing selection.
    useEffect(() => {
        const onFocus = () => { void fetchSenders(false); };
        const onVisibility = () => { if (document.visibilityState === 'visible') void fetchSenders(false); };
        window.addEventListener('focus', onFocus);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            window.removeEventListener('focus', onFocus);
            document.removeEventListener('visibilitychange', onVisibility);
        };
    }, [fetchSenders]);

    // ── Stage validation ──────────────────────────────────────────────────────
    const stage1Valid = name.trim().length > 0;
    const stage2Valid = pickedSenderIds.length > 0;
    const stage3Valid = steps.length > 0 && steps.every(s => {
        const meta = STEP_META[s.step_type];
        if (meta.needsNote && s.note.trim().length === 0) return false;
        if (meta.needsBody && s.body.trim().length === 0) return false;
        if (meta.needsSubject && s.subject.trim().length === 0) return false;
        return true;
    });

    // ── Step actions ──────────────────────────────────────────────────────────
    const addStep = (type: StepType) => {
        setSteps(prev => [...prev, {
            id: cryptoId(),
            step_type: type,
            delay_days: prev.length === 0 ? 0 : 2,
            delay_hours: 0,
            subject: '',
            body: type === 'linkedin_message' ? 'Hi {{first_name}}, ...' : '',
            note: type === 'linkedin_connection_request' ? 'Hi {{first_name}}, ...' : '',
            condition: (type === 'linkedin_message' || type === 'linkedin_inmail') ? 'if_connection' : null,
        }]);
    };

    const removeStep = (id: string) => setSteps(prev => prev.filter(s => s.id !== id));

    const updateStep = (id: string, patch: Partial<StepRow>) => {
        setSteps(prev => prev.map(s => s.id === id ? { ...s, ...patch } : s));
    };

    const moveStep = (id: string, dir: -1 | 1) => {
        setSteps(prev => {
            const idx = prev.findIndex(s => s.id === id);
            if (idx < 0) return prev;
            const next = idx + dir;
            if (next < 0 || next >= prev.length) return prev;
            const out = [...prev];
            [out[idx], out[next]] = [out[next], out[idx]];
            return out;
        });
    };

    // ── Submit ────────────────────────────────────────────────────────────────
    // On create, POST /api/linkedin/campaigns and route to the new
    // campaign's detail page. On edit, PATCH the existing campaign in
    // place and route back to detail. step_config carries the per-type
    // body (note_template for CR, body_template for DM, subject + body
    // for InMail) so re-reading the campaign later round-trips cleanly.
    const handleSave = useCallback(async () => {
        if (!stage1Valid || !stage2Valid || !stage3Valid) return;
        setSubmitting(true);
        try {
            const payload = {
                name: name.trim(),
                stop_on_reply: stopOnReply,
                senders: pickedSenderIds.map((sid, idx) => ({
                    linkedin_account_id: sid,
                    rotation_priority: idx,
                })),
                steps: steps.map((s, idx) => {
                    const meta = STEP_META[s.step_type];
                    const step_config: Record<string, unknown> = {};
                    if (meta.needsNote)    step_config.note_template = s.note;
                    if (meta.needsBody && s.step_type === 'linkedin_message') step_config.body_template = s.body;
                    if (s.step_type === 'linkedin_inmail') {
                        if (meta.needsSubject) step_config.subject = s.subject;
                        if (meta.needsBody)    step_config.body    = s.body;
                    }
                    return {
                        step_number: idx + 1,
                        step_type: s.step_type,
                        delay_days: s.delay_days,
                        delay_hours: s.delay_hours,
                        subject: meta.needsSubject ? s.subject : undefined,
                        body_html: meta.needsBody ? s.body : undefined,
                        condition: s.condition,
                        step_config,
                    };
                }),
            };
            if (isEditMode && editId) {
                await apiClient(`/api/linkedin/campaigns/${editId}`, {
                    method: 'PATCH',
                    body: JSON.stringify(payload),
                });
                toast.success('Campaign updated');
                router.push(`/dashboard/linkedin/campaigns/${editId}`);
            } else {
                const r = await apiClient<{ id: string; name: string }>('/api/linkedin/campaigns', {
                    method: 'POST',
                    body: JSON.stringify(payload),
                });
                toast.success(`Campaign "${r.name}" created`);
                router.push(`/dashboard/linkedin/campaigns/${r.id}`);
            }
        } catch (err: any) {
            toast.error(err?.message || (isEditMode ? 'Failed to update campaign' : 'Failed to create campaign'));
        } finally {
            setSubmitting(false);
        }
    }, [stage1Valid, stage2Valid, stage3Valid, name, stopOnReply, pickedSenderIds, steps, router, isEditMode, editId]);

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <Link
                    href="/dashboard/linkedin/campaigns"
                    className="inline-flex items-center gap-1 text-[11px] text-gray-500 hover:text-gray-900 mb-2 no-underline"
                >
                    <ArrowLeft size={11} /> Back to campaigns
                </Link>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Linkedin size={18} strokeWidth={1.75} className="text-[#0A66C2]" />
                    {isEditMode ? 'Edit LinkedIn campaign' : 'New LinkedIn campaign'}
                    {prefillLoading && <Loader2 size={14} className="animate-spin text-gray-400" />}
                </h1>
                <p className="text-xs text-gray-500 mt-0.5">
                    LinkedIn-only sequence. For mixed email + LinkedIn campaigns, use the <Link href="/dashboard/sequencer/campaigns/new" className="underline">Super Sequencer wizard</Link>.
                </p>
            </div>

            {/* Step indicator */}
            <div className="premium-card flex items-center justify-between !py-2.5">
                {([1, 2, 3] as const).map(s => (
                    <button
                        key={s}
                        onClick={() => setStage(s)}
                        disabled={
                            (s === 2 && !stage1Valid) ||
                            (s === 3 && (!stage1Valid || !stage2Valid))
                        }
                        className="flex-1 flex items-center gap-2 px-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        <div
                            className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0"
                            style={{
                                background: stage === s ? '#0A66C2' : (stage > s ? '#16A34A' : '#F3F4F6'),
                                color: stage === s || stage > s ? '#FFFFFF' : '#6B7280',
                            }}
                        >
                            {stage > s ? <CheckCircle2 className="w-3 h-3" /> : s}
                        </div>
                        <div className="text-left">
                            <div className="text-[11px] font-semibold text-gray-900">
                                {s === 1 ? 'Basics' : s === 2 ? 'Sender pool' : 'Sequence'}
                            </div>
                            <div className="text-[10px] text-gray-500">
                                {s === 1 ? 'Name + reply behaviour'
                                  : s === 2 ? `${pickedSenderIds.length} of ${allSenders.length} accounts picked`
                                  : `${steps.length} step${steps.length === 1 ? '' : 's'}`}
                            </div>
                        </div>
                    </button>
                ))}
            </div>

            {/* Stage 1 — Basics */}
            {stage === 1 && (
                <div className="premium-card flex flex-col gap-4">
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1.5">Campaign name *</label>
                        <input
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="e.g. Founders — Series A SaaS (LinkedIn-only)"
                            className="w-full px-3 py-2 text-sm rounded-lg outline-none bg-white"
                            style={{ border: '1px solid #D1CBC5' }}
                        />
                        <p className="text-[11px] text-gray-500 mt-1">Operators see this on the campaigns list and the schema page.</p>
                    </div>
                    <label className="flex items-start gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={stopOnReply}
                            onChange={e => setStopOnReply(e.target.checked)}
                            className="mt-0.5"
                        />
                        <div>
                            <div className="text-sm font-semibold text-gray-900">Pause this lead in this campaign on reply</div>
                            <div className="text-[11px] text-gray-500 mt-0.5">
                                When the lead replies to any DM in this sequence, the lead’s remaining steps stop. Cross-channel suppression (email-side pause) is governed by the Workspace setting on the LinkedIn Settings page.
                            </div>
                        </div>
                    </label>
                    <div className="flex justify-end">
                        <button
                            onClick={() => setStage(2)}
                            disabled={!stage1Valid}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next: Sender pool <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Stage 2 — Senders */}
            {stage === 2 && (
                <div className="premium-card flex flex-col gap-3">
                    <div>
                        <h2 className="text-sm font-semibold text-gray-900 mb-1">Pick the LinkedIn accounts that will send</h2>
                        <p className="text-[11px] text-gray-500">
                            Each account contributes its daily invite/message capacity to this campaign. Workspace caps and working-hours are enforced at dispatch time.
                        </p>
                    </div>

                    {loadingSenders ? (
                        <div className="flex items-center justify-center py-6 text-xs text-gray-500">
                            <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" /> Loading accounts…
                        </div>
                    ) : allSenders.length === 0 ? (
                        <div className="rounded-lg p-4 text-center" style={{ background: '#FEF3C7', border: '1px solid #FDE68A' }}>
                            <AlertTriangle className="w-5 h-5 text-amber-600 mx-auto mb-1" />
                            <p className="text-xs font-semibold text-amber-900 mb-2">No LinkedIn accounts connected yet</p>
                            <Link
                                href="/dashboard/linkedin/accounts"
                                className="inline-block px-3 py-1.5 rounded-md bg-amber-600 text-white text-[11px] font-semibold no-underline"
                            >
                                Connect an account
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {allSenders.map(s => {
                                const isPicked = pickedSenderIds.includes(s.id);
                                const status = STATUS_PILL[s.status] ?? { bg: '#F3F4F6', fg: '#374151' };
                                return (
                                    <button
                                        key={s.id}
                                        onClick={() => setPickedSenderIds(prev => prev.includes(s.id) ? prev.filter(x => x !== s.id) : [...prev, s.id])}
                                        className="text-left rounded-lg px-3 py-2.5 cursor-pointer transition-colors"
                                        style={{
                                            background: isPicked ? '#EFF6FF' : '#FFFFFF',
                                            border: isPicked ? '2px solid #0A66C2' : '1px solid #E8E3DC',
                                        }}
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0">
                                                <div className="text-sm font-semibold text-gray-900 truncate">{s.display_name}</div>
                                                <div className="text-[10px] text-gray-500">{s.account_type.replace(/_/g, ' ')}</div>
                                            </div>
                                            <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-semibold shrink-0" style={{ background: status.bg, color: status.fg }}>
                                                {s.status}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex justify-between items-center pt-1">
                        <button
                            onClick={() => setStage(1)}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                        <button
                            onClick={() => setStage(3)}
                            disabled={!stage2Valid}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-xs font-semibold hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next: Sequence <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Stage 3 — Sequence */}
            {stage === 3 && (
                <div className="flex flex-col gap-3">
                    <div className="premium-card">
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <div>
                                <h2 className="text-sm font-semibold text-gray-900">Sequence steps</h2>
                                <p className="text-[11px] text-gray-500">Touch points run in order. Each waits the configured delay after the previous step before firing.</p>
                            </div>
                            <span className="text-[11px] text-gray-500">{steps.length} step{steps.length === 1 ? '' : 's'}</span>
                        </div>

                        <div className="flex flex-col gap-2">
                            {steps.map((s, idx) => {
                                const meta = STEP_META[s.step_type];
                                return (
                                    <div
                                        key={s.id}
                                        className="rounded-lg p-3 flex flex-col gap-2"
                                        style={{ border: '1px solid #E8E3DC', background: '#FFFFFF' }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <div className="flex flex-col gap-0.5">
                                                <button
                                                    onClick={() => moveStep(s.id, -1)}
                                                    disabled={idx === 0}
                                                    className="text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer"
                                                >▲</button>
                                                <GripVertical size={11} className="text-gray-300" />
                                                <button
                                                    onClick={() => moveStep(s.id, 1)}
                                                    disabled={idx === steps.length - 1}
                                                    className="text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-[10px] cursor-pointer"
                                                >▼</button>
                                            </div>
                                            <div className="w-7 h-7 rounded-md bg-gray-100 flex items-center justify-center text-[11px] font-bold text-gray-700 shrink-0">
                                                {idx + 1}
                                            </div>
                                            <select
                                                value={s.step_type}
                                                onChange={e => updateStep(s.id, { step_type: e.target.value as StepType })}
                                                className="px-2 py-1.5 text-xs rounded-md outline-none bg-white cursor-pointer"
                                                style={{ border: '1px solid #D1CBC5' }}
                                            >
                                                {STEP_TYPE_OPTIONS.map(t => (
                                                    <option key={t} value={t}>{STEP_META[t].label}</option>
                                                ))}
                                            </select>
                                            <div className="flex items-center gap-1 px-2 py-1 rounded-md" style={{ background: `${meta.accent}15`, color: meta.accent }}>
                                                {meta.icon}
                                                <span className="text-[11px] font-semibold">{meta.label}</span>
                                            </div>
                                            <div className="flex items-center gap-1 ml-auto text-[11px] text-gray-600">
                                                <span>Wait</span>
                                                <input
                                                    type="number" min={0} max={60}
                                                    value={s.delay_days}
                                                    onChange={e => updateStep(s.id, { delay_days: Math.max(0, Number(e.target.value) || 0) })}
                                                    className="w-12 px-1.5 py-1 text-xs rounded-md outline-none bg-white text-center"
                                                    style={{ border: '1px solid #D1CBC5' }}
                                                />
                                                <span>d</span>
                                                <input
                                                    type="number" min={0} max={23}
                                                    value={s.delay_hours}
                                                    onChange={e => updateStep(s.id, { delay_hours: Math.max(0, Number(e.target.value) || 0) })}
                                                    className="w-12 px-1.5 py-1 text-xs rounded-md outline-none bg-white text-center"
                                                    style={{ border: '1px solid #D1CBC5' }}
                                                />
                                                <span>h after previous</span>
                                            </div>
                                            <button
                                                onClick={() => removeStep(s.id)}
                                                className="p-1.5 rounded-md hover:bg-rose-50 text-gray-400 hover:text-rose-600 cursor-pointer"
                                                title="Remove step"
                                            >
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                        </div>

                                        <p className="text-[11px] text-gray-500 leading-relaxed pl-12">{meta.description}</p>

                                        {meta.needsNote && (
                                            <div className="pl-12">
                                                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Connection note ({s.note.length} / 300 chars — LinkedIn limit)</label>
                                                <textarea
                                                    value={s.note}
                                                    maxLength={300}
                                                    onChange={e => updateStep(s.id, { note: e.target.value })}
                                                    rows={2}
                                                    placeholder="Hi {{first_name}}, ..."
                                                    className="w-full px-2 py-1.5 text-xs rounded-md outline-none bg-white resize-y"
                                                    style={{ border: '1px solid #D1CBC5' }}
                                                />
                                            </div>
                                        )}

                                        {meta.needsSubject && (
                                            <div className="pl-12">
                                                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Subject</label>
                                                <input
                                                    value={s.subject}
                                                    onChange={e => updateStep(s.id, { subject: e.target.value })}
                                                    className="w-full px-2 py-1.5 text-xs rounded-md outline-none bg-white"
                                                    style={{ border: '1px solid #D1CBC5' }}
                                                    placeholder="Following up from your post on..."
                                                />
                                            </div>
                                        )}

                                        {meta.needsBody && (
                                            <div className="pl-12">
                                                <label className="block text-[10px] font-semibold text-gray-600 mb-1">Message body</label>
                                                <textarea
                                                    value={s.body}
                                                    onChange={e => updateStep(s.id, { body: e.target.value })}
                                                    rows={3}
                                                    placeholder="Hi {{first_name}}, ..."
                                                    className="w-full px-2 py-1.5 text-xs rounded-md outline-none bg-white resize-y"
                                                    style={{ border: '1px solid #D1CBC5' }}
                                                />
                                                {s.condition === 'if_connection' && (
                                                    <p className="text-[10px] text-gray-500 mt-1">
                                                        Only fires when the lead has accepted a prior connection request.
                                                    </p>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}

                            {/* Add step row */}
                            <div className="rounded-lg p-3 flex items-center gap-2 flex-wrap" style={{ border: '1px dashed #D1CBC5', background: '#FAFAF8' }}>
                                <Plus className="w-4 h-4 text-gray-500 shrink-0" />
                                <span className="text-[11px] font-semibold text-gray-600 mr-1">Add step:</span>
                                {STEP_TYPE_OPTIONS.map(t => {
                                    const m = STEP_META[t];
                                    return (
                                        <button
                                            key={t}
                                            onClick={() => addStep(t)}
                                            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold cursor-pointer hover:bg-white"
                                            style={{ border: '1px solid #D1CBC5', color: m.accent }}
                                        >
                                            {m.icon}
                                            {m.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="premium-card flex items-center justify-between">
                        <button
                            onClick={() => setStage(2)}
                            className="flex items-center gap-1 text-xs font-semibold text-gray-600 hover:text-gray-900 cursor-pointer"
                        >
                            <ArrowLeft className="w-3.5 h-3.5" /> Back
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={!stage3Valid || submitting}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Rocket className="w-3.5 h-3.5" />}
                            {submitting
                                ? (isEditMode ? 'Saving…' : 'Creating…')
                                : (isEditMode ? 'Save changes' : 'Create campaign')}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Small id helper — crypto.randomUUID() is available in modern browsers.
function cryptoId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
    return Math.random().toString(36).slice(2);
}
