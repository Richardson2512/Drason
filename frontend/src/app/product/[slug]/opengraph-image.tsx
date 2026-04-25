import { ImageResponse } from 'next/og';
import { productPages } from '@/data/productPages';

export const alt = 'Superkabe product page';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function generateImageMetadata({ params }: { params: { slug: string } }) {
 const data = productPages[params.slug];
 return [{
 id: 'og',
 alt: data?.title ? `${data.title} | Superkabe` : 'Superkabe',
 contentType: 'image/png',
 size,
 }];
}

export default async function Image({ params }: { params: { slug: string } }) {
 const data = productPages[params.slug];
 const title = data?.title ?? 'Superkabe';
 const description = data?.description ?? 'AI cold email platform with native deliverability protection';

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
 background: 'linear-gradient(135deg, #F7F2EB 0%, #F0E8DC 100%)',
 fontFamily: 'sans-serif',
 }}
 >
 <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
 <div style={{ width: 16, height: 16, borderRadius: 8, background: '#1C4532' }} />
 <div style={{ fontSize: 28, fontWeight: 700, color: '#1C4532', letterSpacing: '-0.01em' }}>
 Superkabe
 </div>
 </div>

 <div style={{ display: 'flex', flexDirection: 'column' }}>
 <div
 style={{
 fontSize: title.length > 60 ? 54 : title.length > 40 ? 64 : 72,
 fontWeight: 800,
 color: '#111827',
 lineHeight: 1.08,
 letterSpacing: '-0.03em',
 marginBottom: 24,
 }}
 >
 {title}
 </div>
 <div style={{ fontSize: 26, color: '#4B5563', lineHeight: 1.4, maxWidth: 1000 }}>
 {description.length > 140 ? description.slice(0, 137) + '…' : description}
 </div>
 </div>

 <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 20, color: '#6B7280' }}>
 <span>Product · Superkabe</span>
 <span style={{ color: '#1C4532', fontWeight: 600 }}>superkabe.com</span>
 </div>
 </div>
 ),
 size,
 );
}
