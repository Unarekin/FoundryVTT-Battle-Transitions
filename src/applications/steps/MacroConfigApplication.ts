import { MacroContext } from "./types";
import { StepConfigApplication } from "./StepConfigApplication";
import { MacroConfiguration, MacroStep } from "../../steps";
import { templateDir } from "../../utils";

export class MacroConfigApplication extends StepConfigApplication<MacroConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = MacroStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/macro.hbs`),
      templates: [templateDir(`steps/partials/label.hbs`)]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<MacroContext> {
    const context = (await super._prepareContext(options)) as MacroContext;

    return context;
  }
}
