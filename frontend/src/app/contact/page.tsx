'use client';
import { useState, FormEvent } from 'react';
import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';

const SUBJECT_OPTIONS = [
    'General Inquiry',
    'Technical Support',
    'Sales',
    'Partnership',
    'Bug Report',
] as const;

export default function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        company: '',
        subject: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const contactPageSchema = {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        "name": "Contact Superkabe",
        "description": "Get in touch with the Superkabe team for support, sales, partnerships, or general inquiries.",
        "url": "https://www.superkabe.com/contact",
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com",
            "logo": "https://www.superkabe.com/image/logo-v2.png",
            "contactPoint": {
                "@type": "ContactPoint",
                "email": "hello@superkabe.com",
                "contactType": "customer support",
                "availableLanguage": "English"
            }
        },
        "datePublished": "2026-03-25",
        "dateModified": "2026-04-07"
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": "How do I contact Superkabe support?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "You can reach us by filling out the contact form on this page or by emailing hello@superkabe.com. We respond to all inquiries within 24 hours."
                }
            },
            {
                "@type": "Question",
                "name": "What is Superkabe's response time?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "We typically respond to all inquiries within 24 hours during business days. Priority support is available for Scale and Enterprise plan customers."
                }
            },
            {
                "@type": "Question",
                "name": "How do I report a bug or technical issue?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Select 'Bug Report' or 'Technical Support' as the subject in our contact form and provide as much detail as possible. Our engineering team will investigate and respond promptly."
                }
            },
            {
                "@type": "Question",
                "name": "Does Superkabe offer partnership opportunities?",
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Yes, we partner with agencies, ESPs, and outbound tooling companies. Select 'Partnership' in the contact form to start a conversation with our partnerships team."
                }
            }
        ]
    };

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setSubmitting(true);

        // TODO: Wire to backend endpoint
        console.log('Contact form submission:', formData);
        await new Promise(r => setTimeout(r, 600));

        setSubmitting(false);
        setSubmitted(true);
    }

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageSchema) }} />
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

            {/* ================= NAVBAR ================= */}
            <Navbar />

            {/* Hero Section */}
            <div className="relative pt-32 md:pt-36 pb-10 md:pb-12 text-center px-4 md:px-6">
                <div className="fixed inset-0 pointer-events-none z-0">
                    <div className="cloud-bg">
                        <div className="cloud-shadow" />
                        <div className="cloud-puff-1" />
                        <div className="cloud-puff-2" />
                        <div className="cloud-puff-3" />
                    </div>
                    <div className="absolute inset-0 hero-grid"></div>
                </div>

                <div className="relative z-10 max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 md:mb-6 text-gray-900 tracking-tight uppercase">
                        Contact Us
                    </h1>
                    <p className="text-lg md:text-2xl text-gray-500 mb-2 max-w-2xl mx-auto">
                        We&apos;d Love to Hear From You
                    </p>
                    <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
                        Whether you have a question about our platform, need technical support, or want to explore a partnership — our team is ready to help.
                    </p>
                </div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 max-w-6xl mx-auto px-4 md:px-6 pb-10">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 md:p-10">
                            {submitted ? (
                                <div className="text-center py-12 md:py-16">
                                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                                        Message Sent
                                    </h2>
                                    <p className="text-gray-600 text-lg mb-2">
                                        Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                                    </p>
                                    <p className="text-gray-500 text-sm mb-8">
                                        A confirmation has been sent to <span className="font-medium text-gray-700">{formData.email}</span>.
                                    </p>
                                    <button
                                        onClick={() => {
                                            setSubmitted(false);
                                            setFormData({ name: '', email: '', company: '', subject: '', message: '' });
                                        }}
                                        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1E1E2F] text-white rounded-lg font-medium hover:bg-[#2a2a3f] transition-colors"
                                    >
                                        Send Another Message
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">
                                        Send Us a Message
                                    </h2>
                                    <form onSubmit={handleSubmit} className="space-y-5">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Name */}
                                            <div>
                                                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Name <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="text"
                                                    id="name"
                                                    name="name"
                                                    required
                                                    value={formData.name}
                                                    onChange={handleChange}
                                                    placeholder="Your full name"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E1E2F]/20 focus:border-[#1E1E2F] transition-colors"
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Email <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    type="email"
                                                    id="email"
                                                    name="email"
                                                    required
                                                    value={formData.email}
                                                    onChange={handleChange}
                                                    placeholder="you@company.com"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E1E2F]/20 focus:border-[#1E1E2F] transition-colors"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            {/* Company */}
                                            <div>
                                                <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Company
                                                </label>
                                                <input
                                                    type="text"
                                                    id="company"
                                                    name="company"
                                                    value={formData.company}
                                                    onChange={handleChange}
                                                    placeholder="Your company name"
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E1E2F]/20 focus:border-[#1E1E2F] transition-colors"
                                                />
                                            </div>

                                            {/* Subject */}
                                            <div>
                                                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                    Subject <span className="text-red-500">*</span>
                                                </label>
                                                <select
                                                    id="subject"
                                                    name="subject"
                                                    required
                                                    value={formData.subject}
                                                    onChange={handleChange}
                                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-[#1E1E2F]/20 focus:border-[#1E1E2F] transition-colors appearance-none"
                                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%236b7280' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 16px center' }}
                                                >
                                                    <option value="" disabled>Select a subject</option>
                                                    {SUBJECT_OPTIONS.map(opt => (
                                                        <option key={opt} value={opt}>{opt}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        <div>
                                            <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1.5">
                                                Message <span className="text-red-500">*</span>
                                            </label>
                                            <textarea
                                                id="message"
                                                name="message"
                                                required
                                                rows={6}
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Tell us how we can help..."
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1E1E2F]/20 focus:border-[#1E1E2F] transition-colors resize-y"
                                            />
                                        </div>

                                        <button
                                            type="submit"
                                            disabled={submitting}
                                            className="w-full md:w-auto px-8 py-3.5 bg-[#1E1E2F] text-white rounded-lg font-semibold text-base hover:bg-[#2a2a3f] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {submitting ? (
                                                <>
                                                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                                    </svg>
                                                    Sending...
                                                </>
                                            ) : (
                                                'Send Message'
                                            )}
                                        </button>
                                    </form>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-6">
                        {/* Email Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Email Us</h3>
                            </div>
                            <a
                                href="mailto:hello@superkabe.com"
                                className="text-[#1E1E2F] font-medium hover:underline break-all"
                            >
                                hello@superkabe.com
                            </a>
                        </div>

                        {/* Response Time Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Response Time</h3>
                            </div>
                            <p className="text-gray-600">
                                We respond to all inquiries <span className="font-semibold text-gray-900">within 24 hours</span> during business days.
                            </p>
                        </div>

                        {/* Quick Links Card */}
                        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">Quick Links</h3>
                            </div>
                            <ul className="space-y-3">
                                <li>
                                    <Link
                                        href="/docs"
                                        className="flex items-center gap-2 text-gray-600 hover:text-[#1E1E2F] transition-colors group"
                                    >
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-[#1E1E2F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Documentation
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/infrastructure-playbook"
                                        className="flex items-center gap-2 text-gray-600 hover:text-[#1E1E2F] transition-colors group"
                                    >
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-[#1E1E2F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        Infrastructure Playbook
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/pricing"
                                        className="flex items-center gap-2 text-gray-600 hover:text-[#1E1E2F] transition-colors group"
                                    >
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-[#1E1E2F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                        </svg>
                                        Pricing Plans
                                    </Link>
                                </li>
                                <li>
                                    <Link
                                        href="/blog"
                                        className="flex items-center gap-2 text-gray-600 hover:text-[#1E1E2F] transition-colors group"
                                    >
                                        <svg className="w-4 h-4 text-gray-400 group-hover:text-[#1E1E2F] transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                                        </svg>
                                        Blog
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            {/* ================= FOOTER ================= */}
            <Footer />
        </div>
    );
}
