import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    GOAL_META,
    FRAMEWORK_META,
    type TemplateGoal,
    type TemplateFramework,
} from '@/data/coldEmailTemplates';
import StandaloneGeneratorClient from './StandaloneGeneratorClient';
import HeroQuotaLine from './HeroQuotaLine';
import AuthAwareCtaButtons from '../AuthAwareCtaButtons';

const SITE = 'https://www.superkabe.com';
const PATH = '/cold-email-templates/generate';

export const metadata: Metadata = {
    title: 'Generate a Cold Email with AI — Free | Superkabe',
    description:
        'Free AI cold email generator. Tell us your business, your value prop, who you\'re targeting, and the goal — get a high-reply-rate cold email in seconds. No signup required for the first 3 generations.',
    alternates: { canonical: PATH },
    openGraph: {
        title: 'Generate a Cold Email with AI — Free',
        description: 'Free AI cold email generator. Tell us about your business and target. Get a customized cold email in seconds.',
        url: `${SITE}${PATH}`,
        siteName: 'Superkabe',
        type: 'website',
        images: [{ url: '/image/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'AI Cold Email Generator — Free',
        description: 'Free AI cold email generator. No signup required for first 3 generations.',
        images: ['/image/og-image.png'],
    },
};

export default function GenerateColdEmailPage() {
    const goalOptions = (Object.keys(GOAL_META) as TemplateGoal[]).map((v) => ({
        value: v,
        label: GOAL_META[v].label,
        description: GOAL_META[v].description,
    }));
    const frameworkOptions = (Object.keys(FRAMEWORK_META) as TemplateFramework[]).map((v) => ({
        value: v,
        label: FRAMEWORK_META[v].label,
        description: FRAMEWORK_META[v].description,
    }));

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
            { '@type': 'ListItem', position: 2, name: 'Cold Email Templates', item: `${SITE}/cold-email-templates` },
            { '@type': 'ListItem', position: 3, name: 'AI Generator', item: `${SITE}${PATH}` },
        ],
    };

    const webAppSchema = {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'Cold Email AI Generator',
        url: `${SITE}${PATH}`,
        applicationCategory: 'BusinessApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        creator: { '@type': 'Organization', name: 'Superkabe', url: SITE },
    };

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
            />

            <Navbar />

            {/* ─── Hero ───────────────────────────────────────────────── */}
            <section className="px-6 pt-24 pb-10 md:pt-32">
                <div className="max-w-4xl mx-auto">
                    <nav className="text-xs text-[#6B5E4F] mb-6 flex items-center gap-1 flex-wrap" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-[#1E1E2F]">Home</Link>
                        <ChevronRight size={12} />
                        <Link href="/cold-email-templates" className="hover:text-[#1E1E2F]">Cold Email Templates</Link>
                        <ChevronRight size={12} />
                        <span>AI Generator</span>
                    </nav>

                    <h1 className="text-3xl md:text-5xl font-semibold tracking-tight leading-tight mb-4">
                        Generate a cold email with AI
                    </h1>
                    <p className="text-lg text-[#4A3F30] max-w-2xl mb-2">
                        Tell us about your business, your value proposition, who you&apos;re targeting, and the goal of the email. Get a customized cold email in seconds — no signup required.
                    </p>
                    <HeroQuotaLine from={PATH} />
                </div>
            </section>

            {/* ─── Generator client ──────────────────────────────────── */}
            <section className="px-6 pb-20">
                <div className="max-w-4xl mx-auto">
                    <StandaloneGeneratorClient
                        goalOptions={goalOptions}
                        frameworkOptions={frameworkOptions}
                    />
                </div>
            </section>

            {/* ─── Soft CTA ──────────────────────────────────────────── */}
            <section className="px-6 pb-24">
                <div className="max-w-4xl mx-auto rounded-2xl bg-[#1E1E2F] text-white p-8 md:p-10">
                    <h2 className="text-xl md:text-2xl font-semibold mb-3">
                        Want unlimited generations + the platform that sends them?
                    </h2>
                    <p className="text-sm md:text-base text-[#D1CBC5] mb-6 max-w-2xl">
                        Inside Superkabe you can generate unlimited variations, save them to your template library, and send them across mailboxes with deliverability protection built in.
                    </p>
                    <AuthAwareCtaButtons
                        from={PATH}
                        intent="ai-customize"
                        secondary={{ href: '/cold-email-templates', label: 'Browse template library' }}
                    />
                </div>
            </section>

            <Footer />
        </div>
    );
}
