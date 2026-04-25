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

export default function HomeLayout({
 children,
}: {
 children: React.ReactNode;
}) {
 return <>{children}</>;
}
