import { test } from "@playwright/test";
import { setupWorld } from "./testFunctions"

test("Angular Wipe", async ({ page }) => {
  await setupWorld(page, "battle-transitions-v12");
  await page.locator(`ol#scene-list`).getByText("Scene 1").click({ button: "right" })
  await page.locator(`ol#scene-list ol.context-items`).getByText("Configure").click();
})