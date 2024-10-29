import { NoBackgroundProvidedError } from '../errors';
import { MeltConfiguration, TransitionConfigHandler } from '../interfaces';
import { BackgroundType } from '../types';
import { formatBackgroundSummary, generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';

export class MeltConfigHandler implements TransitionConfigHandler<MeltConfiguration> {
  public readonly key = "melt";
  public readonly name = "BATTLETRANSITIONS.TRANSITIONTYPES.MELT";

  public readonly defaultSettings = {
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000",
    duration: 1000
  };

  public validate(flag: MeltConfiguration) {
    if (flag.backgroundType === "color" && !flag.backgroundColor) throw new NoBackgroundProvidedError();
    if (flag.backgroundType === "image" && !flag.backgroundImage) throw new NoBackgroundProvidedError();
    return true;
  }

  renderTemplate(flag: MeltConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/melt-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      easingSelect: generateEasingSelectOptions()
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): MeltConfiguration {
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "easing", "backgroundType", "backgroundColor")
    }
  }

  generateSummary(flag: MeltConfiguration): string {
    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: flag.duration }),
      formatBackgroundSummary(flag)
    ].filter(val => !!val).join("; ")
  }

}