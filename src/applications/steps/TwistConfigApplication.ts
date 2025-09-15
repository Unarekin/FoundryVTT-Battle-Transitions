import { StepConfigApplication } from "./StepConfigApplication";
import { generateClockDirectionSelectOptions, generateDualStyleSelectOptions, generateEasingSelectOptions, TwistConfiguration, TwistStep } from "../../steps";
import { TwistContext } from "./types";
import { templateDir } from "../../utils";

export class TwistConfigApplication extends StepConfigApplication<TwistConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = TwistStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/twist.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/background-selector.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`),
        templateDir(`steps/partials/simple-select.hbs`),
        templateDir(`steps/partials/dualstyle-selector.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  parseFormData(data: Record<string, unknown>): TwistConfiguration {
    const parsed = super.parseFormData(data);
    this.parseDualStyleForm(parsed as unknown as Record<string, unknown>);

    return parsed;
  }


  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<TwistContext> {
    const context = (await super._prepareContext(options)) as TwistContext;

    context.easingSelect = generateEasingSelectOptions();
    context.directionSelect = generateClockDirectionSelectOptions();
    context.dualStyleSelect = generateDualStyleSelectOptions();
    context.dualStyle = context.config.applyToOverlay && context.config.applyToScene ? "both" : context.config.applyToOverlay ? "overlay" : context.config.applyToScene ? "scene" : "overlay";

    return context;
  }
}
