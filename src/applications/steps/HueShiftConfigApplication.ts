import { StepConfigApplication } from "./StepConfigApplication";
import { generateDualStyleSelectOptions, generateEasingSelectOptions, HueShiftConfiguration, HueShiftStep } from "../../steps";
import { HueShiftContext } from "./types";

export class HueShiftConfigApplication extends StepConfigApplication<HueShiftConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = HueShiftStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/hueshift.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/easing-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/dualstyle-selector.hbs`
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  parseFormData(data: Record<string, unknown>): HueShiftConfiguration {
    const parsed = super.parseFormData(data);

    const anyParsed = parsed as unknown as Record<string, unknown>;
    parsed.applyToOverlay = anyParsed.dualStyle === "both" || anyParsed.dualStyle === "overlay";
    parsed.applyToScene = anyParsed.dualStyle === "both" || anyParsed.dualStyle === "scene";

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete (parsed as any).dualStyle;

    return parsed;
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<HueShiftContext> {
    const context = (await super._prepareContext(options)) as HueShiftContext;

    context.easingSelect = generateEasingSelectOptions();
    context.dualStyleSelect = generateDualStyleSelectOptions();
    context.dualStyle = context.config.applyToOverlay && context.config.applyToScene ? "both" : context.config.applyToOverlay ? "overlay" : context.config.applyToScene ? "scene" : "overlay";

    return context;
  }


}
