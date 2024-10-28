import { TransitionConfigHandler, DiamondTransitionConfiguration } from '../interfaces';
import { BackgroundType } from '../types';
import { formatBackgroundSummary, generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';



export class DiamondTransitionConfigHandler implements TransitionConfigHandler<DiamondTransitionConfiguration> {
  public get key() { return "diamondwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.DIAMOND"; }

  public readonly defaultSettings: DiamondTransitionConfiguration = {
    duration: 1000,
    size: 40,
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  generateSummary(flag: DiamondTransitionConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };
    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
      localize("BATTLETRANSITIONS.FORMATTERS.PIXELS", { value: settings.size }),
      formatBackgroundSummary(flag)
    ].join("; ")
  }


  public async renderTemplate(flag?: DiamondTransitionConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/diamond-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      easingSelect: generateEasingSelectOptions()
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): DiamondTransitionConfiguration {
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "size", "easing", "backgroundType", "backgroundColor")
    }

  }

}
