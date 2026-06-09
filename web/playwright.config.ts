import { defineConfig, devices } from "@playwright/test";

/**
 * E2E smoke against a real production build (build + preview).
 * Uses the system Google Chrome (channel: "chrome") because Playwright's
 * bundled Chromium download isn't available for this OS.
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: false,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://localhost:4173",
    trace: "off",
  },
  webServer: {
    command: "npm run build && npm run preview",
    url: "http://localhost:4173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"], channel: "chrome" },
    },
  ],
});
