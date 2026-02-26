import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Technical Manifesto | Superkabe',
    description: 'Comprehensive technical breakdown of Superkabe, the enterprise infrastructure protection layer designed for outbound email scaling.',
    alternates: { canonical: '/open-source' },
    openGraph: {
        title: 'Technical Manifesto | Superkabe',
        description: 'Comprehensive technical breakdown of Superkabe infrastructure protection for outbound email.',
        url: '/open-source',
        siteName: 'Superkabe',
        type: 'article',
    },
};

export default function OpenSourceLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
