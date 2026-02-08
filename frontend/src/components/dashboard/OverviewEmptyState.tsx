import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Settings, Mail, Rocket } from 'lucide-react';

export default function OverviewEmptyState({ stats }: { stats: any }) {
    // If stats.totalLeads is 0, we can assume no campaign activity yet.
    // This component will evolve as we add actual integration status checks.

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 max-w-5xl mx-auto">
            <div className="mb-10 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-[60px] rounded-full"></div>
                <div className="relative bg-white/80 backdrop-blur-xl border border-white/40 p-8 rounded-[2rem] shadow-2xl">
                    <Shield size={64} className="text-blue-600" />
                </div>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-gray-900">
                Welcome to <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Superkabe</span> Control Plane
            </h1>
            <p className="text-gray-500 text-xl mb-16 max-w-2xl leading-relaxed">
                Your infrastructure is currently inactive. Set up your integrations and launch your first campaign to start monitoring and protecting your domains.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left">

                {/* Step 1: Integrations */}
                <Link href="/dashboard/settings" className="premium-card group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Settings size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Settings size={24} className="text-blue-600" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900">1. Connect Integrations</h3>
                        <p className="text-gray-500 mb-6 leading-relaxed">Link your Clay and Smartlead accounts to ingest leads and campaigns automatically.</p>
                        <div className="flex items-center text-blue-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                            Go to Settings <ArrowRight size={16} className="ml-2" />
                        </div>
                    </div>
                </Link>

                {/* Step 2: Mailboxes */}
                <Link href="/dashboard/mailboxes" className="premium-card group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Mail size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-purple-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Mail size={24} className="text-purple-600" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900">2. Review Mailboxes</h3>
                        <p className="text-gray-500 mb-6 leading-relaxed">Verify your imported mailboxes and confirm their health thresholds.</p>
                        <div className="flex items-center text-purple-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                            View Mailboxes <ArrowRight size={16} className="ml-2" />
                        </div>
                    </div>
                </Link>

                {/* Step 3: Launch */}
                <Link href="/dashboard/campaigns" className="premium-card group relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Rocket size={120} />
                    </div>
                    <div className="relative z-10">
                        <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                            <Rocket size={24} className="text-green-600" />
                        </div>
                        <h3 className="font-bold text-xl mb-3 text-gray-900">3. Monitor Campaigns</h3>
                        <p className="text-gray-500 mb-6 leading-relaxed">Watch your campaigns run safely under Superkabe's protection layer.</p>
                        <div className="flex items-center text-green-600 font-bold text-sm group-hover:translate-x-2 transition-transform">
                            View Campaigns <ArrowRight size={16} className="ml-2" />
                        </div>
                    </div>
                </Link>

            </div>
        </div>
    );
}
