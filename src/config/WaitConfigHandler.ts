import { TransitionConfigHandler, WaitConfiguration } from "../interfaces";
import { localize } from "../utils";


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

  renderTemplate(flag?: WaitConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/wait-config.hbs`, {
      ...this.defaultSettings,
      ...flag
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): WaitConfiguration {
    const form = $(html).find("form").serializeArray()
    const duration = form.find(elem => elem.name === "duration");
    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(duration ? { duration: parseFloat(duration.value) } : {}),
      id: id ? id.value : foundry.utils.randomID()
    }
  }
}
