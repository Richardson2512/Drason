import Link from 'next/link';
import { ArrowRight, Send, Shield, Link2, Mail, BadgeCheck, Rocket } from 'lucide-react';

export default function OverviewEmptyState({ stats }: { stats: any }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 max-w-5xl mx-auto">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-gray-900/10 blur-[60px] rounded-full"></div>
                <div className="relative bg-white border border-[#D1CBC5] p-6 rounded-2xl flex items-center gap-4">
                    <Send size={36} className="text-gray-900" />
                    <div className="w-px h-10 bg-[#D1CBC5]" />
                    <Shield size={36} className="text-gray-900" />
                </div>
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold mb-4 tracking-tight text-gray-900">
                Welcome to Superkabe
            </h1>
            <p className="text-gray-500 text-base mb-12 max-w-xl leading-relaxed">
                Cold email platform with native deliverability protection. Send campaigns, validate leads, and protect your infrastructure — all in one place.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full text-left mb-10">
                {/* Sequencer Card */}
                <div className="premium-card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                            <Send size={16} className="text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Sequencer</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                        Create campaigns, build email sequences, connect your mailboxes, and start sending. Your emails are validated and routed through the best-performing mailboxes automatically.
                    </p>
                    <div className="flex flex-col gap-2">
                        <Link href="/dashboard/sequencer/accounts" className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F1EA] transition-colors group" style={{ border: '1px solid #D1CBC5' }}>
                            <div className="flex items-center gap-2.5">
                                <Link2 size={14} className="text-gray-500" />
                                <span className="text-xs font-semibold text-gray-900">Connect mailboxes</span>
                            </div>
                            <ArrowRight size={12} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/dashboard/sequencer/campaigns" className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F1EA] transition-colors group" style={{ border: '1px solid #D1CBC5' }}>
                            <div className="flex items-center gap-2.5">
                                <Rocket size={14} className="text-gray-500" />
                                <span className="text-xs font-semibold text-gray-900">Create your first campaign</span>
                            </div>
                            <ArrowRight size={12} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>

                {/* Protection Card */}
                <div className="premium-card">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-9 h-9 bg-gray-900 rounded-lg flex items-center justify-center">
                            <Shield size={16} className="text-white" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">Protection</h2>
                    </div>
                    <p className="text-sm text-gray-500 mb-5 leading-relaxed">
                        Monitor your domains, mailboxes, and campaigns in real time. Auto-pause when bounce rates spike. Heal damaged infrastructure through the 5-phase recovery pipeline.
                    </p>
                    <div className="flex flex-col gap-2">
                        <Link href="/dashboard/settings" className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F1EA] transition-colors group" style={{ border: '1px solid #D1CBC5' }}>
                            <div className="flex items-center gap-2.5">
                                <Link2 size={14} className="text-gray-500" />
                                <span className="text-xs font-semibold text-gray-900">Connect sending platforms</span>
                            </div>
                            <ArrowRight size={12} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                        <Link href="/dashboard/mailboxes" className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F5F1EA] transition-colors group" style={{ border: '1px solid #D1CBC5' }}>
                            <div className="flex items-center gap-2.5">
                                <Mail size={14} className="text-gray-500" />
                                <span className="text-xs font-semibold text-gray-900">Review mailbox health</span>
                            </div>
                            <ArrowRight size={12} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Email Validation CTA */}
            <Link href="/dashboard/validation" className="w-full max-w-md">
                <div className="flex items-center justify-between p-4 rounded-lg hover:bg-[#F5F1EA] transition-colors group" style={{ border: '1px solid #D1CBC5' }}>
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            <BadgeCheck size={14} className="text-gray-700" />
                        </div>
                        <div>
                            <div className="text-xs font-semibold text-gray-900">Email Validation</div>
                            <div className="text-[10px] text-gray-400">Upload a CSV and validate emails — no campaign needed</div>
                        </div>
                    </div>
                    <ArrowRight size={12} className="text-gray-400 group-hover:translate-x-1 transition-transform" />
                </div>
            </Link>
        </div>
    );
}
