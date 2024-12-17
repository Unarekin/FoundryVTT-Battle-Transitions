import { test } from "../fixtures";

test("Test", async ({ page }) => {
  await page.waitForLoadState("load");
});