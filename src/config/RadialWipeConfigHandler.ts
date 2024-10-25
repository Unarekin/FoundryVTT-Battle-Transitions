import { TransitionConfigHandler, RadialWipeConfiguration } from '../interfaces';
import { generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';
import { RadialDirection } from '../types';



export class RadialWipeConfigHandler implements TransitionConfigHandler<RadialWipeConfiguration> {
  public get key() { return "radialwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.RADIALWIPE"; }

  public readonly defaultSettings = {
    duration: 1000,
    background: "#00000000",
    radial: "inside" as RadialDirection
  }

  generateSummary(flag?: RadialWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };

    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
      settings.radial,
      settings.background
    ].join("; ")
  }

  renderTemplate(flag?: RadialWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/radial-wipe-config.hbs`, {
      ...flag,
      radialOptions: {
        "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
        "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
      },
      easingSelect: generateEasingSelectOptions()
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): RadialWipeConfiguration {
    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "radial", "background", "easing")
    }
  }
}

