import { TransitionConfigHandler, VideoConfiguration } from "../interfaces";
import { localize, parseConfigurationFormElements } from "../utils";



export class VideoConfigHandler implements TransitionConfigHandler<VideoConfiguration> {
  public get key() { return "video"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.VIDEO"; }

  public readonly defaultSettings = {
    file: "",
    background: "#00000000",
    volume: 1
  };

  generateSummary(flag?: VideoConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    }
    return [
      settings.file.split("/").splice(-1),
      localize("BATTLETRANSITIONS.FORMATTERS.PERCENT", { value: settings.volume * 100 }),
      settings.background
    ].join("; ")
  }

  renderTemplate(flag?: VideoConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/video-config.hbs`, {
      ...this.defaultSettings,
      ...flag,
      volume: (flag?.volume !== undefined ? flag.volume : this.defaultSettings.volume) * 100
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): VideoConfiguration {
    const file = $(html).find("form #file").val() as string ?? "";
    const volume = $(html).find("form #volume input[type='number']").val() as number;

    return {
      ...this.defaultSettings,
      ...(file ? { file } : {}),
      ...(volume ? { volume: volume / 100 } : {}),
      ...parseConfigurationFormElements($(html).find("form"), "id", "background")
    }

  }
}
