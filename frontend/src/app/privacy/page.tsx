'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';


export default function PrivacyPolicyPage() {
    const privacySchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Privacy Policy — Superkabe",
        "description": "Superkabe privacy policy: GDPR, CCPA, DPDP, and PDPA-aligned data protection. How we collect, use, share, retain, and protect your data.",
        "url": "https://www.superkabe.com/privacy",
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com",
        },
    };

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(privacySchema) }} />
            <Navbar />

            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="cloud-bg">
                    <div className="cloud-shadow" />
                    <div className="cloud-puff-1" />
                    <div className="cloud-puff-2" />
                    <div className="cloud-puff-3" />
                </div>
                <div className="absolute inset-0 hero-grid"></div>
            </div>

            <div className="relative z-10 pt-32 md:pt-36 pb-10 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white p-10 md:p-14 shadow-xl shadow-gray-200/50 border border-gray-100">
                        <h1 className="text-4xl font-bold mb-2 text-gray-900">Privacy Policy</h1>
                        <p className="text-gray-500 mb-8">Last updated: April 28, 2026</p>

                        <div className="prose prose-gray max-w-none">

                            {/* 1. Introduction & Scope */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction &amp; Scope</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Superkabe (&quot;Superkabe&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;) operates an AI cold email platform with built-in deliverability protection. This Privacy Policy describes how we collect, use, share, retain, and safeguard personal data — and the rights individuals have under applicable data-protection laws including the EU/UK General Data Protection Regulation (&quot;GDPR&quot;), the California Consumer Privacy Act as amended by the CPRA (&quot;CCPA/CPRA&quot;), India&apos;s Digital Personal Data Protection Act 2023 (&quot;DPDP&quot;), Singapore&apos;s Personal Data Protection Act and equivalent ASEAN frameworks (&quot;PDPA&quot;), the US CAN-SPAM Act, and Canada&apos;s Anti-Spam Legislation (&quot;CASL&quot;).
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    This policy applies to data we process in connection with the Superkabe platform, our website (superkabe.com), and our customer support channels.
                                </p>
                            </section>

                            {/* 2. Roles */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Our Role: Controller vs Processor</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Superkabe processes two distinct categories of personal data, in two distinct roles:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li><strong>As a Data Controller / Data Fiduciary:</strong> for personal data of our customers (the people who sign up for and pay for Superkabe accounts), including names, email addresses, billing details, and account telemetry.</li>
                                    <li><strong>As a Data Processor / Data Processor:</strong> for personal data of our customers&apos; recipients (the people our customers send cold emails to). Our customers are the Controller / Data Fiduciary for this data; we process it solely on their documented instructions, under our standard Data Processing Addendum (DPA), available on request from <a href="mailto:privacy@superkabe.com" className="text-blue-600 hover:text-blue-800">privacy@superkabe.com</a>.</li>
                                </ul>
                                <p className="text-gray-600 leading-relaxed">
                                    Where this Privacy Policy describes your rights, those rights are addressed to whichever role applies to your relationship with us. If you are a recipient of email sent through our platform, your data-protection rights are exercised first against our customer (the sender). We will assist any of our customers in responding to such requests.
                                </p>
                            </section>

                            {/* 3. Information We Collect */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Information We Collect</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">From customers (Controller relationship):</p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li><strong>Account Information:</strong> name, business email, organization name, password (stored as bcrypt hash), authentication tokens.</li>
                                    <li><strong>Billing Information:</strong> processed by our payments provider (Polar.sh); we receive only billing reference identifiers, plan tier, and transaction status.</li>
                                    <li><strong>Mailbox Connection Data:</strong> OAuth tokens for Google Workspace and Microsoft 365 mailboxes (encrypted at rest with AES-256-GCM); SMTP credentials for self-hosted mailboxes (encrypted at rest with AES-256-GCM).</li>
                                    <li><strong>One-Time Import Keys:</strong> if you import campaigns from another platform, we hold your admin API key encrypted at rest for at most 72 hours, then auto-discard.</li>
                                    <li><strong>Usage Telemetry:</strong> sequence performance metrics, mailbox health metrics, send/bounce/reply counts, audit logs of administrative actions.</li>
                                    <li><strong>Support Data:</strong> records of support correspondence, screenshots you share, and feature requests.</li>
                                </ul>
                                <p className="text-gray-600 leading-relaxed mb-4">From recipients (Processor relationship — controlled by our customers):</p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li><strong>Recipient Identity:</strong> email address, name, company, title, persona, lead score, custom fields ingested from your enrichment source (e.g., Clay).</li>
                                    <li><strong>Engagement Signals:</strong> opens, clicks, replies, bounces, unsubscribes, spam complaints — used to compute deliverability metrics.</li>
                                    <li><strong>Inbox Replies:</strong> when our IMAP reply worker classifies inbound email as a reply to a sequence we sent, we store the message body for the customer&apos;s inbox view, until the customer deletes it.</li>
                                </ul>
                                <p className="text-gray-600 leading-relaxed mb-4">Automatically collected:</p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li><strong>Device &amp; Connection Data:</strong> IP address, browser type, operating system, referrer.</li>
                                    <li><strong>Cookies:</strong> session cookies for authentication; analytics cookies (where consented).</li>
                                </ul>
                            </section>

                            {/* 4. How We Use */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. How We Use Your Information</h2>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li>Operate and improve the Superkabe platform: authentication, sending, validation, deliverability monitoring, AI sequence generation.</li>
                                    <li>Process payments through our payments provider.</li>
                                    <li>Send service-related communications: outage notices, security alerts, billing receipts, customer-onboarding emails.</li>
                                    <li>Provide customer support and respond to inquiries.</li>
                                    <li>Detect, prevent, and respond to fraud, abuse, security incidents, and policy violations.</li>
                                    <li>Comply with legal obligations and enforce our Terms.</li>
                                    <li>Train and improve internal AI models <em>only on de-identified, customer-uploaded copy you affirmatively submit through &quot;Feedback&quot; channels</em>. We do not train models on recipient data, mailbox content, or live sequences.</li>
                                </ul>
                            </section>

                            {/* 5. Lawful Basis (GDPR) */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Lawful Basis for Processing (GDPR Art. 6)</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">For data subjects in the European Economic Area, United Kingdom, or Switzerland, we rely on the following lawful bases:</p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li><strong>Performance of Contract (Art. 6(1)(b)):</strong> for processing necessary to provide Superkabe services to our customers under our subscription agreement.</li>
                                    <li><strong>Legitimate Interest (Art. 6(1)(f)):</strong> for security monitoring, fraud prevention, product improvement, and processing recipient engagement signals where the customer has established its own lawful basis as the Controller.</li>
                                    <li><strong>Consent (Art. 6(1)(a)):</strong> for marketing communications and non-essential cookies, where withdrawal is available at any time without affecting the lawfulness of prior processing.</li>
                                    <li><strong>Legal Obligation (Art. 6(1)(c)):</strong> where required by applicable law (e.g., tax records, compliance with binding orders).</li>
                                </ul>
                            </section>

                            {/* 6. Data Sharing & Sub-Processors */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Sharing &amp; Sub-Processors</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    <strong>We do not sell, rent, or trade personal information.</strong> We engage the following sub-processors to deliver the platform; each is bound by data-processing terms and appropriate transfer mechanisms:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li><strong>Railway (United States):</strong> backend infrastructure hosting.</li>
                                    <li><strong>Vercel (United States):</strong> frontend hosting and CDN.</li>
                                    <li><strong>Polar.sh (United States):</strong> subscription and payment processing.</li>
                                    <li><strong>Resend (United States):</strong> transactional email delivery (account notices, support replies).</li>
                                    <li><strong>Google LLC (United States):</strong> when you connect a Google Workspace mailbox via OAuth, Postmaster Tools data fetching, and AI services where used.</li>
                                    <li><strong>Microsoft Corporation (United States):</strong> when you connect a Microsoft 365 mailbox via OAuth.</li>
                                    <li><strong>OpenAI / Anthropic (United States):</strong> AI sequence generation and reply classification on prompts you submit; we do not retain inputs for training in these services beyond their default retention.</li>
                                    <li><strong>MillionVerifier (United States):</strong> third-party email validation for the optional API verification stage.</li>
                                </ul>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    A current list of sub-processors is available at <a href="mailto:privacy@superkabe.com" className="text-blue-600 hover:text-blue-800">privacy@superkabe.com</a> on request, and customers will receive notice of any addition or replacement.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    We may also disclose information (a) to comply with applicable law, regulation, or binding legal process; (b) to protect the rights, property, or safety of Superkabe, our customers, or others; and (c) in connection with a merger, acquisition, financing, or sale of assets, subject to confidentiality undertakings and continued protection consistent with this policy.
                                </p>
                            </section>

                            {/* 7. International Transfers */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. International Transfers</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Personal data may be processed outside your country of residence, including in the United States. For transfers from the EEA, UK, and Switzerland to countries that have not received an adequacy decision, we rely on the European Commission&apos;s Standard Contractual Clauses (&quot;SCCs&quot;), the UK International Data Transfer Addendum, or other lawful transfer mechanisms.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    For DPDP-governed transfers from India, we transfer only to jurisdictions permitted under applicable Indian government notifications. For PDPA-governed transfers from Singapore, recipients are bound to provide a comparable standard of protection.
                                </p>
                            </section>

                            {/* 8. Security */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Data Security</h2>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li>Encryption in transit (TLS 1.2+) and at rest (AES-256-GCM for credentials and import keys).</li>
                                    <li>Role-based access control with the principle of least privilege.</li>
                                    <li>Audit logging of administrative actions retained for 12 months.</li>
                                    <li>Regular dependency-vulnerability scans and prompt patching.</li>
                                    <li>Background checks and confidentiality undertakings for personnel with production access.</li>
                                </ul>
                                <p className="text-gray-600 leading-relaxed">
                                    No system can be guaranteed completely secure. If we discover a personal-data breach affecting you, we will notify the relevant supervisory authority (where required by GDPR/DPDP/PDPA) within 72 hours of becoming aware, and notify affected individuals where required.
                                </p>
                            </section>

                            {/* 9. Retention */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Data Retention</h2>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li><strong>Account data:</strong> retained for the life of the account plus 30 days post-cancellation, then deleted.</li>
                                    <li><strong>Billing records:</strong> retained for 7 years for tax and accounting compliance.</li>
                                    <li><strong>Recipient data &amp; sequence logs:</strong> retained while you remain a customer; deleted within 30 days of account closure or upon documented Controller-instructed deletion.</li>
                                    <li><strong>Inbox replies:</strong> retained until the customer deletes them.</li>
                                    <li><strong>Audit logs:</strong> 12 months.</li>
                                    <li><strong>One-time import API keys:</strong> at most 72 hours from paste, or 24 hours after import completion (whichever first); also wipeable on demand.</li>
                                    <li><strong>Backups:</strong> rolling 30-day retention; deletion requests are honored in production immediately and propagate through backup expiration.</li>
                                </ul>
                            </section>

                            {/* 10. Your Rights */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Your Rights</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    To exercise any of the rights below, contact <a href="mailto:privacy@superkabe.com" className="text-blue-600 hover:text-blue-800">privacy@superkabe.com</a>. We will respond within the timeframe required by the applicable law (generally 30 days under GDPR/DPDP, 45 days under CCPA, 30 days under PDPA). We may need to verify your identity before responding. You will not be discriminated against for exercising any of these rights.
                                </p>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">10.1 GDPR / UK GDPR rights (EEA, UK, Switzerland)</h3>
                                <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                                    <li>Right of access (Art. 15)</li>
                                    <li>Right to rectification (Art. 16)</li>
                                    <li>Right to erasure / &quot;right to be forgotten&quot; (Art. 17)</li>
                                    <li>Right to restriction of processing (Art. 18)</li>
                                    <li>Right to data portability (Art. 20)</li>
                                    <li>Right to object, including to direct marketing (Art. 21)</li>
                                    <li>Right not to be subject to a decision based solely on automated processing (Art. 22)</li>
                                    <li>Right to withdraw consent at any time, where processing is based on consent</li>
                                    <li>Right to lodge a complaint with your local supervisory authority</li>
                                </ul>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">10.2 CCPA / CPRA rights (California residents)</h3>
                                <p className="text-gray-600 leading-relaxed mb-2">
                                    Under California law, you have the right to know what personal information we collect, the categories of sources, the business or commercial purposes for collection, and the categories of third parties we share it with. You also have the right to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                                    <li>Request deletion of personal information we have collected from you</li>
                                    <li>Request correction of inaccurate personal information</li>
                                    <li>Limit the use and disclosure of sensitive personal information</li>
                                    <li>Opt out of the sale or sharing of personal information</li>
                                    <li>Be free from discrimination for exercising these rights</li>
                                    <li>Designate an authorized agent to exercise rights on your behalf</li>
                                </ul>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    <strong>We do not sell or share personal information for cross-context behavioral advertising as defined under the CCPA/CPRA.</strong>
                                </p>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">10.3 DPDP rights (India)</h3>
                                <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                                    <li>Right to access information about the personal data we process about you</li>
                                    <li>Right to correction and erasure</li>
                                    <li>Right of grievance redressal — contact our Grievance Officer at <a href="mailto:privacy@superkabe.com" className="text-blue-600 hover:text-blue-800">privacy@superkabe.com</a></li>
                                    <li>Right to nominate another individual to exercise rights in the event of death or incapacity</li>
                                    <li>Right to withdraw consent</li>
                                </ul>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">10.4 PDPA rights (Singapore + ASEAN frameworks)</h3>
                                <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                                    <li>Right of access — request information about your personal data and how it has been used or disclosed in the past 12 months</li>
                                    <li>Right of correction</li>
                                    <li>Right to withdraw consent for collection, use, or disclosure</li>
                                    <li>Right to escalate unresolved concerns to the Personal Data Protection Commission (PDPC) of Singapore or the equivalent regulator in your jurisdiction</li>
                                </ul>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">10.5 Other jurisdictions</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    Residents of Brazil (LGPD), Canada (PIPEDA / Quebec Law 25), Japan (APPI), South Korea (PIPA), and other jurisdictions have analogous rights. Contact us to exercise them.
                                </p>
                            </section>

                            {/* 11. Cookies */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Cookies and Similar Technologies</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We use strictly necessary cookies to authenticate sessions and maintain platform functionality. We use functional cookies for product preferences. With your consent (where required), we use analytics cookies to understand product usage. You can manage cookies through your browser; blocking strictly-necessary cookies will impair the platform.
                                </p>
                            </section>

                            {/* 12. Children's Privacy */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Children&apos;s Privacy</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Superkabe is a B2B service intended for users aged 18 and older. We do not knowingly collect personal data from children. If you believe a child has provided us personal data, contact us and we will delete it.
                                </p>
                            </section>

                            {/* 13. Frameworks NOT applicable — Important */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Frameworks That Do Not Apply</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    To set clear expectations, the following regulatory frameworks <strong>do not apply</strong> to Superkabe and we make no representations of compliance with them:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-3">
                                    <li>
                                        <strong>HIPAA — not a Business Associate.</strong> Superkabe is <strong>not</strong> a HIPAA Business Associate, does not sign Business Associate Agreements, and is not designed to handle Protected Health Information (&quot;PHI&quot;) as defined under the US Health Insurance Portability and Accountability Act. Customers <strong>must not</strong> transmit, store, or process PHI through Superkabe. If your use case requires HIPAA-compliant cold email, Superkabe is not the appropriate tool.
                                    </li>
                                    <li>
                                        <strong>DPPA — not applicable.</strong> Superkabe does not access, use, or process motor-vehicle records and is therefore outside the scope of the US Driver&apos;s Privacy Protection Act.
                                    </li>
                                    <li>
                                        <strong>GLBA, FERPA, COPPA — not applicable.</strong> We do not handle non-public financial information of consumers (GLBA), education records (FERPA), or knowingly collect data from children under 13 (COPPA).
                                    </li>
                                </ul>
                            </section>

                            {/* 14. Changes */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Changes to This Policy</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    We may update this Privacy Policy from time to time. We will post the updated policy here with a revised &quot;Last updated&quot; date. For material changes affecting your rights, we will provide additional notice (e.g., email or in-product banner).
                                </p>
                            </section>

                            {/* 15. Contact */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Contact Us</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    For privacy questions, rights requests, or to engage our Data Protection Officer / Grievance Officer:
                                </p>
                                <div className="mt-4 p-4 bg-gray-50 border border-gray-100">
                                    <p className="text-gray-700 font-medium">Superkabe — Privacy Office</p>
                                    <p className="text-gray-500">Email: <a href="mailto:privacy@superkabe.com" className="text-blue-600 hover:text-blue-800">privacy@superkabe.com</a></p>
                                    <p className="text-gray-500">For DPDP grievances (India): <a href="mailto:privacy@superkabe.com" className="text-blue-600 hover:text-blue-800">privacy@superkabe.com</a> (subject line: &quot;DPDP Grievance&quot;)</p>
                                </div>
                            </section>

                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
}
