import { TransitionConfigHandler, SpotlightWipeConfiguration } from '../interfaces';
import { localize } from '../utils';
import { RadialDirection, WipeDirection } from '../types';



export class SpotlightWipeConfigHandler implements TransitionConfigHandler<SpotlightWipeConfiguration> {
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.SPOTLIGHTWIPE"; }
  public get key() { return "spotlightwipe"; }

  public readonly defaultSettings: SpotlightWipeConfiguration = {
    duration: 1000,
    background: "#00000000",
    direction: "top",
    radial: "outside"
  }

  generateSummary(flag?: SpotlightWipeConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };
    return [
      localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: settings.duration }),
      settings.direction,
      settings.radial,
      settings.background
    ].join("; ")
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): SpotlightWipeConfiguration {
    const form = $(html).find("form").serializeArray();

    const duration = form.find(elem => elem.name === "duration");
    const direction = form.find(elem => elem.name === "direction");
    const radial = form.find(elem => elem.name === "radial");
    const background = form.find(elem => elem.name === "background");
    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(duration ? { duration: parseFloat(duration.value) } : {}),
      ...(background ? { background: background.value } : {}),
      ...(direction ? { direction: direction.value as WipeDirection } : {}),
      ...(radial ? { radial: radial.value as RadialDirection } : {}),
      ...(id ? { id: id.value } : { id: foundry.utils.randomID() })
    }
  }

  renderTemplate(flag?: SpotlightWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/spotlight-wipe-config.hbs`, {
      ...flag,
      directionSelect: {
        top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
        left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
        right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
        bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
      },
      radialSelect: {
        inside: "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
        outside: "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
      }
    })
  }

}
