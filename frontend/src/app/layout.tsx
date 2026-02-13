import type { Metadata } from 'next';
import './globals.css';
import Script from 'next/script';

export const metadata: Metadata = {
  metadataBase: new URL('https://superkabe.com'),
  title: 'Superkabe - Infrastructure Protection for Modern Outbound Teams',
  description:
    'Production-hardened monitoring and protection layer for multi-domain, multi-mailbox outbound email infrastructure. Prevent bounces and protect domain reputation automatically.',
  icons: {
    icon: '/image/favicon-32.png',
    apple: '/image/apple-touch-icon.png',
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
  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://superkabe.com/#organization',
    name: 'Superkabe',
    url: 'https://superkabe.com',
    logo: 'https://superkabe.com/image/logo-v2.png',
    description: 'Email infrastructure protection and sender reputation recovery platform for modern outbound teams.',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Richardson',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@superkabe.com',
    },
    sameAs: [
      'https://twitter.com/superkabe',
      'https://www.linkedin.com/company/superkabe',
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://superkabe.com/#software',
    name: 'Superkabe',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    isPartOf: {
      '@id': 'https://superkabe.com/#organization',
    },
    offers: {
      '@type': 'Offer',
      price: '49.00',
      priceCurrency: 'USD',
    },
    description: 'Email infrastructure protection and sender reputation recovery platform. Monitor bounce rates, enforce lead gating, and automate recovery.',
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
          id="org-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <Script
          id="software-schema"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
