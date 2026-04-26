'use client';

/**
 * Migration wizard: from-Smartlead → native sequencer.
 *
 * Three-step flow: Review → Reconnect mailboxes → Finalize campaigns.
 * Feature-flag gated server-side via MIGRATION_TOOL_ENABLED. The page
 * itself loads regardless; if the API returns disabled, we show a
 * not-available message.
 */

import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { ArrowRight, Check, Loader2, AlertCircle } from 'lucide-react';

interface MailboxRow {
    id: string;
    email: string;
    domain: string;
    status: string;
    connected: boolean;
    in_campaigns: number;
}
interface CampaignRow {
    id: string;
    name: string;
    status: string;
    ready: boolean;
    lead_count: number;
    last_send_at: string | null;
}
interface Preview {
    mailboxes: MailboxRow[];
    campaigns: CampaignRow[];
    leads_total: number;
    sequencer_settings_present: boolean;
}

export default function MigrationFromSmartleadPage() {
    const [enabled, setEnabled] = useState<boolean | null>(null);
    const [preview, setPreview] = useState<Preview | null>(null);
    const [step, setStep] = useState<1 | 2 | 3>(1);
    const [busy, setBusy] = useState(false);

    useEffect(() => {
        apiClient<{ enabled: boolean }>('/api/migration/from-smartlead/feature')
            .then((r) => setEnabled(r.enabled))
            .catch(() => setEnabled(false));
    }, []);

    useEffect(() => {
        if (enabled !== true) return;
        refresh();
    }, [enabled]);

    const refresh = async () => {
        try {
            const r = await apiClient<{ success: boolean; data: Preview }>('/api/migration/from-smartlead/preview');
            setPreview(r.data);
        } catch (e: any) {
            toast.error(`Preview failed: ${e.message || 'unknown'}`);
        }
    };

    if (enabled === null) {
        return <div className="p-8 text-sm text-gray-500"><Loader2 className="inline animate-spin mr-2" size={14} /> Loading…</div>;
    }
    if (enabled === false) {
        return (
            <div className="p-8 max-w-xl">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 flex gap-3">
                    <AlertCircle className="text-amber-600 shrink-0 mt-0.5" size={20} />
                    <div>
                        <div className="font-bold text-amber-900 mb-1">Migration tool is disabled</div>
                        <p className="text-sm text-amber-800">
                            This tool is feature-flagged off. Contact your administrator to enable it
                            (sets <code className="bg-amber-100 px-1 rounded">MIGRATION_TOOL_ENABLED=true</code>).
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    if (!preview) {
        return <div className="p-8 text-sm text-gray-500"><Loader2 className="inline animate-spin mr-2" size={14} /> Loading preview…</div>;
    }

    return (
        <div className="px-6 py-6 max-w-[1100px] mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Migrate from Smartlead</h1>
                <p className="text-sm text-gray-500 mt-1">
                    Walk this org's existing mailboxes and campaigns through the native sequencer setup.
                    Customer data is preserved end-to-end. Campaigns finish paused — you'll review before resuming.
                </p>
            </div>

            <Stepper step={step} />

            {step === 1 && <StepReview preview={preview} onNext={() => setStep(2)} />}
            {step === 2 && (
                <StepConnectMailboxes
                    preview={preview}
                    busy={busy}
                    setBusy={setBusy}
                    onRefresh={refresh}
                    onNext={() => setStep(3)}
                />
            )}
            {step === 3 && (
                <StepFinalize
                    preview={preview}
                    busy={busy}
                    setBusy={setBusy}
                    onRefresh={refresh}
                />
            )}
        </div>
    );
}

// ─── Stepper ─────────────────────────────────────────────────────────────────

function Stepper({ step }: { step: 1 | 2 | 3 }) {
    const steps = [
        { num: 1, label: 'Review' },
        { num: 2, label: 'Reconnect Mailboxes' },
        { num: 3, label: 'Finalize Campaigns' },
    ];
    return (
        <div className="flex items-center gap-3 mb-8">
            {steps.map((s, i) => (
                <div key={s.num} className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                        s.num < step ? 'bg-emerald-500 text-white'
                        : s.num === step ? 'bg-gray-900 text-white'
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                        {s.num < step ? <Check size={14} /> : s.num}
                    </div>
                    <span className={`text-sm font-semibold ${s.num <= step ? 'text-gray-900' : 'text-gray-400'}`}>
                        {s.label}
                    </span>
                    {i < steps.length - 1 && <ArrowRight size={14} className="text-gray-300 mx-1" />}
                </div>
            ))}
        </div>
    );
}

// ─── Step 1: Review ──────────────────────────────────────────────────────────

function StepReview({ preview, onNext }: { preview: Preview; onNext: () => void }) {
    const unconnected = preview.mailboxes.filter((m) => !m.connected).length;
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-3 gap-4">
                <Stat label="Mailboxes" value={preview.mailboxes.length} sub={`${unconnected} need reconnect`} />
                <Stat label="Campaigns" value={preview.campaigns.length} sub={`${preview.campaigns.filter(c => c.ready).length} already ready`} />
                <Stat label="Leads" value={preview.leads_total.toLocaleString()} sub="preserved end-to-end" />
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-3">What this migration will do</h3>
                <ul className="text-sm text-gray-600 space-y-1.5 list-disc pl-5">
                    <li>Create a ConnectedAccount per reconnected mailbox (OAuth or SMTP credentials)</li>
                    <li>Populate sequencer fields on each Campaign (schedule, daily cap, ESP routing, tracking)</li>
                    <li>Create CampaignLead rows from your existing Lead history</li>
                    <li>Create CampaignAccount rows linking each connected mailbox to its campaigns</li>
                    <li>Leave Campaign.status = paused so you review before any send</li>
                </ul>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onNext}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black inline-flex items-center gap-2"
                >
                    Continue <ArrowRight size={14} />
                </button>
            </div>
        </div>
    );
}

function Stat({ label, value, sub }: { label: string; value: string | number; sub: string }) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</div>
            <div className="text-3xl font-bold text-gray-900">{value}</div>
            <div className="text-xs text-gray-500 mt-1">{sub}</div>
        </div>
    );
}

// ─── Step 2: Connect mailboxes ──────────────────────────────────────────────

function StepConnectMailboxes({
    preview,
    busy,
    setBusy,
    onRefresh,
    onNext,
}: {
    preview: Preview;
    busy: boolean;
    setBusy: (b: boolean) => void;
    onRefresh: () => Promise<void>;
    onNext: () => void;
}) {
    const allConnected = preview.mailboxes.every((m) => m.connected);

    const connect = async (mailboxId: string, provider: 'google' | 'microsoft' | 'smtp') => {
        if (provider === 'google' || provider === 'microsoft') {
            // Sequencer's existing OAuth flow handles these. Direct user there
            // and tell them the mailbox by email — they pick it back up via
            // the standard /dashboard/sequencer/accounts connect button.
            toast.error('Reconnect via Sequencer → Mailboxes for OAuth providers, then return here.');
            return;
        }
        // SMTP: prompt for credentials
        const host = prompt('SMTP host (e.g. smtp.gmail.com)');
        if (!host) return;
        const port = parseInt(prompt('SMTP port (e.g. 587)') || '587', 10);
        const username = prompt('SMTP username (usually the email)');
        const password = prompt('SMTP password');
        if (!username || !password) return;

        setBusy(true);
        try {
            await apiClient('/api/migration/from-smartlead/connect-mailbox', {
                method: 'POST',
                body: JSON.stringify({
                    mailboxId, provider: 'smtp',
                    smtpHost: host, smtpPort: port,
                    smtpUsername: username, smtpPassword: password,
                    imapHost: host.replace(/^smtp\./, 'imap.'),
                    imapPort: 993,
                }),
            });
            toast.success('Connected');
            await onRefresh();
        } catch (e: any) {
            toast.error(`Connect failed: ${e.message || 'unknown'}`);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-4 py-2 font-semibold text-gray-700">Email</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-700">Domain</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {preview.mailboxes.map((m) => (
                            <tr key={m.id}>
                                <td className="px-4 py-2 font-mono text-xs">{m.email}</td>
                                <td className="px-4 py-2 text-xs text-gray-500">{m.domain}</td>
                                <td className="px-4 py-2">
                                    {m.connected ? (
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">Connected</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded uppercase">Not connected</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    {m.connected ? (
                                        <span className="text-xs text-gray-400">—</span>
                                    ) : (
                                        <div className="flex gap-2 justify-end">
                                            <button onClick={() => connect(m.id, 'google')} disabled={busy} className="text-[11px] font-semibold text-blue-700 hover:underline disabled:opacity-50">Gmail OAuth</button>
                                            <button onClick={() => connect(m.id, 'microsoft')} disabled={busy} className="text-[11px] font-semibold text-blue-700 hover:underline disabled:opacity-50">Microsoft</button>
                                            <button onClick={() => connect(m.id, 'smtp')} disabled={busy} className="text-[11px] font-semibold text-blue-700 hover:underline disabled:opacity-50">SMTP</button>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={onNext}
                    disabled={!allConnected}
                    className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-lg hover:bg-black disabled:opacity-50 inline-flex items-center gap-2"
                >
                    {allConnected ? 'Continue' : `${preview.mailboxes.filter((m) => !m.connected).length} mailbox(es) still need reconnect`}
                    {allConnected && <ArrowRight size={14} />}
                </button>
            </div>
        </div>
    );
}

// ─── Step 3: Finalize ────────────────────────────────────────────────────────

function StepFinalize({
    preview,
    busy,
    setBusy,
    onRefresh,
}: {
    preview: Preview;
    busy: boolean;
    setBusy: (b: boolean) => void;
    onRefresh: () => Promise<void>;
}) {
    const finalize = async (campaignId: string) => {
        setBusy(true);
        try {
            const r = await apiClient<{ success: boolean; campaignLeadsCreated: number; campaignAccountsCreated: number }>(
                '/api/migration/from-smartlead/finalize-campaign',
                {
                    method: 'POST',
                    body: JSON.stringify({
                        campaignId,
                        schedule_timezone: 'America/New_York',
                        schedule_start_time: '09:00',
                        schedule_end_time: '17:00',
                        schedule_days: ['mon', 'tue', 'wed', 'thu', 'fri'],
                        daily_limit: 50,
                        send_gap_minutes: 15,
                        esp_routing: true,
                        stop_on_reply: true,
                        stop_on_bounce: true,
                        track_opens: true,
                        track_clicks: true,
                    }),
                },
            );
            toast.success(`Finalized: ${r.campaignLeadsCreated} leads, ${r.campaignAccountsCreated} mailbox links`);
            await onRefresh();
        } catch (e: any) {
            toast.error(`Finalize failed: ${e.message || 'unknown'}`);
        } finally {
            setBusy(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="text-left px-4 py-2 font-semibold text-gray-700">Campaign</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-700">Leads</th>
                            <th className="text-left px-4 py-2 font-semibold text-gray-700">Status</th>
                            <th className="text-right px-4 py-2 font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {preview.campaigns.map((c) => (
                            <tr key={c.id}>
                                <td className="px-4 py-2 font-semibold">{c.name}</td>
                                <td className="px-4 py-2 text-xs text-gray-500">{c.lead_count.toLocaleString()}</td>
                                <td className="px-4 py-2">
                                    {c.ready ? (
                                        <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded uppercase">Ready</span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded uppercase">Needs Setup</span>
                                    )}
                                </td>
                                <td className="px-4 py-2 text-right">
                                    <button
                                        onClick={() => finalize(c.id)}
                                        disabled={busy}
                                        className="text-[11px] font-semibold text-blue-700 hover:underline disabled:opacity-50"
                                    >
                                        {c.ready ? 'Re-finalize with defaults' : 'Finalize with defaults'}
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <p className="text-xs text-gray-500">
                Defaults: 9:00 AM–5:00 PM ET, Mon–Fri, 50/day, 15-min gap, ESP routing on, stop on reply/bounce, tracking on. Adjust per-campaign in <strong>/dashboard/sequencer/campaigns</strong> after finalize.
                Campaigns end paused — review and click Resume when ready.
            </p>
        </div>
    );
}
