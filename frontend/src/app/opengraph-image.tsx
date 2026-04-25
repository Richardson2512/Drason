import { ImageResponse } from 'next/og';

export const alt = 'Superkabe — AI cold email platform with native deliverability protection';
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
                    justifyContent: 'center',
                    padding: '80px',
                    background: 'linear-gradient(135deg, #F7F2EB 0%, #F0E8DC 100%)',
                    fontFamily: 'sans-serif',
                }}
            >
                <div style={{ fontSize: 36, fontWeight: 700, color: '#1C4532', letterSpacing: '-0.02em', marginBottom: 32 }}>
                    Superkabe
                </div>
                <div style={{ fontSize: 76, fontWeight: 800, color: '#111827', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 28 }}>
                    AI cold email, sent safely.
                </div>
                <div style={{ fontSize: 30, color: '#4B5563', lineHeight: 1.4, maxWidth: 900 }}>
                    AI sequences · Multi-mailbox sending · Deliverability protection
                </div>
            </div>
        ),
        size,
    );
}
