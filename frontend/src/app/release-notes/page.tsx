import Link from 'next/link';
import Footer from '@/components/Footer';
import Navbar from '@/components/Navbar';
import type { Metadata } from 'next';

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

const releases = [
    {
        version: '1.5.0',
        date: 'March 2026',
        label: 'Latest',
        features: [
            'Hybrid email validation layer (syntax, MX, disposable, catch-all + MillionVerifier API)',
            'Real-time validation activity feed on leads page',
            'Multi-select filters across all dashboard pages',
            'Confirmation modals for pause/resume actions',
            'Load balancing redesign with effective load metric',
        ],
    },
    {
        version: '1.4.0',
        date: 'February 2026',
        label: null,
        features: [
            '5-phase healing pipeline (paused \u2192 quarantine \u2192 restricted \u2192 warm \u2192 healthy)',
            'State machine migration \u2014 single authority for all status changes',
            'Mailbox rotation with standby mailboxes',
            'Correlation engine for cross-entity failure detection',
        ],
    },
    {
        version: '1.3.0',
        date: 'January 2026',
        label: null,
        features: [
            'Multi-platform support (Smartlead + Instantly + EmailBison)',
            'Platform adapter pattern',
            'Risk-aware lead routing (GREEN/YELLOW/RED)',
            'Slack real-time alerts',
        ],
    },
    {
        version: '1.2.0',
        date: 'December 2025',
        label: null,
        features: [
            'Infrastructure assessment on onboarding',
            'DNS health checks (SPF, DKIM, DMARC)',
            'Bounce classification (hard/soft/transient)',
            'Analytics dashboard',
        ],
    },
    {
        version: '1.1.0',
        date: 'November 2025',
        label: null,
        features: [
            'Automated bounce management',
            'Campaign auto-pause when all mailboxes unhealthy',
            'Audit logging',
            'Notification system',
        ],
    },
    {
        version: '1.0.0',
        date: 'October 2025',
        label: 'Initial Release',
        features: [
            'Initial release',
            'Smartlead integration',
            'Real-time monitoring',
            'Basic bounce tracking',
        ],
    },
];

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
            "itemListElement": releases.map((release, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": `Superkabe v${release.version} — ${release.date}`,
                "description": release.features.join('. ') + '.',
                "url": `https://www.superkabe.com/release-notes#v${release.version}`
            }))
        },
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": "https://www.superkabe.com/release-notes"
        }
    };

    return (
        <div className="relative bg-[#F5F8FF] text-[#1E1E2F] min-h-screen font-sans">
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
            <div className="relative z-10 pt-32 md:pt-36 pb-24 px-6">
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
                            {releases.map((release) => (
                                <div key={release.version} id={`v${release.version}`} className="relative pl-14">
                                    {/* Timeline dot */}
                                    <div className="absolute left-[12px] top-1.5 w-[15px] h-[15px] rounded-full border-[3px] border-blue-500 bg-white" />

                                    {/* Card */}
                                    <div className="bg-white rounded-2xl p-8 shadow-sm shadow-gray-200/50 border border-gray-100">
                                        {/* Version + Date Row */}
                                        <div className="flex flex-wrap items-center gap-3 mb-5">
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

                                        {/* Features */}
                                        <ul className="space-y-3">
                                            {release.features.map((feature, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-600 leading-relaxed">
                                                    <span className="mt-2 w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />
                                                    <span>{feature}</span>
                                                </li>
                                            ))}
                                        </ul>
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
