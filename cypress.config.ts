import "dotenv/config";
import path from "path";
import { defineConfig } from "cypress";
import { promises as fs } from "fs";
import { searchForWorkspaceRoot } from 'vite';

module.exports = defineConfig({
  viewportWidth: 1920,
  viewportHeight: 1080,
  reporter: "cypress-mochawesome-reporter",
  video: true,
  videosFolder: "cypress/reports/videos",
  screenshotsFolder: "cypress/reports/screenshots",
  reporterOptions: {
    charts: true,
    overwrite: false,
    html: true,
    reportDir: "cypress/reports"
  },

  e2e: {
    baseUrl: "http://localhost:30000",
    setupNodeEvents(on, config) {
      // implement node event listeners here
      require("cypress-mochawesome-reporter/plugin")(on);
      return config;
    },
  },

  component: {
    devServer: {
      framework: "cypress-ct-html" as any,
      bundler: "vite",
      viteConfig: {
        server: {
          fs: {
            allow: [
              searchForWorkspaceRoot(process.cwd()),
              path.join(process.env["FOUNDRY_INSTALL_LOCATION"], "resources/app/public")
            ]
          }
        }
      }
    },
    specPattern: "**/*.cy.ts",
    setupNodeEvents(on, config) {
      require("cypress-mochawesome-reporter/plugin")(on);
      on("task", {
        readFileMaybe(filename) { return fs.readFile(filename, "utf-8") }
      });
      return config;
    }
  }
});