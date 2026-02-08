import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Superkabe - Infrastructure Protection for Modern Outbound Teams',
  description:
    'Production-hardened monitoring and protection layer for multi-domain, multi-mailbox outbound email infrastructure',
  icons: {
    icon: '/image/favicon-v2.png',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
