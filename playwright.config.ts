import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  reporter: [
    ["list"],
    ["html"]
  ],
  testDir: "./tests",
  timeout: 45 * 1000,
  expect: {
    timeout: 5000
  },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // workers: process.env.CI ? 1 : undefined,
  workers: 1,
  use: {
    actionTimeout: 0,
    baseURL: "http://localhost:30000",
    trace: "on-first-retry",
    video: {
      mode: "on",
      size: {
        width: 1920,
        height: 1080
      }
    },
  },
  projects: [
    {
      name: "Desktop Chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: {
          args: ["--enable-gpu"]
        },
        contextOptions: {
          screen: {
            width: 1920,
            height: 1080
          }
        },
        viewport: {
          width: 1920,
          height: 1080
        }
      },
    }
  ]
});