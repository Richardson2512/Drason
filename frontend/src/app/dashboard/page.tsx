'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import { Activity, AlertTriangle, ArrowRight, Clock, Users, Rocket, Mailbox as MailboxIcon, Globe, HeartPulse } from 'lucide-react';
import OverviewEmptyState from '@/components/dashboard/OverviewEmptyState';
import LeadHealthChart from '@/components/dashboard/LeadHealthChart';
import TopLeadsCard from '@/components/dashboard/TopLeadsCard';
import EntityStatsBar from '@/components/ui/EntityStatsBar';
import { useDashboard } from '@/contexts/DashboardContext';
import LoadingSkeleton from '@/components/ui/LoadingSkeleton';
import ConfirmActionModal from '@/components/modals/ConfirmActionModal';
import type { DashboardStats, DomainSummary, MailboxSummary, CampaignSummary, ChartEntry, OrgFinding } from '@/types/api';

export default function Overview() {
  const { user, subscription } = useDashboard();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [leads, setLeads] = useState<Record<string, unknown>[]>([]);
  const [domains, setDomains] = useState<DomainSummary[]>([]);
  const [mailboxes, setMailboxes] = useState<MailboxSummary[]>([]);
  const [campaigns, setCampaigns] = useState<CampaignSummary[]>([]);

  // Chart Data State
  const [campaignData, setCampaignData] = useState<ChartEntry[]>([]);

  const [orgFindings, setOrgFindings] = useState<OrgFinding[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState<string | null>(null);
  const [confirmResume, setConfirmResume] = useState<{ type: 'domain' | 'mailbox'; id: string; name: string; reason: string } | null>(null);

  const handleResumeDomainClick = (d: DomainSummary) => {
    setConfirmResume({
      type: 'domain',
      id: d.id,
      name: d.domain,
      reason: d.paused_reason || 'Infrastructure health issue',
    });
  };

  const handleResumeMailboxClick = (m: MailboxSummary) => {
    setConfirmResume({
      type: 'mailbox',
      id: m.id,
      name: m.email,
      reason: m.paused_reason || 'Health degradation detected',
    });
  };

  const executeResume = async () => {
    if (!confirmResume) return;
    const { type, id } = confirmResume;
    setResuming(id);
    try {
      if (type === 'domain') {
        await apiClient('/api/infrastructure/domain/resume', {
          method: 'POST',
          body: JSON.stringify({ domainId: id })
        });
        const domainsData = await apiClient<{ data: DomainSummary[] }>('/api/dashboard/domains?limit=1000');
        setDomains(domainsData?.data || []);
        toast.success('Domain resumed and re-added to campaigns on platform');
      } else {
        await apiClient('/api/infrastructure/mailbox/resume', {
          method: 'POST',
          body: JSON.stringify({ mailboxId: id })
        });
        const mailboxesData = await apiClient<{ data: MailboxSummary[] }>('/api/dashboard/mailboxes?limit=1000');
        setMailboxes(mailboxesData?.data || []);
        toast.success('Mailbox resumed and re-added to campaigns on platform');
      }
    } catch (err: any) {
      console.error(`Failed to resume ${type}`, err);
      toast.error(`Failed to resume ${type}: ${err.message}`);
    } finally {
      setResuming(null);
      setConfirmResume(null);
    }
  };

  useEffect(() => {
    // Parallel Fetching — each call has its own fallback so one failure doesn't block the page
    Promise.all([
      apiClient<DashboardStats>('/api/dashboard/stats').catch((e) => { console.error('Stats fetch failed:', e); return { active: 0, held: 0, paused: 0 } as DashboardStats; }),
      apiClient<{ data: Record<string, unknown>[] }>('/api/dashboard/leads').catch((e) => { console.error('Leads fetch failed:', e); return { data: [] }; }),
      apiClient<{ data: DomainSummary[] }>('/api/dashboard/domains?limit=1000').catch((e) => { console.error('Domains fetch failed:', e); return { data: [] }; }),
      apiClient<{ data: MailboxSummary[] }>('/api/dashboard/mailboxes?limit=1000').catch((e) => { console.error('Mailboxes fetch failed:', e); return { data: [] }; }),
      apiClient<{ data: CampaignSummary[] }>('/api/dashboard/campaigns?limit=1000').catch((e) => { console.error('Campaigns fetch failed:', e); return { data: [] }; }),
      apiClient<{ findings: OrgFinding[] }>('/api/findings').catch(() => ({ findings: [] }))
    ]).then(([statsData, leadsData, domainsData, mailboxesData, campaignsData, findingsData]) => {
      setStats(statsData); // statsData is { active: ..., ... } (unwrapped by apiClient)
      setLeads(leadsData?.data || []);      // { data: [], meta: {} }
      setDomains(domainsData?.data || []);    // { data: [], meta: {} }
      setMailboxes(mailboxesData?.data || []); // { data: [], meta: {} }
      setCampaigns(campaignsData?.data || []); // { data: [], meta: {} }

      // Process Campaigns Distribution — map IDs to readable names
      const cmap: Record<string, number> = {};
      const campaignsList = campaignsData?.data || [];
      const cNameMap = new Map(campaignsList.map((c: CampaignSummary) => [c.id, c.name || c.id]));
      (leadsData?.data || []).forEach((l: Record<string, any>) => {
        const cid = (l.assigned_campaign_id || 'Unassigned') as string;
        const displayName = cNameMap.get(cid) || cid;
        cmap[displayName] = (cmap[displayName] || 0) + 1;
      });
      setCampaignData(Object.keys(cmap).map(k => ({ name: k, count: cmap[k] })));
      setOrgFindings(findingsData?.findings || []);
    }).catch((e) => {
      console.error('Dashboard load error:', e);
      setError(e.message || 'Failed to load dashboard');
      // Still set stats to empty so we don't stay stuck on loading forever
      setStats({ active: 0, held: 0, paused: 0 });
    });
  }, []);

  // Auto-refresh when infrastructure assessment completes
  useEffect(() => {
    const handler = () => {
      Promise.all([
        apiClient<DashboardStats>('/api/dashboard/stats').catch(() => null),
        apiClient<{ data: DomainSummary[] }>('/api/dashboard/domains?limit=1000').catch(() => null),
        apiClient<{ data: MailboxSummary[] }>('/api/dashboard/mailboxes?limit=1000').catch(() => null),
        apiClient<{ data: CampaignSummary[] }>('/api/dashboard/campaigns?limit=1000').catch(() => null),
      ]).then(([statsData, domainsData, mailboxesData, campaignsData]) => {
        if (statsData) setStats(statsData);
        if (domainsData?.data) setDomains(domainsData.data);
        if (mailboxesData?.data) setMailboxes(mailboxesData.data);
        if (campaignsData?.data) setCampaigns(campaignsData.data);
      });
    };
    window.addEventListener('assessment-complete', handler);
    return () => window.removeEventListener('assessment-complete', handler);
  }, []);

  if (error) return <div className="p-8 text-red-500">Error: {error}</div>;
  if (!stats) return <div className="p-8"><LoadingSkeleton type="stat" rows={4} /></div>;

  // Calculate trial days remaining from context subscription
  const daysRemaining = (() => {
    if (!subscription?.trialEndsAt) return null;
    const diff = new Date(subscription.trialEndsAt).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();
  const isTrialing = subscription?.status === 'trialing';

  // Domain and Mailbox alerts
  const pausedDomains = domains.filter(d => d.status === 'paused');
  const warningDomains = domains.filter(d => d.status === 'warning');
  const pausedMailboxes = mailboxes.filter(m => m.status === 'paused');

  const hasData = (stats.active + stats.held + stats.paused) > 0 || campaigns.length > 0 || mailboxes.length > 0;

  // Counts used by the stat bars
  const totalLeads = stats.active + stats.held + stats.paused;
  const totalAttention = pausedDomains.length + warningDomains.length + pausedMailboxes.length;

  if (!hasData) {
    return <OverviewEmptyState stats={stats} />;
  }

  const criticalFindings = orgFindings.filter(f => f.severity === 'critical').length;
  const warningFindings = orgFindings.filter(f => f.severity === 'warning').length;
  const infoFindings = orgFindings.filter(f => f.severity === 'info').length;

  return (
    <div className="p-4 flex flex-col gap-4 pb-8">
      {/* ─── Page header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            {user?.name?.split(' ')[0] ? `Welcome back, ${user.name.split(' ')[0]}` : 'System Overview'}
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">Real-time health monitoring across your infrastructure.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* Monitoring status — unobtrusive, replaces the old green gradient banner */}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-gray-700">24/7 monitoring</span>
            <span className="text-[10px] text-gray-400">· syncs every 20 min</span>
          </div>
          {/* Trial countdown — now a quiet pill, not a gradient card */}
          {isTrialing && daysRemaining !== null && (
            <Link
              href="/dashboard/billing"
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border no-underline transition-colors"
              style={{
                background: daysRemaining <= 3 ? '#FEF3C7' : '#F9FAFB',
                borderColor: daysRemaining <= 3 ? '#FCD34D' : '#E5E7EB',
                color: daysRemaining <= 3 ? '#92400E' : '#374151',
              }}
            >
              <Clock size={12} strokeWidth={1.75} />
              <span className="text-xs font-semibold">
                Trial · {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} left
              </span>
            </Link>
          )}
        </div>
      </div>

      {/* ─── Unified stats bar — replaces 4 colored stat tiles ───── */}
      <EntityStatsBar
        totalLabel="Overview"
        total={totalLeads + mailboxes.length + domains.length + campaigns.length}
        stats={[
          { key: 'leads',     label: 'Leads',     value: totalLeads,       color: '#8b5cf6' },
          { key: 'campaigns', label: 'Campaigns', value: campaigns.length, color: '#22c55e' },
          { key: 'mailboxes', label: 'Mailboxes', value: mailboxes.length, color: '#3b82f6' },
          { key: 'domains',   label: 'Domains',   value: domains.length,   color: '#f59e0b' },
        ]}
      />

      {/* ─── Attention Needed ────────────────────────────────────── */}
      {totalAttention > 0 && (
        <div className="premium-card p-0 overflow-hidden">
          <div className="px-4 py-3 flex items-center justify-between border-b border-gray-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={14} strokeWidth={1.75} className="text-gray-700" />
              <h2 className="text-sm font-semibold text-gray-900 m-0">Attention needed</h2>
              <span className="text-xs text-gray-400">({totalAttention})</span>
            </div>
            <div className="flex items-center gap-1.5">
              {pausedDomains.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {pausedDomains.length} domain paused
                </span>
              )}
              {pausedMailboxes.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                  {pausedMailboxes.length} mailbox paused
                </span>
              )}
              {warningDomains.length > 0 && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md bg-gray-50 border border-gray-200 text-gray-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  {warningDomains.length} warning
                </span>
              )}
            </div>
          </div>

          <div className="divide-y divide-gray-100 max-h-[320px] overflow-y-auto scrollbar-hide">
            {pausedDomains.map(d => (
              <AttentionRow
                key={d.id}
                kind="Domain"
                tone="critical"
                name={d.domain}
                reason={d.paused_reason || 'Infrastructure health issue'}
                status="Paused"
                actionLabel={resuming === d.id ? 'Resuming…' : 'Resume'}
                onAction={() => handleResumeDomainClick(d)}
                actionDisabled={resuming === d.id}
              />
            ))}
            {pausedMailboxes.map(m => (
              <AttentionRow
                key={m.id}
                kind="Mailbox"
                tone="critical"
                name={m.email}
                reason={m.paused_reason || 'Health degradation detected'}
                status="Paused"
                actionLabel={resuming === m.id ? 'Resuming…' : 'Resume'}
                onAction={() => handleResumeMailboxClick(m)}
                actionDisabled={resuming === m.id}
              />
            ))}
            {warningDomains.map(d => (
              <AttentionRow
                key={d.id}
                kind="Domain"
                tone="warning"
                name={d.domain}
                reason="High bounce rate detected"
                status="Warning"
                actionLabel="View"
                actionHref="/dashboard/domains"
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Breakdown cards: 4 entity classes with stacked bars ─── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <BreakdownCard
          title="Leads"
          icon={<Users size={14} strokeWidth={1.75} />}
          total={totalLeads}
          href="/dashboard/leads"
          segments={[
            { label: 'Active',   value: stats.active,  color: '#22c55e' },
            { label: 'Held',     value: stats.held,    color: '#3b82f6' },
            { label: 'Paused',   value: stats.paused,  color: '#ef4444' },
          ]}
        />
        <BreakdownCard
          title="Campaigns"
          icon={<Rocket size={14} strokeWidth={1.75} />}
          total={campaigns.length}
          href="/dashboard/campaigns"
          segments={[
            { label: 'Active',    value: campaigns.filter(c => c.status === 'active').length,    color: '#22c55e' },
            { label: 'Paused',    value: campaigns.filter(c => c.status === 'paused').length,    color: '#ef4444' },
            { label: 'Completed', value: campaigns.filter(c => c.status === 'completed').length, color: '#9ca3af' },
          ]}
        />
        <BreakdownCard
          title="Mailboxes"
          icon={<MailboxIcon size={14} strokeWidth={1.75} />}
          total={mailboxes.length}
          href="/dashboard/mailboxes"
          segments={[
            { label: 'Healthy', value: mailboxes.filter(m => m.status === 'healthy' || m.status === 'active').length, color: '#22c55e' },
            { label: 'Warning', value: mailboxes.filter(m => m.status === 'warning').length,                          color: '#f59e0b' },
            { label: 'Paused',  value: mailboxes.filter(m => m.status === 'paused').length,                           color: '#ef4444' },
            { label: 'Healing', value: mailboxes.filter(m => m.status === 'quarantine' || m.status === 'restricted_send' || m.status === 'warm_recovery').length, color: '#9ca3af' },
          ]}
        />
        <BreakdownCard
          title="Domains"
          icon={<Globe size={14} strokeWidth={1.75} />}
          total={domains.length}
          href="/dashboard/domains"
          segments={[
            { label: 'Healthy', value: domains.filter(d => d.status === 'healthy').length, color: '#22c55e' },
            { label: 'Warning', value: domains.filter(d => d.status === 'warning').length, color: '#f59e0b' },
            { label: 'Paused',  value: domains.filter(d => d.status === 'paused').length,  color: '#ef4444' },
          ]}
        />
      </div>

      {/* ─── Healing pipeline progress ─────────────────────────── */}
      <div className="premium-card p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <HeartPulse size={14} strokeWidth={1.75} className="text-gray-700" />
            <h2 className="text-sm font-semibold text-gray-900 m-0">Healing Pipeline</h2>
            <span className="text-xs text-gray-400">mailboxes recovering</span>
          </div>
          <Link href="/dashboard/healing" className="text-xs text-gray-600 font-semibold hover:text-gray-900 flex items-center gap-1 no-underline">
            View pipeline <ArrowRight size={11} strokeWidth={1.75} />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2">
          <HealingPhase
            label="Paused"
            count={mailboxes.filter(m => m.status === 'paused').length}
            description="Bounce / DNSBL trigger"
          />
          <HealingPhase
            label="Quarantine"
            count={mailboxes.filter(m => m.status === 'quarantine').length}
            description="DNS verification"
            isCurrent
          />
          <HealingPhase
            label="Restricted"
            count={mailboxes.filter(m => m.status === 'restricted_send').length}
            description="15 clean sends"
            isCurrent
          />
          <HealingPhase
            label="Warming"
            count={mailboxes.filter(m => m.status === 'warm_recovery').length}
            description="50 sends / 3 days"
            isCurrent
          />
          <HealingPhase
            label="Healthy"
            count={mailboxes.filter(m => m.status === 'healthy' || m.status === 'active').length}
            description="Back in rotation"
            isEnd
          />
        </div>
      </div>

      {/* ─── Lead distribution + lead health ────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="premium-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-900 m-0">Leads by campaign</h2>
            <span className="text-xs text-gray-400">top {Math.min(campaignData.length, 6)}</span>
          </div>
          {campaignData.length === 0 ? (
            <div className="text-xs text-gray-400 text-center py-8">No campaign activity yet</div>
          ) : (
            <div className="flex flex-col gap-2">
              {(() => {
                const sorted = [...campaignData].sort((a, b) => b.count - a.count).slice(0, 6);
                const maxCount = Math.max(...sorted.map(c => c.count), 1);
                return sorted.map((c, i) => (
                  <div key={`${c.name}-${i}`} className="flex items-center gap-3">
                    <div className="text-xs text-gray-700 font-medium min-w-0 flex-1 truncate">{c.name}</div>
                    <div className="flex-[2] h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gray-900 rounded-full transition-all"
                        style={{ width: `${(c.count / maxCount) * 100}%` }}
                      />
                    </div>
                    <div className="text-xs font-bold text-gray-900 tabular-nums w-10 text-right">{c.count}</div>
                  </div>
                ));
              })()}
            </div>
          )}
        </div>
        <LeadHealthChart />
      </div>

      {/* ─── Top leads ──────────────────────────────────────────── */}
      <TopLeadsCard campaigns={campaigns} />

      {/* ─── Infrastructure findings ────────────────────────────── */}
      {orgFindings.length > 0 && (
        <div className="premium-card p-4">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Activity size={14} strokeWidth={1.75} className="text-gray-700" />
              <h2 className="text-sm font-semibold text-gray-900 m-0">Infrastructure findings</h2>
            </div>
            <Link href="/dashboard/infrastructure" className="text-xs text-gray-600 font-semibold hover:text-gray-900 flex items-center gap-1 no-underline">
              View details <ArrowRight size={11} strokeWidth={1.75} />
            </Link>
          </div>
          <div className="flex gap-1.5 flex-wrap mb-3">
            {criticalFindings > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {criticalFindings} critical
              </span>
            )}
            {warningFindings > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {warningFindings} warnings
              </span>
            )}
            {infoFindings > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-50 border border-gray-200 text-[11px] font-semibold text-gray-700">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" /> {infoFindings} info
              </span>
            )}
          </div>
          {orgFindings.filter(f => f.severity === 'critical').slice(0, 3).length > 0 && (
            <div className="flex flex-col gap-1.5">
              {orgFindings.filter(f => f.severity === 'critical').slice(0, 3).map((f, i) => (
                <div key={i} className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-800 font-medium flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0" />
                  {f.title}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Resume Confirmation Modal */}
      {confirmResume && (
        <ConfirmActionModal
          isOpen={true}
          title={confirmResume.type === 'domain' ? 'Resume Domain' : 'Resume Mailbox'}
          icon="⚠️"
          message={
            confirmResume.type === 'domain'
              ? `Are you sure you want to resume domain "${confirmResume.name}"? This will re-add its mailboxes to campaigns on the email platform.`
              : `Are you sure you want to resume mailbox "${confirmResume.name}"? This will re-add it to campaigns on the email platform.`
          }
          detail={confirmResume.reason}
          consequences={
            confirmResume.type === 'domain'
              ? [
                  'Domain will be marked as healthy in Superkabe',
                  'All healthy mailboxes under this domain will be re-added to their campaigns on the platform',
                  'If the underlying issue (blacklist, DNS) is not resolved, the domain will be paused again at the next assessment',
                ]
              : [
                  'Mailbox will be marked as healthy in Superkabe',
                  'Mailbox will be re-added to its campaigns on the platform',
                  'If the underlying issue (bounce rate, connectivity) is not resolved, the mailbox will be paused again at the next assessment',
                ]
          }
          variant="danger"
          confirmLabel={`Resume ${confirmResume.type === 'domain' ? 'Domain' : 'Mailbox'}`}
          cancelLabel="Cancel"
          loading={resuming === confirmResume.id}
          onConfirm={executeResume}
          onCancel={() => setConfirmResume(null)}
        />
      )}
    </div>
  );
}

// ─── Local presentational helpers ────────────────────────────────────────

interface Segment {
    label: string;
    value: number;
    color: string;
}

function BreakdownCard({ title, icon, total, segments, href }: {
    title: string;
    icon: React.ReactNode;
    total: number;
    segments: Segment[];
    href?: string;
}) {
    const sum = segments.reduce((a, s) => a + s.value, 0) || 1;
    return (
        <div className="premium-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-gray-600">{icon}</span>
                    <h2 className="text-sm font-semibold text-gray-900 m-0">{title}</h2>
                </div>
                {href && (
                    <Link href={href} className="text-[11px] text-gray-500 hover:text-gray-900 flex items-center gap-0.5 no-underline font-medium">
                        View <ArrowRight size={10} strokeWidth={2} />
                    </Link>
                )}
            </div>
            <div className="text-3xl font-bold text-gray-900 tabular-nums leading-none">{total.toLocaleString()}</div>
            {/* Stacked bar */}
            <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden flex">
                {segments.map((s, i) => {
                    const pct = (s.value / sum) * 100;
                    if (pct === 0) return null;
                    return (
                        <div
                            key={`${s.label}-${i}`}
                            style={{ width: `${pct}%`, background: s.color }}
                            className="h-full"
                            title={`${s.label}: ${s.value}`}
                        />
                    );
                })}
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-3 gap-y-1">
                {segments.map((s, i) => (
                    <div key={`${s.label}-legend-${i}`} className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: s.color }} />
                        <span className="text-[11px] text-gray-500">{s.label}</span>
                        <span className="text-[11px] font-semibold text-gray-900 tabular-nums">{s.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function HealingPhase({ label, count, description, isCurrent, isEnd }: {
    label: string;
    count: number;
    description: string;
    isCurrent?: boolean;
    isEnd?: boolean;
}) {
    const dotColor = isEnd
        ? '#22c55e'
        : isCurrent
            ? '#3b82f6'
            : '#ef4444';
    return (
        <div className="relative flex flex-col items-center gap-1.5 py-3 px-2 rounded-lg border border-gray-200 bg-gray-50/40">
            <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
                <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600">{label}</span>
            </div>
            <div className="text-2xl font-bold text-gray-900 tabular-nums leading-none">{count}</div>
            <div className="text-[10px] text-gray-400 text-center leading-tight">{description}</div>
        </div>
    );
}

function AttentionRow({ kind, tone, name, reason, status, actionLabel, actionHref, onAction, actionDisabled }: {
    kind: 'Domain' | 'Mailbox';
    tone: 'critical' | 'warning';
    name: string;
    reason: string;
    status: string;
    actionLabel: string;
    actionHref?: string;
    onAction?: () => void;
    actionDisabled?: boolean;
}) {
    const dotColor = tone === 'critical' ? '#ef4444' : '#f59e0b';
    const btnClass = 'shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed no-underline';
    return (
        <div className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
            <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: dotColor }} />
            <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 shrink-0 w-[60px]">{kind}</span>
            <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate">{name}</div>
                <div className="text-xs text-gray-500 truncate">{reason}</div>
            </div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 shrink-0">{status}</span>
            {actionHref ? (
                <Link href={actionHref} className={btnClass}>{actionLabel}</Link>
            ) : (
                <button onClick={onAction} disabled={actionDisabled} className={btnClass}>{actionLabel}</button>
            )}
        </div>
    );
}
