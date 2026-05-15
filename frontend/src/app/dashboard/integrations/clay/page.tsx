'use client';

/**
 * Clay integration detail page. Shows the org's webhook URL, signing
 * secret, and quick configuration steps. Lives under
 * /dashboard/integrations/clay so the integrations page can route to a
 * dedicated, themed detail screen instead of dumping the customer onto
 * the legacy "Settings & Configuration" page.
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { apiClient } from '@/lib/api';
import type { ClayWebhookResponse, Organization } from '@/types/api';
import {
    ChevronLeft,
    Copy,
    Check,
    ExternalLink,
    Eye,
    EyeOff,
    Shield,
    BookOpen,
} from 'lucide-react';

function CopyChip({ text, label = 'Copy' }: { text: string; label?: string }) {
    const [copied, setCopied] = useState(false);
    if (!text) return null;
    return (
        <button
            type="button"
            onClick={() => {
                navigator.clipboard.writeText(text);
                setCopied(true);
                setTimeout(() => setCopied(false), 1500);
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold text-gray-600 hover:text-gray-900 hover:bg-slate-100 transition-colors border border-[#E2E8F0] bg-white"
        >
            {copied ? <Check size={11} className="text-emerald-600" /> : <Copy size={11} />}
            {copied ? 'Copied' : label}
        </button>
    );
}

export default function ClayIntegrationPage() {
    const [webhookUrl, setWebhookUrl] = useState('');
    const [webhookSecret, setWebhookSecret] = useState('');
    const [orgId, setOrgId] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            apiClient<ClayWebhookResponse>('/api/settings/clay-webhook-url')
                .then(d => {
                    if (d?.webhookUrl) {
                        setWebhookUrl(d.webhookUrl);
                        setWebhookSecret(d.webhookSecret || '');
                    }
                })
                .catch(() => undefined),
            apiClient<Organization>('/api/organization')
                .then(o => { if (o?.id) setOrgId(o.id); })
                .catch(() => undefined),
        ]).finally(() => setLoading(false));
    }, []);

    return (
        <div className="p-6 max-w-4xl">
            {/* Back nav */}
            <Link
                href="/dashboard/integrations"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-gray-900 mb-4 no-underline"
            >
                <ChevronLeft size={14} />
                All integrations
            </Link>

            {/* Header */}
            <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        <Image src="/clay.png" alt="Clay" width={26} height={26} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 m-0">Clay</h1>
                        <p className="text-xs text-slate-500 m-0 mt-0.5">Ingest enriched leads directly from Clay tables via webhook</p>
                    </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Connected
                </span>
            </div>

            {loading ? (
                <div className="bg-white border border-[#E2E8F0] rounded-xl p-8 text-center text-xs text-slate-400">Loading…</div>
            ) : (
                <div className="flex flex-col gap-4">
                    {/* Webhook URL */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Webhook URL</div>
                            <CopyChip text={webhookUrl} />
                        </div>
                        <div className="font-mono text-xs text-gray-900 break-all bg-slate-50 border border-slate-100 rounded-lg p-3">
                            {webhookUrl || 'Loading…'}
                        </div>
                    </div>

                    {/* Webhook Secret */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Webhook Secret</div>
                                <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">
                                    Sensitive
                                </span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setShowSecret(s => !s)}
                                    className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] font-semibold text-gray-600 hover:bg-slate-100 transition-colors bg-transparent border-none"
                                >
                                    {showSecret ? <EyeOff size={11} /> : <Eye size={11} />}
                                    {showSecret ? 'Hide' : 'Reveal'}
                                </button>
                                <CopyChip text={webhookSecret} />
                            </div>
                        </div>
                        <div className="font-mono text-xs text-gray-900 break-all bg-slate-50 border border-slate-100 rounded-lg p-3">
                            {showSecret ? (webhookSecret || 'Generating…') : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-2 m-0 leading-relaxed">
                            Used by Clay to sign each request with HMAC-SHA256. Store somewhere safe; rotating it invalidates Clay&apos;s side until you update the secret there too.
                        </p>
                    </div>

                    {/* Setup steps */}
                    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
                        <div className="flex items-center gap-2 mb-3">
                            <Shield size={13} className="text-slate-400" />
                            <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 m-0">Configure in Clay</h2>
                        </div>
                        <ol className="text-xs text-gray-700 leading-relaxed m-0 pl-5 flex flex-col gap-1.5">
                            <li>Add an <strong>HTTP API</strong> column to your Clay table</li>
                            <li>Method: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">POST</code></li>
                            <li>URL: paste the webhook URL above</li>
                            <li>Header: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">Content-Type: application/json</code></li>
                            <li>Header: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">X-Organization-ID: {orgId || 'your-org-id'}</code></li>
                            <li>
                                Header: <code className="bg-slate-100 px-1.5 py-0.5 rounded font-mono text-[11px]">X-Clay-Secret: &lt;your secret above&gt;</code>
                                <span className="text-slate-500"> - paste the webhook secret as a header value (same security model as a bearer token).</span>
                            </li>
                            <li>Body: paste the JSON shape from the docs and replace each value with a Clay column reference</li>
                        </ol>
                        <p className="text-[11px] text-slate-500 mt-3 m-0 leading-relaxed">
                            Advanced: if you can compute HMAC-SHA256 of the raw body with the secret in a separate Clay column, you can send <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">X-Clay-Signature: &lt;hex&gt;</code> instead of <code className="bg-slate-100 px-1 py-0.5 rounded font-mono">X-Clay-Secret</code>. Both are accepted; the secret-header path is what the Clay HTTP API column supports out of the box.
                        </p>
                    </div>

                    {/* Docs link */}
                    <a
                        href="/docs/clay-integration"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-between gap-2 px-5 py-3 rounded-xl bg-white border border-[#E2E8F0] hover:border-gray-300 transition-colors no-underline"
                    >
                        <div className="flex items-center gap-2">
                            <BookOpen size={14} className="text-gray-500" />
                            <span className="text-xs font-semibold text-gray-900">Full Clay integration guide</span>
                        </div>
                        <ExternalLink size={12} className="text-gray-400" />
                    </a>
                </div>
            )}
        </div>
    );
}
