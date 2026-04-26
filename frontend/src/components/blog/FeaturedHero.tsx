/**
 * Featured hero illustration that sits below the BlogHeader divider.
 *
 * Mirrors the per-post opengraph-image.tsx visual design (cream→tan
 * gradient poster with brand mark, tag, big tagline) but rendered as
 * responsive HTML/CSS. Acts as the in-page equivalent of Mailivery's
 * "featured illustration" slot.
 *
 * Future upgrade: replace with a real illustration in
 * /public/blog-heroes/<slug>.png and render that as a regular <img>.
 */

interface FeaturedHeroProps {
    badge?: string;
    /** Big poster headline — usually the same theme as the H1 but more punchy */
    tagline: string;
    /** Optional secondary line shown below the tagline */
    sub?: string;
    /** Optional small label shown top-right */
    eyebrow?: string;
}

export default function FeaturedHero({ badge, tagline, sub, eyebrow }: FeaturedHeroProps) {
    return (
        <figure className="mb-16">
            <div
                className="w-full overflow-hidden border border-[#1C4532]/15"
                style={{
                    background: 'linear-gradient(135deg, #FFFFFF 0%, #E2D7BE 100%)',
                    aspectRatio: '16 / 9',
                }}
            >
                <div className="relative w-full h-full px-8 md:px-14 py-10 md:py-14 flex flex-col justify-between">
                    {/* Decorative grid/dot texture */}
                    <div
                        className="absolute inset-0 pointer-events-none opacity-30"
                        style={{
                            backgroundImage: 'radial-gradient(#1C4532 1px, transparent 1px)',
                            backgroundSize: '24px 24px',
                            mixBlendMode: 'multiply',
                        }}
                    />

                    {/* Top row: brand mark + eyebrow */}
                    <div className="relative flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-3 h-3 rounded-full" style={{ background: '#1C4532' }} />
                            <span className="text-sm font-bold tracking-wide" style={{ color: '#1C4532' }}>
                                Superkabe
                            </span>
                        </div>
                        {eyebrow && (
                            <span className="text-xs text-gray-500 font-medium uppercase tracking-widest hidden md:inline-block">
                                {eyebrow}
                            </span>
                        )}
                    </div>

                    {/* Center / lower: badge + tagline */}
                    <div className="relative">
                        {badge && (
                            <div className="mb-4">
                                <span
                                    className="inline-block px-3 py-1 text-xs font-semibold tracking-wider"
                                    style={{ background: '#1C4532', color: '#F7F2EB', letterSpacing: '0.08em' }}
                                >
                                    {badge}
                                </span>
                            </div>
                        )}
                        <div
                            className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05] text-gray-900"
                            style={{ letterSpacing: '-0.02em' }}
                        >
                            {tagline}
                        </div>
                        {sub && (
                            <div className="mt-3 text-base md:text-lg text-gray-700 max-w-2xl">
                                {sub}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </figure>
    );
}
