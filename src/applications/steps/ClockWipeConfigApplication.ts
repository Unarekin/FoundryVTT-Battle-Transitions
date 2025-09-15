import { StepConfigApplication } from "./StepConfigApplication";
import { ClockWipeConfiguration, ClockWipeStep, generateBackgroundTypeSelectOptions, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateLinearDirectionSelectOptions } from "../../steps";
import { ClockWipeContext } from "./types";
import { templateDir } from "../../utils";

export class ClockWipeConfigApplication extends StepConfigApplication<ClockWipeConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = ClockWipeStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/clockwipe.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/background-selector.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`),
        templateDir(`steps/partials/falloff-config.hbs`),
        templateDir(`steps/partials/simple-select.hbs`)
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
