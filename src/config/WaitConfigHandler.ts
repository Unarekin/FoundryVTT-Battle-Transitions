import { TransitionConfigHandler, WaitConfiguration } from "../interfaces";
import { localize, parseConfigurationFormElements } from "../utils";


export class WaitConfigHandler implements TransitionConfigHandler<WaitConfiguration> {
  public get key() { return "wait"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.WAIT"; }

  public readonly defaultSettings = { duration: 1000 };

  generateSummary(flag?: WaitConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };
    return localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration });
  }

  public validate() { return true; }

  renderTemplate(flag?: WaitConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/wait-config.hbs`, {
      ...this.defaultSettings,
      ...flag
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): WaitConfiguration {
    return {
      ...this.defaultSettings,
      ...parseConfigurationFormElements($(html).find("form"), "id", "duration")
    }
  }
}
