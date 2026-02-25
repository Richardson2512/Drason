'use client';

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function TermsPage() {
    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans">
            {/* Navbar */}
            <Navbar />

            {/* Unified Fixed Background Layer */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="hero-blur opacity-50">
                    <div className="blur-blob blur-purple opacity-40"></div>
                    <div className="blur-blob blur-blue opacity-40"></div>
                    <div className="blur-blob blur-pink opacity-40"></div>
                </div>
                <div className="hero-moon"></div>
                <div className="absolute inset-0 hero-grid"></div>
            </div>

            {/* Content */}
            <div className="pt-32 md:pt-36 pb-24 px-6">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-[2rem] p-10 md:p-14 shadow-xl shadow-gray-200/50 border border-gray-100">
                        <h1 className="text-4xl font-bold mb-2 text-gray-900">Terms & Conditions</h1>
                        <p className="text-gray-500 mb-8">Last updated: February 9, 2026</p>

                        <div className="prose prose-gray max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Acceptance of Terms</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    By accessing and using Superkabe (&quot;Service&quot;), you accept and agree to be bound by the terms and provisions of this agreement. If you do not agree to these terms, please do not use our Service.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Description of Service</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Superkabe provides email infrastructure protection services, including but not limited to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li>Real-time domain and mailbox health monitoring</li>
                                    <li>Automated mailbox pausing and traffic rerouting</li>
                                    <li>Integration with third-party email and enrichment platforms</li>
                                    <li>Analytics and reporting dashboards</li>
                                    <li>Lead scoring and routing capabilities</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. User Accounts</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    To use certain features of the Service, you must register for an account. You agree to:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li>Provide accurate and complete registration information</li>
                                    <li>Maintain the security of your account credentials</li>
                                    <li>Promptly notify us of any unauthorized use of your account</li>
                                    <li>Accept responsibility for all activities under your account</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Acceptable Use</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">You agree not to use the Service to:</p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li>Send spam or unsolicited commercial communications</li>
                                    <li>Violate any applicable laws or regulations</li>
                                    <li>Infringe upon intellectual property rights of others</li>
                                    <li>Transmit malicious code or interfere with the Service</li>
                                    <li>Attempt to gain unauthorized access to our systems</li>
                                    <li>Engage in any activity that could damage our reputation</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Payment Terms</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Paid subscriptions are billed in advance on a monthly or annual basis. All fees are non-refundable except as expressly stated in this agreement. We reserve the right to change our prices with 30 days&apos; notice.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Intellectual Property</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    The Service and its original content, features, and functionality are owned by Superkabe and are protected by international copyright, trademark, and other intellectual property laws. You may not copy, modify, or distribute our content without prior written consent.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Third-Party Integrations</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Our Service integrates with third-party platforms such as Smartlead and Clay. Your use of these integrations is subject to the respective terms of service of those platforms. We are not responsible for the availability or functionality of third-party services.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Limitation of Liability</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    To the maximum extent permitted by law, Superkabe shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including but not limited to loss of profits, data, or business opportunities, arising out of your use of the Service.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Disclaimer of Warranties</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    The Service is provided &quot;as is&quot; and &quot;as available&quot; without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Termination</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We may terminate or suspend your account immediately, without prior notice, for any reason, including breach of these Terms. Upon termination, your right to use the Service will cease immediately.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">11. Governing Law</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law principles.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">12. Changes to Terms</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We reserve the right to modify these Terms at any time. We will provide notice of significant changes by posting the updated Terms on our website. Your continued use of the Service after such changes constitutes acceptance of the new Terms.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">13. Contact Us</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    If you have any questions about these Terms, please contact us at:
                                </p>
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-gray-700 font-medium">Superkabe Legal</p>
                                    <p className="text-gray-500">Email: legal@superkabe.com</p>
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
