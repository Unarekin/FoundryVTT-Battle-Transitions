import { NotImplementedError } from "../errors";
import { TransitionConfiguration } from "./types";

export abstract class TransitionStep<t extends TransitionConfiguration = TransitionConfiguration> {
  readonly skipConfig = false;
  abstract template: string;
  abstract defaultSettings: t;

  static from(config: TransitionConfiguration): TransitionStep
  static from(form: HTMLFormElement): TransitionStep
  static from(form: JQuery<HTMLFormElement>): TransitionStep
  static from(arg: unknown): TransitionStep {
    if (arg instanceof HTMLFormElement) return this.fromHTMLFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return this.fromJQueryHTMLFormElement(arg as unknown as JQuery<HTMLFormElement>);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call
    else return new (this.constructor as any)(arg);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static validate(config: TransitionConfiguration): Promise<boolean | Error> {
    throw new NotImplementedError();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static fromHTMLFormElement(element: HTMLFormElement): TransitionStep {
    throw new NotImplementedError();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static fromJQueryHTMLFormElement(element: JQuery<HTMLFormElement>): TransitionStep {
    throw new NotImplementedError();
  }

  protected getConfigTemplateParams(): object {
    return {
      ...this.defaultSettings,
      ...this.config
    } as object;
  }


  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public addEventListeners(element: HTMLElement | JQuery<HTMLElement>): void { }
  public validate(): Promise<boolean | Error> { return Promise.resolve(true); }
  public prepare(): Promise<void> { return Promise.resolve(); }
  abstract execute(): Promise<void>;

  public serialize(): t {
    return {
      ...this.defaultSettings,
      ...this.config
    };
  }

  public async renderTemplate(): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${this.template}`, this.getConfigTemplateParams());
  }

  constructor(protected config: t) { }
}

