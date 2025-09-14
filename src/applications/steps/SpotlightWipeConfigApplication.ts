import { SpotlightWipeContext } from "./types";
import { SpotlightWipeConfiguration, SpotlightWipeStep, generateBackgroundTypeSelectOptions, generateEasingSelectOptions, generateLinearDirectionSelectOptions, generateRadialDirectionSelectOptions } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";

export class SpotlightWipeConfigApplication extends StepConfigApplication<SpotlightWipeConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = SpotlightWipeStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/spotlightwipe.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/background-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/easing-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/simple-select.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/falloff-config.hbs`
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<SpotlightWipeContext> {
    const context = (await super._prepareContext(options)) as SpotlightWipeContext;

    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.directionSelect = generateLinearDirectionSelectOptions();
    context.radialSelect = generateRadialDirectionSelectOptions();


    return context;
  }

}