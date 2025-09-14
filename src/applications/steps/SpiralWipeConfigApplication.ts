import { SpiralWipeContext } from "./types";
import { generateBackgroundTypeSelectOptions, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions, SpiralWipeConfiguration, SpiralWipeStep } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { templateDir } from "../../utils";

export class SpiralWipeConfigApplication extends StepConfigApplication<SpiralWipeConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = SpiralWipeStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/spiralwipe.hbs`),
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

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<SpiralWipeContext> {
    const context = (await super._prepareContext(options)) as SpiralWipeContext;

    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.radialSelect = generateRadialDirectionSelectOptions();
    context.directionSelect = {
      top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
      left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
      right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
      bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
    }
    context.clockDirectionSelect = generateClockDirectionSelectOptions();

    return context;
  }

}