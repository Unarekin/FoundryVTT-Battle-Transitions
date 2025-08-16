import { DeepPartial } from "../../dialogs";
import { TransitionConfiguration } from "../../steps";
import { StepConfigContext, StepConfigConfiguration } from "./types";

export class StepConfigApplication<t extends TransitionConfiguration> extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)<StepConfigContext, StepConfigConfiguration> {

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {

  }

  public static DEFAULT_OPTIONS: DeepPartial<StepConfigConfiguration> = {
    window: {
      contentClasses: ["standard-form"],
      icon: "fa-solid bt-icon crossed-swords"
    },
    tag: "form",
    form: {
      closeOnSubmit: true,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      handler: StepConfigApplication.onFormSubmit
    }
  }


  private config: t | undefined;
  #resolve: ((config: t | undefined) => void) | null = null;
  // eslint-disable-next-line no-unused-private-class-members
  #reject: ((err: Error) => void) | null = null;
  #configPromise: Promise<t | undefined> | null = null;

  #submitted = false;

  public async configure(): Promise<t | undefined> {
    if (!this.#configPromise) {
      this.#configPromise = new Promise<t | undefined>((resolve, reject) => {
        this.#resolve = resolve;
        this.#reject = reject;
      });
    }
    if (!this.rendered) await this.render(true);

    return this.#configPromise;
  }

  static onFormSubmit(this: StepConfigApplication<any>) {
    this.#submitted = true;
  }

  protected _onClose(options: foundry.applications.api.ApplicationV2.RenderOptions): void {
    super._onClose(options);

    if (this.#resolve) this.#resolve(this.#submitted ? this.config : undefined);
    this.#configPromise = null;
    this.#resolve = null;
    this.#reject = null;
  }

  _onRender(context: StepConfigContext, options: foundry.applications.api.ApplicationV2.RenderOptions) {
    super._onRender(context, options);
  }

  constructor(config?: t, options?: StepConfigConfiguration<t>) {
    super({
      ...options,
      ...(config ? config : {})
    });

    if (config) this.config = foundry.utils.deepClone(config);
  }
}