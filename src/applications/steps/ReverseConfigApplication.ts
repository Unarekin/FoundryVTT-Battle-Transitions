import { ReverseConfiguration, ReverseStep } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { ReverseContext } from "./types";
import { templateDir } from "../../utils";

export class ReverseConfigApplication extends StepConfigApplication<ReverseConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = ReverseStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/reverse.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<ReverseContext> {
    const context = (await super._prepareContext(options)) as ReverseContext;


    return context;
  }
}
