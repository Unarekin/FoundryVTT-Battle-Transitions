import { StepConfigApplication } from "./StepConfigApplication";
import { SoundConfiguration, SoundStep } from "../../steps";
import { SoundContext } from "./types";
import { formDataExtendedClass } from "../../utils";

export class SoundConfigApplication extends StepConfigApplication<SoundConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = SoundStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/sound.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<SoundContext> {
    const context = (await super._prepareContext(options)) as SoundContext;

    return context;
  }

  _onChangeForm(): void {
    const data = foundry.utils.expandObject((new (formDataExtendedClass())(this.element as HTMLFormElement)).object) as Record<string, unknown>;
    const preview = this.element.querySelector(`[data-role="audio-preview"]`);
    if (preview instanceof HTMLAudioElement) {
      const url = new URL(data.file as string ?? "", window.location.href);

      if (preview.src !== url.href) preview.src = data.file as string ?? "";
      const volume = typeof data.volume === "number" ? data.volume / 100 : 1
      if (preview.volume !== volume) preview.volume = volume;
    }
  }

  _onRender(context: SoundContext, options: foundry.applications.api.ApplicationV2.RenderOptions) {
    super._onRender(context, options);

    // Handle audio preview events
    const preview = this.element.querySelector(`[data-role="audio-preview"]`);
    if (preview instanceof HTMLAudioElement) {
      preview.volume = typeof this.config?.volume === "number" ? this.config.volume / 100 : 1;
      preview.addEventListener("volumechange", () => {
        const volumeElem = this.element.querySelector(`[name="volume"]`);
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        if (volumeElem instanceof HTMLElement && (volumeElem as any).value !== preview.volume * 100) (volumeElem as any).value = preview.volume * 100;
      });

    }
  }
}
