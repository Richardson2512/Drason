'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Mail, Building2, Briefcase, Globe, Phone, Linkedin, Loader2, Calendar, Activity, StickyNote, Check, Tag as TagIcon, Pencil, X, User as UserIcon } from 'lucide-react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import TagPicker, { TagPillList } from '@/components/sequencer/TagPicker';
import type { TagItem } from '@/components/sequencer/TagManagerModal';

interface ContactDetail {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
    full_name: string | null;
    company: string | null;
    website: string | null;
    title: string | null;
    persona: string | null;
    phone: string | null;
    linkedin_url: string | null;
    source: string | null;
    status: string;
    health_classification: string;
    validation_status: string | null;
    validation_score: number | null;
    validation_source: string | null;
    validated_at: string | null;
    is_catch_all: boolean | null;
    is_disposable: boolean | null;
    emails_sent: number;
    emails_opened: number;
    emails_clicked: number;
    emails_replied: number;
    last_activity_at: string | null;
    bounced: boolean;
    bounced_at: string | null;
    unsubscribed_at: string | null;
    unsubscribed_reason: string | null;
    notes: string | null;
    tags: Array<{ id: string; name: string; color: string | null }>;
    created_at: string;
    updated_at: string;
}

interface Enrollment {
    campaign_id: string;
    campaign_name: string;
    campaign_status: string | null;
    status: string;
    current_step: number | null;
    created_at: string;
}

export default function ContactDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = (params?.id as string) || '';
    const [contact, setContact] = useState<ContactDetail | null>(null);
    const [history, setHistory] = useState<Enrollment[]>([]);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [notesDraft, setNotesDraft] = useState('');
    const [savingNotes, setSavingNotes] = useState(false);
    const [notesDirty, setNotesDirty] = useState(false);
    const [editing, setEditing] = useState(false);
    const [savingDetails, setSavingDetails] = useState(false);
    const [drafts, setDrafts] = useState({
        first_name: '',
        last_name: '',
        company: '',
        title: '',
        website: '',
        phone: '',
        linkedin_url: '',
    });
    const [allTags, setAllTags] = useState<TagItem[]>([]);

    const refreshTags = async () => {
        try {
            const res = await apiClient<{ tags: TagItem[] }>('/api/sequencer/tags');
            setAllTags(res?.tags || []);
        } catch { /* */ }
    };

    useEffect(() => { refreshTags(); }, []);

    const updateTags = async (tagIds: string[]) => {
        if (!contact) return;
        // Optimistic update
        const newTags = allTags.filter(t => tagIds.includes(t.id))
            .map(t => ({ id: t.id, name: t.name, color: t.color }));
        setContact(c => c ? { ...c, tags: newTags } : c);
        try {
            await apiClient(`/api/sequencer/contacts/${contact.id}/tags`, {
                method: 'PUT',
                body: JSON.stringify({ tagIds }),
            });
        } catch {
            // Revert on failure — refetch the canonical state
            try {
                const res = await apiClient<any>(`/api/sequencer/contacts/${contact.id}`);
                setContact(res?.contact || contact);
            } catch { /* */ }
        }
    };

    useEffect(() => {
        if (!id) return;
        let alive = true;
        (async () => {
            setLoading(true);
            try {
                const res = await apiClient<any>(`/api/sequencer/contacts/${id}`);
                if (!alive) return;
                setContact(res?.contact || null);
                setHistory(res?.enrollment_history || []);
                setNotesDraft(res?.contact?.notes || '');
                setNotesDirty(false);
                const c = res?.contact;
                if (c) {
                    setDrafts({
                        first_name: c.first_name || '',
                        last_name: c.last_name || '',
                        company: c.company || '',
                        title: c.title || '',
                        website: c.website || '',
                        phone: c.phone || '',
                        linkedin_url: c.linkedin_url || '',
                    });
                }
                setEditing(false);
            } catch {
                if (alive) setNotFound(true);
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [id]);

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center py-16">
                <Loader2 size={20} className="text-gray-400 animate-spin" />
            </div>
        );
    }

    // Compute which draft fields differ from the canonical contact. Only the
    // dirty ones are sent on Save so we don't churn server-side timestamps
    // for fields the user didn't touch.
    const dirtyFields = (Object.keys(drafts) as Array<keyof typeof drafts>).filter(
        (k) => (((contact as any)?.[k] as string | null | undefined) || '') !== drafts[k],
    );
    const detailsDirty = dirtyFields.length > 0;

    const enterEditMode = () => {
        if (!contact) return;
        setDrafts({
            first_name: contact.first_name || '',
            last_name: contact.last_name || '',
            company: contact.company || '',
            title: contact.title || '',
            website: contact.website || '',
            phone: contact.phone || '',
            linkedin_url: contact.linkedin_url || '',
        });
        setEditing(true);
    };

    const cancelEdit = () => {
        if (!contact) return;
        setDrafts({
            first_name: contact.first_name || '',
            last_name: contact.last_name || '',
            company: contact.company || '',
            title: contact.title || '',
            website: contact.website || '',
            phone: contact.phone || '',
            linkedin_url: contact.linkedin_url || '',
        });
        setEditing(false);
    };

    const saveDetails = async () => {
        if (!contact || savingDetails) return;
        if (!detailsDirty) {
            setEditing(false);
            return;
        }
        setSavingDetails(true);
        try {
            const body: Record<string, string> = {};
            for (const k of dirtyFields) body[k] = drafts[k];
            await apiClient(`/api/sequencer/contacts/${contact.id}`, {
                method: 'PATCH',
                body: JSON.stringify(body),
            });
            setContact((c) => {
                if (!c) return c;
                const next: any = { ...c };
                for (const k of dirtyFields) {
                    next[k] = drafts[k].trim() ? drafts[k].trim() : null;
                }
                // Backend re-derives full_name from first/last when those change
                // and full_name itself wasn't sent — mirror that locally.
                if (
                    !Object.prototype.hasOwnProperty.call(body, 'full_name') &&
                    (Object.prototype.hasOwnProperty.call(body, 'first_name') ||
                        Object.prototype.hasOwnProperty.call(body, 'last_name'))
                ) {
                    const joined = [next.first_name, next.last_name].filter(Boolean).join(' ').trim();
                    next.full_name = joined || null;
                }
                return next;
            });
            setEditing(false);
            toast.success('Contact updated');
        } catch {
            // apiClient auto-toasts
        } finally {
            setSavingDetails(false);
        }
    };

    const saveNotes = async () => {
        if (!contact || savingNotes) return;
        setSavingNotes(true);
        try {
            await apiClient(`/api/sequencer/contacts/${contact.id}/notes`, {
                method: 'PATCH',
                body: JSON.stringify({ notes: notesDraft }),
            });
            setNotesDirty(false);
            setContact(c => c ? { ...c, notes: notesDraft.trim() ? notesDraft : null } : c);
            toast.success('Notes saved');
        } catch {
            // apiClient auto-toasts
        } finally {
            setSavingNotes(false);
        }
    };

    if (notFound || !contact) {
        return (
            <div className="p-4">
                <button onClick={() => router.back()} className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 mb-4">
                    <ArrowLeft size={12} /> Back
                </button>
                <div className="premium-card p-8 text-center">
                    <h1 className="text-sm font-bold text-gray-900 mb-1">Contact not found</h1>
                    <p className="text-xs text-gray-500">It may have been deleted or you don&apos;t have access.</p>
                </div>
            </div>
        );
    }

    const name = [contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.full_name || contact.email;

    return (
        <div className="p-4 flex flex-col gap-4">
            <Link href="/dashboard/sequencer/contacts" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-900 w-fit">
                <ArrowLeft size={12} /> Back to contacts
            </Link>

            {/* Header card */}
            <div className="premium-card p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                        <p className="text-xs text-gray-500 mt-0.5">{contact.email}</p>
                        {(contact.company || contact.title) && (
                            <p className="text-xs text-gray-600 mt-2">
                                {contact.title}{contact.title && contact.company ? ' · ' : ''}{contact.company}
                            </p>
                        )}
                        {/* Tags row — always visible (including empty), so the
                            "+ Tag" button is one click away. */}
                        <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                            <TagIcon size={11} className="text-gray-400" />
                            <TagPillList
                                tags={contact.tags || []}
                                onRemove={(tid) => updateTags((contact.tags || []).filter(t => t.id !== tid).map(t => t.id))}
                            />
                            <TagPicker
                                allTags={allTags}
                                selectedIds={(contact.tags || []).map(t => t.id)}
                                onChange={(next) => updateTags(next)}
                                onTagCreated={refreshTags}
                                align="left"
                            />
                        </div>
                    </div>
                    <div className="flex flex-col gap-1.5 items-end shrink-0">
                        <StatusBadge status={contact.status} />
                        <ValidationBadge status={contact.validation_status} score={contact.validation_score} />
                    </div>
                </div>
            </div>

            {/* Info grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="premium-card p-4">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500">Contact info</h2>
                        {!editing ? (
                            <button
                                onClick={enterEditMode}
                                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50"
                            >
                                <Pencil size={10} />
                                Edit
                            </button>
                        ) : (
                            <div className="flex items-center gap-1.5">
                                <button
                                    onClick={cancelEdit}
                                    disabled={savingDetails}
                                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                >
                                    <X size={10} />
                                    Cancel
                                </button>
                                <button
                                    onClick={saveDetails}
                                    disabled={savingDetails || !detailsDirty}
                                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                                >
                                    {savingDetails ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                                    Save
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2 text-xs">
                        <Field icon={<Mail size={12} />} label="Email" value={contact.email} />
                        {editing ? (
                            <>
                                <EditableField icon={<UserIcon size={12} />} label="First name" value={drafts.first_name} onChange={(v) => setDrafts(d => ({ ...d, first_name: v }))} placeholder="Jane" />
                                <EditableField icon={<UserIcon size={12} />} label="Last name" value={drafts.last_name} onChange={(v) => setDrafts(d => ({ ...d, last_name: v }))} placeholder="Doe" />
                                <EditableField icon={<Building2 size={12} />} label="Company" value={drafts.company} onChange={(v) => setDrafts(d => ({ ...d, company: v }))} placeholder="Acme Inc." />
                                <EditableField icon={<Briefcase size={12} />} label="Title" value={drafts.title} onChange={(v) => setDrafts(d => ({ ...d, title: v }))} placeholder="Head of Sales" />
                                <EditableField icon={<Globe size={12} />} label="Website" value={drafts.website} onChange={(v) => setDrafts(d => ({ ...d, website: v }))} placeholder="acme.com" type="url" />
                                <EditableField icon={<Phone size={12} />} label="Phone" value={drafts.phone} onChange={(v) => setDrafts(d => ({ ...d, phone: v }))} placeholder="+1 555 123 4567" type="tel" />
                                <EditableField icon={<Linkedin size={12} />} label="LinkedIn" value={drafts.linkedin_url} onChange={(v) => setDrafts(d => ({ ...d, linkedin_url: v }))} placeholder="https://linkedin.com/in/..." type="url" />
                            </>
                        ) : (
                            <>
                                <Field icon={<UserIcon size={12} />} label="Name" value={[contact.first_name, contact.last_name].filter(Boolean).join(' ') || contact.full_name} />
                                <Field icon={<Building2 size={12} />} label="Company" value={contact.company} />
                                <Field icon={<Briefcase size={12} />} label="Title" value={contact.title} />
                                <Field icon={<Globe size={12} />} label="Website" value={contact.website} link={contact.website ? toUrl(contact.website) : null} />
                                <Field icon={<Phone size={12} />} label="Phone" value={contact.phone} />
                                <Field icon={<Linkedin size={12} />} label="LinkedIn" value={contact.linkedin_url} link={contact.linkedin_url} />
                            </>
                        )}
                        <Field icon={<Calendar size={12} />} label="Added" value={new Date(contact.created_at).toLocaleString()} />
                    </div>
                </div>

                <div className="premium-card p-4">
                    <h2 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Activity</h2>
                    <div className="grid grid-cols-2 gap-3">
                        <Stat label="Sent" value={contact.emails_sent} />
                        <Stat label="Opened" value={contact.emails_opened} />
                        <Stat label="Clicked" value={contact.emails_clicked} />
                        <Stat label="Replied" value={contact.emails_replied} />
                    </div>
                    {contact.last_activity_at && (
                        <p className="text-[10px] text-gray-400 mt-3 flex items-center gap-1">
                            <Activity size={10} /> Last activity: {new Date(contact.last_activity_at).toLocaleString()}
                        </p>
                    )}
                </div>
            </div>

            {/* Validation details */}
            {contact.validation_status && (
                <div className="premium-card p-4">
                    <h2 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">Email validation</h2>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                        <Field label="Status" value={contact.validation_status} />
                        <Field label="Score" value={contact.validation_score !== null ? String(contact.validation_score) : null} />
                        <Field label="Catch-all" value={contact.is_catch_all === null ? null : contact.is_catch_all ? 'Yes' : 'No'} />
                        <Field label="Disposable" value={contact.is_disposable === null ? null : contact.is_disposable ? 'Yes' : 'No'} />
                        <Field label="Source" value={contact.validation_source} />
                        <Field label="Validated at" value={contact.validated_at ? new Date(contact.validated_at).toLocaleString() : null} />
                    </div>
                </div>
            )}

            {/* Suppression flags */}
            {(contact.bounced || contact.unsubscribed_at) && (
                <div className="premium-card p-4 border-l-4" style={{ borderLeftColor: '#DC2626' }}>
                    <h2 className="text-[10px] font-semibold uppercase tracking-wider text-red-700 mb-2">Suppression</h2>
                    <div className="text-xs text-gray-700">
                        {contact.bounced && <p>Bounced{contact.bounced_at ? ` on ${new Date(contact.bounced_at).toLocaleDateString()}` : ''}</p>}
                        {contact.unsubscribed_at && <p>Unsubscribed on {new Date(contact.unsubscribed_at).toLocaleDateString()}{contact.unsubscribed_reason ? ` — ${contact.unsubscribed_reason}` : ''}</p>}
                    </div>
                </div>
            )}

            {/* Notes */}
            <div className="premium-card p-4">
                <div className="flex items-center justify-between mb-2">
                    <h2 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-1.5">
                        <StickyNote size={11} /> Notes
                    </h2>
                    {notesDirty && (
                        <button
                            onClick={saveNotes}
                            disabled={savingNotes}
                            className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50"
                        >
                            {savingNotes ? <Loader2 size={10} className="animate-spin" /> : <Check size={10} />}
                            Save
                        </button>
                    )}
                </div>
                <textarea
                    value={notesDraft}
                    onChange={(e) => { setNotesDraft(e.target.value); setNotesDirty(e.target.value !== (contact.notes || '')); }}
                    placeholder="Add private notes about this contact — meeting prep, context from previous calls, anything you want to remember next time their email comes up."
                    rows={4}
                    className="w-full px-3 py-2 text-xs rounded-lg outline-none resize-y"
                    style={{ border: '1px solid #D1CBC5' }}
                />
            </div>

            {/* Campaign history */}
            <div className="premium-card p-4">
                <h2 className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 mb-3">
                    Campaigns history <span className="text-gray-400 normal-case">— {history.length} enrollment{history.length === 1 ? '' : 's'}</span>
                </h2>
                {history.length === 0 ? (
                    <p className="text-xs text-gray-400">Never enrolled in a campaign.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                            <thead>
                                <tr style={{ borderBottom: '1px solid #E8E3DC' }}>
                                    <th className="py-1.5 text-[10px] font-semibold text-gray-500">Campaign</th>
                                    <th className="py-1.5 text-[10px] font-semibold text-gray-500">Status</th>
                                    <th className="py-1.5 text-[10px] font-semibold text-gray-500">Step</th>
                                    <th className="py-1.5 text-[10px] font-semibold text-gray-500">Enrolled</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.map(e => (
                                    <tr key={e.campaign_id + e.created_at} style={{ borderBottom: '1px solid #F3EFE8' }}>
                                        <td className="py-1.5">
                                            <Link href={`/dashboard/sequencer/campaigns/${e.campaign_id}`} className="text-gray-900 hover:text-blue-700 hover:underline">
                                                {e.campaign_name}
                                            </Link>
                                        </td>
                                        <td className="py-1.5 text-gray-600 capitalize">{e.status}</td>
                                        <td className="py-1.5 text-gray-600">{e.current_step ?? '—'}</td>
                                        <td className="py-1.5 text-gray-400">{new Date(e.created_at).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

function Field({ icon, label, value, link }: { icon?: React.ReactNode; label: string; value: string | null | undefined; link?: string | null }) {
    return (
        <div className="flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span className="text-gray-500 w-20 flex-shrink-0">{label}</span>
            {value ? (
                link ? (
                    <a href={link} target="_blank" rel="noreferrer" className="text-gray-900 hover:text-blue-700 hover:underline truncate">{value}</a>
                ) : (
                    <span className="text-gray-900 truncate">{value}</span>
                )
            ) : (
                <span className="text-gray-300">—</span>
            )}
        </div>
    );
}

function EditableField({
    icon,
    label,
    value,
    onChange,
    placeholder,
    type = 'text',
}: {
    icon?: React.ReactNode;
    label: string;
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    type?: string;
}) {
    return (
        <div className="flex items-center gap-2">
            {icon && <span className="text-gray-400">{icon}</span>}
            <span className="text-gray-500 w-20 flex-shrink-0">{label}</span>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="flex-1 min-w-0 px-2 py-1 text-xs rounded-md outline-none bg-transparent hover:bg-gray-50 focus:bg-white focus:border-gray-300 border border-transparent text-gray-900 placeholder-gray-300"
            />
        </div>
    );
}

function Stat({ label, value }: { label: string; value: number }) {
    return (
        <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-wider">{label}</p>
            <p className="text-lg font-bold text-gray-900 tabular-nums">{value.toLocaleString()}</p>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const colors: Record<string, string> = {
        active:    'bg-green-50 text-green-700',
        bounced:   'bg-red-50 text-red-600',
        replied:   'bg-blue-50 text-blue-700',
        held:      'bg-blue-50 text-blue-700',
        paused:    'bg-yellow-50 text-yellow-700',
        completed: 'bg-gray-100 text-gray-600',
        blocked:   'bg-red-50 text-red-600',
    };
    const cls = colors[status] || 'bg-gray-100 text-gray-600';
    const label = status === 'held' ? 'Available' : status;
    return <span className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${cls}`}>{label}</span>;
}

function ValidationBadge({ status, score }: { status: string | null; score: number | null }) {
    if (!status) return null;
    const colors: Record<string, { bg: string; fg: string }> = {
        valid:   { bg: '#F0FDF4', fg: '#15803D' },
        risky:   { bg: '#FFFBEB', fg: '#B45309' },
        invalid: { bg: '#FEF2F2', fg: '#B91C1C' },
        unknown: { bg: '#F1F5F9', fg: '#475569' },
        pending: { bg: '#EFF6FF', fg: '#1D4ED8' },
    };
    const c = colors[status] || colors.unknown;
    return (
        <span
            className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded"
            style={{ background: c.bg, color: c.fg }}
        >
            {status}{typeof score === 'number' ? ` · ${score}` : ''}
        </span>
    );
}

function toUrl(s: string): string {
    if (/^https?:\/\//i.test(s)) return s;
    return `https://${s}`;
}
