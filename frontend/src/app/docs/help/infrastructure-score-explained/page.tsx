export default function InfrastructureScoreExplainedPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Understanding Infrastructure Score
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Why your infrastructure score and entity status might be different - explained in plain English
            </p>

            {/* The Confusion */}
            <div className="bg-amber-50 border-l-4 border-amber-500 p-6 mb-8 rounded-r-lg">
                <h2 className="text-2xl font-bold mb-3 text-amber-900">Common Confusion</h2>
                <p className="text-amber-800 mb-2">
                    "My infrastructure score is 25/100 but my domains and mailboxes show as 'healthy'. What's going on?"
                </p>
                <p className="text-amber-700 text-sm">
                    This is actually completely normal! They're measuring two different things.
                </p>
            </div>

            {/* Two Different Systems */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Two Different Health Systems</h2>
            <p className="text-gray-600 mb-6">
                Think of it like a car inspection:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
                    <div className="text-4xl mb-3">📋</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Infrastructure Score (0-100)</h3>
                    <p className="text-gray-600 mb-4">
                        Like checking if your car has valid registration, insurance, and passes emissions tests.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>What:</strong> DNS setup (SPF, DKIM, DMARC) + Blacklist status</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>When:</strong> One-time snapshot at sync time</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-blue-600 font-bold">•</span>
                            <span><strong>Purpose:</strong> Foundation health check</span>
                        </li>
                    </ul>
                </div>

                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6">
                    <div className="text-4xl mb-3">🚦</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3">Entity Status (Operational)</h3>
                    <p className="text-gray-600 mb-4">
                        Like checking if your car actually starts and drives without breaking down.
                    </p>
                    <ul className="space-y-2 text-sm text-gray-600">
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">•</span>
                            <span><strong>What:</strong> Real-time bounce rates and sending performance</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">•</span>
                            <span><strong>When:</strong> Continuously updated during sending</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-green-600 font-bold">•</span>
                            <span><strong>Purpose:</strong> Operational health check</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Real World Example */}
            <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-12 shadow-sm">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Real-World Example</h2>
                <p className="text-gray-600 mb-6">
                    Your situation is like owning a car that:
                </p>
                <div className="space-y-4">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                            ✅
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">Drives Perfectly (Entity Status: Healthy)</h3>
                            <p className="text-gray-600 text-sm">
                                Your emails are being delivered successfully. Bounce rate is low (&lt;5%). Everything works.
                            </p>
                        </div>
                    </div>
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-2xl">
                            ⚠️
                        </div>
                        <div className="flex-1">
                            <h3 className="font-bold text-gray-900 mb-1">Missing Paperwork (Infrastructure Score: 25/100)</h3>
                            <p className="text-gray-600 text-sm">
                                Your DNS authentication (DKIM/DMARC) is missing. Like driving without proper registration - it works, but you're at risk.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* What Affects Each Score */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">What Affects Each Score?</h2>

            <div className="space-y-6 mb-12">
                <div>
                    <h3 className="text-xl font-bold text-blue-600 mb-3">Infrastructure Score (0-100)</h3>
                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100">
                        <table className="w-full text-sm">
                            <thead className="border-b border-blue-200">
                                <tr>
                                    <th className="text-left py-2 text-gray-700">Issue</th>
                                    <th className="text-left py-2 text-gray-700">Points Lost</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-blue-100">
                                <tr>
                                    <td className="py-2 text-gray-600">Missing SPF record</td>
                                    <td className="py-2 text-gray-900 font-bold">-25 points</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-gray-600">Missing DKIM record</td>
                                    <td className="py-2 text-gray-900 font-bold">-20 points</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-gray-600">Missing DMARC record</td>
                                    <td className="py-2 text-gray-900 font-bold">-15 points</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-gray-600">Confirmed blacklisted</td>
                                    <td className="py-2 text-gray-900 font-bold">-30 points each</td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-gray-600">Blacklist check unreachable</td>
                                    <td className="py-2 text-gray-900 font-bold">-10 points each</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div>
                    <h3 className="text-xl font-bold text-green-600 mb-3">Entity Status (Operational Health)</h3>
                    <div className="bg-green-50 rounded-xl p-6 border border-green-100">
                        <table className="w-full text-sm">
                            <thead className="border-b border-green-200">
                                <tr>
                                    <th className="text-left py-2 text-gray-700">Bounce Rate</th>
                                    <th className="text-left py-2 text-gray-700">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-100">
                                <tr>
                                    <td className="py-2 text-gray-600">Less than 5%</td>
                                    <td className="py-2"><span className="px-3 py-1 bg-green-200 text-green-800 rounded-full font-bold text-xs">HEALTHY</span></td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-gray-600">5% - 10%</td>
                                    <td className="py-2"><span className="px-3 py-1 bg-amber-200 text-amber-800 rounded-full font-bold text-xs">WARNING</span></td>
                                </tr>
                                <tr>
                                    <td className="py-2 text-gray-600">Over 10%</td>
                                    <td className="py-2"><span className="px-3 py-1 bg-red-200 text-red-800 rounded-full font-bold text-xs">PAUSED</span></td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Does Low Score Block Campaigns? */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">Will Low Infrastructure Score Block My Campaigns?</h2>
                <div className="text-lg text-gray-700 mb-4">
                    <strong>Short answer: NO</strong> (once you're past initial setup)
                </div>
                <p className="text-gray-600 mb-4">
                    The infrastructure score only affects:
                </p>
                <ul className="space-y-2 text-gray-600 mb-4">
                    <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">1.</span>
                        <span><strong>Initial onboarding gate</strong> - First time connecting to Smartlead</span>
                    </li>
                    <li className="flex items-start gap-2">
                        <span className="text-purple-600 font-bold">2.</span>
                        <span><strong>Manual re-assessment</strong> - If you trigger it again</span>
                    </li>
                </ul>
                <p className="text-gray-600">
                    Campaign resumption is controlled by <strong>entity status</strong> (bounce rates), not infrastructure score.
                    Your campaigns will heal and resume automatically when bounce rates improve.
                </p>
            </div>

            {/* How to Fix */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">How to Improve Your Score</h2>
            <div className="space-y-4 mb-12">
                <div className="bg-white border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">1. Add DKIM Record (+20 points)</h3>
                    <p className="text-gray-600 text-sm mb-3">
                        Get your DKIM key from your email provider (Google Workspace, Outlook, etc.) and add it as a TXT record in your DNS.
                    </p>
                    <div className="bg-gray-50 p-3 rounded font-mono text-xs text-gray-700">
                        Host: default._domainkey.yourdomain.com<br />
                        Type: TXT<br />
                        Value: [Get from your provider]
                    </div>
                </div>

                <div className="bg-white border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">2. Add DMARC Record (+15 points)</h3>
                    <p className="text-gray-600 text-sm mb-3">
                        DMARC tells receiving servers what to do with emails that fail authentication.
                    </p>
                    <div className="bg-gray-50 p-3 rounded font-mono text-xs text-gray-700">
                        Host: _dmarc.yourdomain.com<br />
                        Type: TXT<br />
                        Value: v=DMARC1; p=quarantine; rua=mailto:dmarc@yourdomain.com
                    </div>
                </div>

                <div className="bg-white border-l-4 border-blue-500 p-6 rounded-r-lg shadow-sm">
                    <h3 className="font-bold text-gray-900 mb-2">3. Verify Blacklist Status (+40 points if clean)</h3>
                    <p className="text-gray-600 text-sm mb-3">
                        If you got -40 for "unreachable" checks, manually verify you're not blacklisted:
                    </p>
                    <ol className="text-sm text-gray-600 space-y-1 ml-4 list-decimal">
                        <li>Visit <a href="https://mxtoolbox.com/blacklists.aspx" target="_blank" className="text-blue-600 hover:underline">mxtoolbox.com/blacklists.aspx</a></li>
                        <li>Enter your domain</li>
                        <li>If all checks show "Not Listed", trigger a manual re-assessment in Superkabe</li>
                    </ol>
                </div>
            </div>

            {/* Key Takeaways */}
            <div className="bg-gray-900 text-white rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold mb-6">Key Takeaways</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <div className="text-3xl mb-2">🎯</div>
                        <h3 className="font-bold mb-2">Two Different Systems</h3>
                        <p className="text-gray-300">Infrastructure score = DNS foundation. Entity status = Real-time performance.</p>
                    </div>
                    <div>
                        <div className="text-3xl mb-2">✅</div>
                        <h3 className="font-bold mb-2">Healthy Can Coexist with Low Score</h3>
                        <p className="text-gray-300">You can send successfully even with weak DNS. But you're at higher risk.</p>
                    </div>
                    <div>
                        <div className="text-3xl mb-2">🚀</div>
                        <h3 className="font-bold mb-2">Score Doesn't Block Campaigns</h3>
                        <p className="text-gray-300">Only affects initial gate. Healing uses bounce rates, not infrastructure score.</p>
                    </div>
                    <div>
                        <div className="text-3xl mb-2">🔧</div>
                        <h3 className="font-bold mb-2">Easy to Fix</h3>
                        <p className="text-gray-300">Add DKIM/DMARC records and your score jumps to 100/100.</p>
                    </div>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/dns-setup" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → How to Set Up DNS Records (SPF/DKIM/DMARC)
                    </a>
                    <a href="/docs/help/auto-healing" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → How Auto-Healing Works
                    </a>
                    <a href="/docs/help/status-colors" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → What Do Status Colors Mean?
                    </a>
                </div>
            </div>
        </div>
    );
}
