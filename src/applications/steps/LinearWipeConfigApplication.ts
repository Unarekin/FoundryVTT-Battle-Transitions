import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions, generateLinearDirectionSelectOptions, LinearWipeConfiguration, LinearWipeStep } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { LinearWipeContext } from "./types";
import { templateDir } from "../../utils";

export class LinearWipeConfigApplication extends StepConfigApplication<LinearWipeConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = LinearWipeStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/linearwipe.hbs`),
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
//       template: templateDir(`steps/angularwipe.hbs`),
//       templates: [
//         templateDir(`steps/partials/label.hbs`),
//         templateDir(`steps/partials/background-selector.hbs`),
//         templateDir(`steps/partials/duration-selector.hbs`),
//         templateDir(`steps/partials/easing-selector.hbs`)
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
