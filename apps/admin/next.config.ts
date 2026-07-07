import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@kuddlkin/api-client",
    "@kuddlkin/kuddl-kin",
    "@kuddlkin/types",
    "@kuddlkin/utils",
  ],
};

export default nextConfig;
