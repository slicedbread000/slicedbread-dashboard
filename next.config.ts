import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // IMPORTANT: Do NOT use `output: "export"` on Vercel if you want /api routes.
  // Leaving `output` undefined allows Vercel to deploy with serverless functions.
};

export default nextConfig;
