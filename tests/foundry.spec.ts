import { test } from "@playwright/test";
import { setupWorld } from "./testFunctions";
import { awaitHook } from "./foundryFunctions";

test("Can browse", async ({ page }) => {
  await setupWorld(page, "battle-transitions-v12");
  await awaitHook("canvasReady");
  page.keyboard.press(" ");
})
