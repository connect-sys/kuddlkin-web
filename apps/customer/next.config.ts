import type { NextConfig } from "next";
import { config as loadEnv } from "dotenv";
import path from "node:path";

// Load the SINGLE root .env (kuddlkin-web/.env) so NEXT_PUBLIC_* come from one
// place shared with the backend and partner app. The API base URL itself is
// auto-derived in src/lib/api.ts (localhost in dev, api.kuddlkin.co in prod),
// so it does NOT need to live in .env.
loadEnv({ path: path.resolve(process.cwd(), "../../.env") });

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;
