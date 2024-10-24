import { TransitionConfigHandler, DiamondTransitionConfiguration } from '../interfaces';
import { generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';



export class DiamondTransitionConfigHandler implements TransitionConfigHandler<DiamondTransitionConfiguration> {
  public get key() { return "diamondwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.DIAMOND"; }

  public readonly defaultSettings: DiamondTransitionConfiguration = {
    duration: 1000,
    size: 40,
    background: "#00000000"
  }

  generateSummary(flag?: DiamondTransitionConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };
    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
      localize("BATTLETRANSITIONS.FORMATTERS.PIXELS", { value: settings.size }),
      settings.background
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

    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "size", "easing")
    }

  }

}
