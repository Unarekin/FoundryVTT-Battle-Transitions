import { NoBackgroundProvidedError } from '../errors';
import { AngularWipeConfiguration, TransitionConfigHandler } from '../interfaces';
import { BackgroundType } from '../types';
import { formatBackgroundSummary, generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';

export class AngularWipeConfigHandler implements TransitionConfigHandler<AngularWipeConfiguration> {
  public readonly key = "angularwipe";
  public readonly name = "BATTLETRANSITIONS.TRANSITIONTYPES.ANGULARWIPE";

  public readonly defaultSettings: AngularWipeConfiguration = {
    duration: 1000,
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public validate(flag: AngularWipeConfiguration): boolean {
    if (flag.backgroundType === "color" && !flag.backgroundColor) throw new NoBackgroundProvidedError();
    if (flag.backgroundType === "image" && !flag.backgroundImage) throw new NoBackgroundProvidedError();
    return true;
  }

  public generateSummary(flag: AngularWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };
    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
      formatBackgroundSummary(settings)
    ].filter(val => !!val).join("; ")
  }

  public renderTemplate(flag?: AngularWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/angularwipe-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      easingSelect: generateEasingSelectOptions()
    })
  }

  public createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): AngularWipeConfiguration {
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "easing", "backgroundType", "backgroundColor")
    }
  }
}
