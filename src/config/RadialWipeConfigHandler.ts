import { TransitionConfigHandler, RadialWipeConfiguration } from '../interfaces';
import { formatBackgroundSummary, generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';
import { BackgroundType, RadialDirection } from '../types';
import { NoBackgroundProvidedError } from '../errors';



export class RadialWipeConfigHandler implements TransitionConfigHandler<RadialWipeConfiguration> {
  public get key() { return "radialwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.RADIALWIPE"; }

  public readonly defaultSettings = {
    duration: 1000,
    radial: "inside" as RadialDirection,
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public validate(flag: RadialWipeConfiguration): boolean {
    if (flag.backgroundType === "color" && !flag.backgroundColor) throw new NoBackgroundProvidedError();
    if (flag.backgroundType === "image" && !flag.backgroundImage) throw new NoBackgroundProvidedError();
    return true;
  }

  generateSummary(flag?: RadialWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };

    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
      settings.radial,
      formatBackgroundSummary(settings)
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
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "radial", "backgroundColor", "backgroundType", "easing")
    }
  }
}

