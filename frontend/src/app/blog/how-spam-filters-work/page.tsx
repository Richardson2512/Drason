import Link from 'next/link';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'How spam filters work and how they affect email deliverability',
    description: 'Technical breakdown of how ISP spam filters evaluate outbound emails, content-level triggers that cause filtering, and proven strategies for avoiding spam folders.',
    openGraph: {
        title: 'How spam filters work and how they affect email deliverability',
        description: 'How ISP spam filters score inbound email, what triggers filtering for outbound teams, and how to avoid the spam folder without sacrificing personalization.',
        type: 'article',
        publishedTime: '2026-02-27',
    },
    alternates: {
        canonical: '/blog/how-spam-filters-work',
    },
};

export default function HowSpamFiltersWorkArticle() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "How spam filters work and how they affect email deliverability",
        "description": "How ISP spam filters score inbound email, what triggers filtering for outbound teams, and how to avoid the spam folder without sacrificing personalization.",
        "author": {
            "@type": "Organization",
            "name": "Superkabe"
        },
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com"
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/blog/how-spam-filters-work"
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How do spam filters affect email deliverability?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Spam filters evaluate every inbound email across multiple layers: sender reputation, DNS authentication, content analysis, and engagement history. When a filter flags an email, it is either routed to the spam folder or rejected entirely. For outbound teams, even a small percentage of spam-filtered emails degrades domain reputation over time, reducing inbox placement for all future sends from that domain."
                }
            },
            {
                "@type": "Question",
                "name": "What are the best practices for avoiding spam filters?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Configure SPF, DKIM, and DMARC on every sending domain. Keep bounce rates below 2%. Avoid spam trigger words in subject lines and body copy. Warm new domains gradually over 6-8 weeks. Maintain consistent sending volume without spikes. Verify lead lists before sending. Monitor sender reputation and pause sending when scores drop. Use plain-text or minimal HTML formatting."
                }
            },
            {
                "@type": "Question",
                "name": "What content triggers spam filters in cold outbound emails?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Common content triggers include excessive capitalization, spam-associated phrases ('act now', 'limited time', 'free'), too many links or images, URL shorteners, hidden text, large attachments, and HTML-heavy templates. For cold outbound specifically, generic non-personalized content and identical messages sent to many recipients increase spam filter scoring."
                }
            },
            {
                "@type": "Question",
                "name": "Do Gmail and Outlook use different spam filters?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Gmail uses a machine learning model that heavily weights engagement signals (opens, replies, time in inbox) and sender reputation. Microsoft Outlook/365 relies more on IP reputation, authentication checks, and its SmartScreen filter. Yahoo prioritizes DMARC compliance and complaint rates. Each ISP applies different thresholds, so an email that passes Gmail's filter may still be caught by Outlook's."
                }
            },
            {
                "@type": "Question",
                "name": "How does Superkabe help prevent spam filtering?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Superkabe prevents spam filtering indirectly by protecting the infrastructure signals that spam filters evaluate. It monitors bounce rates, DNS authentication status, and mailbox health in real time. When any metric approaches dangerous thresholds, Superkabe auto-pauses affected mailboxes and gates domain traffic — preventing the reputation damage that causes spam filters to flag future emails."
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
                    How spam filters work and how they affect email deliverability
                </h1>
                <p className="text-gray-400 text-sm mb-8">12 min read &middot; Updated February 2026</p>

                <p className="text-xl text-blue-900 font-medium mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    This guide answers two critical questions from outbound teams: &quot;How do spam filters actually decide what goes to spam?&quot; and &quot;What can I do to avoid them without compromising my outreach?&quot;
                </p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Spam filters operate in layers: connection, authentication, content, and engagement</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Infrastructure signals (reputation, DNS) matter more than content for cold outbound</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Gmail, Outlook, and Yahoo each use different filtering models and thresholds</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Content triggers compound — one flag may pass, but three together trigger spam routing</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">&#9656;</span> Avoiding spam filters starts with infrastructure protection, not just better copy</li>
                    </ul>
                </div>

                {/* Table of Contents */}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 mb-16 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-4 text-lg">Table of Contents</h2>
                    <nav className="space-y-2 text-sm">
                        <a href="#how-do-spam-filters-evaluate-email" className="block text-blue-600 hover:text-blue-800 transition-colors">1. How Do Spam Filters Evaluate Email?</a>
                        <a href="#what-are-the-four-layers-of-spam-filtering" className="block text-blue-600 hover:text-blue-800 transition-colors">2. What Are the Four Layers of Spam Filtering?</a>
                        <a href="#how-do-spam-filters-affect-email-deliverability" className="block text-blue-600 hover:text-blue-800 transition-colors">3. How Do Spam Filters Affect Email Deliverability?</a>
                        <a href="#how-do-isp-specific-spam-filters-behave" className="block text-blue-600 hover:text-blue-800 transition-colors">4. How Do ISP-Specific Spam Filters Behave?</a>
                        <a href="#what-are-the-common-content-level-spam-triggers" className="block text-blue-600 hover:text-blue-800 transition-colors">5. What Are the Common Content-Level Spam Triggers?</a>
                        <a href="#what-are-the-best-practices-for-avoiding-spam-filters" className="block text-blue-600 hover:text-blue-800 transition-colors">6. What Are the Best Practices for Avoiding Spam Filters?</a>
                        <a href="#infrastructure-vs-content" className="block text-blue-600 hover:text-blue-800 transition-colors">7. Infrastructure vs. Content: What Matters More?</a>
                        <a href="#faq" className="block text-blue-600 hover:text-blue-800 transition-colors">8. Frequently Asked Questions</a>
                    </nav>
                </div>

                <div className="prose prose-lg max-w-none">

                    {/* Section 1 */}
                    <h2 id="how-do-spam-filters-evaluate-email" className="text-2xl font-bold text-gray-900 mt-16 mb-4">1. How Do Spam Filters Evaluate Email?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Every email that arrives at a recipient&apos;s mail server is evaluated by a spam filter before it reaches the inbox. The filter assigns a spam score based on dozens of signals — if the score exceeds a threshold, the email is routed to spam or rejected entirely. For outbound teams, understanding what drives this score is the difference between landing in the inbox and being silently filtered.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Spam filters are not single-pass systems. They operate as multi-layered pipelines, where each layer adds to or subtracts from the cumulative spam score. An email that passes the connection layer can still fail at the content layer. An email with perfect content can still be flagged because the sending domain has a damaged reputation. The layers are cumulative, and the final score determines placement.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Modern ISP filters (Gmail, Microsoft, Yahoo) have evolved far beyond simple keyword matching. They use machine learning models trained on billions of emails, incorporating behavioral signals like recipient engagement, sending patterns, and historical domain performance. This means there is no single trick to &quot;beat&quot; spam filters — sustainable inbox placement requires getting every layer right.
                    </p>

                    {/* Section 2 */}
                    <h2 id="what-are-the-four-layers-of-spam-filtering" className="text-2xl font-bold text-gray-900 mt-16 mb-4">2. What Are the Four Layers of Spam Filtering?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Spam filters process emails through four distinct layers, each evaluating different aspects of the message and sender. Understanding each layer is essential for diagnosing why emails are being filtered.
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Layer 1: Connection Filtering</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                Before the email content is even examined, the receiving server evaluates the connection itself. It checks the sending IP address against real-time blacklists (RBLs), verifies reverse DNS (rDNS) records, and assesses the IP&apos;s historical sending reputation.
                            </p>
                            <ul className="space-y-1 text-gray-500 text-sm">
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> IP blacklist checks (Spamhaus, Barracuda, SORBS)</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Reverse DNS verification</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> IP sending volume history and patterns</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Connection rate limiting (too many connections = suspicious)</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Layer 2: Authentication Filtering</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                The server verifies that the sender is authorized to send on behalf of the claimed domain. This layer checks SPF (which IPs can send for this domain), DKIM (whether the email signature is valid and unaltered), and DMARC (the domain owner&apos;s policy for authentication failures).
                            </p>
                            <ul className="space-y-1 text-gray-500 text-sm">
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> SPF record lookup and IP verification</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> DKIM signature validation</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> DMARC policy enforcement (none, quarantine, reject)</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Authentication failure = immediate spam routing or rejection</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Layer 3: Content Filtering</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                The filter analyzes the email&apos;s subject line, body text, HTML structure, links, images, and attachments. It applies Bayesian classification, regex pattern matching, and ML-based scoring to identify spam characteristics.
                            </p>
                            <ul className="space-y-1 text-gray-500 text-sm">
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Subject line keyword and pattern analysis</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Body content scoring (Bayesian + ML)</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Link analysis (domains, URL shorteners, redirects)</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> HTML-to-text ratio, image-to-text ratio</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Layer 4: Engagement and Reputation Filtering</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                The most powerful layer in modern filtering. ISPs track how recipients interact with emails from each sender: opens, replies, deletions, spam complaints, and time spent reading. This data trains per-sender models that predict whether future emails will be wanted.
                            </p>
                            <ul className="space-y-1 text-gray-500 text-sm">
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Historical open and reply rates per sender domain</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Spam complaint rate (&gt; 0.3% = dangerous)</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Unsubscribe rate and list hygiene signals</li>
                                <li className="flex items-start gap-2"><span className="text-gray-400 mt-1">&bull;</span> Recipient-level filtering (user-specific spam models)</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 3 */}
                    <h2 id="how-do-spam-filters-affect-email-deliverability" className="text-2xl font-bold text-gray-900 mt-16 mb-4">3. How Do Spam Filters Affect Email Deliverability?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Spam filters do not just block individual emails — they create feedback loops that progressively degrade deliverability for the entire sending domain. Understanding this compounding effect is critical for outbound teams operating at scale.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Stage</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">What Happens</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Impact on Deliverability</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Initial filtering</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Individual emails routed to spam</td>
                                    <td className="py-4 px-6 text-yellow-600 text-sm">Low engagement signals recorded</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Reputation erosion</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">ISP lowers domain reputation score</td>
                                    <td className="py-4 px-6 text-orange-600 text-sm">More emails from domain routed to spam</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Feedback loop</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Spam-routed emails get zero engagement</td>
                                    <td className="py-4 px-6 text-orange-600 text-sm">Reputation drops further</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Domain penalty</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">ISP applies domain-wide throttling or rejection</td>
                                    <td className="py-4 px-6 text-red-600 text-sm">All mailboxes on domain affected</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The critical point: spam filtering is not a per-email problem — it is a per-domain problem. When one mailbox&apos;s emails are consistently filtered, the reputation damage spreads to every mailbox on that domain. This is why a single poorly targeted campaign can compromise an entire sending operation.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        For cold outbound teams, the risk is amplified. Cold emails inherently generate lower engagement than opted-in marketing emails. ISPs know this. Domains sending cold outbound start with a tighter margin of error — any additional negative signal (bounce, complaint, or content flag) pushes the domain into spam territory faster.
                    </p>

                    {/* Section 4 */}
                    <h2 id="how-do-isp-specific-spam-filters-behave" className="text-2xl font-bold text-gray-900 mt-16 mb-4">4. How Do ISP-Specific Spam Filters Behave?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Each major ISP implements its own spam filtering model with different weights and thresholds. An email that reaches Gmail&apos;s inbox may land in Outlook&apos;s spam folder — and vice versa. Understanding these differences allows outbound teams to diagnose ISP-specific deliverability issues.
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Google Gmail</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                Gmail uses a neural network-based filtering system that heavily weights engagement signals. Emails that recipients open, reply to, and spend time reading build positive domain reputation. Gmail also uses category tabs (Primary, Promotions, Social) as a pre-filter — landing in Promotions is not spam, but significantly reduces visibility.
                            </p>
                            <ul className="space-y-1 text-gray-500 text-sm">
                                <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&bull;</span> Engagement-weighted: opens and replies matter most</li>
                                <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&bull;</span> Requires DMARC since February 2024 for bulk senders</li>
                                <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&bull;</span> User-level models: each recipient has personalized filtering</li>
                                <li className="flex items-start gap-2"><span className="text-blue-500 mt-1">&bull;</span> Postmaster Tools available for reputation monitoring</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Microsoft Outlook / Office 365</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                Microsoft uses its SmartScreen filter combined with IP-based reputation scoring. Outlook weighs IP reputation more heavily than Gmail does, making shared sending IPs riskier. Microsoft also uses its Junk Email Reporting Program (JMRP) to track spam complaints.
                            </p>
                            <ul className="space-y-1 text-gray-500 text-sm">
                                <li className="flex items-start gap-2"><span className="text-purple-500 mt-1">&bull;</span> IP reputation-weighted: shared IPs carry cross-sender risk</li>
                                <li className="flex items-start gap-2"><span className="text-purple-500 mt-1">&bull;</span> SmartScreen content analysis (proprietary ML model)</li>
                                <li className="flex items-start gap-2"><span className="text-purple-500 mt-1">&bull;</span> Strict HTML filtering — heavy formatting triggers flags</li>
                                <li className="flex items-start gap-2"><span className="text-purple-500 mt-1">&bull;</span> SNDS (Smart Network Data Services) for reputation monitoring</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Yahoo / AOL</h3>
                            <p className="text-gray-600 text-sm leading-relaxed mb-3">
                                Yahoo (which also handles AOL email) prioritizes DMARC compliance and complaint rates. Yahoo was the first major ISP to enforce strict DMARC policies and requires one-click unsubscribe headers for bulk senders.
                            </p>
                            <ul className="space-y-1 text-gray-500 text-sm">
                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">&bull;</span> DMARC-first: strict enforcement since early 2024</li>
                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">&bull;</span> Complaint rate threshold: 0.3% triggers filtering</li>
                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">&bull;</span> Requires List-Unsubscribe header for bulk email</li>
                                <li className="flex items-start gap-2"><span className="text-red-500 mt-1">&bull;</span> CFL (Complaint Feedback Loop) available for monitoring</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 5 */}
                    <h2 id="what-are-the-common-content-level-spam-triggers" className="text-2xl font-bold text-gray-900 mt-16 mb-4">5. What Are the Common Content-Level Spam Triggers?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        While infrastructure signals (reputation, authentication) carry more weight than content for determining inbox placement, content-level triggers still contribute to the cumulative spam score. For cold outbound emails that already operate on thin margins, content flags can be the difference between inbox and spam.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Trigger Category</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Examples</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Risk Level</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Spam phrases</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">&quot;Act now&quot;, &quot;Limited time&quot;, &quot;Free trial&quot;, &quot;Guaranteed&quot;</td>
                                    <td className="py-4 px-6 text-yellow-600 font-semibold text-sm">Medium</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Formatting abuse</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">ALL CAPS, excessive punctuation!!!, colored/large fonts</td>
                                    <td className="py-4 px-6 text-orange-600 font-semibold text-sm">High</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Link manipulation</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">URL shorteners, too many links, mismatched anchor text</td>
                                    <td className="py-4 px-6 text-red-600 font-semibold text-sm">Very high</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">HTML issues</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Image-only emails, broken HTML, hidden text</td>
                                    <td className="py-4 px-6 text-red-600 font-semibold text-sm">Very high</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Identical content</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Same message to many recipients, no personalization</td>
                                    <td className="py-4 px-6 text-orange-600 font-semibold text-sm">High</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        An important nuance: individual content triggers rarely cause spam filtering on their own. Spam filters use weighted scoring, where each trigger adds points. An email with one minor flag may pass. An email with three minor flags likely gets filtered. This is why outbound teams should eliminate as many content triggers as possible — each one narrows the margin.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        For cold outbound specifically, the safest approach is plain-text formatting with 1-2 links maximum, personalized opening lines, and short body copy (under 150 words). Heavy HTML templates that work for marketing emails are a liability for cold outbound because they trigger content filters while providing zero engagement advantage.
                    </p>

                    {/* Section 6 */}
                    <h2 id="what-are-the-best-practices-for-avoiding-spam-filters" className="text-2xl font-bold text-gray-900 mt-16 mb-4">6. What Are the Best Practices for Avoiding Spam Filters?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        Avoiding spam filters is not about tricks or workarounds — it is about building and maintaining the signals that filters use to identify legitimate email. Here are the proven practices that keep outbound teams in the inbox.
                    </p>

                    <div className="space-y-4 mb-8">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Infrastructure Best Practices</h3>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Configure SPF, DKIM, and DMARC</strong> on every sending domain — not optional since 2024</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Keep bounce rates below 2%</strong> — verify lead lists before importing into campaigns</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Warm new domains gradually</strong> over 6-8 weeks before reaching full send volume</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Maintain consistent volume</strong> — avoid sudden spikes that trigger ISP anomaly detection</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Monitor sender reputation</strong> via Google Postmaster Tools and Microsoft SNDS</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Content Best Practices</h3>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Use plain-text or minimal HTML</strong> — avoid image-heavy templates for cold outbound</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Personalize every email</strong> — unique opening lines reduce &quot;identical content&quot; scoring</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Limit links to 1-2</strong> — each additional link increases content filter scoring</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Avoid spam-associated phrases</strong> in subject lines and body copy</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Keep subject lines under 50 characters</strong> — long subjects correlate with higher spam scores</li>
                            </ul>
                        </div>

                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">List Hygiene Best Practices</h3>
                            <ul className="space-y-2 text-gray-600 text-sm">
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Verify all email addresses</strong> before importing — remove catch-all, disposable, and role-based addresses</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Remove bounced addresses immediately</strong> — never retry hard bounces</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Segment by engagement</strong> — separate active responders from non-engagers</li>
                                <li className="flex items-start gap-2"><span className="text-green-500 mt-1">&bull;</span> <strong>Refresh lead data regularly</strong> — email addresses decay at 2-3% per month</li>
                            </ul>
                        </div>
                    </div>

                    {/* Section 7 */}
                    <h2 id="infrastructure-vs-content" className="text-2xl font-bold text-gray-900 mt-16 mb-4">7. Infrastructure vs. Content: What Matters More?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        A common misconception in outbound email is that deliverability problems are primarily caused by email content — that writing better copy or avoiding certain words will fix spam placement. In reality, for cold outbound teams, infrastructure signals account for roughly 70-80% of the spam filtering decision, while content accounts for 20-30%.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden mb-8 shadow-sm">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-100 bg-gray-50">
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Signal Type</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Approximate Weight</th>
                                    <th className="py-4 px-6 font-bold text-gray-900 text-sm">Examples</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Sender reputation</td>
                                    <td className="py-4 px-6 text-blue-600 font-semibold text-sm">~40%</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Domain age, bounce history, complaint rate, engagement</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Authentication</td>
                                    <td className="py-4 px-6 text-blue-600 font-semibold text-sm">~20%</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">SPF, DKIM, DMARC pass rates</td>
                                </tr>
                                <tr className="border-b border-gray-100">
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Engagement</td>
                                    <td className="py-4 px-6 text-blue-600 font-semibold text-sm">~15%</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Open rate, reply rate, spam complaints</td>
                                </tr>
                                <tr>
                                    <td className="py-4 px-6 text-gray-900 font-semibold text-sm">Content</td>
                                    <td className="py-4 px-6 text-blue-600 font-semibold text-sm">~25%</td>
                                    <td className="py-4 px-6 text-gray-600 text-sm">Keywords, formatting, links, HTML structure</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        This means that a domain with strong reputation and proper authentication can send emails with moderate content flags and still land in the inbox. Conversely, a domain with damaged reputation will land in spam regardless of how well-crafted the email content is.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        The takeaway for outbound teams: fix infrastructure first. Perfect copy on a damaged domain is wasted effort. Superkabe focuses on the infrastructure layer — monitoring reputation, authentication, and sending health — because that is where 75% of spam filtering decisions are made.
                    </p>

                    {/* Section 8: FAQ */}
                    <h2 id="faq" className="text-2xl font-bold text-gray-900 mt-16 mb-6">8. Frequently Asked Questions</h2>

                    <div className="space-y-6 mb-12">
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">How do spam filters affect email deliverability?</h3>
                            <p className="text-gray-600 text-sm">Spam filters create compounding feedback loops. When emails are filtered to spam, they generate zero engagement, which further damages sender reputation, causing more emails to be filtered. This cycle can degrade an entire domain&apos;s deliverability within days if not caught early.</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">What are the best practices for avoiding spam filters?</h3>
                            <p className="text-gray-600 text-sm">Configure SPF, DKIM, and DMARC on every domain. Keep bounce rates below 2%. Warm domains gradually. Use plain-text formatting for cold outbound. Verify lead lists before sending. Monitor sender reputation via Google Postmaster Tools. Limit links to 1-2 per email. Maintain consistent daily sending volume.</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Can I test if my email will hit spam before sending?</h3>
                            <p className="text-gray-600 text-sm">You can use tools like mail-tester.com or GlockApps to test individual emails against spam filters. However, these tools only test content — they cannot replicate your actual domain reputation or engagement history, which are the primary factors in real-world filtering.</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">Do Gmail and Outlook use different spam filters?</h3>
                            <p className="text-gray-600 text-sm">Yes. Gmail weights engagement signals most heavily. Outlook/365 relies more on IP reputation and SmartScreen content analysis. Yahoo prioritizes DMARC compliance and complaint rates. An email can reach Gmail&apos;s inbox while being filtered by Outlook — diagnosing ISP-specific issues requires monitoring each ISP&apos;s reputation tools separately.</p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-2">How does Superkabe help prevent spam filtering?</h3>
                            <p className="text-gray-600 text-sm">Superkabe protects the infrastructure signals that spam filters evaluate — bounce rates, DNS authentication, and mailbox health. By auto-pausing risky mailboxes and gating domain traffic before reputation damage occurs, Superkabe prevents the cascading degradation that causes ISPs to route emails to spam.</p>
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-3">Key Takeaway</h3>
                            <p className="text-blue-100 leading-relaxed">
                                Spam filters are multi-layered systems where infrastructure signals outweigh content signals. For cold outbound teams, inbox placement depends more on domain reputation, DNS authentication, and bounce rates than on subject lines or copy. Protect the infrastructure first — the content follows.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-16 pt-10 border-t border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">How Superkabe prevents this problem</h2>
                    <p className="text-gray-600 leading-relaxed max-w-3xl">
                        Superkabe monitors the infrastructure signals that spam filters evaluate — bounce rates, DNS authentication, and mailbox health — in real time. When any metric approaches dangerous thresholds, it auto-pauses affected mailboxes and gates domain traffic, preventing the reputation damage that triggers spam filtering.
                    </p>
                </div>
            </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/blog/email-deliverability-guide" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Email Deliverability Guide</h3>
                        <p className="text-gray-500 text-xs">Complete guide to outbound email deliverability</p>
                    </Link>
                    <Link href="/blog/spf-dkim-dmarc-explained" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">SPF, DKIM, and DMARC</h3>
                        <p className="text-gray-500 text-xs">DNS authentication protocols explained</p>
                    </Link>
                    <Link href="/blog/bounce-rate-deliverability" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Bounce Rate & Deliverability</h3>
                        <p className="text-gray-500 text-xs">How bounces damage sender reputation</p>
                    </Link>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">&larr; See how Superkabe protects your infrastructure</Link>
                </div>
            </section>

            <Footer />
        </>
    );
}
