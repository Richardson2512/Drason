'use client';

import { useState, useMemo, useCallback } from 'react';
import CustomSelect from '@/components/ui/CustomSelect';

/* ─── Types ─── */
type Policy = 'none' | 'quarantine' | 'reject';
type SubdomainPolicy = 'same' | 'none' | 'quarantine' | 'reject';
type Alignment = 'r' | 's';
type ReportInterval = '86400' | '3600';
type FoOption = '0' | '1' | 'd' | 's';

const POLICY_OPTIONS = [
 { value: 'none', label: 'None — Monitor only (recommended for new domains)' },
 { value: 'quarantine', label: 'Quarantine — Send to spam folder' },
 { value: 'reject', label: 'Reject — Block entirely' },
];
const SUBDOMAIN_POLICY_OPTIONS = [
 { value: 'same', label: 'Same as domain policy' },
 { value: 'none', label: 'None — Monitor only' },
 { value: 'quarantine', label: 'Quarantine — Send to spam folder' },
 { value: 'reject', label: 'Reject — Block entirely' },
];
const REPORT_INTERVAL_OPTIONS = [
 { value: '86400', label: 'Every 24 hours (daily — default)' },
 { value: '3600', label: 'Every 1 hour' },
];

/* ─── Component ─── */
export default function DmarcGeneratorClient() {
 const [domain, setDomain] = useState('');
 const [policy, setPolicy] = useState<Policy>('none');
 const [subdomainPolicy, setSubdomainPolicy] = useState<SubdomainPolicy>('same');
 const [ruaEmails, setRuaEmails] = useState<string[]>([]);
 const [ruaInput, setRuaInput] = useState('');
 const [rufEmails, setRufEmails] = useState<string[]>([]);
 const [rufInput, setRufInput] = useState('');
 const [adkim, setAdkim] = useState<Alignment>('r');
 const [aspf, setAspf] = useState<Alignment>('r');
 const [pct, setPct] = useState(100);
 const [foOptions, setFoOptions] = useState<FoOption[]>(['0']);
 const [ri, setRi] = useState<ReportInterval>('86400');
 const [copied, setCopied] = useState(false);

 /* ─── Helpers ─── */
 const addRuaEmail = useCallback(() => {
 const val = ruaInput.trim().toLowerCase();
 if (val && !ruaEmails.includes(val) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
 setRuaEmails((prev) => [...prev, val]);
 setRuaInput('');
 }
 }, [ruaInput, ruaEmails]);

 const addRufEmail = useCallback(() => {
 const val = rufInput.trim().toLowerCase();
 if (val && !rufEmails.includes(val) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) {
 setRufEmails((prev) => [...prev, val]);
 setRufInput('');
 }
 }, [rufInput, rufEmails]);

 const removeEmail = (list: string[], setList: (v: string[]) => void, email: string) => {
 setList(list.filter((e) => e !== email));
 };

 const toggleFo = (option: FoOption) => {
 setFoOptions((prev) =>
 prev.includes(option) ? prev.filter((o) => o !== option) : [...prev, option]
 );
 };

 /* ─── Generated Record ─── */
 const generatedRecord = useMemo(() => {
 const parts = ['v=DMARC1'];
 parts.push(`p=${policy}`);

 const effectiveSp = subdomainPolicy === 'same' ? undefined : subdomainPolicy;
 if (effectiveSp) {
 parts.push(`sp=${effectiveSp}`);
 }

 if (ruaEmails.length > 0) {
 parts.push(`rua=${ruaEmails.map((e) => `mailto:${e}`).join(',')}`);
 }
 if (rufEmails.length > 0) {
 parts.push(`ruf=${rufEmails.map((e) => `mailto:${e}`).join(',')}`);
 }

 if (adkim === 's') parts.push('adkim=s');
 if (aspf === 's') parts.push('aspf=s');

 if (pct < 100) parts.push(`pct=${pct}`);

 if (foOptions.length > 0 && !(foOptions.length === 1 && foOptions[0] === '0')) {
 parts.push(`fo=${foOptions.join(':')}`);
 }

 if (ri !== '86400') parts.push(`ri=${ri}`);

 return parts.join('; ');
 }, [policy, subdomainPolicy, ruaEmails, rufEmails, adkim, aspf, pct, foOptions, ri]);

 const dnsRecordName = useMemo(() => {
 const d = domain.trim().replace(/^https?:\/\//, '').replace(/\/.*$/, '').toLowerCase();
 return d ? `_dmarc.${d}` : '_dmarc.yourdomain.com';
 }, [domain]);

 /* ─── Warnings ─── */
 const warnings = useMemo(() => {
 const w: string[] = [];
 if (policy === 'none' && ruaEmails.length === 0) {
 w.push(
 'You have p=none (monitor only) without any reporting addresses. Without rua reports, monitoring mode provides no value. Add at least one aggregate report email.'
 );
 }
 if ((policy === 'quarantine' || policy === 'reject') && ruaEmails.length === 0) {
 w.push(
 'Enforcing a DMARC policy without reporting addresses means you will not know when legitimate emails are being blocked. Add at least one rua address.'
 );
 }
 if (rufEmails.length > 0) {
 w.push(
 'Forensic reports (ruf) may contain personally identifiable information such as email addresses and message content. Ensure your reporting address is secured and compliant with your privacy policies.'
 );
 }
 if (policy === 'reject' && pct === 100 && ruaEmails.length === 0) {
 w.push(
 'A p=reject policy at 100% with no reporting is aggressive. Consider starting with p=none or p=quarantine at a lower percentage first.'
 );
 }
 return w;
 }, [policy, ruaEmails, rufEmails, pct]);

 /* ─── Policy Strength ─── */
 const policyStrength = useMemo(() => {
 let score = 0;
 if (policy === 'quarantine') score = 40;
 if (policy === 'reject') score = 70;
 score += (pct / 100) * 30;
 if (adkim === 's') score += 5;
 if (aspf === 's') score += 5;
 // Cap at 100
 return Math.min(Math.round(score), 100);
 }, [policy, pct, adkim, aspf]);

 const strengthLabel = policyStrength < 30 ? 'Weak' : policyStrength < 60 ? 'Moderate' : 'Strong';
 const strengthColor =
 policyStrength < 30
 ? 'from-red-400 to-red-500'
 : policyStrength < 60
 ? 'from-amber-400 to-amber-500'
 : 'from-green-400 to-green-500';

 /* ─── Copy ─── */
 const handleCopy = useCallback(async () => {
 try {
 await navigator.clipboard.writeText(generatedRecord);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 } catch {
 const textarea = document.createElement('textarea');
 textarea.value = generatedRecord;
 document.body.appendChild(textarea);
 textarea.select();
 document.execCommand('copy');
 document.body.removeChild(textarea);
 setCopied(true);
 setTimeout(() => setCopied(false), 2000);
 }
 }, [generatedRecord]);

 return (
 <div className="space-y-8">
 {/* Header */}
 <div>
 <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-full text-xs font-medium text-gray-600 mb-6">
 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
 100% Free &middot; No Signup Required
 </div>
 <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-gray-900 mb-3">
 DMARC Record Generator
 </h1>
 <p className="text-gray-600 text-lg">
 Configure your DMARC policy, reporting addresses, and alignment settings to create a properly formatted
 DMARC TXT record for your domain.
 </p>
 </div>

 {/* Generated Record Preview */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <div className="flex items-center justify-between mb-3">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Generated DMARC Record</h2>
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
 Publish this as a TXT record at{' '}
 <code className="bg-gray-100 px-1.5 py-0.5 font-mono">{dnsRecordName}</code> in your DNS
 provider.
 </p>

 {/* Policy Strength Indicator */}
 <div className="mt-4">
 <div className="flex items-center justify-between mb-1.5">
 <span className="text-xs font-semibold text-gray-600">Policy Strength</span>
 <span className="text-xs font-bold text-gray-700">{strengthLabel}</span>
 </div>
 <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
 <div
 className={`h-full rounded-full bg-gradient-to-r ${strengthColor} transition-all duration-500 ease-out`}
 style={{ width: `${policyStrength}%` }}
 />
 </div>
 </div>
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

 {/* Domain */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">Domain</h2>
 <p className="text-xs text-gray-500 mb-4">
 Enter your domain name to preview the DNS record name.
 </p>
 <input
 type="text"
 value={domain}
 onChange={(e) => setDomain(e.target.value)}
 placeholder="e.g. example.com"
 className="w-full max-w-md px-4 py-3 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all"
 />
 {domain.trim() && (
 <p className="mt-2 text-xs text-gray-500">
 DNS Record Name:{' '}
 <code className="bg-gray-100 px-1.5 py-0.5 font-mono">{dnsRecordName}</code>
 </p>
 )}
 </div>

 {/* Policy */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">Policy (p=)</h2>
 <p className="text-xs text-gray-500 mb-4">
 What should receiving servers do with emails that fail DMARC?
 </p>
 <div className="w-full max-w-md">
 <CustomSelect
 value={policy}
 onChange={(v) => setPolicy(v as Policy)}
 options={POLICY_OPTIONS}
 />
 </div>
 </div>

 {/* Subdomain Policy */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">Subdomain Policy (sp=)</h2>
 <p className="text-xs text-gray-500 mb-4">
 Override the policy for subdomains. If set to &quot;Same as domain policy,&quot; the sp= tag is omitted.
 </p>
 <div className="w-full max-w-md">
 <CustomSelect
 value={subdomainPolicy}
 onChange={(v) => setSubdomainPolicy(v as SubdomainPolicy)}
 options={SUBDOMAIN_POLICY_OPTIONS}
 />
 </div>
 </div>

 {/* Aggregate Report Emails (rua) */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
 Aggregate Report Emails (rua=)
 </h2>
 <p className="text-xs text-gray-500 mb-4">
 Email addresses to receive daily aggregate DMARC reports. The mailto: prefix is added automatically.
 </p>
 <div className="flex gap-2">
 <input
 type="email"
 value={ruaInput}
 onChange={(e) => setRuaInput(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && addRuaEmail()}
 placeholder="e.g. dmarc-reports@example.com"
 className="flex-1 px-4 py-3 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all"
 />
 <button
 onClick={addRuaEmail}
 className="px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 text-sm font-semibold transition-colors shrink-0"
 >
 Add
 </button>
 </div>
 {ruaEmails.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-3">
 {ruaEmails.map((email) => (
 <span
 key={email}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-sm font-mono border border-purple-100"
 >
 mailto:{email}
 <button
 onClick={() => removeEmail(ruaEmails, setRuaEmails, email)}
 className="text-purple-400 hover:text-red-500 transition-colors"
 >
 &times;
 </button>
 </span>
 ))}
 </div>
 )}
 </div>

 {/* Forensic Report Emails (ruf) */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
 Forensic Report Emails (ruf=)
 </h2>
 <p className="text-xs text-gray-500 mb-4">
 Optional. Email addresses to receive individual failure reports. Not supported by all receivers. May
 contain PII.
 </p>
 <div className="flex gap-2">
 <input
 type="email"
 value={rufInput}
 onChange={(e) => setRufInput(e.target.value)}
 onKeyDown={(e) => e.key === 'Enter' && addRufEmail()}
 placeholder="e.g. dmarc-forensic@example.com"
 className="flex-1 px-4 py-3 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm transition-all"
 />
 <button
 onClick={addRufEmail}
 className="px-6 py-3 bg-purple-600 text-white hover:bg-purple-700 text-sm font-semibold transition-colors shrink-0"
 >
 Add
 </button>
 </div>
 {rufEmails.length > 0 && (
 <div className="flex flex-wrap gap-2 mt-3">
 {rufEmails.map((email) => (
 <span
 key={email}
 className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 text-gray-700 text-sm font-mono border border-gray-200"
 >
 mailto:{email}
 <button
 onClick={() => removeEmail(rufEmails, setRufEmails, email)}
 className="text-gray-400 hover:text-red-500 transition-colors"
 >
 &times;
 </button>
 </span>
 ))}
 </div>
 )}
 </div>

 {/* DKIM Alignment */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">DKIM Alignment (adkim=)</h2>
 <p className="text-xs text-gray-500 mb-4">
 How strictly must the DKIM signing domain match the From header domain?
 </p>
 <div className="flex gap-6">
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="radio"
 name="adkim"
 value="r"
 checked={adkim === 'r'}
 onChange={() => setAdkim('r')}
 className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
 />
 <div>
 <span className="text-sm font-medium text-gray-900">Relaxed</span>
 <p className="text-xs text-gray-500">Subdomain match allowed (default)</p>
 </div>
 </label>
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="radio"
 name="adkim"
 value="s"
 checked={adkim === 's'}
 onChange={() => setAdkim('s')}
 className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
 />
 <div>
 <span className="text-sm font-medium text-gray-900">Strict</span>
 <p className="text-xs text-gray-500">Exact domain match required</p>
 </div>
 </label>
 </div>
 </div>

 {/* SPF Alignment */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">SPF Alignment (aspf=)</h2>
 <p className="text-xs text-gray-500 mb-4">
 How strictly must the SPF-authenticated domain match the From header domain?
 </p>
 <div className="flex gap-6">
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="radio"
 name="aspf"
 value="r"
 checked={aspf === 'r'}
 onChange={() => setAspf('r')}
 className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
 />
 <div>
 <span className="text-sm font-medium text-gray-900">Relaxed</span>
 <p className="text-xs text-gray-500">Subdomain match allowed (default)</p>
 </div>
 </label>
 <label className="flex items-center gap-3 cursor-pointer">
 <input
 type="radio"
 name="aspf"
 value="s"
 checked={aspf === 's'}
 onChange={() => setAspf('s')}
 className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
 />
 <div>
 <span className="text-sm font-medium text-gray-900">Strict</span>
 <p className="text-xs text-gray-500">Exact domain match required</p>
 </div>
 </label>
 </div>
 </div>

 {/* Percentage */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">Percentage (pct=)</h2>
 <p className="text-xs text-gray-500 mb-4">
 Apply the DMARC policy to this percentage of messages. Use values below 100 for gradual rollout.
 </p>
 <div className="flex items-center gap-4">
 <input
 type="range"
 min={1}
 max={100}
 value={pct}
 onChange={(e) => setPct(Number(e.target.value))}
 className="flex-1 h-2 bg-gray-200 appearance-none cursor-pointer accent-purple-600"
 />
 <div className="flex items-center gap-1 shrink-0">
 <input
 type="number"
 min={1}
 max={100}
 value={pct}
 onChange={(e) => {
 const v = Math.max(1, Math.min(100, Number(e.target.value) || 1));
 setPct(v);
 }}
 className="w-16 px-3 py-2 border border-gray-200 focus:border-purple-400 focus:ring-2 focus:ring-purple-100 outline-none text-sm text-center transition-all"
 />
 <span className="text-sm text-gray-500">%</span>
 </div>
 </div>
 {pct < 100 && (
 <p className="mt-2 text-xs text-purple-600 font-medium">
 The policy will apply to {pct}% of messages. The remaining {100 - pct}% will be treated as p=none.
 </p>
 )}
 </div>

 {/* Failure Reporting Options */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
 Failure Reporting Options (fo=)
 </h2>
 <p className="text-xs text-gray-500 mb-4">
 When should forensic failure reports be generated? Only relevant if you have ruf addresses configured.
 </p>
 <div className="space-y-3">
 {(
 [
 { value: '0' as FoOption, label: 'Generate report if all checks fail', desc: 'Both SPF and DKIM must fail (default)' },
 { value: '1' as FoOption, label: 'Generate report if any check fails', desc: 'Either SPF or DKIM failure triggers a report' },
 { value: 'd' as FoOption, label: 'Generate report on DKIM failure', desc: 'Report when DKIM signature check fails' },
 { value: 's' as FoOption, label: 'Generate report on SPF failure', desc: 'Report when SPF check fails' },
 ] as const
 ).map((opt) => (
 <label key={opt.value} className="flex items-start gap-3 cursor-pointer">
 <input
 type="checkbox"
 checked={foOptions.includes(opt.value)}
 onChange={() => toggleFo(opt.value)}
 className="w-5 h-5 border-gray-300 text-purple-600 focus:ring-purple-500 mt-0.5"
 />
 <div>
 <span className="text-sm font-medium text-gray-900">{opt.label}</span>
 <span className="ml-2 text-xs text-gray-400 font-mono">fo={opt.value}</span>
 <p className="text-xs text-gray-500">{opt.desc}</p>
 </div>
 </label>
 ))}
 </div>
 </div>

 {/* Report Interval */}
 <div className="bg-white border border-gray-100 p-6 shadow-sm">
 <h2 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-1">
 Report Interval (ri=)
 </h2>
 <p className="text-xs text-gray-500 mb-4">
 How often should aggregate reports be sent? Most receivers send daily regardless of this setting.
 </p>
 <div className="w-full max-w-md">
 <CustomSelect
 value={ri}
 onChange={(v) => setRi(v as ReportInterval)}
 options={REPORT_INTERVAL_OPTIONS}
 />
 </div>
 </div>
 </div>
 );
}
