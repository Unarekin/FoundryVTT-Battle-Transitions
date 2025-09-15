import { RepeatConfiguration, RepeatStep, RepeatStyle } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { templateDir, log } from "../../utils";
import { RepeatContext, StepConfigConfiguration } from "./types";
import { DeepPartial } from "../types";
import { SequenceEditorApplication } from "../SequenceEditorApplication";

export class RepeatConfigApplication extends StepConfigApplication<RepeatConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = RepeatStep as any;

  public static DEFAULT_OPTIONS: DeepPartial<StepConfigConfiguration> = {
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      editSequence: RepeatConfigApplication.EditSequence
    }
  }

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/repeat.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`transition-step.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  public static async EditSequence(this: RepeatConfigApplication) {
    try {
      if (!this.config) return;
      const sequence = await SequenceEditorApplication.edit({
        sequence: this.config?.sequence ?? [],
        oldScene: this.oldScene?.uuid ?? "",
        newScene: this.newScene?.uuid ?? ""
      });
      if (sequence && this.config.sequence)
        this.config.sequence.splice(0, this.config.sequence.length, ...foundry.utils.deepClone(sequence));
      log("Sequence:", this.config.sequence);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }


  parseFormData(data: Record<string, unknown>): RepeatConfiguration {
    const parsed = super.parseFormData(data);
    parsed.style = data.repeatStyle as "sequence" | "previous";
    delete data.repeatStyle;

    parsed.sequence = this.config?.sequence ?? [];
    return parsed;
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<RepeatContext> {
    const context = (await super._prepareContext(options)) as RepeatContext;

    context.styleSelect = {
      sequence: "BATTLETRANSITIONS.SCENECONFIG.REPEAT.SEQUENCE.LABEL",
      previous: "BATTLETRANSITIONS.SCENECONFIG.REPEAT.PREVIOUS.LABEL"
    }

    log("Context:", context);
    return context;
  }

  _onRender(context: RepeatContext, options: foundry.applications.api.ApplicationV2.RenderOptions) {
    super._onRender(context, options);

    this.setRepeatStyle(context.config.style);
    const styleSelect = this.element.querySelector(`select[name="repeatStyle"]`);
    if (styleSelect instanceof HTMLSelectElement) {
      styleSelect.addEventListener("change", () => { this.setRepeatStyle(styleSelect.value as RepeatStyle); });
    }
  }

  protected setRepeatStyle(style: RepeatStyle) {
    const elements = this.element.querySelectorAll(`[data-repeat-style]`);
    for (const elem of elements) {
      if (elem instanceof HTMLElement) {
        elem.style.display = elem.dataset.repeatStyle === style ? "block" : "none";
      }
    }
  }
}
