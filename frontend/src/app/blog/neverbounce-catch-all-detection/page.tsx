import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'NeverBounce Catch-All Detection: What It Does and What It Doesn\'t',
    description: 'NeverBounce labels catch-all emails as accept_all and recommends not sending. But skipping 30-40% of B2B leads is not practical. Here is what NeverBounce does and how to fill the gap.',
    openGraph: {
        title: 'NeverBounce Catch-All Detection: What It Does and What It Doesn\'t',
        description: 'NeverBounce flags catch-all domains as accept_all. Their recommendation: don\'t send. But 30-40% of B2B leads are catch-all. Here is a practical approach that actually works.',
        url: '/blog/neverbounce-catch-all-detection',
        siteName: 'Superkabe',
        type: 'article',
        publishedTime: '2026-04-07',
    },
    alternates: {
        canonical: '/blog/neverbounce-catch-all-detection',
    },
};

export default function NeverBounceCatchAllDetectionArticle() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "NeverBounce Catch-All Detection: What It Does and What It Doesn't",
        "description": "NeverBounce labels catch-all emails as accept_all and recommends not sending. But skipping 30-40% of B2B leads is not practical. Here is what NeverBounce does and how to fill the gap.",
        "author": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com"
        },
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
        "datePublished": "2026-04-07",
        "dateModified": "2026-04-07",
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/blog/neverbounce-catch-all-detection"
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What does NeverBounce accept_all status mean?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Accept_all (also called catch-all) means NeverBounce detected that the recipient's mail server accepts emails sent to any address at that domain. The server does not reject fake addresses during SMTP verification, so NeverBounce cannot confirm whether the specific email address belongs to a real mailbox. It is a domain-level configuration, not an address-level result."
                }
            },
            {
                "@type": "Question",
                "name": "Does NeverBounce recommend sending to accept_all emails?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. NeverBounce's official recommendation is to not send to accept_all addresses because the deliverability risk is higher. However, this recommendation does not account for the business reality that 30-40% of B2B leads are on catch-all domains. Following the recommendation strictly means losing a significant portion of your addressable market."
                }
            },
            {
                "@type": "Question",
                "name": "Can I use NeverBounce and Superkabe together?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. They solve different problems. Use NeverBounce for initial verification to filter out definite invalid addresses, spam traps, and disposable emails. Then route your leads (including accept_all leads) through Superkabe for catch-all risk scoring, per-mailbox distribution caps, real-time bounce monitoring, and auto-pause protection. NeverBounce handles the pre-send filter. Superkabe handles everything after."
                }
            },
            {
                "@type": "Question",
                "name": "What is the difference between NeverBounce unknown and accept_all?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Accept_all means NeverBounce confirmed the domain accepts all emails. Unknown means NeverBounce could not reach a conclusion. The server may have been unreachable, timed out, or used greylisting to delay verification. Accept_all is a definitive finding about the domain configuration. Unknown is an inconclusive result that could mean anything."
                }
            },
            {
                "@type": "Question",
                "name": "How accurate is NeverBounce for catch-all detection?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "NeverBounce is reliable at detecting whether a domain is catch-all. The SMTP probe technique it uses — sending a test to a fake address and checking if the server accepts it — works well for this purpose. The limitation is not detection accuracy. It is that detecting catch-all status does not tell you whether the specific person you want to email actually has a mailbox there."
                }
            },
            {
                "@type": "Question",
                "name": "Does NeverBounce monitor what happens after I send to catch-all leads?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "No. NeverBounce is a pre-send verification tool. It checks addresses before you send. Once you decide to email a catch-all lead, NeverBounce has no visibility into bounce events, mailbox health, domain reputation, or anything else that happens post-send. You need a separate infrastructure monitoring layer for that."
                }
            }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <article>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                    NeverBounce catch-all detection: what it does and what it does not
                </h1>
                <p className="text-gray-400 text-sm mb-8">10 min read &middot; Published April 2026</p>

                <p className="text-xl text-blue-900 font-medium mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    NeverBounce flags catch-all domains with an &quot;accept_all&quot; status. Their recommendation? Do not send to those addresses. That is technically the safe move. But when 30-40% of your B2B leads are on catch-all domains, &quot;do not send&quot; is not a strategy. It is a pipeline killer.
                </p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> NeverBounce returns &quot;accept_all&quot; for catch-all domains and recommends not sending to them</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Following that recommendation means losing 30-40% of your B2B pipeline</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> NeverBounce has no post-send monitoring, auto-pause, or risk distribution for catch-all leads</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> The practical approach: use NeverBounce for pre-send filtering, then layer Superkabe for catch-all protection during and after sending</li>
                    </ul>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Table of Contents</h2>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
                        <li><a href="#neverbounce-catch-all-handling" style={{ color: '#2563EB', textDecoration: 'none' }}>How NeverBounce handles catch-all domains</a></li>
                        <li><a href="#what-neverbounce-does-well" style={{ color: '#2563EB', textDecoration: 'none' }}>What NeverBounce does well</a></li>
                        <li><a href="#the-dont-send-problem" style={{ color: '#2563EB', textDecoration: 'none' }}>The &quot;don&apos;t send&quot; problem</a></li>
                        <li><a href="#the-gap" style={{ color: '#2563EB', textDecoration: 'none' }}>The gap after verification</a></li>
                        <li><a href="#practical-approach" style={{ color: '#2563EB', textDecoration: 'none' }}>The practical approach for NeverBounce users</a></li>
                        <li><a href="#comparison-table" style={{ color: '#2563EB', textDecoration: 'none' }}>What NeverBounce checks vs what Superkabe adds</a></li>
                        <li><a href="#faq" style={{ color: '#2563EB', textDecoration: 'none' }}>FAQ</a></li>
                    </ol>
                </div>

                <div className="prose prose-lg max-w-none">
                    {/* Section 1 */}
                    <h2 id="neverbounce-catch-all-handling" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How NeverBounce handles catch-all domains</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        NeverBounce uses SMTP probing to verify email addresses. For each address, it connects to the recipient&apos;s mail server and checks whether the server would accept the email. On a standard domain, this works well. The server says yes or no, and NeverBounce returns &quot;valid&quot; or &quot;invalid.&quot;
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Catch-all domains break this model. The server says yes to everything. It accepts emails to real employees, former employees, typos, and completely fabricated addresses. NeverBounce detects this by probing with a fake address. If the server accepts the fake address, NeverBounce labels the domain as &quot;accept_all.&quot;
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">NeverBounce catch-all classification</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">▸</span> <strong>Status label:</strong> &quot;accept_all&quot; (separate from valid, invalid, disposable, and unknown)</li>
                            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">▸</span> <strong>Official recommendation:</strong> Do not send to accept_all addresses</li>
                            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">▸</span> <strong>No risk differentiation:</strong> All accept_all addresses get the same label. No scoring, no confidence level, no distinction between likely-real and likely-fake</li>
                            <li className="flex items-start gap-2"><span className="text-gray-400 mt-0.5">▸</span> <strong>Separate from &quot;unknown&quot;:</strong> accept_all is a definitive classification. NeverBounce confirmed the domain accepts everything. Unknown means it could not determine the status</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        NeverBounce is transparent about this limitation. They do not pretend they can verify individual addresses on catch-all domains. The accept_all label is honest. The recommendation not to send is conservative. But that conservatism comes at a cost most outbound teams cannot afford.
                    </p>

                    {/* Section 2 */}
                    <h2 id="what-neverbounce-does-well" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What NeverBounce does well</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        NeverBounce has built a solid verification product with real strengths. Before talking about gaps, it is worth recognizing where the tool delivers.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">NeverBounce strengths</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Fast bulk processing:</strong> Handles large lists quickly. Upload a 50,000-email CSV and get results back in minutes, not hours</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Reliable real-time API:</strong> The API is well-documented and fast. Good for teams integrating verification into automated workflows</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Good accuracy:</strong> Around 96-97% detection rate for invalid addresses on non-catch-all domains. Not quite ZeroBounce level, but close</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Competitive pricing:</strong> Roughly $0.80 per 1,000 at volume. Cheaper than ZeroBounce ($3-4 per 1,000), more expensive than MillionVerifier ($0.50 per 1,000)</li>
                            <li className="flex items-start gap-2"><span className="text-green-500 mt-0.5">▸</span> <strong>Good integrations:</strong> Native connections with HubSpot, Zapier, and several other platforms. Makes it easy to plug into existing workflows</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        For pre-send list cleaning, NeverBounce is a dependable choice. It filters out the obvious invalids, catches disposable email addresses, and processes lists fast enough for high-volume teams. If every domain on your list were a standard non-catch-all domain, NeverBounce would give you clean, actionable results.
                    </p>

                    {/* Section 3 */}
                    <h2 id="the-dont-send-problem" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The &quot;don&apos;t send&quot; problem</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        NeverBounce recommends not sending to accept_all addresses. On paper, that is the safe move. In practice, it is not realistic for most outbound teams.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Between 30-40% of B2B email addresses sit on catch-all domains. Enterprise companies, government agencies, healthcare systems, financial institutions, law firms. These are not fringe targets. For many sales teams, they are the primary ICP.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Run the math on a real outbound operation. You enrich 1,000 leads through Clay at $0.03 each. That is $30 in enrichment costs. NeverBounce verification adds another $0.80. Your total list investment is about $31. NeverBounce returns 350 of those leads as accept_all. If you follow the recommendation and skip them, you just wrote off $10.50 in enrichment costs and lost access to 350 potential conversations.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Scale that to 10,000 leads per month. You are discarding 3,500 leads and $105 in enrichment costs monthly. Over a year, that is 42,000 leads and $1,260 in wasted enrichment. And the real cost is not the money. It is the pipeline you never built because your VP of Sales at a Fortune 500 company happened to be on a catch-all domain.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        We covered the full scope of the catch-all challenge in our <Link href="/blog/catch-all-domains-cold-outreach" className="text-blue-600 hover:text-blue-800 underline">catch-all domains deep dive</Link>. The short version: you need a way to send to catch-all leads without destroying your infrastructure. &quot;Don&apos;t send&quot; is not that way.
                    </p>

                    {/* Section 4 */}
                    <h2 id="the-gap" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The gap after verification</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Suppose you ignore NeverBounce&apos;s recommendation and send to accept_all leads anyway. Now you are in unprotected territory. NeverBounce flagged the risk. You accepted it. What happens next is entirely on you.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">What NeverBounce cannot do after verification</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No post-send monitoring:</strong> NeverBounce does not watch your bounce rates. If catch-all leads bounce at 8%, you will not hear about it from NeverBounce</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No infrastructure protection:</strong> If bounces from catch-all leads push a mailbox past its threshold, nothing stops the sending automatically</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No risk distribution:</strong> NeverBounce does not know which mailbox will send to which lead. It cannot spread catch-all risk across your infrastructure</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No domain intelligence:</strong> If a particular catch-all domain has historically caused bounces, NeverBounce has no memory of that. It checks the same domain fresh each time</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-0.5">▸</span> <strong>No healing:</strong> If a mailbox or domain takes damage from catch-all bounces, there is no recovery system. You are on your own figuring out when and how to resume sending</li>
                        </ul>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        NeverBounce was not designed to do any of this. It is a verification tool. Verification answers: &quot;Is this address deliverable?&quot; Infrastructure protection answers: &quot;Is it safe to send from this mailbox right now, and what should happen if things go wrong?&quot; These are different questions that require different systems. For more on this distinction, see our <Link href="/blog/email-validation-vs-verification" className="text-blue-600 hover:text-blue-800 underline">validation vs verification breakdown</Link>.
                    </p>

                    {/* Section 5 */}
                    <h2 id="practical-approach" className="text-2xl font-bold text-gray-900 mt-12 mb-4">The practical approach for NeverBounce users</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The goal is not to replace NeverBounce. NeverBounce does its job well. The goal is to add the protection layer that makes it safe to send to those accept_all leads instead of discarding them.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">Two-layer approach</h3>
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm mb-1">Layer 1: NeverBounce (pre-send filter)</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Run your list through NeverBounce first. Remove all &quot;invalid&quot; and &quot;disposable&quot; results. These are definite bad addresses that should never reach a sender. NeverBounce catches these reliably. Keep the &quot;valid&quot; results. And keep the &quot;accept_all&quot; results too &mdash; those are the leads you are about to protect rather than discard.
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-gray-800 text-sm mb-1">Layer 2: Superkabe (send-time protection + post-send monitoring)</h4>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Route all remaining leads (valid + accept_all) through Superkabe. For accept_all leads, Superkabe detects catch-all status at the domain level and caches it in the DomainInsight table. The lead gets a validation score penalty. Routing caps limit each mailbox to a maximum of 2 risky leads per 60 sends. After sending, Superkabe monitors bounce rates on a 60-second cycle and auto-pauses any mailbox that crosses the threshold.
                                </p>
                            </div>
                        </div>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        This combination gives you the best of both worlds. NeverBounce removes the definite junk before it reaches your infrastructure. Superkabe manages the uncertain (catch-all) leads with risk distribution and real-time monitoring. You send to catch-all leads. But you do it with guardrails.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        If you already use NeverBounce and want to keep it, this is the cleanest path. If you want to consolidate tools, Superkabe includes MillionVerifier in its built-in validation pipeline, so you could drop NeverBounce entirely and let Superkabe handle both verification and protection. Either setup works. For the full list of verification options, see our <Link href="/blog/best-email-validation-tools-cold-outreach" className="text-blue-600 hover:text-blue-800 underline">best email validation tools guide</Link>.
                    </p>

                    {/* Comparison Table */}
                    <h2 id="comparison-table" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What NeverBounce checks vs what Superkabe adds</h2>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-sm overflow-x-auto">
                        <table className="w-full text-left border-collapse min-w-[600px]">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="py-4 px-4 font-bold text-gray-900 text-xs">Capability</th>
                                    <th className="py-4 px-4 font-bold text-gray-900 text-xs">NeverBounce</th>
                                    <th className="py-4 px-4 font-bold text-gray-900 text-xs">Superkabe</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Invalid email detection</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">Yes (~97% accuracy)</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">Yes (via MillionVerifier)</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Catch-all detection</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">Yes (accept_all label)</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">Yes (detects + caches per domain)</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Catch-all recommendation</td>
                                    <td className="py-4 px-4 text-gray-600 text-xs">Don&apos;t send</td>
                                    <td className="py-4 px-4 text-gray-600 text-xs">Send with risk caps</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Risk scoring</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">0-100 validation score</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Domain-level intelligence</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No (checks fresh each time)</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">DomainInsight cache</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Per-mailbox risk caps</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">Max 2 risky per 60 sends</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Bounce monitoring</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">60-second monitoring cycle</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Auto-pause</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">Configurable threshold</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-4 text-gray-800 font-semibold text-xs">Infrastructure healing</td>
                                    <td className="py-4 px-4 text-red-600 text-xs">No</td>
                                    <td className="py-4 px-4 text-green-600 text-xs font-semibold">5-phase graduated recovery</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The pattern is clear. NeverBounce covers the left side of the timeline: what happens before you send. Superkabe covers the right side: what happens during and after you send. For catch-all leads specifically, the right side is where the risk lives.
                    </p>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        For a side-by-side look at how NeverBounce and ZeroBounce compare on catch-all handling (and where Superkabe fits in), read our <Link href="/blog/catch-all-detection-zerobounce-vs-neverbounce" className="text-blue-600 hover:text-blue-800 underline">three-way comparison</Link>.
                    </p>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-3">Send to catch-all leads. Safely.</h3>
                            <p className="text-blue-100 leading-relaxed">
                                NeverBounce says do not send. But you need those leads. Superkabe lets you send to catch-all addresses with per-mailbox risk caps, real-time bounce monitoring, and auto-pause protection. Keep NeverBounce for pre-send cleaning. Add Superkabe for everything after. <Link href="/" className="text-white underline hover:text-blue-200">See how it works</Link>.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h2 id="faq" className="text-2xl font-bold text-gray-900 mb-4">Frequently asked questions</h2>

                    <div className="space-y-6">
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">What does NeverBounce accept_all status mean?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Accept_all means NeverBounce detected that the recipient&apos;s mail server accepts emails sent to any address at that domain. The server does not reject fake addresses during SMTP verification, so NeverBounce cannot confirm whether the specific email address belongs to a real mailbox.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Does NeverBounce recommend sending to accept_all emails?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                No. NeverBounce officially recommends not sending to accept_all addresses because the deliverability risk is higher. However, 30-40% of B2B leads are on catch-all domains. Following this recommendation strictly means losing a significant portion of your addressable market.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Can I use NeverBounce and Superkabe together?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Yes. They solve different problems. Use NeverBounce for initial verification to filter out definite invalid addresses. Then route leads (including accept_all) through Superkabe for catch-all risk scoring, per-mailbox distribution caps, bounce monitoring, and auto-pause protection.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">What is the difference between NeverBounce unknown and accept_all?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                Accept_all means NeverBounce confirmed the domain accepts all emails. Unknown means NeverBounce could not reach a conclusion. The server may have been unreachable or used greylisting. Accept_all is definitive. Unknown is inconclusive.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">How accurate is NeverBounce for catch-all detection?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                NeverBounce is reliable at detecting whether a domain is catch-all. The SMTP probe technique works well for this. The limitation is that detecting catch-all status does not tell you whether the specific person you want to email has a real mailbox.
                            </p>
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-900 mb-2">Does NeverBounce monitor what happens after I send to catch-all leads?</h3>
                            <p className="text-gray-600 text-sm leading-relaxed">
                                No. NeverBounce is a pre-send tool. Once you send, it has no visibility into bounce events, mailbox health, or domain reputation. You need a separate infrastructure monitoring layer for post-send protection.
                            </p>
                        </div>
                    </div>
                </div>
            </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/blog/catch-all-domains-cold-outreach" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Catch-All Domains Deep Dive</h3>
                        <p className="text-gray-500 text-xs">The full technical breakdown of catch-all risk</p>
                    </Link>
                    <Link href="/blog/email-validation-vs-verification" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Validation vs Verification</h3>
                        <p className="text-gray-500 text-xs">Why these are different problems</p>
                    </Link>
                    <Link href="/blog/best-email-validation-tools-cold-outreach" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Best Email Validation Tools</h3>
                        <p className="text-gray-500 text-xs">Complete comparison for cold outreach teams</p>
                    </Link>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">See how Superkabe protects your infrastructure</Link>
                </div>
            </section>
        </>
    );
}
