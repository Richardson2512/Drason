/**
 * Thin-square grid backdrop for marketing pages.
 *
 * Renders inside the page wrapper as an absolutely-positioned layer at
 * z-index: -1, so the grid sits BEHIND the wrapper's content. Combined
 * with `isolation: isolate` on any element with `bg-[#F7F2EB]` (set in
 * globals.css), this stays contained inside each marketing wrapper's
 * stacking context - content is always painted on top of the grid.
 */
export default function MarketingBackdrop() {
    return (
        <div
            aria-hidden
            className="hero-grid pointer-events-none"
            style={{
                position: 'absolute',
                inset: 0,
                zIndex: -1,
            }}
        />
    );
}
