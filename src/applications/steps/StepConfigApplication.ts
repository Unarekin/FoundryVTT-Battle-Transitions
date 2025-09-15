import { coerceScene } from "../../coercion";
import { DeepPartial } from "../../dialogs";
import { InvalidTransitionError, LocalizedError } from "../../errors";
import { TransitionConfiguration, TransitionStep } from "../../steps";
import { getStepClassByKey } from "../../utils";
import { AddStepApplication } from "../AddStepApplication";
import { StepConfigContext, StepConfigConfiguration } from "./types";

export class StepConfigApplication<t extends TransitionConfiguration> extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2)<StepConfigContext, StepConfigConfiguration> {

  public readonly StepClass: typeof TransitionStep | undefined = undefined;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {

  }

  public static DEFAULT_OPTIONS: DeepPartial<StepConfigConfiguration> = {
    window: {
      contentClasses: ["standard-form"],
      icon: "fa-solid bt-icon bt-crossed-swords"
    },
    position: {
      width: 500
    },
    tag: "form",
    form: {
      closeOnSubmit: true,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      handler: StepConfigApplication.onFormSubmit
    },
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      cancel: StepConfigApplication.Cancel
    }
  }

  static async Cancel(this: StepConfigApplication<any>) {
    this.#submitted = false;
    await this.close();
  }

  get title() {
    if (this.StepClass) return game.i18n?.localize(`BATTLETRANSITIONS.${this.StepClass.name}.NAME`) ?? "";
    else return "";
  }

  protected newScene: Scene | undefined;
  protected oldScene: Scene | undefined;

  protected config: t | undefined;
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

  parseFormData(data: Record<string, unknown>): t {
    return foundry.utils.mergeObject(
      foundry.utils.deepClone(this.StepClass?.DefaultSettings) ?? {},
      data
    ) as t;
  }

  static onFormSubmit(this: StepConfigApplication<any>, e: Event, form: HTMLFormElement, formData: FormDataExtended) {
    this.#submitted = true;

    const expanded = foundry.utils.expandObject(formData.object) as Record<string, unknown>;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const data = this.parseFormData(expanded);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.config = data;
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<StepConfigContext<TransitionConfiguration>> {
    const context = await super._prepareContext(options);

    if (this.config) context.config = this.config;

    // if (this.StepClass)
    //   foundry.utils.mergeObject(context, foundry.utils.deepClone(this.StepClass.getRenderContext(this.config)));

    context.buttons = [
      { type: "button", icon: "fa-solid fa-times", label: "Cancel", action: "cancel" },
      { type: "submit", icon: "fa-solid fa-save", label: "SETTINGS.Save" }
    ]

    return context;
  }

  protected _onClose(options: foundry.applications.api.ApplicationV2.RenderOptions): void {
    if (this.#resolve) this.#resolve(this.#submitted ? this.config : undefined);
    this.#configPromise = null;
    this.#resolve = null;
    this.#reject = null;

    super._onClose(options);
  }

  protected parseDualStyleForm(data: Record<string, unknown>): Record<string, unknown> {
    data.applyToOverlay = data.dualStyle === "both" || data.dualStyle === "overlay";
    data.applyToScene = data.dualStyle === "both" || data.dualStyle === "scene";
    delete data.dualStyle;
    return data;
  }

  _onRender(context: StepConfigContext, options: foundry.applications.api.ApplicationV2.RenderOptions) {
    super._onRender(context, options);

    this.toggleBackgroundSelector();


    const bgSection = this.element.querySelector(`[data-role="background-selector"]`);
    if (bgSection instanceof HTMLElement) {
      const select = bgSection.querySelector(`#backgroundType`);
      if (select instanceof HTMLSelectElement) {
        select.addEventListener("change", () => {
          this.toggleBackgroundSelector();
        })
      }
    }

    // Set up font drop-down
    const fontSelectors = Array.from(this.element.querySelectorAll(`[data-font-select]`)).filter(elem => elem instanceof HTMLSelectElement);
    for (const select of fontSelectors) {
      for (const option of select.options) {
        option.style.fontFamily = option.value;
      }
      select.style.fontFamily = select.value;
      select.addEventListener("change", () => { select.style.fontFamily = select.value; });
    }


    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ColorPicker.install();
  }

  private showElementsBySelector(selector: string, parent: HTMLElement = this.element) {
    const elements = parent.querySelectorAll(selector);
    for (const element of elements) {
      if (element instanceof HTMLElement) element.style.display = "block";
    }
  }

  private hideElementsBySelector(selector: string, parent: HTMLElement = this.element) {
    const elements = parent.querySelectorAll(selector);
    for (const element of elements) {
      if (element instanceof HTMLElement) element.style.display = "none";
    }
  }

  private toggleBackgroundSelector() {
    const bgSection = this.element.querySelector(`[data-role="background-selector"]`);
    if (!(bgSection instanceof HTMLElement)) return;

    const select = bgSection.querySelector(`#backgroundType`);
    if (!(select instanceof HTMLSelectElement)) return;

    this.hideElementsBySelector(`[data-background-type]`, bgSection);
    switch (select.value) {
      case "color":
        this.showElementsBySelector(`[data-background-type="color"]`, bgSection);
        break;
      case "image":
        this.showElementsBySelector(`[data-background-type="image"]`, bgSection);
        break;
      case "overlay":
        this.showElementsBySelector(`[data-background-type="overlay"]`, bgSection);
        break;
    }
  }

  protected async addSubStep(sequence: TransitionConfiguration[] = []): Promise<TransitionConfiguration | undefined> {
    const key = await AddStepApplication.add({ sequence });
    if (!key) return;
    const stepClass = getStepClassByKey(key);
    if (!stepClass) throw new InvalidTransitionError(key);
    let config: TransitionConfiguration | null = null;
    if (!stepClass.skipConfig) {
      if (!stepClass.ConfigurationApplication) throw new LocalizedError("NOCONFIGAPP");

      const app = new stepClass.ConfigurationApplication(foundry.utils.mergeObject(
        foundry.utils.deepClone(stepClass.DefaultSettings),
        { id: foundry.utils.randomID() }
      ), {
        oldScene: canvas?.scene?.uuid ?? ""
      });
      config = await app.configure() ?? null;
    } else {
      config = {
        ...foundry.utils.deepClone(stepClass.DefaultSettings),
        id: foundry.utils.randomID()
      }
    }
    if (!config) return;
    return config;
  }

  constructor(config?: t, options?: DeepPartial<StepConfigConfiguration<t>>) {
    super({
      ...options,
      ...(config ? config : {})
    });


    if (config) this.config = foundry.utils.deepClone(config);
    if (options?.newScene) {
      const scene = coerceScene(options.newScene);
      if (scene instanceof Scene) this.newScene = scene;
    }
    if (options?.oldScene) {
      const scene = coerceScene(options.oldScene);
      if (scene instanceof Scene) this.oldScene = scene;
    }
  }
}