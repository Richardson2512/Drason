'use client';

/**
 * DnsHealthPanel — sits ABOVE the Findings (Health Issues) section on the
 * Infrastructure page. Aggregates the four DNS-health signals across every
 * domain in the org into four scannable cards:
 *
 *   SPF · DKIM · DMARC · Blacklist
 *
 * Each card states the *problem* in plain language and exposes a Fix button
 * that opens the same external help docs FindingsSection links to. Cards
 * stay clean (no Fix button) when the check is healthy across all domains.
 *
 * Data source: GET /api/dashboard/domains. Pure aggregation — no new backend.
 */

import { useEffect, useState } from 'react';
import { ExternalLink, ShieldCheck, ShieldAlert, ShieldX, ShieldQuestion } from 'lucide-react';
import { apiClient } from '@/lib/api';
import type { Domain } from '@/types/api';

type DomainsResponse = {
    data?: Domain[];
    domains?: Domain[];
    meta?: { total: number; totalPages: number };
};

type CheckTone = 'good' | 'warn' | 'bad' | 'unknown';

interface DnsCheck {
    key: 'spf' | 'dkim' | 'dmarc' | 'blacklist';
    label: string;
    description: string;          // one-line subtitle, neutral
    tone: CheckTone;
    affectedCount: number;        // domains failing this check
    totalDomains: number;
    issueExplanation: string;     // shown when tone is bad/warn — explains the impact
    fixHref: string;              // help URL the "Fix" button opens
    fixLabel: string;             // CTA text on the help link
    affectedDomains: string[];    // first few names for the tooltip
}

export default function DnsHealthPanel() {
    const [domains, setDomains] = useState<Domain[] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        // Pull a generous page so we cover most orgs in one round trip. The
        // numbers we surface are aggregate, not paginated, so we deliberately
        // overfetch here vs. paging through.
        apiClient<DomainsResponse>('/api/dashboard/domains?limit=500&page=1')
            .then(res => {
                if (cancelled) return;
                const list = (res as any)?.data ?? (res as any)?.domains ?? [];
                setDomains(Array.isArray(list) ? list : []);
            })
            .catch(err => {
                if (!cancelled) setError(err?.message || 'Failed to load DNS health');
            })
            .finally(() => { if (!cancelled) setLoading(false); });
        return () => { cancelled = true; };
    }, []);

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-2">
                {[0, 1, 2, 3].map(i => (
                    <div key={i} className="rounded-2xl bg-white border border-gray-200 p-4 h-32 animate-pulse" />
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700 mb-2">
                {error}
            </div>
        );
    }

    if (!domains || domains.length === 0) return null;

    const checks = computeChecks(domains);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3 mb-2">
            {checks.map(c => <DnsCheckCard key={c.key} check={c} />)}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Card
// ────────────────────────────────────────────────────────────────────

function DnsCheckCard({ check }: { check: DnsCheck }) {
    const t = TONE_THEME[check.tone];
    const Icon = t.icon;
    const showFix = check.tone === 'bad' || check.tone === 'warn';

    return (
        <div
            className="rounded-2xl border p-4 flex flex-col gap-2 transition-shadow hover:shadow-sm"
            style={{ background: t.bg, borderColor: t.border }}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon size={16} style={{ color: t.accent }} />
                    <span className="text-sm font-bold text-gray-900">{check.label}</span>
                </div>
                <span
                    className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border"
                    style={{ background: '#FFFFFF', color: t.accent, borderColor: t.border }}
                >
                    {t.label}
                </span>
            </div>

            <p className="text-[11px] text-gray-600 leading-relaxed">{check.description}</p>

            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold tabular-nums" style={{ color: t.accent }}>
                    {check.affectedCount}
                </span>
                <span className="text-[11px] text-gray-500">
                    / {check.totalDomains} domain{check.totalDomains === 1 ? '' : 's'}
                </span>
            </div>

            {showFix ? (
                <>
                    <p
                        className="text-[11px] leading-relaxed mt-1"
                        style={{ color: t.text }}
                        title={check.affectedDomains.length > 0 ? `Affected: ${check.affectedDomains.slice(0, 5).join(', ')}${check.affectedDomains.length > 5 ? `, +${check.affectedDomains.length - 5} more` : ''}` : undefined}
                    >
                        {check.issueExplanation}
                    </p>
                    <a
                        href={check.fixHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-1 inline-flex items-center justify-center gap-1.5 self-start text-[11px] font-semibold px-3 py-1.5 rounded-lg transition-colors"
                        style={{ background: t.accent, color: '#FFFFFF' }}
                    >
                        Fix
                        <ExternalLink size={10} />
                    </a>
                    <span className="text-[10px] text-gray-500 leading-tight">{check.fixLabel}</span>
                </>
            ) : (
                <p className="text-[11px] text-emerald-700 leading-relaxed mt-1">
                    All clear across every domain.
                </p>
            )}
        </div>
    );
}

// ────────────────────────────────────────────────────────────────────
// Aggregation
// ────────────────────────────────────────────────────────────────────

function computeChecks(domains: Domain[]): DnsCheck[] {
    const total = domains.length;

    // SPF: bad when explicitly false. Unknowns (null) are excluded — we can't
    // claim a record is missing if we never assessed it.
    const spfFailing = domains.filter(d => d.spf_valid === false);
    const dkimFailing = domains.filter(d => d.dkim_valid === false);
    const dmarcFailing = domains.filter(d => {
        // DMARC: bad when no record OR p=none. p=quarantine and p=reject are good.
        if (!d.dns_checked_at) return false;
        if (!d.dmarc_policy) return true;
        return d.dmarc_policy === 'none';
    });
    const blacklisted = domains.filter(d => {
        const r = d.blacklist_results;
        if (!r) return false;
        return (r.critical_listed || 0) > 0 || (r.major_listed || 0) > 0;
    });

    return [
        {
            key: 'spf',
            label: 'SPF',
            description: 'Tells receivers which servers may send on this domain’s behalf.',
            ...spfStatus(spfFailing, total),
            issueExplanation: spfFailing.length > 0
                ? `${spfFailing.length} ${spfFailing.length === 1 ? 'domain has no valid SPF record' : 'domains have no valid SPF record'}. Without SPF, receivers fall back to spam-filter heuristics — bounce rates climb fast.`
                : '',
            fixHref: 'https://support.google.com/a/answer/33786',
            fixLabel: 'Opens Google’s SPF setup guide',
            affectedDomains: spfFailing.map(d => d.domain),
        },
        {
            key: 'dkim',
            label: 'DKIM',
            description: 'Cryptographically signs outbound mail so receivers can verify it wasn’t tampered with.',
            ...dkimStatus(dkimFailing, total),
            issueExplanation: dkimFailing.length > 0
                ? `${dkimFailing.length} ${dkimFailing.length === 1 ? 'domain isn’t signing' : 'domains aren’t signing'} outbound mail with DKIM. Gmail and Yahoo penalize unsigned mail under their 2024 sender requirements.`
                : '',
            fixHref: 'https://support.google.com/a/answer/174124',
            fixLabel: 'Opens Google’s DKIM setup guide',
            affectedDomains: dkimFailing.map(d => d.domain),
        },
        {
            key: 'dmarc',
            label: 'DMARC',
            description: 'Tells receivers what to do with mail that fails SPF or DKIM.',
            ...dmarcStatus(dmarcFailing, total),
            issueExplanation: dmarcFailing.length > 0
                ? `${dmarcFailing.length} ${dmarcFailing.length === 1 ? 'domain has' : 'domains have'} no DMARC policy or a non-enforcing one (p=none). Tighten to quarantine or reject to protect inbox placement.`
                : '',
            fixHref: 'https://support.google.com/a/answer/2466580',
            fixLabel: 'Opens Google’s DMARC enforcement guide',
            affectedDomains: dmarcFailing.map(d => d.domain),
        },
        {
            key: 'blacklist',
            label: 'Blacklist',
            description: 'Real-time scans against ~400 anti-spam blacklists.',
            ...blacklistStatus(blacklisted, total),
            issueExplanation: blacklisted.length > 0
                ? `${blacklisted.length} ${blacklisted.length === 1 ? 'domain is currently listed' : 'domains are currently listed'} on a critical or major blacklist. Pause sends from these domains and request delisting before resuming.`
                : '',
            fixHref: 'https://www.spamhaus.org/lookup/',
            fixLabel: 'Opens Spamhaus delisting tool',
            affectedDomains: blacklisted.map(d => d.domain),
        },
    ];
}

function spfStatus(failing: Domain[], total: number): { tone: CheckTone; affectedCount: number; totalDomains: number } {
    if (failing.length === 0) return { tone: 'good', affectedCount: 0, totalDomains: total };
    return { tone: 'bad', affectedCount: failing.length, totalDomains: total };
}
function dkimStatus(failing: Domain[], total: number) {
    if (failing.length === 0) return { tone: 'good' as CheckTone, affectedCount: 0, totalDomains: total };
    return { tone: 'bad' as CheckTone, affectedCount: failing.length, totalDomains: total };
}
function dmarcStatus(failing: Domain[], total: number) {
    if (failing.length === 0) return { tone: 'good' as CheckTone, affectedCount: 0, totalDomains: total };
    // p=none isn't broken — it's just not enforcing. Surface as warn, not bad.
    const allPNone = failing.every(d => d.dmarc_policy === 'none');
    return { tone: allPNone ? 'warn' as CheckTone : 'bad' as CheckTone, affectedCount: failing.length, totalDomains: total };
}
function blacklistStatus(listed: Domain[], total: number) {
    if (listed.length === 0) return { tone: 'good' as CheckTone, affectedCount: 0, totalDomains: total };
    return { tone: 'bad' as CheckTone, affectedCount: listed.length, totalDomains: total };
}

// ────────────────────────────────────────────────────────────────────
// Theme
// ────────────────────────────────────────────────────────────────────

const TONE_THEME: Record<CheckTone, {
    bg: string; border: string; text: string; accent: string; label: string; icon: React.ComponentType<any>;
}> = {
    good:    { bg: '#ECFDF5', border: '#A7F3D0', text: '#065F46', accent: '#10B981', label: 'Healthy',  icon: ShieldCheck    },
    warn:    { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E', accent: '#F59E0B', label: 'Warning',  icon: ShieldAlert    },
    bad:     { bg: '#FEF2F2', border: '#FECACA', text: '#991B1B', accent: '#EF4444', label: 'Action',   icon: ShieldX        },
    unknown: { bg: '#F8FAFC', border: '#E2E8F0', text: '#475569', accent: '#64748B', label: 'Unknown',  icon: ShieldQuestion },
};
