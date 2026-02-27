'use client';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip } from 'recharts';
import OverviewEmptyState from '@/components/dashboard/OverviewEmptyState';

export default function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [mailboxes, setMailboxes] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [userName, setUserName] = useState<string>('');
  const [subscription, setSubscription] = useState<any>(null);

  // Chart Data State
  const [campaignData, setCampaignData] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);
  const [resuming, setResuming] = useState<string | null>(null);

  const handleResumeDomain = async (domainId: string) => {
    setResuming(domainId);
    try {
      await apiClient('/api/infrastructure/domain/resume', {
        method: 'POST',
        body: JSON.stringify({ domainId })
      });
      // Refresh domains
      const domainsData = await apiClient<any>('/api/dashboard/domains');
      setDomains(domainsData?.data || []);
      alert('Domain resumed successfully!');
    } catch (err: any) {
      console.error('Failed to resume domain', err);
      alert(`Failed to resume domain: ${err.message}`);
    } finally {
      setResuming(null);
    }
  };

  const handleResumeMailbox = async (mailboxId: string) => {
    setResuming(mailboxId);
    try {
      await apiClient('/api/infrastructure/mailbox/resume', {
        method: 'POST',
        body: JSON.stringify({ mailboxId })
      });
      // Refresh mailboxes
      const mailboxesData = await apiClient<any>('/api/dashboard/mailboxes');
      setMailboxes(mailboxesData?.data || []);
      alert('Mailbox resumed successfully!');
    } catch (err: any) {
      console.error('Failed to resume mailbox', err);
      alert(`Failed to resume mailbox: ${err.message}`);
    } finally {
      setResuming(null);
    }
  };

  useEffect(() => {
    // Fetch user info for welcome message
    apiClient<any>('/api/user/me').then((response) => {
      const user = response.data || response;
      if (user?.name) setUserName(user.name);
    }).catch(() => { });

    // Fetch subscription data
    apiClient<any>('/api/billing/subscription').then((data) => {
      if (data?.success && data.data) {
        setSubscription(data.data);
      }
    }).catch(() => { });

    // Parallel Fetching — each call has its own fallback so one failure doesn't block the page
    Promise.all([
      apiClient<any>('/api/dashboard/stats').catch((e) => { console.error('Stats fetch failed:', e); return { active: 0, held: 0, paused: 0 }; }),
      apiClient<any>('/api/dashboard/leads').catch((e) => { console.error('Leads fetch failed:', e); return { leads: [], meta: {} }; }),
      apiClient<any>('/api/dashboard/domains').catch((e) => { console.error('Domains fetch failed:', e); return { domains: [], meta: {} }; }),
      apiClient<any>('/api/dashboard/mailboxes').catch((e) => { console.error('Mailboxes fetch failed:', e); return { mailboxes: [], meta: {} }; }),
      apiClient<any>('/api/dashboard/campaigns').catch((e) => { console.error('Campaigns fetch failed:', e); return { campaigns: [], meta: {} }; })
    ]).then(([statsData, leadsData, domainsData, mailboxesData, campaignsData]) => {
      setStats(statsData); // statsData is { active: ..., ... } (unwrapped by apiClient)
      setLeads(leadsData?.data || []);      // { data: [], meta: {} }
      setDomains(domainsData?.data || []);    // { data: [], meta: {} }
      setMailboxes(mailboxesData?.data || []); // { data: [], meta: {} }
      setCampaigns(campaignsData?.data || []); // { data: [], meta: {} }

      // Process Campaigns Distribution — map IDs to readable names
      const cmap: Record<string, number> = {};
      const campaignsList = campaignsData?.data || [];
      const cNameMap = new Map(campaignsList.map((c: any) => [c.id, c.name || c.id]));
      (leadsData?.data || []).forEach((l: any) => {
        const cid = l.assigned_campaign_id || 'Unassigned';
        const displayName = cNameMap.get(cid) || cid;
        cmap[displayName] = (cmap[displayName] || 0) + 1;
      });
      setCampaignData(Object.keys(cmap).map(k => ({ name: k, count: cmap[k] })));
    }).catch((e) => {
      console.error('Dashboard load error:', e);
      setError(e.message || 'Failed to load dashboard');
      // Still set stats to empty so we don't stay stuck on loading forever
      setStats({ active: 0, held: 0, paused: 0 });
    });
  }, []);

  if (error) return <div style={{ padding: '2rem', color: '#EF4444' }}>Error: {error}</div>;
  if (!stats) return <div style={{ padding: '2rem' }}>Loading Control Plane...</div>;

  // Calculate trial days remaining
  const calculateDaysRemaining = () => {
    if (!subscription?.trial_ends_at) return null;
    const now = new Date();
    const trialEnd = new Date(subscription.trial_ends_at);
    const diffTime = trialEnd.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  };

  const daysRemaining = calculateDaysRemaining();
  const isTrialing = subscription?.subscription_status === 'trialing';

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
    { name: 'Healthy', value: mailboxes.filter(m => m.status === 'healthy' || m.status === 'active').length, color: COLORS.healthy },
    { name: 'Warning', value: mailboxes.filter(m => m.status === 'warning').length, color: COLORS.warning },
    { name: 'Paused', value: mailboxes.filter(m => m.status === 'paused').length, color: COLORS.paused },
  ];

  // Campaign status filter for stat box
  const [campaignStatusFilter, setCampaignStatusFilter] = useState<string>('all');
  const filteredCampaignCount = campaignStatusFilter === 'all'
    ? campaigns.length
    : campaigns.filter(c => c.status === campaignStatusFilter).length;

  const hasData = (stats.active + stats.held + stats.paused) > 0 || campaigns.length > 0 || mailboxes.length > 0;

  if (!hasData) {
    return <OverviewEmptyState stats={stats} />;
  }

  return (
    <div className="grid gap-6" style={{ paddingBottom: '2rem' }}>
      {/* Welcome Section */}
      <div style={{ paddingBottom: '0.25rem' }}>
        <h2 style={{
          fontSize: '1.1rem',
          fontWeight: '600',
          color: '#4F46E5',
          marginBottom: '0.125rem'
        }}>
          Welcome back, {userName || 'User'} 👋
        </h2>
        <p style={{ fontSize: '0.8rem', color: '#9CA3AF' }}>
          Here's your system overview and health status.
        </p>
      </div>

      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">System Overview</h1>
          <p className="page-subtitle">Real-time health monitoring across your infrastructure.</p>
        </div>

        {/* Trial Countdown */}
        {isTrialing && daysRemaining !== null && (
          <div style={{
            padding: '1rem 1.5rem',
            background: daysRemaining <= 3 ? 'linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%)' : 'linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%)',
            border: `2px solid ${daysRemaining <= 3 ? '#F59E0B' : '#3B82F6'}`,
            borderRadius: '12px',
            minWidth: '200px',
            textAlign: 'center'
          }}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: daysRemaining <= 3 ? '#92400E' : '#1E40AF',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.25rem'
            }}>
              Trial Period
            </div>
            <div style={{
              fontSize: '1.75rem',
              fontWeight: 800,
              color: daysRemaining <= 3 ? '#B45309' : '#1D4ED8',
              lineHeight: 1.2,
              marginBottom: '0.25rem'
            }}>
              {daysRemaining} {daysRemaining === 1 ? 'Day' : 'Days'}
            </div>
            <div style={{
              fontSize: '0.7rem',
              color: daysRemaining <= 3 ? '#78350F' : '#1E40AF',
              fontWeight: 600
            }}>
              {daysRemaining <= 3 ? '⚠️ Ending Soon' : 'Remaining'}
            </div>
          </div>
        )}
      </div>

      {/* Infrastructure Stat Boxes */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="premium-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Mailboxes
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#2563EB', lineHeight: 1.2 }}>
            {mailboxes.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
            {mailboxes.filter(m => m.status === 'healthy' || m.status === 'active').length} healthy
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Leads
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#7C3AED', lineHeight: 1.2 }}>
            {stats.active + stats.held + stats.paused}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
            {stats.active} active
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1.25rem', textAlign: 'center', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Campaigns
            </span>
            <select
              value={campaignStatusFilter}
              onChange={(e) => setCampaignStatusFilter(e.target.value)}
              style={{
                fontSize: '0.65rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                background: '#F9FAFB',
                color: '#374151',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
            {filteredCampaignCount}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
            {campaignStatusFilter === 'all' ? `${campaigns.filter(c => c.status === 'active').length} active` : campaignStatusFilter}
          </div>
        </div>
        <div className="premium-card" style={{ padding: '1.25rem', textAlign: 'center' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.5rem' }}>
            Domains
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 800, color: '#F59E0B', lineHeight: 1.2 }}>
            {domains.length}
          </div>
          <div style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
            {domains.filter(d => d.status === 'healthy').length} healthy
          </div>
        </div>
      </div>

      {/* 24/7 Monitoring Status */}
      <div className="premium-card" style={{
        background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
        border: '2px solid #22C55E',
        padding: '1rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        borderRadius: '12px'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: '#22C55E',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.25rem',
          flexShrink: 0
        }}>
          ⚡
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 800, color: '#166534', fontSize: '0.9rem' }}>
              24/7 Monitoring Active
            </span>
            <span style={{
              padding: '0.125rem 0.5rem',
              background: '#22C55E',
              color: 'white',
              borderRadius: '999px',
              fontSize: '0.625rem',
              fontWeight: 700,
              letterSpacing: '0.05em'
            }}>
              LIVE
            </span>
          </div>
          <p style={{ fontSize: '0.75rem', color: '#15803D', margin: 0, lineHeight: 1.5 }}>
            Auto-syncing from Smartlead every 20 minutes • Real-time health detection • Instant protection
          </p>
        </div>
        <a
          href="/docs/help/24-7-monitoring"
          target="_blank"
          style={{
            fontSize: '0.75rem',
            color: '#16A34A',
            fontWeight: 700,
            textDecoration: 'underline',
            whiteSpace: 'nowrap',
            flexShrink: 0
          }}
        >
          Learn more →
        </a>
      </div>

      {/* 1. Critical Alerts Section */}
      {(pausedDomains.length > 0 || warningDomains.length > 0 || pausedMailboxes.length > 0) && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', color: '#EF4444', marginBottom: '1rem', fontWeight: '700', paddingLeft: '0.5rem' }}>
            ⚠️ Critical Attention Needed
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pausedDomains.map(d => (
              <div key={d.id} className="premium-card" style={{ borderLeft: '6px solid #EF4444', background: '#FEF2F2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: '#B91C1C', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Domain Paused</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#7F1D1D' }}>{d.domain}</div>
                    <div style={{ fontSize: '0.9rem', color: '#991B1B', marginTop: '0.5rem' }}>Reason: {d.paused_reason || 'Infrastructure health issue'}</div>
                  </div>
                  <button
                    onClick={() => handleResumeDomain(d.id)}
                    disabled={resuming === d.id}
                    className="premium-btn"
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.5rem 1rem',
                      background: resuming === d.id ? '#9CA3AF' : '#EF4444',
                      cursor: resuming === d.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resuming === d.id ? 'Resuming...' : 'Fix Now'}
                  </button>
                </div>
              </div>
            ))}
            {pausedMailboxes.map(m => (
              <div key={m.id} className="premium-card" style={{ borderLeft: '6px solid #EF4444', background: '#FEF2F2' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div>
                    <div style={{ fontWeight: '800', color: '#B91C1C', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Mailbox Paused</div>
                    <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#7F1D1D' }}>{m.email}</div>
                    <div style={{ fontSize: '0.9rem', color: '#991B1B', marginTop: '0.5rem' }}>Reason: {m.paused_reason || 'Health degradation detected'}</div>
                  </div>
                  <button
                    onClick={() => handleResumeMailbox(m.id)}
                    disabled={resuming === m.id}
                    className="premium-btn"
                    style={{
                      fontSize: '0.8rem',
                      padding: '0.5rem 1rem',
                      background: resuming === m.id ? '#9CA3AF' : '#EF4444',
                      cursor: resuming === m.id ? 'not-allowed' : 'pointer'
                    }}
                  >
                    {resuming === m.id ? 'Resuming...' : 'Fix Now'}
                  </button>
                </div>
              </div>
            ))}
            {warningDomains.map(d => (
              <div key={d.id} className="premium-card" style={{ borderLeft: '6px solid #EAB308', background: '#FFFBEB' }}>
                <div style={{ fontWeight: '800', color: '#B45309', fontSize: '0.875rem', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Domain Warning</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '600', color: '#78350F' }}>{d.domain}</div>
                <div style={{ fontSize: '0.9rem', color: '#92400E', marginTop: '0.5rem' }}>High bounce rate detected</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 2. Visual Analytics (Charts) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>Lead Status</h2>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Active vs. Paused leads</p>
            </div>
            <div style={{ background: '#F3F4F6', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '600', color: '#374151' }}>
              Total: {stats.active + stats.held + stats.paused}
            </div>
          </div>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={leadChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {leadChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>Domain Health</h2>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Infrastructure reputation</p>
            </div>
            <div style={{ background: '#F0FDF4', color: '#16A34A', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
              {domains.length} Total
            </div>
          </div>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={domainChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {domainChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Mailbox and Campaign Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>Mailbox Health</h2>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Sending capacity status</p>
            </div>
            <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
              {mailboxes.length} Total
            </div>
          </div>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={mailboxChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {mailboxChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }} itemStyle={{ fontWeight: 600 }} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="premium-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <div>
              <h2 style={{ fontSize: '1.125rem', fontWeight: '700', color: '#111827' }}>Active Campaigns</h2>
              <p style={{ fontSize: '0.875rem', color: '#6B7280' }}>Lead distribution by campaign</p>
            </div>
            <div style={{ background: '#EFF6FF', color: '#2563EB', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.75rem', fontWeight: '700' }}>
              {campaigns.length} Active
            </div>
          </div>
          <div style={{ height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={campaignData}>
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} tickLine={false} axisLine={false} tick={{ dy: 10 }} tickFormatter={(v: string) => v.length > 15 ? v.substring(0, 15) + '...' : v} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <BarTooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '0.75rem 1rem' }}
                  formatter={(value: any) => [`${value} leads`, 'Leads']}
                  labelFormatter={(label: any) => String(label).length > 30 ? String(label).substring(0, 30) + '...' : String(label)}
                />
                <Bar dataKey="count" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} barSize={40}>
                  {campaignData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#gradient-${index})`} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.8} />
                  </linearGradient>
                  {campaignData.map((entry, index) => (
                    <linearGradient key={`gradient-${index}`} id={`gradient-${index}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                      <stop offset="100%" stopColor="#60A5FA" stopOpacity={1} />
                    </linearGradient>
                  ))}
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
