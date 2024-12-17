import { test } from "@playwright/test";
import { upOne } from "docker-compose";
import path from "path";
import waitOn from "wait-on";
import { acceptLicense, closeTour, declineSharingData, selectWorld } from "../common.setup";

test.describe("v11 Setup", () => {
  test("Starting container", async () => {
    await upOne("foundry11", {
      cwd: path.resolve(__dirname, "../.."),
      commandOptions: ["--build"]
    });
  });

  test("Waiting for server", async ({ baseURL }) => {
    await waitOn({
      resources: [baseURL ?? ""]
    });
  })

  test("Configuring world", async ({ context, baseURL }) => {
    if (!baseURL) throw new Error("Base URL not provided.");

    const page = await context.newPage();
    await page.goto(baseURL);
    await acceptLicense(page, baseURL);
    await declineSharingData(page, baseURL);
    await closeTour(page, baseURL);
    await selectWorld(page, baseURL);
  });

})