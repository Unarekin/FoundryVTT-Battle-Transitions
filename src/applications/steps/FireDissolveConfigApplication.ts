import { StepConfigApplication } from "./StepConfigApplication";
import { FireDissolveConfiguration, FireDissolveStep, generateEasingSelectOptions } from "../../steps";
import { FireDissolveContext } from "./types";
import { templateDir } from "../../utils";

export class FireDissolveConfigApplication extends StepConfigApplication<FireDissolveConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = FireDissolveStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/firedissolve.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`)
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
