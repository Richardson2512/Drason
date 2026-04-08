'use client';

import { useState, useCallback } from 'react';

/* ─── Types ─── */
interface SpfResult {
    raw: string;
    version: string;
    mechanisms: ParsedMechanism[];
    allMechanism: string | null;
    warnings: string[];
    isValid: boolean;
    lookupCount: number;
}

interface ParsedMechanism {
    qualifier: '+' | '-' | '~' | '?';
    type: string;
    value: string;
    label: string;
}

/* ─── Helpers ─── */
function qualifierLabel(q: string) {
    switch (q) {
        case '+': return 'Pass';
        case '-': return 'Fail';
        case '~': return 'SoftFail';
        case '?': return 'Neutral';
        default: return 'Pass';
    }
}

function qualifierColor(q: string) {
    switch (q) {
        case '+': return 'bg-green-100 text-green-700';
        case '-': return 'bg-red-100 text-red-700';
        case '~': return 'bg-amber-100 text-amber-700';
        case '?': return 'bg-gray-100 text-gray-600';
        default: return 'bg-green-100 text-green-700';
    }
}

const LOOKUP_MECHANISMS = new Set(['include', 'a', 'mx', 'ptr', 'exists', 'redirect']);

function parseSpf(raw: string): SpfResult {
    const warnings: string[] = [];
    const mechanisms: ParsedMechanism[] = [];
    let allMechanism: string | null = null;
    let lookupCount = 0;

    const parts = raw.trim().split(/\s+/);
    const version = parts[0] || '';

    if (version !== 'v=spf1') {
        return { raw, version, mechanisms, allMechanism, warnings: ['SPF record does not start with v=spf1.'], isValid: false, lookupCount: 0 };
    }

    for (let i = 1; i < parts.length; i++) {
        const token = parts[i];
        let qualifier: '+' | '-' | '~' | '?' = '+';
        let body = token;

        if (/^[+\-~?]/.test(token)) {
            qualifier = token[0] as any;
            body = token.slice(1);
        }

        const [typeRaw, ...rest] = body.split(/[:=]/);
        const type = typeRaw.toLowerCase();
        const value = rest.join(':');

        if (type === 'all') {
            allMechanism = `${qualifier}all`;
            continue;
        }

        if (LOOKUP_MECHANISMS.has(type)) {
            lookupCount++;
        }

        let label = type.toUpperCase();
        if (type === 'ip4') label = 'IPv4';
        if (type === 'ip6') label = 'IPv6';
        if (type === 'include') label = 'Include';
        if (type === 'a') label = 'A';
        if (type === 'mx') label = 'MX';
        if (type === 'ptr') label = 'PTR';
        if (type === 'exists') label = 'Exists';
        if (type === 'redirect') label = 'Redirect';
        if (type === 'exp') label = 'Explanation';

        mechanisms.push({ qualifier, type, value, label });
    }

    // Warnings
    if (lookupCount > 10) {
        warnings.push(`SPF record requires ${lookupCount} DNS lookups, exceeding the 10-lookup limit (RFC 7208). Receivers may return PermError.`);
    } else if (lookupCount > 7) {
        warnings.push(`SPF record uses ${lookupCount} of 10 allowed DNS lookups. Consider consolidating to leave room for future changes.`);
    }

    if (!allMechanism) {
        warnings.push('No "all" mechanism found. Without it, receivers may default to neutral, allowing unauthorized senders.');
    } else if (allMechanism === '+all') {
        warnings.push('"all" is set to pass (+all). This allows ANY server to send as your domain. Use ~all or -all instead.');
    } else if (allMechanism === '?all') {
        warnings.push('"all" is set to neutral (?all). This provides no protection. Use ~all or -all instead.');
    } else if (allMechanism === '~all') {
        warnings.push('"all" is set to softfail (~all). This is acceptable but weaker than -all (hard fail). Consider upgrading to -all for stricter enforcement.');
    }

    const hasPtr = mechanisms.some(m => m.type === 'ptr');
    if (hasPtr) {
        warnings.push('"ptr" mechanism is deprecated (RFC 7208 Section 5.5) and causes slow lookups. Replace with explicit ip4/ip6 or a/mx mechanisms.');
    }

    return { raw, version, mechanisms, allMechanism, warnings, isValid: true, lookupCount };
}

/* ─── Component ─── */
export default function SpfLookupClient() {
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<SpfResult | null>(null);
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
            const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleaned)}&type=TXT`);
            if (!res.ok) throw new Error('DNS lookup failed. Please try again.');
            const data = await res.json();

            if (data.Status !== 0) {
                setError(`DNS lookup returned an error (status ${data.Status}). The domain may not exist or has no DNS records.`);
                setLoading(false);
                return;
            }

            const answers: { data: string }[] = data.Answer || [];
            const spfRecords = answers
                .map(a => a.data.replace(/^"|"$/g, '').replace(/"\s*"/g, ''))
                .filter(txt => txt.startsWith('v=spf1'));

            if (spfRecords.length === 0) {
                setError(`No SPF record found for ${cleaned}. This domain has not published an SPF TXT record.`);
                setLoading(false);
                return;
            }

            if (spfRecords.length > 1) {
                const parsed = parseSpf(spfRecords[0]);
                parsed.warnings.unshift(`Multiple SPF records found (${spfRecords.length}). RFC 7208 requires exactly one SPF record per domain. Receivers may reject all of them.`);
                setResult(parsed);
            } else {
                setResult(parseSpf(spfRecords[0]));
            }
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
                <label htmlFor="spf-domain" className="block text-sm font-semibold text-gray-700 mb-2">
                    Domain Name
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                    <input
                        id="spf-domain"
                        type="text"
                        value={domain}
                        onChange={e => setDomain(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="e.g. example.com"
                        className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-gray-900 placeholder:text-gray-400 transition-all"
                        disabled={loading}
                    />
                    <button
                        onClick={handleLookup}
                        disabled={loading || !domain.trim()}
                        className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
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
                            'Check SPF Record'
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
                            <p className="font-semibold text-red-800 text-sm">No SPF Record Found</p>
                            <p className="text-red-700 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Results */}
            {result && (
                <div className="mt-6 space-y-6">
                    {/* Status Badge */}
                    <div className="flex items-center gap-3">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${result.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            <span className={`w-2 h-2 rounded-full ${result.isValid ? 'bg-green-500' : 'bg-red-500'}`} />
                            {result.isValid ? 'Valid SPF Record' : 'Invalid SPF Record'}
                        </span>
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${result.lookupCount > 10 ? 'bg-red-100 text-red-700' : result.lookupCount > 7 ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                            {result.lookupCount}/10 DNS lookups
                        </span>
                    </div>

                    {/* Raw Record */}
                    <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-semibold text-gray-700">Raw SPF Record</h3>
                            <button
                                onClick={handleCopy}
                                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${copied ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-300 hover:text-blue-600'}`}
                            >
                                {copied ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <code className="block text-sm text-gray-800 bg-white rounded-xl p-4 border border-gray-100 font-mono break-all leading-relaxed">
                            {result.raw}
                        </code>
                    </div>

                    {/* Warnings */}
                    {result.warnings.length > 0 && (
                        <div className="space-y-3">
                            {result.warnings.map((w, i) => (
                                <div key={i} className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-2xl p-4">
                                    <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-amber-800">{w}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Parsed Mechanisms */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-6 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700">Parsed Mechanisms</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {result.mechanisms.map((m, i) => (
                                <div key={i} className="flex items-center gap-4 px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${qualifierColor(m.qualifier)}`}>
                                        {qualifierLabel(m.qualifier)}
                                    </span>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-semibold text-gray-900">{m.label}</span>
                                        {m.value && (
                                            <span className="ml-2 text-sm text-gray-500 font-mono break-all">{m.value}</span>
                                        )}
                                    </div>
                                    {LOOKUP_MECHANISMS.has(m.type) && (
                                        <span className="text-xs text-gray-400 shrink-0">DNS lookup</span>
                                    )}
                                </div>
                            ))}

                            {/* All mechanism */}
                            {result.allMechanism && (
                                <div className="flex items-center gap-4 px-6 py-4 bg-gray-50/50">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${qualifierColor(result.allMechanism[0])}`}>
                                        {qualifierLabel(result.allMechanism[0])}
                                    </span>
                                    <div className="flex-1">
                                        <span className="text-sm font-semibold text-gray-900">All</span>
                                        <span className="ml-2 text-sm text-gray-500">(default for unmatched senders)</span>
                                        <p className="text-xs text-gray-500 mt-1">
                                            {result.allMechanism === '-all' && 'Hard fail — emails from unlisted servers are rejected. This is the strongest and recommended setting.'}
                                            {result.allMechanism === '~all' && 'Soft fail — emails from unlisted servers are accepted but marked as suspicious. Consider upgrading to -all for stricter protection.'}
                                            {result.allMechanism === '?all' && 'Neutral — no opinion on unlisted servers. This provides no protection against spoofing.'}
                                            {result.allMechanism === '+all' && 'Pass — any server can send as your domain. This is dangerous and should be changed immediately.'}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Qualifier Reference */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <h3 className="text-sm font-semibold text-gray-700 mb-4">What Do These Results Mean?</h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-start gap-3 p-3 bg-green-50 rounded-xl">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700 shrink-0">Pass</span>
                                <p className="text-xs text-gray-600">The server is authorized to send email for this domain.</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-red-50 rounded-xl">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700 shrink-0">Fail</span>
                                <p className="text-xs text-gray-600">The server is explicitly not authorized. Emails should be rejected.</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-xl">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700 shrink-0">SoftFail</span>
                                <p className="text-xs text-gray-600">The server is probably not authorized. Emails are accepted but flagged.</p>
                            </div>
                            <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                                <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 shrink-0">Neutral</span>
                                <p className="text-xs text-gray-600">No opinion. The domain makes no assertion about this server.</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
