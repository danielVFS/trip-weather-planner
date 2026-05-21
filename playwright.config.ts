import { defineConfig, devices } from "@playwright/test"

const isRecording = process.env.PW_RECORDING === "1"
const includeWebKit = process.env.PLAYWRIGHT_INCLUDE_WEBKIT === "1"
const slowMo = Number(process.env.PLAYWRIGHT_SLOW_MO ?? 1000)

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: !isRecording,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: process.env.CI || isRecording ? 1 : undefined,
  reporter: [["list"], ["html", { open: "never" }]],
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  use: {
    baseURL: "http://localhost:5173",
    launchOptions: isRecording
      ? {
          slowMo,
        }
      : undefined,
    trace: "on-first-retry",
    actionTimeout: 10_000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    ...(includeWebKit
      ? [
          {
            name: "webkit",
            use: { ...devices["Desktop Safari"] },
          },
        ]
      : []),
    {
      name: "mobile-chrome",
      use: { ...devices["Pixel 5"] },
    },
  ],
  webServer: [
    {
      command: "bun run dev:backend",
      url: "http://localhost:3000/health",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: "bun run dev:frontend",
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
  ],
})
