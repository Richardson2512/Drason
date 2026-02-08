import Link from 'next/link';
import { ArrowRight, CheckCircle2, Shield, Settings, Mail, Rocket } from 'lucide-react';

export default function OverviewEmptyState({ stats }: { stats: any }) {
    // If stats.totalLeads is 0, we can assume no campaign activity yet.
    // This component will evolve as we add actual integration status checks.

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8 max-w-4xl mx-auto">
            <div className="mb-8 relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-3xl rounded-full animate-pulse"></div>
                <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 p-6 rounded-2xl shadow-2xl">
                    <Shield size={48} className="text-blue-500" />
                </div>
            </div>

            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                Welcome to Drason Control Plane
            </h1>
            <p className="text-gray-400 text-lg mb-12 max-w-2xl">
                Your infrastructure is currently inactive. Set up your integrations and launch your first campaign to start monitoring and protecting your domains.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">

                {/* Step 1: Integrations */}
                <Link href="/settings" className="group block bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800 hover:border-blue-500/30 rounded-xl p-6 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                            <Settings size={24} className="text-blue-400" />
                        </div>
                        {/* Placeholder for status check */}
                        {/* <CheckCircle2 size={20} className="text-green-500" /> */}
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-200">1. Connect Integrations</h3>
                    <p className="text-sm text-gray-500 mb-4">Link your Clay and Smartlead accounts to ingest leads and campaigns.</p>
                    <div className="flex items-center text-blue-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        Go to Settings <ArrowRight size={14} className="ml-1" />
                    </div>
                </Link>

                {/* Step 2: Mailboxes */}
                <Link href="/mailboxes" className="group block bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800 hover:border-purple-500/30 rounded-xl p-6 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                            <Mail size={24} className="text-purple-400" />
                        </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-200">2. Review Mailboxes</h3>
                    <p className="text-sm text-gray-500 mb-4">Verify your imported mailboxes and set up initial health thresholds.</p>
                    <div className="flex items-center text-purple-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        View Mailboxes <ArrowRight size={14} className="ml-1" />
                    </div>
                </Link>

                {/* Step 3: Launch */}
                <Link href="/campaigns" className="group block bg-gray-900/50 hover:bg-gray-800/80 border border-gray-800 hover:border-green-500/30 rounded-xl p-6 transition-all duration-300">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                            <Rocket size={24} className="text-green-400" />
                        </div>
                    </div>
                    <h3 className="font-semibold text-lg mb-2 text-gray-200">3. Monitor Campaigns</h3>
                    <p className="text-sm text-gray-500 mb-4">Watch your campaigns run safely under Drason's protection layer.</p>
                    <div className="flex items-center text-green-400 text-sm font-medium group-hover:translate-x-1 transition-transform">
                        View Campaigns <ArrowRight size={14} className="ml-1" />
                    </div>
                </Link>

            </div>
        </div>
    );
}
