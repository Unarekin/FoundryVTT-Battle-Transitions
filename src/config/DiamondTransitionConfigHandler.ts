import { TransitionConfigHandler } from '../interfaces';
import { localize } from '../utils';

export interface DiamondTransitionConfiguration {
  size: number;
  background: string;
  duration: number;
  id?: string;
}


export class DiamondTransitionConfigHandler implements TransitionConfigHandler<DiamondTransitionConfiguration> {
  public get key() { return "diamond"; }
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
      ...flag
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): DiamondTransitionConfiguration {
    const form = $(html).find("form").serializeArray();

    const duration = form.find(elem => elem.name === "duration");
    const size = form.find(elem => elem.name === "size");
    const background = form.find(elem => elem.name === "background");

    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(duration ? { duration: parseFloat(duration.value) } : {}),
      ...(size ? { size: parseFloat(size.value) } : {}),
      ...(background ? { background: background.value } : {}),
      id: id ? id.value : foundry.utils.randomID()
    }

  }

}
