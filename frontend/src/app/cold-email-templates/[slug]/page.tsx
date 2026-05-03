import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ChevronRight, Mail, FileText, Sparkles, ShieldCheck, CheckCircle2, AlertCircle, Layers, Tag, User, Building2, Quote,
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
    TEMPLATES,
    GOAL_META,
    INDUSTRY_META,
    ROLE_META,
    FRAMEWORK_META,
    getTemplateBySlug,
    getRelatedTemplates,
    wordCount,
} from '@/data/coldEmailTemplates';
import TemplateActions from './TemplateActions';
import AuthAwareCtaButtons from '../AuthAwareCtaButtons';

const SITE = 'https://www.superkabe.com';
const PATH_BASE = '/cold-email-templates';

// Statically generate every template page at build time for max SEO + speed.
export function generateStaticParams() {
    return TEMPLATES.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const { slug } = await params;
    const t = getTemplateBySlug(slug);
    if (!t) return { title: 'Template not found' };

    const title = `${t.title} — Cold Email Template + AI Prompt | Superkabe`;
    const description = `Cold email template: "${t.subject}" — ${t.bestFor}. Includes the AI prompt to recreate or customize, deliverability score (${t.deliverabilityScore}/100), and annotations on what works.`;

    return {
        title,
        description,
        alternates: { canonical: `${PATH_BASE}/${t.slug}` },
        openGraph: {
            title: `${t.title} — Free Cold Email Template`,
            description,
            url: `${SITE}${PATH_BASE}/${t.slug}`,
            siteName: 'Superkabe',
            type: 'article',
            images: [{ url: '/image/og-image.png', width: 1200, height: 630 }],
        },
        twitter: {
            card: 'summary_large_image',
            title: t.title,
            description,
            images: ['/image/og-image.png'],
        },
    };
}

export default async function TemplateDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const template = getTemplateBySlug(slug);
    if (!template) notFound();

    const wc = wordCount(template.body);
    const related = getRelatedTemplates(template.slug, 3);

    // ─── JSON-LD: Article + Breadcrumb ────────────────────────────────
    const articleSchema = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: template.title,
        description: template.bestFor,
        author: { '@type': 'Organization', name: 'Superkabe', url: SITE },
        publisher: {
            '@type': 'Organization',
            name: 'Superkabe',
            url: SITE,
            logo: { '@type': 'ImageObject', url: `${SITE}/image/logo-v2.png` },
        },
        mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE}${PATH_BASE}/${template.slug}` },
        articleSection: GOAL_META[template.goal].label,
        keywords: [
            'cold email template',
            template.title.toLowerCase(),
            GOAL_META[template.goal].label.toLowerCase(),
            INDUSTRY_META[template.industry].toLowerCase(),
            FRAMEWORK_META[template.framework].label.toLowerCase(),
        ].join(', '),
    };

    const breadcrumbSchema = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Home', item: SITE },
            { '@type': 'ListItem', position: 2, name: 'Cold Email Templates', item: `${SITE}${PATH_BASE}` },
            { '@type': 'ListItem', position: 3, name: template.title, item: `${SITE}${PATH_BASE}/${template.slug}` },
        ],
    };

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
            />

            <Navbar />

            {/* ─── Header ──────────────────────────────────────────────── */}
            <section className="px-6 pt-24 pb-8 md:pt-32">
                <div className="max-w-4xl mx-auto">
                    <nav className="text-xs text-[#6B5E4F] mb-6 flex items-center gap-1 flex-wrap" aria-label="Breadcrumb">
                        <Link href="/" className="hover:text-[#1E1E2F]">Home</Link>
                        <ChevronRight size={12} />
                        <Link href={PATH_BASE} className="hover:text-[#1E1E2F]">Cold Email Templates</Link>
                        <ChevronRight size={12} />
                        <span className="text-[#1E1E2F]">{template.title}</span>
                    </nav>

                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-tight leading-tight mb-4">
                        {template.title}
                    </h1>

                    <p className="text-lg text-[#4A3F30] mb-6">{template.bestFor}</p>

                    <div className="flex flex-wrap gap-2 mb-6">
                        <Pill icon={<Tag size={11} strokeWidth={2} />} label={GOAL_META[template.goal].label} />
                        {template.industry !== 'general' && (
                            <Pill icon={<Building2 size={11} strokeWidth={2} />} label={INDUSTRY_META[template.industry]} />
                        )}
                        {template.role !== 'general' && (
                            <Pill icon={<User size={11} strokeWidth={2} />} label={ROLE_META[template.role]} />
                        )}
                        <Pill icon={<Layers size={11} strokeWidth={2} />} label={FRAMEWORK_META[template.framework].label} />
                        <Pill icon={<FileText size={11} strokeWidth={2} />} label={`${wc} words`} />
                        <DeliverabilityScore score={template.deliverabilityScore} />
                    </div>
                </div>
            </section>

            {/* ─── Template body + sidebar ─────────────────────────────── */}
            <section className="px-6 pb-12">
                <div className="max-w-4xl mx-auto">
                    <div className="grid lg:grid-cols-[1fr,300px] gap-6">
                        {/* Main column — template content + actions */}
                        <div className="space-y-6">
                            {/* Subject card */}
                            <div className="rounded-xl bg-white border border-[#D1CBC5] p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-xs uppercase tracking-wide text-[#6B5E4F] font-semibold">Subject</h2>
                                </div>
                                <p className="text-base font-medium">{template.subject}</p>
                            </div>

                            {/* Body card */}
                            <div className="rounded-xl bg-white border border-[#D1CBC5] p-5">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-xs uppercase tracking-wide text-[#6B5E4F] font-semibold">Body</h2>
                                </div>
                                <pre className="font-sans text-base leading-relaxed whitespace-pre-wrap text-[#1E1E2F]">
{template.body}
                                </pre>
                            </div>

                            {/* Copy actions + AI customize modal (client component) */}
                            <TemplateActions
                                subject={template.subject}
                                body={template.body}
                                prompt={template.prompt}
                                templateSlug={template.slug}
                                templateTitle={template.title}
                                templateTone={template.tone}
                            />

                            {/* AI prompt card */}
                            <div className="rounded-xl bg-[#1E1E2F] text-white p-5">
                                <div className="flex items-center gap-2 mb-3">
                                    <Sparkles size={14} strokeWidth={2} />
                                    <h2 className="text-xs uppercase tracking-wide font-semibold">The AI prompt that built this</h2>
                                </div>
                                <p className="text-sm text-[#D1CBC5] mb-4">
                                    Copy this prompt into ChatGPT/Claude/your favorite AI to generate variations for your industry, role, or use case. Or — when you sign up for Superkabe — generate it directly inside the platform.
                                </p>
                                <div className="rounded-lg bg-black/30 border border-white/10 p-4">
                                    <pre className="font-sans text-sm leading-relaxed whitespace-pre-wrap text-white">
{template.prompt}
                                    </pre>
                                </div>
                            </div>

                            {/* Why this works (annotations) */}
                            {template.annotations.length > 0 && (
                                <div className="rounded-xl bg-white border border-[#D1CBC5] p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Quote size={16} strokeWidth={2} />
                                        <h2 className="text-base font-semibold">Why this template works</h2>
                                    </div>
                                    <ul className="space-y-4">
                                        {template.annotations.map((a, i) => (
                                            <li key={i} className="border-l-2 border-[#1E1E2F] pl-4">
                                                <p className="text-xs uppercase tracking-wide text-[#6B5E4F] mb-1">
                                                    {sectionLabel(a.section)} — {a.label}
                                                </p>
                                                <p className="text-sm text-[#1E1E2F]">{a.reason}</p>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Compliance checklist */}
                            <div className="rounded-xl bg-white border border-[#D1CBC5] p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck size={16} strokeWidth={2} />
                                    <h2 className="text-base font-semibold">Before you send</h2>
                                </div>
                                <ul className="space-y-2 text-sm">
                                    <ChecklistItem text="Add an unsubscribe link to the footer (CAN-SPAM § 5(a)(3))" />
                                    <ChecklistItem text="Include your physical mailing address in every commercial send (CAN-SPAM § 5(a)(5))" />
                                    <ChecklistItem text="Set the List-Unsubscribe + List-Unsubscribe-Post headers (Gmail/Yahoo Feb 2024 sender rules)" />
                                    <ChecklistItem text="Replace personalization placeholders before sending — never ship raw {{first_name}} to a recipient" />
                                    <ChecklistItem text="Send from a domain that's properly authenticated (SPF + DKIM + DMARC)" />
                                </ul>
                                <p className="mt-4 text-xs text-[#6B5E4F]">
                                    Sending through{' '}
                                    <Link href="/" className="underline hover:text-[#1E1E2F]">Superkabe</Link>
                                    {' '}handles every line above automatically.
                                </p>
                            </div>
                        </div>

                        {/* Sidebar — quick facts + variables */}
                        <aside className="space-y-4">
                            <div className="rounded-xl bg-white border border-[#D1CBC5] p-5 sticky top-24">
                                <h3 className="text-xs uppercase tracking-wide text-[#6B5E4F] font-semibold mb-3">Quick facts</h3>
                                <dl className="space-y-2 text-sm">
                                    <SidebarRow label="Goal" value={GOAL_META[template.goal].label} />
                                    <SidebarRow label="Framework" value={FRAMEWORK_META[template.framework].label} />
                                    <SidebarRow label="Tone" value={cap(template.tone)} />
                                    <SidebarRow label="Length" value={`${cap(template.length)} (${wc} words)`} />
                                    <SidebarRow label="Score" value={`${template.deliverabilityScore}/100`} />
                                </dl>

                                {template.variables.length > 0 && (
                                    <>
                                        <h3 className="text-xs uppercase tracking-wide text-[#6B5E4F] font-semibold mt-5 mb-2">
                                            Personalization variables
                                        </h3>
                                        <ul className="space-y-1 text-xs font-mono">
                                            {template.variables.map((v) => (
                                                <li key={v} className="text-[#4A3F30]">{`{{${v}}}`}</li>
                                            ))}
                                        </ul>
                                    </>
                                )}
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            {/* ─── Related templates ───────────────────────────────────── */}
            {related.length > 0 && (
                <section className="px-6 pb-16">
                    <div className="max-w-4xl mx-auto">
                        <h2 className="text-xl font-semibold mb-4">Related templates</h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {related.map((r) => (
                                <Link
                                    key={r.slug}
                                    href={`${PATH_BASE}/${r.slug}`}
                                    className="block rounded-xl bg-white border border-[#D1CBC5] p-4 hover:border-[#1E1E2F] transition"
                                >
                                    <p className="text-xs uppercase tracking-wide text-[#6B5E4F] mb-1">
                                        {GOAL_META[r.goal].label}
                                    </p>
                                    <p className="text-sm font-semibold text-[#1E1E2F] line-clamp-2 mb-2">
                                        {r.title}
                                    </p>
                                    <p className="text-xs text-[#4A3F30] line-clamp-2">{r.bestFor}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* ─── CTA ─────────────────────────────────────────────────── */}
            <section className="px-6 pb-24">
                <div className="max-w-4xl mx-auto rounded-2xl bg-[#1E1E2F] text-white p-8 md:p-10">
                    <div className="flex items-start gap-3 mb-3">
                        <Mail size={20} strokeWidth={2} />
                        <h2 className="text-xl md:text-2xl font-semibold leading-tight">
                            Send this template at scale, with deliverability built in
                        </h2>
                    </div>
                    <p className="text-sm md:text-base text-[#D1CBC5] mb-6 max-w-2xl">
                        Customize this template with AI for your prospects, send across multiple mailboxes, and let Superkabe&apos;s recovery pipeline keep your sender reputation healthy automatically.
                    </p>
                    <AuthAwareCtaButtons
                        from={`${PATH_BASE}/${template.slug}`}
                        intent="ai-customize"
                        secondary={{ href: PATH_BASE, label: 'Browse all templates' }}
                    />
                </div>
            </section>

            <Footer />
        </div>
    );
}

// ============================================================================
// SUB-COMPONENTS (server)
// ============================================================================

function Pill({ icon, label }: { icon: React.ReactNode; label: string }) {
    return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white border border-[#D1CBC5] text-xs text-[#4A3F30]">
            {icon}
            {label}
        </span>
    );
}

function DeliverabilityScore({ score }: { score: number }) {
    const tone =
        score >= 90 ? { bg: '#E8F4EC', fg: '#1F6F3A' }
        : score >= 80 ? { bg: '#F0F6FF', fg: '#1F4C8F' }
        : { bg: '#FDF3E2', fg: '#8B5A1A' };
    return (
        <span
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold"
            style={{ background: tone.bg, color: tone.fg }}
        >
            <ShieldCheck size={11} strokeWidth={2.25} />
            {score}/100 deliverability
        </span>
    );
}

function ChecklistItem({ text }: { text: string }) {
    return (
        <li className="flex items-start gap-2">
            <CheckCircle2 size={16} strokeWidth={2} className="shrink-0 mt-0.5 text-[#1F6F3A]" />
            <span className="text-[#1E1E2F]">{text}</span>
        </li>
    );
}

function SidebarRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-baseline justify-between gap-2">
            <dt className="text-xs text-[#6B5E4F]">{label}</dt>
            <dd className="text-sm font-medium text-[#1E1E2F] text-right">{value}</dd>
        </div>
    );
}

function sectionLabel(section: 'subject' | 'opener' | 'body' | 'cta' | 'sign-off'): string {
    return {
        subject: 'Subject Line',
        opener: 'Opener',
        body: 'Body',
        cta: 'Call to Action',
        'sign-off': 'Sign-off',
    }[section];
}

function cap(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1);
}
