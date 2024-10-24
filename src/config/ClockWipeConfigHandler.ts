import { TransitionConfigHandler, ClockWipeConfiguration } from "../interfaces";
import { localize } from "../utils";
import { ClockDirection, WipeDirection } from "../types";


export class ClockWipeConfigHandler implements TransitionConfigHandler<ClockWipeConfiguration> {
  public get key() { return "clockwipe" }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.CLOCKWIPE"; }

  public readonly defaultSettings: ClockWipeConfiguration = {
    direction: "top",
    clockdirection: "clockwise",
    duration: 1000,
    background: "#00000000"
  }

  public generateSummary(flag?: ClockWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };

    return [settings.clockdirection, settings.direction, localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }), settings.background].join("; ")
  }

  async renderTemplate(flag?: ClockWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/clockwipe-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      directionSelect: {
        top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
        left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
        right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
        bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
      },
      clockDirectionSelect: {
        clockwise: "BATTLETRANSITIONS.DIRECTIONS.CLOCKWISE",
        counterclockwise: "BATTLETRANSITIONS.DIRECTIONS.COUNTERCLOCKWISE"
      }
    });
  }

  public createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): ClockWipeConfiguration {
    const form = $(html).find("form").serializeArray();

    const duration = form.find(elem => elem.name === "duration");
    const direction = form.find(elem => elem.name === "direction");
    const background = form.find(elem => elem.name === "background");
    const clockDirection = form.find(elem => elem.name === "clockdirection");

    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(duration ? { duration: parseFloat(duration.value) } : {}),
      ...(direction ? { direction: direction.value as WipeDirection } : {}),
      ...(background ? { background: background.value } : {}),
      ...(clockDirection ? { clockdirection: clockDirection.value as ClockDirection } : {}),
      id: id ? id.value : foundry.utils.randomID()
    }
  }


}
