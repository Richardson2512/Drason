import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import './globals.css';
import Script from 'next/script';
import CookieBanner from '@/components/CookieBanner';

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
    logo: {
      '@type': 'ImageObject',
      url: 'https://www.superkabe.com/image/logo-v2.png',
      width: 512,
      height: 512,
    },
    description: 'Superkabe is an AI cold email platform with native deliverability protection. We help outbound teams draft AI sequences, send across unlimited mailboxes, validate every email, and auto-heal damaged senders — all from a single product.',
    foundingDate: '2024',
    founder: {
      '@type': 'Person',
      '@id': 'https://www.superkabe.com/about#balaji-jayakumar',
      name: 'Balaji Jayakumar',
      jobTitle: 'Founder & CEO',
      worksFor: { '@id': 'https://www.superkabe.com/#organization' },
      sameAs: [
        'https://www.linkedin.com/in/balajijayakumar',
      ],
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      email: 'support@superkabe.com',
    },
    sameAs: [
      'https://www.linkedin.com/company/superkabe',
      'https://twitter.com/superkabe',
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
      'One-time import from Smartlead — campaigns, sequences, leads, and mailbox metadata',
      'Slack integration for real-time alerts',
      'Reports and CSV export',
      'Dedicated AI agents for cold email tasks (sequence writing, reply classification, send-time optimization)',
      'Public REST API v1 and MCP server for programmatic access',
    ],
    // Authoritative pricing schema lives on /pricing as AggregateOffer.
    // Reference it here so crawlers consolidate the entity, rather than
    // re-declaring an outdated single-Offer that drifts from the real lineup.
    offers: {
      '@type': 'AggregateOffer',
      lowPrice: '0',
      highPrice: '349',
      priceCurrency: 'USD',
      offerCount: 5,
      url: 'https://www.superkabe.com/pricing',
    },
    publisher: {
      '@id': 'https://www.superkabe.com/#organization',
    },
    isPartOf: {
      '@id': 'https://www.superkabe.com/#organization',
    },
  };

  // WebSite entity with SearchAction — unlocks the Google Sitelinks Searchbox
  // for navigational queries ("superkabe ..."). The blog index supports a `q`
  // param for in-site search, so the action target points there.
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': 'https://www.superkabe.com/#website',
    name: 'Superkabe',
    url: 'https://www.superkabe.com',
    publisher: { '@id': 'https://www.superkabe.com/#organization' },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.superkabe.com/blog?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <html lang="en">
      <head>
        {/*
          Google Consent Mode v2.

          The inline script below MUST execute synchronously before gtag.js loads.
          It sets the default consent state to "denied" for every storage category
          except security_storage (strictly necessary). With Consent Mode v2,
          gtag.js respects these defaults and will NOT write persistent cookies
          (_ga, _ga_*) or send identifying pings until consent is granted.
          When consent IS granted, it sends cookieless pings ("consent signals")
          so basic pageview/event counts are still captured for measurement.

          For returning visitors, prior consent is restored from localStorage
          (sk-cookie-consent-v1) BEFORE gtag.js loads — so they aren't re-prompted
          and tracking re-engages exactly as they previously chose.

          GDPR Art. 6 + ePrivacy Directive Art. 5(3) compliance: cookies are
          gated behind consent, not loaded eagerly. CCPA/CPRA "do not sell"
          obligations are satisfied by ad_storage defaulting to denied.
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                window.gtag = gtag;

                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'denied',
                  functionality_storage: 'denied',
                  personalization_storage: 'denied',
                  security_storage: 'granted',
                  wait_for_update: 500
                });

                try {
                  var raw = localStorage.getItem('sk-cookie-consent-v1');
                  if (raw) {
                    var c = JSON.parse(raw);
                    gtag('consent', 'update', {
                      analytics_storage: c.analytics ? 'granted' : 'denied',
                      functionality_storage: c.functional ? 'granted' : 'denied',
                      personalization_storage: c.functional ? 'granted' : 'denied'
                    });
                  }
                } catch (e) { /* localStorage unavailable — keep defaults */ }

                gtag('js', new Date());
                gtag('config', 'G-C36CG3CRSJ', { anonymize_ip: true });
              })();
            `,
          }}
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-C36CG3CRSJ"
          strategy="afterInteractive"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      {/* suppressHydrationWarning: some browser extensions (grammarly, password managers,
          `data-cjcrx=addYes` seen in the wild) inject attributes onto <body> before React
          hydrates, which otherwise flags as a hydration mismatch. Safe to suppress here
          since the body itself is a pure layout shell. */}
      <body className={`${plusJakartaSans.className} ${plusJakartaSans.variable}`} suppressHydrationWarning>
        {children}
        <CookieBanner />
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
