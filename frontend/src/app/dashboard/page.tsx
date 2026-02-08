'use client';
import { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Parallel Fetching
    Promise.all([
      fetch('/api/dashboard/stats').then(res => res.json()),
      fetch('/api/dashboard/leads').then(res => res.json()),
      fetch('/api/dashboard/domains').then(res => res.json()),
      fetch('/api/dashboard/mailboxes').then(res => res.json()),
      fetch('/api/dashboard/campaigns').then(res => res.json()).catch(() => [])
    ]).then(([statsData, leadsData, domainsData, mailboxesData, campaignsData]) => {
      setStats(statsData);
      setLeads(leadsData);
      setDomains(domainsData);
      setMailboxes(mailboxesData);
      setCampaigns(campaignsData);

      // Process Campaigns Distribution
      const cmap: Record<string, number> = {};
      leadsData.forEach((l: any) => {
        const cid = l.assigned_campaign_id || 'Unassigned';
        cmap[cid] = (cmap[cid] || 0) + 1;
      });
      setCampaignData(Object.keys(cmap).map(k => ({ name: k, count: cmap[k] })));
    });
  }, []);

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
    { name: 'Active', value: stats.activeCount, color: COLORS.active },
    { name: 'Held', value: stats.heldCount, color: COLORS.held },
    { name: 'Paused', value: stats.pausedCount, color: COLORS.paused },
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

  const hasData = (stats.activeCount + stats.heldCount + stats.pausedCount) > 0 || campaigns.length > 0 || mailboxes.length > 0;

  if (!hasData) {
    return <OverviewEmptyState stats={stats} />;
  }

  return (
    <div className="grid">
      <div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem' }}>System Overview</h1>

        {/* 1. Critical Alerts Section */}
        {(pausedDomains.length > 0 || warningDomains.length > 0) && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1rem', color: '#ef4444', marginBottom: '0.5rem', fontWeight: '600' }}>Critical Attention Needed</h2>
            <div className="grid grid-cols-2">
              {pausedDomains.map(d => (
                <div key={d.id} className="card" style={{ borderLeft: '4px solid #ef4444' }}>
                  <div style={{ fontWeight: 'bold', color: '#ef4444' }}>DOMAIN PAUSED</div>
                  <div style={{ fontSize: '1.125rem' }}>{d.domain}</div>
                  <div style={{ fontSize: '0.875rem', color: '#a3a3a3' }}>Reason: {d.paused_reason || 'Unknown'}</div>
                </div>
              ))}
              {warningDomains.map(d => (
                <div key={d.id} className="card" style={{ borderLeft: '4px solid #eab308' }}>
                  <div style={{ fontWeight: 'bold', color: '#eab308' }}>DOMAIN WARNING</div>
                  <div style={{ fontSize: '1.125rem' }}>{d.domain}</div>
                  <div style={{ fontSize: '0.875rem', color: '#a3a3a3' }}>High bounce rate detected</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 2. Visual Analytics (Charts) */}
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Lead Status Distribution</h2>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={leadChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {leadChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#171717', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Domain Health</h2>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={domainChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {domainChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#171717', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Mailbox and Campaign Charts */}
        <div className="grid grid-cols-2 gap-4" style={{ marginBottom: '2rem' }}>
          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Mailbox Health</h2>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mailboxChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {mailboxChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#171717', border: 'none', borderRadius: '8px' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card">
            <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Campaigns ({campaigns.length} total)</h2>
            <div style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={campaignData}>
                  <XAxis dataKey="name" stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#525252" fontSize={12} tickLine={false} axisLine={false} />
                  <BarTooltip cursor={{ fill: '#262626' }} contentStyle={{ background: '#171717', border: 'none', borderRadius: '8px' }} />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
