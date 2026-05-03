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

// Organization, WebSite, and SoftwareApplication JSON-LD live in the
// root layout (src/app/layout.tsx) and apply site-wide. Don't re-emit
// them here — duplicate Organization blocks confuse Google's entity
// reconciliation and create conflicting founder/foundingDate signals.

export default function HomeLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
