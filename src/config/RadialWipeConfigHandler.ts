import { TransitionConfigHandler } from '../interfaces';
import { localize } from '../utils';
import { RadialDirection } from '../types';

export interface RadialWipeConfiguration {
  duration: number;
  background: string;
  radial: RadialDirection;

  id?: string;
}

export class RadialWipeConfigHandler implements TransitionConfigHandler<RadialWipeConfiguration> {
  public get key() { return "radialwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.RADIALWIPE"; }

  public readonly defaultSettings = {
    duration: 1000,
    background: "#00000000",
    radial: "inside" as RadialDirection
  }

  generateSummary(flag?: RadialWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };

    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
      settings.radial,
      settings.background
    ].join("; ")
  }

  renderTemplate(flag?: RadialWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/radial-wipe-config.hbs`, {
      ...flag,
      radialOptions: {
        "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
        "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
      }
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): RadialWipeConfiguration {
    const form = $(html).find("form").serializeArray();

    const duration = form.find(elem => elem.name === "duration");
    const radial = form.find(elem => elem.name === "radial");
    const background = form.find(elem => elem.name === "background");
    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(background ? { background: background.value } : {}),
      ...(duration ? { duration: parseFloat(duration.value) } : {}),
      ...(radial ? { radial: radial.value as RadialDirection } : {}),
      id: id ? id.value : foundry.utils.randomID()
    }
  }
}

