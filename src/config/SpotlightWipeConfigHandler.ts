import { TransitionConfigHandler, SpotlightWipeConfiguration } from '../interfaces';
import { BackgroundType } from '../types';
import { formatBackgroundSummary, generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';



export class SpotlightWipeConfigHandler implements TransitionConfigHandler<SpotlightWipeConfiguration> {
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.SPOTLIGHTWIPE"; }
  public get key() { return "spotlightwipe"; }

  public readonly defaultSettings: SpotlightWipeConfiguration = {
    duration: 1000,
    direction: "top",
    radial: "outside",
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  generateSummary(flag?: SpotlightWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };
    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
      settings.direction,
      settings.radial,
      formatBackgroundSummary(settings)
    ].join("; ")
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): SpotlightWipeConfiguration {
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "direction", "radial", "easing", "backgroundType", "backgroundColor"),
    }
  }

  renderTemplate(flag?: SpotlightWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/spotlight-wipe-config.hbs`, {
      ...flag,
      directionSelect: {
        top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
        left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
        right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
        bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
      },
      radialSelect: {
        inside: "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
        outside: "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
      },
      easingSelect: generateEasingSelectOptions()
    })
  }

}
