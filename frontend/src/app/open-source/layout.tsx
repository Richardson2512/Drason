import type { Metadata } from 'next';

export const metadata: Metadata = {
 title: 'Technical Manifesto | Superkabe',
 description: 'Comprehensive technical breakdown of Superkabe — the AI cold email platform with native deliverability protection. Architecture, send pipeline, protection layer, and agent framework.',
 alternates: { canonical: '/open-source' },
 openGraph: {
 title: 'Technical Manifesto | Superkabe',
 description: 'Technical breakdown of Superkabe — the AI cold email platform with native deliverability protection.',
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
