import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Drason Control Plane',
  description: 'Outbound Execution Control Layer',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
          {/* Sidebar */}
          <aside style={{
            width: '250px',
            flexShrink: 0,
            background: 'var(--card-bg)',
            borderRight: '1px solid var(--card-border)',
            padding: '2rem 1rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '2rem',
            overflowY: 'auto'
          }}>
            <div style={{ fontSize: '1.25rem', fontWeight: 'bold', letterSpacing: '-0.025em' }}>
              Drason
            </div>

            <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/" className="nav-link">Overview</Link>

              <div style={{ paddingLeft: '0.75rem', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Monitoring
              </div>
              <Link href="/leads" className="nav-link">Leads</Link>
              <Link href="/campaigns" className="nav-link">Campaigns</Link>
              <Link href="/mailboxes" className="nav-link">Mailboxes</Link>
              <Link href="/domains" className="nav-link">Domains</Link>

              <div style={{ paddingLeft: '0.75rem', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                System
              </div>
              <Link href="/configuration" className="nav-link">Routing Config</Link>
              <Link href="/status" className="nav-link">System Status</Link>
              <Link href="/audit" className="nav-link">Audit Log</Link>
              <Link href="/settings" className="nav-link">Settings</Link>
            </nav>

            <div style={{ marginTop: 'auto', fontSize: '0.75rem', color: '#525252' }}>
              v1.0.0 (MVP)
            </div>
          </aside>

          {/* Main Content */}
          <main style={{
            flex: 1,
            padding: '2rem',
            overflow: 'hidden', // Prevent global scroll
            borderLeft: '1px solid transparent'
          }}>
            <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', height: '100%' }}>
              {children}
            </div>
          </main>
        </div>

        <style>{`
          .nav-link {
            padding: 0.5rem 0.75rem;
            border-radius: 6px;
            color: #a3a3a3;
            transition: all 0.2s;
          }
          .nav-link:hover {
            background: #262626;
            color: #ededed;
          }
        `}</style>
      </body>
    </html>
  );
}
