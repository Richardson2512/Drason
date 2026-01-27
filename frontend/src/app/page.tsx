'use client';
import { useEffect, useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, Bar, XAxis, YAxis, Tooltip as BarTooltip } from 'recharts';

export default function Overview() {
  const [stats, setStats] = useState<any>(null);
  const [leads, setLeads] = useState<any[]>([]);
  const [domains, setDomains] = useState<any[]>([]);
  const [mailboxes, setMailboxes] = useState<any[]>([]);

  // Tabs State
  const [leadTab, setLeadTab] = useState('held');
  const [mailboxTab, setMailboxTab] = useState('all');
  const [domainTab, setDomainTab] = useState('all');

  // Chart Data State
  const [campaignData, setCampaignData] = useState<any[]>([]);

  useEffect(() => {
    // Parallel Fetching
    Promise.all([
      fetch('/api/dashboard/stats').then(res => res.json()),
      fetch('/api/dashboard/leads').then(res => res.json()),
      fetch('/api/dashboard/domains').then(res => res.json()),
      fetch('/api/dashboard/mailboxes').then(res => res.json())
    ]).then(([statsData, leadsData, domainsData, mailboxesData]) => {
      setStats(statsData);
      setLeads(leadsData);
      setDomains(domainsData);
      setMailboxes(mailboxesData);

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

  // Filter Logic
  const filteredLeads = leadTab === 'all' ? leads : leads.filter(l => l.status === leadTab);

  const filteredMailboxes = mailboxTab === 'all'
    ? mailboxes
    : mailboxes.filter(m => m.status === mailboxTab || (mailboxTab === 'warning' && m.status === 'warning'));

  const filteredDomains = domainTab === 'all'
    ? domains
    : domains.filter(d => d.status === domainTab);

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

  // Helper for Status Badge
  const StatusBadge = ({ status }: { status: string }) => {
    let color = 'gray';
    if (status === 'active' || status === 'healthy') color = 'success';
    if (status === 'paused') color = 'danger';
    if (status === 'warning' || status === 'held') color = 'warning';

    return (
      <span className={`badge badge-${color}`}>
        {status.toUpperCase()}
      </span>
    );
  };

  // Helper for Tab Button
  const TabButton = ({ label, value, current, set }: any) => (
    <button
      onClick={() => set(value)}
      style={{
        padding: '0.25rem 0.75rem',
        borderRadius: '4px',
        background: current === value ? '#0a0a0a' : 'transparent',
        color: current === value ? '#fff' : '#a3a3a3',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.875rem',
        fontWeight: 500,
        textTransform: 'capitalize'
      }}
    >
      {label}
    </button>
  );

  return (
    <div className="grid" style={{ height: '100%', overflowY: 'auto', paddingRight: '0.5rem' }}>
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

        {/* 3. Campaign Distribution */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Leads per Campaign</h2>
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

        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* 4. Leads Monitoring */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem' }}>Leads Monitoring</h2>
              <div style={{ display: 'flex', background: '#262626', padding: '0.25rem', borderRadius: '6px' }}>
                {['held', 'active', 'paused', 'all'].map(t => (
                  <TabButton key={t} label={t} value={t} current={leadTab} set={setLeadTab} />
                ))}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Persona</th>
                  <th>Score</th>
                  <th>Status</th>
                  <th>Campaign</th>
                  <th>Health</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.email}</td>
                    <td>{lead.persona}</td>
                    <td>{lead.lead_score}</td>
                    <td><StatusBadge status={lead.status} /></td>
                    <td style={{ color: '#a3a3a3' }}>{lead.assigned_campaign_id || '-'}</td>
                    <td>{lead.health_state}</td>
                  </tr>
                ))}
                {filteredLeads.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#525252' }}>No {leadTab} leads.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 5. Mailboxes Monitoring */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem' }}>Mailboxes Monitoring</h2>
              <div style={{ display: 'flex', background: '#262626', padding: '0.25rem', borderRadius: '6px' }}>
                {['all', 'active', 'paused', 'warning'].map(t => (
                  <TabButton key={t} label={t} value={t} current={mailboxTab} set={setMailboxTab} />
                ))}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Domain</th>
                  <th>Status</th>
                  <th>History (Bounces / Failures / Sent)</th>
                  <th>Last Activity</th>
                </tr>
              </thead>
              <tbody>
                {filteredMailboxes.map((mb) => (
                  <tr key={mb.id}>
                    <td>{mb.email}</td>
                    <td style={{ color: '#a3a3a3' }}>{mb.domain?.domain}</td>
                    <td><StatusBadge status={mb.status} /></td>
                    <td>
                      <span style={{ color: '#ef4444' }}>{mb.hard_bounce_count}</span>{' / '}
                      <span style={{ color: '#eab308' }}>{mb.delivery_failure_count}</span>{' / '}
                      <span style={{ color: '#a3a3a3' }}>{mb.window_sent_count} (Win)</span>
                    </td>
                    <td style={{ color: '#525252', fontSize: '0.8rem' }}>{new Date(mb.last_activity_at).toLocaleString()}</td>
                  </tr>
                ))}
                {filteredMailboxes.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#525252' }}>No {mailboxTab} mailboxes.</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* 6. Domains Monitoring */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.125rem' }}>Domains Monitoring</h2>
              <div style={{ display: 'flex', background: '#262626', padding: '0.25rem', borderRadius: '6px' }}>
                {['all', 'healthy', 'paused', 'warning'].map(t => (
                  <TabButton key={t} label={t} value={t} current={domainTab} set={setDomainTab} />
                ))}
              </div>
            </div>
            <table>
              <thead>
                <tr>
                  <th>Domain</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th>Bounce Trend</th>
                  <th>Alerts</th>
                </tr>
              </thead>
              <tbody>
                {filteredDomains.map((d) => (
                  <tr key={d.id}>
                    <td style={{ fontWeight: 500 }}>{d.domain}</td>
                    <td style={{ color: '#525252', fontSize: '0.8rem' }}>{d.id}</td>
                    <td><StatusBadge status={d.status} /></td>
                    <td>{d.aggregated_bounce_rate_trend.toFixed(2)}%</td>
                    <td style={{ color: '#ef4444' }}>{d.paused_reason || '-'}</td>
                  </tr>
                ))}
                {filteredDomains.length === 0 && (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#525252' }}>No {domainTab} domains.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
