'use client';
import Image from 'next/image';
import CopyButton from '@/components/CopyButton';

export default function ClayIntegrationCard({
    webhookUrl,
    webhookSecret,
    orgId,
}: {
    webhookUrl: string;
    webhookSecret: string;
    orgId?: string;
}) {
    return (
        <div className="premium-card">
            <div className="mb-6 flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-[10px] flex items-center justify-center shadow-sm border border-slate-100">
                    <Image src="/clay.png" alt="Clay" width={24} height={24} />
                </div>
                <div className="flex-1">
                    <h2 className="text-xl font-bold text-slate-800">Clay Integration</h2>
                    <p className="text-sm text-slate-500">Ingest leads directly from tables.</p>
                </div>
                <a
                    href="/docs/clay-integration"
                    target="_blank"
                    title="View integration guide"
                    className="help-link-hover w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 no-underline border border-slate-200"
                >
                    <span className="text-base">❓</span>
                </a>
            </div>

            {/* Security Warning */}
            <div className="px-5 py-4 bg-amber-100 rounded-xl border border-yellow-300 mb-4">
                <div className="flex items-start gap-3">
                    <span className="text-xl">🔐</span>
                    <div>
                        <p className="text-sm text-amber-800 m-0 font-semibold mb-1">
                            Webhook Security Required
                        </p>
                        <p className="text-[0.8rem] text-amber-900 m-0 leading-snug">
                            Clay must send HMAC signature to prevent unauthorized access. Configure below.
                        </p>
                    </div>
                </div>
            </div>

            <div className="p-6 bg-sky-50 rounded-2xl border border-sky-200 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-sky-700 uppercase">Webhook URL</h3>
                    {webhookUrl && <CopyButton text={webhookUrl} label="Copy" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors bg-transparent border-0 p-0" />}
                </div>
                <div className="bg-white p-4 rounded-lg border border-sky-200 break-all font-mono text-[0.8rem] text-sky-600">
                    {webhookUrl || 'Loading...'}
                </div>
                {!webhookUrl && (
                    <p className="text-[0.7rem] text-sky-700 mt-2 m-0 italic">
                        💡 Refresh the page if this doesn&apos;t load
                    </p>
                )}
            </div>

            <div className="p-6 bg-red-50 rounded-2xl border border-red-200 mb-4">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-sm font-bold text-red-800 uppercase">Webhook Secret</h3>
                    {webhookSecret && <CopyButton text={webhookSecret} label="Copy Secret" className="text-xs text-red-600 font-semibold hover:text-red-800 transition-colors bg-transparent border-0 p-0" />}
                </div>
                <div className="bg-white p-4 rounded-lg border border-red-200 break-all font-mono text-xs text-red-600">
                    {webhookSecret || 'Generating...'}
                </div>
                {webhookSecret ? (
                    <p className="text-xs text-red-800 mt-3 m-0 leading-snug">
                        ⚠️ Keep this secret safe! Use it to generate HMAC-SHA256 signatures.
                    </p>
                ) : (
                    <p className="text-[0.7rem] text-red-800 mt-2 m-0 italic">
                        💡 Secret auto-generated on first load. Refresh if this doesn&apos;t appear.
                    </p>
                )}
            </div>

            <div className="px-5 py-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-sm text-sky-900 leading-relaxed mb-3">
                    <strong>Configure in Clay:</strong>
                </p>
                <ul className="text-[0.8rem] text-slate-600 leading-relaxed m-0 pl-5">
                    <li>Use <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">HTTP API</code> column</li>
                    <li>Method: <strong>POST</strong></li>
                    <li>Add header: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">X-Organization-ID: {orgId}</code></li>
                    <li>Add header: <code className="bg-slate-200 px-1.5 py-0.5 rounded font-mono">X-Clay-Signature: {"<HMAC-SHA256>"}</code></li>
                    <li>Generate signature using webhook secret above</li>
                </ul>
            </div>
        </div>
    );
}
