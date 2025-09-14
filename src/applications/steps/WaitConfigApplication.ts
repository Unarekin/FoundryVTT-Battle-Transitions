import { WaitConfiguration, WaitStep } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { templateDir } from "../../utils";

export class WaitConfigApplication extends StepConfigApplication<WaitConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = WaitStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/wait.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

}
