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

  // Chart Data State
  const [campaignData, setCampaignData] = useState<any[]>([]);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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

      // Process Campaigns Distribution
      const cmap: Record<string, number> = {};
      (leadsData?.data || []).forEach((l: any) => {
        const cid = l.assigned_campaign_id || 'Unassigned';
        cmap[cid] = (cmap[cid] || 0) + 1;
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

  // Domain alerts
  const pausedDomains = domains.filter(d => d.status === 'paused');
  const warningDomains = domains.filter(d => d.status === 'warning');

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

  const hasData = (stats.active + stats.held + stats.paused) > 0 || campaigns.length > 0 || mailboxes.length > 0;

  if (!hasData) {
    return <OverviewEmptyState stats={stats} />;
  }

  return (
    <div className="grid gap-6">
      <div className="page-header">
        <h1 className="page-title">System Overview</h1>
        <p className="page-subtitle">Real-time health monitoring across your infrastructure.</p>
      </div>

      {/* 1. Critical Alerts Section */}
      {(pausedDomains.length > 0 || warningDomains.length > 0) && (
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
                    <div style={{ fontSize: '0.9rem', color: '#991B1B', marginTop: '0.5rem' }}>Reason: {d.paused_reason || 'Unknown'}</div>
                  </div>
                  <button className="premium-btn" style={{ fontSize: '0.8rem', padding: '0.5rem 1rem', background: '#EF4444' }}>
                    Fix Now
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
                <XAxis dataKey="name" stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} tick={{ dy: 10 }} />
                <YAxis stroke="#9CA3AF" fontSize={11} tickLine={false} axisLine={false} />
                <BarTooltip
                  cursor={{ fill: '#F3F4F6' }}
                  contentStyle={{ background: '#FFFFFF', border: 'none', borderRadius: '12px', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
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
