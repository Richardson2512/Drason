'use client';

import { useState, useEffect } from 'react';
import { Save, Clock, Shield, Globe, Link2, Bell, Mail, Send, Users, BadgeCheck, Mailbox, BarChart3, Loader2, FlaskConical, ArrowUpRight } from 'lucide-react';
import { useDashboard } from '@/contexts/DashboardContext';
import { apiClient } from '@/lib/api';
import { toast } from 'react-hot-toast';
import TimePicker from '@/components/ui/TimePicker';

interface SequencerSettings {
    id?: string;
    default_daily_limit: number;
    default_timezone: string;
    default_start_time: string;
    default_end_time: string;
    default_active_days: string[];
    delay_between_emails: number;
    tracking_domain: string;
    default_track_opens: boolean;
    default_track_clicks: boolean;
    default_include_unsubscribe: boolean;
    global_daily_max: number;
    auto_pause_on_bounce: boolean;
    bounce_threshold: number;
    stop_on_reply_default: boolean;
    notify_on_reply: boolean;
    notify_on_bounce: boolean;
    notify_on_complete: boolean;
}

export default function SequencerSettingsPage() {
    // Loading / saving states
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Global sending defaults
    const [defaultDailyLimit, setDefaultDailyLimit] = useState(50);
    const [applyToExistingMailboxes, setApplyToExistingMailboxes] = useState(false);
    const [defaultTimezone, setDefaultTimezone] = useState('America/New_York');
    const [defaultStartTime, setDefaultStartTime] = useState('09:00');
    const [defaultEndTime, setDefaultEndTime] = useState('17:00');
    const [defaultActiveDays, setDefaultActiveDays] = useState(['mon', 'tue', 'wed', 'thu', 'fri']);
    const [delayBetweenEmails, setDelayBetweenEmails] = useState(1); // minutes

    // Tracking
    const [trackingDomain, setTrackingDomain] = useState('');
    const [defaultTrackOpens, setDefaultTrackOpens] = useState(true);
    const [defaultTrackClicks, setDefaultTrackClicks] = useState(true);
    const [defaultUnsubscribe, setDefaultUnsubscribe] = useState(true);

    // Safety
    const [globalDailyMax, setGlobalDailyMax] = useState(500);
    const [autoPauseOnBounce, setAutoPauseOnBounce] = useState(true);
    const [bounceThreshold, setBounceThreshold] = useState(3);
    const [stopOnReplyDefault, setStopOnReplyDefault] = useState(true);

    // Notifications
    const [notifyOnReply, setNotifyOnReply] = useState(true);
    const [notifyOnBounce, setNotifyOnBounce] = useState(true);
    const [notifyOnComplete, setNotifyOnComplete] = useState(true);

    // Fetch settings on mount
    useEffect(() => {
        async function fetchSettings() {
            try {
                const data = await apiClient<{ settings: SequencerSettings }>('/api/sequencer/settings');
                const s = data.settings;
                if (s) {
                    setDefaultDailyLimit(s.default_daily_limit ?? 50);
                    setDefaultTimezone(s.default_timezone ?? 'America/New_York');
                    setDefaultStartTime(s.default_start_time ?? '09:00');
                    setDefaultEndTime(s.default_end_time ?? '17:00');
                    setDefaultActiveDays(s.default_active_days ?? ['mon', 'tue', 'wed', 'thu', 'fri']);
                    setDelayBetweenEmails(s.delay_between_emails ?? 1);
                    setTrackingDomain(s.tracking_domain ?? '');
                    setDefaultTrackOpens(s.default_track_opens ?? true);
                    setDefaultTrackClicks(s.default_track_clicks ?? true);
                    setDefaultUnsubscribe(s.default_include_unsubscribe ?? true);
                    setGlobalDailyMax(s.global_daily_max ?? 500);
                    setAutoPauseOnBounce(s.auto_pause_on_bounce ?? true);
                    setBounceThreshold(s.bounce_threshold ?? 3);
                    setStopOnReplyDefault(s.stop_on_reply_default ?? true);
                    setNotifyOnReply(s.notify_on_reply ?? true);
                    setNotifyOnBounce(s.notify_on_bounce ?? true);
                    setNotifyOnComplete(s.notify_on_complete ?? true);
                }
            } catch (err) {
                toast.error('Failed to load settings');
            } finally {
                setLoading(false);
            }
        }
        fetchSettings();
    }, []);

    const toggleDay = (day: string) => setDefaultActiveDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const result = await apiClient<any>('/api/sequencer/settings', {
                method: 'PATCH',
                body: JSON.stringify({
                    defaultDailyLimit,
                    defaultTimezone,
                    defaultStartTime,
                    defaultEndTime,
                    defaultActiveDays,
                    delayBetweenEmails,
                    trackingDomain,
                    defaultTrackOpens,
                    defaultTrackClicks,
                    defaultUnsubscribe,
                    globalDailyMax,
                    autoPauseOnBounce,
                    bounceThreshold,
                    stopOnReplyDefault,
                    notifyOnReply,
                    notifyOnBounce,
                    notifyOnComplete,
                    applyToExistingMailboxes,
                }),
            });
            if (applyToExistingMailboxes && result?.mailboxesUpdated !== undefined) {
                toast.success(`Settings saved. Updated ${result.mailboxesUpdated} existing mailbox${result.mailboxesUpdated === 1 ? '' : 'es'}.`);
            } else {
                toast.success('Settings saved');
            }
            setApplyToExistingMailboxes(false); // Reset after apply
        } catch (err: any) {
            toast.error(err.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const Toggle = ({ value, onChange, label, description }: { value: boolean; onChange: (v: boolean) => void; label: string; description: string }) => (
        <div className="flex items-center justify-between p-3 rounded-lg" style={{ border: '1px solid #D1CBC5' }}>
            <div>
                <div className="text-xs font-semibold text-gray-900">{label}</div>
                <div className="text-[10px] text-gray-400">{description}</div>
            </div>
            <button onClick={() => onChange(!value)} className="w-10 h-5 rounded-full cursor-pointer transition-colors relative" style={{ background: value ? '#111827' : '#D1CBC5' }}>
                <div className="absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform" style={{ left: value ? '22px' : '2px' }} />
            </button>
        </div>
    );

    const { subscription } = useDashboard();
    const tier = subscription?.tier || 'trial';

    // Fetch tier catalog from the backend (single source of truth shared with billing page)
    const [tierStats, setTierStats] = useState<Record<string, { name: string; leads: string; domains: string; mailboxes: string; sends: string; validation: string; color: string }>>({
        trial: { name: 'Free Trial', leads: '—', domains: '—', mailboxes: '—', sends: '—', validation: '—', color: '#6B7280' },
    });

    useEffect(() => {
        apiClient<{ tiers?: Array<{ key: string; name: string; color: string; limits: { leads: number | null; domains: number | null; mailboxes: number | null; monthlySendLimit: number | null; validationCredits: number | null } }> }>('/api/billing/tiers')
            .then(res => {
                if (!res?.tiers) return;
                const formatNum = (n: number | null) => n === null ? 'Unlimited' : n.toLocaleString();
                const stats: any = {};
                for (const t of res.tiers) {
                    stats[t.key] = {
                        name: t.name,
                        color: t.color,
                        leads: formatNum(t.limits.leads),
                        domains: formatNum(t.limits.domains),
                        mailboxes: formatNum(t.limits.mailboxes),
                        sends: formatNum(t.limits.monthlySendLimit),
                        validation: formatNum(t.limits.validationCredits),
                    };
                }
                setTierStats(stats);
            })
            .catch(() => { /* keep fallback */ });
    }, []);

    const tierInfo = tierStats[tier] || tierStats.trial;

    if (loading) {
        return (
            <div className="p-4 flex items-center justify-center min-h-[400px]">
                <Loader2 size={24} className="animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="p-4 flex gap-5">
            {/* Left: Settings */}
            <div className="flex-1 flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Sequencer Settings</h1>
                        <p className="text-xs text-gray-500 mt-0.5">Default settings for all new campaigns</p>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-semibold hover:bg-gray-800 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                        {saving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />} {saving ? 'Saving...' : 'Save Settings'}
                    </button>
                </div>

            {/* Sending Defaults */}
            <div className="premium-card">
                <div className="flex items-center gap-2 mb-4">
                    <Clock size={14} className="text-gray-500" />
                    <h2 className="text-sm font-bold text-gray-900">Sending Defaults</h2>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Default daily limit per account</label>
                            <input type="number" min={1} max={500} value={defaultDailyLimit} onChange={e => setDefaultDailyLimit(parseInt(e.target.value) || 50)} className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                            <label className="flex items-center gap-1.5 mt-1.5 cursor-pointer">
                                <input type="checkbox" checked={applyToExistingMailboxes} onChange={e => setApplyToExistingMailboxes(e.target.checked)} className="w-3 h-3 accent-gray-900 cursor-pointer" />
                                <span className="text-[9px] text-gray-500">Apply to all existing mailboxes (otherwise affects new mailboxes only)</span>
                            </label>
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Delay between emails (minutes)</label>
                            <input type="number" min={1} max={120} value={delayBetweenEmails} onChange={e => setDelayBetweenEmails(parseInt(e.target.value) || 1)} className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Sending window start</label>
                            <TimePicker value={defaultStartTime} onChange={setDefaultStartTime} />
                        </div>
                        <div>
                            <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Sending window end</label>
                            <TimePicker value={defaultEndTime} onChange={setDefaultEndTime} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-2">Active sending days</label>
                        <div className="flex gap-2">
                            {['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].map(day => (
                                <button key={day} onClick={() => toggleDay(day)} className="w-9 h-9 rounded-lg text-[10px] font-bold uppercase cursor-pointer transition-colors" style={{ background: defaultActiveDays.includes(day) ? '#111827' : '#F3F4F6', color: defaultActiveDays.includes(day) ? '#FFF' : '#6B7280' }}>
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Tracking */}
            <div className="premium-card">
                <div className="flex items-center gap-2 mb-4">
                    <Globe size={14} className="text-gray-500" />
                    <h2 className="text-sm font-bold text-gray-900">Tracking</h2>
                </div>
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Custom tracking domain</label>
                        <input type="text" value={trackingDomain} onChange={e => setTrackingDomain(e.target.value)} placeholder="track.yourdomain.com" className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                        <p className="text-[9px] text-gray-400 mt-1">Point a CNAME record to tracking.superkabe.com. Uses default if empty.</p>
                    </div>
                    <Toggle value={defaultTrackOpens} onChange={setDefaultTrackOpens} label="Track opens by default" description="Embed tracking pixel in all campaign emails" />
                    <Toggle value={defaultTrackClicks} onChange={setDefaultTrackClicks} label="Track clicks by default" description="Wrap links for click tracking in all campaigns" />
                    <Toggle value={defaultUnsubscribe} onChange={setDefaultUnsubscribe} label="Include unsubscribe link" description="Add one-click unsubscribe to all emails (CAN-SPAM)" />
                </div>
            </div>

            {/* Safety */}
            <div className="premium-card">
                <div className="flex items-center gap-2 mb-4">
                    <Shield size={14} className="text-gray-500" />
                    <h2 className="text-sm font-bold text-gray-900">Safety & Protection</h2>
                </div>
                <div className="flex flex-col gap-3">
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Global daily max (across all campaigns)</label>
                        <input type="number" min={50} max={10000} value={globalDailyMax} onChange={e => setGlobalDailyMax(parseInt(e.target.value) || 500)} className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                        <p className="text-[9px] text-gray-400 mt-1">Total emails sent per day across all campaigns and accounts combined.</p>
                    </div>
                    <div>
                        <label className="block text-[10px] font-semibold text-gray-500 uppercase mb-1">Bounce rate auto-pause threshold (%)</label>
                        <input type="number" min={1} max={10} step={0.5} value={bounceThreshold} onChange={e => setBounceThreshold(parseFloat(e.target.value) || 3)} className="w-full px-3 py-1.5 text-xs rounded-lg outline-none border border-[#D1CBC5]" />
                        <p className="text-[9px] text-gray-400 mt-1">Auto-pause account when bounce rate exceeds this threshold.</p>
                    </div>
                    <Toggle value={autoPauseOnBounce} onChange={setAutoPauseOnBounce} label="Auto-pause on high bounce rate" description="Automatically pause sending accounts when bounce threshold is breached" />
                    <Toggle value={stopOnReplyDefault} onChange={setStopOnReplyDefault} label="Stop sequence on reply (default)" description="Default setting for new campaigns — stop sending follow-ups when a lead replies" />
                </div>
            </div>

            {/* Notifications */}
            <div className="premium-card">
                <div className="flex items-center gap-2 mb-4">
                    <Bell size={14} className="text-gray-500" />
                    <h2 className="text-sm font-bold text-gray-900">Notifications</h2>
                </div>
                <div className="flex flex-col gap-3">
                    <Toggle value={notifyOnReply} onChange={setNotifyOnReply} label="Notify on reply" description="Get notified when a lead replies to your campaign email" />
                    <Toggle value={notifyOnBounce} onChange={setNotifyOnBounce} label="Notify on bounce" description="Get notified when an email bounces" />
                    <Toggle value={notifyOnComplete} onChange={setNotifyOnComplete} label="Notify on campaign complete" description="Get notified when a campaign finishes sending to all leads" />
                </div>
            </div>
            </div>

            {/* Right: Tier Stats */}
            <div className="w-[280px] shrink-0 flex flex-col gap-4">
                {/* Current Plan */}
                <div className="premium-card">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xs font-bold text-gray-900">Your Plan</h3>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: `${tierInfo.color}15`, color: tierInfo.color }}>{tierInfo.name}</span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                        {[
                            // Sending-side fields are uncapped on every tier — only sends + validation
                            // credits scale with subscription. The protection-side caps still exist
                            // but live on the protection dashboard, not here.
                            { icon: <Users size={12} />, label: 'Active Leads', value: 'Unlimited' },
                            { icon: <Globe size={12} />, label: 'Domains', value: 'Unlimited' },
                            { icon: <Mailbox size={12} />, label: 'Mailboxes', value: 'Unlimited' },
                            { icon: <Send size={12} />, label: 'Sends / Month', value: tierInfo.sends },
                            { icon: <BadgeCheck size={12} />, label: 'Validation Credits', value: tierInfo.validation },
                        ].map(stat => (
                            <div key={stat.label} className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">{stat.icon}</span>
                                    <span className="text-[10px] text-gray-500">{stat.label}</span>
                                </div>
                                <span className="text-xs font-bold text-gray-900">{stat.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Active campaigns */}
                <div className="premium-card">
                    <h3 className="text-xs font-bold text-gray-900 mb-2">Sequence Steps</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-bold text-gray-900">Unlimited</span>
                    </div>
                    <p className="text-[9px] text-gray-400 mt-1.5 leading-relaxed">
                        No limit on sequence steps per campaign. Add as many follow-up steps as your outreach strategy requires.
                    </p>
                </div>

                {/* A/B Variants — replaces the prior Daily Capacity card.
                    Daily capacity wasn't a real concept (we enforce monthly,
                    not daily, send caps), so the box was misinforming users.
                    A/B Variants is the genuinely useful sequencer concept
                    that earns this real estate. */}
                <a
                    href="/dashboard/sequencer/analytics?tab=variants"
                    className="premium-card hover:bg-[#F5F1EA] transition-colors block group"
                >
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-1.5">
                            <FlaskConical size={12} className="text-gray-500" />
                            <h3 className="text-xs font-bold text-gray-900">A/B Variants</h3>
                        </div>
                        <ArrowUpRight size={12} className="text-gray-400 group-hover:text-gray-700 transition-colors" />
                    </div>
                    <p className="text-[10px] text-gray-600 leading-relaxed mb-2">
                        Split-test up to 5 variants per step. We rotate by weight, track per-variant opens, clicks, replies, and bounces, then surface which framing actually wins.
                    </p>
                    <span className="text-[10px] font-semibold text-gray-700 group-hover:text-gray-900">
                        View variant performance →
                    </span>
                </a>

                {/* Upgrade prompt for non-enterprise */}
                {tier !== 'enterprise' && tier !== 'scale' && (
                    <a href="/dashboard/billing" className="premium-card hover:bg-[#F5F1EA] transition-colors block">
                        <div className="flex items-center gap-2 mb-1">
                            <BarChart3 size={12} className="text-gray-500" />
                            <span className="text-xs font-bold text-gray-900">Need more?</span>
                        </div>
                        <p className="text-[9px] text-gray-400 leading-relaxed">
                            Upgrade your plan to increase leads, mailboxes, sends, and validation credits.
                        </p>
                    </a>
                )}
            </div>
        </div>
    );
}
