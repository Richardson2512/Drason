import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Superkabe – The AI Cold Email Platform Built for Deliverability',
 description: 'Send, personalize, and scale outbound with an AI cold email platform that includes native deliverability protection — auto-pause, ESP routing, email validation, and auto-healing built in.',
 alternates: { canonical: '/' },
 openGraph: {
 title: 'Superkabe – The AI Cold Email Platform Built for Deliverability',
 description: 'Send, personalize, and scale outbound with an AI cold email platform that includes native deliverability protection — auto-pause, ESP routing, email validation, and auto-healing built in.',
 url: '/',
 siteName: 'Superkabe',
 images: [
 {
 url: '/image/og-image.png',
 width: 1200,
 height: 630,
 alt: 'Superkabe – AI Cold Email Platform with Deliverability Protection',
 },
 ],
 type: 'website',
 },
};

/**
 * Three JSON-LD blocks live in the homepage <head>:
 *
 *   Organization — declares the brand entity. Powers Google's Knowledge
 *     Panel and the entity graph that turns "superkabe" from a string
 *     match into a brand query.
 *
 *   WebSite — declares the canonical site identity. Used by Google for
 *     sitelinks and by AI assistants (ChatGPT, Perplexity, Google AI
 *     Overviews) to identify the authoritative source URL when citing
 *     the brand.
 *
 *   SoftwareApplication — declares the product itself. SaaS apps with
 *     this schema can appear in Google's "product" rich results and are
 *     much more likely to be cited by ChatGPT/Perplexity when users ask
 *     for cold-email tool recommendations.
 *
 * Validate after deploy with Google's Rich Results Test:
 *   https://search.google.com/test/rich-results?url=https://www.superkabe.com
 *
 * Sole source of truth for brand facts. If founder, founding date,
 * social links, or pricing tiers change, update them HERE — the same
 * facts appear in /llms.txt and should be reconciled.
 */
const organizationJsonLd = {
 '@context': 'https://schema.org',
 '@type': 'Organization',
 name: 'Superkabe',
 url: 'https://www.superkabe.com',
 logo: 'https://www.superkabe.com/image/logo-v2.png',
 description: 'Superkabe is an AI-driven cold email platform with deliverability protection built in.',
 foundingDate: '2026-01-20',
 founder: {
 '@type': 'Person',
 name: 'Richardson Eugin Simon',
 },
 // Cross-references for Google's entity graph and AI assistants. The
 // more independent platforms confirm the same brand identity, the
 // faster Google reconciles "superkabe" as a brand entity (vs. just a
 // string match). Add new social/profile URLs to this list as they
 // appear; never put marketing pages or product pages here.
 sameAs: [
 'https://www.linkedin.com/company/superkabe/',
 'https://www.crunchbase.com/organization/superkabe',
 'https://github.com/Superkabereal/Superkabe',
 ],
};

const websiteJsonLd = {
 '@context': 'https://schema.org',
 '@type': 'WebSite',
 name: 'Superkabe',
 url: 'https://www.superkabe.com',
 description: 'AI cold email platform with native deliverability protection.',
 publisher: {
 '@type': 'Organization',
 name: 'Superkabe',
 },
 inLanguage: 'en',
};

const softwareApplicationJsonLd = {
 '@context': 'https://schema.org',
 '@type': 'SoftwareApplication',
 name: 'Superkabe',
 applicationCategory: 'BusinessApplication',
 applicationSubCategory: 'Cold Email Platform',
 operatingSystem: 'Web',
 description: 'AI-driven cold email platform with built-in deliverability protection — auto-pause, ESP-aware routing, hybrid email validation, and a 5-phase auto-healing pipeline that pauses and recovers damaged senders before they burn.',
 url: 'https://www.superkabe.com',
 // Lowest-tier price exposed so search engines can show "from $19/mo".
 // Update if pricing changes — keep in sync with /pricing page.
 offers: {
 '@type': 'Offer',
 price: '19',
 priceCurrency: 'USD',
 priceValidUntil: '2027-12-31',
 availability: 'https://schema.org/InStock',
 },
 featureList: [
 'AI sequence generation',
 'Multi-mailbox sending (Gmail, Microsoft 365, SMTP)',
 'Hybrid email validation with millionverifier integration',
 'ESP-aware lead routing',
 'Auto-pause on bounce-rate thresholds',
 '5-phase auto-healing pipeline',
 'Postmaster Tools integration',
 'CRM integrations (HubSpot, Salesforce, Outreach)',
 ],
};

export default function HomeLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return (
 <>
 {/* JSON-LD must be inlined via dangerouslySetInnerHTML — Next.js
     App Router doesn't pass <script> children through unchanged.
     All three objects are static + server-only so JSON.stringify is safe. */}
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
 />
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
 />
 <script
 type="application/ld+json"
 dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareApplicationJsonLd) }}
 />
 {children}
 </>
 );
}
