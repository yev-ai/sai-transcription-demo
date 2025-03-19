import { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  experimental: {
    reactCompiler: true,
  },
  allowedDevOrigins: ['*'],
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/api/auth/(.*)',
        headers: [{ key: 'Cache-Control', value: 'no-store' }],
      },
      {
        source: '/api/stream/(.*)', // Infra compatibility
        headers: [{ key: 'Connection', value: 'keep-alive' }],
      },
      {
        // This is for a specific cloudflared caching + compression layer.
        source: '/:path*\\.(svg|png|jpg|jpeg|gif|ico)',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
        ],
      },
    ];
  },
};

export default nextConfig;
