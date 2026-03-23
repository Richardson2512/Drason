'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import toast from 'react-hot-toast';
import OverviewEmptyState from '@/components/dashboard/OverviewEmptyState';
import LeadHealthChart from '@/components/dashboard/LeadHealthChart';
import TopLeadsCard from '@/components/dashboard/TopLeadsCard';
import SemiCircleGauge from '@/components/dashboard/SemiCircleGauge';
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
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all');
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

  // Color Constants
  const COLORS = {
    active: '#22c55e',
    paused: '#ef4444',
    held: '#eab308',
    healthy: '#22c55e',
    warning: '#eab308'
  };

  const leadChartData = [
    { name: 'Active', value: stats.active, color: COLORS.active },
    { name: 'Held', value: stats.held, color: COLORS.held },
    { name: 'Paused', value: stats.paused, color: COLORS.paused },
  ];

  const domainChartData = [
    { name: 'Healthy', value: domains.filter(d => d.status === 'healthy').length, color: COLORS.healthy },
    { name: 'Warning', value: domains.filter(d => d.status === 'warning').length, color: COLORS.warning },
    { name: 'Paused', value: domains.filter(d => d.status === 'paused').length, color: COLORS.paused },
  ];

  const mailboxChartData = [
    { name: 'Healthy', value: mailboxes.filter(m => m.status === 'healthy').length, color: COLORS.healthy },
    { name: 'Warning', value: mailboxes.filter(m => m.status === 'warning').length, color: COLORS.warning },
    { name: 'Paused', value: mailboxes.filter(m => m.status === 'paused').length, color: COLORS.paused },
    { name: 'Quarantine', value: mailboxes.filter(m => m.status === 'quarantine' || m.status === 'restricted_send').length, color: '#EF4444' },
  ];

  const filteredCampaignCount = campaignStatusFilter === 'all'
    ? campaigns.length
    : campaigns.filter(c => c.status === campaignStatusFilter).length;

  const hasData = (stats.active + stats.held + stats.paused) > 0 || campaigns.length > 0 || mailboxes.length > 0;

  if (!hasData) {
    return <OverviewEmptyState stats={stats} />;
  }

  return (
    <div className="grid gap-6 pb-8">
      {/* Welcome Section */}
      <div className="pb-1">
        <h2 className="text-[1.1rem] font-semibold text-indigo-600 mb-[0.125rem]">
          Welcome back, {user?.name?.split(' ')[0] || 'User'} 👋
        </h2>
        <p className="text-[0.8rem] text-gray-400">
          Here's your system overview and health status.
        </p>
      </div>

      <div className="page-header flex justify-between items-start">
        <div>
          <h1 className="page-title">System Overview</h1>
          <p className="page-subtitle">Real-time health monitoring across your infrastructure.</p>
        </div>

        {/* Trial Countdown */}
        {isTrialing && daysRemaining !== null && (
          <div
            className="px-6 py-4 rounded-xl min-w-[200px] text-center"
            style={{
              background: daysRemaining <= 3 ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
              border: `2px solid ${daysRemaining <= 3 ? '#F59E0B' : '#3B82F6'}`,
            }}
          >
            <div
              className="text-xs font-bold uppercase tracking-wide mb-1"
              style={{ color: daysRemaining <= 3 ? '#92400E' : '#1E40AF' }}
            >
              Trial Period
            </div>
            <div
              className="text-[1.75rem] font-extrabold leading-tight mb-1"
              style={{ color: daysRemaining <= 3 ? '#B45309' : '#1D4ED8' }}
            >
              {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
            </div>
            <div
              className="text-[0.7rem] font-semibold"
              style={{ color: daysRemaining <= 3 ? '#78350F' : '#1E40AF' }}
            >
              {daysRemaining <= 3 ? '⚠️ Ending Soon' : 'Remaining'}
            </div>
          </div>
        )}
      </div>

      {/* Infrastructure Stat Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card p-5 text-center">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Mailboxes
          </div>
          <div className="text-[2rem] font-extrabold text-blue-600 leading-tight">
            {mailboxes.length}
          </div>
          <div className="text-[0.7rem] text-gray-400 mt-1">
            {mailboxes.filter(m => m.status === 'healthy' || m.status === 'active').length} healthy
          </div>
        </div>
        <div className="premium-card p-5 text-center">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Leads
          </div>
          <div className="text-[2rem] font-extrabold text-violet-600 leading-tight">
            {stats.active + stats.held + stats.paused}
          </div>
          <div className="text-[0.7rem] text-gray-400 mt-1">
            {stats.active} active
          </div>
        </div>
        <div className="premium-card p-5 text-center relative">
          <div className="flex items-center justify-center gap-2 mb-2">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide">
              Campaigns
            </span>
            <select
              value={campaignStatusFilter}
              onChange={(e) => setCampaignStatusFilter(e.target.value)}
              className="text-[0.65rem] px-1.5 py-0.5 rounded-md border border-gray-200 bg-gray-50 text-gray-700 font-semibold cursor-pointer outline-none"
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div className="text-[2rem] font-extrabold text-emerald-600 leading-tight">
            {filteredCampaignCount}
          </div>
          <div className="text-[0.7rem] text-gray-400 mt-1">
            {campaignStatusFilter === 'all' ? `${campaigns.filter(c => c.status === 'active').length} active` : campaignStatusFilter}
          </div>
        </div>
        <div className="premium-card p-5 text-center">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            Domains
          </div>
          <div className="text-[2rem] font-extrabold text-amber-500 leading-tight">
            {domains.length}
          </div>
          <div className="text-[0.7rem] text-gray-400 mt-1">
            {domains.filter(d => d.status === 'healthy').length} healthy
          </div>
        </div>
      </div>

      {/* 24/7 Monitoring Status */}
      <div
        className="premium-card flex items-center gap-4 rounded-xl px-6 py-4"
        style={{
          background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
          border: '2px solid #22C55E',
        }}
      >
        <div className="w-10 h-10 rounded-[10px] bg-green-500 flex items-center justify-center text-xl shrink-0">
          ⚡
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-extrabold text-green-800 text-[0.9rem]">
              24/7 Monitoring Active
            </span>
            <span className="py-0.5 px-2 bg-green-500 text-white rounded-full text-[0.625rem] font-bold tracking-wide">
              LIVE
            </span>
          </div>
          <p className="text-xs text-green-700 m-0 leading-normal">
            Auto-syncing all connected platforms every 20 minutes • Real-time health detection • Instant protection
          </p>
        </div>
        <a
          href="/docs/help/24-7-monitoring"
          target="_blank"
          className="text-xs text-green-600 font-bold underline whitespace-nowrap shrink-0"
        >
          Learn more →
        </a>
      </div>

      {/* 1. Attention Needed Section */}
      {(pausedDomains.length > 0 || warningDomains.length > 0 || pausedMailboxes.length > 0) && (
        <div className="mb-8 bg-white border border-gray-200 rounded-2xl overflow-hidden">
          {/* Header bar with count summary */}
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <h2 className="text-base font-bold text-gray-900 m-0">Attention Needed</h2>
            </div>
            <div className="flex items-center gap-2">
              {pausedDomains.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                  {pausedDomains.length} domain{pausedDomains.length > 1 ? 's' : ''} paused
                </span>
              )}
              {pausedMailboxes.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600 border border-red-200">
                  {pausedMailboxes.length} mailbox{pausedMailboxes.length > 1 ? 'es' : ''} paused
                </span>
              )}
              {warningDomains.length > 0 && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-200">
                  {warningDomains.length} warning{warningDomains.length > 1 ? 's' : ''}
                </span>
              )}
            </div>
          </div>

          {/* Items list */}
          <div className="divide-y divide-gray-50 max-h-[320px] overflow-y-auto">
            {pausedDomains.map(d => (
              <div key={d.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <span className="text-red-500 text-sm font-bold">D</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{d.domain}</div>
                  <div className="text-xs text-gray-500 truncate">{d.paused_reason || 'Infrastructure health issue'}</div>
                </div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-red-500 shrink-0">Paused</span>
                <button
                  onClick={() => handleResumeDomainClick(d)}
                  disabled={resuming === d.id}
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resuming === d.id ? 'Resuming...' : 'Resume'}
                </button>
              </div>
            ))}
            {pausedMailboxes.map(m => (
              <div key={m.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-red-50 border border-red-200 flex items-center justify-center shrink-0">
                  <span className="text-red-500 text-sm font-bold">M</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{m.email}</div>
                  <div className="text-xs text-gray-500 truncate">{m.paused_reason || 'Health degradation detected'}</div>
                </div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-red-500 shrink-0">Paused</span>
                <button
                  onClick={() => handleResumeMailboxClick(m)}
                  disabled={resuming === m.id}
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {resuming === m.id ? 'Resuming...' : 'Resume'}
                </button>
              </div>
            ))}
            {warningDomains.map(d => (
              <div key={d.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0">
                  <span className="text-amber-500 text-sm font-bold">D</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-900 truncate">{d.domain}</div>
                  <div className="text-xs text-gray-500 truncate">High bounce rate detected</div>
                </div>
                <span className="text-[0.65rem] font-bold uppercase tracking-wide text-amber-500 shrink-0">Warning</span>
                <a
                  href="/dashboard/domains"
                  className="shrink-0 text-xs font-semibold px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-gray-700 no-underline cursor-pointer hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  View
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Visual Analytics (Gauges) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card flex flex-col items-center pt-6 pb-4">
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">Lead Status</h2>
            <p className="text-sm text-gray-500">Active vs. Paused leads</p>
          </div>
          <SemiCircleGauge
            data={leadChartData}
            centerValue={stats.active + stats.held + stats.paused}
            centerLabel="Total"
          />
        </div>

        <div className="premium-card flex flex-col items-center pt-6 pb-4">
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">Domain Health</h2>
            <p className="text-sm text-gray-500">Infrastructure reputation</p>
          </div>
          <SemiCircleGauge
            data={domainChartData}
            centerValue={domains.length}
            centerLabel="Domains"
          />
        </div>

        <div className="premium-card flex flex-col items-center pt-6 pb-4">
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">Mailbox Health</h2>
            <p className="text-sm text-gray-500">Sending capacity status</p>
          </div>
          <SemiCircleGauge
            data={mailboxChartData}
            centerValue={mailboxes.length}
            centerLabel="Mailboxes"
          />
        </div>
      </div>

      {/* Campaign Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card flex flex-col items-center pt-6 pb-4">
          <div className="text-center mb-3">
            <h2 className="text-lg font-bold text-gray-900">Active Campaigns</h2>
            <p className="text-sm text-gray-500">Lead distribution by campaign</p>
          </div>
          <SemiCircleGauge
            data={campaignData.map((c, i) => ({
              name: c.name.length > 20 ? c.name.substring(0, 20) + '...' : c.name,
              value: c.count,
              color: ['#3B82F6', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#EC4899', '#6366F1'][i % 8],
            }))}
            centerValue={campaignData.reduce((sum, c) => sum + c.count, 0)}
            centerLabel="Leads"
          />
        </div>

        {/* Lead Health Classification */}
        <LeadHealthChart />
      </div>

      {/* Top Performing Leads */}
      <TopLeadsCard campaigns={campaigns} />

      {/* Infrastructure Findings Summary */}
      {orgFindings.length > 0 && (
        <div className="premium-card rounded-[20px]">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Infrastructure Findings</h2>
            <a href="/dashboard/infrastructure" className="text-sm text-blue-500 font-semibold no-underline">
              View Details →
            </a>
          </div>
          <div className="flex gap-3 flex-wrap">
            {(() => {
              const critical = orgFindings.filter(f => f.severity === 'critical').length;
              const warning = orgFindings.filter(f => f.severity === 'warning').length;
              const info = orgFindings.filter(f => f.severity === 'info').length;
              return (
                <>
                  {critical > 0 && (
                    <span className="py-1.5 px-3 rounded-full text-[0.8rem] font-semibold bg-red-100 text-red-600 border border-red-300">
                      {critical} critical
                    </span>
                  )}
                  {warning > 0 && (
                    <span className="py-1.5 px-3 rounded-full text-[0.8rem] font-semibold bg-amber-100 text-amber-600 border border-amber-200">
                      {warning} warnings
                    </span>
                  )}
                  {info > 0 && (
                    <span className="py-1.5 px-3 rounded-full text-[0.8rem] font-semibold bg-blue-50 text-blue-600 border border-blue-200">
                      {info} info
                    </span>
                  )}
                </>
              );
            })()}
          </div>
          <div className="mt-3 flex flex-col gap-2">
            {orgFindings.filter(f => f.severity === 'critical').slice(0, 3).map((f, i) => (
              <div key={i} className="py-2 px-3 bg-red-50 rounded-lg text-sm text-red-800 font-medium">
                {f.title}
              </div>
            ))}
          </div>
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
