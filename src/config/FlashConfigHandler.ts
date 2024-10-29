import { NoBackgroundProvidedError } from '../errors';
import { FlashConfiguration, TransitionConfigHandler } from '../interfaces';
import { formatBackgroundSummary, localize, parseConfigurationFormElements } from '../utils';

export class FlashConfigHandler implements TransitionConfigHandler<FlashConfiguration> {
  public readonly key = "flash";
  public readonly name = "BATTLETRANSITIONS.TRANSITIONTYPES.FLASH";

  public readonly defaultSettings: FlashConfiguration = {
    backgroundType: "color",
    backgroundColor: "#00000000",
    backgroundImage: "",
    duration: 250
  };


  public validate(flag: FlashConfiguration) {
    if (flag.backgroundType === "color" && !flag.backgroundColor) throw new NoBackgroundProvidedError();
    if (flag.backgroundType === "image" && !flag.backgroundImage) throw new NoBackgroundProvidedError();
    return true;
  }

  public generateSummary(flag: FlashConfiguration): string {
    return [
      formatBackgroundSummary(flag),
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: flag.duration })
    ].filter(val => !!val).join("; ");
  }

  public renderTemplate(flag?: FlashConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/flash-config.hbs`, {
      ...this.defaultSettings,
      ...flag
    })
  }

  public createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): FlashConfiguration {
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "backgroundType", "backgroundColor")
    }
  }

}
