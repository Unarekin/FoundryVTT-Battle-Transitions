import { DiamondWipeContext } from "./types";
import { DiamondWipeConfiguration, DiamondWipeStep, generateBackgroundTypeSelectOptions, generateEasingSelectOptions } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";

export class DiamondWipeConfigApplication extends StepConfigApplication<DiamondWipeConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = DiamondWipeStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/diamondwipe.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/background-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/easing-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/simple-select.hbs`
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<DiamondWipeContext> {
    const context = (await super._prepareContext(options)) as DiamondWipeContext;

    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();

    return context;
  }
}
