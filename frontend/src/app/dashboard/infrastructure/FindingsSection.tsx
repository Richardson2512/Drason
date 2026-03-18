'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { InfraFinding } from '@/types/api';
import { getScoreColor } from '@/lib/statusHelpers';

const FindingsChart = dynamic(() => import('./Charts').then(mod => ({ default: mod.FindingsChart })), { ssr: false });

const SEVERITY_CONFIG = {
    critical: { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', accent: '#EF4444', icon: '🔴', label: 'Critical' },
    warning: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', accent: '#F59E0B', icon: '🟡', label: 'Warning' },
    info: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1E40AF', accent: '#3B82F6', icon: '🔵', label: 'Info' },
};

/** Maps finding title prefixes to official external help documentation */
function getHelpLink(title: string): { url: string; label: string } | null {
    const t = title.toLowerCase();

    // DNS authentication findings
    if (t.startsWith('missing spf'))
        return { url: 'https://support.google.com/a/answer/33786', label: 'Google: Set up SPF' };
    if (t.startsWith('spf check failed'))
        return { url: 'https://support.google.com/a/answer/33786', label: 'Google: SPF troubleshooting' };
    if (t.startsWith('missing dkim'))
        return { url: 'https://support.google.com/a/answer/174124', label: 'Google: Turn on DKIM signing' };
    if (t.startsWith('missing dmarc'))
        return { url: 'https://support.google.com/a/answer/2466580', label: 'Google: Set up DMARC' };
    if (t.startsWith('weak dmarc'))
        return { url: 'https://support.google.com/a/answer/2466580', label: 'Google: DMARC enforcement guide' };

    // Blacklist findings
    if (t.startsWith('blacklisted'))
        return { url: 'https://www.spamhaus.org/lookup/', label: 'Spamhaus: Check & request delisting' };
    if (t.startsWith('blacklist check unreachable'))
        return { url: 'https://mxtoolbox.com/blacklists.aspx', label: 'MxToolbox: Blacklist checker' };

    // DNS assessment failure
    if (t.startsWith('dns assessment failed'))
        return { url: 'https://mxtoolbox.com/SuperTool.aspx', label: 'MxToolbox: DNS diagnostics' };

    // Mailbox connection failures
    if (t.startsWith('connection failed'))
        return { url: 'https://support.google.com/mail/answer/7126229', label: 'Google: IMAP/SMTP settings' };

    // Bounce rate findings
    if (t.startsWith('high bounce rate'))
        return { url: 'https://support.google.com/a/answer/81126', label: 'Google: Sender guidelines & bounce prevention' };
    if (t.startsWith('elevated bounce rate'))
        return { url: 'https://support.google.com/a/answer/81126', label: 'Google: Email sender guidelines' };
    if (t.startsWith('early bounce signal'))
        return { url: 'https://support.google.com/a/answer/81126', label: 'Google: Email sender guidelines' };

    // Campaign health findings
    if (t.startsWith('no mailboxes'))
        return { url: 'https://help.smartlead.ai/', label: 'Smartlead: Assign mailboxes to campaigns' };
    if (t.startsWith('all mailboxes paused'))
        return { url: 'https://help.smartlead.ai/', label: 'Smartlead: Resolve mailbox issues' };
    if (t.startsWith('degraded infrastructure'))
        return { url: 'https://help.smartlead.ai/', label: 'Smartlead: Mailbox health management' };

    return null;
}

function DNSDetailPanel({ dns, domain }: { dns: any; domain: string }) {
    if (!dns) return null;

    const records = [
        { label: 'SPF', valid: dns.spfValid, icon: dns.spfValid ? '✅' : '❌' },
        { label: 'DKIM', valid: dns.dkimValid, icon: dns.dkimValid ? '✅' : '❌' },
        { label: 'DMARC', policy: dns.dmarcPolicy, icon: dns.dmarcPolicy && dns.dmarcPolicy !== 'none' ? '✅' : '⚠️' },
    ];

    return (
        <div>
            <div className="text-[0.8rem] font-bold text-gray-700 mb-2">
                DNS Records for {domain}
            </div>
            <div className="grid grid-cols-3 gap-2 mb-3">
                {records.map(r => (
                    <div key={r.label} className="p-2 rounded-lg bg-white border border-gray-200 text-center text-xs">
                        <div className="text-xl mb-[0.15rem]">{r.icon}</div>
                        <div className="font-bold text-gray-700">{r.label}</div>
                        {'policy' in r && <div className="text-gray-500 text-[0.7rem]">{r.policy || 'none'}</div>}
                    </div>
                ))}
            </div>

            {dns.blacklistResults && Object.keys(dns.blacklistResults).length > 0 && (
                <div>
                    <div className="text-xs font-bold text-gray-700 mb-[0.35rem]">Blacklist Check</div>
                    <div className="flex flex-wrap gap-[0.35rem]">
                        {Object.entries(dns.blacklistResults).map(([bl, status]) => (
                            <span key={bl} className="py-[0.15rem] px-2 rounded-full text-[0.65rem] font-semibold" style={{
                                background: status === 'CONFIRMED' ? '#FEE2E2' : status === 'NOT_LISTED' ? '#DCFCE7' : '#FEF3C7',
                                color: status === 'CONFIRMED' ? '#991B1B' : status === 'NOT_LISTED' ? '#166534' : '#92400E',
                                border: `1px solid ${status === 'CONFIRMED' ? '#FECACA' : status === 'NOT_LISTED' ? '#BBF7D0' : '#FDE68A'}`
                            }}>
                                {bl}: {status as string}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-2 text-xs text-gray-500">
                Score: <span className="font-bold" style={{ color: getScoreColor(dns.score) }}>{dns.score}/100</span>
            </div>
        </div>
    );
}

interface FindingsSectionProps {
    findings: InfraFinding[];
    expandedDomain: string | null;
    onToggleDomain: (domainId: string) => void;
    dnsDetails: Record<string, Record<string, any>>;
    dnsLoading: string | null;
}

export default function FindingsSection({ findings, expandedDomain, onToggleDomain, dnsDetails, dnsLoading }: FindingsSectionProps) {
    const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
    const [expandedDNSDomain, setExpandedDNSDomain] = useState<string | null>(null);

    if (findings.length === 0) return null;

    const criticalCount = findings.filter(f => f.severity === 'critical').length;
    const warningCount = findings.filter(f => f.severity === 'warning').length;
    const infoCount = findings.filter(f => f.severity === 'info').length;

    const findingsChartData = [
        { name: 'Critical', value: criticalCount, color: '#EF4444' },
        { name: 'Warning', value: warningCount, color: '#F59E0B' },
        { name: 'Info', value: infoCount, color: '#3B82F6' },
    ].filter(d => d.value > 0);

    const findingsByCategory = findings.reduce<Record<string, InfraFinding[]>>((acc, f) => {
        const cat = f.category || 'general';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(f);
        return acc;
    }, {});

    const dnsFindingsByDomain = findings
        .filter(f => f.category === 'domain_dns' && f.entityId)
        .reduce<Record<string, InfraFinding[]>>((acc, f) => {
            const domainId = f.entityId!;
            if (!acc[domainId]) acc[domainId] = [];
            acc[domainId].push(f);
            return acc;
        }, {});

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Distribution Chart */}
            <div className="premium-card">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                    Findings Breakdown
                </h2>
                <div className="h-[200px]">
                    <FindingsChart data={findingsChartData} />
                </div>
                <div className="flex justify-center gap-4 mt-2 flex-wrap">
                    {findingsChartData.map(d => (
                        <div key={d.name} className="flex items-center gap-[0.35rem] text-[0.8rem] text-gray-500">
                            <div className="w-[10px] h-[10px] rounded-full" style={{ background: d.color }} />
                            {d.name} ({d.value})
                        </div>
                    ))}
                </div>
            </div>

            {/* Findings List */}
            <div className="premium-card col-span-2">
                <h2 className="text-lg font-bold text-gray-900 mb-4">
                    All Findings
                </h2>
                <div className="flex flex-col gap-3 max-h-[500px] overflow-y-auto scrollbar-hide">
                    {Object.entries(findingsByCategory).map(([category, catFindings]) => {
                        const CATEGORY_LABELS: Record<string, string> = {
                            domain_dns: '🌐 Domain DNS',
                            mailbox_health: '📬 Mailbox Health',
                            campaign_health: '📣 Campaign Health',
                        };

                        // Special handling for DNS findings - consolidate by domain
                        if (category === 'domain_dns') {
                            return (
                                <div key={category}>
                                    <div className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2 pl-1">
                                        {CATEGORY_LABELS[category]}
                                    </div>
                                    {Object.entries(dnsFindingsByDomain).map(([domainId, domainFindings]) => {
                                        const firstFinding = domainFindings[0];
                                        const domainName = firstFinding.entityName || domainId;
                                        const isExpanded = expandedDNSDomain === domainId;
                                        const highestSeverity = domainFindings.some(f => f.severity === 'critical') ? 'critical'
                                            : domainFindings.some(f => f.severity === 'warning') ? 'warning'
                                                : 'info';
                                        const sev = SEVERITY_CONFIG[highestSeverity];

                                        return (
                                            <div key={domainId} className="py-[0.875rem] px-4 rounded-xl mb-2 transition-all duration-200" style={{
                                                background: sev.bg,
                                                border: `1px solid ${sev.border}`,
                                                borderLeft: `4px solid ${sev.accent}`,
                                            }}>
                                                <div
                                                    onClick={() => setExpandedDNSDomain(isExpanded ? null : domainId)}
                                                    className="cursor-pointer"
                                                >
                                                    <div className="flex justify-between items-center">
                                                        <div className="flex items-center gap-2">
                                                            <span>{sev.icon}</span>
                                                            <span className="font-bold text-[0.9rem]" style={{ color: sev.text }}>
                                                                DNS Configuration Issues: {domainName}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-3">
                                                            <span className="text-xs font-bold py-[0.3rem] px-[0.7rem] rounded-full" style={{
                                                                color: sev.text,
                                                                background: `${sev.accent}15`,
                                                            }}>
                                                                {domainFindings.length} {domainFindings.length === 1 ? 'issue' : 'issues'}
                                                            </span>
                                                            <span className="text-sm" style={{ color: sev.text }}>
                                                                {isExpanded ? '▲' : '▼'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="text-[0.825rem] mt-[0.35rem] opacity-85" style={{ color: sev.text }}>
                                                        {isExpanded ? 'Click to collapse' : 'Click to view details'}
                                                    </div>
                                                </div>

                                                {isExpanded && (
                                                    <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${sev.border}` }}>
                                                        {domainFindings.map((finding, idx) => {
                                                            const findingSev = SEVERITY_CONFIG[finding.severity];
                                                            const findingKey = `${domainId}-${idx}`;
                                                            const isFindingExpanded = expandedFinding === findingKey;

                                                            return (
                                                                <div key={findingKey} className="p-3 rounded-lg bg-white/50" style={{
                                                                    marginBottom: idx < domainFindings.length - 1 ? '0.75rem' : 0,
                                                                    border: `1px solid ${findingSev.border}`,
                                                                }}>
                                                                    <div className="flex justify-between items-center mb-2">
                                                                        <div className="flex items-center gap-2">
                                                                            <span className="text-[0.9rem]">{findingSev.icon}</span>
                                                                            <span className="font-semibold text-sm" style={{ color: findingSev.text }}>
                                                                                {finding.title.replace(`: ${domainName}`, '')}
                                                                            </span>
                                                                        </div>
                                                                        <span className="text-[0.65rem] font-bold py-[0.2rem] px-[0.6rem] rounded-full uppercase" style={{
                                                                            color: findingSev.text,
                                                                            background: `${findingSev.accent}15`,
                                                                        }}>
                                                                            {findingSev.label}
                                                                        </span>
                                                                    </div>
                                                                    <div className="text-[0.8rem] opacity-85 leading-normal" style={{ color: findingSev.text }}>
                                                                        {finding.details}
                                                                    </div>

                                                                    {finding.remediation && (() => {
                                                                        const helpLink = getHelpLink(finding.title);
                                                                        return (
                                                                            <div className="mt-2">
                                                                                <button
                                                                                    onClick={(e) => { e.stopPropagation(); setExpandedFinding(isFindingExpanded ? null : findingKey); }}
                                                                                    className="bg-transparent border-none cursor-pointer text-xs font-bold py-1 px-0 flex items-center gap-[0.35rem]"
                                                                                    style={{ color: findingSev.accent }}
                                                                                >
                                                                                    🔧 {isFindingExpanded ? 'Hide fix ▲' : 'How to fix ▼'}
                                                                                </button>
                                                                                {isFindingExpanded && (
                                                                                    <div className="mt-[0.35rem] px-3 py-[0.6rem] rounded-lg text-[0.8rem] leading-relaxed" style={{
                                                                                        background: `${findingSev.accent}08`,
                                                                                        border: `1px dashed ${findingSev.border}`,
                                                                                        color: findingSev.text,
                                                                                    }}>
                                                                                        {finding.remediation}
                                                                                        {helpLink && (
                                                                                            <div className="mt-2 pt-2" style={{ borderTop: `1px dashed ${findingSev.border}` }}>
                                                                                                <a
                                                                                                    href={helpLink.url}
                                                                                                    target="_blank"
                                                                                                    rel="noopener noreferrer"
                                                                                                    className="inline-flex items-center gap-1 text-xs font-semibold no-underline hover:underline"
                                                                                                    style={{ color: findingSev.accent }}
                                                                                                    onClick={(e) => e.stopPropagation()}
                                                                                                >
                                                                                                    📖 {helpLink.label} ↗
                                                                                                </a>
                                                                                            </div>
                                                                                        )}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        }

                        // Regular rendering for non-DNS findings
                        return (
                            <div key={category}>
                                <div className="text-[0.7rem] font-bold text-gray-400 uppercase tracking-[0.1em] mb-2 pl-1">
                                    {CATEGORY_LABELS[category] || category.replace(/_/g, ' ')}
                                </div>
                                {catFindings.map((finding, idx) => {
                                    const sev = SEVERITY_CONFIG[finding.severity] || SEVERITY_CONFIG.info;
                                    const findingKey = `${category}-${idx}`;
                                    const isExpanded = expandedFinding === findingKey;
                                    return (
                                        <div key={findingKey} className="py-[0.875rem] px-4 rounded-xl mb-2 transition-all duration-200" style={{
                                            background: sev.bg,
                                            border: `1px solid ${sev.border}`,
                                            borderLeft: `4px solid ${sev.accent}`,
                                        }}>
                                            <div className="flex justify-between items-center">
                                                <div className="flex items-center gap-2">
                                                    <span>{sev.icon}</span>
                                                    <span className="font-bold text-[0.9rem]" style={{ color: sev.text }}>
                                                        {finding.title}
                                                    </span>
                                                </div>
                                                <span className="text-[0.65rem] font-bold py-[0.2rem] px-[0.6rem] rounded-full uppercase" style={{
                                                    color: sev.text,
                                                    background: `${sev.accent}15`,
                                                }}>
                                                    {sev.label}
                                                </span>
                                            </div>
                                            <div className="text-[0.825rem] mt-[0.35rem] opacity-85 leading-normal" style={{ color: sev.text }}>
                                                {finding.details}
                                            </div>
                                            {finding.entity && (
                                                <div className="text-xs opacity-70 mt-[0.35rem] flex items-center gap-[0.35rem]" style={{ color: sev.text }}>
                                                    <span className="font-semibold">{finding.entity}:</span>
                                                    <span>{finding.entityName || finding.entityId}</span>
                                                    {finding.category === 'domain_dns' && (
                                                        <span
                                                            className="text-[0.7rem] ml-auto cursor-pointer underline"
                                                            onClick={(e) => { e.stopPropagation(); finding.entityId && onToggleDomain(finding.entityId); }}
                                                        >
                                                            {expandedDomain === finding.entityId ? '▲ Hide DNS' : '▼ View DNS'}
                                                        </span>
                                                    )}
                                                </div>
                                            )}

                                            {finding.remediation && (() => {
                                                const helpLink = getHelpLink(finding.title);
                                                return (
                                                    <div className="mt-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); setExpandedFinding(isExpanded ? null : findingKey); }}
                                                            className="bg-transparent border-none cursor-pointer text-xs font-bold py-1 px-0 flex items-center gap-[0.35rem]"
                                                            style={{ color: sev.accent }}
                                                        >
                                                            🔧 {isExpanded ? 'Hide fix ▲' : 'How to fix ▼'}
                                                        </button>
                                                        {isExpanded && (
                                                            <div className="mt-[0.35rem] px-3 py-[0.6rem] rounded-lg text-[0.8rem] leading-relaxed" style={{
                                                                background: `${sev.accent}08`,
                                                                border: `1px dashed ${sev.border}`,
                                                                color: sev.text,
                                                            }}>
                                                                {finding.remediation}
                                                                {helpLink && (
                                                                    <div className="mt-2 pt-2" style={{ borderTop: `1px dashed ${sev.border}` }}>
                                                                        <a
                                                                            href={helpLink.url}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="inline-flex items-center gap-1 text-xs font-semibold no-underline hover:underline"
                                                                            style={{ color: sev.accent }}
                                                                            onClick={(e) => e.stopPropagation()}
                                                                        >
                                                                            📖 {helpLink.label} ↗
                                                                        </a>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })()}

                                            {expandedDomain === finding.entityId && finding.category === 'domain_dns' && (
                                                <div className="mt-3 pt-3" style={{ borderTop: `1px solid ${sev.border}` }}>
                                                    {dnsLoading === finding.entityId ? (
                                                        <div className="text-center p-2 text-[0.8rem]" style={{ color: sev.text }}>
                                                            Checking DNS records...
                                                        </div>
                                                    ) : dnsDetails[finding.entityId!] ? (
                                                        <DNSDetailPanel dns={dnsDetails[finding.entityId!].dns} domain={dnsDetails[finding.entityId!].domain} />
                                                    ) : (
                                                        <div className="text-center p-2 text-[0.8rem]" style={{ color: sev.text }}>
                                                            Click to load DNS details
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
