import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Multi-Platform Email Validation | Superkabe',
    description: 'Email validation that works across Smartlead, Instantly, and EmailBison. One validation layer, any sending platform. Switch senders without losing your setup.',
    alternates: {
        canonical: '/product/multi-platform-email-validation',
    },
    openGraph: {
        title: 'Multi-Platform Email Validation | Superkabe',
        description: 'One validation and monitoring layer for every sending platform. Smartlead, Instantly, EmailBison — same rules, same routing, same protection. Switch platforms without starting over.',
        url: '/product/multi-platform-email-validation',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function MultiPlatformEmailValidationPage() {
    const webPageSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Multi-Platform Email Validation | Superkabe",
        "description": "Email validation that works across Smartlead, Instantly, and EmailBison. One validation layer, any sending platform.",
        "url": "https://www.superkabe.com/product/multi-platform-email-validation",
        "isPartOf": {
            "@type": "WebSite",
            "name": "Superkabe",
            "url": "https://www.superkabe.com"
        },
        "publisher": { "@id": "https://www.superkabe.com/#organization" }
    };

    const softwareApplicationSchema = {
        "@context": "https://schema.org",
        "@type": "SoftwareApplication",
        "name": "Superkabe Multi-Platform Email Validation",
        "description": "Email validation and infrastructure protection that works across Smartlead, Instantly, and EmailBison. One validation pipeline, any sending platform.",
        "applicationCategory": "BusinessApplication",
        "operatingSystem": "Web",
        "url": "https://www.superkabe.com/product/multi-platform-email-validation",
        "offers": {
            "@type": "AggregateOffer",
            "lowPrice": "49",
            "highPrice": "349",
            "priceCurrency": "USD",
            "offerCount": "3"
        },
        "featureList": [
            "Multi-platform email validation",
            "Smartlead integration",
            "Instantly integration",
            "EmailBison integration",
            "Real-time bounce monitoring",
            "Auto-pause on threshold breach",
            "Catch-all domain detection",
            "DNS health monitoring",
            "Automated healing pipeline",
            "Lead routing and distribution"
        ],
        "author": {
            "@type": "Organization",
            "name": "Superkabe"
        }
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationSchema) }} />

            <article>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                    One validation layer. Any sending platform.
                </h1>
                <p className="text-xl text-gray-500 mb-8">
                    Validate, monitor, and protect your email infrastructure across Smartlead, Instantly, and EmailBison — without rebuilding your setup every time you switch.
                </p>

                <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-8 mb-12">
                    <p className="text-lg text-blue-900 font-medium leading-relaxed">
                        Most email validation tools validate a list and hand you a CSV. You upload the clean list to your sender. If you use two senders, you upload twice. If you switch platforms, you rebuild everything. Superkabe sits between your lead source and your sender — one pipeline that works with any platform, keeping your validation rules, routing config, and monitoring history intact no matter where you send from.
                    </p>
                </div>

                <div className="prose prose-lg max-w-none">

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">The problem with platform-specific validation</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Standalone validation tools exist in isolation. You verify a list with ZeroBounce or MillionVerifier, download the results, and upload clean leads to Smartlead. That works fine if you use one sending platform and never change it.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        But most outbound teams do not stay on one platform forever. You start on Instantly, outgrow it, move to Smartlead. Or you run Smartlead for most clients and Instantly for others. Or you test EmailBison because their pricing fits a specific use case. Every platform switch means re-integrating your validation workflow, re-mapping fields, and losing monitoring history.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        And here is the bigger issue: standalone validation does not connect to your sending infrastructure at all. It validates before you send. It does not watch what happens after. If bounces spike on Smartlead, your ZeroBounce account does not know. If a domain gets blacklisted while sending through Instantly, your validation tool does not pause anything. The validation layer and the sending layer are completely disconnected.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">How Superkabe&apos;s platform adapter works</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Superkabe sits between your lead sources (Clay, Apollo, CSV uploads, API) and your sending platforms. Leads flow in, get validated, scored, and routed — then pushed to the right campaign on the right platform automatically.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">The pipeline</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">1.</span> <strong>Lead ingestion:</strong> Leads arrive via Clay webhook, API, or manual upload. Source does not matter</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">2.</span> <strong>Multi-layer validation:</strong> Syntax check, MX verification, disposable detection, catch-all flagging, SMTP probe. Same pipeline for every lead regardless of destination</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">3.</span> <strong>Health scoring:</strong> GREEN (safe), YELLOW (send with caution), RED (blocked). Scoring rules apply universally</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">4.</span> <strong>Routing:</strong> Valid leads are matched to the right campaign based on persona, targeting criteria, and mailbox capacity</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">5.</span> <strong>Platform push:</strong> The lead is pushed to the matched campaign on whatever platform that campaign runs on — Smartlead, Instantly, or EmailBison</li>
                            <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">6.</span> <strong>Monitoring:</strong> Bounce rates, reply rates, and domain health are tracked across all platforms in one dashboard</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The platform adapter handles the translation between Superkabe&apos;s universal lead format and each platform&apos;s specific API requirements. Smartlead expects <code className="text-sm bg-gray-100 px-1 rounded">company_name</code>. Instantly expects <code className="text-sm bg-gray-100 px-1 rounded">companyName</code>. EmailBison expects <code className="text-sm bg-gray-100 px-1 rounded">company</code>. You do not think about any of this. The adapter maps fields automatically.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Supported platforms</h2>

                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Smartlead</h3>
                            <p className="text-gray-600 text-sm mb-4">Full API integration. Push leads to campaigns, sync mailbox status, monitor bounces, auto-pause on threshold. Campaign-mailbox linking, lead deduplication, and sequence management.</p>
                            <Link href="/docs/smartlead-integration" className="text-blue-600 text-sm hover:text-blue-800 underline">Smartlead integration docs &rarr;</Link>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Instantly</h3>
                            <p className="text-gray-600 text-sm mb-4">Full API integration. Same validation pipeline, same routing logic, same monitoring. Leads validated in Superkabe flow to Instantly campaigns with the same protection as Smartlead.</p>
                            <Link href="/docs/instantly-integration" className="text-blue-600 text-sm hover:text-blue-800 underline">Instantly integration docs &rarr;</Link>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">EmailBison</h3>
                            <p className="text-gray-600 text-sm mb-4">Full API integration. Push leads, sync campaign status, monitor deliverability. All Superkabe protection features work identically across EmailBison and other platforms.</p>
                            <Link href="/docs/emailbison-integration" className="text-blue-600 text-sm hover:text-blue-800 underline">EmailBison integration docs &rarr;</Link>
                        </div>
                    </div>

                    <div className="bg-gray-50 rounded-2xl p-6 mb-8 border border-gray-200">
                        <p className="text-gray-600 text-sm"><strong>Coming soon:</strong> Reply.io integration is in development. If you use Reply.io and want early access, contact us.</p>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">What stays the same when you switch platforms</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Platform migrations are painful because you lose institutional knowledge. Months of monitoring data. Finely tuned routing rules. Domain risk scores learned from actual bounce patterns. With Superkabe, switching platforms changes one thing: which API receives the leads. Everything else persists.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">What persists across platform switches</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>All validation rules:</strong> Catch-all caps, health scoring thresholds, blocked domain lists, role-based address handling — unchanged</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Routing configuration:</strong> Persona matching, campaign assignment rules, mailbox capacity settings — all platform-independent</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Monitoring history:</strong> Bounce rates, domain health trends, blacklist history — stored in Superkabe, not in your sender</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Domain risk scores:</strong> Learned from months of bounce data. Catch-all domains that historically bounce at high rates keep their risk scores</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Lead data and status:</strong> Every lead&apos;s validation result, routing decision, and delivery status. Full audit trail</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&#9679;</span> <strong>Auto-pause thresholds:</strong> Your carefully tuned bounce limits transfer to the new platform instantly</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        Compare this to switching without a middleware layer. You move from Smartlead to Instantly and you are starting from scratch: no monitoring history, no risk scores, no validation pipeline. You are flying blind for the first month while you rebuild what you had. That first month without protection is when domains burn.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">Running multiple platforms simultaneously</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Some teams do not switch platforms. They run multiple simultaneously. Smartlead for high-volume campaigns. Instantly for specific client accounts. EmailBison for a particular use case where its pricing makes sense.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Without a unified layer, each platform has its own lead import process, its own monitoring (or lack thereof), and its own bounce data. You cannot see your total bounce rate across platforms. You cannot enforce consistent validation rules. A domain might be healthy on Smartlead and burning on Instantly, and you would not know until the damage is done.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Superkabe aggregates everything. One dashboard shows bounce rates, domain health, and lead status across all platforms. Auto-pause works regardless of which platform the mailbox sends from. If a domain is taking damage on Instantly, Superkabe pauses the mailbox — even if the same domain is healthy on Smartlead. Cross-platform visibility is not a feature you appreciate until you need it. Then it is the only thing that matters.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">For agencies managing client infrastructure</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Agencies have the most to gain from platform-agnostic validation. Typical agency scenario: 15 clients, each with their own sending domains. Some clients use Smartlead. Some use Instantly. One insists on EmailBison. Without a unified layer, you are managing 3 different validation workflows, 3 different monitoring dashboards, and hoping nothing falls through the cracks.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        With Superkabe, all 15 clients flow through one validation pipeline. Same rules. Same monitoring. Same auto-pause protection. If a client wants to switch from Instantly to Smartlead, you change the platform adapter setting. Everything else — their validation rules, routing config, domain risk scores — carries over. The migration takes minutes, not days.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Read our guide on <Link href="/blog/cold-email-infrastructure-protection-for-agencies" className="text-blue-600 hover:text-blue-800 underline">infrastructure protection for agencies</Link> for the full breakdown of how this works at scale.
                    </p>

                    <h2 className="text-2xl font-bold text-gray-900 mt-12 mb-4">How validation quality stays consistent</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        When validation lives inside each sending platform, quality varies. Smartlead has basic bounce handling. Instantly has its own warmup logic. EmailBison handles things differently. Each platform makes different decisions about the same data.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        With Superkabe as the validation layer, every lead hits the same pipeline regardless of destination. The syntax check is the same. The MX verification is the same. The catch-all detection uses the same cached domain data. The health scoring applies the same thresholds. A lead that would be flagged YELLOW for Smartlead gets flagged YELLOW for Instantly too. Consistency eliminates the &quot;it works on one platform but not the other&quot; problem.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        For a deep dive into validation vs. verification and why the distinction matters, see our guide on <Link href="/blog/email-validation-vs-verification" className="text-blue-600 hover:text-blue-800 underline">email validation vs. verification</Link>. For how Smartlead and Instantly compare with Superkabe in the mix, read <Link href="/blog/email-validation-smartlead-instantly" className="text-blue-600 hover:text-blue-800 underline">email validation for Smartlead and Instantly</Link>.
                    </p>

                    {/* CTA */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden mt-12">
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-2xl mb-3">Stop rebuilding your validation pipeline every time you switch platforms</h3>
                            <p className="text-blue-100 leading-relaxed mb-6">
                                Superkabe gives you one validation layer that works across Smartlead, Instantly, and EmailBison. Your rules, your routing, your monitoring history — all in one place. Switch platforms in minutes, not days.
                            </p>
                            <div className="flex flex-wrap gap-4">
                                <Link href="/pricing" className="bg-white text-blue-700 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                                    View pricing
                                </Link>
                                <Link href="/" className="border border-white/30 text-white font-bold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors">
                                    Start free trial
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Learn More</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/docs/smartlead-integration" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Smartlead Integration</h3>
                        <p className="text-gray-500 text-xs">Setup guide and API documentation</p>
                    </Link>
                    <Link href="/docs/instantly-integration" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Instantly Integration</h3>
                        <p className="text-gray-500 text-xs">Connect Instantly to Superkabe</p>
                    </Link>
                    <Link href="/docs/emailbison-integration" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">EmailBison Integration</h3>
                        <p className="text-gray-500 text-xs">EmailBison setup and configuration</p>
                    </Link>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">&larr; Back to Superkabe homepage</Link>
                </div>
            </section>
        </>
    );
}
