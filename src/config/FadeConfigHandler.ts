import { TransitionConfigHandler } from '../interfaces';
import { localize } from '../utils';


export interface FadeConfiguration {
  duration: number;
  background: string;
  id: string;
}

export class FadeConfigHandler implements TransitionConfigHandler<FadeConfiguration> {

  public get key() { return "fade"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.FADE"; }

  public readonly defaultSettings: FadeConfiguration = {
    duration: 1000,
    background: "#00000000",
    id: ""
  }


  generateSummary(flag: FadeConfiguration): string {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    if (flag) return [localize("BATTLETRANSITIONS.FORMATTERS.MILLISECONDS", { value: (flag as any).duration }), (flag as any).background].join("; ");
    else return "";
  }

  renderTemplate(flag?: FadeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/fade-config.hbs`, flag ?? {});
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): FadeConfiguration {


    const form = $(html).find("form").serializeArray();

    const duration = form.find(elem => elem.name === "duration");
    const background = form.find(elem => elem.name === "background");
    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(duration ? { duration: parseFloat(duration.value) } : {}),
      ...(background ? { background: background.value } : {}),
      ...(id ? { id: id.value } : { id: foundry.utils.randomID() })
    }
  }

}