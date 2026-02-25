'use client';

import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

export default function PrivacyPolicyPage() {
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
                        <h1 className="text-4xl font-bold mb-2 text-gray-900">Privacy Policy</h1>
                        <p className="text-gray-500 mb-8">Last updated: February 9, 2026</p>

                        <div className="prose prose-gray max-w-none">
                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Introduction</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    Welcome to Superkabe (&quot;Company&quot;, &quot;we&quot;, &quot;our&quot;, &quot;us&quot;). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our email infrastructure protection platform.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Information We Collect</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">We collect information that you provide directly to us, including:</p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li><strong>Account Information:</strong> Name, email address, company name, and password when you register.</li>
                                    <li><strong>Integration Data:</strong> API keys and webhook configurations for third-party services (Smartlead, Clay).</li>
                                    <li><strong>Usage Data:</strong> Information about how you interact with our platform, including domain health metrics, email statistics, and system logs.</li>
                                    <li><strong>Communication Data:</strong> Records of correspondence when you contact our support team.</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">3. How We Use Your Information</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">We use the information we collect to:</p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li>Provide, maintain, and improve our email infrastructure protection services</li>
                                    <li>Monitor domain health and prevent email deliverability issues</li>
                                    <li>Send you technical notices, updates, and support messages</li>
                                    <li>Respond to your comments, questions, and customer service requests</li>
                                    <li>Analyze usage patterns to enhance our platform</li>
                                    <li>Detect and prevent fraudulent or unauthorized activity</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We do not sell, trade, or rent your personal information to third parties. We may share your information only in the following circumstances:
                                </p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li><strong>Service Providers:</strong> With vendors who assist us in operating our platform</li>
                                    <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
                                    <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">5. Data Security</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We implement industry-standard security measures to protect your data, including encryption in transit and at rest, secure API authentication, and regular security audits. However, no method of transmission over the Internet is 100% secure.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Data Retention</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We retain your personal information for as long as your account is active or as needed to provide you services. You may request deletion of your data at any time by contacting us.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Your Rights</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">Depending on your location, you may have the right to:</p>
                                <ul className="list-disc pl-6 text-gray-600 space-y-2 mb-4">
                                    <li>Access and receive a copy of your personal data</li>
                                    <li>Rectify inaccurate or incomplete data</li>
                                    <li>Request deletion of your personal data</li>
                                    <li>Object to or restrict processing of your data</li>
                                    <li>Data portability</li>
                                </ul>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Cookies and Tracking</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We use cookies and similar tracking technologies to collect information about your browsing activities. You can control cookies through your browser settings.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">9. Changes to This Policy</h2>
                                <p className="text-gray-600 leading-relaxed mb-4">
                                    We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the &quot;Last updated&quot; date.
                                </p>
                            </section>

                            <section className="mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-4">10. Contact Us</h2>
                                <p className="text-gray-600 leading-relaxed">
                                    If you have any questions about this Privacy Policy, please contact us at:
                                </p>
                                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                    <p className="text-gray-700 font-medium">Superkabe Support</p>
                                    <p className="text-gray-500">Email: privacy@superkabe.com</p>
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
