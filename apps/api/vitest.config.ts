import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    testTimeout: 60_000,
    // These are live integration tests against a real anchor — run test
    // files sequentially rather than hammering it with concurrent bursts.
    fileParallelism: false,
  },
});
