/**
 * In-page blog hero — mirrors the per-post opengraph-image.tsx visual design
 * but rendered as accessible HTML/CSS instead of a rasterized PNG.
 *
 * Sits directly above the article H1. Replaces the gradient text quote box
 * pattern used by older posts.
 */

interface HeroCardProps {
    badge?: string;
    title: string;
    subtitle?: string;
    eyebrow?: string;
}

export default function HeroCard({ badge, title, subtitle, eyebrow }: HeroCardProps) {
    return (
        <div
            className="w-full overflow-hidden mb-10 border border-[#E2D9C6]"
            style={{
                background: 'linear-gradient(135deg, #F7F2EB 0%, #EADFCE 100%)',
            }}
        >
            <div className="px-8 md:px-12 py-12 md:py-16">
                {/* Brand mark + eyebrow row */}
                <div className="flex items-center justify-between mb-8 md:mb-12">
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

                {/* Badge */}
                {badge && (
                    <div className="mb-5">
                        <span
                            className="inline-block px-3 py-1 text-xs font-semibold tracking-wider"
                            style={{ background: '#1C4532', color: '#F7F2EB', letterSpacing: '0.08em' }}
                        >
                            {badge}
                        </span>
                    </div>
                )}

                {/* Title */}
                <h1
                    className="text-3xl md:text-5xl font-extrabold tracking-tight leading-[1.05] text-gray-900 mb-4"
                    style={{ letterSpacing: '-0.02em' }}
                >
                    {title}
                </h1>

                {/* Subtitle */}
                {subtitle && (
                    <p className="text-base md:text-lg text-gray-600 leading-relaxed max-w-3xl">
                        {subtitle}
                    </p>
                )}
            </div>
        </div>
    );
}
