import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'The Outbound Email Infrastructure Playbook – Superkabe',
    description: 'A comprehensive guide to why outbound email infrastructure fails, and the authoritative resources to assess, protect, and heal your domains.',
    alternates: {
        canonical: '/infrastructure-playbook',
    },
};

export default function InfrastructurePlaybookPage() {
    const playbookSchema = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "The Outbound Email Infrastructure Playbook",
        "description": "A comprehensive guide to why outbound email infrastructure fails, and the authoritative resources to assess, protect, and heal your domains.",
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe"
        }
    };

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans overflow-hidden">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(playbookSchema) }} />

            {/* ================= NAVBAR ================= */}
            <header className="fixed top-8 left-0 right-0 flex justify-center z-50">
                <div className="glass-nav px-10 py-4 flex items-center gap-10 shadow-sm bg-white/60 backdrop-blur-md border border-white/20 rounded-full">
                    <Link href="/" className="flex items-center gap-2">
                        <Image src="/image/logo-v2.png" alt="Superkabe Logo" width={32} height={32} />
                        <span className="font-bold text-xl tracking-tight">Superkabe</span>
                    </Link>
                    <nav className="hidden md:flex gap-8 text-gray-600 text-sm font-medium">
                        <Link href="/product" className="hover:text-black transition-colors">Product</Link>
                        <Link href="/docs" className="hover:text-black transition-colors">Documentation</Link>
                        <Link href="/pricing" className="hover:text-black transition-colors">Pricing</Link>
                        <Link href="/blog" className="hover:text-black transition-colors">Blog</Link>
                    </nav>
                    <div className="flex gap-4 items-center">
                        <Link href="/signup" className="px-6 py-2 bg-black text-white rounded-full text-sm font-medium hover:bg-gray-800 transition-colors shadow-lg shadow-black/20">
                            Get Started
                        </Link>
                    </div>
                </div>
            </header>

            <section className="relative pt-48 pb-16 px-6 max-w-4xl mx-auto">
                <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 text-center">
                    The Outbound Infrastructure Playbook
                </h1>

                <div className="bg-white p-8 rounded-3xl border border-blue-100 shadow-sm mb-12">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">What is outbound email infrastructure (and why does it fail?)</h2>
                    <p className="text-gray-600 leading-relaxed max-w-3xl mb-4">
                        Outbound email infrastructure consists of the domains, mailboxes, and DNS authentication records (SPF, DKIM, DMARC) used to send cold emails at scale. It fails because <strong>sender reputation is fragile</strong>. Sending too fast, ignoring hard bounces, or missing DNS records causes ISPs to silently route your emails to the spam folder—or block them entirely. This is called domain burnout.
                    </p>
                    <p className="text-gray-600 leading-relaxed max-w-3xl">
                        This playbook contains the authoritative resources to help you assess, protect, and heal your infrastructure.
                    </p>
                </div>

                <div className="space-y-6">
                    <Link href="/blog/introducing-infrastructure-assessment" className="block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">How to assess your outbound email infrastructure before sending your first campaign</h2>
                        <p className="text-gray-600 text-sm">This answers: How do I know if my domains and mailboxes are actually healthy before I start a live campaign?</p>
                    </Link>

                    <Link href="/blog/email-deliverability-guide" className="block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">How to protect and master your outbound email deliverability</h2>
                        <p className="text-gray-600 text-sm">This answers: What are the exact technical requirements and strategies to maintain 95%+ email deliverability at scale?</p>
                    </Link>

                    <Link href="/blog/bounce-rate-deliverability" className="block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">How bounce rates damage sender reputation (and how to prevent it)</h2>
                        <p className="text-gray-600 text-sm">This answers: How do bounce rates actually affect my sender reputation over time, and what is a safe threshold?</p>
                    </Link>

                    <Link href="/blog/spf-dkim-dmarc-explained" className="block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">Step-by-step DNS authentication (SPF, DKIM, DMARC) setup for outbound teams</h2>
                        <p className="text-gray-600 text-sm">This answers: How exactly do I configure SPF, DKIM, and DMARC to ensure my cold emails land in the primary inbox?</p>
                    </Link>

                    <Link href="/blog/domain-warming-methodology" className="block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">How to safely warm up new outbound email domains</h2>
                        <p className="text-gray-600 text-sm">This answers: What is the correct schedule and methodology for warming up new domains without burning them?</p>
                    </Link>

                    <Link href="/blog/email-reputation-lifecycle" className="block bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all group">
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600">How sender reputation is built, damaged, and repaired over time</h2>
                        <p className="text-gray-600 text-sm">This answers: Is it possible to recover a burned domain, and how exactly are ISP reputation scores calculated?</p>
                    </Link>
                </div>
            </section>

            <Footer />
        </div>
    );
}
