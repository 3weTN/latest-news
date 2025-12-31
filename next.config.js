/** @type {import('next').NextConfig} */
const ONE_YEAR = 31536000;

const nextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.mosaiquefm.net",
      },
      {
        protocol: "https",
        hostname: "cdn.mosaiquefm.net",
      },
      {
        protocol: "https",
        hostname: "www.mosaiquefm.net",
      },
      {
        protocol: "https",
        hostname: "mosaiquefm.net",
      },
      {
        protocol: "https",
        hostname: "content.mosaiquefm.net",
      },
      {
        protocol: "http",
        hostname: "content.mosaiquefm.net",
      },
      {
        protocol: "http",
        hostname: "api.mosaiquefm.net",
      },
      {
        protocol: "http",
        hostname: "cdn.mosaiquefm.net",
      },
      {
        protocol: "http",
        hostname: "www.mosaiquefm.net",
      },
      {
        protocol: "http",
        hostname: "mosaiquefm.net",
      },
      {
        protocol: "https",
        hostname: "www.tunisienumerique.com",
      },
      {
        protocol: "https",
        hostname: "kapitalis.com",
      },
      {
        protocol: "https",
        hostname: "lapresse.tn",
      },
      {
        protocol: "https",
        hostname: "www.rtci.tn",
      },
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR}, immutable`,
          },
        ],
      },
      {
        source: "/_next/image/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR}, immutable`,
          },
        ],
      },
      {
        source: "/fonts/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR}, immutable`,
          },
        ],
      },
      {
        source: "/(.*)\\.(js|css|svg|png|jpg|jpeg|gif|webp|avif|ico)$",
        headers: [
          {
            key: "Cache-Control",
            value: `public, max-age=${ONE_YEAR}, immutable`,
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
