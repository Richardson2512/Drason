'use client';

import Link from 'next/link';

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, LogOut, User } from 'lucide-react';
import { logout as serverLogout, apiClient } from '@/lib/api';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [userName, setUserName] = useState<string>('');
    const [userEmail, setUserEmail] = useState<string>('');

    useEffect(() => {
        // Try to get user info from the organization endpoint
        apiClient<any>('/api/organization').then((data) => {
            if (data?.name) setUserName(data.name);
        }).catch(() => { });

        // Get user name from cookie-based JWT (decoded on client for display only)
        try {
            const cookies = document.cookie.split(';').reduce((acc: any, c) => {
                const [k, v] = c.trim().split('=');
                acc[k] = v;
                return acc;
            }, {});
            // Note: httpOnly cookies won't be readable here, so we use a fallback
        } catch { }
    }, []);

    const handleLogout = async () => {
        await serverLogout();
    };

    return (
        <div className="light-theme" style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#F5F8FF' }}>
            {/* Ambient Background Effects */}
            <div className="hero-blur pointer-events-none" style={{ opacity: 0.3, zIndex: 0 }}>
                <div className="blur-blob blur-purple" style={{ width: '400px', height: '400px', top: '-10%', left: '-10%' }}></div>
                <div className="blur-blob blur-blue" style={{ width: '400px', height: '400px', bottom: '-10%', right: '-10%' }}></div>
            </div>


            {/* Sidebar Wrapper — holds collapse button outside aside's overflow context */}
            <div style={{
                position: 'relative',
                flexShrink: 0,
                width: isCollapsed ? '70px' : '210px',
                transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                margin: '0.5rem',
                zIndex: 20
            }}>
                {/* Toggle Button — positioned on wrapper edge, outside aside */}
                <button
                    onClick={() => setIsCollapsed(!isCollapsed)}
                    style={{
                        position: 'absolute',
                        right: '-14px',
                        top: '48px',
                        background: 'linear-gradient(135deg, #6366F1, #8B5CF6)',
                        border: '2px solid #fff',
                        borderRadius: '50%',
                        width: '28px',
                        height: '28px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
                        color: '#fff',
                        zIndex: 40,
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                    className="hover:scale-110"
                >
                    {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                </button>

                <aside style={{
                    width: '100%',
                    height: '100%',
                    background: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(12px)',
                    borderRight: '1px solid var(--border)',
                    padding: '1.25rem 0.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    overflowY: 'auto',
                    borderRadius: '24px',
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.05)',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative'
                }}>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: isCollapsed ? 0 : '12px',
                        fontSize: '1.25rem',
                        fontWeight: '800',
                        letterSpacing: '-0.025em',
                        color: '#111827',
                        justifyContent: isCollapsed ? 'center' : 'flex-start',
                        overflow: 'hidden',
                        whiteSpace: 'nowrap',
                        minHeight: '40px',
                        padding: '0.25rem 0'
                    }}>
                        <div style={{ flexShrink: 0, width: '32px', height: '32px' }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} style={{ display: 'block' }} onError={(e) => {
                                // Fallback: show a branded icon if image fails to load
                                const target = e.currentTarget;
                                target.style.display = 'none';
                                if (target.nextElementSibling) (target.nextElementSibling as HTMLElement).style.display = 'flex';
                            }} />
                            <div style={{ display: 'none', width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, #6366F1, #8B5CF6)', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.1rem', fontWeight: '900' }}>S</div>
                        </div>
                        <span style={{
                            opacity: isCollapsed ? 0 : 1,
                            width: isCollapsed ? 0 : 'auto',
                            transition: 'opacity 0.2s',
                            overflow: 'hidden',
                            background: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}>
                            Superkabe
                        </span>
                    </div>

                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <Link href="/dashboard" className="nav-link" title={isCollapsed ? "Overview" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>📊</span>
                            {!isCollapsed && <span>Overview</span>}
                        </Link>
                        <Link href="/dashboard/notifications" className="nav-link" title={isCollapsed ? "Notifications" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>🔔</span>
                            {!isCollapsed && <span>Notifications</span>}
                        </Link>

                        {!isCollapsed && (
                            <div style={{ paddingLeft: '1rem', marginTop: '0.75rem', marginBottom: '0.25rem', fontSize: '0.65rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', whiteSpace: 'nowrap' }}>
                                Monitoring
                            </div>
                        )}
                        {isCollapsed && <div style={{ height: '0.75rem' }} />}

                        <Link href="/dashboard/leads" className="nav-link" title={isCollapsed ? "Leads" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>👥</span>
                            {!isCollapsed && <span>Leads</span>}
                        </Link>
                        <Link href="/dashboard/campaigns" className="nav-link" title={isCollapsed ? "Campaigns" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>🚀</span>
                            {!isCollapsed && <span>Campaigns</span>}
                        </Link>
                        <Link href="/dashboard/mailboxes" className="nav-link" title={isCollapsed ? "Mailboxes" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>📫</span>
                            {!isCollapsed && <span>Mailboxes</span>}
                        </Link>
                        <Link href="/dashboard/domains" className="nav-link" title={isCollapsed ? "Domains" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>🌐</span>
                            {!isCollapsed && <span>Domains</span>}
                        </Link>
                        <Link href="/dashboard/infrastructure" className="nav-link" title={isCollapsed ? "Infra Health" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>🛡️</span>
                            {!isCollapsed && <span>Infra Health</span>}
                        </Link>

                        {!isCollapsed && (
                            <div style={{ paddingLeft: '1rem', marginTop: '0.75rem', marginBottom: '0.25rem', fontSize: '0.65rem', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', whiteSpace: 'nowrap' }}>
                                System
                            </div>
                        )}
                        {isCollapsed && <div style={{ height: '0.75rem' }} />}

                        <Link href="/dashboard/configuration" className="nav-link" title={isCollapsed ? "Routing Config" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>⚙️</span>
                            {!isCollapsed && <span>Routing Config</span>}
                        </Link>
                        <Link href="/dashboard/audit" className="nav-link" title={isCollapsed ? "Audit Log" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>📜</span>
                            {!isCollapsed && <span>Audit Log</span>}
                        </Link>
                        <Link href="/dashboard/status" className="nav-link" title={isCollapsed ? "System Status" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>🟢</span>
                            {!isCollapsed && <span>System Status</span>}
                        </Link>
                        <Link href="/dashboard/settings" className="nav-link" title={isCollapsed ? "Settings" : ""} style={{ justifyContent: isCollapsed ? 'center' : 'flex-start' }}>
                            <span style={{ fontSize: '1rem', minWidth: '24px', textAlign: 'center' }}>🔧</span>
                            {!isCollapsed && <span>Settings</span>}
                        </Link>
                    </nav>

                    <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {!isCollapsed && (
                            <div style={{ padding: '0.75rem', background: 'linear-gradient(135deg, #EFF6FF 0%, #F5F3FF 100%)', borderRadius: '12px', border: '1px solid #DBEAFE', transition: 'all 0.3s' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        <User size={16} color="#fff" />
                                    </div>
                                    <div style={{ overflow: 'hidden' }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E40AF', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userName || 'My Account'}</div>
                                        <div style={{ fontSize: '0.7rem', color: '#60A5FA', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{userEmail || 'Manage settings'}</div>
                                    </div>
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
                                fontSize: '0.8rem',
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
            </div>

            <main className="scrollbar-hide" style={{
                flex: 1,
                padding: '0.5rem 1rem 5rem 1.5rem',
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
