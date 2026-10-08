import { defineConfig } from "@playwright/test";
import { existsSync } from "node:fs";
export default defineConfig({
  testDir: "./tests/live",
  globalTeardown: "./tests/live/teardown.ts",
  workers: 1,
  fullyParallel: false,
  timeout: 120000,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report/live" }],
  ],
  use: {
    baseURL: "http://localhost:3100",
    viewport: { width: 1280, height: 900 },
    trace: "off",
    screenshot: "only-on-failure",
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ||
        (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
    },
  },
  webServer: {
    command: "npx tsx scripts/test-server.ts",
    url: "http://localhost:3100",
    reuseExistingServer: false,
    timeout: 30000,
    env: { NEXT_TELEMETRY_DISABLED: "1" },
  },
});
