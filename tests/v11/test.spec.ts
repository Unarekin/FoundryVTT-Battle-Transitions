import { test } from "../fixtures";

test("Test", async ({ page }) => {
  // await page.waitForLoadState("load");
  await new Promise(resolve => { setTimeout(resolve, 5000) })
});