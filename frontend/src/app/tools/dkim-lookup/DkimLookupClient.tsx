'use client';

import { useState, useCallback } from 'react';

interface DkimParsed {
    version: string | null;
    keyType: string | null;
    publicKey: string | null;
    flags: string | null;
    notes: string | null;
}

interface DkimResult {
    status: 'valid' | 'revoked' | 'not_found' | 'error';
    queryName: string;
    rawRecord: string | null;
    parsed: DkimParsed;
    keyLengthBits: number | null;
    message: string;
}

const COMMON_SELECTORS = ['google', 's1', 's2', 'default', 'selector1', 'selector2', 'k1', 'dkim', 'mail'];

function parseDkimRecord(raw: string): DkimParsed {
    const getTag = (tag: string): string | null => {
        const regex = new RegExp(`(?:^|;)\\s*${tag}\\s*=\\s*([^;]*)`, 'i');
        const match = raw.match(regex);
        return match ? match[1].trim() : null;
    };

    return {
        version: getTag('v'),
        keyType: getTag('k'),
        publicKey: getTag('p'),
        flags: getTag('t'),
        notes: getTag('n'),
    };
}

function estimateKeyLength(publicKey: string): number | null {
    if (!publicKey) return null;
    try {
        const cleaned = publicKey.replace(/\s/g, '');
        const bytes = atob(cleaned);
        const bits = bytes.length * 8;
        // RSA public keys have overhead; approximate the key size
        if (bits >= 2000) return 2048;
        if (bits >= 1000) return 1024;
        if (bits >= 500) return 512;
        return bits;
    } catch {
        return null;
    }
}

export default function DkimLookupClient() {
    const [selector, setSelector] = useState('');
    const [domain, setDomain] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<DkimResult | null>(null);
    const [copied, setCopied] = useState(false);

    const lookupDkim = useCallback(async () => {
        const cleanDomain = domain.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '');
        const cleanSelector = selector.trim().toLowerCase();

        if (!cleanDomain || !cleanSelector) return;

        const queryName = `${cleanSelector}._domainkey.${cleanDomain}`;
        setLoading(true);
        setResult(null);

        try {
            const res = await fetch(
                `https://dns.google/resolve?name=${encodeURIComponent(queryName)}&type=TXT`
            );

            if (!res.ok) {
                setResult({
                    status: 'error',
                    queryName,
                    rawRecord: null,
                    parsed: { version: null, keyType: null, publicKey: null, flags: null, notes: null },
                    keyLengthBits: null,
                    message: `DNS query failed with status ${res.status}. Check your inputs and try again.`,
                });
                return;
            }

            const data = await res.json();

            if (!data.Answer || data.Answer.length === 0) {
                setResult({
                    status: 'not_found',
                    queryName,
                    rawRecord: null,
                    parsed: { version: null, keyType: null, publicKey: null, flags: null, notes: null },
                    keyLengthBits: null,
                    message: `No DKIM record found at ${queryName}. Check that the selector and domain are correct.`,
                });
                return;
            }

            // TXT records may be split across multiple strings — concatenate them
            const txtRecords = data.Answer
                .filter((a: { type: number }) => a.type === 16)
                .map((a: { data: string }) => a.data.replace(/"/g, '').replace(/\s+/g, ''));

            // Find the DKIM record (contains p= tag)
            let rawRecord = txtRecords.find((r: string) => /p\s*=/i.test(r)) || txtRecords[0] || '';

            // Some DNS responses split TXT data into multiple quoted strings
            // Rejoin if the raw data from Answer contains them
            if (!rawRecord && data.Answer.length > 0) {
                rawRecord = data.Answer
                    .filter((a: { type: number }) => a.type === 16)
                    .map((a: { data: string }) => a.data)
                    .join('')
                    .replace(/"/g, '');
            }

            if (!rawRecord) {
                setResult({
                    status: 'not_found',
                    queryName,
                    rawRecord: null,
                    parsed: { version: null, keyType: null, publicKey: null, flags: null, notes: null },
                    keyLengthBits: null,
                    message: `A DNS record exists at ${queryName} but it does not appear to be a valid DKIM record.`,
                });
                return;
            }

            const parsed = parseDkimRecord(rawRecord);
            const keyLengthBits = parsed.publicKey ? estimateKeyLength(parsed.publicKey) : null;

            if (parsed.publicKey === '' || parsed.publicKey === null) {
                setResult({
                    status: 'revoked',
                    queryName,
                    rawRecord,
                    parsed,
                    keyLengthBits: null,
                    message: 'DKIM key has been revoked (empty public key). Emails signed with this key will fail verification.',
                });
                return;
            }

            setResult({
                status: 'valid',
                queryName,
                rawRecord,
                parsed,
                keyLengthBits,
                message: 'DKIM record found and public key is present.',
            });
        } catch (err) {
            setResult({
                status: 'error',
                queryName,
                rawRecord: null,
                parsed: { version: null, keyType: null, publicKey: null, flags: null, notes: null },
                keyLengthBits: null,
                message: err instanceof Error ? err.message : 'Network error. Check your connection and try again.',
            });
        } finally {
            setLoading(false);
        }
    }, [selector, domain]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        lookupDkim();
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const statusConfig = {
        valid: { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800', label: 'Valid', dot: 'bg-green-500' },
        revoked: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', label: 'Revoked Key', dot: 'bg-red-500' },
        not_found: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', label: 'Not Found', dot: 'bg-amber-500' },
        error: { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', label: 'Error', dot: 'bg-red-500' },
    };

    return (
        <div className="space-y-6">
            {/* Input Form */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="dkim-selector" className="block text-sm font-semibold text-gray-700 mb-2">
                                DKIM Selector
                            </label>
                            <input
                                id="dkim-selector"
                                type="text"
                                value={selector}
                                onChange={(e) => setSelector(e.target.value)}
                                placeholder="e.g. google, s1, default"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="dkim-domain" className="block text-sm font-semibold text-gray-700 mb-2">
                                Domain
                            </label>
                            <input
                                id="dkim-domain"
                                type="text"
                                value={domain}
                                onChange={(e) => setDomain(e.target.value)}
                                placeholder="e.g. example.com"
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-gray-900 placeholder:text-gray-400"
                                required
                            />
                        </div>
                    </div>

                    {/* Quick Selector Buttons */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-2">Common selectors:</p>
                        <div className="flex flex-wrap gap-2">
                            {COMMON_SELECTORS.map((s) => (
                                <button
                                    key={s}
                                    type="button"
                                    onClick={() => setSelector(s)}
                                    className={`px-3 py-1.5 text-xs rounded-lg border transition-all duration-200 ${
                                        selector === s
                                            ? 'bg-emerald-600 text-white border-emerald-600'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-100 hover:bg-emerald-100 hover:border-emerald-200'
                                    }`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading || !selector.trim() || !domain.trim()}
                        className="w-full md:w-auto px-6 py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                </svg>
                                Checking...
                            </>
                        ) : (
                            'Check DKIM Record'
                        )}
                    </button>
                </form>
            </div>

            {/* Results */}
            {result && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 md:p-8 space-y-6">
                    {/* Status Badge */}
                    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${statusConfig[result.status].bg} ${statusConfig[result.status].border} ${statusConfig[result.status].text} border`}>
                        <span className={`w-2 h-2 rounded-full ${statusConfig[result.status].dot}`} />
                        {statusConfig[result.status].label}
                    </div>

                    {/* Query Name */}
                    <div>
                        <p className="text-xs font-medium text-gray-500 mb-1">DNS Record Queried</p>
                        <p className="font-mono text-sm text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{result.queryName}</p>
                    </div>

                    {/* Status Message */}
                    <p className="text-sm text-gray-600">{result.message}</p>

                    {/* Not Found Guide */}
                    {(result.status === 'not_found' || result.status === 'error') && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                            <h3 className="font-semibold text-gray-900">What should you do next?</h3>
                            <p className="text-sm text-gray-600">
                                Without a DKIM record, receiving servers cannot verify that emails from your domain are authentic and unaltered. This weakens your sender reputation and hurts inbox placement.
                            </p>
                            <div className="space-y-3">
                                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">1</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Check your selector is correct</p>
                                        <p className="text-xs text-gray-500 mt-0.5">DKIM selectors vary by provider. Check your email headers for the <code className="px-1 py-0.5 bg-gray-100 rounded text-xs">s=</code> value in the DKIM-Signature header, or try common selectors like <strong>google</strong>, <strong>s1</strong>, <strong>s2</strong>, or <strong>default</strong>.</p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">2</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Enable DKIM in your email provider</p>
                                        <p className="text-xs text-gray-500 mt-0.5">Most providers generate the DKIM key pair for you. Enable DKIM signing in your provider settings and add the DNS record they give you.</p>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            <a href="https://support.google.com/a/answer/174124" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white text-gray-600 text-xs rounded-lg border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 transition-colors">Google Workspace</a>
                                            <a href="https://learn.microsoft.com/en-us/microsoft-365/security/office-365-security/email-authentication-dkim-configure" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white text-gray-600 text-xs rounded-lg border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 transition-colors">Microsoft 365</a>
                                            <a href="https://docs.sendgrid.com/ui/account-and-settings/how-to-set-up-domain-authentication" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white text-gray-600 text-xs rounded-lg border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 transition-colors">SendGrid</a>
                                            <a href="https://documentation.mailgun.com/docs/mailgun/user-manual/get-started/#verify-your-domain" target="_blank" rel="noopener noreferrer" className="px-3 py-1.5 bg-white text-gray-600 text-xs rounded-lg border border-gray-200 hover:border-emerald-300 hover:text-emerald-600 transition-colors">Mailgun</a>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3 p-3 bg-emerald-50 rounded-xl">
                                    <span className="w-6 h-6 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center text-xs font-bold shrink-0">3</span>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Or generate a DKIM record manually</p>
                                        <p className="text-xs text-gray-500 mt-0.5">If you have your own public key, use our generator to create the DNS record.</p>
                                        <a href="/tools/dkim-generator" className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 hover:text-emerald-700 mt-1">Use DKIM Generator &rarr;</a>
                                    </div>
                                </div>
                            </div>
                            <div className="p-3 bg-gray-50 rounded-xl">
                                <p className="text-xs text-gray-500">Learn more: <a href="/blog/spf-dkim-dmarc-explained" className="text-emerald-600 font-medium hover:underline">SPF, DKIM &amp; DMARC Setup Guide</a></p>
                            </div>
                        </div>
                    )}

                    {/* Raw Record */}
                    {result.rawRecord && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-xs font-medium text-gray-500">Raw DKIM Record</p>
                                <button
                                    onClick={() => copyToClipboard(result.rawRecord!)}
                                    className="text-xs text-gray-400 hover:text-gray-600 transition-colors flex items-center gap-1"
                                >
                                    {copied ? (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path d="M5 13l4 4L19 7" /></svg>
                                            Copied
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" /></svg>
                                            Copy
                                        </>
                                    )}
                                </button>
                            </div>
                            <div className="bg-gray-900 text-green-400 p-4 rounded-xl font-mono text-sm overflow-x-auto whitespace-pre-wrap break-all">
                                {result.rawRecord}
                            </div>
                        </div>
                    )}

                    {/* Parsed Fields */}
                    {result.rawRecord && (
                        <div>
                            <p className="text-xs font-medium text-gray-500 mb-3">Parsed Fields</p>
                            <div className="bg-gray-50 rounded-2xl p-6 space-y-4">
                                <ParsedField label="Version (v=)" value={result.parsed.version} fallback="Not specified (defaults to DKIM1)" />
                                <ParsedField label="Key Type (k=)" value={result.parsed.keyType} fallback="Not specified (defaults to rsa)" />
                                <ParsedField
                                    label="Public Key (p=)"
                                    value={result.parsed.publicKey || undefined}
                                    fallback={result.status === 'revoked' ? 'Empty — key has been revoked' : 'Not found'}
                                    isKey
                                    warn={result.status === 'revoked'}
                                />
                                {result.keyLengthBits && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm font-medium text-gray-700">Estimated Key Length:</span>
                                        <span className={`text-sm font-semibold ${result.keyLengthBits >= 2048 ? 'text-green-600' : result.keyLengthBits >= 1024 ? 'text-amber-600' : 'text-red-600'}`}>
                                            {result.keyLengthBits} bits
                                            {result.keyLengthBits >= 2048 && ' (recommended)'}
                                            {result.keyLengthBits < 1024 && ' (too short — upgrade to 2048-bit)'}
                                        </span>
                                    </div>
                                )}
                                <ParsedField label="Flags (t=)" value={result.parsed.flags} fallback="Not set" />
                                <ParsedField label="Notes (n=)" value={result.parsed.notes} fallback="Not set" />
                            </div>
                        </div>
                    )}

                    {/* Revoked Key Warning */}
                    {result.status === 'revoked' && (
                        <div className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                            <svg className="w-5 h-5 text-red-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                                <path d="M12 15.75h.007v.008H12v-.008z" />
                            </svg>
                            <div>
                                <p className="text-sm font-semibold text-red-800">This DKIM key has been revoked</p>
                                <p className="text-sm text-red-600 mt-1">
                                    The public key field (p=) is empty, which means this key has been intentionally decommissioned. Any emails signed with this selector will fail DKIM verification. If you are still using this selector, you need to publish a new key.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function ParsedField({
    label,
    value,
    fallback,
    isKey = false,
    warn = false,
}: {
    label: string;
    value?: string | null;
    fallback: string;
    isKey?: boolean;
    warn?: boolean;
}) {
    return (
        <div>
            <p className="text-sm font-medium text-gray-700 mb-1">{label}</p>
            {value ? (
                <p className={`text-sm font-mono ${isKey ? 'break-all text-gray-600' : 'text-gray-900'}`}>
                    {value}
                </p>
            ) : (
                <p className={`text-sm ${warn ? 'text-red-600 font-semibold' : 'text-gray-400 italic'}`}>
                    {fallback}
                </p>
            )}
        </div>
    );
}
