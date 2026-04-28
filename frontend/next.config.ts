import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  // Turbopack: replace legacy polyfills with empty module
  turbopack: {
    resolveAlias: {
      'next/dist/build/polyfills/polyfill-module': path.resolve(__dirname, 'src/noop.js'),
    },
  },
  // Webpack fallback: same polyfill elimination
  webpack(config, { isServer }) {
    if (!isServer) {
      // Next.js unconditionally ships ~14 KiB of legacy polyfills
      // (Array.prototype.at, Object.hasOwn, etc.) that all modern browsers
      // natively support. Replace with an empty module.
      // https://github.com/vercel/next.js/issues/86785
      config.resolve.alias['next/dist/build/polyfills/polyfill-module'] = false;
    }
    return config;
  },
  async redirects() {
    return [
      // Bare-domain → www, served by Next.js so our vercel.json headers
      // (HSTS with includeSubDomains + preload, CSP, etc.) apply to the
      // redirect response itself. Required for HSTS preload list eligibility,
      // which checks both the apex and the canonical hostname.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'superkabe.com' }],
        destination: 'https://www.superkabe.com/:path*',
        permanent: true,
      },
      {
        source: '/knowledge',
        destination: '/blog',
        permanent: true,
      },
      {
        source: '/knowledge/:path*',
        destination: '/blog/:path*',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
