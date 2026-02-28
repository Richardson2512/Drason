import Link from 'next/link';

import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Step-by-step DNS authentication (SPF, DKIM, DMARC) setup for outbound teams',
    description: 'Technical breakdown of email authentication protocols SPF, DKIM, and DMARC. How they protect sender identity and why misconfiguration causes inbox placement failure.',
    openGraph: {
        title: 'Step-by-step DNS authentication (SPF, DKIM, DMARC) setup for outbound teams',
        description: 'How SPF, DKIM, and DMARC protect sender identity and why misconfiguration causes inbox placement failure for outbound email teams.',
        type: 'article',
        publishedTime: '2024-02-15',
    },
    alternates: {
        canonical: '/blog/spf-dkim-dmarc-explained',
    },
};

export default function SpfDkimDmarcArticle() {
    const blogPostingSchema = {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": "Step-by-step DNS authentication (SPF, DKIM, DMARC) setup for outbound teams",
        "description": "Technical breakdown of email authentication protocols SPF, DKIM, and DMARC. How they protect sender identity and why misconfiguration causes inbox placement failure.",
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
            "@id": "https://www.superkabe.com/blog/spf-dkim-dmarc-explained"
        }
    };

    const howToSchema = {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": "How to Set Up SPF, DKIM, and DMARC for Email Authentication",
        "step": [
            { "@type": "HowToStep", "name": "Configure SPF", "text": "Publish a DNS TXT record listing all authorized sending IPs. Use -all (hard fail) to reject unauthorized senders." },
            { "@type": "HowToStep", "name": "Configure DKIM", "text": "Generate a public/private key pair. Publish the public key as a DNS TXT record. Configure your mail server to sign outgoing emails with the private key." },
            { "@type": "HowToStep", "name": "Configure DMARC", "text": "Publish a DMARC DNS record with policy p=quarantine or p=reject. Set rua to receive aggregate authentication reports." },
            { "@type": "HowToStep", "name": "Verify alignment", "text": "Ensure the From header domain aligns with both SPF and DKIM domains. Send test emails and verify via authentication headers." }
        ]
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "What is SPF in email authentication?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "SPF is a DNS TXT record that lists which mail servers can send email for your domain. Receiving servers check this record to verify the sender is authorized."
                }
            },
            {
                "@type": "Question",
                "name": "What is DKIM and how does it work?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "DKIM adds a cryptographic signature to each email using a private key. Receiving servers verify the signature against a public key in DNS to confirm the email is authentic and unaltered."
                }
            },
            {
                "@type": "Question",
                "name": "What happens if DMARC is not configured?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Without DMARC, ISPs have no policy for failed authentication checks. Spoofed emails using your domain may reach recipients. Google and Yahoo mandate DMARC for all bulk senders since 2024."
                }
            },
            {
                "@type": "Question",
                "name": "How does Superkabe monitor DNS records?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Superkabe performs continuous DNS health checks across all configured sending domains. It monitors SPF record validity (including the 10-lookup limit), DKIM key presence, and DMARC policy strength. When misconfigurations are detected, alerts are triggered before they cause deliverability failures."
                }
            },
            {
                "@type": "Question",
                "name": "Does Superkabe check SPF, DKIM, and DMARC?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes. Superkabe validates all three authentication protocols for every sending domain. It checks SPF for authorized IPs and lookup limits, DKIM for valid key publications, and DMARC for policy enforcement level. Domains with missing or weak configurations are flagged automatically."
                }
            },
            {
                "@type": "Question",
                "name": "What happens if a DNS record is misconfigured?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A misconfigured DNS record causes authentication failures for every email sent from that domain. SPF failures mean receiving servers cannot verify the sender. DKIM failures mean emails cannot be cryptographically authenticated. DMARC failures mean ISPs apply the domain's failure policy, which may route emails to spam or reject them entirely."
                }
            },
            {
                "@type": "Question",
                "name": "How does infrastructure health impact sender reputation?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "DNS authentication (SPF, DKIM, DMARC) is a primary input to ISP reputation scoring models. Domains with consistent authentication passes receive reputation benefits. Domains with authentication failures — even intermittent ones — accumulate negative reputation signals that compound over time, degrading inbox placement rates."
                }
            }
        ]
    };

    return (
        <>
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            <article>
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 mb-4">
                    Step-by-step DNS authentication (SPF, DKIM, DMARC) setup for outbound teams
                </h1>
                <p className="text-gray-400 text-sm mb-8">10 min read · Updated February 2026</p>

                <p className="text-xl text-blue-900 font-medium mb-8 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
                    This guide answers a common question from outbound teams: &quot;How exactly do I configure SPF, DKIM, and DMARC to ensure my cold emails land in the primary inbox?&quot;
                </p>

                {/* Key Takeaways */}
                <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-12">
                    <h2 className="font-bold text-blue-900 text-lg mb-3">Key Takeaways</h2>
                    <ul className="space-y-2 text-blue-800 text-sm">
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> SPF authorizes sending IPs, DKIM proves email authenticity, DMARC enforces failure policy</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> All three must be configured on every sending domain — no exceptions since Feb 2024</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> SPF has a 10-lookup limit; exceeding it silently fails authentication</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Use -all (hard fail) for SPF and p=quarantine or p=reject for DMARC</li>
                        <li className="flex items-start gap-2"><span className="text-blue-500 mt-0.5">▸</span> Superkabe continuously monitors all three protocols for misconfigurations</li>
                    </ul>
                </div>

                <div style={{ background: '#F8FAFC', borderRadius: '12px', padding: '1.5rem 2rem', marginBottom: '2rem', border: '1px solid #E2E8F0' }}>
                    <h2 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#1E293B', marginBottom: '1rem' }}>Table of Contents</h2>
                    <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 2 }}>
                        <li><a href="#what-is-spf" style={{ color: '#2563EB', textDecoration: 'none' }}>What Is SPF (Sender Policy Framework) and How Does It Work?</a></li>
                        <li><a href="#what-is-dkim" style={{ color: '#2563EB', textDecoration: 'none' }}>What Is DKIM (DomainKeys Identified Mail) and Why Does It Matter?</a></li>
                        <li><a href="#what-is-dmarc" style={{ color: '#2563EB', textDecoration: 'none' }}>What Is DMARC and How Does It Protect Your Domain?</a></li>
                        <li><a href="#authentication-decision-flow" style={{ color: '#2563EB', textDecoration: 'none' }}>How Does the Email Authentication Decision Flow Work?</a></li>
                        <li><a href="#why-it-matters-for-outbound" style={{ color: '#2563EB', textDecoration: 'none' }}>Why Does Email Authentication Matter for Outbound Teams?</a></li>
                    </ol>
                </div>

                <div className="prose prose-lg max-w-none">
                    <p className="text-lg text-gray-600 leading-relaxed mb-8">
                        SPF, DKIM, and DMARC are the three email authentication protocols that verify sender identity and prevent domain spoofing. Together, they form the trust layer that ISPs use to decide whether an email should reach the inbox, be routed to spam, or be rejected entirely. For outbound email operators running multiple domains, correct configuration of all three protocols is non-negotiable.
                    </p>

                    <h2 id="what-is-spf" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Is SPF (Sender Policy Framework) and How Does It Work?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        SPF is a DNS-based authentication mechanism that specifies which mail servers are authorized to send email on behalf of a domain. When an email arrives at a receiving server, the server looks up the sending domain&apos;s SPF record (a DNS TXT record) and checks whether the originating IP address is listed as an authorized sender.
                    </p>

                    <div className="bg-gray-900 text-green-400 p-6 rounded-2xl mb-8 font-mono text-sm overflow-x-auto">
                        <p className="text-gray-500 mb-2"># Example SPF record for superkabe.com</p>
                        <p>v=spf1 include:_spf.google.com include:sendgrid.net -all</p>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">-all</code> at the end is critical. It tells receiving servers to reject emails from any IP not explicitly listed. Using <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">~all</code> (soft fail) instead of <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">-all</code> (hard fail) is a common misconfiguration that weakens SPF protection.
                    </p>

                    <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-8 shadow-sm">
                        <h3 className="font-bold text-gray-900 mb-3">Common SPF Pitfalls</h3>
                        <ul className="space-y-2 text-gray-600 text-sm">
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">●</span> Exceeding the 10 DNS lookup limit (causes SPF to fail silently)</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">●</span> Using ~all instead of -all (allows spoofed emails through)</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">●</span> Forgetting to include third-party senders (Smartlead, Instantly)</li>
                            <li className="flex items-start gap-2"><span className="text-red-500 mt-1">●</span> Not updating SPF when switching email providers</li>
                        </ul>
                    </div>

                    <h2 id="what-is-dkim" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Is DKIM (DomainKeys Identified Mail) and Why Does It Matter?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        DKIM adds a cryptographic signature to every outgoing email. The sending server signs the email headers and body with a private key, and the receiving server uses the corresponding public key (published as a DNS TXT record) to verify the signature. If the signature validates, the receiving server knows two things: the email was authorized by the domain owner, and it was not modified in transit.
                    </p>

                    <div className="bg-gray-900 text-green-400 p-6 rounded-2xl mb-8 font-mono text-sm overflow-x-auto">
                        <p className="text-gray-500 mb-2"># Example DKIM DNS record</p>
                        <p>selector1._domainkey.superkabe.com IN TXT &quot;v=DKIM1; k=rsa; p=MIGfMA0GCS...&quot;</p>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        DKIM is particularly important for outbound email because it provides per-message authentication. Unlike SPF which only validates the sending IP, DKIM proves that each individual email was authorized. This makes it significantly harder for attackers to spoof your domain.
                    </p>

                    <h2 id="what-is-dmarc" className="text-2xl font-bold text-gray-900 mt-12 mb-4">What Is DMARC and How Does It Protect Your Domain?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        DMARC ties SPF and DKIM together with a policy declaration. It tells receiving servers what to do when an email fails authentication checks: allow it through (p=none), quarantine it to spam (p=quarantine), or reject it entirely (p=reject).
                    </p>

                    <div className="bg-gray-900 text-green-400 p-6 rounded-2xl mb-8 font-mono text-sm overflow-x-auto">
                        <p className="text-gray-500 mb-2"># Recommended DMARC record</p>
                        <p>_dmarc.superkabe.com IN TXT &quot;v=DMARC1; p=quarantine; rua=mailto:dmarc@superkabe.com; pct=100&quot;</p>
                    </div>

                    <p className="text-gray-600 leading-relaxed mb-6">
                        The <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm">rua</code> tag specifies where aggregate reports should be sent. These reports contain data about who is sending email using your domain, including unauthorized senders. For multi-domain outbound operations, these reports are essential for detecting infrastructure compromise.
                    </p>

                    <h2 id="authentication-decision-flow" className="text-2xl font-bold text-gray-900 mt-12 mb-4">How Does the Email Authentication Decision Flow Work?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        When an email arrives at a receiving server, the authentication check follows this sequence:
                    </p>
                    <ol className="space-y-3 text-gray-600 mb-8 list-decimal pl-5">
                        <li>Check SPF: Is the sending IP authorized by the domain&apos;s SPF record?</li>
                        <li>Check DKIM: Does the cryptographic signature validate against the domain&apos;s public key?</li>
                        <li>Check DMARC alignment: Does the From header domain align with either the SPF or DKIM domain?</li>
                        <li>Apply DMARC policy: If checks fail, apply the domain&apos;s published DMARC policy (none/quarantine/reject).</li>
                    </ol>

                    <h2 id="why-it-matters-for-outbound" className="text-2xl font-bold text-gray-900 mt-12 mb-4">Why Does Email Authentication Matter for Outbound Teams?</h2>
                    <p className="text-gray-600 leading-relaxed mb-6">
                        As of February 2024, Google and Yahoo require bulk senders to have all three protocols properly configured. Domains without DMARC will have emails throttled or rejected by these providers. For outbound teams running 3–10 domains, this means each domain must have its own SPF, DKIM, and DMARC records independently configured.
                    </p>
                    <p className="text-gray-600 leading-relaxed mb-8">
                        Superkabe monitors DNS authentication health across all your sending domains. When SPF records approach the 10-lookup limit, DKIM keys are missing, or DMARC policies are too permissive, Superkabe flags these issues before they cause deliverability failures.
                    </p>

                    <div className="bg-gradient-to-br from-blue-600 to-purple-700 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
                        <div className="relative z-10">
                            <h3 className="font-bold text-xl mb-3">Key Takeaway</h3>
                            <p className="text-blue-100 leading-relaxed">
                                SPF authorizes your sending servers. DKIM proves each email is genuine. DMARC enforces what happens when either fails. All three must be configured correctly on every sending domain. Missing any one creates a gap that ISPs will penalize.
                            </p>
                        </div>
                    </div>
                </div>
    
            <div className="mt-16 pt-10 border-t border-gray-100">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">How Superkabe prevents this problem</h2>
                <p className="text-gray-600 leading-relaxed max-w-3xl">
                    Superkabe continuously tracks bounce rates and DNS authentication status, auto-pausing mailboxes and gating domains when risk thresholds are breached, so you detect and prevent domain degradation before it becomes irreversible.
                </p>
            </div>
        </article>

            {/* Internal Link Mesh */}
            <section className="pb-12 mt-16">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Related Reading</h2>
                <div className="grid md:grid-cols-3 gap-4">
                    <Link href="/blog/bounce-rate-deliverability" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Bounce Rate & Deliverability</h3>
                        <p className="text-gray-500 text-xs">How bounces destroy sender reputation</p>
                    </Link>
                    <Link href="/blog/domain-warming-methodology" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Domain Warming Methodology</h3>
                        <p className="text-gray-500 text-xs">Building sender reputation on new domains</p>
                    </Link>
                    <Link href="/blog/email-reputation-lifecycle" className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all">
                        <h3 className="font-bold text-gray-900 text-sm mb-2">Email Reputation Lifecycle</h3>
                        <p className="text-gray-500 text-xs">How reputation is built and damaged</p>
                    </Link>
                </div>
                <div className="mt-6">
                    <Link href="/" className="text-blue-600 text-sm font-medium hover:underline">← See how Superkabe protects your infrastructure</Link>
                </div>
            </section>

        </>
    );
}
