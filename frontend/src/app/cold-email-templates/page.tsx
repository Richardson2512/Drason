import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    TEMPLATES,
    GOAL_META,
    INDUSTRY_META,
    ROLE_META,
    FRAMEWORK_META,
} from '@/data/coldEmailTemplates';
import TemplatesClient from './TemplatesClient';
import AuthAwareCtaButtons from './AuthAwareCtaButtons';

const SITE = 'https://www.superkabe.com';
const PATH = '/cold-email-templates';

export const metadata: Metadata = {
    title: 'Cold Email Templates That Actually Get Replies — Free + AI-Customizable | Superkabe',
    description:
        'Free library of high-converting cold email templates. AI-customizable in seconds. Compliance built in for Gmail/Yahoo 2024 sender requirements. Industry-specific, role-specific, framework-tagged.',
    alternates: { canonical: PATH },
    openGraph: {
        title: 'Cold Email Templates That Actually Get Replies',
        description:
            'Free library of cold email templates with AI customization, deliverability scoring, and built-in compliance. Filter by goal, industry, role, and framework.',
        url: `${SITE}${PATH}`,
        siteName: 'Superkabe',
        type: 'website',
        images: [{ url: '/image/og-image.png', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Cold Email Templates That Actually Get Replies',
        description:
            'Free library of cold email templates with AI customization, deliverability scoring, and built-in compliance.',
        images: ['/image/og-image.png'],
    },
};

export default function ColdEmailTemplatesPage() {
    // ─── JSON-LD: CollectionPage + ItemList of templates ───────────────
    const collectionSchema = {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Cold Email Templates',
        description:
            'Free library of cold email templates curated for high reply rates, with AI customization and deliverability scoring built in.',
        url: `${SITE}${PATH}`,
        isPartOf: { '@type': 'WebSite', name: 'Superkabe', url: SITE },
        mainEntity: {
            '@type': 'ItemList',
            itemListElement: TEMPLATES.map((t, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                url: `${SITE}${PATH}/${t.slug}`,
                name: t.title,
            })),
        },
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
            { '@type': 'ListItem', position: 2, name: 'Cold Email Templates', item: `${SITE}${PATH}` },
        ],
    };

    // Distinct values for filter chips (preserves canonical order)
    const goalValues = Array.from(new Set(TEMPLATES.map((t) => t.goal)));
    const industryValues = Array.from(new Set(TEMPLATES.map((t) => t.industry)));
    const roleValues = Array.from(new Set(TEMPLATES.map((t) => t.role)));
    const frameworkValues = Array.from(new Set(TEMPLATES.map((t) => t.framework)));

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <Navbar />

            {/* ─── Hero — centered, condensed, premium ─────────────────── */}
            <section className="px-6 pt-24 pb-10 md:pt-32 md:pb-14">
                <div className="max-w-3xl mx-auto text-center">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D1CBC5] text-[10px] font-semibold uppercase tracking-wider text-[#4A3F30] mb-6">
                        Free Template Library
                    </span>

                    <h1 className="text-4xl md:text-5xl lg:text-[3.5rem] font-semibold tracking-tight leading-[1.1] mb-5">
                        Cold Email Templates That Actually Get Replies
                    </h1>

                    <p className="text-base md:text-lg text-[#4A3F30] max-w-2xl mx-auto mb-8 leading-relaxed">
                        {TEMPLATES.length} hand-curated templates with the AI prompts that built them. Annotated with what works, scored for deliverability against Gmail and Yahoo&apos;s 2024 sender rules.
                    </p>

                    <div className="flex flex-wrap justify-center gap-3 mb-6">
                        <Link
                            href={`${PATH}/generate`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#1E1E2F] text-white text-sm font-semibold hover:bg-[#2A2A3F] transition"
                        >
                            Generate your own with AI →
                        </Link>
                        <a
                            href="#templates"
                            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-[#D1CBC5] text-[#1E1E2F] text-sm font-semibold hover:border-[#1E1E2F] transition"
                        >
                            Browse {TEMPLATES.length} templates
                        </a>
                    </div>

                    <ul className="flex flex-wrap justify-center gap-x-5 gap-y-1.5 text-xs text-[#6B5E4F]">
                        <li className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#1E1E2F]" />
                            Free, no signup
                        </li>
                        <li className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#1E1E2F]" />
                            Visible AI prompts
                        </li>
                        <li className="flex items-center gap-1.5">
                            <span className="w-1 h-1 rounded-full bg-[#1E1E2F]" />
                            Compliance + deliverability scored
                        </li>
                    </ul>
                </div>
            </section>

            {/* ─── Templates client (search + filter + grid) ───────────── */}
            <section id="templates" className="px-6 pb-20">
                <div className="max-w-7xl mx-auto">
                    <TemplatesClient
                        templates={TEMPLATES}
                        goalValues={goalValues}
                        industryValues={industryValues}
                        roleValues={roleValues}
                        frameworkValues={frameworkValues}
                        goalMeta={GOAL_META}
                        industryMeta={INDUSTRY_META}
                        roleMeta={ROLE_META}
                        frameworkMeta={FRAMEWORK_META}
                    />
                </div>
            </section>

            {/* ─── Soft CTA ────────────────────────────────────────────── */}
            <section className="px-6 pb-24">
                <div className="max-w-4xl mx-auto rounded-2xl bg-[#1E1E2F] text-white p-8 md:p-12">
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight mb-4">
                        Send these templates at scale — with deliverability protection built in
                    </h2>
                    <p className="text-base text-[#D1CBC5] mb-6 max-w-2xl">
                        Pick a template, generate a sequence with AI, send across unlimited mailboxes. Superkabe auto-handles validation, recovery, and Gmail/Yahoo 2024 compliance — so the templates that work in this library actually deliver to the inbox.
                    </p>
                    <AuthAwareCtaButtons
                        from={PATH}
                        secondary={{ href: '/pricing', label: 'See pricing' }}
                    />
                </div>
            </section>

            <Footer />
        </div>
    );
}
