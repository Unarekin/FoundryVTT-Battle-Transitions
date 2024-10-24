import { TransitionConfigHandler, LinearWipeConfiguration } from "../interfaces";
import { generateEasingSelectOptions, parseConfigurationFormElements } from "../utils";


export class LinearWipeConfigHandler implements TransitionConfigHandler<LinearWipeConfiguration> {

  public readonly defaultSettings: LinearWipeConfiguration = {
    duration: 1000,
    background: "#00000000",
    direction: "left"
  };

  generateSummary(flag?: LinearWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };

    return [settings.direction, settings.duration, settings.background].join("; ");
  }

  renderTemplate(flag?: LinearWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/linearwipe-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      directionSelect: {
        "top": "BATTLETRANSITIONS.DIRECTIONS.TOP",
        "left": "BATTLETRANSITIONS.DIRECTIONS.LEFT",
        "right": "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
        "bottom": "BATTLETRANSITIONS.DIRECTIONS.BOTTOM",
        "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
        "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT",
        "bottomleft": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMLEFT",
        "bottomright": "BATTLETRANSITIONS.DIRECTIONS.BOTTOMRIGHT"
      },
      easingSelect: generateEasingSelectOptions()
    });
  }
  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): LinearWipeConfiguration {
    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "direction", "background", "easing")
    }
  }
  public get key() { return "linearwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.LINEARWIPE"; }


}