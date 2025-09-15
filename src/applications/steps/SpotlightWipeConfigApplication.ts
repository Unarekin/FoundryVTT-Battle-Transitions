import { SpotlightWipeContext } from "./types";
import { SpotlightWipeConfiguration, SpotlightWipeStep, generateBackgroundTypeSelectOptions, generateEasingSelectOptions, generateLinearDirectionSelectOptions, generateRadialDirectionSelectOptions } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { templateDir } from "../../utils";

export class SpotlightWipeConfigApplication extends StepConfigApplication<SpotlightWipeConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = SpotlightWipeStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/spotlightwipe.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/background-selector.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`),
        templateDir(`steps/partials/simple-select.hbs`),
        templateDir(`steps/partials/falloff-config.hbs`)
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