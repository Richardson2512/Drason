'use client';

import { useState, useCallback } from 'react';

/* ─── Types ─── */
interface DmarcTag {
    tag: string;
    value: string;
    label: string;
    description: string;
}

interface DmarcResult {
    raw: string;
    tags: DmarcTag[];
    policy: string | null;
    subdomainPolicy: string | null;
    ruaAddresses: string[];
    rufAddresses: string[];
    adkim: string | null;
    aspf: string | null;
    pct: string | null;
    fo: string | null;
    rf: string | null;
    ri: string | null;
    assessment: 'strong' | 'moderate' | 'monitor' | 'missing';
    assessmentLabel: string;
    recommendations: string[];
}

/* ─── Helpers ─── */
function policyBadgeColor(policy: string | null): string {
    switch (policy) {
        case 'reject': return 'bg-green-100 text-green-700';
        case 'quarantine': return 'bg-amber-100 text-amber-700';
        case 'none': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
    }
}

function assessmentBadgeColor(assessment: string): string {
    switch (assessment) {
        case 'strong': return 'bg-green-100 text-green-700';
        case 'moderate': return 'bg-amber-100 text-amber-700';
        case 'monitor': return 'bg-red-100 text-red-700';
        case 'missing': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-600';
    }
}

function alignmentLabel(value: string): string {
    switch (value) {
        case 'r': return 'Relaxed';
        case 's': return 'Strict';
        default: return value;
    }
}

function policyLabel(value: string): string {
    switch (value) {
        case 'none': return 'None (monitor only)';
        case 'quarantine': return 'Quarantine';
        case 'reject': return 'Reject';
        default: return value;
    }
}

function foLabel(value: string): string {
    switch (value) {
        case '0': return 'Generate report if all checks fail';
        case '1': return 'Generate report if any check fails';
        case 'd': return 'Generate report if DKIM fails';
        case 's': return 'Generate report if SPF fails';
        default: return value;
    }
}

function parseDmarc(raw: string): DmarcResult {
    const tags: DmarcTag[] = [];
    const recommendations: string[] = [];

    const parts = raw.split(';').map(s => s.trim()).filter(Boolean);

    let policy: string | null = null;
    let subdomainPolicy: string | null = null;
    let ruaAddresses: string[] = [];
    let rufAddresses: string[] = [];
    let adkim: string | null = null;
    let aspf: string | null = null;
    let pct: string | null = null;
    let fo: string | null = null;
    let rf: string | null = null;
    let ri: string | null = null;

    for (const part of parts) {
        const eqIndex = part.indexOf('=');
        if (eqIndex === -1) continue;
        const tag = part.slice(0, eqIndex).trim().toLowerCase();
        const value = part.slice(eqIndex + 1).trim();

        switch (tag) {
            case 'v':
                tags.push({ tag: 'v', value, label: 'Version', description: 'DMARC version identifier' });
                break;
            case 'p':
                policy = value.toLowerCase();
                tags.push({ tag: 'p', value: policyLabel(policy), label: 'Policy', description: 'Action for emails failing DMARC from the main domain' });
                break;
            case 'sp':
                subdomainPolicy = value.toLowerCase();
                tags.push({ tag: 'sp', value: policyLabel(subdomainPolicy), label: 'Subdomain Policy', description: 'Action for emails failing DMARC from subdomains' });
                break;
            case 'rua':
                ruaAddresses = value.split(',').map(a => a.trim());
                tags.push({ tag: 'rua', value: ruaAddresses.join(', '), label: 'Aggregate Reports (rua)', description: 'Email addresses receiving aggregate DMARC reports' });
                break;
            case 'ruf':
                rufAddresses = value.split(',').map(a => a.trim());
                tags.push({ tag: 'ruf', value: rufAddresses.join(', '), label: 'Forensic Reports (ruf)', description: 'Email addresses receiving forensic failure reports' });
                break;
            case 'adkim':
                adkim = value.toLowerCase();
                tags.push({ tag: 'adkim', value: alignmentLabel(adkim), label: 'DKIM Alignment', description: 'How strictly the DKIM domain must match the From domain' });
                break;
            case 'aspf':
                aspf = value.toLowerCase();
                tags.push({ tag: 'aspf', value: alignmentLabel(aspf), label: 'SPF Alignment', description: 'How strictly the SPF domain must match the From domain' });
                break;
            case 'pct':
                pct = value;
                tags.push({ tag: 'pct', value: `${value}%`, label: 'Percentage', description: 'Percentage of messages the DMARC policy applies to' });
                break;
            case 'fo':
                fo = value;
                tags.push({ tag: 'fo', value: foLabel(value), label: 'Failure Options', description: 'When to generate failure reports' });
                break;
            case 'rf':
                rf = value;
                tags.push({ tag: 'rf', value, label: 'Report Format', description: 'Format for forensic reports' });
                break;
            case 'ri':
                ri = value;
                tags.push({ tag: 'ri', value: `${value} seconds`, label: 'Report Interval', description: 'Requested interval between aggregate reports' });
                break;
            default:
                tags.push({ tag, value, label: tag.toUpperCase(), description: 'Unknown DMARC tag' });
        }
    }

    // Assessment
    let assessment: 'strong' | 'moderate' | 'monitor' | 'missing';
    let assessmentLabel: string;

    if (policy === 'reject') {
        assessment = 'strong';
        assessmentLabel = 'Strong';
    } else if (policy === 'quarantine') {
        assessment = 'moderate';
        assessmentLabel = 'Moderate';
    } else if (policy === 'none') {
        assessment = 'monitor';
        assessmentLabel = 'Monitor Only';
    } else {
        assessment = 'missing';
        assessmentLabel = 'Missing';
    }

    // Recommendations
    if (policy === 'none') {
        recommendations.push('Your DMARC policy is set to "none," which means unauthenticated emails are delivered normally. This is fine for initial monitoring, but you should plan to move to "quarantine" or "reject" once you have reviewed your aggregate reports and confirmed all legitimate senders pass DKIM and SPF.');
    }
    if (policy === 'quarantine') {
        recommendations.push('Your DMARC policy is "quarantine," which sends failing emails to spam. This is a good intermediate step. Once you are confident all legitimate mail passes authentication, upgrade to "reject" for maximum protection.');
    }
    if (policy === 'reject') {
        recommendations.push('Your DMARC policy is "reject," which is the strongest enforcement level. Unauthenticated emails are blocked entirely. Make sure all legitimate sending services are properly configured with SPF and DKIM.');
    }
    if (ruaAddresses.length === 0) {
        recommendations.push('No aggregate reporting address (rua) is configured. Without it, you will not receive DMARC reports and cannot monitor authentication results. Add a rua tag like rua=mailto:dmarc@yourdomain.com.');
    }
    if (pct && parseInt(pct, 10) < 100) {
        recommendations.push(`Only ${pct}% of messages are subject to your DMARC policy. Consider increasing to 100% once you are confident in your authentication setup.`);
    }
    if (!adkim) {
        recommendations.push('DKIM alignment (adkim) is not explicitly set and defaults to "relaxed." For tighter security, consider setting adkim=s for strict alignment.');
    }
    if (!aspf) {
        recommendations.push('SPF alignment (aspf) is not explicitly set and defaults to "relaxed." For tighter security, consider setting aspf=s for strict alignment.');
    }
    if (!subdomainPolicy && policy !== 'reject') {
        recommendations.push('No subdomain policy (sp) is set, so subdomains inherit the main domain policy. If you do not send email from subdomains, consider adding sp=reject to prevent subdomain spoofing.');
    }

    return { raw, tags, policy, subdomainPolicy, ruaAddresses, rufAddresses, adkim, aspf, pct, fo, rf, ri, assessment, assessmentLabel, recommendations };
}

/* ─── Component ─── */
export default function DmarcLookupClient() {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DmarcResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const handleLookup = useCallback(async () => {
        const cleaned = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
        if (!cleaned || !/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)+$/.test(cleaned)) {
            setError('Please enter a valid domain name (e.g. example.com).');
            setResult(null);
            return;
        }

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch(`https://dns.google/resolve?name=_dmarc.${encodeURIComponent(cleaned)}&type=TXT`);
            if (!res.ok) throw new Error('DNS lookup failed. Please try again.');
            const data = await res.json();

            if (data.Status !== 0) {
                setError(`No DMARC record found for ${cleaned}. The domain may not have published a DMARC policy at _dmarc.${cleaned}.`);
                setLoading(false);
                return;
            }

            const answers: { data: string }[] = data.Answer || [];
            const dmarcRecords = answers
                .map(a => a.data.replace(/^"|"$/g, '').replace(/"\s*"/g, ''))
                .filter(txt => txt.toLowerCase().startsWith('v=dmarc1'));

            if (dmarcRecords.length === 0) {
                setError(`No DMARC record found for ${cleaned}. No TXT record starting with "v=DMARC1" exists at _dmarc.${cleaned}.`);
                setLoading(false);
                return;
            }

            setResult(parseDmarc(dmarcRecords[0]));
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setLoading(false);
        }
    }, [domain]);

    const handleCopy = useCallback(() => {
        if (!result?.raw) return;
        navigator.clipboard.writeText(result.raw);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    }, [result]);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleLookup();
    };

    return (
        <div>
            {/* Input */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                <label htmlFor="dmarc-domain" className="block text-sm font-semibold text-gray-700 mb-2">
                    Domain Name
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        id="dmarc-domain"
                        type="text"
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. example.com"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-gray-900 placeholder:text-gray-400 transition-all"
                        disabled={loading}
                    />
                    <button
                        onClick={handleLookup}
                        disabled={loading || !domain.trim()}
                        className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Checking...
                            </span>
                        ) : (
                            'Check DMARC Record'
                        )}
                    </button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mt-6 bg-red-50 border border-red-200 rounded-2xl p-6">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <circle cx="12" cy="12" r="10" />
                            <path d="M15 9l-6 6M9 9l6 6" />
                        </svg>
                        <div>
                            <p className="font-semibold text-red-800 text-sm">No DMARC Record Found</p>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                            <p className="text-red-600 text-sm mt-3">
                                Without a DMARC record, your domain has no policy for handling unauthenticated emails. Attackers can spoof your domain without any reports being generated.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="mt-6 space-y-6">
                    {/* Assessment Badge */}
                    <div className="flex items-center gap-3 flex-wrap">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${assessmentBadgeColor(result.assessment)}`}>
                            <span className={`w-2 h-2 rounded-full ${
                                result.assessment === 'strong' ? 'bg-green-500' :
                                result.assessment === 'moderate' ? 'bg-amber-500' :
                                'bg-red-500'
                            }`} />
                            {result.assessmentLabel} DMARC Policy
                        </span>
                        {result.policy && (
                            <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold ${policyBadgeColor(result.policy)}`}>
                                p={result.policy}
                            </span>
                        )}
                    </div>

                    {/* Raw Record */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">Raw DMARC Record</h3>
                            <button
                                onClick={handleCopy}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-purple-300 hover:text-purple-600'}`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm break-all leading-relaxed">
                            {result.raw}
                        </div>
                    </div>

                    {/* Parsed Tags */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700">Parsed DMARC Tags</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {result.tags.map((t, i) => (
                                <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-6 py-4">
                                    <div className="flex items-center gap-3 sm:w-48 shrink-0">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-100 text-purple-700 font-mono">
                                            {t.tag}
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">{t.label}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm text-gray-700 font-mono break-all">{t.value}</span>
                                        <p className="text-xs text-gray-400 mt-0.5">{t.description}</p>
                                    </div>
                                    {t.tag === 'p' && result.policy && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold shrink-0 ${policyBadgeColor(result.policy)}`}>
                                            {result.policy === 'reject' ? 'Reject' : result.policy === 'quarantine' ? 'Quarantine' : 'None'}
                                        </span>
                                    )}
                                    {t.tag === 'sp' && result.subdomainPolicy && (
                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold shrink-0 ${policyBadgeColor(result.subdomainPolicy)}`}>
                                            {result.subdomainPolicy === 'reject' ? 'Reject' : result.subdomainPolicy === 'quarantine' ? 'Quarantine' : 'None'}
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Recommendations */}
                    {result.recommendations.length > 0 && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <h3 className="text-sm font-semibold text-gray-700 mb-4">Recommendations</h3>
                            <div className="space-y-3">
                                {result.recommendations.map((r, i) => (
                                    <div key={i} className="flex items-start gap-3">
                                        <svg className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <p className="text-sm text-gray-700">{r}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
