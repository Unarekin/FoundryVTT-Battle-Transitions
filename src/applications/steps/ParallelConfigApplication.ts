import { StepConfigApplication } from "./StepConfigApplication";
import { ParallelConfiguration, ParallelStep } from "../../steps";
import { ParallelContext, StepConfigConfiguration } from "./types";
import { localize, templateDir } from "../../utils";
import { DeepPartial } from "../types";
import { SequenceEditorApplication } from "../SequenceEditorApplication";
import { confirm } from "../functions";

export class ParallelConfigApplication extends StepConfigApplication<ParallelConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = ParallelStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/parallel.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),

      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  public static DEFAULT_OPTIONS: DeepPartial<StepConfigConfiguration> = {
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      addSequence: ParallelConfigApplication.AddSequence,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      editSequence: ParallelConfigApplication.EditSequence,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      removeSequence: ParallelConfigApplication.RemoveSequence
    }
  }

  public static async EditSequence(this: ParallelConfigApplication, e: PointerEvent, elem: HTMLElement) {
    try {
      if (!this.config) return;
      const index = parseInt(elem.dataset.seq ?? "");
      if (isNaN(index)) return;
      const sequence = this.config.sequences[index];
      if (!sequence) return;
      const newSequence = await SequenceEditorApplication.edit({
        sequence: foundry.utils.deepClone(sequence),
        newScene: this.newScene?.uuid ?? "",
        oldScene: this.oldScene?.uuid ?? ""
      });
      if (newSequence) this.config.sequences[index] = foundry.utils.deepClone(newSequence);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  public static async RemoveSequence(this: ParallelConfigApplication, e: PointerEvent, elem: HTMLElement) {
    try {
      if (!this.config) return;
      const index = parseInt(elem.dataset.seq ?? "");
      if (isNaN(index)) return;
      const confirmed = await confirm(
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name: localize("BATTLETRANSITIONS.DIALOGS.SEQUENCE.NAME", { index }) }),
        localize("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name: localize("BATTLETRANSITIONS.DIALOGS.SEQUENCE.NAME", { index }) }),
      );
      if (!confirmed) return;
      this.config.sequences.splice(index, 1);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  public static async AddSequence(this: ParallelConfigApplication) {
    try {
      if (!this.config) return;
      const sequence = await SequenceEditorApplication.edit({
        sequence: [],
        newScene: this.newScene?.uuid ?? "",
        oldScene: this.oldScene?.uuid ?? ""
      });

      if (sequence) this.config.sequences.push(foundry.utils.deepClone(sequence));
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  parseFormData(data: Record<string, unknown>): ParallelConfiguration {
    const parsed = super.parseFormData(data);

    parsed.sequences = foundry.utils.deepClone(this.config?.sequences ?? []);
    return parsed
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<ParallelContext> {
    const context = (await super._prepareContext(options)) as ParallelContext;


    return context;
  }
}
