'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();

    const handleLogout = () => {
        // Clear token cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        router.push('/');
    };

    return (
        <div className="dark-theme" style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
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
                    <Link href="/dashboard" className="nav-link">Overview</Link>

                    <div style={{ paddingLeft: '0.75rem', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Monitoring
                    </div>
                    <Link href="/dashboard/leads" className="nav-link">Leads</Link>
                    <Link href="/dashboard/campaigns" className="nav-link">Campaigns</Link>
                    <Link href="/dashboard/mailboxes" className="nav-link">Mailboxes</Link>
                    <Link href="/dashboard/domains" className="nav-link">Domains</Link>

                    <div style={{ paddingLeft: '0.75rem', marginTop: '1rem', marginBottom: '0.5rem', fontSize: '0.75rem', color: '#525252', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        System
                    </div>
                    <Link href="/dashboard/configuration" className="nav-link">Routing Config</Link>
                    <Link href="/dashboard/audit" className="nav-link">Audit Log</Link>
                    <Link href="/dashboard/settings" className="nav-link">Settings</Link>
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <button
                        onClick={handleLogout}
                        className="nav-link"
                        style={{
                            background: 'transparent',
                            border: 'none',
                            width: '100%',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: '#ef4444', // Red for logout
                            fontSize: '0.9rem'
                        }}
                    >
                        Log Out
                    </button>
                    <div style={{ fontSize: '0.75rem', color: '#525252' }}>
                        v1.0.0 (MVP)
                    </div>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                flex: 1,
                padding: '2rem',
                overflowY: 'auto', // Enable vertical scrolling
                borderLeft: '1px solid transparent'
            }}>
                <div className="container" style={{ maxWidth: '1400px', margin: '0 auto', height: '100%' }}>
                    {children}
                </div>
            </main>

            <style jsx>{`
        .nav-link {
          padding: 0.5rem 0.75rem;
          border-radius: 6px;
          color: #a3a3a3;
          transition: all 0.2s;
          text-decoration: none;
          display: block;
        }
        .nav-link:hover {
          background: #262626;
          color: #ededed;
        }
      `}</style>
        </div>
    );
}
