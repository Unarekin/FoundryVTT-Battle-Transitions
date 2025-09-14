import { SpiralWipeContext } from "./types";
import { generateBackgroundTypeSelectOptions, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions, SpiralWipeConfiguration, SpiralWipeStep } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";

export class SpiralWipeConfigApplication extends StepConfigApplication<SpiralWipeConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = SpiralWipeStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/spiralwipe.hbs`,
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