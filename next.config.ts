import type { NextConfig } from "next";
import { createRequire } from "module";
import path from "path";

const require = createRequire(import.meta.url);
const ROOT = path.dirname(require.resolve("./package.json"));

const nextConfig: NextConfig = {
  output: "export",
  basePath: "/Agentic-Animations-2",
  images: { unoptimized: true },
  outputFileTracingRoot: ROOT,
  turbopack: {
    root: ROOT,
  },
};

export default nextConfig;
