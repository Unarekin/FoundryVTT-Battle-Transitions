import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// import dotenv from 'dotenv';
// import path from 'path';
// dotenv.config({ path: path.resolve(__dirname, '.env') });

const baseURL = "http://localhost";

const chromeSetup = {
  ...devices['Desktop Chrome'],
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
}

const firefoxSetup = {
  ...devices['Desktop Firefox'],
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
}

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
  workers: process.env.CI ? 1 : undefined,
  // workers: 1,
  use: {
    actionTimeout: 0,
    // baseURL: "http://localhost:30000",
    baseURL: `${baseURL}:30000`,
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
    // v11
    {
      name: "v11 Setup",
      testDir: "./tests/v11",
      testMatch: /global\.setup\.ts/,
      use: {
        baseURL: `${baseURL}:30011`
      }
    },
    {
      name: 'Chrome',
      testDir: "./tests/v11",
      dependencies: ["v11 Setup"],
      teardown: "v11 Teardown",
      use: {
        ...chromeSetup,
        baseURL: `${baseURL}:30011`
      }
    },
    {
      name: 'Firefox',
      testDir: "./tests/v11",
      dependencies: ["v11 Setup"],
      teardown: "v11 Teardown",
      use: {
        ...firefoxSetup,
        baseURL: `${baseURL}:30011`
      }
    },
    {
      name: "v11 Teardown",
      testDir: "./tests/v11",
      testMatch: /global\.teardown\.ts/,
      use: {
        baseURL: `${baseURL}:30011`
      }
    },

    // v12
    {
      name: "v12 Setup",
      testDir: "./tests/v12",
      testMatch: /global\.setup\.ts/,
      use: {
        baseURL: `${baseURL}:30012`
      }
    },
    {
      name: "Chrome",
      testDir: "./tests/v12",
      dependencies: ["v12 Setup"],
      teardown: "v12 Teardown",
      use: {
        ...chromeSetup,
        baseURL: `${baseURL}:30012`
      }
    },
    {
      name: 'Firefox',
      testDir: "./tests/v12",
      dependencies: ["v12 Setup"],
      teardown: "v12 Teardown",
      use: {
        ...firefoxSetup,
        baseURL: `${baseURL}:30012`
      }
    },
    {
      name: "v12 Teardown",
      testDir: "./tests/v12",
      testMatch: /global\.teardown\.ts/,
      use: {
        baseURL: `${baseURL}:30012`
      }
    },

    // v13
    {
      name: "v13 Setup",
      testDir: "./tests/v13",
      testMatch: /global\.setup\.ts/,
      use: {
        baseURL: `${baseURL}:30013`
      }
    },

    {
      name: "Chrome",
      testDir: "./tests/v13",
      dependencies: ["v13 Setup"],
      teardown: "v13 Teardown",
      use: {
        ...chromeSetup,
        baseURL: `${baseURL}:30013`
      }
    },
    {
      name: 'Firefox',
      testDir: "./tests/v13",
      dependencies: ["v13 Setup"],
      teardown: "v13 Teardown",
      use: {
        ...firefoxSetup,
        baseURL: `${baseURL}:30013`
      }
    },
    {
      name: "v13 Teardown",
      testDir: "./tests/v13",
      testMatch: /global\.teardown\.ts/,
      use: {
        baseURL: `${baseURL}:30013`
      }
    }
  ],

});