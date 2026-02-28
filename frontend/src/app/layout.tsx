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
  metadataBase: new URL('https://www.superkabe.com'),
  title: 'Superkabe – Email deliverability and infrastructure protection for outbound teams',
  description:
    'Superkabe is an infrastructure protection layer for outbound email teams. It monitors bounce rates, DNS authentication, mailbox fatigue, and lead health in real time to prevent domain burnout and protect sender reputation.',
  alternates: {
    canonical: '/',
  },
  authors: [{ name: 'Richardson', url: 'https://www.superkabe.com' }],
  publisher: 'Superkabe',
  icons: {
    icon: '/image/favicon-32.png',
    apple: '/image/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Superkabe - Infrastructure Protection for Outbound',
    description: 'Protect your outbound email infrastructure with production-hardened monitoring and auto-healing.',
    url: 'https://www.superkabe.com',
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
    '@id': 'https://www.superkabe.com/#organization',
    name: 'Superkabe',
    url: 'https://www.superkabe.com',
    logo: 'https://www.superkabe.com/image/logo-v2.png',
    description: 'Superkabe is an email deliverability and sender reputation protection platform that protects outbound email infrastructure through real-time bounce monitoring, DNS authentication enforcement, and mailbox fatigue detection.',
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
      'https://github.com/Superkabereal/Superkabe',
      'https://www.crunchbase.com/organization/superkabe',
      'https://g2.com/products/superkabe',
    ],
  };

  const softwareSchema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    '@id': 'https://www.superkabe.com/#software',
    name: 'Superkabe',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    url: 'https://www.superkabe.com',
    description:
      'Infrastructure protection layer for outbound email that monitors bounce rates, protects sender reputation, and auto-heals domain infrastructure.',
    offers: {
      '@type': 'Offer',
      price: '49',
      priceCurrency: 'USD',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Superkabe',
      url: 'https://www.superkabe.com',
    },
    isPartOf: {
      '@id': 'https://www.superkabe.com/#organization',
    },
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
          src="https://www.googletagmanager.com/gtag/js?id=G-C36CG3CRSJ"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-C36CG3CRSJ');
          `}
        </Script>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
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
