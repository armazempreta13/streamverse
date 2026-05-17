import type {NextConfig} from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()' },
  { key: 'Cross-Origin-Opener-Policy',   value: 'same-origin-allow-popups' },
  { key: 'Cross-Origin-Resource-Policy', value: 'cross-origin' },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  eslint:     { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },

  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org',         pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos',          pathname: '/**' },
      { protocol: 'https', hostname: 'fastly.picsum.photos',   pathname: '/**' },
      { protocol: 'https', hostname: 'image.pollinations.ai',  pathname: '/**' },
      { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
    ],
  },

  output: 'standalone',
  transpilePackages: ['motion'],

  // Security headers on every response (belt-and-suspenders with middleware)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Cache static TMDb images aggressively at the edge
      {
        source: '/api/catalog',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=3600' },
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },
      {
        source: '/api/tmdb/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, s-maxage=300, stale-while-revalidate=7200' },
          { key: 'Vary', value: 'Accept-Encoding' },
        ],
      },
    ];
  },

  webpack: (config, { dev }) => {
    if (dev && process.env.DISABLE_HMR === 'true') {
      config.watchOptions = { ignored: /.*/ };
    }
    return config;
  },
};

export default nextConfig;

if (process.env.NODE_ENV === 'development') {
  import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev()).catch(() => {});
}
