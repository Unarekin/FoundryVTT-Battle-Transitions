import { testv12 as test } from "./fixtures";
import { angularwipe } from "./data/defaults.json";
import easings from "./data/easings.json";
import { backgroundColorTest, backgroundImageTest, backgroundOverlayTest, defaultConfigurationTest, durationTest, easingTest, labelTest } from "./configTestFunctions";
import { LinearWipeConfiguration } from "../src/steps";

declare const BattleTransition: any;

test.describe("Configuration Tests", () => {
  test("Can set default configuration", async ({ page }) => {
    await defaultConfigurationTest(page, angularwipe);
  });

  test("Can set label", async ({ page }) => {
    await labelTest(page, {
      ...angularwipe,
      label: "Test Label"
    });
  });

  test("Can set duration", async ({ page }) => {
    await durationTest(page, {
      ...angularwipe,
      duration: 5000
    });
  });

  test("Can set background color", async ({ page }) => {
    await backgroundColorTest(page, {
      label: "",
      ...angularwipe,
      backgroundColor: "#FFFFFFFF"
    });
  });

  test("Can set background image", async ({ page }) => {
    await backgroundImageTest(page, {
      label: "",
      ...angularwipe,
      backgroundImage: "uploads/images/TestScene1.webp"
    })
  });

  test("Can set background to overlay", async ({ page }) => {
    await backgroundOverlayTest(page, {
      label: "",
      ...angularwipe,
      backgroundType: "overlay"
    })
  });

  test.describe("Can set easing", () => {
    for (const easing of easings) {
      test(easing, async ({ page }) => {
        await easingTest(page, {
          label: "",
          ...angularwipe,
          easing
        });
      })
    }
  });

  function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // test.describe("Visuals", () => {
  //   const directions = ["left", "topleft", "top", "topright", "right", "bottomright", "bottom", "bottomleft"];
  //   const config = directions.map(direction => ({
  //     id: "",
  //     version: "1.1.6",
  //     type: "linearwipe",
  //     duration: 1000,
  //     direction,
  //     backgroundColor: `${getRandomColor()}FF`,
  //     backgroundType: "color",
  //     bgSizingMode: "stretch",
  //     easing: "none"
  //   }));

  //   test("Aw yee", async ({ page }) => {

  //     await page.evaluate<void, typeof config>(async (config) => {

  //       await BattleTransition
  //         .ExecuteSequence("Scene 2", config)
  //         .then(() => new Promise(resolve => { setTimeout(resolve, 2000) }))
  //         // .then(() => new Promise(resolve => { setTimeout(resolve, config.length * 750) }))
  //         .then(() => game?.scenes?.getName("Scene 1").activate())
  //         ;

  //     }, config);

  //   });

  //   // test("Left", async ({ page }) => {
  //   //   await page.evaluate(() => BattleTransition.ExecuteSequence(
  //   //     game?.scenes?.getName("Scene 2") as Scene,
  //   //     [
  //   //       {
  //   //         id: "",
  //   //         version: "1.1.6",
  //   //         type: "linearwipe",
  //   //         duration: 2000,
  //   //         direction: "left",
  //   //         backgroundColor: "#00000000",
  //   //         backgroundType: "color",
  //   //         bgSizingMode: "stretch",
  //   //         easing: "none"
  //   //       } as LinearWipeConfiguration,
  //   //     ]
  //   //   )
  //   //     .then(() => new Promise(resolve => { setTimeout(resolve, 2000) })));

  // })
});