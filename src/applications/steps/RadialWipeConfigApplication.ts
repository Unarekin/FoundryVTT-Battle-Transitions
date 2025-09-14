import { RadialWipeContext } from "./types";
import { StepConfigApplication } from "./StepConfigApplication";
import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions, generateNoteSelectOptions, generateRadialDirectionSelectOptions, generateTargetTypeSelectOptions, RadialWipeConfiguration, RadialWipeStep } from "../../steps";
import { templateDir } from "../../utils";

export class RadialWipeConfigApplication extends StepConfigApplication<RadialWipeConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = RadialWipeStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/radialwipe.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/background-selector.hbs`),
        templateDir(`steps/partials/target-selector.hbs`),
        templateDir(`steps/partials/falloff-config.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<RadialWipeContext> {
    const context = (await super._prepareContext(options)) as RadialWipeContext;

    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.radialSelect = generateRadialDirectionSelectOptions();
    context.easingSelect = generateEasingSelectOptions();
    context.targetTypeSelect = generateTargetTypeSelectOptions();

    // context.noteSelect = generateNoteSelectOptions();
    context.noteSelect = {
      ...(this.oldScene instanceof Scene ? generateNoteSelectOptions(this.oldScene) : {}),
      ...(this.newScene instanceof Scene ? generateNoteSelectOptions(this.newScene) : {})
    }

    context.targetType = "point";
    if (Array.isArray(this.config?.target)) {
      context.pointX = this.config.target[0];
      context.pointY = this.config.target[1];
    } else {
      context.pointX = context.pointY = 0.5;

      if (this.config?.target) {
        const doc = await fromUuid(this.config.target);
        if (doc instanceof Token || doc instanceof TokenDocument) {
          context.selectedToken = doc.uuid;
          context.targetType = "token";
        } else {
          context.selectedToken = "";
        }

        if (doc instanceof Drawing || doc instanceof DrawingDocument) {
          context.selectedDrawing = doc.uuid;
          context.targetType = "drawing";
        } else {
          context.selectedDrawing = "";
        }

        if (doc instanceof Tile || doc instanceof TileDocument) {
          context.selectedTile = doc.uuid;
          context.targetType = "tile";
        } else {
          context.selectedTile = "";
        }

        if (doc instanceof Note || doc instanceof NoteDocument) {
          context.selectedNote = doc.uuid;
          context.targetType = "note";
        } else {
          context.selectedNote = "";
        }
      }
    }

    return context;
  }

  parseFormData(data: Record<string, unknown>): RadialWipeConfiguration {
    const parsed = super.parseFormData(data);

    // Handle target type
    switch (data.targetType) {
      case "token":
        parsed.target = data.selectedToken as string ?? "";
        break;
      case "tile":
        parsed.target = data.selectedTile as string ?? "";
        break;
      case "note":
        parsed.target = data.selectedNote as string ?? "";
        break;
      case "drawing":
        parsed.target = data.selectedDrawing as string ?? "";
        break;
      case "point":
        parsed.target = [data.pointX as number, data.pointY as number];
        break;
    }

    return parsed;
  }

  _onRender(context: RadialWipeContext, options: foundry.applications.api.ApplicationV2.RenderOptions) {
    super._onRender(context, options);

    const targetTypeSelect = this.element.querySelector(`select[name="targetType"]`);
    if (targetTypeSelect instanceof HTMLSelectElement) {
      targetTypeSelect.addEventListener("change", () => { this.setTargetType(targetTypeSelect.value); });
    }

    this.setTargetType(context.targetType)
  }

  protected setTargetType(targetType: string) {
    const sections = this.element.querySelectorAll(`[data-target-type]`);
    for (const section of sections) {
      if (section instanceof HTMLElement && section.dataset.targetType === targetType) section.style.display = "block";
      else if (section instanceof HTMLElement) section.style.display = "none";
    }
  }
}
