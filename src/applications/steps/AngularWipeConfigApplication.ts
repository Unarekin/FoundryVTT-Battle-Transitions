import { AngularWipeContext } from "./types";
import { AngularWipeConfiguration, AngularWipeStep, generateBackgroundTypeSelectOptions, generateEasingSelectOptions } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { templateDir } from "../../utils";

export class AngularWipeConfigApplication extends StepConfigApplication<AngularWipeConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = AngularWipeStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/angularwipe.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/background-selector.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`),
        templateDir(`steps/partials/simple-select.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<AngularWipeContext> {
    const context = (await super._prepareContext(options)) as AngularWipeContext;

    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();

    return context;
  }

}