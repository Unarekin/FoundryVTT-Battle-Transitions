import { StepConfigApplication } from "./StepConfigApplication";
import { FlashConfiguration, FlashStep, generateBackgroundTypeSelectOptions, generateDualStyleSelectOptions, generateEasingSelectOptions } from "../../steps";
import { FlashContext } from "./types";

export class FlashConfigApplication extends StepConfigApplication<FlashConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = FlashStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/flash.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/background-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/simple-select.hbs`
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<FlashContext> {
    const context = (await super._prepareContext(options)) as FlashContext;

    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.dualStyleSelect = generateDualStyleSelectOptions();

    context.dualStyle = context.config.applyToOverlay && context.config.applyToScene ? "both" : context.config.applyToOverlay ? "overlay" : context.config.applyToScene ? "scene" : "overlay";

    return context;
  }
}
