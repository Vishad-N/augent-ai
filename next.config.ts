import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  // inline the (small) CSS into the HTML: no render-blocking stylesheet requests before first paint
  experimental: { inlineCss: true },
  async headers() {
    return [
      {
        // Static media is not content-hashed, so revalidate daily rather than pinning it forever.
        source: "/assets/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
      {
        source: "/llms.txt",
        headers: [{ key: "Content-Type", value: "text/plain; charset=utf-8" }],
      },
    ];
  },
};

export default nextConfig;
