/** @type {import('next').NextConfig} */
const nextConfig = {
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
    ],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    formats: ["image/webp"],
  },
};

module.exports = nextConfig;
