import { defineConfig } from "@playwright/test";
export default defineConfig({
  testDir: "./tests/live",
  testMatch: [
    "motion.spec.ts",
    "home-services.spec.ts",
    "home-redesign.spec.ts",
    "home-polish.spec.ts",
  ],
  workers: 1,
  reporter: "list",
  outputDir: "test-results/visual",
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    ...(process.platform === "win32" ? { channel: "chrome" } : {}),
    viewport: { width: 1280, height: 900 },
  },
});
