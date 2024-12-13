import { expect, testv12 as test, BASE_URL } from "./fixtures";

test.describe.configure({ mode: "serial" });
test.describe("Simple join test", () => {
  test("Can join world", async ({ page }) => {
    console.log(page.url())
    await expect(page).toHaveURL(`${BASE_URL}/game`);
  })
})