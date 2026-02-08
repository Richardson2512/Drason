import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  title: 'Superkabe - Infrastructure Protection for Modern Outbound Teams',
  description:
    'Production-hardened monitoring and protection layer for multi-domain, multi-mailbox outbound email infrastructure. Prevent bounces and protect domain reputation automatically.',
  icons: {
    icon: '/image/favicon-v2.png',
  },
  openGraph: {
    title: 'Superkabe - Infrastructure Protection for Modern Outbound Teams',
    description: 'Protect your outbound email infrastructure with production-hardened monitoring and auto-healing.',
    url: 'https://superkabe.com',
    siteName: 'Superkabe',
    images: [
      {
        url: '/image/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Superkabe - Infrastructure Protection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Superkabe - Modern Outbound Protection',
    description: 'The monitoring layer between your enrichment and email stack.',
    images: ['/image/og-image.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'Superkabe',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    offers: {
      '@type': 'Offer',
      price: '49.00',
      priceCurrency: 'USD',
    },
    description: 'Infrastructure protection for modern outbound teams. Monitoring, auto-healing, and deliverability protection.',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '150',
    },
  };

  return (
    <html lang="en">
      <head>
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
