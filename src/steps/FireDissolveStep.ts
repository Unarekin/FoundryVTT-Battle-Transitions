import { FireDissolveFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { FireDissolveConfiguration } from "./types";
import { FireDissolveConfigApplication } from "../applications";

export class FireDissolveStep extends TransitionStep<FireDissolveConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: FireDissolveConfiguration = Object.freeze({
    id: "",
    type: "firedissolve",
    duration: 1000,
    easing: "none",
    burnSize: 1.3,
    version: "1.1.6"
  });

  public static category = "wipe";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-fire-dissolve fa-fw fas'></i>"
  public static key = "firedissolve";
  public static name = "FIREDISSOLVE";
  public static template = "firedissolve-config";
  public static reversible: boolean = true;

  public static preview = `modules/${__MODULE_ID__}/assets/previews/FireDissolve.webm`;
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = FireDissolveConfigApplication as any;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  static getListDescription(config?: FireDissolveConfiguration): string {
    if (config) return game.i18n?.format("BATTLETRANSITIONS.FIREDISSOLVE.LABEL", { duration: config.duration, burnSize: config.burnSize }) ?? "";
    else return "";
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