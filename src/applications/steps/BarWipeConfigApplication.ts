import { BarWipeConfiguration, BarWipeStep, generateBackgroundTypeSelectOptions, generateEasingSelectOptions } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { BarWipeContext } from "./types";

export class BarWipeConfigApplication extends StepConfigApplication<BarWipeConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = BarWipeStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/barwipe.hbs`,
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


  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<BarWipeContext> {
    const context = (await super._prepareContext(options)) as BarWipeContext;

    context.directionSelect = {
      horizontal: "BATTLETRANSITIONS.DIRECTIONS.HORIZONTAL",
      vertical: "BATTLETRANSITIONS.DIRECTIONS.VERTICAL"
    };
    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();

    return context;
  }

}