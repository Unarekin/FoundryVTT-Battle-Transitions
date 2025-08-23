import { StepConfigApplication } from "./StepConfigApplication";
import { ClockWipeConfiguration, ClockWipeStep, generateBackgroundTypeSelectOptions, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateLinearDirectionSelectOptions } from "../../steps";
import { ClockWipeContext } from "./types";

export class ClockWipeConfigApplication extends StepConfigApplication<ClockWipeConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = ClockWipeStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/clockwipe.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/background-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/easing-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/falloff-config.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/simple-select.hbs`
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<ClockWipeContext> {
    const context = (await super._prepareContext(options)) as ClockWipeContext;


    context.easingSelect = generateEasingSelectOptions();
    context.clockDirectionSelect = generateClockDirectionSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.directionSelect = generateLinearDirectionSelectOptions();

    return context;
  }
}
