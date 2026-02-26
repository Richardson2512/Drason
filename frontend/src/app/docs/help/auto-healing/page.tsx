import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How Auto-Healing Works | Superkabe Help',
    description: 'Understanding the 5-phase pipeline that automatically recovers your email infrastructure in Superkabe.',
    alternates: { canonical: '/docs/help/auto-healing' },
    openGraph: {
        title: 'How Auto-Healing Works | Superkabe Help',
        description: 'Understanding the 5-phase pipeline that automatically recovers your email infrastructure in Superkabe.',
        url: '/docs/help/auto-healing',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function AutoHealingPage() {
    return (
        <div className="prose prose-lg text-gray-700 max-w-none">
            <h1 className="text-5xl font-bold mb-6 text-gray-900">
                How Auto-Healing Works
            </h1>
            <p className="text-xl text-gray-500 mb-12">
                Understanding the 5-phase pipeline that automatically recovers your infrastructure
            </p>

            {/* What Is Auto-Healing */}
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-gray-900">What Is Auto-Healing?</h2>
                <p className="text-gray-700 mb-4 text-lg">
                    Auto-healing is Superkabe's automatic recovery system. When a mailbox, domain, or campaign gets paused due to health issues,
                    the system doesn't just leave it broken - it walks it through a **graduated recovery process** to safely bring it back online.
                </p>
                <p className="text-gray-600">
                    Think of it like physical therapy after an injury. You don't go from bed rest to running a marathon.
                    You gradually rebuild strength through controlled exercises. Auto-healing does the same for your email infrastructure.
                </p>
            </div>

            {/* The 5 Phases */}
            <h2 className="text-3xl font-bold mb-8 text-gray-900 mt-12">The 5 Recovery Phases</h2>

            <div className="space-y-6 mb-12">
                {/* Phase 1 */}
                <div className="bg-white border-l-4 border-red-500 rounded-r-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center font-bold text-red-700">
                            1
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 1: PAUSED (Cooldown)</h3>
                            <p className="text-gray-600 mb-3">
                                <strong>What happens:</strong> Mailbox stops all sending. This gives the infrastructure time to "cool down" and receiving servers time to forget the bad behavior.
                            </p>
                            <div className="bg-red-50 rounded-lg p-4 mb-3 border border-red-100">
                                <p className="text-sm text-gray-700 mb-2"><strong>Duration:</strong></p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• First pause: 4 hours</li>
                                    <li>• Second pause (relapse): 24 hours</li>
                                    <li>• Third+ pause: 48 hours</li>
                                </ul>
                            </div>
                            <p className="text-sm text-gray-500"><strong>Graduation criteria:</strong> Wait for cooldown timer to expire</p>
                        </div>
                    </div>
                </div>

                {/* Phase 2 */}
                <div className="bg-white border-l-4 border-amber-500 rounded-r-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center font-bold text-amber-700">
                            2
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 2: QUARANTINE (Validation)</h3>
                            <p className="text-gray-600 mb-3">
                                <strong>What happens:</strong> DNS health is re-checked. The system verifies SPF/DKIM are valid and domain isn't blacklisted.
                            </p>
                            <div className="bg-amber-50 rounded-lg p-4 mb-3 border border-amber-100">
                                <p className="text-sm text-gray-700 mb-2"><strong>Checks performed:</strong></p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>✓ SPF record valid</li>
                                    <li>✓ DKIM record valid</li>
                                    <li>✓ Not on Spamhaus/Barracuda/SORBS/SpamCop</li>
                                </ul>
                            </div>
                            <p className="text-sm text-gray-500"><strong>Graduation criteria:</strong> Pass all DNS checks</p>
                        </div>
                    </div>
                </div>

                {/* Phase 3 */}
                <div className="bg-white border-l-4 border-blue-500 rounded-r-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-700">
                            3
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 3: RESTRICTED_SEND (Proof of Life)</h3>
                            <p className="text-gray-600 mb-3">
                                <strong>What happens:</strong> Very limited sending begins (5 emails/day). The system monitors every single send to ensure zero bounces.
                            </p>
                            <div className="bg-blue-50 rounded-lg p-4 mb-3 border border-blue-100">
                                <p className="text-sm text-gray-700 mb-2"><strong>Limits:</strong></p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Max 5 sends per day</li>
                                    <li>• Must achieve 10-20 clean sends (0 bounces)</li>
                                    <li>• Any bounce resets counter to zero</li>
                                </ul>
                            </div>
                            <p className="text-sm text-gray-500"><strong>Graduation criteria:</strong> 10-20 consecutive clean sends (varies by history)</p>
                        </div>
                    </div>
                </div>

                {/* Phase 4 */}
                <div className="bg-white border-l-4 border-green-500 rounded-r-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-700">
                            4
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 4: WARM_RECOVERY (Volume Ramp)</h3>
                            <p className="text-gray-600 mb-3">
                                <strong>What happens:</strong> Volume slowly increases (25 emails/day). System continues monitoring bounce rate closely.
                            </p>
                            <div className="bg-green-50 rounded-lg p-4 mb-3 border border-green-100">
                                <p className="text-sm text-gray-700 mb-2"><strong>Limits & Requirements:</strong></p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>• Max 25 sends per day</li>
                                    <li>• Must achieve 50-100 clean sends</li>
                                    <li>• Must maintain bounce rate &lt;2% (strict during recovery)</li>
                                    <li>• Must stay in phase for 3-7 days minimum</li>
                                </ul>
                            </div>
                            <p className="text-sm text-gray-500"><strong>Graduation criteria:</strong> 50-100 clean sends + 3-7 days + bounce rate &lt;2% (industry standard)</p>
                        </div>
                    </div>
                </div>

                {/* Phase 5 */}
                <div className="bg-white border-l-4 border-emerald-500 rounded-r-2xl p-6 shadow-lg">
                    <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center font-bold text-emerald-700">
                            5
                        </div>
                        <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Phase 5: HEALTHY (Full Recovery) ✅</h3>
                            <p className="text-gray-600 mb-3">
                                <strong>What happens:</strong> Mailbox is fully recovered! All volume restrictions are lifted. Mailbox is automatically re-added to Smartlead campaigns.
                            </p>
                            <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100">
                                <p className="text-sm text-gray-700 mb-2"><strong>Benefits:</strong></p>
                                <ul className="text-sm text-gray-600 space-y-1">
                                    <li>✓ No volume restrictions</li>
                                    <li>✓ Automatically re-added to campaigns</li>
                                    <li>✓ Full sending privileges restored</li>
                                    <li>✓ Notification sent to your team</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Timeline */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">How Long Does It Take?</h2>
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-8 mb-12 shadow-sm">
                <div className="space-y-4">
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Best Case Scenario</h3>
                        <p className="text-gray-600 text-sm mb-3">First-time pause, clean DNS, good behavior:</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-mono text-sm text-gray-700">
                                Phase 1 (4h) + Phase 2 (instant) + Phase 3 (2 days) + Phase 4 (7 days) = <strong>~9 days</strong>
                            </p>
                        </div>
                    </div>
                    <div>
                        <h3 className="font-bold text-gray-900 mb-2">Worst Case Scenario</h3>
                        <p className="text-gray-600 text-sm mb-3">Multiple relapses, DNS issues, slow clean send accumulation:</p>
                        <div className="bg-gray-50 rounded-lg p-4">
                            <p className="font-mono text-sm text-gray-700">
                                Phase 1 (48h) + Phase 2 (blocked until DNS fixed) + Phase 3 (4 days) + Phase 4 (14 days) = <strong>~18+ days</strong>
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* What If I Relapse */}
            <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-6 mb-12">
                <h2 className="text-2xl font-bold mb-4 text-red-900">What If I Relapse?</h2>
                <p className="text-red-800 mb-4">
                    A **relapse** happens when you bounce again during recovery (Phase 3 or 4). The system gets stricter each time:
                </p>
                <div className="space-y-3">
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                        <p className="font-bold text-gray-900 mb-1">First Relapse:</p>
                        <p className="text-sm text-gray-600">Reset to QUARANTINE with 2x cooldown (8 hours)</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                        <p className="font-bold text-gray-900 mb-1">Second Relapse:</p>
                        <p className="text-sm text-gray-600">Reset to PAUSED with 24-hour cooldown</p>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-red-200">
                        <p className="font-bold text-gray-900 mb-1">Third+ Relapse:</p>
                        <p className="text-sm text-gray-600">Reset to PAUSED with 48-hour cooldown + <strong>manual intervention required</strong></p>
                    </div>
                </div>
                <p className="text-red-700 text-sm mt-4">
                    <strong>Tip:</strong> If you keep relapsing, it means the root cause isn't fixed. Check your email list quality and DNS setup.
                </p>
            </div>

            {/* Can I Speed It Up */}
            <h2 className="text-3xl font-bold mb-6 text-gray-900 mt-12">Can I Speed Up Recovery?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                    <h3 className="font-bold text-green-900 mb-3">✅ Yes, By:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Fixing DNS issues immediately (unblocks Phase 2)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Cleaning your email list (prevents bounces in Phase 3/4)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Using only verified, high-quality contacts</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Removing blacklist listings quickly</span>
                        </li>
                    </ul>
                </div>
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                    <h3 className="font-bold text-red-900 mb-3">❌ You Cannot:</h3>
                    <ul className="space-y-2 text-sm text-gray-700">
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Skip phases (they're mandatory)</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Bypass cooldown timers</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Override volume limits</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span>•</span>
                            <span>Force immediate resumption</span>
                        </li>
                    </ul>
                </div>
            </div>

            {/* Key Benefits */}
            <div className="bg-gradient-to-br from-purple-50 to-blue-50 border-2 border-purple-200 rounded-2xl p-8 mb-12">
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Why Auto-Healing Exists</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div>
                        <div className="text-3xl mb-2">🛡️</div>
                        <h3 className="font-bold mb-2 text-gray-900">Prevents Permanent Damage</h3>
                        <p className="text-gray-600">Jumping straight back to full volume would burn your reputation permanently. Graduated recovery keeps you safe.</p>
                    </div>
                    <div>
                        <div className="text-3xl mb-2">🤖</div>
                        <h3 className="font-bold mb-2 text-gray-900">Fully Automatic</h3>
                        <p className="text-gray-600">No manual intervention needed. The system handles everything - you just fix root causes when notified.</p>
                    </div>
                    <div>
                        <div className="text-3xl mb-2">📊</div>
                        <h3 className="font-bold mb-2 text-gray-900">Adaptive Learning</h3>
                        <p className="text-gray-600">Repeat offenders get longer cooldowns. The system learns which mailboxes need stricter recovery paths.</p>
                    </div>
                    <div>
                        <div className="text-3xl mb-2">🔄</div>
                        <h3 className="font-bold mb-2 text-gray-900">Smartlead Integration</h3>
                        <p className="text-gray-600">When mailboxes recover to healthy, they're automatically re-added to campaigns. Zero manual work.</p>
                    </div>
                </div>
            </div>

            {/* Related Articles */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Related Help Articles</h3>
                <div className="space-y-2">
                    <a href="/docs/help/campaign-paused" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → Why Is My Campaign Paused?
                    </a>
                    <a href="/docs/help/status-colors" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → Understanding Status Colors
                    </a>
                    <a href="/docs/help/dns-setup" className="block p-3 bg-white rounded-lg hover:bg-blue-50 transition-colors text-blue-600 hover:text-blue-700 text-sm font-medium">
                        → DNS Setup Guide
                    </a>
                </div>
            </div>
        </div>
    );
}
