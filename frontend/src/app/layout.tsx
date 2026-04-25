import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
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
  title: 'Superkabe – The AI Cold Email Platform Built for Deliverability',
  description:
    'Superkabe is an AI cold email platform with native deliverability protection. Draft AI sequences, send across unlimited mailboxes, validate every email, and let the protection layer auto-pause, reroute, and heal senders in real time.',
  alternates: {
    canonical: '/',
  },
  authors: [{ name: 'Robert Smith', url: 'https://www.superkabe.com' }],
  publisher: 'Superkabe',
  icons: {
    icon: '/image/favicon-32.png',
    apple: '/image/apple-touch-icon.png',
  },
  openGraph: {
    title: 'Superkabe – The AI Cold Email Platform Built for Deliverability',
    description: 'AI sequences, multi-mailbox sending, email validation, and a full deliverability protection stack — one platform for cold email outreach and protection.',
    url: 'https://www.superkabe.com',
    siteName: 'Superkabe',
    images: [
      {
        url: '/image/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Superkabe – AI Cold Email Platform with Deliverability Protection',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Superkabe – AI Cold Email Platform with Deliverability Protection',
    description: 'AI sequences, multi-mailbox sending, email validation, and a full deliverability protection stack — one platform for cold email outreach and protection.',
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
    description: 'Superkabe is an AI cold email platform with native deliverability protection. We help outbound teams draft AI sequences, send across unlimited mailboxes, validate every email, and auto-heal damaged senders — all from a single product.',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      name: 'Balaji Jayakumar',
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
      'Superkabe is an AI cold email platform with native deliverability protection. It combines AI sequence generation, multi-mailbox sending, email validation, ESP-aware lead routing, and an auto-healing protection layer into a single product for outbound revenue teams.',
    datePublished: '2025-01-01',
    dateModified: '2026-04-23',
    featureList: [
      'AI-generated cold email sequences with variant testing',
      'Multi-mailbox sending across Google Workspace, Microsoft 365, and SMTP',
      'ESP-aware lead routing for higher inbox placement',
      'Hybrid email validation (syntax, MX, disposable, catch-all + MillionVerifier API)',
      'Health gate classification (GREEN/YELLOW/RED) with risk-aware routing',
      'Real-time bounce monitoring (60-second cycles)',
      'Automated mailbox pausing on threshold breach',
      'Correlation engine for cross-entity failure detection',
      '5-phase healing pipeline (pause, quarantine, restricted send, warm recovery, healthy)',
      'Mailbox rotation with automatic standby swap',
      'DNS authentication monitoring (SPF, DKIM, DMARC)',
      'Load balancing with effective load metric',
      'Unified inbox for replies across all connected mailboxes',
      'Protection Mode for Smartlead, Instantly, and EmailBison integrations',
      'Slack integration for real-time alerts',
      'Reports and CSV export',
      'Dedicated AI agents for cold email tasks (sequence writing, reply classification, send-time optimization)',
      'Public REST API v1 and MCP server for programmatic access',
    ],
    offers: {
      '@type': 'Offer',
      price: '19',
      priceCurrency: 'USD',
    },
    publisher: {
      '@id': 'https://www.superkabe.com/#organization',
    },
    isPartOf: {
      '@id': 'https://www.superkabe.com/#organization',
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
      {/* suppressHydrationWarning: some browser extensions (grammarly, password managers,
          `data-cjcrx=addYes` seen in the wild) inject attributes onto <body> before React
          hydrates, which otherwise flags as a hydration mismatch. Safe to suppress here
          since the body itself is a pure layout shell. */}
      <body className={`${plusJakartaSans.className} ${plusJakartaSans.variable}`} suppressHydrationWarning>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 5000,
            style: {
              borderRadius: '12px',
              background: '#FFFFFF',
              color: '#111827',
              border: '1px solid #D1CBC5',
              boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              fontSize: '13px',
              fontWeight: 500,
              maxWidth: '420px',
            },
            success: {
              iconTheme: { primary: '#059669', secondary: '#FFFFFF' },
            },
            error: {
              duration: 6000,
              iconTheme: { primary: '#DC2626', secondary: '#FFFFFF' },
            },
          }}
        />
      </body>
    </html>
  );
}
