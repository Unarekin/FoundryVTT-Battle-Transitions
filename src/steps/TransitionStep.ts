import { NotImplementedError } from "../errors";
import { CustomFilter } from "../filters";
import { PreparedTransitionHash, TransitionSequence } from '../interfaces';
import { AnimatedTransition, TransitionConfiguration } from "./types";

export abstract class TransitionStep<t extends TransitionConfiguration = TransitionConfiguration> {
  // #region Properties (6)

  public static DefaultSettings: TransitionConfiguration = {
    id: "",
    type: "UNKNOWN",
    version: "1.1.0"
  };
  public static hidden: boolean = true;
  public static key: string = "unknown";
  public static name: string = "UNNAMED";
  public static skipConfig: boolean = false;
  public static template: string = "";
  public static icon: string = "";
  public static category: string = "";

  // #endregion Properties (6)

  // #region Constructors (1)

  constructor(public readonly config: Partial<t>) {
    if (!config.id) this.config.id = foundry.utils.randomID();
  }

  // #endregion Constructors (1)

  // #region Public Static Methods (7)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars, @typescript-eslint/require-await
  public static async RenderTemplate(config?: TransitionConfiguration, oldScene?: Scene, newScene?: Scene): Promise<string> {
    throw new NotImplementedError();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static Upgrade(config: unknown): TransitionConfiguration { throw new NotImplementedError(); }

  public static from(config: TransitionConfiguration): TransitionStep
  public static from(form: HTMLFormElement): TransitionStep
  public static from(form: JQuery<HTMLFormElement>): TransitionStep
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static from(arg: unknown): TransitionStep {
    throw new NotImplementedError();
  }

  public static validate(config: TransitionConfiguration): Promise<TransitionConfiguration | Error> | TransitionConfiguration | Error {
    return config;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static validateForm(elem: HTMLElement | JQuery<HTMLElement>): boolean { return true; }

  // #endregion Public Static Methods (7)

  // #region Public Methods (5)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static addEventListeners(element: HTMLElement | JQuery<HTMLElement>, config?: TransitionConfiguration): void { }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static editDialogClosed(element: HTMLElement | JQuery<HTMLElement>): void { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public prepare(sequence?: TransitionSequence): Promise<void> | void { }

  public serialize(): Promise<t> | t {
    return this.config as t;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public teardown(container: PIXI.Container): Promise<void> | void { }

  // #endregion Public Methods (5)

  // #region Public Abstract Methods (1)

  public abstract execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> | void;

  // #endregion Public Abstract Methods (1)

  // #region Protected Methods (4)

  protected addFilter(container: PIXI.Container, filter: CustomFilter<any> | PIXI.Filter) {
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];
  }

  protected getConfigTemplateParams(): object {
    return {
      ...this.config
    } as object;
  }

  protected removeFilter(container: PIXI.Container, filter: CustomFilter<any>) {
    const index = container.filters?.indexOf(filter) ?? -1;
    if (index !== -1) container.filters?.splice(index, 1);
  }

  protected async simpleTween(filter: CustomFilter<any>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: (this.config as unknown as AnimatedTransition).duration / 1000, ease: (this.config as unknown as AnimatedTransition).easing || "none" });
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static getDuration(config: TransitionConfiguration, sequence: TransitionConfiguration[]): number | Promise<number> { return 0; }

  // #endregion Protected Methods (4)
}
