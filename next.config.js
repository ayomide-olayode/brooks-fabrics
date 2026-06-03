/** @type {import('next').NextConfig} */
const withPWA = require("@ducanh2912/next-pwa").default({
  dest: "public",
  register: true,
  skipWaiting: true,
  customWorkerSrc: "worker/index.ts",
  disable: process.env.NODE_ENV === "development",
});
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
  experimental: {
    // serverActions is enabled by default in Next.js 14+
  },
  turbopack: {},
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.paystack.co",
              "style-src 'self' 'unsafe-inline'",
              "connect-src 'self' https://api.paystack.co",
              "img-src 'self' data: https://res.cloudinary.com",
              "frame-src https://checkout.paystack.com",
            ].join("; "),
          },
        ],
      },
    ];
  },
};

module.exports = withPWA(nextConfig);
