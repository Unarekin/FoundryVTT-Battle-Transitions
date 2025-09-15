import { StepConfigApplication } from "./StepConfigApplication";
import { FlashConfiguration, FlashStep, generateBackgroundTypeSelectOptions, generateDualStyleSelectOptions, generateEasingSelectOptions } from "../../steps";
import { FlashContext } from "./types";
import { templateDir } from "../../utils";

export class FlashConfigApplication extends StepConfigApplication<FlashConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = FlashStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/flash.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/background-selector.hbs`),
        templateDir(`steps/partials/dualstyle-selector.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  parseFormData(data: Record<string, unknown>): FlashConfiguration {
    const parsed = super.parseFormData(data);

    const anyParsed = parsed as unknown as Record<string, unknown>;
    parsed.applyToOverlay = anyParsed.dualStyle === "both" || anyParsed.dualStyle === "overlay";
    parsed.applyToScene = anyParsed.dualStyle === "both" || anyParsed.dualStyle === "scene";

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete (parsed as any).dualStyle;

    return parsed;
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<FlashContext> {
    const context = (await super._prepareContext(options)) as FlashContext;

    context.easingSelect = generateEasingSelectOptions();
    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.dualStyleSelect = generateDualStyleSelectOptions();

    context.dualStyle = context.config.applyToOverlay && context.config.applyToScene ? "both" : context.config.applyToOverlay ? "overlay" : context.config.applyToScene ? "scene" : "overlay";

    return context;
  }
}
