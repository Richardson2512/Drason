import Link from 'next/link';
import { ArrowRight, Shield, Activity, GitBranch, TrendingUp, Settings, Zap, Plug, Database } from 'lucide-react';

export default function DocsPage() {
    return (
        <div>
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
                Drason Documentation
            </h1>
            <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl">
                Production-hardened monitoring and protection for modern outbound infrastructure.
            </p>

            {/* Overview Card */}
            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 mb-16">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">What is Drason?</h2>
                <p className="text-gray-600 mb-6">
                    Drason is a control layer for multi-domain, multi-mailbox outbound email infrastructure.
                    We don't optimize volume— we prevent irreversible damage.
                </p>
                <p className="text-gray-600 mb-4">
                    Modern outbound teams run:
                </p>
                <ul className="mb-6 list-disc pl-5 space-y-2 text-gray-600">
                    <li>3–10 domains</li>
                    <li>3+ mailboxes per domain</li>
                    <li>20–30 emails per mailbox per day</li>
                    <li>Structured ICP-based campaign routing</li>
                </ul>
                <p className="text-gray-600">
                    Drason monitors bounce rates, failure patterns, and domain health to protect your infrastructure
                    before reputation damage becomes irreversible.
                </p>
            </div>

            {/* Quick Start Grid */}
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Documentation Topics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
                <DocCard
                    href="/docs/getting-started"
                    icon={<Zap className="text-blue-600" size={24} />}
                    title="Getting Started"
                    description="Set up your first campaign and integrate with Clay & Smartlead"
                />
                <DocCard
                    href="/docs/platform-rules"
                    icon={<Shield className="text-blue-600" size={24} />}
                    title="Platform Rules"
                    description="System modes, thresholds, and enforcement mechanisms"
                />
                <DocCard
                    href="/docs/help/24-7-monitoring"
                    icon={<Zap className="text-green-600" size={24} />}
                    title="24/7 Monitoring"
                    description="Automated background syncing and real-time protection running 24/7"
                />
                <DocCard
                    href="/docs/monitoring"
                    icon={<Activity className="text-blue-600" size={24} />}
                    title="Monitoring System"
                    description="Tiered thresholds, sliding windows, and ratio-based domain protection"
                />
                <DocCard
                    href="/docs/execution-gate"
                    icon={<GitBranch className="text-blue-600" size={24} />}
                    title="Execution Gate"
                    description="Gate checks, failure classification, and retry logic"
                />
                <DocCard
                    href="/docs/risk-scoring"
                    icon={<TrendingUp className="text-blue-600" size={24} />}
                    title="Risk Scoring"
                    description="Hard vs soft signals and risk component separation"
                />
                <DocCard
                    href="/docs/state-machine"
                    icon={<GitBranch className="text-blue-600" size={24} />}
                    title="State Machine"
                    description="Mailbox states, domain states, and valid transitions"
                />
                <DocCard
                    href="/docs/configuration"
                    icon={<Settings className="text-blue-600" size={24} />}
                    title="Configuration"
                    description="Threshold tuning and integration setup"
                />
                <DocCard
                    href="/docs/api-integration"
                    icon={<Plug className="text-blue-600" size={24} />}
                    title="API Integration"
                    description="Webhooks, endpoints, and direct ingestion APIs"
                />
                <DocCard
                    href="/docs/clay-integration"
                    icon={<Database className="text-blue-600" size={24} />}
                    title="Clay Integration"
                    description="Connect Clay tables with Drason for lead routing"
                />
                <DocCard
                    href="/docs/smartlead-integration"
                    icon={<Activity className="text-blue-600" size={24} />}
                    title="Smartlead Integration"
                    description="Monitor campaigns and sync mailboxes from Smartlead"
                />
                <DocCard
                    href="/docs/warmup-recovery"
                    icon={<Activity className="text-green-600" size={24} />}
                    title="Warmup Recovery System"
                    description="Automated mailbox healing through graduated recovery phases"
                />
                <DocCard
                    href="/docs/deployment"
                    icon={<Settings className="text-purple-600" size={24} />}
                    title="Deployment Checklist"
                    description="Production deployment steps and verification procedures"
                />
            </div>

            {/* Core Principles - Gradient Card (Matching Landing) */}
            <div className="rounded-3xl bg-gradient-to-br from-blue-600 to-purple-700 text-white p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                <div className="relative z-10">
                    <h2 className="text-3xl font-bold mb-8">Core Principles</h2>
                    <div className="grid md:grid-cols-2 gap-8">
                        <div>
                            <h3 className="font-bold text-xl mb-2 text-blue-200">1. Protection Over Volume</h3>
                            <p className="text-blue-100">We prioritize infrastructure safety over send volume. A burned domain costs more than missed opportunities.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl mb-2 text-blue-200">2. Tiered Escalation</h3>
                            <p className="text-blue-100">Early warnings (3 bounces) before hard stops (5 bounces) give operators time to react.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl mb-2 text-blue-200">3. Ratio-Based Scaling</h3>
                            <p className="text-blue-100">Domain health uses percentages (30% warning, 50% pause) to scale with infrastructure size.</p>
                        </div>
                        <div>
                            <h3 className="font-bold text-xl mb-2 text-blue-200">4. Signal Separation</h3>
                            <p className="text-blue-100">Hard signals (bounces) trigger blocks. Soft signals (velocity) only log. Clean mailboxes stay active.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function DocCard({ href, icon, title, description }: { href: string; icon: React.ReactNode; title: string; description: string }) {
    return (
        <Link
            href={href}
            className="block p-8 bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group"
        >
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
        </Link>
    );
}
