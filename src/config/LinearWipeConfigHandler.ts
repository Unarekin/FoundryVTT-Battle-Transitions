import { NoBackgroundProvidedError } from "../errors";
import { TransitionConfigHandler, LinearWipeConfiguration } from "../interfaces";
import { BackgroundType } from "../types";
import { formatBackgroundSummary, generateEasingSelectOptions, localize, parseConfigurationFormElements } from "../utils";


export class LinearWipeConfigHandler implements TransitionConfigHandler<LinearWipeConfiguration> {

  public readonly defaultSettings: LinearWipeConfiguration = {
    duration: 1000,
    direction: "left",
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000"
  };

  public validate(flag: LinearWipeConfiguration) {
    if (flag.backgroundType === "color" && !flag.backgroundColor) throw new NoBackgroundProvidedError();
    if (flag.backgroundType === "image" && !flag.backgroundImage) throw new NoBackgroundProvidedError();
    return true;
  }

  generateSummary(flag: LinearWipeConfiguration): string {
    return [
      flag?.direction,
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: flag?.duration }),
      formatBackgroundSummary(flag)
    ].filter(val => !!val).join(": ");
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
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "direction", "easing", "backgroundType", "backgroundColor")
    }
  }
  public get key() { return "linearwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.LINEARWIPE"; }


}