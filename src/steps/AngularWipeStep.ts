import { AngularWipeConfiguration } from './types';
import { TransitionStep } from './TransitionStep';
import { createColorTexture, generateEasingSelectOptions, parseConfigurationFormElements } from '../utils';
import { AngularWipeFilter } from '../filters';


export class AngularWipeStep extends TransitionStep<AngularWipeConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: AngularWipeConfiguration = {
    type: "angularwipe",
    duration: 1000,
    easing: "none",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "angularwipe";
  public static name = "ANGULARWIPE";
  public static template = "angularwipe-config";
  public static icon = "<i class='bt-icon angular-wipe fa-fw'></i>"

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: AngularWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${AngularWipeStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...AngularWipeStep.DefaultSettings,
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions()
    });
  }

  public static from(config: AngularWipeConfiguration): AngularWipeStep
  public static from(form: HTMLFormElement): AngularWipeStep
  public static from(form: JQuery<HTMLFormElement>): AngularWipeStep
  public static from(arg: unknown): AngularWipeStep {
    if (arg instanceof HTMLFormElement) return AngularWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return AngularWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    return new AngularWipeStep(arg as AngularWipeConfiguration);
  }

  public static fromFormElement(formElement: HTMLFormElement): AngularWipeStep {
    const backgroundImage = $(formElement).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements($(formElement) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor");
    return new AngularWipeStep({
      ...AngularWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  public async execute(container: PIXI.Container): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new AngularWipeFilter(background.baseTexture);
    this.addFilter(container, filter);

    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}
