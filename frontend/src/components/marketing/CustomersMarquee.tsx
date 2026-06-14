'use client';

import { useEffect, useState } from 'react';

type Tone = 'orange' | 'blue' | 'green';

interface Customer {
    key: string;
    brand: string;
    role: string;
    logo: string;
    tone: Tone;
    tag: string;
    contact: {
        name: string;
        role: string;
        email: string;
        phone: string;
        handle: string;
    };
}

const CUSTOMERS: Customer[] = [
    {
        key: 'rihario',
        brand: 'Rihario',
        role: 'DTC commerce · India',
        logo: '/image/customers/rihario-v2.png',
        tone: 'orange',
        tag: 'Top sender',
        contact: { name: 'Aarav Singh', role: 'Founder, Rihario', email: 'aarav@rihario.com', phone: '+91 98765 43210', handle: '@rihario' },
    },
    {
        key: 'gobengali',
        brand: 'GoBengali',
        role: 'Bengali media · Kolkata',
        logo: '/image/customers/gobengali.png',
        tone: 'blue',
        tag: '5-phase healing',
        contact: { name: 'Priya Sen', role: 'Head of Outbound, GoBengali', email: 'priya@gobengali.com', phone: '+91 22 4567 1190', handle: '@gobengali' },
    },
    {
        key: 'promptrim',
        brand: 'PrompTrim',
        role: 'AI prompt ops',
        logo: '/image/customers/promptrim.png',
        tone: 'orange',
        tag: 'ESP-aware routing',
        contact: { name: 'Maya Patel', role: 'GTM Lead, PrompTrim', email: 'maya@promptrim.ai', phone: '+1 415 555 0140', handle: '@promptrim' },
    },
    {
        key: 'insightsnap',
        brand: 'Insightsnap',
        role: 'Social engagement',
        logo: '/image/customers/insightsnap.png',
        tone: 'blue',
        tag: '0% bounce',
        contact: { name: 'Daniel Cho', role: 'Growth, Insightsnap', email: 'daniel@insightsnap.io', phone: '+1 646 555 0188', handle: '@insightsnap' },
    },
    {
        key: 'vanishdrop',
        brand: 'Vanishdrop',
        role: 'Doc automation',
        logo: '/image/customers/vanishdrop.png',
        tone: 'blue',
        tag: '100k sends/day',
        contact: { name: 'Elena Marković', role: 'Ops, Vanishdrop', email: 'elena@vanishdrop.io', phone: '+44 20 4505 0102', handle: '@vanishdrop' },
    },
    {
        key: 'syllabustracker',
        brand: 'Syllabus Tracker',
        role: 'Edu ops platform',
        logo: '/image/customers/syllabus-tracker.png',
        tone: 'green',
        tag: 'Reputation +18%',
        contact: { name: 'Theo Lambert', role: 'Founder, Syllabus Tracker', email: 'theo@syllabustracker.com', phone: '+1 213 555 0173', handle: '@syllabustracker' },
    },
    {
        key: 'pricewise',
        brand: 'Pricewise',
        role: 'Pricing intelligence',
        logo: '/image/customers/pricewise.png',
        tone: 'orange',
        tag: 'Auto-rotate on',
        contact: { name: 'Noor Hassan', role: 'Head of Sales, Pricewise', email: 'noor@pricewise.io', phone: '+1 312 555 0119', handle: '@pricewise' },
    },
];

const TAG_TONE: Record<Tone, string> = {
    orange: 'sk-tone-orange',
    blue: 'sk-tone-blue',
    green: 'sk-tone-green',
};

function MailIcon({ size = 11 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
            <rect x="1" y="2.5" width="10" height="7" rx="1.2" />
            <path d="M1.5 3.5 L6 6.5 L10.5 3.5" />
        </svg>
    );
}

function PhoneIcon({ size = 11 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.4">
            <path d="M2 3 L4 3 L5 5 L4 6 C4.8 7.5 5.5 8.2 7 9 L8 8 L10 9 L10 11 C6 11 1 6 1 2 Z" />
        </svg>
    );
}

function LinkedInBars({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="currentColor">
            <rect x="1" y="3" width="3" height="8" rx="0.5" />
            <rect x="5" y="5" width="3" height="6" rx="0.5" />
            <rect x="9" y="2" width="2" height="9" rx="0.5" />
            <rect x="1" y="1" width="3" height="1.5" rx="0.5" />
        </svg>
    );
}

function BriefcaseIcon({ size = 12 }: { size?: number }) {
    return (
        <svg width={size} height={size} viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.6">
            <rect x="1.5" y="3" width="9" height="6.5" rx="1" />
            <path d="M3 3 L3 1.5 L9 1.5 L9 3" />
        </svg>
    );
}

function Badge({ c }: { c: Customer }) {
    return (
        <div className="sk-badge">
            <div className="sk-clips">
                <span className="sk-clip" />
                <span className="sk-clip" />
            </div>
            <div className="sk-ribbons">
                <span className="sk-ribbon" />
                <span className="sk-ribbon" />
            </div>
            <div className="sk-card">
                <div className="sk-card-row">
                    <div className="sk-card-logo">
                        <img src={c.logo} alt={c.brand} loading="lazy" />
                    </div>
                    <div>
                        <div className="sk-card-name">{c.brand}</div>
                        <div className="sk-card-role">{c.role}</div>
                    </div>
                </div>
                <div className="sk-card-meta">
                    <div className="sk-card-meta-line">
                        <MailIcon /> {c.contact.email}
                    </div>
                    <div className="sk-card-meta-line">
                        <PhoneIcon /> {c.contact.phone}
                    </div>
                </div>
                <div className={`sk-card-tag ${TAG_TONE[c.tone]}`}>{c.tag}</div>
            </div>
        </div>
    );
}

function ContactCard({ c, isActive }: { c: Customer; isActive: boolean }) {
    return (
        <div className={`sk-pcard ${isActive ? 'is-active' : ''}`}>
            <div className="sk-pcard-art">
                <img src={c.logo} alt={c.brand} />
            </div>
            <div className="sk-pcard-info">
                <div>
                    <div className="sk-pcard-name">{c.contact.name}</div>
                    <div className="sk-pcard-role">{c.contact.role}</div>
                </div>
                <div className="sk-pcard-rows">
                    <div className="sk-row">
                        <span className="sk-ico"><MailIcon size={12} /></span>
                        <span>{c.contact.email}</span>
                        <span className="sk-arrow">→</span>
                    </div>
                    <div className="sk-row">
                        <span className="sk-ico"><PhoneIcon size={12} /></span>
                        <span>{c.contact.phone}</span>
                        <span className="sk-arrow">→</span>
                    </div>
                    <div className="sk-row">
                        <span className="sk-ico"><LinkedInBars size={12} /></span>
                        <span>linkedin.com/in/{c.contact.handle.replace('@', '')}</span>
                        <span className="sk-arrow">→</span>
                    </div>
                    <div className="sk-row">
                        <span className="sk-ico"><BriefcaseIcon size={12} /></span>
                        <span>{c.role}</span>
                        <span className="sk-arrow">→</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CustomersMarquee() {
    const [activeIndex, setActiveIndex] = useState(0);

    useEffect(() => {
        const id = setInterval(() => {
            setActiveIndex((i) => (i + 1) % CUSTOMERS.length);
        }, 3500);
        return () => clearInterval(id);
    }, []);

    const sequence = [...CUSTOMERS, ...CUSTOMERS];

    return (
        <section
            className="sk-customers-stage"
            aria-label="Superkabe customers"
        >
            <div className="sk-lede">
                <span className="sk-eyebrow">Customers · 2026</span>
                <h2>
                    Operators ship their outbound on{' '}
                    <em style={{ fontFamily: "var(--font-cormorant), 'Cormorant Garamond', Georgia, serif", color: '#E68B1F' }}>Superkabe</em>.
                </h2>
            </div>

            <div className="sk-wire" />

            <div className="sk-badges-track">
                {sequence.map((c, i) => (
                    <Badge key={`${c.key}-${i}`} c={c} />
                ))}
            </div>

            <div className="sk-center-stage">
                <div className="sk-laptop">
                    <div className="sk-laptop-lid">
                        <div className="sk-laptop-screen">
                            <div className="sk-laptop-chrome">
                                <span className="sk-tdot sk-tdot-r" />
                                <span className="sk-tdot sk-tdot-y" />
                                <span className="sk-tdot sk-tdot-g" />
                                <span className="sk-url">app.superkabe.com/contacts</span>
                            </div>
                            <div className="sk-laptop-body">
                                {CUSTOMERS.map((c, i) => (
                                    <ContactCard key={c.key} c={c} isActive={i === activeIndex} />
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="sk-laptop-base" />
                </div>

                <div className="sk-anchor">
                    <div className="sk-anchor-deco">
                        <span className="sk-anchor-dot" />
                        <svg className="sk-star" viewBox="0 0 12 12" fill="currentColor">
                            <path d="M6 0 L7 5 L12 6 L7 7 L6 12 L5 7 L0 6 L5 5 Z" />
                        </svg>
                        <span className="sk-anchor-dot" />
                    </div>
                    <img className="sk-anchor-lockup" src="/superkabe-lockup.svg" alt="Superkabe" />
                    <span className="sk-anchor-tag">Cold email, protected</span>
                </div>
            </div>

            <style jsx>{`
                .sk-customers-stage {
                    position: relative;
                    width: 100%;
                    overflow: hidden;
                    padding: 64px 0 24px;
                    color: #0A0A0B;
                }

                .sk-lede {
                    position: relative;
                    z-index: 6;
                    text-align: center;
                    margin: 0 auto;
                    max-width: 760px;
                    padding: 0 24px 12px;
                }
                .sk-eyebrow {
                    color: rgba(60, 40, 10, 0.65);
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    font-size: 12px;
                    line-height: 1;
                    letter-spacing: 0.08em;
                    font-weight: 600;
                    text-transform: uppercase;
                }
                .sk-eyebrow::before,
                .sk-eyebrow::after {
                    content: '';
                    width: 28px;
                    height: 1px;
                    background: rgba(60, 40, 10, 0.4);
                }
                .sk-lede h2 {
                    margin: 14px 0 0;
                    font-size: clamp(28px, 3vw, 40px);
                    font-weight: 600;
                    line-height: 1.1;
                    letter-spacing: -0.02em;
                    color: #111827;
                    text-wrap: balance;
                }
                .sk-lede h2 :global(em) {
                    font-style: italic;
                    font-weight: 400;
                }

                .sk-wire {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 248px;
                    height: 1px;
                    background: rgba(60, 40, 10, 0.35);
                    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.5);
                    z-index: 1;
                }

                .sk-badges-track {
                    position: absolute;
                    left: 0;
                    top: 235px;
                    display: flex;
                    gap: 220px;
                    align-items: flex-start;
                    width: max-content;
                    animation: sk-customers-drift 38s linear infinite;
                    z-index: 2;
                }
                @keyframes sk-customers-drift {
                    from { transform: translate3d(0, 0, 0); }
                    to   { transform: translate3d(-50%, 0, 0); }
                }

                .sk-center-stage {
                    position: relative;
                    z-index: 5;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    margin-top: 140px;
                }

                .sk-laptop {
                    width: 720px;
                    max-width: 92vw;
                    position: relative;
                    filter: drop-shadow(0 30px 50px rgba(60, 40, 10, 0.28));
                }
                .sk-laptop-lid {
                    width: 100%;
                    aspect-ratio: 16 / 10;
                    background: #1A1A1F;
                    border-radius: 16px 16px 6px 6px;
                    padding: 16px 16px 18px;
                    position: relative;
                }
                .sk-laptop-lid::before {
                    content: '';
                    position: absolute;
                    top: 6px;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 5px;
                    height: 5px;
                    border-radius: 999px;
                    background: #2C2C32;
                    box-shadow: inset 0 0 0 1px #0A0A0B;
                }
                .sk-laptop-screen {
                    width: 100%;
                    height: 100%;
                    background: #FFFBF4;
                    border-radius: 4px;
                    overflow: hidden;
                    position: relative;
                    border: 1px solid #000;
                }
                .sk-laptop-base {
                    width: 112%;
                    height: 14px;
                    margin: 0 -6%;
                    background: linear-gradient(180deg, #C9C9CE 0%, #8E8E93 100%);
                    border-radius: 0 0 12px 12px;
                    position: relative;
                }
                .sk-laptop-base::before {
                    content: '';
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    width: 18%;
                    height: 5px;
                    background: #5A5A5E;
                    border-radius: 0 0 8px 8px;
                }

                .sk-laptop-chrome {
                    height: 28px;
                    background: #F6F6F7;
                    border-bottom: 1px solid #ECECEE;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    padding: 0 12px;
                }
                .sk-tdot {
                    width: 9px;
                    height: 9px;
                    border-radius: 999px;
                }
                .sk-tdot-r { background: #FF5F57; }
                .sk-tdot-y { background: #FEBC2E; }
                .sk-tdot-g { background: #28C840; }
                .sk-url {
                    margin-left: 14px;
                    font-family: ui-monospace, SFMono-Regular, 'JetBrains Mono', Menlo, Consolas, monospace;
                    font-size: 11px;
                    color: #6E6E78;
                    background: #FFFFFF;
                    border: 1px solid #ECECEE;
                    border-radius: 6px;
                    padding: 3px 10px;
                    flex: 1;
                    max-width: 360px;
                }

                .sk-laptop-body {
                    position: absolute;
                    inset: 28px 0 0;
                    overflow: hidden;
                }

                .sk-anchor {
                    margin-top: 28px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 6px;
                    position: relative;
                    z-index: 5;
                }
                .sk-anchor-deco {
                    display: flex;
                    align-items: center;
                    gap: 14px;
                    color: rgba(60, 40, 10, 0.6);
                }
                .sk-anchor-dot {
                    width: 5px;
                    height: 5px;
                    border-radius: 999px;
                    background: rgba(60, 40, 10, 0.45);
                }
                .sk-star {
                    width: 12px;
                    height: 12px;
                    color: rgba(60, 40, 10, 0.55);
                }
                .sk-anchor-lockup {
                    height: 36px;
                    width: auto;
                    display: block;
                    filter: drop-shadow(0 1px 0 rgba(255, 255, 255, 0.5));
                }
                .sk-anchor-tag {
                    font-size: 11px;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    font-weight: 600;
                    color: rgba(60, 40, 10, 0.65);
                }

                @media (max-width: 760px) {
                    .sk-laptop { width: 92vw; }
                    .sk-badges-track { gap: 160px; top: 130px; }
                    .sk-wire { top: 200px; }
                    .sk-center-stage { margin-top: 110px; }
                }
            `}</style>

            <style jsx global>{`
                .sk-customers-stage .sk-badge {
                    position: relative;
                    width: 250px;
                    --sk-tilt: 0deg;
                    transform: rotate(var(--sk-tilt));
                    transform-origin: 50% 0;
                }
                .sk-customers-stage .sk-badge:nth-child(odd)  { --sk-tilt: -1.4deg; }
                .sk-customers-stage .sk-badge:nth-child(even) { --sk-tilt:  1.6deg; }
                .sk-customers-stage .sk-badge:nth-child(3n)   { --sk-tilt: -0.6deg; }

                .sk-customers-stage .sk-clips {
                    position: absolute;
                    top: 0;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 56px;
                    z-index: 3;
                }
                .sk-customers-stage .sk-clip {
                    width: 14px;
                    height: 28px;
                    border-radius: 3px 3px 2px 2px;
                    background: linear-gradient(180deg, #E8E8EA 0%, #BFBFC4 60%, #9A9AA0 100%);
                    box-shadow:
                        inset 0 1px 0 rgba(255, 255, 255, 0.6),
                        inset 0 -2px 0 rgba(0, 0, 0, 0.15),
                        0 1px 2px rgba(0, 0, 0, 0.18);
                    position: relative;
                }
                .sk-customers-stage .sk-clip::after {
                    content: '';
                    position: absolute;
                    left: 2px;
                    right: 2px;
                    top: 4px;
                    height: 2px;
                    border-radius: 2px;
                    background: rgba(0, 0, 0, 0.18);
                }

                .sk-customers-stage .sk-ribbons {
                    position: absolute;
                    top: 18px;
                    left: 50%;
                    transform: translateX(-50%);
                    display: flex;
                    gap: 56px;
                    z-index: 2;
                }
                .sk-customers-stage .sk-ribbon {
                    width: 6px;
                    height: 36px;
                    background: linear-gradient(180deg, rgba(20, 12, 2, 0.55) 0%, rgba(20, 12, 2, 0.85) 100%);
                    border-radius: 1px;
                }

                .sk-customers-stage .sk-card {
                    position: absolute;
                    left: 0;
                    right: 0;
                    top: 48px;
                    background: #FFFFFF;
                    border-radius: 10px;
                    padding: 16px 18px 18px;
                    box-shadow:
                        0 1px 0 rgba(0, 0, 0, 0.04),
                        0 12px 24px -8px rgba(60, 40, 10, 0.22),
                        0 24px 40px -16px rgba(60, 40, 10, 0.18);
                    border: 1px solid rgba(60, 40, 10, 0.06);
                    min-height: 140px;
                    z-index: 1;
                }
                .sk-customers-stage .sk-card-row {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .sk-customers-stage .sk-card-logo {
                    width: 44px;
                    height: 44px;
                    border-radius: 8px;
                    background: #F6F6F7;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    flex: 0 0 auto;
                }
                .sk-customers-stage .sk-card-logo img {
                    max-width: 80%;
                    max-height: 80%;
                    object-fit: contain;
                }
                .sk-customers-stage .sk-card-name {
                    font-size: 14px;
                    font-weight: 600;
                    color: #0A0A0B;
                    line-height: 1.2;
                    letter-spacing: -0.005em;
                }
                .sk-customers-stage .sk-card-role {
                    font-size: 11px;
                    color: #6E6E78;
                    line-height: 1.3;
                    margin-top: 2px;
                }
                .sk-customers-stage .sk-card-meta {
                    margin-top: 14px;
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                }
                .sk-customers-stage .sk-card-meta-line {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 11px;
                    color: #3B3B43;
                }
                .sk-customers-stage .sk-card-meta-line svg {
                    flex: 0 0 auto;
                    opacity: 0.7;
                }
                .sk-customers-stage .sk-card-tag {
                    margin-top: 14px;
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 4px 8px;
                    font-size: 10px;
                    font-weight: 600;
                    letter-spacing: 0.08em;
                    text-transform: uppercase;
                    border-radius: 4px;
                }
                .sk-customers-stage .sk-tone-orange { background: #FFF3E0; color: #B36710; }
                .sk-customers-stage .sk-tone-blue   { background: #E6F0FE; color: #1846AE; }
                .sk-customers-stage .sk-tone-green  { background: #E6F6EA; color: #0F6A30; }

                .sk-customers-stage .sk-pcard {
                    position: absolute;
                    inset: 0;
                    display: flex;
                    padding: 22px;
                    gap: 22px;
                    opacity: 0;
                    transform: translateY(8px);
                    transition: opacity 360ms cubic-bezier(0.2, 0, 0, 1), transform 360ms cubic-bezier(0.2, 0, 0, 1);
                    pointer-events: none;
                }
                .sk-customers-stage .sk-pcard.is-active {
                    opacity: 1;
                    transform: none;
                    pointer-events: auto;
                }
                .sk-customers-stage .sk-pcard-art {
                    flex: 0 0 38%;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #F6F6F7;
                    border: 1px solid #ECECEE;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .sk-customers-stage .sk-pcard-art img {
                    max-width: 70%;
                    max-height: 70%;
                    object-fit: contain;
                }
                .sk-customers-stage .sk-pcard-info {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 14px;
                    text-align: left;
                }
                .sk-customers-stage .sk-pcard-name {
                    font-size: 24px;
                    font-weight: 600;
                    line-height: 1.05;
                    letter-spacing: -0.015em;
                    color: #0A0A0B;
                }
                .sk-customers-stage .sk-pcard-role {
                    font-size: 13px;
                    color: #6E6E78;
                    margin-top: 4px;
                }
                .sk-customers-stage .sk-pcard-rows {
                    display: flex;
                    flex-direction: column;
                    gap: 6px;
                    margin-top: 2px;
                }
                .sk-customers-stage .sk-row {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 9px 12px;
                    background: #FFFFFF;
                    border: 1px solid #ECECEE;
                    border-radius: 8px;
                    font-size: 12px;
                    color: #3B3B43;
                }
                .sk-customers-stage .sk-ico {
                    width: 22px;
                    height: 22px;
                    border-radius: 5px;
                    background: #FCEFD8;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    flex: 0 0 auto;
                    color: #B36710;
                }
                .sk-customers-stage .sk-arrow {
                    margin-left: auto;
                    color: #92929C;
                }

                @media (max-width: 760px) {
                    .sk-customers-stage .sk-badge { width: 200px; }
                }
            `}</style>
        </section>
    );
}
