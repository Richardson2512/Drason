import Link from 'next/link';
import type { Metadata } from 'next';
import DmarcLookupClient from './DmarcLookupClient';

export const metadata: Metadata = {
    title: "Free DMARC Record Lookup Tool – Check Your | Superkabe",
    description: "Free DMARC record lookup tool. Enter any domain to check its DMARC policy, view reporting addresses, alignment settings, and enforcement level.",
    openGraph: {
        title: "Free DMARC Record Lookup Tool – Check Your | Superkabe",
        description: "Free DMARC record lookup tool. Enter any domain to check its DMARC policy, view reporting addresses, alignment settings, and enforcement level.",
        url: '/tools/dmarc-lookup',
        siteName: 'Superkabe',
        type: 'website',
    },
    alternates: {
        canonical: '/tools/dmarc-lookup',
    },
};

const faqItems = [
    {
        question: 'What is a DMARC record?',
        answer: 'A DMARC (Domain-based Message Authentication, Reporting, and Conformance) record is a DNS TXT record published at _dmarc.yourdomain.com. It tells receiving mail servers what to do with emails that fail SPF and DKIM authentication checks — deliver them, quarantine them, or reject them entirely.',
    },
    {
        question: 'Why is DMARC important for email deliverability?',
        answer: 'DMARC prevents domain spoofing by giving you control over what happens when someone sends unauthorized email using your domain. Without DMARC, attackers can impersonate your domain freely, and mailbox providers have no policy to follow. A properly configured DMARC record also improves your domain reputation, which directly impacts inbox placement rates.',
    },
    {
        question: 'What is the difference between p=none, p=quarantine, and p=reject?',
        answer: 'p=none is monitor-only mode — failing emails are still delivered, but you receive reports. p=quarantine tells receivers to send failing emails to spam or junk. p=reject instructs receivers to block failing emails entirely. Most domains should start at p=none, analyze reports, then gradually move to p=quarantine and eventually p=reject.',
    },
    {
        question: 'How long does it take for DMARC changes to take effect?',
        answer: 'DMARC records are DNS TXT records, so changes propagate based on your TTL (Time to Live) setting. Most changes take effect within 1 to 48 hours. During this time, different receivers may see different versions of your record depending on their DNS cache.',
    },
    {
        question: 'Can I have DMARC without SPF and DKIM?',
        answer: 'Technically you can publish a DMARC record without SPF or DKIM, but it will not be effective. DMARC relies on at least one of these authentication methods passing and aligning with your From domain. For the strongest protection, configure both SPF and DKIM before enforcing DMARC.',
    },
    {
        question: 'What are DMARC aggregate reports (rua) and forensic reports (ruf)?',
        answer: 'Aggregate reports (rua) are XML summaries sent daily by receiving servers, showing how many emails passed or failed DMARC checks. Forensic reports (ruf) contain details about individual failing messages, including headers. Aggregate reports are essential for monitoring; forensic reports provide deeper debugging but are not sent by all providers due to privacy concerns.',
    },
];

export default function DmarcLookupPage() {
    const webAppSchema = {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        "name": "Free DMARC Record Lookup Tool",
        "description": "Enter any domain to check its DMARC policy, view reporting addresses, alignment settings, and enforcement level for unauthenticated emails.",
        "url": "https://www.superkabe.com/tools/dmarc-lookup",
        "applicationCategory": "DeveloperApplication",
        "operatingSystem": "All",
        "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
        },
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
    };

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Check a Domain's DMARC Record",
        "description": "Use this free tool to look up any domain's DMARC policy and see parsed tag details.",
        "step": [
            {
                "@type": "HowToStep",
                "position": 1,
                "name": "Enter the domain",
                "text": "Type or paste the domain name you want to check into the input field (e.g. example.com).",
            },
            {
                "@type": "HowToStep",
                "position": 2,
                "name": "View the DMARC policy",
                "text": "Click 'Check DMARC Record' to see the raw record, parsed tags, policy enforcement level, reporting addresses, and recommendations.",
            },
        ],
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": faqItems.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer,
            },
        })),
        "publisher": { "@id": "https://www.superkabe.com/#organization" },
    };

    return (
        <>
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
            />

            {/* Hero */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                    <span className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-purple-100">
                        <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">DMARC Record Lookup</h1>
                </div>
                <p className="text-gray-600 text-base leading-relaxed max-w-2xl">
                    Enter any domain to check its DMARC policy. See the enforcement level, reporting addresses, alignment settings, and get actionable recommendations to strengthen your email authentication.
                </p>
            </div>

            {/* Interactive Tool */}
            <DmarcLookupClient />

            {/* Educational Content */}
            <div className="mt-16 space-y-12">

                {/* What is a DMARC Record? */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">What is a DMARC Record?</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
                        <p className="text-gray-700 text-sm leading-relaxed">
                            DMARC (Domain-based Message Authentication, Reporting, and Conformance) is an email authentication protocol that builds on SPF and DKIM. It lets domain owners publish a policy in DNS that tells receiving mail servers what to do when an email fails authentication checks.
                        </p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            A DMARC record is a TXT record published at <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">_dmarc.yourdomain.com</code>. It specifies your preferred policy (none, quarantine, or reject), where to send aggregate and forensic reports, and how strictly SPF and DKIM domains must align with the From header.
                        </p>
                        <p className="text-gray-700 text-sm leading-relaxed">
                            Without DMARC, receiving servers have no guidance on handling emails that fail SPF or DKIM. Attackers can freely spoof your domain, and you have no visibility into who is sending email on your behalf.
                        </p>
                    </div>
                </section>

                {/* DMARC Policy Levels */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">DMARC Policy Levels</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-red-100 text-red-700">p=none</span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Monitor Only</h3>
                            <p className="text-gray-600 text-xs leading-relaxed">
                                Failing emails are delivered normally. You receive reports but no emails are blocked. This is the starting point for DMARC rollout.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-amber-100 text-amber-700">p=quarantine</span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Quarantine</h3>
                            <p className="text-gray-600 text-xs leading-relaxed">
                                Failing emails are sent to the spam or junk folder. Legitimate email still gets through if properly authenticated, while spoofed email is flagged.
                            </p>
                        </div>
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700">p=reject</span>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 mb-2">Reject</h3>
                            <p className="text-gray-600 text-xs leading-relaxed">
                                Failing emails are blocked entirely and never reach the recipient. This is the strongest enforcement level and the ultimate goal of DMARC deployment.
                            </p>
                        </div>
                    </div>
                </section>

                {/* DMARC Tags Explained */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">DMARC Tags Explained</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-50">
                            {[
                                { tag: 'p', required: true, desc: 'Policy for the domain. Tells receivers what to do with failing emails: none, quarantine, or reject.' },
                                { tag: 'sp', required: false, desc: 'Subdomain policy. Overrides the main policy for subdomains. If omitted, subdomains inherit the p= value.' },
                                { tag: 'rua', required: false, desc: 'Aggregate report URI. Comma-separated mailto: addresses that receive daily XML reports summarizing DMARC results.' },
                                { tag: 'ruf', required: false, desc: 'Forensic report URI. Addresses that receive detailed reports for individual failing messages. Not all providers send these.' },
                                { tag: 'adkim', required: false, desc: 'DKIM alignment mode. "r" (relaxed) allows subdomain matching; "s" (strict) requires exact domain match. Default: relaxed.' },
                                { tag: 'aspf', required: false, desc: 'SPF alignment mode. "r" (relaxed) allows subdomain matching; "s" (strict) requires exact domain match. Default: relaxed.' },
                                { tag: 'pct', required: false, desc: 'Percentage of messages the policy applies to (1-100). Useful for gradual rollout. Default: 100.' },
                                { tag: 'fo', required: false, desc: 'Failure reporting options. "0" = report if all fail, "1" = report if any fails, "d" = DKIM failure, "s" = SPF failure. Default: 0.' },
                                { tag: 'rf', required: false, desc: 'Report format for forensic reports. Usually "afrf" (Authentication Failure Reporting Format). Default: afrf.' },
                                { tag: 'ri', required: false, desc: 'Reporting interval in seconds. Requested time between aggregate reports. Default: 86400 (24 hours).' },
                            ].map((item) => (
                                <div key={item.tag} className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 px-6 py-4">
                                    <div className="flex items-center gap-2 sm:w-32 shrink-0">
                                        <code className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold font-mono">{item.tag}</code>
                                        {item.required && (
                                            <span className="text-xs text-red-500 font-semibold">Required</span>
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-700">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Recommended DMARC Rollout Path */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recommended DMARC Rollout Path</h2>
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                        <div className="space-y-6">
                            <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100 text-red-700 text-sm font-bold shrink-0">1</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Start with p=none</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Publish <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">v=DMARC1; p=none; rua=mailto:dmarc@yourdomain.com</code> to begin collecting reports without affecting email delivery. Monitor reports for 2-4 weeks to identify all legitimate sending sources.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-100 text-amber-700 text-sm font-bold shrink-0">2</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Move to p=quarantine</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        Once all legitimate senders pass SPF and DKIM alignment, switch to <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">p=quarantine</code>. Consider using <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">pct=25</code> initially and gradually increasing to 100%.
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100 text-green-700 text-sm font-bold shrink-0">3</div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Enforce with p=reject</h3>
                                    <p className="text-sm text-gray-600 mt-1">
                                        After confirming quarantine causes no legitimate email loss, upgrade to <code className="px-1.5 py-0.5 bg-gray-100 rounded text-xs font-mono">p=reject</code> for full protection. This blocks all unauthenticated email from your domain.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* FAQ */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                    <div className="space-y-3">
                        {faqItems.map((item, i) => (
                            <details key={i} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                <summary className="flex items-center justify-between px-6 py-4 cursor-pointer list-none">
                                    <span className="text-sm font-semibold text-gray-900 pr-4">{item.question}</span>
                                    <svg className="w-5 h-5 text-gray-400 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </summary>
                                <div className="px-6 pb-4">
                                    <p className="text-sm text-gray-600 leading-relaxed">{item.answer}</p>
                                </div>
                            </details>
                        ))}
                    </div>
                </section>

                {/* Related Tools */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Related Tools</h2>
                    <div className="grid gap-4 md:grid-cols-3">
                        <Link href="/tools/dmarc-generator" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-purple-300 hover:shadow-purple-100/50 transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-purple-100">
                                    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                    </svg>
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors">DMARC Generator</h3>
                            </div>
                            <p className="text-xs text-gray-500">Generate a DMARC record with your preferred policy, reporting addresses, and alignment settings.</p>
                        </Link>
                        <Link href="/tools/spf-lookup" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-blue-300 hover:shadow-blue-100/50 transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100">
                                    <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">SPF Lookup</h3>
                            </div>
                            <p className="text-xs text-gray-500">Check if your domain has a valid SPF record and see authorized sending servers.</p>
                        </Link>
                        <Link href="/tools/dkim-lookup" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-emerald-300 hover:shadow-emerald-100/50 transition-all group">
                            <div className="flex items-center gap-3 mb-2">
                                <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-emerald-100">
                                    <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                </span>
                                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">DKIM Lookup</h3>
                            </div>
                            <p className="text-xs text-gray-500">Verify your DKIM DNS record is published correctly and check the public key.</p>
                        </Link>
                    </div>
                </section>

                {/* Related Reading */}
                <section>
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Related Reading</h2>
                    <Link href="/blog/spf-dkim-dmarc-explained" className="block bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-purple-300 hover:shadow-purple-100/50 transition-all group">
                        <h3 className="text-sm font-semibold text-gray-900 group-hover:text-purple-700 transition-colors mb-1">
                            SPF, DKIM, and DMARC Explained
                        </h3>
                        <p className="text-xs text-gray-500">
                            A complete guide to the three email authentication protocols that protect your domain from spoofing and improve deliverability.
                        </p>
                    </Link>
                </section>

                {/* CTA */}
                <section className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-2xl border border-purple-100 p-8 text-center">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Monitor DMARC Across All Your Domains</h2>
                    <p className="text-sm text-gray-600 max-w-lg mx-auto mb-6">
                        Superkabe continuously monitors SPF, DKIM, and DMARC records across all your sending domains. Get alerted when records change or misconfigurations are detected.
                    </p>
                    <Link
                        href="/signup"
                        className="inline-flex items-center px-6 py-3 bg-purple-600 text-white font-semibold rounded-xl hover:bg-purple-700 transition-colors"
                    >
                        Start free trial
                    </Link>
                </section>
            </div>
        </>
    );
}
