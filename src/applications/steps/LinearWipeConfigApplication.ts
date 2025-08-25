import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions, generateLinearDirectionSelectOptions, LinearWipeConfiguration, LinearWipeStep } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { LinearWipeContext } from "./types";

export class LinearWipeConfigApplication extends StepConfigApplication<LinearWipeConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = LinearWipeStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/angularwipe.hbs`,
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

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<LinearWipeContext> {
    const context = (await super._prepareContext(options)) as LinearWipeContext;

    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.directionSelect = generateLinearDirectionSelectOptions();

    return context;
  }

}

// export class FadeConfigApplication extends StepConfigApplication<FadeConfiguration> {
//   // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
//   public readonly StepClass = FadeStep as any;

//   public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
//     main: {
//       template: `modules/${__MODULE_ID__}/templates/steps/angularwipe.hbs`,
//       templates: [
//         `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
//         `modules/${__MODULE_ID__}/templates/steps/partials/background-selector.hbs`,
//         `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
//         `modules/${__MODULE_ID__}/templates/steps/partials/easing-selector.hbs`
//       ]
//     },
//     footer: {
//       template: "templates/generic/form-footer.hbs"
//     }
//   }

//   protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<FadeContext> {
//     const context = (await super._prepareContext(options)) as FadeContext;

//     context.easingSelect = generateEasingSelectOptions();
//     context.bgTypeSelect = generateBackgroundTypeSelectOptions();

//     return context;
//   }
// }
