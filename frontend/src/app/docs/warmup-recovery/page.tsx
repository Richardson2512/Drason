import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Warmup-Based Recovery | Superkabe Docs',
    description: 'Automated mailbox healing using Smartlead warmup for guaranteed engagement recovery and zero maintenance.',
    alternates: { canonical: '/docs/warmup-recovery' },
    openGraph: {
        title: 'Warmup-Based Recovery | Superkabe Docs',
        description: 'Automated mailbox healing using Smartlead warmup for guaranteed engagement recovery and zero maintenance.',
        url: '/docs/warmup-recovery',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function WarmupRecoveryPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                Warmup-Based Automated Recovery
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Automated mailbox healing using Smartlead's native warmup feature for guaranteed engagement and zero maintenance
            </p>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">🎯 Overview</h2>
            <p className="text-gray-600 mb-6">
                This system uses <strong>Smartlead's native warmup feature</strong> to automatically heal mailboxes through recovery phases.
                Warmup provides better engagement, automatic volume ramping, and zero test lead management compared to custom healing campaigns.
            </p>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-8 mb-12">
                <h3 className="text-2xl font-bold text-blue-900 mb-6">Why Warmup is Better</h3>
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-gray-700 font-semibold">Feature</th>
                                <th className="px-6 py-3 text-gray-700 font-semibold">Healing Campaigns (Old)</th>
                                <th className="px-6 py-3 text-green-700 font-semibold">Warmup (New) ✅</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            <tr>
                                <td className="px-6 py-4 font-medium text-gray-700">Test Leads</td>
                                <td className="px-6 py-4 text-gray-600">Manual management required</td>
                                <td className="px-6 py-4 text-green-700 font-medium">Automatic (Smartlead warmup network)</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium text-gray-700">Engagement</td>
                                <td className="px-6 py-4 text-gray-600">Unpredictable</td>
                                <td className="px-6 py-4 text-green-700 font-medium">Guaranteed (reciprocal warmup pool)</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium text-gray-700">Volume Ramping</td>
                                <td className="px-6 py-4 text-gray-600">Manual updates</td>
                                <td className="px-6 py-4 text-green-700 font-medium">Automatic (daily_rampup parameter)</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium text-gray-700">Reputation Tracking</td>
                                <td className="px-6 py-4 text-gray-600">Not available</td>
                                <td className="px-6 py-4 text-green-700 font-medium">Built-in (warmup_reputation)</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium text-gray-700">Setup Complexity</td>
                                <td className="px-6 py-4 text-gray-600">High (campaigns, test leads, sequences)</td>
                                <td className="px-6 py-4 text-green-700 font-medium">Low (2 API calls)</td>
                            </tr>
                            <tr>
                                <td className="px-6 py-4 font-medium text-gray-700">Maintenance</td>
                                <td className="px-6 py-4 text-gray-600">Requires test lead pool</td>
                                <td className="px-6 py-4 text-green-700 font-medium">Zero maintenance</td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">🔄 Complete Recovery Flow</h2>

            {/* Day 0: Bounce Threshold */}
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold">DAY 0</span>
                    <h3 className="text-xl font-bold text-red-800 m-0">Bounce Threshold Exceeded</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    <strong>Trigger:</strong> Mailbox reaches 3% bounce rate (2 bounces / 60 sends)
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                    <ol className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>1. Webhook receives <code className="px-2 py-1 bg-gray-100 rounded">EMAIL_BOUNCED</code> event</li>
                        <li>2. Calculate bounce rate: 3.3% &gt; 3% threshold</li>
                        <li>3. ✅ Update mailbox: <code className="px-2 py-1 bg-red-100 rounded text-red-700">status = 'paused', recovery_phase = 'paused'</code></li>
                        <li>4. ✅ Remove from ALL Smartlead campaigns (infrastructure hygiene)</li>
                        <li>5. ✅ Set 48h cooldown</li>
                        <li>6. ✅ Notify user: "Mailbox auto-paused & removed"</li>
                    </ol>
                </div>
                <p className="text-sm text-gray-600 m-0"><strong>Status:</strong> Mailbox paused, removed from production</p>
            </div>

            {/* Day 2: Cooldown Complete */}
            <div className="bg-gray-50 border border-gray-300 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-gray-600 text-white px-3 py-1 rounded-full text-sm font-bold">DAY 2</span>
                    <h3 className="text-xl font-bold text-gray-800 m-0">Cooldown Complete → QUARANTINE</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    <strong>Trigger:</strong> Automated healing worker
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                    <ol className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>1. Check <code className="px-2 py-1 bg-gray-100 rounded">cooldown_until</code> timestamp</li>
                        <li>2. ✅ Transition: <code className="px-2 py-1 bg-gray-100 rounded">PAUSED → QUARANTINE</code></li>
                        <li>3. Await DNS/SPF/DKIM checks</li>
                        <li>4. Await root cause resolution</li>
                    </ol>
                </div>
                <p className="text-sm text-gray-600 m-0"><strong>Status:</strong> In quarantine, awaiting health verification</p>
            </div>

            {/* Day 3: DNS Passes */}
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-orange-600 text-white px-3 py-1 rounded-full text-sm font-bold">DAY 3</span>
                    <h3 className="text-xl font-bold text-orange-800 m-0">DNS Passes → RESTRICTED_SEND</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    <strong>Trigger:</strong> Health checks pass OR operator manually graduates
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                    <ol className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>1. ✅ Transition: <code className="px-2 py-1 bg-gray-100 rounded">QUARANTINE → RESTRICTED_SEND</code></li>
                        <li>2. 🆕 <strong>Enable Smartlead warmup:</strong>
                            <ul className="pl-4 mt-1">
                                <li>• <code className="px-2 py-1 bg-gray-100 rounded">total_warmup_per_day: 10</code></li>
                                <li>• <code className="px-2 py-1 bg-gray-100 rounded">daily_rampup: 0</code> (flat volume)</li>
                                <li>• <code className="px-2 py-1 bg-gray-100 rounded">reply_rate_percentage: 30</code></li>
                            </ul>
                        </li>
                        <li>3. ✅ Reset tracking: <code className="px-2 py-1 bg-gray-100 rounded">phase_clean_sends = 0, phase_bounces = 0</code></li>
                        <li>4. ✅ Notify user: "Warmup enabled. System will send 15 clean emails at 10/day."</li>
                    </ol>
                </div>
                <p className="text-sm text-gray-600 m-0"><strong>Status:</strong> Warmup active, automated sends begin (10 emails/day to warmup pool)</p>
            </div>

            {/* Day 3-5: Automated Warmup */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">DAY 3-5</span>
                    <h3 className="text-xl font-bold text-blue-800 m-0">Automated Warmup Sends</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    <strong>Warmup Worker Runs Daily:</strong>
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                    <ol className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>1. Poll Smartlead warmup stats API</li>
                        <li>2. Get <code className="px-2 py-1 bg-gray-100 rounded">total_sent_count</code>, <code className="px-2 py-1 bg-gray-100 rounded">total_spam_count</code>, <code className="px-2 py-1 bg-gray-100 rounded">warmup_reputation</code></li>
                        <li>3. Check graduation criteria: <strong>15 clean sends, 0 spam</strong></li>
                        <li>4. If criteria met → Auto-graduate to <code className="px-2 py-1 bg-green-100 rounded text-green-700">WARM_RECOVERY</code></li>
                    </ol>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2"><strong>Example Timeline:</strong></p>
                    <ul className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>• Day 3: 10 sends → <code className="px-2 py-1 bg-gray-100 rounded">total_sent_count = 10</code></li>
                        <li>• Day 4: 10 sends → <code className="px-2 py-1 bg-gray-100 rounded">total_sent_count = 20</code> ✅ <strong>Ready for graduation!</strong></li>
                    </ul>
                </div>
            </div>

            {/* Day 5-8: Final Recovery */}
            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-6">
                <div className="flex items-center gap-3 mb-3">
                    <span className="bg-green-600 text-white px-3 py-1 rounded-full text-sm font-bold">DAY 5-8</span>
                    <h3 className="text-xl font-bold text-green-800 m-0">Final Recovery Phase → HEALTHY</h3>
                </div>
                <p className="text-gray-700 mb-4">
                    <strong>Graduation Criteria:</strong> 50 sends, 0 spam, 3+ days
                </p>
                <div className="bg-white rounded-lg p-4 mb-4">
                    <p className="text-sm text-gray-700 mb-2"><strong>Example Timeline:</strong></p>
                    <ul className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>• Day 5: 50 sends (with rampup) → <code className="px-2 py-1 bg-gray-100 rounded">total_sent_count = 50, days = 1</code></li>
                        <li>• Day 6: 55 sends → <code className="px-2 py-1 bg-gray-100 rounded">total_sent_count = 105, days = 2</code></li>
                        <li>• Day 7: 60 sends → <code className="px-2 py-1 bg-gray-100 rounded">total_sent_count = 165, days = 3</code> ✅ <strong>Ready!</strong></li>
                    </ul>
                </div>
                <div className="bg-white rounded-lg p-4">
                    <p className="text-sm text-gray-700 mb-2"><strong>Auto-Graduation:</strong></p>
                    <ol className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>1. ✅ Transition: <code className="px-2 py-1 bg-gray-100 rounded">WARM_RECOVERY → HEALTHY</code></li>
                        <li>2. ✅ Switch to maintenance warmup (10/day) OR disable completely</li>
                        <li>3. ✅ Re-add mailbox to all production campaigns in Smartlead</li>
                        <li>4. ✅ Notify user: "Mailbox fully recovered! Re-added to production."</li>
                    </ol>
                </div>
                <p className="text-sm font-bold text-green-700 mt-3 m-0">🎉 Status: Mailbox healthy and back in production!</p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">🛡️ Safety Features</h2>

            <div className="bg-red-50 border-2 border-red-300 rounded-2xl p-6 mb-8">
                <h3 className="text-xl font-bold text-red-800 mb-3">⚠️ Zero Bounce Tolerance During Recovery</h3>
                <p className="text-gray-700 mb-4">
                    If mailbox bounces during <code className="px-2 py-1 bg-red-100 rounded text-red-700">RESTRICTED_SEND</code> or <code className="px-2 py-1 bg-red-100 rounded text-red-700">WARM_RECOVERY</code>:
                </p>
                <div className="bg-white rounded-lg p-4">
                    <ol className="text-sm text-gray-700 space-y-1 m-0 pl-4">
                        <li>1. Webhook receives <code className="px-2 py-1 bg-gray-100 rounded">EMAIL_BOUNCED</code> event</li>
                        <li>2. Check <code className="px-2 py-1 bg-gray-100 rounded">recovery_phase</code>: <em>restricted_send</em> or <em>warm_recovery</em></li>
                        <li>3. ✅ <strong>IMMEDIATE REGRESSION</strong> to <code className="px-2 py-1 bg-red-100 rounded text-red-700">PAUSED</code></li>
                        <li>4. ✅ Set new cooldown (longer - relapse penalty)</li>
                        <li>5. ✅ Notify user: "Recovery failed - bounce detected"</li>
                        <li>6. ✅ Recovery restarts from Day 0</li>
                    </ol>
                </div>
                <p className="text-sm text-gray-600 mt-4 m-0">
                    <strong>Why This Matters:</strong> Ensures only actually healthy mailboxes return to production.
                </p>
            </div>

            <h2 className="text-3xl font-bold mb-4 mt-12 text-gray-900">⚙️ Warmup Configuration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-orange-50 border border-orange-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-orange-800 mb-4">RESTRICTED_SEND Phase</h3>
                    <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Daily Volume:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded">10 emails/day</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Rampup:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded">0 (flat)</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Target Engagement:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded">30% reply rate</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Graduation:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded">15 clean sends</code>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
                    <h3 className="text-xl font-bold text-green-800 mb-4">WARM_RECOVERY Phase</h3>
                    <div className="bg-white rounded-lg p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Daily Volume:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded">50 emails/day</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Rampup:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded">5 (gradual increase)</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Target Engagement:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded">40% reply rate</code>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Graduation:</span>
                            <code className="px-2 py-1 bg-gray-100 rounded">50 sends, 3+ days</code>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mt-8">
                <h3 className="text-xl font-bold text-blue-700 mb-2">📊 Key Insights</h3>
                <ul className="space-y-2 text-gray-600 m-0">
                    <li>• <strong>Automated graduation</strong> via daily warmup worker checks</li>
                    <li>• <strong>Zero manual intervention</strong> — system progresses mailboxes automatically</li>
                    <li>• <strong>Guaranteed engagement</strong> through Smartlead's reciprocal warmup network</li>
                    <li>• <strong>Progressive volume ramping</strong> ensures safe reputational recovery</li>
                    <li>• <strong>Zero tolerance for bounces</strong> during recovery prevents false positives</li>
                </ul>
            </div>
        </div>
    );
}
