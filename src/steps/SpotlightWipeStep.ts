import { SpotlightWipeFilter } from "../filters";
import { TransitionSequence } from '../interfaces';
import { createColorTexture, generateEasingSelectOptions, generateRadialDirectionSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SpotlightWipeConfiguration } from "./types";

export class SpotlightWipeStep extends TransitionStep<SpotlightWipeConfiguration> {
  // #region Properties (6)

  public readonly defaultSettings: Partial<SpotlightWipeConfiguration> = {
    duration: 1000,
    easing: "none"
  }

  public static DefaultSettings: SpotlightWipeConfiguration = {
    type: "spotlightwipe",
    duration: 1000,
    easing: "none",
    direction: "top",
    radial: "outside",
    bgSizingMode: "stretch",
    version: "1.1.0",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  }

  public static hidden: boolean = false;
  public static key = "spotlightwipe";
  public static name = "SPOTLIGHTWIPE";
  public static template = "spotlightwipe-config";

  // #endregion Properties (6)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: SpotlightWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${SpotlightWipeStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...SpotlightWipeStep.DefaultSettings,
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      directionSelect: {
        top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
        left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
        right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
        bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
      },
      radialSelect: generateRadialDirectionSelectOptions()
    });
  }

  public static from(config: SpotlightWipeConfiguration): SpotlightWipeStep
  public static from(form: HTMLFormElement): SpotlightWipeStep
  public static from(form: JQuery<HTMLFormElement>): SpotlightWipeStep
  public static from(arg: unknown): SpotlightWipeStep {
    if (arg instanceof HTMLFormElement) return SpotlightWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return SpotlightWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new SpotlightWipeStep(arg as SpotlightWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): SpotlightWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const serializedTexture = elem.find("#backgroundImage").val() as string ?? "";

    return new SpotlightWipeStep({
      ...SpotlightWipeStep.DefaultSettings,
      serializedTexture,
      ...parseConfigurationFormElements(elem, "id", "duration", "direction", "radial", "backgroundType", "backgroundColor", "easing")
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpotlightWipeFilter(this.config.direction, this.config.radial, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}
