import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Use Node environment (not jsdom) — we're testing Express routes
    environment: "node",
    // Include only test files in src/
    include: ["src/**/*.test.ts"],
    // ESM-friendly — no transform needed for our TypeScript source
    // Vitest handles TS via esbuild by default
  },
});
