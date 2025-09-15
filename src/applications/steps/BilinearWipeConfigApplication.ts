import { BilinearWipeContext } from "./types";
import { StepConfigApplication } from "./StepConfigApplication";
import { BilinearWipeConfiguration, BilinearWipeStep, generateBackgroundTypeSelectOptions, generateBilinearDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions } from "../../steps";
import { templateDir } from "../../utils";

export class BilinearWipeConfigApplication extends StepConfigApplication<BilinearWipeConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = BilinearWipeStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/bilinearwipe.hbs`),
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

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<BilinearWipeContext> {
    const context = (await super._prepareContext(options)) as BilinearWipeContext;

    context.easingSelect = generateEasingSelectOptions();
    context.directionSelect = generateBilinearDirectionSelectOptions();
    context.radialSelect = generateRadialDirectionSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();

    return context;
  }
}
