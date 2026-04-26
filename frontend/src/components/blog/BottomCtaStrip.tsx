/**
 * Bottom-of-article dark CTA strip.
 *
 * Mirrors Mailivery's "Don't Land In Spam. Get Started Today For Free."
 * style — full-width dark band with headline + dual CTAs, sits between
 * article body and the global Footer.
 */

import Link from 'next/link';

interface BottomCtaStripProps {
    headline?: string;
    body?: string;
    primaryCta?: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
}

export default function BottomCtaStrip({
    headline = 'Stop hoping. Start engineering.',
    body = "Superkabe ships AI sequencing, validation, real-time monitoring, threshold-based auto-pause, and the 5-phase healing pipeline in one platform. 14-day free trial, no credit card required.",
    primaryCta = { label: 'Start free trial', href: '/signup' },
    secondaryCta = { label: 'See pricing', href: '/pricing' },
}: BottomCtaStripProps) {
    return (
        <section className="not-prose mt-16 -mx-6 lg:-mx-12">
            <div
                className="px-8 md:px-16 py-14 md:py-20 text-center"
                style={{ background: '#0F1A14', color: '#F7F2EB' }}
            >
                <h2
                    className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.1] mb-4"
                    style={{ color: '#F7F2EB', letterSpacing: '-0.02em' }}
                >
                    {headline}
                </h2>
                <p className="text-base md:text-lg leading-relaxed max-w-2xl mx-auto mb-8" style={{ color: '#C9C2B5' }}>
                    {body}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 items-center justify-center">
                    <Link
                        href={primaryCta.href}
                        className="px-7 py-3 text-sm font-semibold transition-colors"
                        style={{ background: '#F7F2EB', color: '#0F1A14' }}
                    >
                        {primaryCta.label} &rarr;
                    </Link>
                    <Link
                        href={secondaryCta.href}
                        className="px-7 py-3 text-sm font-semibold border transition-colors hover:bg-white/5"
                        style={{ borderColor: '#3B4A40', color: '#F7F2EB' }}
                    >
                        {secondaryCta.label}
                    </Link>
                </div>
            </div>
        </section>
    );
}
