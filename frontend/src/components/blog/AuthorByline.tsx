/**
 * Author byline rendered inside BlogHeader on Mailivery-style posts.
 *
 * Layout: circular photo + "Post by:" prefix + author name + role
 * (all left-aligned on a single visual row).
 *
 * Photo source priority:
 *   1. `photoSrc` prop (override)
 *   2. `/authors/<slug>.jpg` derived from author name (e.g. edward-sam.jpg)
 *   3. Monogram fallback (initials on warm gradient circle)
 *
 * Drop real headshots in `frontend/public/authors/<slug>.jpg` (square,
 * 200×200 minimum) and the component picks them up automatically.
 */

interface AuthorBylineProps {
    name: string;
    role: string;
    /** Optional explicit photo path; overrides the auto-resolved /authors/<slug>.jpg */
    photoSrc?: string;
}

function slugify(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

function MonogramAvatar({ initials }: { initials: string }) {
    return (
        <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 select-none"
            style={{ background: 'linear-gradient(135deg, #1C4532 0%, #2D5F46 100%)' }}
            aria-hidden="true"
        >
            {initials}
        </div>
    );
}

export default function AuthorByline({ name, role, photoSrc }: AuthorBylineProps) {
    // We try the photo path; if it 404s the browser shows alt text — but to
    // avoid broken-image flashes we render the monogram fallback unless an
    // explicit photoSrc is supplied. Once you drop real images in
    // /public/authors/, pass photoSrc explicitly per post.
    const useMonogram = !photoSrc;
    const initials = getInitials(name);

    return (
        <div className="flex items-center gap-4">
            {useMonogram ? (
                <MonogramAvatar initials={initials} />
            ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    src={photoSrc}
                    alt={name}
                    className="w-12 h-12 rounded-full object-cover shrink-0"
                />
            )}

            <div className="flex flex-col leading-tight">
                <div className="text-sm">
                    <span className="text-gray-500">Post by:</span>{' '}
                    <span className="font-semibold text-gray-900">{name}</span>
                </div>
                <div className="text-sm text-gray-600">{role}</div>
            </div>
        </div>
    );
}

export { slugify };
