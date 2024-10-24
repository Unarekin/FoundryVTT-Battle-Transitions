import { BilinearWipeConfiguration, TransitionConfigHandler } from "../interfaces";
import { generateEasingSelectOptions, localize, parseConfigurationFormElements } from "../utils";


export class BilinearWipeConfigHandler implements TransitionConfigHandler<BilinearWipeConfiguration> {
  public get key() { return "bilinearwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.BILINEARWIPE"; }
  public readonly defaultSettings: BilinearWipeConfiguration = {
    duration: 1000,
    direction: "horizontal",
    radial: "inside",
    background: "#00000000",
  }

  public generateSummary(flag?: BilinearWipeConfiguration): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (flag) return [localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: (flag as any).duration }), flag.direction, flag.radial, (flag as any).background].join("; ");
    else return "";
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
    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "duration", "background", "direction", "radial", "easing", "id"),
    };
  }
}
