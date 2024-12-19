import { test, expect } from "../fixtures";
import { backgroundTests, defaultConfigurationTest, durationTests, labelTest } from "./common.tests";
import { angularwipe } from "../data/defaults.json";

test.describe("Scene Configuration", () => {
  test("Default Configuration", async ({ page, scene }) => defaultConfigurationTest(page, scene, "angularwipe"));
  test("Label", async ({ page, scene }) => labelTest(page, scene, "angularwipe"));

  test.describe("Duration", () => {
    durationTests("angularwipe");
  });

  test.describe("Background", () => {
    backgroundTests("angularwipe");
  });
});

test.describe("Transition Builder", () => { });

test("Macro API", async ({ page, scene }) => {
  test.step("No arguments", async () => {
    const config = await page.evaluate(() => new BattleTransition().angularWipe().sequence[0]);

    expect(config).toEqual({
      ...angularwipe,
      id: config.id,
      serializedTexture: config.serializedTexture
    });
  });

  test.step("Duration", () => {
    test.step("Null", async () => {
      expect(page.evaluate(() => new BattleTransition().angularWipe(null).sequence)).rejects.toThrow();
    });
    test.step("Negative", async () => {
      expect(page.evaluate(() => new BattleTransition().angularWipe(-500).sequence)).rejects.toThrow();
    });
    test.step("Non-numeric", async () => {
      expect(page.evaluate(() => new BattleTransition().angularWipe("peepeepoopoo").sequence)).rejects.toThrow();
    });
    test.step("Valid", async () => {
      const config = await page.evaluate(() => new BattleTransition().angularWipe(5000).sequence[0]);
      expect(config).toEqual({
        ...angularwipe,
        id: config.id,
        serializedTexture: config.serializedTexture,
        duration: 5000
      })
    });
  });
});
