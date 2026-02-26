import Link from 'next/link';
import Image from 'next/image';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import { ArrowRight, Shield, Activity, Mail, Globe, Zap, BookOpen } from 'lucide-react';
import type { Metadata } from 'next';
import CloudBackground from '@/components/CloudBackground';

export const metadata: Metadata = {
    title: 'Blog – Superkabe',
    description: 'Deep technical guides on email deliverability, sender reputation, domain warming, and infrastructure protection for outbound teams.',
    alternates: {
        canonical: '/blog',
    },
};

const articles = [
    {
        slug: 'introducing-infrastructure-assessment',
        title: 'How to assess your outbound email infrastructure before sending your first campaign',
        description: 'Stop guessing about your deliverability. Our new Infrastructure Assessment scores your domains, DNS, and mailbox health before you send a single email.',
        icon: Activity,
        readTime: '3 min read',
        tag: 'New Feature',
    },
    {
        slug: 'email-deliverability-guide',
        title: 'How to protect and master your outbound email deliverability',
        description: 'Everything outbound email operators need to know about sending infrastructure, sender reputation, DNS authentication, domain warming, and protecting deliverability at scale.',
        icon: BookOpen,
        readTime: '20 min read',
        tag: 'Complete Guide',
    },
    {
        slug: 'bounce-rate-deliverability',
        title: 'How bounce rates damage sender reputation (and how to prevent it)',
        description: 'Understanding the mechanics of bounce rates, their impact on sender reputation, and how to prevent domain degradation before it becomes irreversible.',
        icon: Activity,
        readTime: '8 min read',
        tag: 'Technical',
    },
    {
        slug: 'spf-dkim-dmarc-explained',
        title: 'Step-by-step DNS authentication (SPF, DKIM, DMARC) setup for outbound teams',
        description: 'A technical breakdown of email authentication protocols, how they protect your sender identity, and why misconfiguration leads to inbox placement failure.',
        icon: Shield,
        readTime: '10 min read',
        tag: 'DNS',
    },
    {
        slug: 'domain-warming-methodology',
        title: 'How to safely warm up new outbound email domains',
        description: 'The systematic approach to building sender reputation on new domains, including volume ramp schedules, warming signals, and common mistakes that burn domains.',
        icon: Globe,
        readTime: '9 min read',
        tag: 'Strategy',
    },
    {
        slug: 'email-reputation-lifecycle',
        title: 'How sender reputation is built, damaged, and repaired over time',
        description: 'How email reputation is built, maintained, damaged, and recovered. Covers ISP scoring models, feedback loops, and the point of no return for domain reputation.',
        icon: Mail,
        readTime: '11 min read',
        tag: 'Deep Dive',
    },
];

export default function BlogPage() {
    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans overflow-hidden">

            {/* ================= NAVBAR ================= */}
            <Navbar />

            {/* Hero */}
            <section className="relative pt-32 md:pt-36 pb-20 text-center">
                {/* Unified Fixed Background Layer */}
                <div className="fixed inset-0 pointer-events-none z-0">
                    <CloudBackground />
                    <div className="absolute inset-0 hero-grid"></div>
                </div>
                <div className="relative z-10 max-w-4xl mx-auto px-6">
                    <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm font-semibold mb-6">
                        <Zap size={14} className="inline mr-1.5" />
                        Superkabe Blog
                    </div>
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-gray-900 mb-6 uppercase">
                        Email Infrastructure Intelligence
                    </h1>
                    <p className="text-xl text-gray-500 max-w-2xl mx-auto leading-relaxed">
                        Deep technical guides on deliverability, authentication, domain health, and reputation management for outbound email operators.
                    </p>
                </div>
            </section>

            {/* Articles Grid */}
            <section className="relative z-10 pb-24 px-6">
                <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
                    {articles.map((article) => {
                        const Icon = article.icon;
                        return (
                            <Link
                                key={article.slug}
                                href={`/blog/${article.slug}`}
                                className="block bg-white p-8 md:p-10 rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 transition-all duration-300 group"
                            >
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                                        <Icon size={20} className="text-blue-600" />
                                    </div>
                                    <span className="text-xs text-gray-400 font-medium">{article.readTime}</span>
                                    <span className="ml-auto px-2.5 py-1 bg-gray-50 text-gray-500 text-xs font-medium rounded-full">{article.tag}</span>
                                </div>
                                <h2 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">{article.title}</h2>
                                <p className="text-gray-500 text-sm leading-relaxed mb-4">{article.description}</p>
                                <span className="text-blue-600 text-sm font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                                    Read Article <ArrowRight size={14} />
                                </span>
                            </Link>
                        );
                    })}
                </div>
            </section>

            <Footer />
        </div>
    );
}
