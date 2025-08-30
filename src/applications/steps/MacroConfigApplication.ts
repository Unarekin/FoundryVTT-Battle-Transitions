import { MacroContext } from "./types";
import { StepConfigApplication } from "./StepConfigApplication";
import { MacroConfiguration, MacroStep } from "../../steps";

export class MacroConfigApplication extends StepConfigApplication<MacroConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = MacroStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/macro.hbs`,
      templates: [`modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`]
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
