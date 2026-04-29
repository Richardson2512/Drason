import Link from 'next/link';
import type { Metadata } from 'next';
import { Shield, Activity, GitBranch, TrendingUp, Settings, Zap, Plug, Database, BookOpen, AlertTriangle, Heart, BarChart3, Mail, HelpCircle } from 'lucide-react';

export const metadata: Metadata = {
 title: 'Documentation | Superkabe',
 description: 'Technical documentation for Superkabe — the AI cold email platform with native deliverability protection. Guides for AI sequences, multi-mailbox sending, email validation, protection settings, and integrations.',
 alternates: {
 canonical: '/docs',
 },
 openGraph: {
 title: 'Documentation | Superkabe',
 description: 'Technical documentation for the AI cold email platform with native deliverability protection.',
 url: '/docs',
 siteName: 'Superkabe',
 type: 'website',
 },
};

export default function DocsPage() {
 return (
 <div>
 <h1 className="text-5xl md:text-6xl font-bold mb-6 text-gray-900 tracking-tight">
 Superkabe Documentation
 </h1>
 <p className="text-xl text-gray-500 mb-12 leading-relaxed max-w-2xl">
 Technical guides for the AI cold email platform with native deliverability protection.
 </p>

 {/* Overview Card */}
 <div className="bg-white p-8 border border-gray-100 shadow-xl shadow-gray-200/50 mb-16">
 <h2 className="text-2xl font-bold mb-4 text-gray-900">What is Superkabe?</h2>
 <p className="text-gray-600 mb-4">
 Superkabe is an AI-powered cold email platform with native deliverability protection. Draft AI sequences, send across unlimited mailboxes (Gmail, Microsoft 365, or SMTP), validate every email, route leads by ESP — and let the protection layer auto-pause, reroute, and heal senders in real time. Connect Clay as a lead source for enriched lead intake.
 </p>
 <p className="text-gray-600 mb-6">
 Two halves working together: the <strong className="text-gray-900">Sequencer</strong> drafts AI sequences and dispatches mail across your connected mailboxes; the <strong className="text-gray-900">Protection layer</strong> watches every send in real time and auto-heals damaged senders before they burn. Every lead and every send passes through this pipeline:
 </p>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
 <div className="bg-blue-50 border border-blue-100 p-4">
 <div className="font-bold text-gray-900 text-sm mb-1">Email Validation</div>
 <p className="text-gray-600 text-sm">Syntax, MX records, disposable domains, catch-all detection + MillionVerifier API for risky leads. Invalid emails are blocked before they reach your sender.</p>
 </div>
 <div className="bg-green-50 border border-green-100 p-4">
 <div className="font-bold text-gray-900 text-sm mb-1">Health Gate (GREEN / YELLOW / RED)</div>
 <p className="text-gray-600 text-sm">Every lead is classified by risk. GREEN routes normally, YELLOW distributes with per-mailbox caps, RED is blocked entirely.</p>
 </div>
 <div className="bg-purple-50 border border-purple-100 p-4">
 <div className="font-bold text-gray-900 text-sm mb-1">Risk-Aware Routing</div>
 <p className="text-gray-600 text-sm">Rule-based routing by persona and minimum score. Priority ordering with wildcard catch-all rules. Leads pushed to the right campaign on the right platform.</p>
 </div>
 <div className="bg-indigo-50 border border-indigo-100 p-4">
 <div className="font-bold text-gray-900 text-sm mb-1">AI Sequencing &amp; Sending</div>
 <p className="text-gray-600 text-sm">Multi-step AI sequences with variant testing dispatch from Gmail, Microsoft 365, and SMTP mailboxes. ESP-aware routing assigns each lead to the mailbox most likely to land in their inbox. Per-campaign send caps, sticky pinning, and rotation handled automatically.</p>
 </div>
 <div className="bg-amber-50 border border-amber-100 p-4">
 <div className="font-bold text-gray-900 text-sm mb-1">Real-Time Monitoring</div>
 <p className="text-gray-600 text-sm">Checks mailbox health every 60 seconds. Bounce rates, SMTP/IMAP connectivity, DNS authentication (SPF, DKIM, DMARC).</p>
 </div>
 <div className="bg-red-50 border border-red-100 p-4">
 <div className="font-bold text-gray-900 text-sm mb-1">Auto-Pause + Correlation</div>
 <p className="text-gray-600 text-sm">Auto-pauses on threshold breach. Correlation engine determines if the root cause is the mailbox, domain, or campaign before acting.</p>
 </div>
 <div className="bg-teal-50 border border-teal-100 p-4">
 <div className="font-bold text-gray-900 text-sm mb-1">5-Phase Healing Pipeline</div>
 <p className="text-gray-600 text-sm">Pause → Quarantine (DNS check) → Restricted Send → Warm Recovery → Healthy. Fully automated with per-phase graduation criteria.</p>
 </div>
 </div>
 <p className="text-gray-600 text-sm">
 Mailbox rotation, ESP-aware load balancing, Slack alerts, reports, and CSV export are included across all plans.
 </p>
 </div>

 {/* Getting Started */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Getting Started</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
 <DocCard href="/docs/getting-started" icon={<Zap className="text-blue-600" size={24} />} title="Quick Start Guide" description="Set up your account, connect platforms, and start protecting infrastructure" />
 <DocCard href="/docs/configuration" icon={<Settings className="text-blue-600" size={24} />} title="Configuration" description="Threshold tuning, system modes, and integration setup" />
 <DocCard href="/docs/infrastructure-assessment" icon={<BarChart3 className="text-blue-600" size={24} />} title="Infrastructure Assessment" description="Automated health check on onboarding — DNS, bounce rate, connection validation" />
 <DocCard href="/docs/deployment" icon={<Settings className="text-purple-600" size={24} />} title="Deployment Checklist" description="Production deployment steps and verification procedures" />
 </div>

 {/* Core Systems */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Core Systems</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
 <DocCard href="/docs/monitoring" icon={<Activity className="text-blue-600" size={24} />} title="Monitoring System" description="60-second health checks, tiered thresholds, sliding windows, and auto-pause logic" />
 <DocCard href="/docs/execution-gate" icon={<GitBranch className="text-blue-600" size={24} />} title="Execution Gate" description="GREEN/YELLOW/RED lead classification and pre-send validation" />
 <DocCard href="/docs/risk-scoring" icon={<TrendingUp className="text-blue-600" size={24} />} title="Risk Scoring" description="Bounce rate, engagement, and infrastructure signals combined into risk scores" />
 <DocCard href="/docs/state-machine" icon={<GitBranch className="text-blue-600" size={24} />} title="State Machine" description="Entity lifecycle states and valid transitions for mailboxes, domains, and leads" />
 <DocCard href="/docs/warmup-recovery" icon={<Heart className="text-green-600" size={24} />} title="Warmup & Recovery" description="5-phase healing pipeline and automated mailbox rehabilitation" />
 <DocCard href="/docs/platform-rules" icon={<Shield className="text-blue-600" size={24} />} title="Platform Rules" description="System modes (observe/suggest/enforce), thresholds, and enforcement mechanisms" />
 <DocCard href="/docs/technical-architecture" icon={<Database className="text-blue-600" size={24} />} title="Technical Architecture" description="System design, data flow, and infrastructure overview" />
 </div>

 {/* Integrations */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Integrations</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-12">
 <DocCard href="/docs/clay-integration" icon={<Database className="text-orange-600" size={24} />} title="Clay Integration" description="Webhook ingestion for enriched leads with automatic validation and routing" />
 <DocCard href="/docs/slack-integration" icon={<AlertTriangle className="text-yellow-600" size={24} />} title="Slack Integration" description="Real-time deliverability alerts delivered to your Slack workspace" />
 <DocCard href="/docs/api-integration" icon={<Plug className="text-blue-600" size={24} />} title="API & Webhooks" description="REST API reference for programmatic lead ingestion and webhook configuration" />
 </div>

 {/* Help Center */}
 <h2 className="text-3xl font-bold mb-6 text-gray-900">Help Center</h2>
 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-16">
 <DocCard href="/docs/help/email-validation" icon={<HelpCircle className="text-green-600" size={20} />} title="Email Validation" description="How the hybrid validation layer works — internal checks + MillionVerifier API" />
 <DocCard href="/docs/help/auto-healing" icon={<HelpCircle className="text-green-600" size={20} />} title="Auto-Healing Pipeline" description="5-phase recovery: pause → quarantine → restricted → warm → healthy" />
 <DocCard href="/docs/help/quarantine" icon={<HelpCircle className="text-amber-600" size={20} />} title="Why Is My Mailbox In Quarantine?" description="DNS health check phase — what keeps you stuck and how to fix it" />
 <DocCard href="/docs/help/mailbox-rotation" icon={<HelpCircle className="text-blue-600" size={20} />} title="Mailbox Rotation" description="Automatic standby mailbox swapping when a sender is paused" />
 <DocCard href="/docs/help/entity-statuses" icon={<HelpCircle className="text-blue-600" size={20} />} title="Status Labels Explained" description="Every status across mailboxes, domains, campaigns, and leads" />
 <DocCard href="/docs/help/bounce-classification" icon={<HelpCircle className="text-red-600" size={20} />} title="Bounce Classification" description="Hard, soft, and transient bounces — what each means for your reputation" />
 <DocCard href="/docs/help/load-balancing" icon={<HelpCircle className="text-blue-600" size={20} />} title="Load Balancing" description="Effective load calculation and mailbox distribution" />
 <DocCard href="/docs/help/optimization-suggestions" icon={<HelpCircle className="text-blue-600" size={20} />} title="Optimization Suggestions" description="What/Why/How recommendations for rebalancing infrastructure" />
 <DocCard href="/docs/help/campaign-paused" icon={<HelpCircle className="text-red-600" size={20} />} title="Why Is My Campaign Paused?" description="Auto-pause when all mailboxes are unhealthy — how to resume" />
 <DocCard href="/docs/help/connection-errors" icon={<HelpCircle className="text-red-600" size={20} />} title="Connection Errors" description="Troubleshoot SMTP/IMAP failures, OAuth expiry, and disconnects" />
 <DocCard href="/docs/help/infrastructure-score-explained" icon={<HelpCircle className="text-blue-600" size={20} />} title="Infrastructure Score" description="How the composite health score is calculated from DNS, bounces, and engagement" />
 <DocCard href="/docs/help/24-7-monitoring" icon={<HelpCircle className="text-green-600" size={20} />} title="24/7 Monitoring" description="Automated background syncing and continuous health checks" />
 <DocCard href="/docs/help/notifications" icon={<HelpCircle className="text-blue-600" size={20} />} title="Notifications" description="Alert types, severity levels, and configuration" />
 <DocCard href="/docs/help/audit-logs" icon={<HelpCircle className="text-gray-600" size={20} />} title="Audit Logs" description="Full action history — pauses, resumes, rotations, and automated decisions" />
 <DocCard href="/docs/help/analytics" icon={<HelpCircle className="text-blue-600" size={20} />} title="Analytics" description="Open rate, click rate, reply rate, bounce rate trends" />
 <DocCard href="/docs/help/billing" icon={<HelpCircle className="text-gray-600" size={20} />} title="Billing" description="Manage your plan, billing, and subscription" />
 <DocCard href="/docs/help/account-management" icon={<HelpCircle className="text-gray-600" size={20} />} title="Account Management" description="Account settings, team, and organization" />
 </div>

 {/* Core Principles - Gradient Card (Matching Landing) */}
 <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-10 shadow-2xl relative overflow-hidden">
 <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
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
 className="block p-8 bg-white border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group"
 >
 <div className="w-12 h-12 bg-blue-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
 {icon}
 </div>
 <h3 className="text-xl font-bold mb-3 text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
 <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
 </Link>
 );
}
