import { TransitionConfigHandler } from '../interfaces';
import { FireDissolveConfiguration } from '../types';
import { localize } from '../utils';


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
      ...flag
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): FireDissolveConfiguration {
    const form = $(html).find("form").serializeArray();

    const duration = form.find(elem => elem.name === "duration");
    const background = form.find(elem => elem.name === "background");
    const burnSize = form.find(elem => elem.name === "burnsize");
    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(duration ? { duration: parseFloat(duration.value) } : {}),
      ...(background ? { background: background.value } : {}),
      ...(burnSize ? { burnSize: parseFloat(burnSize.value) } : {}),
      id: id ? id.value : foundry.utils.randomID()
    }
  }
}
