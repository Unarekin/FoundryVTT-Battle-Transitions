import { NotImplementedError } from "../errors";
import { CustomFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { AnimatedTransition, TransitionConfiguration } from "./types";

export abstract class TransitionStep<t extends TransitionConfiguration = TransitionConfiguration> {
  // #region Properties (3)

  static name: string = "UNNAMED";

  public readonly skipConfig: boolean = false;

  public abstract defaultSettings: Partial<t>;
  public abstract template: string;

  // #endregion Properties (3)

  // #region Constructors (1)

  constructor(protected config: t) { }

  // #endregion Constructors (1)

  // #region Public Static Methods (7)

  protected async simpleTween(filter: CustomFilter<any>): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { progress: 1, duration: (this.config as unknown as AnimatedTransition).duration / 1000, ease: (this.config as unknown as AnimatedTransition).easing || "none" });
  }

  public static from(config: TransitionConfiguration): TransitionStep
  public static from(form: HTMLFormElement): TransitionStep
  public static from(form: JQuery<HTMLFormElement>): TransitionStep
  public static from(arg: unknown): TransitionStep {
    if (arg instanceof HTMLFormElement) return this.fromHTMLFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return this.fromJQueryHTMLFormElement(arg as unknown as JQuery<HTMLFormElement>);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    else return new (this.constructor as any)(arg);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static fromHTMLFormElement(element: HTMLFormElement): TransitionStep {
    throw new NotImplementedError();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static fromJQueryHTMLFormElement(element: JQuery<HTMLFormElement>): TransitionStep {
    throw new NotImplementedError();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static validate(config: TransitionConfiguration): Promise<boolean | Error> | boolean | Error {
    return true;
  }

  // #endregion Public Static Methods (7)

  // #region Public Methods (5)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addEventListeners(element: HTMLElement | JQuery<HTMLElement>): void { }

  public prepare(): Promise<void> | void { }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public teardown(container: PIXI.Container): Promise<void> | void { }

  public async renderTemplate(): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${this.template}`, this.getConfigTemplateParams());
  }

  public serialize(): Promise<t> | t {
    return {
      ...this.defaultSettings,
      ...this.config
    };
  }

  public validate(): Promise<boolean | Error> | boolean | Error { return true }

  protected addFilter(container: PIXI.Container, filter: CustomFilter<any>) {
    if (Array.isArray(container.filters)) container.filters.push(filter);
    else container.filters = [filter];
  }

  // #endregion Public Methods (5)

  // #region Public Abstract Methods (1)

  public abstract execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> | void;

  // #endregion Public Abstract Methods (1)

  // #region Protected Methods (1)

  protected getConfigTemplateParams(): object {
    return {
      ...this.defaultSettings,
      ...this.config
    } as object;
  }

  protected removeFilter(container: PIXI.Container, filter: CustomFilter<any>) {
    const index = container.filters?.indexOf(filter) ?? -1;
    if (index !== -1) container.filters?.splice(index, 1);
  }
  // #endregion Protected Methods (1)
}
