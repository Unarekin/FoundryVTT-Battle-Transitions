import { NotImplementedError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { TransitionConfiguration } from "./types";

export abstract class TransitionStep<t extends TransitionConfiguration = TransitionConfiguration> {
  // #region Properties (3)

  public readonly skipConfig = false;

  public abstract defaultSettings: t;
  public abstract template: string;

  // #endregion Properties (3)

  // #region Constructors (1)

  constructor(protected config: t) { }

  // #endregion Constructors (1)

  // #region Public Static Methods (7)

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
  public static validate(config: TransitionConfiguration): Promise<boolean | Error> {
    throw new NotImplementedError();
  }

  // #endregion Public Static Methods (7)

  // #region Public Methods (5)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addEventListeners(element: HTMLElement | JQuery<HTMLElement>): void { }

  public prepare(): Promise<void> { return Promise.resolve(); }

  public async renderTemplate(): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${this.template}`, this.getConfigTemplateParams());
  }

  public async serialize(): Promise<t> {
    return Promise.resolve({
      ...this.defaultSettings,
      ...this.config
    });
  }

  public validate(): Promise<boolean | Error> { return Promise.resolve(true); }

  // #endregion Public Methods (5)

  // #region Public Abstract Methods (1)

  public abstract execute(sequence: TransitionSequence): Promise<void>;

  // #endregion Public Abstract Methods (1)

  // #region Protected Methods (1)

  protected getConfigTemplateParams(): object {
    return {
      ...this.defaultSettings,
      ...this.config
    } as object;
  }

  // #endregion Protected Methods (1)
}
