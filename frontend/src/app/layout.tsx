import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import Script from 'next/script';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
  variable: '--font-plus-jakarta',
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.drason.com'),
  title: 'Drason - Infrastructure Protection for Outbound',
  description:
    'Monitoring and protection for multi-domain outbound email infrastructure. Prevent bounces and protect domain reputation automatically.',
  icons: {
    icon: '/image/favicon-32.png',
    apple: '/image/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Drason - Infrastructure Protection for Outbound',
    description: 'Protect your outbound email infrastructure with production-hardened monitoring and auto-healing.',
    url: 'https://www.drason.com',
    siteName: 'Drason',
    images: [
      {
        url: '/image/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Drason - Infrastructure Protection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Drason - Modern Outbound Protection',
    description: 'The monitoring layer between your enrichment and email stack.',
    images: ['/image/og-image.png'],
  },
  verification: {
    other: {
      'msvalidate.01': 'DC874AF623CE70A235655B84EEA5CF8A',
      'yandex-verification': '62fe10ad8516a592',
    },
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
    '@id': 'https://www.drason.com/#organization',
    name: 'Drason',
    url: 'https://www.drason.com',
    logo: 'https://www.drason.com/image/logo-v2.png',
    description: 'Email infrastructure protection and sender reputation recovery platform for modern outbound teams.',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Richardson',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@drason.com',
    },
    sameAs: [
      'https://twitter.com/drason',
      'https://www.linkedin.com/company/drason',
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://www.drason.com/#software',
    name: 'Drason',
    operatingSystem: 'Web',
    applicationCategory: 'BusinessApplication',
    isPartOf: {
      '@id': 'https://www.drason.com/#organization',
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
      <body className={`${plusJakartaSans.className} ${plusJakartaSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
