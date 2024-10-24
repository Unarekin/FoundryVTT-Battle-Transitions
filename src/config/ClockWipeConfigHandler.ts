import { TransitionConfigHandler, ClockWipeConfiguration } from "../interfaces";
import { generateEasingSelectOptions, localize, parseConfigurationFormElements } from "../utils";


export class ClockWipeConfigHandler implements TransitionConfigHandler<ClockWipeConfiguration> {
  public get key() { return "clockwipe" }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.CLOCKWIPE"; }

  public readonly defaultSettings: ClockWipeConfiguration = {
    direction: "top",
    clockdirection: "clockwise",
    duration: 1000,
    background: "#00000000"
  }

  public generateSummary(flag?: ClockWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };

    return [settings.clockdirection, settings.direction, localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }), settings.background].join("; ")
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
    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "direction", "background", "clockdirection", "easing")
    }
  }


}
