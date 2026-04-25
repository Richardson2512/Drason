import { ImageResponse } from 'next/og';

export const alt = 'Cheapest Cold Email Tools of 2026 (Ranked by Cost-to-Value) — Superkabe';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    padding: '72px',
                    background: 'linear-gradient(135deg, #F7F2EB 0%, #EADFCE 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <div style={{ width: 16, height: 16, borderRadius: 8, background: '#1C4532' }} />
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#1C4532' }}>Superkabe</div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', alignSelf: 'flex-start', padding: '6px 14px', background: '#1C4532', color: '#F7F2EB', fontSize: 18, fontWeight: 600, marginBottom: 24, letterSpacing: '0.02em' }}>
                        PRICING · 2026
                    </div>
                    <div style={{ fontSize: 72, fontWeight: 800, color: '#111827', lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 20 }}>
                        Cheapest cold email tools
                    </div>
                    <div style={{ fontSize: 26, color: '#4B5563', lineHeight: 1.4, maxWidth: 1000 }}>
                        Total cost of ownership at solo, growing-team, and agency tiers. Per-tier vs per-user vs per-active-lead pricing — and the hidden costs nobody discloses.
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#6B7280' }}>
                    <span>Blog · Pricing breakdown</span>
                    <span style={{ color: '#1C4532', fontWeight: 600 }}>superkabe.com</span>
                </div>
            </div>
        ),
        size,
    );
}
