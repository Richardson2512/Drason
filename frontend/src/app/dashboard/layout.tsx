'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { ChevronLeft, ChevronRight, LogOut } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const handleLogout = () => {
        // Clear token cookie
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
        router.push('/');
    };

    return (
        <div className="light-theme" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F5F8FF' }}>
            {/* Ambient Background Effects */}
            <div className="hero-blur pointer-events-none" style={{ opacity: 0.3, zIndex: 0 }}>
                <div className="blur-blob blur-purple" style={{ width: '400px', height: '400px', top: '-10%', left: '-10%' }}></div>
                <div className="blur-blob blur-blue" style={{ width: '400px', height: '400px', bottom: '-10%', right: '-10%' }}></div>
            </div>

            {/* Sidebar */}
            <aside style={{
                width: isCollapsed ? '90px' : '260px',
                flexShrink: 0,
                background: 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(12px)',
                borderRight: '1px solid var(--border)',
                padding: '2rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '2rem',
                overflowY: 'visible',
                zIndex: 20,
                margin: '0.5rem',
                borderRadius: '24px',
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative'
            }}>
                {/* Toggle Button */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        position: 'absolute',
                        right: '-12px',
                        top: '48px',
                        background: '#fff',
                        border: '1px solid #E5E7EB',
                        borderRadius: '50%',
                        width: '24px',
                        height: '24px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                        color: '#6B7280',
                        zIndex: 30,
                        transition: 'transform 0.2s'
                    }}
                    className="hover:scale-110 hover:text-blue-600"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isCollapsed ? 0 : '12px',
                    fontSize: '1.5rem',
                    fontWeight: '800',
                    letterSpacing: '-0.025em',
                    color: '#111827',
                    justifyContent: isCollapsed ? 'center' : 'flex-start',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    height: '40px'
                }}>
                    <div style={{ flexShrink: 0 }}>
                        <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                    </div>
                    <span style={{
                        opacity: isCollapsed ? 0 : 1,
                        width: isCollapsed ? 0 : 'auto',
                        transition: 'opacity 0.2s',
                        overflow: 'hidden'
                    }}>
                        Superkabe
                    </span>
                </div>

                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <Link href="/dashboard" className="nav-link" title={isCollapsed ? "Overview" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>📊</span>
                        {!isCollapsed && <span>Overview</span>}
                    </Link>
                    <Link href="/dashboard/notifications" className="nav-link" title={isCollapsed ? "Notifications" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🔔</span>
                        {!isCollapsed && <span>Notifications</span>}
                    </Link>

                    {!isCollapsed && (
                        <div style={{ paddingLeft: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            Monitoring
                        </div>
                    )}
                    {isCollapsed && <div style={{ height: '1.5rem' }} />}

                    <Link href="/dashboard/leads" className="nav-link" title={isCollapsed ? "Leads" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>👥</span>
                        {!isCollapsed && <span>Leads</span>}
                    </Link>
                    <Link href="/dashboard/campaigns" className="nav-link" title={isCollapsed ? "Campaigns" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🚀</span>
                        {!isCollapsed && <span>Campaigns</span>}
                    </Link>
                    <Link href="/dashboard/mailboxes" className="nav-link" title={isCollapsed ? "Mailboxes" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>📫</span>
                        {!isCollapsed && <span>Mailboxes</span>}
                    </Link>
                    <Link href="/dashboard/domains" className="nav-link" title={isCollapsed ? "Domains" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🌐</span>
                        {!isCollapsed && <span>Domains</span>}
                    </Link>

                    {!isCollapsed && (
                        <div style={{ paddingLeft: '1rem', marginTop: '1.5rem', marginBottom: '0.5rem', fontSize: '0.7rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', whiteSpace: 'nowrap' }}>
                            System
                        </div>
                    )}
                    {isCollapsed && <div style={{ height: '1.5rem' }} />}

                    <Link href="/dashboard/configuration" className="nav-link" title={isCollapsed ? "Routing Config" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>⚙️</span>
                        {!isCollapsed && <span>Routing Config</span>}
                    </Link>
                    <Link href="/dashboard/audit" className="nav-link" title={isCollapsed ? "Audit Log" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>📜</span>
                        {!isCollapsed && <span>Audit Log</span>}
                    </Link>
                    <Link href="/dashboard/status" className="nav-link" title={isCollapsed ? "System Status" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🟢</span>
                        {!isCollapsed && <span>System Status</span>}
                    </Link>
                    <Link href="/dashboard/settings" className="nav-link" title={isCollapsed ? "Settings" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                        <span style={{ fontSize: '1.2rem', minWidth: '24px', textAlign: 'center' }}>🔧</span>
                        {!isCollapsed && <span>Settings</span>}
                    </Link>
                </nav>

                <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {!isCollapsed && (
                        <div style={{ padding: '1rem', background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)', borderRadius: '16px', border: '1px solid #DBEAFE', transition: 'all 0.3s' }}>
                            <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E40AF', marginBottom: '0.25rem' }}>Pro Plan</div>
                            <div style={{ fontSize: '0.75rem', color: '#60A5FA' }}>Using 45% of monthly quota</div>
                            <div style={{ height: '4px', width: '100%', background: '#DBEAFE', borderRadius: '2px', marginTop: '0.5rem' }}>
                                <div style={{ height: '100%', width: '45%', background: '#2563EB', borderRadius: '2px' }}></div>
                            </div>
                        </div>
                    )}

                    <button
                        onClick={handleLogout}
                        className="nav-link"
                        style={{
                            background: '#FEF2F2',
                            border: '1px solid #FECACA',
                            width: '100%',
                            textAlign: 'left',
                            cursor: 'pointer',
                            color: '#DC2626',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: isCollapsed ? 'center' : 'flex-start',
                            gap: '0.75rem'
                        }}
                        title={isCollapsed ? "Log Out" : ""}
                    >
                        <div style={{ minWidth: '24px', display: 'flex', justifyContent: 'center' }}>
                            <LogOut size={20} />
                        </div>
                        {!isCollapsed && <span>Log Out</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="scrollbar-hide" style={{
                flex: 1,
                padding: '0.5rem 1rem 1rem 1.5rem',
                overflowY: 'auto',
                zIndex: 10
            }}>
                <div className="container" style={{ height: '100%' }}>
                    {children}
                </div>
            </main>

            <style jsx>{`
        .nav-link {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          color: #4B5563;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.95rem;
          font-weight: 500;
          border: 1px solid transparent;
        }
        .nav-link:hover {
          background: #FFFFFF;
          color: #111827;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
          transform: translateX(4px);
        }
      `}</style>
        </div>
    );
}
