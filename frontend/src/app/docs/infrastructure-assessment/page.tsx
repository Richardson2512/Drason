import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Infrastructure Assessment | Superkabe Docs',
    description: 'Automated health checks for your sending infrastructure. Detect DNS issues, blacklist listings, and damaged mailboxes.',
    alternates: { canonical: '/docs/infrastructure-assessment' },
    openGraph: {
        title: 'Infrastructure Assessment | Superkabe Docs',
        description: 'Automated health checks for your sending infrastructure. Detect DNS issues, blacklist listings, and damaged mailboxes.',
        url: '/docs/infrastructure-assessment',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function InfrastructureAssessmentPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Infrastructure Assessment
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Automated health checks for your entire sending infrastructure. Detect DNS issues, blacklist listings, and damaged mailboxes before you send a single email.
            </p>

            {/* Overview */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">What is an Infrastructure Assessment?</h2>
                <p className="text-gray-600 mb-4">
                    Think of it as a "Pre-Flight Check" for your cold email setup. The assessment scans your domains and mailboxes against 4 key categories:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                        <span className="text-2xl mb-2 block">📡</span>
                        <h3 className="font-bold text-gray-900">DNS Configuration</h3>
                        <p className="text-sm text-gray-500">SPF, DKIM, and DMARC record validity.</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                        <span className="text-2xl mb-2 block">🚫</span>
                        <h3 className="font-bold text-gray-900">Blacklist Status</h3>
                        <p className="text-sm text-gray-500">Checks major blocklists like Spamhaus.</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                        <span className="text-2xl mb-2 block">📧</span>
                        <h3 className="font-bold text-gray-900">Mailbox Health</h3>
                        <p className="text-sm text-gray-500">Historical bounce rates and send patterns.</p>
                    </div>
                    <div className="bg-white rounded-xl p-4 border border-blue-100">
                        <span className="text-2xl mb-2 block">⚙️</span>
                        <h3 className="font-bold text-gray-900">Configuration</h3>
                        <p className="text-sm text-gray-500">Provider selection and warm-up status.</p>
                    </div>
                </div>
            </div>

            {/* Scoring System */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">The Scoring System (0-100)</h2>
            <p className="text-gray-600 mb-6">
                Your infrastructure receives an overall health score. This score determines your readiness to launch campaigns.
            </p>

            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-8 shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Score Range</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Status</th>
                            <th className="px-6 py-3 text-gray-600 font-semibold">Implication</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        <tr>
                            <td className="px-6 py-4 font-mono font-bold text-green-600">90 - 100</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-green-100 text-green-700 rounded text-sm font-bold">EXCELLENT</span></td>
                            <td className="px-6 py-4 text-gray-600">Ready for high-volume sending.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono font-bold text-blue-600">70 - 89</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm font-bold">GOOD</span></td>
                            <td className="px-6 py-4 text-gray-600">Safe to send, but monitor closely.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono font-bold text-amber-600">50 - 69</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-sm font-bold">FAIR</span></td>
                            <td className="px-6 py-4 text-gray-600">Multiple issues found. Fix before scaling.</td>
                        </tr>
                        <tr>
                            <td className="px-6 py-4 font-mono font-bold text-red-600">0 - 49</td>
                            <td className="px-6 py-4"><span className="px-2 py-1 bg-red-100 text-red-700 rounded text-sm font-bold">CRITICAL</span></td>
                            <td className="px-6 py-4 text-gray-600">Do not send. High risk of immediate bans.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Assessment Types */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Assessment Types</h2>

            <div className="space-y-6">
                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">1. Onboarding Assessment</h3>
                    <p className="text-gray-600 mb-2">
                        Automatically runs when you first connect your organization or import new domains.
                    </p>
                    <ul className="list-disc pl-5 text-gray-500 text-sm space-y-1">
                        <li>Establishes baseline health</li>
                        <li>Identifies pre-existing damage from previous providers</li>
                        <li>Configures initial warm-up schedules</li>
                    </ul>
                </div>

                <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">2. Manual Re-Assessment</h3>
                    <p className="text-gray-600 mb-2">
                        Can be triggered at any time from the <a href="/dashboard/infrastructure" className="text-blue-600 hover:underline">Infrastructure Dashboard</a>.
                    </p>
                    <ul className="list-disc pl-5 text-gray-500 text-sm space-y-1">
                        <li>Use after fixing DNS records</li>
                        <li>Verify delisting from blacklists</li>
                        <li>Check health before launching major campaigns</li>
                    </ul>
                </div>
            </div>

            {/* Common Findings */}
            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">Common Findings & Fixes</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <div className="space-y-4">
                    <div className="pb-4 border-b border-gray-200">
                        <h4 className="font-bold text-red-600 mb-1">❌ Missing DMARC Record</h4>
                        <p className="text-sm text-gray-600 mb-2">DMARC is now mandatory for Gmail/Yahoo delivery.</p>
                        <p className="text-xs font-mono bg-white p-2 rounded border border-gray-300">v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com</p>
                    </div>
                    <div className="pb-4 border-b border-gray-200">
                        <h4 className="font-bold text-amber-600 mb-1">⚠️ SPF PermError (Too Many Lookups)</h4>
                        <p className="text-sm text-gray-600">Usually caused by including too many services (Google, Outlook, SendGrid, Zoom, etc.) in your SPF record. Limit is 10 lookups.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-red-600 mb-1">❌ Listed on Spamhaus</h4>
                        <p className="text-sm text-gray-600">Critical issue. Pause all sending immediately and request delisting via the Spamhaus Check tool.</p>
                    </div>
                </div>
            </div>

            {/* Next Steps */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mt-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Ready to Audit?</h2>
                <p className="text-gray-600 mb-4">
                    Head over to the Infrastructure Dashboard to run your first report.
                </p>
                <div className="flex gap-4">
                    <a href="/dashboard/infrastructure" className="px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors">
                        Go to Dashboard
                    </a>
                    <a href="/docs/monitoring" className="px-6 py-2 bg-white text-green-700 font-bold rounded-lg border border-green-200 hover:bg-green-50 transition-colors">
                        Read Monitoring Guide
                    </a>
                </div>
            </div>
        </div>
    );
}
