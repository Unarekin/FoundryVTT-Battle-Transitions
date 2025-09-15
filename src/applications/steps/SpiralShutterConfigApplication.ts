import { SpiralShutterContext } from "./types";
import { generateBackgroundTypeSelectOptions, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions, SpiralShutterConfiguration, SpiralShutterStep } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { templateDir } from "../../utils";

export class SpiralShutterConfigApplication extends StepConfigApplication<SpiralShutterConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = SpiralShutterStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/spiralshutter.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/background-selector.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`),
        templateDir(`steps/partials/falloff-config.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<SpiralShutterContext> {
    const context = (await super._prepareContext(options)) as SpiralShutterContext;


    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.radialSelect = generateRadialDirectionSelectOptions();
    context.directionSelect = generateClockDirectionSelectOptions();

    return context;
  }

}