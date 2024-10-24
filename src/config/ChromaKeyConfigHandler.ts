import { TransitionConfigHandler, ChromaKeyConfiguration } from "../interfaces";



export class ChromaKeyConfigHandler implements TransitionConfigHandler<ChromaKeyConfiguration> {

  public get key() { return "chromakey"; }
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.CHROMAKEY"; }

  public readonly defaultSettings: ChromaKeyConfiguration = {
    keyColor: "#00b140",
    background: "#00000000",
  };

  public generateSummary(flag?: ChromaKeyConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    };
    return [settings.keyColor, settings.background].join("; ");
  }

  public async renderTemplate(flag?: ChromaKeyConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/chromakey-config.hbs`, {
      ...this.defaultSettings,
      ...flag
    })
  }

  public createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): ChromaKeyConfiguration {
    const form = $(html).find("form").serializeArray();
    const keyColor = form.find(elem => elem.name === "key-color");
    const background = form.find(elem => elem.name === "background");

    return {
      ...this.defaultSettings,
      ...(keyColor ? { keyColor: keyColor.value } : {}),
      ...(background ? { background: background.value } : {})
    };
  }
}
