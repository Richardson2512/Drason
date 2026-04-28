'use client';

import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';


export default function TermsPage() {
    const termsSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Terms & Conditions — Superkabe",
        "description": "Terms of service for Superkabe — AI cold email platform with built-in deliverability protection. Acceptable use, customer compliance, payments, IP, liability.",
        "url": "https://www.superkabe.com/terms",
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com",
        },
    };

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(termsSchema) }} />
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
                        <h1 className="text-4xl font-bold mb-2 text-gray-900">Terms &amp; Conditions</h1>
                        <p className="text-gray-500 mb-8">Last updated: April 28, 2026</p>

                        <div className="prose prose-gray max-w-none">

                            {/* 1. Acceptance */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to and use of Superkabe (the &quot;Service&quot;), operated by Superkabe (&quot;Superkabe&quot;, &quot;we&quot;, &quot;our&quot;). By creating an account, signing in, or using the Service, you agree to these Terms. If you do not agree, do not use the Service. If you are entering into these Terms on behalf of an organization, you represent that you have authority to bind that organization, and &quot;Customer&quot; or &quot;you&quot; refers to that organization.
                                </p>
                            </section>

                            {/* 2. Description of Service */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Superkabe is an AI cold email platform with built-in deliverability protection. The Service includes:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li>AI-assisted sequence generation, A/B variants, and reply classification</li>
                                    <li>Multi-mailbox sending across Google Workspace, Microsoft 365, and SMTP infrastructure you connect</li>
                                    <li>Hybrid email validation, ESP-aware lead routing, and health-gate classification</li>
                                    <li>Continuous deliverability monitoring: SMTP transcript capture, DSN parsing, DNSBL checks, Postmaster Tools reputation lookups, and a 5-phase healing pipeline</li>
                                    <li>Dashboards, reports, audit logs, and Slack alerts</li>
                                    <li>One-time data import from third-party platforms (e.g., Smartlead) for migration purposes</li>
                                </ul>
                            </section>

                            {/* 3. User Accounts */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li>Provide accurate and current registration information.</li>
                                    <li>Keep your credentials secure; you are responsible for activity under your account.</li>
                                    <li>Notify us promptly of any unauthorized use at <a href="mailto:security@superkabe.com" className="text-blue-600 hover:text-blue-800">security@superkabe.com</a>.</li>
                                    <li>You must be at least 18 years old. The Service is B2B and not intended for personal/consumer use.</li>
                                </ul>
                            </section>

                            {/* 4. Acceptable Use */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use Policy</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">You agree not to use the Service to:</p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li>Send unsolicited bulk email in violation of the US CAN-SPAM Act, Canada&apos;s CASL, the EU GDPR/ePrivacy Directive, Singapore&apos;s PDPA / Spam Control Act, or any other applicable anti-spam law;</li>
                                    <li>Email recipients on suppression lists, do-not-contact registries, or those who have unsubscribed from your communications;</li>
                                    <li>Send messages with deceptive headers, deceptive subject lines, or false sender identification;</li>
                                    <li>Send messages without a valid postal address or without an honored unsubscribe mechanism;</li>
                                    <li>Send messages on behalf of third parties without their authorization;</li>
                                    <li>Scrape, harvest, or otherwise obtain email addresses through methods that violate the targets&apos; terms of service;</li>
                                    <li>Send phishing, malware, scams, deceptive financial offers, or content infringing intellectual property;</li>
                                    <li>Use the Service to harass, threaten, or harm any individual or group;</li>
                                    <li>Reverse engineer, attempt to derive source code, or circumvent security or rate-limiting features of the Service;</li>
                                    <li>Resell or repackage the Service without our written consent;</li>
                                    <li>Use the Service to transmit Protected Health Information (&quot;PHI&quot;) — see Section 5.4.</li>
                                </ul>
                                <p className="text-gray-600 leading-relaxed">
                                    We may suspend or terminate accounts that violate this Acceptable Use Policy, with or without notice depending on severity.
                                </p>
                            </section>

                            {/* 5. Customer Compliance */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Customer Compliance Obligations</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Superkabe is the tooling. <strong>You — the sender — are responsible for the legality of your outbound communications.</strong> By using the Service, you represent and warrant that you will comply with the laws applicable to your sending, including but not limited to:
                                </p>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">5.1 CAN-SPAM Act (United States)</h3>
                                <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                                    <li>Use accurate &quot;From&quot;, &quot;To&quot;, and routing headers.</li>
                                    <li>Use a non-deceptive subject line.</li>
                                    <li>Identify the message as an advertisement (where applicable).</li>
                                    <li>Include a valid physical postal address in every message.</li>
                                    <li>Provide and honor a clear opt-out mechanism within 10 business days.</li>
                                    <li>Do not buy, sell, transfer, or otherwise distribute opt-out email lists.</li>
                                </ul>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">5.2 CASL (Canada)</h3>
                                <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                                    <li>Send only to recipients for whom you have express or implied consent under CASL.</li>
                                    <li>Identify the sender clearly and provide working contact information.</li>
                                    <li>Provide a working unsubscribe mechanism honored within 10 business days.</li>
                                    <li>Maintain auditable records of consent.</li>
                                </ul>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">5.3 GDPR / UK GDPR / ePrivacy / PDPA / DPDP / LGPD &amp; equivalents</h3>
                                <ul className="list-disc pl-6 text-gray-600 space-y-1 mb-4">
                                    <li>Establish and document a lawful basis for processing recipients&apos; personal data (typically &quot;legitimate interest&quot; for B2B cold outreach where balanced against the recipient&apos;s rights, where permitted by national law).</li>
                                    <li>Honor data-subject rights including access, rectification, erasure, and objection.</li>
                                    <li>Maintain DNC / opt-out registries where required (Singapore DNC, etc.).</li>
                                    <li>For data subjects in jurisdictions requiring affirmative consent for B2B email (e.g., parts of EEA, India under DPDP, certain ASEAN jurisdictions), obtain such consent before sending.</li>
                                    <li>You are the Data Controller / Data Fiduciary for the recipient data you upload; we are your Processor. Our Data Processing Addendum is available on request from <a href="mailto:legal@superkabe.com" className="text-blue-600 hover:text-blue-800">legal@superkabe.com</a>.</li>
                                </ul>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">5.4 HIPAA (United States — Healthcare)</h3>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Superkabe is <strong>not</strong> a HIPAA Business Associate, does not sign Business Associate Agreements, and is not designed to process Protected Health Information. <strong>You must not transmit PHI through Superkabe.</strong> If your use case requires HIPAA-compliant outbound, Superkabe is not the appropriate tool. Customer accepts full liability for any violation of HIPAA caused by transmitting PHI through Superkabe in breach of these Terms.
                                </p>

                                <h3 className="text-xl font-bold text-gray-900 mt-6 mb-2">5.5 Sector-specific laws</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    You are responsible for compliance with any other sector-specific regulation applicable to your sending, including without limitation GLBA (financial), FERPA (education), TCPA (US telemarketing), Singapore Spam Control Act, and Australian Spam Act.
                                </p>
                            </section>

                            {/* 6. Data Processing Addendum */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Processing Addendum (DPA)</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    Where we process personal data on your behalf as your Processor / Data Processor, our standard Data Processing Addendum (incorporating EU Standard Contractual Clauses for transfers outside the EEA, and the UK International Data Transfer Addendum) is incorporated into these Terms by reference and is available from <a href="mailto:legal@superkabe.com" className="text-blue-600 hover:text-blue-800">legal@superkabe.com</a>. The DPA prevails over conflicting provisions of these Terms with respect to data-protection obligations.
                                </p>
                            </section>

                            {/* 7. Payment Terms */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Payment Terms</h2>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li>Paid subscriptions are billed in advance on a monthly or annual cadence, processed by our payments provider (Polar.sh).</li>
                                    <li>Plans meter monthly send volume and email-validation credits; other usage (domains, mailboxes, leads, and protection coverage) is unlimited at every paid tier.</li>
                                    <li>Fees are non-refundable except as expressly stated in these Terms or as required by applicable law (e.g., consumer-protection statutes that override exclusion of refunds).</li>
                                    <li>We reserve the right to change pricing with at least 30 days&apos; notice, effective at your next renewal.</li>
                                    <li>You are responsible for all applicable taxes other than taxes on our income.</li>
                                </ul>
                            </section>

                            {/* 8. Intellectual Property */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Intellectual Property</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    The Service and all its content, features, and functionality are owned by Superkabe and protected by copyright, trademark, trade-secret, and other intellectual-property laws. You retain all rights to content you upload (sequences, leads, mailboxes); you grant Superkabe a worldwide, non-exclusive, royalty-free license to host and process that content as needed to provide the Service.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Feedback you voluntarily submit may be used by Superkabe without obligation, and you waive any claims against us for using or implementing that feedback.
                                </p>
                            </section>

                            {/* 9. Third-party services */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Third-Party Services</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    The Service interoperates with third-party platforms — including Google Workspace, Microsoft 365, Clay, Slack, and Polar — through OAuth, webhooks, or APIs. The availability, behavior, and terms of those third parties are outside our control. We are not responsible for the acts or omissions of third-party providers, and your use of those services is governed by their own terms.
                                </p>
                            </section>

                            {/* 10. Service Levels */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Service Levels</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    We aim for substantial uptime but do not guarantee uninterrupted availability. Scheduled maintenance, third-party outages (e.g., Gmail/Microsoft API downtime), and force-majeure events may impact the Service. Customers on paid tiers may request a current SLA summary from <a href="mailto:legal@superkabe.com" className="text-blue-600 hover:text-blue-800">legal@superkabe.com</a>; Enterprise plans receive an explicit SLA on signature.
                                </p>
                            </section>

                            {/* 11. Limitation of Liability */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Limitation of Liability</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    To the maximum extent permitted by law, Superkabe and its officers, directors, employees, and agents shall not be liable for any indirect, incidental, special, consequential, exemplary, or punitive damages, including without limitation damages for loss of profits, revenue, data, business opportunities, or goodwill, even if advised of the possibility of such damages.
                                </p>
                                <p className="text-gray-600 leading-relaxed">
                                    Superkabe&apos;s aggregate liability arising out of or relating to these Terms or the Service, regardless of the form of action, shall not exceed the greater of (a) the total fees paid by Customer to Superkabe in the twelve (12) months preceding the event giving rise to the claim, or (b) one hundred US dollars (US $100). Some jurisdictions do not allow the exclusion or limitation of certain damages, so portions of this section may not apply to you.
                                </p>
                            </section>

                            {/* 12. Disclaimer */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Disclaimer of Warranties</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    The Service is provided &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; without warranties of any kind, express or implied, including warranties of merchantability, fitness for a particular purpose, non-infringement, or that the Service will be uninterrupted, secure, or error-free. Superkabe does not warrant any specific deliverability outcome, inbox-placement rate, reply rate, or business result. Email deliverability is influenced by factors outside our control (recipient mail-server policies, content quality, list quality, sender reputation history, etc.).
                                </p>
                            </section>

                            {/* 13. Indemnification */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Indemnification</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    You agree to indemnify, defend, and hold harmless Superkabe and its officers, directors, employees, and agents from and against any third-party claims, damages, liabilities, costs, and expenses (including reasonable attorneys&apos; fees) arising out of or relating to (a) your violation of these Terms or applicable law, including the Acceptable Use Policy and Customer Compliance Obligations; (b) the content of email you send through the Service; (c) your transmission of PHI in violation of Section 5.4; or (d) your infringement of third-party rights.
                                </p>
                            </section>

                            {/* 14. Termination */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">14. Suspension &amp; Termination</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    We may suspend or terminate the Service to you with or without notice for breach of these Terms, repeated abuse complaints, non-payment, or risk to platform integrity. You may cancel your account at any time from your account settings; cancellation takes effect at the end of your current billing period. Upon termination, your access ceases and we will delete your account data subject to the retention periods described in our Privacy Policy.
                                </p>
                            </section>

                            {/* 15. Governing Law & Disputes */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">15. Governing Law &amp; Disputes</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    These Terms shall be governed by the laws of the jurisdiction in which Superkabe is incorporated, without regard to its conflict-of-laws principles. Any dispute arising from these Terms shall first be addressed through good-faith negotiation; failing resolution within 30 days, the dispute shall be submitted to binding arbitration in that jurisdiction, except that either party may seek interim or injunctive relief in any court of competent jurisdiction. This clause does not waive any non-waivable rights of consumers under applicable mandatory law.
                                </p>
                            </section>

                            {/* 16. Changes */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">16. Changes to These Terms</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    We may modify these Terms at any time. We will post the updated Terms here with a revised &quot;Last updated&quot; date and, for material changes, provide additional notice (e.g., email or in-product banner) at least 30 days before the change takes effect. Your continued use of the Service after the effective date constitutes acceptance of the updated Terms.
                                </p>
                            </section>

                            {/* 17. Miscellaneous */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">17. Miscellaneous</h2>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2">
                                    <li><strong>Severability:</strong> if any provision is held unenforceable, the remaining provisions remain in full effect.</li>
                                    <li><strong>No Waiver:</strong> our failure to enforce a provision is not a waiver.</li>
                                    <li><strong>Assignment:</strong> you may not assign these Terms without our prior written consent; we may assign without your consent in connection with a merger, acquisition, or sale of assets.</li>
                                    <li><strong>Entire Agreement:</strong> these Terms, together with our Privacy Policy and any DPA, constitute the entire agreement between you and Superkabe regarding the Service.</li>
                                </ul>
                            </section>

                            {/* 18. Contact */}
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">18. Contact Us</h2>
                                <div className="mt-4 p-4 bg-gray-50 border border-gray-100">
                                    <p className="text-gray-700 font-medium">Superkabe — Legal</p>
                                    <p className="text-gray-500">General: <a href="mailto:legal@superkabe.com" className="text-blue-600 hover:text-blue-800">legal@superkabe.com</a></p>
                                    <p className="text-gray-500">Privacy: <a href="mailto:privacy@superkabe.com" className="text-blue-600 hover:text-blue-800">privacy@superkabe.com</a></p>
                                    <p className="text-gray-500">Security: <a href="mailto:security@superkabe.com" className="text-blue-600 hover:text-blue-800">security@superkabe.com</a></p>
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
