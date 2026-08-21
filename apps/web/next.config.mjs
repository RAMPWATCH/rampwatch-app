import path from "node:path";
import { fileURLToPath } from "node:url";

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Pin the workspace root — otherwise Next.js infers it from whichever
  // lockfile it finds first walking up the tree, which can land outside
  // the monorepo entirely on a machine with unrelated projects nearby.
  outputFileTracingRoot: path.join(dirname, "../.."),
};

export default nextConfig;
