import { AngularWipeContext } from "..";
import { AngularWipeConfiguration, AngularWipeStep, generateBackgroundTypeSelectOptions, generateEasingSelectOptions } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";

export class AngularWipeConfigApplication extends StepConfigApplication<AngularWipeConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = AngularWipeStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/angularwipe.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/background-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/easing-selector.hbs`
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