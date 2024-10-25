import { TransitionConfigHandler, FireDissolveConfiguration } from '../interfaces';
import { generateEasingSelectOptions, localize, parseConfigurationFormElements } from '../utils';


export class FireDissolveConfigHandler implements TransitionConfigHandler<FireDissolveConfiguration> {
  public get key() { return "firedissolve"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.FIREDISSOLVE"; }

  public readonly defaultSettings = {
    duration: 1000,
    background: "#00000000",
    burnSize: 1.3
  }

  generateSummary(flag?: FireDissolveConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };
    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
      settings.background
    ].join("; ");
  }

  async renderTemplate(flag?: FireDissolveConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/fire-dissolve-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      easingSelect: generateEasingSelectOptions()
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): FireDissolveConfiguration {
    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration", "background", "burnsize", "easing")
    }
  }
}
