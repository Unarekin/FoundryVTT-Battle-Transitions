import { StepConfigApplication } from "./StepConfigApplication";
import { generateBackgroundTypeSelectOptions, VideoConfiguration, VideoStep } from "../../steps";
import { formDataExtendedClass, templateDir } from "../../utils";
import { VideoContext } from "./types";
import { DeepPartial } from "../types";

export class VideoConfigApplication extends StepConfigApplication<VideoConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = VideoStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/video.hbs`),
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`
    },
    basics: {
      template: templateDir(`steps/video-basics.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/background-selector.hbs`)
      ]
    },
    chromaKey: {
      template: templateDir(`steps/video-chroma.hbs`)
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  _onChangeForm(formConfig: foundry.applications.api.ApplicationV2.FormConfiguration, e: Event): void {
    super._onChangeForm(formConfig, e);

    const data = foundry.utils.expandObject((new (formDataExtendedClass())(this.element as HTMLFormElement)).object) as Record<string, unknown>;
    const preview = this.element.querySelector(`[data-role="video-preview"]`);
    if (preview instanceof HTMLVideoElement) {
      const url = new URL(data.file as string ?? "", window.location.href);
      if (preview.src !== url.href) preview.src = url.href;

      const volume = typeof data.volume === "number" ? data.volume / 100 : 1;
      if (preview.volume !== volume) preview.volume = volume;
    }
  }

  _onRender(context: VideoContext, options: foundry.applications.api.ApplicationV2.RenderOptions) {
    super._onRender(context, options);

    const preview = this.element.querySelector(`[data-role="video-preview"]`);
    if (preview instanceof HTMLVideoElement) {
      preview.volume = typeof this.config?.volume === "number" ? this.config.volume / 100 : 1;
      preview.addEventListener("volumechange", () => {
        const volumeElem = this.element.querySelector(`[name="volume"]`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (volumeElem instanceof HTMLElement && (volumeElem as any).value !== preview.volume * 100) (volumeElem as any).value = preview.volume * 100;
      })
    }
  }

  protected async _preparePartContext(partId: string, context: any, options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const actual = await super._preparePartContext(partId, context, options) as VideoContext;
    actual.tab = actual.tabs?.[partId] ?? {};
    return actual;
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<VideoContext> {
    const context = (await super._prepareContext(options)) as VideoContext;

    context.bgTypeSelect = generateBackgroundTypeSelectOptions();

    context.keyRangeX = context.config.chromaRange[0];
    context.keyRangeY = context.config.chromaRange[1];

    context.tabs = {
      basics: {
        id: "basics",
        group: "primary",
        label: "BATTLETRANSITIONS.SCENECONFIG.VIDEO.TABS.BASICS",
        active: true,
        cssClass: "active",
        icon: "fa-solid fa-cogs"
      },
      chromaKey: {
        id: "chromaKey",
        group: "primary",
        label: "BATTLETRANSITIONS.SCENECONFIG.VIDEO.TABS.CHROMAKEY",
        active: false,
        cssClass: "",
        icon: "fa-solid fa-droplet"
      }
    }

    return context;
  }
}
