/* eslint-disable @typescript-eslint/no-unused-vars */
import { TransitionConfigHandler } from "../interfaces";
import { WipeDirection } from "../types";

export interface LinearWipeConfiguration {
  direction: WipeDirection;
  duration: number;
  background: string;
  id: string;
}

export class LinearWipeConfigHandler implements TransitionConfigHandler<LinearWipeConfiguration> {

  public readonly defaultSettings: LinearWipeConfiguration = {
    duration: 1000,
    background: "#00000000",
    direction: "left",
    id: ""
  };

  generateSummary(flag?: LinearWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };

    return [settings.direction, settings.duration, settings.background].join("; ");
  }

  renderTemplate(flag?: LinearWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/linearwipe-config.hbs`, {
      ...this.defaultSettings,
      ...flag
    });
  }
  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): LinearWipeConfiguration {
    const form = $(html).find("form").serializeArray();

    const duration = form.find(elem => elem.name === "duration");
    const background = form.find(elem => elem.name === "background");
    const direction = form.find(elem => elem.name === "direction");

    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(duration ? { duration: parseFloat(duration.value) } : {}),
      ...(background ? { background: background.value } : {}),
      ...(direction ? { direction: direction.value as WipeDirection } : {}),
      id: id ? id.value : foundry.utils.randomID()
    }
  }
  public get key() { return "linear-wipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.LINEARWIPE"; }


}