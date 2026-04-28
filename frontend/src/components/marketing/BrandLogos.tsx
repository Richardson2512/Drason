/**
 * Brand logos for the homepage integrations marquee.
 *
 * Every component points to an official asset downloaded into /public/logos/.
 * Sources:
 *   - Simple Icons CDN (simpleicons.org) — gmail, google, airtable, hubspot
 *   - svgl.app — slack (multicolor variant)
 *   - vectorlogo.zone — microsoft (4-color square), salesforce
 *   - svgporn.com — webhooks
 *   - Brand websites (next/static, webflow assets, apple-touch-icon, favicon
 *     paths) — apollo, zoominfo, outreach, justcall, heyreach, zapmail,
 *     scaledmail. Where a brand publishes only a wordmark, we use their
 *     square apple-touch-icon / favicon PNG so the chip slot stays uniform.
 *
 * Apollo's published SVG was monochrome — we apply their brand color
 * (#143959) via fill rewrite during fetch, leaving the geometry untouched.
 */

import * as React from 'react';

type Props = { size?: number };

function LogoImg({ src, alt, size = 28 }: { src: string; alt: string; size?: number }) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
        <img
            src={src}
            alt={alt}
            width={size}
            height={size}
            className="object-contain"
            style={{ width: size, height: size }}
        />
    );
}

// ─── Mailbox providers ───────────────────────────────────────────────────────

export function GmailLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/gmail.svg" alt="Gmail" size={size} />;
}

export function GoogleWorkspaceLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/google.svg" alt="Google Workspace" size={size} />;
}

export function MicrosoftLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/microsoft.svg" alt="Microsoft 365" size={size} />;
}

export function SmtpLogo({ size = 28 }: Props) {
    // SMTP is a protocol, not a brand — neutral envelope-on-dark mark.
    return (
        <svg width={size} height={size} viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg" aria-label="SMTP">
            <rect x="0" y="0" width="28" height="28" rx="6" fill="#111827" />
            <path
                d="M6 9.5h16v9.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 6 19V9.5z"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="1.4"
            />
            <path d="M6 9.5l8 5.5 8-5.5" fill="none" stroke="#FFFFFF" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
    );
}

// ─── Lead enrichment ─────────────────────────────────────────────────────────

export function ApolloLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/apollo.svg" alt="Apollo.io" size={size} />;
}

export function ZoomInfoLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/zoominfo.svg" alt="ZoomInfo" size={size} />;
}

export function ClayLogo({ size = 28 }: Props) {
    return <LogoImg src="/clay.png" alt="Clay" size={size} />;
}

export function AirtableLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/airtable.svg" alt="Airtable" size={size} />;
}

// ─── CRM & sales engagement ──────────────────────────────────────────────────

export function HubSpotLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/hubspot.svg" alt="HubSpot" size={size} />;
}

export function SalesforceLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/salesforce.svg" alt="Salesforce" size={size} />;
}

export function OutreachLogo({ size = 28 }: Props) {
    // Outreach publishes only a wordmark — using their square apple-touch
    // icon so the chip slot stays uniform with the rest of the row.
    return <LogoImg src="/logos/outreach-icon.png" alt="Outreach" size={size} />;
}

// ─── LinkedIn outreach + dialer ──────────────────────────────────────────────

export function HeyreachLogo({ size = 28 }: Props) {
    // Square favicon (256×256) — sharper at chip size than their wordmark.
    return <LogoImg src="/logos/heyreach-icon.png" alt="HeyReach" size={size} />;
}

export function JustcallLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/justcall-icon.png" alt="Justcall" size={size} />;
}

// ─── Mailbox-import providers ────────────────────────────────────────────────

export function ZapmailLogo({ size = 28 }: Props) {
    // Zapmail's only public square asset is their favicon PNG (160×160).
    return <LogoImg src="/logos/zapmail-icon.png" alt="Zapmail" size={size} />;
}

export function ScaledmailLogo({ size = 28 }: Props) {
    // Square apple-touch icon pulled directly from scaledmail.com.
    return <LogoImg src="/logos/scaledmail-icon.png" alt="Scaledmail" size={size} />;
}

// ─── Notifications / developer ───────────────────────────────────────────────

export function SlackLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/slack.svg" alt="Slack" size={size} />;
}

export function WebhooksLogo({ size = 28 }: Props) {
    return <LogoImg src="/logos/webhooks.svg" alt="Webhooks" size={size} />;
}
