import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How to Check Your Domain Reputation for Cold Email',
    description: 'Compare 6 domain reputation tools for cold email. Google Postmaster, Microsoft SNDS, MXToolbox, Sender Score, Talos, Barracuda — what each checks.',
    openGraph: {
        title: 'How to Check Your Domain Reputation for Cold Email',
        description: 'Compare 6 domain reputation tools for cold email senders. Learn what ISPs evaluate, which tools matter most, and what to do when Google Postmaster shows bad reputation.',
        url: '/blog/how-to-check-domain-reputation-cold-email',
        siteName: 'Superkabe',
        type: 'article',
        publishedTime: '2026-04-01',
    },
    alternates: {
        canonical: '/blog/how-to-check-domain-reputation-cold-email',
    },
};

export default function HowToCheckDomainReputationArticle() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "How to check your domain reputation for cold email (2026 guide)",
        "description": "Compare 6 domain reputation tools for cold email. Google Postmaster, Microsoft SNDS, MXToolbox, Sender Score, Talos, Barracuda — what each checks.",
        "author": { "@type": "Person", "name": "Robert Smith", "jobTitle": "Email Infrastructure Engineer", "url": "https://www.superkabe.com" },
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/blog/how-to-check-domain-reputation-cold-email"
        },
        "datePublished": "2026-04-01",
        "dateModified": "2026-04-01"
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is domain reputation in cold email?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Domain reputation is a per-domain score that each ISP (Google, Microsoft, Yahoo) maintains based on your sending behavior. It is not a single universal number. Each ISP evaluates your domain independently using factors like bounce rate, spam complaints, authentication status, engagement rates, and sending volume. Your domain can have high reputation at Gmail and low reputation at Outlook simultaneously."
                }
            },
            {
                "@type": "Question",
                "name": "Which domain reputation tool is most important for cold email?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Google Postmaster Tools is the most important single tool because approximately 70% of B2B email addresses are Gmail or Google Workspace. It shows your domain reputation on a four-tier scale (High, Medium, Low, Bad) along with spam rate, authentication rates, and delivery errors. For Outlook-heavy audiences, add Microsoft SNDS. For blacklist monitoring, add MXToolbox."
                }
            },
            {
                "@type": "Question",
                "name": "How often should I check domain reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "At minimum, check daily if you are actively sending cold email. Google Postmaster and Microsoft SNDS update with a 24-48 hour delay, so daily checks are the fastest cadence those tools support. However, reputation damage can happen within hours of a bad batch. Real-time monitoring tools like Superkabe check every 60 seconds by tracking bounce events and complaint signals as they happen, rather than waiting for ISP dashboards to update."
                }
            },
            {
                "@type": "Question",
                "name": "What does 'bad' reputation in Google Postmaster mean?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Bad reputation in Google Postmaster means Gmail is actively routing most of your emails to spam for Gmail and Google Workspace recipients. Your inbox placement rate is likely below 10%. This is the lowest tier on Google's four-level scale. Recovery requires immediately stopping all sends, diagnosing the cause (usually high bounce rate or spam complaints), fixing the root issue, and re-warming the domain over 2-8 weeks at reduced volume."
                }
            },
            {
                "@type": "Question",
                "name": "Is Sender Score accurate for cold email senders?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Sender Score from Validity rates your IP address on a 0-100 scale, but it has significant limitations for cold email. First, it measures IP reputation, not domain reputation — and most cold email senders use shared IPs through platforms like Smartlead or Instantly. Second, it updates slowly (weekly at best). Third, the score often does not correlate with actual inbox placement at specific ISPs. It is useful as a general indicator but should not be your primary monitoring tool."
                }
            },
            {
                "@type": "Question",
                "name": "Can I check domain reputation for free?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Google Postmaster Tools, Microsoft SNDS, MXToolbox Blacklist Check, Talos Intelligence, and Barracuda Reputation are all free. Sender Score from Validity also offers a free tier. These tools cover the essentials: Gmail reputation, Outlook reputation, blacklist status, and IP reputation. The limitation is that they are reactive — you have to manually check each one, and data is 24-48 hours old by the time you see it."
                }
            },
            {
                "@type": "Question",
                "name": "What bounce rate triggers reputation damage?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "ISPs start paying attention at 2% bounce rate. At 5%, deliverability degradation is likely and inbox placement drops noticeably. At 8%+, blacklisting risk becomes significant. At 10%+, domain damage is almost certain. These thresholds are per-domain, not per-campaign. One bad campaign sending to a list with 12% invalid addresses can push an entire domain past the danger threshold in a single afternoon."
                }
            },
            {
                "@type": "Question",
                "name": "What is the difference between domain reputation and IP reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Domain reputation is tied to your sending domain (e.g., outreach.yourcompany.com) and follows the domain regardless of which IP or server sends the email. IP reputation is tied to the server IP address that physically transmits the email. For cold email senders using platforms like Smartlead or Instantly, you typically share IP addresses with other senders. This means domain reputation is more within your control and more impactful to your deliverability than IP reputation."
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
                    How to check your domain reputation for cold email (2026 guide)
                </h1>
                <p className="text-gray-400 text-sm mb-8">14 min read · Published April 2026</p>

                <p className="text-xl text-blue-900 font-medium mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    Your domain reputation determines whether your cold emails land in the inbox or disappear into spam. The problem is that reputation is invisible until it breaks. Here is how to actually check it, which tools matter, and what to do when the numbers look bad.
                </p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Domain reputation is ISP-specific. Google, Microsoft, and Yahoo each maintain separate scores for your domain</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Google Postmaster Tools is the most important tool because ~70% of B2B addresses use Gmail or Google Workspace</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Free tools show you yesterday&apos;s reputation. Real-time monitoring catches problems before ISP dashboards update</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> &quot;Bad&quot; reputation in Google Postmaster means sub-10% inbox placement at Gmail. Recovery takes 2-8 weeks</li>
                    </ul>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Table of Contents</h2>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
                        <li><a href="#what-domain-reputation-is" style={{ color: '#2563EB', textDecoration: 'none' }}>What domain reputation actually is</a></li>
                        <li><a href="#what-isps-evaluate" style={{ color: '#2563EB', textDecoration: 'none' }}>What ISPs evaluate when scoring your domain</a></li>
                        <li><a href="#six-tools" style={{ color: '#2563EB', textDecoration: 'none' }}>6 tools to check domain reputation</a></li>
                        <li><a href="#tools-compared" style={{ color: '#2563EB', textDecoration: 'none' }}>Tools compared: which one to trust</a></li>
                        <li><a href="#bad-reputation-fix" style={{ color: '#2563EB', textDecoration: 'none' }}>Google Postmaster shows bad reputation — now what</a></li>
                        <li><a href="#reactive-vs-realtime" style={{ color: '#2563EB', textDecoration: 'none' }}>Reactive checking vs real-time monitoring</a></li>
                    </ol>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        Most cold email senders check domain reputation the same way: something breaks, reply rates drop, and then they scramble to figure out what went wrong. They open Google Postmaster Tools for the first time in weeks, see a &quot;Low&quot; or &quot;Bad&quot; rating, and start panicking. By that point the damage has been compounding for days. The real question is not just how to check reputation. It is how to build a monitoring system that catches drops before they become crises.
                    </p>

                    {/* Section 1 */}
                    <h2 id="what-domain-reputation-is" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What domain reputation actually is</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Domain reputation is a trust score that every major ISP calculates independently for every domain that sends email. There is no single, universal &quot;domain reputation score.&quot; Google maintains one model. Microsoft has another. Yahoo, AOL, and smaller providers each track their own version.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        This distinction matters more than most senders realize. Your domain might have &quot;High&quot; reputation at Gmail, &quot;Medium&quot; at Outlook, and be borderline blacklisted at Yahoo. If your prospect list is 60% Gmail and 30% Outlook, the Gmail score matters most for overall campaign performance. But that 30% Outlook segment is still seeing your emails routed to junk.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Domain reputation is also distinct from IP reputation. IP reputation attaches to the server that physically sends the email. Domain reputation attaches to the domain in the From address. For cold email senders using Smartlead or Instantly, you share IP addresses with other senders. Your domain reputation is what you control. It is what ISPs weight most heavily in 2026.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Google shifted to domain-based reputation as the primary signal back in 2024. Microsoft followed. The implication for cold email operations: your sending domain is the asset. Protecting its reputation is protecting your pipeline. For deeper context on how reputation builds and degrades over time, see our <Link href="/blog/email-reputation-lifecycle" className="text-blue-600 hover:text-blue-800 underline">email reputation lifecycle guide</Link>.
                    </p>

                    {/* Section 2 */}
                    <h2 id="what-isps-evaluate" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What ISPs evaluate when scoring your domain</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        ISPs do not publish their exact algorithms. But based on Google&apos;s documentation, Microsoft&apos;s SNDS data, and observable behavior patterns across thousands of sending domains, six factors consistently determine reputation.
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">1</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Bounce rate</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    The single heaviest signal. Hard bounces tell ISPs you are sending to addresses that do not exist, which is a hallmark of purchased or scraped lists. Keep this under 2% to maintain healthy reputation. At 5%+, deliverability starts degrading visibly. At 8%+, blacklisting becomes likely. More on this in our <Link href="/blog/cold-email-bounce-rate-thresholds" className="text-blue-600 hover:text-blue-800 underline">bounce rate thresholds guide</Link>.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">2</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Spam complaint rate</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    When recipients hit &quot;Report Spam,&quot; that signal goes directly to the ISP. Google publicly states that spam rates above 0.3% trigger warnings. Above 0.5% and deliverability drops sharply. For cold email, keeping complaints below 0.1% is the target. Relevance and personalization in your copy are the main levers here.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">3</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Authentication (SPF, DKIM, DMARC)</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Missing or misconfigured authentication is an immediate red flag. SPF tells ISPs which servers can send on behalf of your domain. DKIM provides a cryptographic signature proving the email was not altered. DMARC ties them together and specifies what to do with failures. All three are required for credible cold email in 2026. See our <Link href="/blog/spf-dkim-dmarc-explained" className="text-blue-600 hover:text-blue-800 underline">SPF, DKIM, and DMARC guide</Link> for configuration details.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">4</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Engagement signals</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Opens, replies, and clicks tell ISPs that recipients want your email. Low engagement across a sending domain signals irrelevance. Gmail weighs engagement particularly heavily — if recipients consistently ignore or delete your emails without reading them, reputation degrades even without bounces or complaints.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">5</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Sending volume and patterns</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Sudden volume spikes trigger ISP scrutiny. A domain that sends 50 emails per day and suddenly sends 500 looks suspicious regardless of list quality. ISPs expect gradual, consistent volume increases. This is why domain warming exists and why ramping too fast after a pause is dangerous.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">6</span>
                            <div>
                                <h3 className="font-bold text-gray-900 mb-1">Blacklist presence</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    Being listed on major blacklists (Spamhaus, Spamcop, Barracuda) is a severe negative signal. Some ISPs check blacklists directly as part of their filtering. Others use them as one input among many. Either way, a Spamhaus listing is effectively a death sentence for inbox placement until you get delisted.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <h2 id="six-tools" className="text-2xl font-bold text-gray-900 mt-12 mb-4">6 tools to check domain reputation</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        No single tool gives you the complete picture. Each one covers a different ISP or a different aspect of reputation. Here is what each tool actually tells you and where it falls short.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">1. Google Postmaster Tools</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            The most important tool for cold email senders. Period. Google Postmaster shows your domain reputation at Gmail and Google Workspace on a four-tier scale: High, Medium, Low, Bad. It also reports spam rate, IP reputation, authentication success rates, and delivery errors. Since roughly 70% of B2B email addresses are on Google&apos;s infrastructure, this is where reputation matters most.
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            <strong>Limitation:</strong> Data is delayed 24-48 hours. You are seeing yesterday&apos;s reputation, not what is happening right now. It also requires minimum sending volume to display data — if you send fewer than ~100 emails per day to Gmail, the dashboard stays blank. And it only covers Gmail. Your Outlook reputation is invisible here.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">2. Microsoft SNDS (Smart Network Data Services)</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            Microsoft&apos;s equivalent for Outlook, Hotmail, and Live.com. Shows spam complaint rates, trap hits, and IP reputation for mail sent to Microsoft addresses. Less granular than Google Postmaster — it reports at the IP level, not the domain level — but essential if any meaningful portion of your list uses Outlook.
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            <strong>Limitation:</strong> Requires IP-level access, which is tricky for cold email senders on shared infrastructure. If you send through Smartlead or Instantly, you may not control the IPs. Reports are also IP-based, so if you share an IP with other senders, the data blends your behavior with theirs.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">3. MXToolbox</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            The go-to blacklist checker. MXToolbox scans your domain and IP against 100+ blacklists simultaneously. It also checks DNS records (SPF, DKIM, DMARC, MX), tests SMTP connectivity, and provides a general deliverability overview. The blacklist check is what most people use it for — it answers the question &quot;am I listed anywhere?&quot; in one search.
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            <strong>Limitation:</strong> No ISP-specific reputation data. MXToolbox tells you if you are blacklisted, but it does not tell you what Google or Microsoft thinks of your domain. It is a diagnostic tool, not a reputation dashboard. The free tier also limits the number of checks per day.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">4. Sender Score (Validity)</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            A 0-100 score for your sending IP address, maintained by Validity (formerly Return Path). A score above 80 is considered good. Below 70 and you will likely see deliverability issues. It is widely cited in email marketing contexts and gives a quick gut-check on IP health.
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            <strong>Limitation:</strong> Scores IP reputation, not domain reputation. For cold email senders on shared IPs (which is most of you), Sender Score reflects the aggregate behavior of everyone on that IP, not just your domain. It also updates weekly at best. And in practice, the score often does not correlate well with actual inbox placement at specific ISPs.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">5. Talos Intelligence (Cisco)</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            Cisco&apos;s threat intelligence platform that rates domains and IPs on a three-tier scale: Good, Neutral, Poor. It draws on data from Cisco&apos;s massive email filtering network. Useful as a cross-reference — if Talos says &quot;Poor&quot; while Google Postmaster says &quot;Medium,&quot; you have a broader problem than just one ISP.
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            <strong>Limitation:</strong> Limited granularity (only three tiers) and no actionable diagnostics. It tells you if there is a problem but not what is causing it. Also skewed toward enterprise email filtering — many corporate mail servers use Cisco&apos;s IronPort, so this score matters for enterprise prospects.
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-2">6. Barracuda Reputation</h3>
                        <p className="text-gray-600 text-sm leading-relaxed mb-3">
                            Barracuda maintains its own reputation database used by its email security appliances. Many mid-market companies use Barracuda for spam filtering. If your domain is flagged by Barracuda, your emails to companies using Barracuda hardware get filtered. Checking this is particularly important for B2B outreach to mid-market.
                        </p>
                        <p className="text-gray-600 text-sm leading-relaxed">
                            <strong>Limitation:</strong> Only relevant for recipients behind Barracuda hardware. If your target market is SMBs on Gmail, Barracuda reputation does not matter much. But if you target mid-market or enterprise companies with on-premise email infrastructure, Barracuda and Cisco filtering are the gatekeepers.
                        </p>
                    </div>

                    {/* Comparison Table */}
                    <h2 id="tools-compared" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Tools compared: which one to trust</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Here is a side-by-side comparison of all six tools. The &quot;Cold email relevant?&quot; column is the one that matters most for outbound teams.
                    </p>

                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Tool</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">What it checks</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Free?</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Cold email relevant?</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Key limitation</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">Google Postmaster</td>
                                    <td className="px-4 py-3 text-gray-600">Domain reputation, spam rate, auth, delivery errors at Gmail</td>
                                    <td className="px-4 py-3 text-gray-600">Yes</td>
                                    <td className="px-4 py-3 text-green-700 font-medium">Essential</td>
                                    <td className="px-4 py-3 text-gray-600">24-48h delay, Gmail only, needs 100+ daily sends</td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">Microsoft SNDS</td>
                                    <td className="px-4 py-3 text-gray-600">Spam complaints, trap hits, IP reputation at Outlook</td>
                                    <td className="px-4 py-3 text-gray-600">Yes</td>
                                    <td className="px-4 py-3 text-green-700 font-medium">High</td>
                                    <td className="px-4 py-3 text-gray-600">IP-based (not domain), hard to use on shared IPs</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">MXToolbox</td>
                                    <td className="px-4 py-3 text-gray-600">100+ blacklists, DNS records, SMTP health</td>
                                    <td className="px-4 py-3 text-gray-600">Freemium</td>
                                    <td className="px-4 py-3 text-green-700 font-medium">High</td>
                                    <td className="px-4 py-3 text-gray-600">No ISP-specific reputation, limited free checks</td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">Sender Score</td>
                                    <td className="px-4 py-3 text-gray-600">IP reputation (0-100 scale)</td>
                                    <td className="px-4 py-3 text-gray-600">Yes</td>
                                    <td className="px-4 py-3 text-yellow-700 font-medium">Low-Medium</td>
                                    <td className="px-4 py-3 text-gray-600">IP-based, shared IPs skew results, weekly updates</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">Talos Intelligence</td>
                                    <td className="px-4 py-3 text-gray-600">Domain/IP reputation (Good/Neutral/Poor)</td>
                                    <td className="px-4 py-3 text-gray-600">Yes</td>
                                    <td className="px-4 py-3 text-yellow-700 font-medium">Medium</td>
                                    <td className="px-4 py-3 text-gray-600">Only 3 tiers, no diagnostics, enterprise-skewed</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">Barracuda</td>
                                    <td className="px-4 py-3 text-gray-600">Domain/IP reputation for Barracuda-filtered recipients</td>
                                    <td className="px-4 py-3 text-gray-600">Yes</td>
                                    <td className="px-4 py-3 text-yellow-700 font-medium">Medium</td>
                                    <td className="px-4 py-3 text-gray-600">Only matters for recipients behind Barracuda hardware</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The practical priority for cold email senders: start with Google Postmaster Tools. If you send to any meaningful Outlook audience, add Microsoft SNDS. Use MXToolbox for blacklist monitoring. The other three are useful cross-references but not essential for day-to-day monitoring.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The deeper problem is that even the best combination of these free tools gives you a fragmented, delayed view. You are checking six different dashboards, manually, and the data is always at least a day old. For operations running 10+ mailboxes across multiple domains, this manual checking process breaks down fast. For a comparison of how monitoring tools stack up, see our <Link href="/blog/superkabe-vs-manual-monitoring" className="text-blue-600 hover:text-blue-800 underline">Superkabe vs manual monitoring comparison</Link>.
                    </p>

                    {/* Section 4 */}
                    <h2 id="bad-reputation-fix" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Google Postmaster shows bad reputation — now what</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        &quot;Bad&quot; is the lowest tier on Google Postmaster&apos;s four-level scale. If you are seeing this, Gmail is routing the vast majority of your emails to spam for all Gmail and Google Workspace recipients. Your inbox placement rate at Gmail is likely below 10%. This is not a minor issue. It means your domain is essentially blocked at Gmail.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Here is the step-by-step process to address it:
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">1</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Stop all outbound from the affected domain immediately</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Not &quot;reduce volume.&quot; Stop. Every email you send from a domain with &quot;Bad&quot; reputation compounds the damage. Pause every campaign using mailboxes on that domain. If you are on Smartlead or Instantly, deactivate those mailboxes in the platform. Continue sending only from healthy domains while you recover this one.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">2</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Identify the cause</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Check Google Postmaster for the specific metrics that degraded. High spam rate? High bounce rate? Authentication failures? Check MXToolbox for blacklists. Verify DNS records are intact (SPF, DKIM, DMARC). Review the campaigns that were running when reputation dropped — usually one specific campaign or list is the culprit.
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">3</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Fix the root cause</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        If bounces caused it: clean your list, add email validation before sending, remove the bad addresses. If spam complaints caused it: rewrite your copy, tighten targeting, make sure your unsubscribe link works. If DNS failed: fix the records and verify them. If blacklisted: submit removal requests (most blacklists have self-service removal). Do not skip this step — if you restart sending without fixing the cause, you will end up right back at &quot;Bad.&quot;
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">4</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Wait for ISP reputation reset</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Google takes 2-4 weeks to reassess domain reputation after you stop the problematic behavior. There is no way to speed this up. No form to fill out. No support ticket to file. The only accelerator is time with zero negative signals. During this period, send nothing from the domain or send only to highly engaged contacts (people who have replied positively before).
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <div className="flex items-start gap-3">
                                <span className="w-8 h-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">5</span>
                                <div>
                                    <h3 className="font-bold text-gray-900 mb-2">Re-warm gradually</h3>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        Once Postmaster shows improvement (Low to Medium, or Medium to High), restart sending at 10-20% of your previous volume. Increase by 20-25% per week if metrics stay clean. Full volume recovery takes 4-6 weeks from the restart point. Going too fast triggers the same ISP scrutiny that damaged you in the first place. For detailed recovery timelines, see our <Link href="/blog/domain-reputation-recovery-guide" className="text-blue-600 hover:text-blue-800 underline">domain reputation recovery playbook</Link>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <h2 id="reactive-vs-realtime" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Reactive checking vs real-time monitoring</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Everything I have described so far is reactive. You open a dashboard, check a number, and respond to what you find. This is fine at small scale — 2-3 domains, 5-10 mailboxes. You can keep up by spending 10-15 minutes per day checking dashboards.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The problem is timing. Google Postmaster data is 24-48 hours old. MXToolbox blacklist checks are point-in-time snapshots. By the time you see &quot;Bad&quot; reputation in Google Postmaster, the damage happened two days ago and has been compounding since. In cold email, two days of compounding damage can turn a recoverable situation into a burned domain.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Consider a real scenario: you push a batch of 3,000 leads from Clay into a campaign across 6 mailboxes on 2 domains. The list has an 8% invalid rate — 240 bad addresses. Those bounces hit over the first 12 hours of sending. By hour 6, both domains have crossed the 2% bounce threshold. By hour 12, one domain is at 5%. You check Google Postmaster the next morning and see... nothing, because the data has not updated yet. You check 48 hours later and see &quot;Low.&quot; By then, the domain has been sending at a degraded reputation for two full days.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Real-time monitoring flips this model. Instead of checking ISP dashboards after the fact, you track the leading indicators: bounce events, complaint signals, and sending velocity as they happen. When a mailbox hits 3 bounces in a window, it gets flagged. At 5 bounces, it pauses automatically. The domain never crosses the danger threshold because the problematic mailbox was stopped within minutes, not days.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Superkabe monitors every mailbox and domain every 60 seconds. When bounce rate crosses a configurable threshold, the affected mailbox auto-pauses directly in Smartlead or Instantly. No manual checking. No 48-hour delay. The domain stays protected because the system caught the problem before ISPs could register sustained damage. See how this works in our <Link href="/docs/monitoring" className="text-blue-600 hover:text-blue-800 underline">monitoring documentation</Link>.
                    </p>

                    <div className="overflow-x-auto mb-8">
                        <table className="min-w-full text-sm border border-gray-200 rounded-xl overflow-hidden">
                            <thead>
                                <tr className="bg-gray-50">
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Aspect</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Manual checking</th>
                                    <th className="text-left px-4 py-3 font-semibold text-gray-900 border-b border-gray-200">Real-time monitoring</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">Detection speed</td>
                                    <td className="px-4 py-3 text-gray-600">24-48 hours (ISP dashboard delay)</td>
                                    <td className="px-4 py-3 text-gray-600">Under 60 seconds</td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">Response action</td>
                                    <td className="px-4 py-3 text-gray-600">Human reviews, decides, manually pauses</td>
                                    <td className="px-4 py-3 text-gray-600">Auto-pause at threshold</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="px-4 py-3 font-medium text-gray-900">Damage window</td>
                                    <td className="px-4 py-3 text-gray-600">2-7 days of compounding</td>
                                    <td className="px-4 py-3 text-gray-600">Minutes</td>
                                </tr>
                                <tr className="border-b border-gray-100 bg-gray-50/50">
                                    <td className="px-4 py-3 font-medium text-gray-900">Scalability</td>
                                    <td className="px-4 py-3 text-gray-600">Breaks at 10+ domains</td>
                                    <td className="px-4 py-3 text-gray-600">Handles 200+ mailboxes</td>
                                </tr>
                                <tr>
                                    <td className="px-4 py-3 font-medium text-gray-900">Cost of failure</td>
                                    <td className="px-4 py-3 text-gray-600">Burned domain, 4-8 week recovery</td>
                                    <td className="px-4 py-3 text-gray-600">Paused mailbox, resume same day</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The free tools I listed above are still useful. Google Postmaster is the source of truth for Gmail reputation. MXToolbox catches blacklisting. But they are confirmation tools, not protection tools. By the time they show a problem, the damage is done. Real-time monitoring prevents the damage from happening in the first place.
                    </p>
                </div>

                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">How Superkabe monitors domain reputation</h2>
                    <p className="text-gray-600 leading-relaxed max-w-3xl">
                        Superkabe tracks bounce rates, complaint signals, and sending patterns across every mailbox and domain in real time. When thresholds are crossed, it auto-pauses the affected mailbox directly in your sending platform. No manual dashboard checking. No 48-hour delays. Built for teams running cold outbound on Smartlead and Instantly who need to protect their domains while scaling.
                    </p>
                </div>
            </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/blog/spf-dkim-dmarc-explained" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">SPF, DKIM, and DMARC Explained</h3>
                        <p className="text-gray-500 text-xs">Email authentication protocols for cold email</p>
                    </Link>
                    <Link href="/blog/cold-email-bounce-rate-thresholds" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Cold Email Bounce Rate Thresholds</h3>
                        <p className="text-gray-500 text-xs">The exact numbers where ISPs start penalizing</p>
                    </Link>
                    <Link href="/blog/superkabe-vs-manual-monitoring" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Superkabe vs Manual Monitoring</h3>
                        <p className="text-gray-500 text-xs">Why manual reputation checking breaks at scale</p>
                    </Link>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">See how Superkabe protects your infrastructure</Link>
                </div>
            </section>
        </>
    );
}
