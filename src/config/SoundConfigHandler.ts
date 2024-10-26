import { TransitionConfigHandler, SoundConfiguration } from "../interfaces";
import { localize } from "../utils";


export class SoundConfigHandler implements TransitionConfigHandler<SoundConfiguration> {
  public get key() { return "sound"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.SOUND"; }

  public readonly defaultSettings = {
    file: "",
    volume: 100
  };

  generateSummary(flag?: SoundConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    }
    return [
      settings.file.split("/").slice(-1),
      localize("BATTLETRANSITIONS.FORMATTERS.PERCENT", { value: settings.volume * 100 })
    ].join("; ")
  }

  renderTemplate(flag?: SoundConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/sound-config.hbs`, {
      ...this.defaultSettings,
      ...flag
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): SoundConfiguration {
    const form = $(html).find("form").serializeArray();
    const file = $(html).find("form #file").val() as string ?? "";
    const volume = form.find(elem => elem.name === "volume");
    const id = form.find(elem => elem.name === "id");

    return {
      ...this.defaultSettings,
      ...(file ? { file } : {}),
      ...(volume ? { volume: parseFloat(volume.value) } : {}),
      id: id ? id.value : foundry.utils.randomID()
    }
  }
}
