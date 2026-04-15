import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 0,
  use: {
    baseURL: "http://127.0.0.1:4317",
    trace: "on-first-retry"
  },
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4317",
    url: "http://127.0.0.1:4317",
    reuseExistingServer: false,
    stdout: "pipe",
    stderr: "pipe",
    timeout: 120000
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] }
    },
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 7"] }
    }
  ]
});
