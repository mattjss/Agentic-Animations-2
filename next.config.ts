import type { NextConfig } from "next";
import path from "path";
import { fileURLToPath } from "url";

/**
 * Lock this app to this directory. If a parent folder (e.g. $HOME) also has
 * package-lock.json, Next 15+ may pick the wrong root and break dev/prod (500s).
 */
const ROOT = path.dirname(fileURLToPath(import.meta.url));

const nextConfig: NextConfig = {
  outputFileTracingRoot: ROOT,
  turbopack: {
    root: ROOT,
  },
};

export default nextConfig;
