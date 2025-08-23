import { BilinearWipeContext } from "./types";
import { StepConfigApplication } from "./StepConfigApplication";
import { BilinearWipeConfiguration, BilinearWipeStep, generateBackgroundTypeSelectOptions, generateBilinearDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions } from "../../steps";

export class BilinearWipeConfigApplication extends StepConfigApplication<BilinearWipeConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = BilinearWipeStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/bilinearwipe.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/background-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/easing-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/falloff-config.hbs`
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<BilinearWipeContext> {
    const context = (await super._prepareContext(options)) as BilinearWipeContext;

    context.easingSelect = generateEasingSelectOptions();
    context.directionSelect = generateBilinearDirectionSelectOptions();
    context.radialSelect = generateRadialDirectionSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();

    return context;
  }
}
