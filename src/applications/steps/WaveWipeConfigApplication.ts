import { WaveWipeContext } from "./types";
import { WaveWipeConfiguration, WaveWipeStep, generateBackgroundTypeSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { templateDir } from "../../utils";

export class WaveWipeConfigApplication extends StepConfigApplication<WaveWipeConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = WaveWipeStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/wavewipe.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/simple-select.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/falloff-config.hbs`),
        templateDir(`steps/partials/background-selector.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<WaveWipeContext> {
    const context = (await super._prepareContext(options)) as WaveWipeContext;

    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.radialSelect = generateRadialDirectionSelectOptions();

    return context;
  }

}