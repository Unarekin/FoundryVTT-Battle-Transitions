import { TransitionConfigHandler, VideoConfiguration } from "../interfaces";
import { BackgroundType } from "../types";
import { formatBackgroundSummary, localize, parseConfigurationFormElements } from "../utils";



export class VideoConfigHandler implements TransitionConfigHandler<VideoConfiguration> {
  public get key() { return "video"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.VIDEO"; }

  public readonly defaultSettings = {
    file: "",
    volume: 1,
    backgroundType: "color" as BackgroundType,
    backgroundImage: "",
    backgroundColor: "#00000000"
  };

  generateSummary(flag?: VideoConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    }
    return [
      settings.file.split("/").splice(-1),
      localize("BATTLETRANSITIONS.FORMATTERS.PERCENT", { value: settings.volume * 100 }),
      formatBackgroundSummary(settings)
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
    const backgroundImage = $(html).find("form #backgroundImage").val() as string ?? "";
    return {
      ...this.defaultSettings,
      ...(file ? { file } : {}),
      ...(volume ? { volume: volume / 100 } : {}),
      backgroundImage,
      ...parseConfigurationFormElements($(html).find("form"), "id", "backgroundType", "backgroundColor")
    }

  }
}
