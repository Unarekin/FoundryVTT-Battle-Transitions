import { FireDissolveFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { generateEasingSelectOptions, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { FireDissolveConfiguration } from "./types";

export class FireDissolveStep extends TransitionStep<FireDissolveConfiguration> {
  // #region Properties (5)

  public static DefaultSettings: FireDissolveConfiguration = {
    type: "firedissolve",
    duration: 1000,
    easing: "none",
    burnSize: 1.3,
    version: "1.1.0"
  }

  public static hidden: boolean = false;
  public static key = "firedissolve";
  public static name = "FIREDISSOLVE";
  public static template = "firedissolve-config";

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: FireDissolveConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${FireDissolveStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...FireDissolveStep.DefaultSettings,
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions()
    });
  }

  public static from(config: FireDissolveConfiguration): FireDissolveStep
  public static from(form: JQuery<HTMLFormElement>): FireDissolveStep
  public static from(form: HTMLFormElement): FireDissolveStep
  public static from(arg: unknown): FireDissolveStep {
    if (arg instanceof HTMLFormElement) return FireDissolveStep.fromFormElement(arg);
    if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return FireDissolveStep.fromFormElement(arg[0]);
    else return new FireDissolveStep(arg as FireDissolveConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): FireDissolveStep {
    const elem = parseConfigurationFormElements<FireDissolveConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "easing", "burnSize");
    return new FireDissolveStep({
      ...FireDissolveStep.DefaultSettings,
      ...elem,
    });
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (1)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const filter = new FireDissolveFilter(this.config.burnSize);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}