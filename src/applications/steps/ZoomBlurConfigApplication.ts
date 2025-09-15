import { ZoomBlurContext } from "./types";
import { ZoomBlurConfiguration, ZoomBlurStep, generateBackgroundTypeSelectOptions, generateDualStyleSelectOptions, generateEasingSelectOptions } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { templateDir } from "../../utils";

export class ZoomBlurConfigApplication extends StepConfigApplication<ZoomBlurConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = ZoomBlurStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/zoomblur.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/dualstyle-selector.hbs`),
        templateDir(`steps/partials/easing-selector.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  parseFormData(data: Record<string, unknown>): ZoomBlurConfiguration {
    const parsed = super.parseFormData(data);

    const anyParsed = parsed as unknown as Record<string, unknown>;
    parsed.applyToOverlay = anyParsed.dualStyle === "both" || anyParsed.dualStyle === "overlay";
    parsed.applyToScene = anyParsed.dualStyle === "both" || anyParsed.dualStyle === "scene";

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete (parsed as any).dualStyle;

    return parsed;
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<ZoomBlurContext> {
    const context = (await super._prepareContext(options)) as ZoomBlurContext;

    context.bgTypeSelect = generateBackgroundTypeSelectOptions();
    context.easingSelect = generateEasingSelectOptions();
    context.dualStyleSelect = generateDualStyleSelectOptions();
    context.dualStyle = context.config.applyToOverlay && context.config.applyToScene ? "both" : context.config.applyToOverlay ? "overlay" : context.config.applyToScene ? "scene" : "overlay";

    return context;
  }

}