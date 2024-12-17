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
  timeout: 45 * 1000,
  expect: {
    timeout: 5000
  },
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
      name: "v12 Setup",
      testDir: "./tests/v12",
      testMatch: /global\.setup\.ts/
    },
    {
      name: "Chrome - UI - v12",
      testDir: "./tests/v12/serial",
      fullyParallel: false,
      dependencies: ['v12 Setup'],
      // teardown: "v12 Teardown",
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
    },
    {
      name: "Chrome - API - v12",
      testDir: "./tests/v12/parallel",
      dependencies: ['v12 Setup'],
      // teardown: "v12 Teardown",
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
    },
    {
      name: "v12 Teardown",
      testDir: "./tests/v12",
      testMatch: /global\.teardown\.ts/
    },
  ]
  // projects: [
  //   {
  //     name: "Desktop Chromium",
  //     use: {
  //       ...devices["Desktop Chrome"],
  //       launchOptions: {
  //         args: ["--enable-gpu"]
  //       },
  //       contextOptions: {
  //         screen: {
  //           width: 1920,
  //           height: 1080
  //         }
  //       },
  //       viewport: {
  //         width: 1920,
  //         height: 1080
  //       }
  //     },
  //   },
  //   {
  //     name: 'firefox',
  //     use: {
  //       ...devices['Desktop Firefox'],
  //       contextOptions: {
  //         screen: {
  //           width: 1920,
  //           height: 1080
  //         }
  //       },
  //       viewport: {
  //         width: 1920,
  //         height: 1080
  //       }
  //     },
  //   },

  //   {
  //     name: 'webkit',
  //     use: {
  //       ...devices['Desktop Safari'],
  //       contextOptions: {
  //         screen: {
  //           width: 1920,
  //           height: 1080
  //         }
  //       },
  //       viewport: {
  //         width: 1920,
  //         height: 1080
  //       }
  //     },
  //   },
  // ]
});