'use client';

import { useState, useMemo, useCallback } from 'react';
import CustomSelect from '@/components/ui/CustomSelect';

const KEY_TYPE_OPTIONS = [
 { value: 'rsa', label: 'RSA (recommended)' },
 { value: 'ed25519', label: 'Ed25519' },
];

function isValidBase64(str: string): boolean {
 if (!str || str.trim().length === 0) return false;
 const cleaned = str.replace(/\s+/g, '');
 return /^[A-Za-z0-9+/]+=*$/.test(cleaned) && cleaned.length >= 20;
}

export default function DkimGeneratorClient() {
 const [selector, setSelector] = useState('');
 const [domain, setDomain] = useState('');
 const [publicKey, setPublicKey] = useState('');
 const [keyType, setKeyType] = useState<'rsa' | 'ed25519'>('rsa');
 const [testingMode, setTestingMode] = useState(false);
 const [strictAlignment, setStrictAlignment] = useState(false);
 const [notes, setNotes] = useState('');
 const [copied, setCopied] = useState(false);

 const cleanedKey = useMemo(() => {
 return publicKey
 .replace(/-----BEGIN PUBLIC KEY-----/g, '')
 .replace(/-----END PUBLIC KEY-----/g, '')
 .replace(/-----BEGIN RSA PUBLIC KEY-----/g, '')
 .replace(/-----END RSA PUBLIC KEY-----/g, '')
 .replace(/\s+/g, '')
 .trim();
 }, [publicKey]);

 const dnsName = useMemo(() => {
 const sel = selector.trim() || 'selector';
 const dom = domain.trim() || 'yourdomain.com';
 return `${sel}._domainkey.${dom}`;
 }, [selector, domain]);

 const recordValue = useMemo(() => {
 const parts: string[] = ['v=DKIM1'];
 parts.push(`k=${keyType}`);

 const flags: string[] = [];
 if (testingMode) flags.push('y');
 if (strictAlignment) flags.push('s');
 if (flags.length > 0) {
 parts.push(`t=${flags.join(':')}`);
 }

 if (notes.trim()) {
 parts.push(`n=${notes.trim()}`);
 }

 parts.push(`p=${cleanedKey || 'YOUR_PUBLIC_KEY_HERE'}`);

 return parts.join('; ');
 }, [keyType, testingMode, strictAlignment, notes, cleanedKey]);

 const keyWarning = useMemo(() => {
 if (!publicKey.trim()) return null;
 if (!isValidBase64(cleanedKey)) {
 return 'This does not look like a valid base64-encoded public key. Make sure you copied the full key from your email provider.';
 }
 return null;
 }, [publicKey, cleanedKey]);

 const handleCopy = useCallback(async () => {
 try {
 await navigator.clipboard.writeText(recordValue);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 } catch {
 const textarea = document.createElement('textarea');
 textarea.value = recordValue;
 document.body.appendChild(textarea);
 textarea.select();
 document.execCommand('copy');
 document.body.removeChild(textarea);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 }
 }, [recordValue]);

 return (
 <div className="space-y-8">
 {/* Form */}
 <div className="bg-white border border-gray-100 p-6 md:p-8">
 <h2 className="text-lg font-bold text-gray-900 mb-6">Configure Your DKIM Record</h2>

 <div className="space-y-5">
 {/* Selector */}
 <div>
 <label htmlFor="dkim-selector" className="block text-sm font-semibold text-gray-700 mb-2">
 Selector Name
 </label>
 <input
 id="dkim-selector"
 type="text"
 value={selector}
 onChange={(e) => setSelector(e.target.value)}
 placeholder="e.g. google, s1, default"
 className="w-full px-4 py-3 border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
 />
 {!selector.trim() && (
 <p className="mt-1.5 text-xs text-amber-600">
 Enter a selector name. Your email provider will tell you which selector to use.
 </p>
 )}
 </div>

 {/* Domain */}
 <div>
 <label htmlFor="dkim-domain" className="block text-sm font-semibold text-gray-700 mb-2">
 Domain
 </label>
 <input
 id="dkim-domain"
 type="text"
 value={domain}
 onChange={(e) => setDomain(e.target.value)}
 placeholder="e.g. yourdomain.com"
 className="w-full px-4 py-3 border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
 />
 </div>

 {/* Public Key */}
 <div>
 <label htmlFor="dkim-pubkey" className="block text-sm font-semibold text-gray-700 mb-2">
 Public Key
 </label>
 <textarea
 id="dkim-pubkey"
 value={publicKey}
 onChange={(e) => setPublicKey(e.target.value)}
 placeholder="Paste your DKIM public key here (base64 encoded)"
 className="w-full px-4 py-3 border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400 min-h-[120px] resize-y font-mono"
 />
 {keyWarning && (
 <p className="mt-1.5 text-xs text-amber-600 flex items-start gap-1.5">
 <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
 </svg>
 <span>{keyWarning}</span>
 </p>
 )}
 </div>

 {/* Key Type */}
 <div>
 <label className="block text-sm font-semibold text-gray-700 mb-2">
 Key Type
 </label>
 <CustomSelect
 value={keyType}
 onChange={(v) => setKeyType(v as 'rsa' | 'ed25519')}
 options={KEY_TYPE_OPTIONS}
 />
 </div>

 {/* Flags */}
 <div>
 <span className="block text-sm font-semibold text-gray-700 mb-3">Flags</span>
 <div className="space-y-3">
 <label className="flex items-start gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={testingMode}
 onChange={(e) => setTestingMode(e.target.checked)}
 className="mt-0.5 w-5 h-5 border-gray-300 text-emerald-600 focus:ring-emerald-500"
 />
 <div>
 <span className="text-sm font-medium text-gray-900">Testing mode</span>
 <span className="ml-2 text-xs text-gray-400 font-mono">t=y</span>
 <p className="text-xs text-gray-500 mt-0.5">Receiving servers will not reject emails on DKIM failure. Use this when first setting up DKIM.</p>
 </div>
 </label>
 <label className="flex items-start gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={strictAlignment}
 onChange={(e) => setStrictAlignment(e.target.checked)}
 className="mt-0.5 w-5 h-5 border-gray-300 text-emerald-600 focus:ring-emerald-500"
 />
 <div>
 <span className="text-sm font-medium text-gray-900">Strict alignment</span>
 <span className="ml-2 text-xs text-gray-400 font-mono">t=s</span>
 <p className="text-xs text-gray-500 mt-0.5">The signing domain must exactly match the From header domain. Subdomains will not pass alignment.</p>
 </div>
 </label>
 </div>
 </div>

 {/* Notes */}
 <div>
 <label htmlFor="dkim-notes" className="block text-sm font-semibold text-gray-700 mb-2">
 Notes <span className="text-gray-400 font-normal">(optional)</span>
 </label>
 <input
 id="dkim-notes"
 type="text"
 value={notes}
 onChange={(e) => setNotes(e.target.value)}
 placeholder="e.g. Generated for marketing emails"
 className="w-full px-4 py-3 border border-gray-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100 outline-none transition-all text-sm text-gray-900 placeholder:text-gray-400"
 />
 <p className="mt-1.5 text-xs text-gray-400">Adds an informational note to the record (n= field). Not used for validation.</p>
 </div>
 </div>
 </div>

 {/* Live Preview */}
 <div className="bg-white border border-gray-100 p-6 md:p-8">
 <h2 className="text-lg font-bold text-gray-900 mb-6">Generated DKIM Record</h2>

 {/* DNS Name Preview */}
 <div className="mb-4">
 <span className="block text-sm font-semibold text-gray-700 mb-2">DNS Record Name</span>
 <div className="px-4 py-3 bg-gray-50 border border-gray-200 font-mono text-sm text-gray-800 break-all">
 {dnsName}
 </div>
 </div>

 {/* Record Type */}
 <div className="mb-4">
 <span className="block text-sm font-semibold text-gray-700 mb-2">Record Type</span>
 <div className="px-4 py-3 bg-gray-50 border border-gray-200 font-mono text-sm text-gray-800">
 TXT
 </div>
 </div>

 {/* TXT Record Value */}
 <div>
 <span className="block text-sm font-semibold text-gray-700 mb-2">TXT Record Value</span>
 <div className="relative">
 <div className="bg-gray-900 text-green-400 p-4 pr-16 font-mono text-sm break-all leading-relaxed">
 {recordValue}
 </div>
 <button
 onClick={handleCopy}
 className="absolute top-3 right-3 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5"
 title="Copy to clipboard"
 >
 {copied ? (
 <>
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
 </svg>
 Copied
 </>
 ) : (
 <>
 <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0 0 13.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 0 1-.75.75H9.75a.75.75 0 0 1-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 0 1-2.25 2.25H6.75A2.25 2.25 0 0 1 4.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 0 1 1.927-.184" />
 </svg>
 Copy
 </>
 )}
 </button>
 </div>
 </div>

 {/* Info callout for testing mode */}
 {testingMode && (
 <div className="mt-4 p-4 bg-emerald-50 border border-emerald-200 ">
 <div className="flex items-start gap-2">
 <svg className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
 <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
 </svg>
 <p className="text-xs text-emerald-800">
 <strong>Testing mode is enabled.</strong> Receiving servers will log DKIM failures but will not reject emails. Remove the <code className="bg-emerald-100 px-1 ">t=y</code> flag once you have confirmed that DKIM signing is working correctly.
 </p>
 </div>
 </div>
 )}
 </div>

 {/* Setup Instructions */}
 <div className="bg-white border border-gray-100 p-6 md:p-8">
 <h2 className="text-lg font-bold text-gray-900 mb-4">How to Add This Record to Your DNS</h2>
 <ol className="space-y-3 text-sm text-gray-600">
 <li className="flex items-start gap-3">
 <span className="shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">1</span>
 <span>Log in to your domain registrar or DNS provider (e.g., Cloudflare, Namecheap, GoDaddy, Route 53).</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">2</span>
 <span>Navigate to DNS management for your domain.</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">3</span>
 <span>Add a new <strong>TXT</strong> record with the name <code className="bg-gray-100 px-1.5 py-0.5 text-xs font-mono">{dnsName}</code>.</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">4</span>
 <span>Paste the generated TXT record value above into the value field.</span>
 </li>
 <li className="flex items-start gap-3">
 <span className="shrink-0 w-6 h-6 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center text-xs font-bold">5</span>
 <span>Save and wait for DNS propagation (usually 5 minutes to 48 hours).</span>
 </li>
 </ol>
 </div>
 </div>
 );
}
