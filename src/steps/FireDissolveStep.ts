import { FireDissolveFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements, renderTemplateFunc } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { FireDissolveConfiguration } from "./types";
import { generateEasingSelectOptions } from './selectOptions';

export class FireDissolveStep extends TransitionStep<FireDissolveConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: FireDissolveConfiguration = {
    id: "",
    type: "firedissolve",
    duration: 1000,
    easing: "none",
    burnSize: 1.3,
    version: "1.1.6"
  }

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon fire-dissolve fa-fw fas'></i>"
  public static key = "firedissolve";
  public static name = "FIREDISSOLVE";
  public static template = "firedissolve-config";
  public static reversible: boolean = true;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: FireDissolveConfiguration): Promise<string> {
    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${FireDissolveStep.template}.hbs`, {
      ...FireDissolveStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions()
    });
  }

  public static from(config: FireDissolveConfiguration): FireDissolveStep
  public static from(form: JQuery<HTMLFormElement>): FireDissolveStep
  public static from(form: HTMLFormElement): FireDissolveStep
  public static from(arg: unknown): FireDissolveStep {
    if (arg instanceof HTMLFormElement) return FireDissolveStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return FireDissolveStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new FireDissolveStep(arg as FireDissolveConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): FireDissolveStep {
    const elem = parseConfigurationFormElements<FireDissolveConfiguration>($(form) as JQuery<HTMLFormElement>, "id", "duration", "easing", "burnSize", "label");
    return new FireDissolveStep({
      ...FireDissolveStep.DefaultSettings,
      ...elem,
    });
  }

  public static getDuration(config: FireDissolveConfiguration): number { return { ...FireDissolveStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  #filter: FireDissolveFilter | null = null;

  public async reverse(): Promise<void> {
    if (this.#filter instanceof FireDissolveFilter) await this.simpleReverse(this.#filter);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const filter = new FireDissolveFilter(this.config.burnSize);
    this.#filter = filter;
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }

  // #endregion Public Methods (1)
}