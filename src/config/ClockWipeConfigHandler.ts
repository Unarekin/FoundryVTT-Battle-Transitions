import { TransitionConfigHandler, ClockWipeConfiguration } from "../interfaces";
import { BackgroundType } from "../types";
import { formatBackgroundSummary, generateEasingSelectOptions, localize, parseConfigurationFormElements } from "../utils";


export class ClockWipeConfigHandler implements TransitionConfigHandler<ClockWipeConfiguration> {
  public get key() { return "clockwipe" }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.CLOCKWIPE"; }

  public readonly defaultSettings: ClockWipeConfiguration = {
    direction: "top",
    clockdirection: "clockwise",
    duration: 1000,
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public generateSummary(flag: ClockWipeConfiguration): string {
    return [
      flag.clockdirection, flag.direction,
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: flag.duration }),
      formatBackgroundSummary(flag)
    ].filter(val => !!val).join("; ");
  }

  async renderTemplate(flag?: ClockWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/clockwipe-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      directionSelect: {
        top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
        left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
        right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
        bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
      },
      clockDirectionSelect: {
        clockwise: "BATTLETRANSITIONS.DIRECTIONS.CLOCKWISE",
        counterclockwise: "BATTLETRANSITIONS.DIRECTIONS.COUNTERCLOCKWISE"
      },
      easingSelect: generateEasingSelectOptions()
    });
  }

  public createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): ClockWipeConfiguration {
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "direction", "use", "clockdirection", "easing", "backgroundType", "backgroundColor")
    }
  }


}
