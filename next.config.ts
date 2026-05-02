import type { NextConfig } from "next";
import { createRequire } from "module";
import path from "path";

/** Absolute path to this app (directory of package.json), not a parent folder with an extra lockfile. */
const require = createRequire(import.meta.url);
const ROOT = path.dirname(require.resolve("./package.json"));

const nextConfig: NextConfig = {
  outputFileTracingRoot: ROOT,
  turbopack: {
    root: ROOT,
  },
};

export default nextConfig;
