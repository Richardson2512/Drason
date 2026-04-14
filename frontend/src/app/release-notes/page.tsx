import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';
import { releaseNotes } from '@/data/releaseNotes';

export const metadata: Metadata = {
    title: 'Release Notes | Superkabe',
    description: 'See what is new in Superkabe. Release notes, changelog, and feature updates for the email deliverability protection platform.',
    alternates: { canonical: '/release-notes' },
    openGraph: {
        title: 'Release Notes | Superkabe',
        description: 'See what is new in Superkabe. Release notes, changelog, and feature updates for the email deliverability protection platform.',
        url: '/release-notes',
        siteName: 'Superkabe',
        type: 'website',
    },
};

export default function ReleaseNotesPage() {
    const releaseNotesSchema = {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Release Notes | Superkabe",
        "description": "See what is new in Superkabe. Release notes, changelog, and feature updates for the email deliverability protection platform.",
        "url": "https://www.superkabe.com/release-notes",
        "publisher": {
            "@type": "Organization",
            "name": "Superkabe",
            "url": "https://www.superkabe.com",
            "logo": {
                "@type": "ImageObject",
                "url": "https://www.superkabe.com/image/logo-v2.png"
            }
        },
        "mainEntity": {
            "@type": "ItemList",
            "itemListElement": releaseNotes.map((release, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": `Superkabe v${release.version} — ${release.headline}`,
                "description": release.summary,
                "url": `https://www.superkabe.com/release-notes/${release.slug}`
            }))
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/release-notes"
        }
    };

    return (
        <div className="relative bg-[#F7F2EB] text-[#1E1E2F] min-h-screen font-sans">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(releaseNotesSchema) }} />

            <Navbar />

            {/* Fixed Background Layer */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="cloud-bg">
                    <div className="cloud-shadow" />
                    <div className="cloud-puff-1" />
                    <div className="cloud-puff-2" />
                    <div className="cloud-puff-3" />
                </div>
                <div className="absolute inset-0 hero-grid"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 pt-32 md:pt-36 pb-10 px-6">
                <div className="max-w-3xl mx-auto">

                    {/* Page Header */}
                    <div className="text-center mb-16">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 text-sm font-bold tracking-wide uppercase mb-6 border border-blue-100">
                            Changelog
                        </div>
                        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 mb-4">
                            Release Notes
                        </h1>
                        <p className="text-lg text-gray-500 max-w-xl mx-auto leading-relaxed">
                            Every improvement, feature, and fix shipped to Superkabe. Stay up to date with what is new in the platform.
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[19px] top-2 bottom-2 w-px bg-gray-200" />

                        <div className="space-y-12">
                            {releaseNotes.map((release) => (
                                <div key={release.version} id={release.slug} className="relative pl-14">
                                    {/* Timeline dot */}
                                    <div className="absolute left-[12px] top-1.5 w-[15px] h-[15px] rounded-full border-[3px] border-blue-500 bg-white" />

                                    {/* Card */}
                                    <div className="bg-white rounded-2xl p-8 shadow-sm shadow-gray-200/50 border border-gray-100 hover:border-blue-200 transition-colors">
                                        {/* Version + Date Row */}
                                        <div className="flex flex-wrap items-center gap-3 mb-3">
                                            <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-600 text-white text-sm font-bold tracking-wide">
                                                v{release.version}
                                            </span>
                                            <span className="text-sm text-gray-400 font-medium">
                                                {release.date}
                                            </span>
                                            {release.label && (
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                                                    release.label === 'Latest'
                                                        ? 'bg-green-50 text-green-700 border border-green-200'
                                                        : 'bg-gray-50 text-gray-600 border border-gray-200'
                                                }`}>
                                                    {release.label}
                                                </span>
                                            )}
                                        </div>

                                        {/* Headline */}
                                        <h2 className="text-xl font-bold text-gray-900 mb-2">{release.headline}</h2>
                                        <p className="text-sm text-gray-500 mb-5 leading-relaxed">{release.summary}</p>

                                        {/* Features */}
                                        <ul className="space-y-2 mb-5">
                                            {release.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-600 text-sm leading-relaxed">
                                                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        {/* Read More */}
                                        <Link
                                            href={`/release-notes/${release.slug}`}
                                            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                                        >
                                            Read full release notes
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="mt-20 text-center">
                        <p className="text-gray-400 text-sm mb-4">Want to see a feature added?</p>
                        <Link
                            href="/docs/help/account-management"
                            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold text-sm hover:bg-blue-700 transition-colors"
                        >
                            Contact Us
                        </Link>
                    </div>

                </div>
            </div>

            <Footer />
        </div>
    );
}
