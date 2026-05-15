'use client';

import { useState } from 'react';
import { Settings, GripVertical, Plus, AlertTriangle, ShieldCheck, Bell, MessageCircle, Eye, Lightbulb, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { apiClient } from '@/lib/api';
import CrossChannelSuppressionCard from '@/components/shared/CrossChannelSuppressionCard';

// Signal-monitoring mode taxonomy (mirrors the protection-side System Mode
// pattern in components/settings/SystemModeCard.tsx). One-liners per spec.
const SIGNAL_MODES = [
    { key: 'OBSERVE', label: 'Observe', icon: <Eye size={16} />,       desc: 'Log signals and notify only - no auto-action.',                         color: '#D97706', activeBg: '#FFFBEB', badgeBg: '#FDE68A', badgeColor: '#92400E' },
    { key: 'SUGGEST', label: 'Suggest', icon: <Lightbulb size={16} />, desc: 'Queue ICP-matched signals for your approval before any action fires.', color: '#2563EB', activeBg: '#EFF6FF', badgeBg: '#BFDBFE', badgeColor: '#1E40AF' },
    { key: 'ENFORCE', label: 'Enforce', icon: <Lock size={16} />,      desc: 'Auto-route matched signals into cold-call lists or campaigns.',          color: '#7C3AED', activeBg: '#F5F3FF', badgeBg: '#DDD6FE', badgeColor: '#5B21B6' },
];

interface Provider {
    name: string;
    enabled: boolean;
    description: string;
}

// Strict BYOK - the customer supplies the API key (and webhook for Clay)
// on a per-org settings panel, and pays the vendor directly. We deliberately
// don't surface per-hit cost: we have no reliable read on the customer's
// actual rate (volume discounts, plan tier, contract pricing) and any
// number we showed would be misleading.
const INITIAL_PROVIDERS: Provider[] = [
    { name: 'Apollo',   enabled: true,  description: 'Primary contact-data source. Strong for B2B SaaS in US/EU.' },
    { name: 'Clay',     enabled: true,  description: 'Fallback for missing email + phone enrichment via Clay\'s waterfall.' },
    { name: 'Surfe',    enabled: true,  description: 'Tertiary fallback. Good APAC + tech-startup coverage.' },
    { name: 'Lusha',    enabled: false, description: 'Phone-first enrichment. Disabled - opt in if Apollo/Clay misses too many phones.' },
    { name: 'Hunter',   enabled: false, description: 'Email-only enrichment. Disabled - Apollo+Clay covers Hunter\'s hits.' },
    { name: 'ZoomInfo', enabled: false, description: 'Disabled - credentials not configured.' },
];

// Map provider display names to the brand SVGs we ship under /public/brands.
// Lower-cased so we don't trip on casing differences between this list and
// the EnrichmentProvider rows that come from the API.
const PROVIDER_LOGO: Record<string, string> = {
    apollo:   '/brands/apollo.svg',
    clay:     '/brands/clay.svg',
    surfe:    '/brands/surfe.svg',
    lusha:    '/brands/lusha.svg',
    hunter:   '/brands/hunter.svg',
    zoominfo: '/brands/zoominfo.svg',
};

const NOTIF_EVENTS = [
    { key: 'reply_received', label: 'Reply received', desc: 'Any inbound message on a campaign-initiated thread.', in_app: true, email: true, slack: true },
    { key: 'cr_accepted', label: 'Connection request accepted', desc: 'CR moved to ACCEPTED status (note-fast-path or 8h poll).', in_app: true, email: false, slack: true },
    { key: 'account_disconnect', label: 'LinkedIn account disconnected', desc: 'Unipile reports CREDENTIALS or ERROR status.', in_app: true, email: true, slack: true },
    { key: 'campaign_finished', label: 'Campaign finished', desc: 'All leads reached terminal state.', in_app: true, email: false, slack: false },
    { key: 'campaign_insufficient_leads', label: 'Insufficient leads', desc: 'Sender pool capacity exceeded; campaign pauses automatically.', in_app: true, email: true, slack: false },
    { key: 'icp_match', label: 'High-confidence ICP match', desc: 'Score ≥ 0.9 from the ICP matcher. Auto-tagged ENFORCE.', in_app: false, email: false, slack: true },
];

export default function LinkedInSettingsPage() {
    const [providers, setProviders] = useState(INITIAL_PROVIDERS);
    const [defaultNote, setDefaultNote] = useState('Hi {{first_name}}, saw your post on {{topic}} - building something adjacent at Superkabe and would love your take.');
    const [useFallback, setUseFallback] = useState(true);
    const [signalMode, setSignalMode] = useState<'OBSERVE' | 'SUGGEST' | 'ENFORCE'>('SUGGEST');

    const move = (i: number, dir: -1 | 1) => {
        const next = [...providers];
        const j = i + dir;
        if (j < 0 || j >= next.length) return;
        [next[i], next[j]] = [next[j], next[i]];
        setProviders(next);
    };

    return (
        <div className="p-4 flex flex-col gap-4">
            <div>
                <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Settings size={18} strokeWidth={1.75} /> LinkedIn Settings</h1>
                <p className="text-xs text-gray-500 mt-0.5">Signal monitoring mode · default connection note · enrichment waterfall · notifications</p>
            </div>

            <div className="premium-card !p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-[#D1CBC5]">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Eye size={14} /> Signal monitoring mode</h2>
                    <p className="text-[0.7rem] text-gray-500 mt-0.5">Workspace default for what happens when a profile engages with one of your posts. Per-account and per-post overrides live on the Signals page.</p>
                </div>
                <div className="p-4 grid gap-3" style={{ gridTemplateColumns: 'repeat(3, minmax(0, 1fr))' }}>
                    {SIGNAL_MODES.map(m => {
                        const isActive = signalMode === m.key;
                        return (
                            <button
                                key={m.key}
                                onClick={() => setSignalMode(m.key as 'OBSERVE' | 'SUGGEST' | 'ENFORCE')}
                                className="text-left rounded-xl p-3 transition-all"
                                style={{
                                    border: `2px solid ${isActive ? m.color : '#D1CBC5'}`,
                                    background: isActive ? m.activeBg : '#FFFFFF',
                                    cursor: 'pointer',
                                }}
                            >
                                <div className="flex items-center gap-2 mb-1.5">
                                    <span style={{ color: isActive ? m.color : '#6B5E4F' }}>{m.icon}</span>
                                    <h3 className="text-sm font-bold m-0" style={{ color: isActive ? m.color : '#374151' }}>{m.label}</h3>
                                    {isActive && (
                                        <span className="ml-auto text-[0.6rem] font-bold py-0.5 px-1.5 rounded uppercase tracking-wide"
                                            style={{ background: m.badgeBg, color: m.badgeColor }}>
                                            Current
                                        </span>
                                    )}
                                </div>
                                <p className="m-0 text-[0.7rem] text-gray-600 leading-snug">{m.desc}</p>
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="premium-card !p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-[#D1CBC5]">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2"><MessageCircle size={14} /> Default connection note</h2>
                    <p className="text-[0.7rem] text-gray-500 mt-0.5">Used as fallback when a sequence step doesn&apos;t define its own note. Max 200 chars (Free) or 300 chars (Premium).</p>
                </div>
                <div className="p-5 space-y-3">
                    <textarea
                        rows={3} value={defaultNote} onChange={e => setDefaultNote(e.target.value)} maxLength={300}
                        className="w-full text-sm px-3 py-2 rounded-lg outline-none resize-none font-mono"
                        style={{ border: '1px solid #D1CBC5' }}
                    />
                    <div className="flex items-center justify-between">
                        <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                            <input type="checkbox" checked={useFallback} onChange={e => setUseFallback(e.target.checked)} className="rounded" />
                            <span>Use this as fallback when a campaign step has no note configured</span>
                        </label>
                        <span className="text-[0.65rem] text-gray-500 tabular-nums">{defaultNote.length} / 300</span>
                    </div>
                    <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50/60 border border-blue-200">
                        <AlertTriangle size={12} className="text-blue-700 mt-0.5 shrink-0" />
                        <div className="text-[0.7rem] text-blue-900">
                            Connection requests carrying a note get a real-time acceptance signal (via incoming-message webhook). Noteless CRs wait on Unipile&apos;s 8h-delayed acceptance webhook.
                        </div>
                    </div>
                </div>
            </div>

            <div className="premium-card !p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-[#D1CBC5] flex items-center justify-between">
                    <div>
                        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2"><ShieldCheck size={14} /> Enrichment waterfall</h2>
                        <p className="text-[0.7rem] text-gray-500 mt-0.5">Providers are tried in order. On EMPTY or ERROR, fall through to the next.</p>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg cursor-pointer border border-[#D1CBC5] hover:bg-gray-50 text-gray-700">
                        <Plus size={12} /> Add provider
                    </button>
                </div>
                <div className="p-3 space-y-2">
                    {providers.map((p, i) => {
                        const logo = PROVIDER_LOGO[p.name.toLowerCase()];
                        return (
                            <div key={p.name} className={`flex items-center gap-3 p-2.5 rounded-lg ${p.enabled ? 'bg-white' : 'bg-gray-50/50 opacity-60'}`} style={{ border: '1px solid #D1CBC5' }}>
                                <div className="flex flex-col gap-0.5">
                                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-[10px]">▲</button>
                                    <GripVertical size={11} className="text-gray-300" />
                                    <button onClick={() => move(i, 1)} disabled={i === providers.length - 1} className="text-gray-300 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed text-[10px]">▼</button>
                                </div>
                                <div className="w-6 h-6 rounded bg-gray-100 flex items-center justify-center text-[0.65rem] font-mono text-gray-600 font-semibold">{i + 1}</div>
                                {logo ? (
                                    <img src={logo} alt={p.name} className="w-9 h-9 object-contain shrink-0 rounded-lg" />
                                ) : (
                                    <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center text-[0.7rem] font-semibold text-gray-600 shrink-0">{p.name.slice(0, 2).toUpperCase()}</div>
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-semibold text-gray-900">{p.name}</span>
                                        {!p.enabled && <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[0.6rem] uppercase font-semibold bg-gray-100 text-gray-500">Disabled</span>}
                                    </div>
                                    <div className="text-[0.7rem] text-gray-500">{p.description}</div>
                                </div>
                                <label className="inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={p.enabled} onChange={() => setProviders(prev => prev.map((x, j) => j === i ? { ...x, enabled: !x.enabled } : x))} className="sr-only peer" />
                                    <div className="relative w-9 h-5 bg-gray-200 peer-checked:bg-emerald-500 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform peer-checked:after:translate-x-4" />
                                </label>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Workspace-wide policy - same card mounted on the Sequencer
                settings page. Editing here flips the policy for every
                campaign across both modules. */}
            <CrossChannelSuppressionCard />

            <div className="premium-card !p-0 overflow-hidden">
                <div className="px-5 py-3 border-b border-[#D1CBC5]">
                    <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2"><Bell size={14} /> Notifications</h2>
                    <p className="text-[0.7rem] text-gray-500 mt-0.5">Per-event delivery channels. In-app must be on before email or Slack can be enabled.</p>
                </div>
                <table className="w-full">
                    <thead>
                        <tr className="border-b border-gray-100">
                            <th className="text-left px-5 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Event</th>
                            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">In-app</th>
                            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">Email</th>
                            <th className="px-3 py-2.5 text-xs font-semibold text-gray-500 uppercase tracking-wider w-20 text-center">Slack</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {NOTIF_EVENTS.map(e => (
                            <tr key={e.key} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-5 py-3">
                                    <div className="text-sm font-semibold text-gray-900">{e.label}</div>
                                    <div className="text-[0.7rem] text-gray-500">{e.desc}</div>
                                </td>
                                <td className="text-center"><input type="checkbox" defaultChecked={e.in_app} className="rounded" /></td>
                                <td className="text-center"><input type="checkbox" defaultChecked={e.email} className="rounded" /></td>
                                <td className="text-center"><input type="checkbox" defaultChecked={e.slack} className="rounded" /></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
