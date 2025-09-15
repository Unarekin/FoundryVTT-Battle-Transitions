import { StepConfigApplication } from "./StepConfigApplication";
import { generateBackgroundTypeSelectOptions, generateEasingSelectOptions, MeltConfiguration, MeltStep } from "../../steps";
import { MeltContext } from "./types";
import { templateDir } from "../../utils";

export class MeltConfigApplication extends StepConfigApplication<MeltConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = MeltStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/melt.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/background-selector.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<MeltContext> {
    const context = (await super._prepareContext(options)) as MeltContext;

    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();

    return context;
  }
}
