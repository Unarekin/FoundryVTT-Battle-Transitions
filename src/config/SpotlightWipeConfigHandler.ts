import { TransitionConfigHandler, SpotlightWipeConfiguration } from '../interfaces';
import { generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';



export class SpotlightWipeConfigHandler implements TransitionConfigHandler<SpotlightWipeConfiguration> {
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.SPOTLIGHTWIPE"; }
  public get key() { return "spotlightwipe"; }

  public readonly defaultSettings: SpotlightWipeConfiguration = {
    duration: 1000,
    background: "#00000000",
    direction: "top",
    radial: "outside"
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
      settings.background
    ].join("; ")
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): SpotlightWipeConfiguration {
    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "direction", "radial", "background", "easing"),
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
