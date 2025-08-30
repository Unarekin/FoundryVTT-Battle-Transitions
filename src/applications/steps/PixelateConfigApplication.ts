import { PixelateContext } from "./types";
import { StepConfigApplication } from "./StepConfigApplication";
import { generateDualStyleSelectOptions, generateEasingSelectOptions, PixelateConfiguration, PixelateStep } from "../../steps";

export class PixelateConfigApplication extends StepConfigApplication<PixelateConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = PixelateStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/pixelate.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/dualstyle-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/easing-selector.hbs`
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  parseFormData(data: Record<string, unknown>): PixelateConfiguration {
    const parsed = super.parseFormData(data);

    const anyParsed = parsed as unknown as Record<string, unknown>;
    parsed.applyToOverlay = anyParsed.dualStyle === "both" || anyParsed.dualStyle === "overlay";
    parsed.applyToScene = anyParsed.dualStyle === "both" || anyParsed.dualStyle === "scene";

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete (parsed as any).dualStyle;


    console.log("Parsed:", parsed);
    return parsed;
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<PixelateContext> {
    const context = (await super._prepareContext(options)) as PixelateContext;

    context.dualStyleSelect = generateDualStyleSelectOptions();
    context.easingSelect = generateEasingSelectOptions();
    context.dualStyle = context.config.applyToOverlay && context.config.applyToScene ? "both" : context.config.applyToOverlay ? "overlay" : context.config.applyToScene ? "scene" : "overlay";

    return context;
  }
}
