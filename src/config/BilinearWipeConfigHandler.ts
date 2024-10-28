import { BilinearWipeConfiguration, TransitionConfigHandler } from "../interfaces";
import { BackgroundType } from "../types";
import { formatBackgroundSummary, generateEasingSelectOptions, localize, parseConfigurationFormElements } from "../utils";


export class BilinearWipeConfigHandler implements TransitionConfigHandler<BilinearWipeConfiguration> {
  public get key() { return "bilinearwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.BILINEARWIPE"; }
  public readonly defaultSettings: BilinearWipeConfiguration = {
    duration: 1000,
    direction: "horizontal",
    radial: "inside",
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public generateSummary(flag: BilinearWipeConfiguration): string {
    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: flag.duration }),
      flag.direction, flag.radial,
      formatBackgroundSummary(flag)
    ].filter(val => !!val).join("; ");
  }

  public renderTemplate(flag?: BilinearWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/bilinear-wipe-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      directionSelect: {
        "horizontal": "BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",
        "vertical": "BATTLETRANSITIONS.DIRECTIONS.VERTICAL",
        "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
        "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT"
      },
      radialSelect: {
        "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
        "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
      },
      easingSelect: generateEasingSelectOptions()
    });
  }

  public createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): BilinearWipeConfiguration {
    //const file = $(html).find("form #file").val() as string ?? "";
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "duration", "direction", "radial", "easing", "id", "backgroundType", "backgroundColor"),
    };
  }
}
