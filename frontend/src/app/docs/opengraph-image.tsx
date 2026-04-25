import { ImageResponse } from 'next/og';

export const alt = 'Superkabe Documentation — Platform rules, integrations, and API';
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
 background: 'linear-gradient(135deg, #F7F2EB 0%, #E6DDCC 100%)',
 fontFamily: 'sans-serif',
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
 <div style={{ width: 16, height: 16, borderRadius: 8, background: '#1C4532' }} />
 <div style={{ fontSize: 28, fontWeight: 700, color: '#1C4532' }}>Superkabe</div>
 </div>

 <div style={{ display: 'flex', flexDirection: 'column' }}>
 <div style={{ fontSize: 72, fontWeight: 800, color: '#111827', lineHeight: 1.1, letterSpacing: '-0.03em', marginBottom: 20 }}>
 Documentation.
 </div>
 <div style={{ fontSize: 28, color: '#4B5563', lineHeight: 1.4, maxWidth: 1000 }}>
 Platform rules, integrations, API documentation, and the MCP server.
 </div>
 </div>

 <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 20, color: '#6B7280' }}>
 <span>Docs · Superkabe</span>
 <span style={{ color: '#1C4532', fontWeight: 600 }}>superkabe.com/docs</span>
 </div>
 </div>
 ),
 size,
 );
}
