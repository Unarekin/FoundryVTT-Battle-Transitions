import { TransitionConfigHandler } from "../interfaces";


export interface TextureSwapConfiguration {
  texture: string;
  id?: string;
}

export class TextureSwapConfigHandler implements TransitionConfigHandler<TextureSwapConfiguration> {
  public get name() { return "BATTLETRANSITIONS.TRANSITIONTYPES.TEXTURESWAP"; }
  public get key() { return "textureswap"; }

  public readonly defaultSettings: TextureSwapConfiguration = {
    texture: ""
  }

  generateSummary(flag?: TextureSwapConfiguration): string {
    const settings = {
      ...this.defaultSettings,
      ...flag
    }
    return [settings.texture.split("/").slice(-1)].join("; ");
  }

  renderTemplate(flag?: TextureSwapConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/texture-swap-config.hbs`, {
      ...this.defaultSettings,
      ...flag
    });
  }

  createFlagFromHTML(html: HTMLElement | JQuery<HTMLElement>): TextureSwapConfiguration {
    const form = $(html).find("form").serializeArray();

    const id = form.find(elem => elem.name === "id");
    const texture = $(html).find("form #texture").val() as string ?? "";


    return {
      ...this.defaultSettings,
      texture,
      id: id ? id.value : foundry.utils.randomID()
    }
  }
}
