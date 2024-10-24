import { BilinearWipeConfiguration, TransitionConfigHandler } from "../interfaces";
import { localize } from "../utils";
import { BilinearDirection, RadialDirection } from '../types';


export class BilinearWipeConfigHandler implements TransitionConfigHandler<BilinearWipeConfiguration> {
  public get key() { return "bilinearwipe"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.BILINEARWIPE"; }
  public readonly defaultSettings: BilinearWipeConfiguration = {
    duration: 1000,
    direction: "horizontal",
    radial: "inside",
    background: "#00000000",
  }

  public generateSummary(flag?: BilinearWipeConfiguration): string {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (flag) return [localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: (flag as any).duration }), flag.direction, flag.radial, (flag as any).background].join("; ");
    else return "";
  }

  public renderTemplate(flag?: BilinearWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/bilinear-wipe-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      directionSelect: {
        "horizontal": "BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",
        "vertical": "BATTLETRANSITIONS.DIRECTIONS.VERTICAL",
        "topleft": "BATTLETRANSITIONS.DIRECTIONS.TOPLEFT",
        "topright": "BATTLETRANSITIONS.DIRECTIONS.TOPRIGHT"
      },
      radialSelect: {
        "inside": "BATTLETRANSITIONS.DIRECTIONS.INSIDE",
        "outside": "BATTLETRANSITIONS.DIRECTIONS.OUTSIDE"
      }
    });
  }

  public createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): BilinearWipeConfiguration {
    const form = $(html).find("form").serializeArray();

    const duration = form.find(elem => elem.name === "duration");
    const background = form.find(elem => elem.name === "background");
    const direction = form.find(elem => elem.name === "direction");
    const radial = form.find(elem => elem.name === "radial");
    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(duration ? { duration: parseFloat(duration.value) } : {}),
      ...(background ? { background: background.value } : {}),
      ...(direction ? { direction: direction.value as BilinearDirection } : {}),
      ...(radial ? { radial: radial.value as RadialDirection } : {}),
      ...(id ? { id: id.value } : { id: foundry.utils.randomID() })
    };
  }
}
