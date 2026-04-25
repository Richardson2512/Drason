'use client';

import { useState, useMemo } from 'react';
import CustomSelect from '@/components/ui/CustomSelect';

const FAILURE_POLICY_OPTIONS = [
 { value: '-all', label: 'Hard Fail (-all) — Recommended' },
 { value: '~all', label: 'Soft Fail (~all)' },
 { value: '?all', label: 'Neutral (?all)' },
];

interface Provider {
 name: string;
 include: string;
}

const COMMON_PROVIDERS: Provider[] = [
 { name: 'Google Workspace', include: '_spf.google.com' },
 { name: 'Microsoft 365', include: 'spf.protection.outlook.com' },
 { name: 'SendGrid', include: 'sendgrid.net' },
 { name: 'Mailgun', include: 'mailgun.org' },
 { name: 'Amazon SES', include: 'amazonses.com' },
 { name: 'Postmark', include: 'spf.mtasv.net' },
 { name: 'Smartlead', include: 'spf.smartlead.ai' },
];

type FailurePolicy = '-all' | '~all' | '?all';

export default function SpfGeneratorClient() {
 const [ipv4List, setIpv4List] = useState<string[]>([]);
 const [ipv6List, setIpv6List] = useState<string[]>([]);
 const [includeList, setIncludeList] = useState<string[]>([]);
 const [allowA, setAllowA] = useState(false);
 const [allowMx, setAllowMx] = useState(false);
 const [failurePolicy, setFailurePolicy] = useState<FailurePolicy>('-all');
 const [ipv4Input, setIpv4Input] = useState('');
 const [ipv6Input, setIpv6Input] = useState('');
 const [includeInput, setIncludeInput] = useState('');
 const [copied, setCopied] = useState(false);

 const addIpv4 = () => {
 const val = ipv4Input.trim();
 if (val && !ipv4List.includes(val)) {
 setIpv4List([...ipv4List, val]);
 setIpv4Input('');
 }
 };

 const addIpv6 = () => {
 const val = ipv6Input.trim();
 if (val && !ipv6List.includes(val)) {
 setIpv6List([...ipv6List, val]);
 setIpv6Input('');
 }
 };

 const addInclude = (domain: string) => {
 const val = domain.trim();
 if (val && !includeList.includes(val)) {
 setIncludeList([...includeList, val]);
 setIncludeInput('');
 }
 };

 const removeItem = (list: string[], setList: (v: string[]) => void, item: string) => {
 setList(list.filter((i) => i !== item));
 };

 const lookupCount = useMemo(() => {
 let count = includeList.length;
 if (allowA) count += 1;
 if (allowMx) count += 1;
 return count;
 }, [includeList, allowA, allowMx]);

 const generatedRecord = useMemo(() => {
 const parts = ['v=spf1'];
 if (allowA) parts.push('a');
 if (allowMx) parts.push('mx');
 ipv4List.forEach((ip) => parts.push(`ip4:${ip}`));
 ipv6List.forEach((ip) => parts.push(`ip6:${ip}`));
 includeList.forEach((domain) => parts.push(`include:${domain}`));
 parts.push(failurePolicy);
 return parts.join(' ');
 }, [ipv4List, ipv6List, includeList, allowA, allowMx, failurePolicy]);

 const warnings = useMemo(() => {
 const w: string[] = [];
 if (ipv4List.length === 0 && ipv6List.length === 0 && includeList.length === 0 && !allowA && !allowMx) {
 w.push('Your SPF record has no authorized senders. Add IPs, includes, or enable A/MX mechanisms.');
 }
 if (lookupCount > 10) {
 w.push(`Your record uses ${lookupCount} DNS lookups, exceeding the 10-lookup limit. Receiving servers may return a permerror.`);
 }
 if (failurePolicy === '?all') {
 w.push('Neutral policy (?all) provides no protection. Consider using ~all (soft fail) or -all (hard fail).');
 }
 return w;
 }, [ipv4List, ipv6List, includeList, allowA, allowMx, lookupCount, failurePolicy]);

 const handleCopy = async () => {
 try {
 await navigator.clipboard.writeText(generatedRecord);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 } catch {
 // fallback
 const textarea = document.createElement('textarea');
 textarea.value = generatedRecord;
 document.body.appendChild(textarea);
 textarea.select();
 document.execCommand('copy');
 document.body.removeChild(textarea);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 }
 };

 return (
 <div className="space-y-8">
 {/* Header */}
 <div>
 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-xs font-medium text-gray-600 mb-6">
 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
 100% Free &middot; No Signup Required
 </div>
 <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
 SPF Record Generator
 </h1>
 <p className="text-gray-600 text-lg">
 Configure authorized sending servers, IP addresses, and third-party includes to generate a properly formatted SPF TXT record for your domain.
 </p>
 </div>

 {/* Generated Record Preview */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Generated SPF Record</h2>
 <div className="flex items-center gap-3">
 <span className={`text-xs font-medium px-2 py-1 ${
 lookupCount > 10
 ? 'bg-red-50 text-red-700 border border-red-200'
 : lookupCount > 7
 ? 'bg-amber-50 text-amber-700 border border-amber-200'
 : 'bg-green-50 text-green-700 border border-green-200'
 }`}>
 {lookupCount}/10 lookups
 </span>
 </div>
 </div>
 <div className="relative">
 <div className="bg-gray-900 text-green-400 p-4 font-mono text-sm break-all leading-relaxed">
 {generatedRecord}
 </div>
 <button
 onClick={handleCopy}
 className="absolute top-2 right-2 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors"
 >
 {copied ? 'Copied!' : 'Copy'}
 </button>
 </div>
 <p className="mt-3 text-xs text-gray-500">
 Publish this as a TXT record at <code className="bg-gray-100 px-1 py-0.5 ">@</code> (root) of your domain&apos;s DNS.
 </p>
 </div>

 {/* Warnings */}
 {warnings.length > 0 && (
 <div className="space-y-2">
 {warnings.map((w) => (
 <div key={w} className="flex items-start gap-3 p-4 bg-amber-50 border border-amber-200 ">
 <span className="text-amber-500 shrink-0 mt-0.5">&#9888;</span>
 <p className="text-sm text-amber-800">{w}</p>
 </div>
 ))}
 </div>
 )}

 {/* Quick Add Providers */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Quick Add Common Providers</h2>
 <div className="flex flex-wrap gap-2">
 {COMMON_PROVIDERS.map((provider) => {
 const isAdded = includeList.includes(provider.include);
 return (
 <button
 key={provider.include}
 onClick={() => !isAdded && addInclude(provider.include)}
 disabled={isAdded}
 className={`px-3 py-1.5 text-xs border transition-colors ${
 isAdded
 ? 'bg-blue-100 text-blue-400 border-blue-200 cursor-default'
 : 'bg-blue-50 text-blue-700 border-blue-100 hover:bg-blue-100 hover:border-blue-200'
 }`}
 >
 {isAdded ? `${provider.name} ✓` : `+ ${provider.name}`}
 </button>
 );
 })}
 </div>
 </div>

 {/* IPv4 Addresses */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">IPv4 Addresses</h2>
 <p className="text-xs text-gray-500 mb-4">Add individual IP addresses or CIDR ranges (e.g. 192.0.2.0/24)</p>
 <div className="flex gap-2">
 <input
 type="text"
 value={ipv4Input}
 onChange={(e) => setIpv4Input(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && addIpv4()}
 placeholder="e.g. 192.0.2.1 or 192.0.2.0/24"
 className="flex-1 px-4 py-3 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
 />
 <button
 onClick={addIpv4}
 className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shrink-0"
 >
 Add
 </button>
 </div>
 {ipv4List.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-3">
 {ipv4List.map((ip) => (
 <span key={ip} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-mono">
 ip4:{ip}
 <button onClick={() => removeItem(ipv4List, setIpv4List, ip)} className="text-gray-400 hover:text-red-500 transition-colors">&times;</button>
 </span>
 ))}
 </div>
 )}
 </div>

 {/* IPv6 Addresses */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">IPv6 Addresses</h2>
 <p className="text-xs text-gray-500 mb-4">Add IPv6 addresses or CIDR ranges (e.g. 2001:db8::/32)</p>
 <div className="flex gap-2">
 <input
 type="text"
 value={ipv6Input}
 onChange={(e) => setIpv6Input(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && addIpv6()}
 placeholder="e.g. 2001:db8::1 or 2001:db8::/32"
 className="flex-1 px-4 py-3 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
 />
 <button
 onClick={addIpv6}
 className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shrink-0"
 >
 Add
 </button>
 </div>
 {ipv6List.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-3">
 {ipv6List.map((ip) => (
 <span key={ip} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-mono">
 ip6:{ip}
 <button onClick={() => removeItem(ipv6List, setIpv6List, ip)} className="text-gray-400 hover:text-red-500 transition-colors">&times;</button>
 </span>
 ))}
 </div>
 )}
 </div>

 {/* Include Domains */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">Include Domains</h2>
 <p className="text-xs text-gray-500 mb-4">Reference another domain&apos;s SPF record. Each include adds 1 DNS lookup.</p>
 <div className="flex gap-2">
 <input
 type="text"
 value={includeInput}
 onChange={(e) => setIncludeInput(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && addInclude(includeInput)}
 placeholder="e.g. _spf.google.com"
 className="flex-1 px-4 py-3 border border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 outline-none text-sm transition-all"
 />
 <button
 onClick={() => addInclude(includeInput)}
 className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 text-sm font-semibold transition-colors shrink-0"
 >
 Add
 </button>
 </div>
 {includeList.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-3">
 {includeList.map((domain) => (
 <span key={domain} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-mono">
 include:{domain}
 <button onClick={() => removeItem(includeList, setIncludeList, domain)} className="text-gray-400 hover:text-red-500 transition-colors">&times;</button>
 </span>
 ))}
 </div>
 )}
 </div>

 {/* Mechanisms & Policy */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Mechanisms &amp; Policy</h2>
 <div className="space-y-4">
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={allowA}
 onChange={(e) => setAllowA(e.target.checked)}
 className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
 />
 <div>
 <span className="text-sm font-medium text-gray-900">Allow domain&apos;s A record</span>
 <p className="text-xs text-gray-500">Authorize the IP address(es) your domain&apos;s A record points to. Adds 1 DNS lookup.</p>
 </div>
 </label>
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={allowMx}
 onChange={(e) => setAllowMx(e.target.checked)}
 className="w-5 h-5 border-gray-300 text-blue-600 focus:ring-blue-500"
 />
 <div>
 <span className="text-sm font-medium text-gray-900">Allow domain&apos;s MX servers</span>
 <p className="text-xs text-gray-500">Authorize your domain&apos;s mail exchange servers to send email. Adds 1 DNS lookup.</p>
 </div>
 </label>
 <div>
 <label className="block text-sm font-medium text-gray-900 mb-2">Failure Policy</label>
 <div className="w-full max-w-sm">
 <CustomSelect
 value={failurePolicy}
 onChange={(v) => setFailurePolicy(v as FailurePolicy)}
 options={FAILURE_POLICY_OPTIONS}
 />
 </div>
 <p className="text-xs text-gray-500 mt-2">
 Hard fail tells receiving servers to reject unauthorized emails. Soft fail marks them but still delivers. Neutral takes no action.
 </p>
 </div>
 </div>
 </div>
 </div>
 );
}
