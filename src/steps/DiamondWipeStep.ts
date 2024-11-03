import { DiamondTransitionFilter } from "../filters";
import { createColorTexture, generateEasingSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { DiamondWipeConfiguration } from "./types";

export class DiamondWipeStep extends TransitionStep<DiamondWipeConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: DiamondWipeConfiguration = {
    type: "diamondwipe",
    size: 40,
    duration: 1000,
    easing: "none",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "diamondwipe";
  public static name = "DIAMONDWIPE";
  public static template = "diamondwipe-config";

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: DiamondWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${DiamondWipeStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...DiamondWipeStep.DefaultSettings,
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions()
    });
  }

  public static from(config: DiamondWipeConfiguration): DiamondWipeStep
  public static from(form: JQuery<HTMLFormElement>): DiamondWipeStep
  public static from(form: HTMLFormElement): DiamondWipeStep
  public static from(arg: unknown): DiamondWipeStep {
    if (arg instanceof HTMLFormElement) return DiamondWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return DiamondWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new DiamondWipeStep(arg as DiamondWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): DiamondWipeStep {
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? "";
    const elem = parseConfigurationFormElements<DiamondWipeConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "easing", "backgroundType", "backgroundColor");
    return new DiamondWipeStep({
      ...DiamondWipeStep.DefaultSettings,
      ...elem,
      serializedTexture: backgroundImage
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  public async execute(container: PIXI.Container): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new DiamondTransitionFilter(this.config.size, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}