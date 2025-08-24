import { StepConfigApplication } from "./StepConfigApplication";
import { FireDissolveConfiguration, FireDissolveStep, generateEasingSelectOptions } from "../../steps";
import { FireDissolveContext } from "./types";

export class FireDissolveConfigApplication extends StepConfigApplication<FireDissolveConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = FireDissolveStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/firedissolve.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/easing-selector.hbs`
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<FireDissolveContext> {
    const context = (await super._prepareContext(options)) as FireDissolveContext;

    context.easingSelect = generateEasingSelectOptions();


    return context;
  }
}
