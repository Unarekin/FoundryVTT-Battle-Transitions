import { AddStepContext, AddStepTab, AddStepRenderOptions, DeepPartial, AddStepConfiguration } from "./types";
import { getStepsForCategory } from "./functions";
import { TransitionConfiguration } from "../steps";

export class AddStepApplication extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

  #resolve: ((key: string | undefined) => void) | undefined = undefined;
  // eslint-disable-next-line no-unused-private-class-members
  #reject: ((err: Error) => void) | undefined = undefined;
  #promise: Promise<string | undefined> | undefined = undefined;
  #sequence: TransitionConfiguration[] | undefined = undefined;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    tabs: {
      template: `templates/generic/tab-navigation.hbs`
    },
    main: {
      template: `modules/${__MODULE_ID__}/templates/dialogs/AddStep.hbs`
    },
    footer: {
      template: `templates/generic/form-footer.hbs`
    }
  }

  public static DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    window: {
      title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TITLE",
      icon: "fa-solid fa-plus",
      contentClasses: ["standard-form", "add-step", "bt"]
    },
    position: {
      width: 400
    },
    tag: "form",
    form: {
      closeOnSubmit: true,
      submitOnChange: false
    },
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      cancel: AddStepApplication.Cancel,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      selectStep: AddStepApplication.SelectStep
    }
  }

  public static async SelectStep(this: AddStepApplication, e: Event, elem: HTMLElement) {
    try {
      const key = elem.dataset.key ?? "";
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      await this.close({ selectedKey: key } as any);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  public static async Cancel(this: AddStepApplication) {
    await this.close();
  }

  protected _onClose(options: AddStepRenderOptions): void {
    if (this.#resolve) this.#resolve(options.selectedKey ? options.selectedKey : undefined);

    this.#resolve = undefined;
    this.#reject = undefined;
    this.#promise = undefined;

    return super._onClose(options);
  }

  protected getTabs(sequence?: TransitionConfiguration[]): AddStepTab[] {
    return [
      {
        id: "wipes",
        icon: "",
        group: "main",
        label: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.WIPES",
        cssClass: "active",
        active: true,
        data: getStepsForCategory("wipe", sequence ?? [])
      },
      {
        id: "warps",
        icon: "",
        group: "main",
        label: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.WARPS",
        cssClass: "",
        active: false,
        data: getStepsForCategory("warp", sequence ?? [])
      },
      {
        id: "effects",
        icon: "",
        group: "main",
        label: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.EFFECTS",
        cssClass: "",
        active: false,
        data: getStepsForCategory("effect", sequence ?? [])
      },
      {
        id: "technical",
        icon: "",
        group: "main",
        label: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.TECHNICAL",
        cssClass: "",
        active: false,
        data: getStepsForCategory("technical", sequence ?? [])
      }
    ]
  }

  async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<any> {
    const context = (await super._prepareContext(options)) as unknown as AddStepContext;


    context.tabs = this.getTabs(this.#sequence);


    context.buttons = [
      { type: "button", icon: "fas fa-times", label: "Cancel", action: "cancel" },
      { type: "submit", icon: "fas fa-check", label: "BATTLETRANSITIONS.DIALOGS.BUTTONS.OK", action: "ok" }
    ]
    return context;
  }

  protected async _preparePartContext(partId: string, context: any, options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const newContext = (await super._preparePartContext(partId, context, options)) as AddStepContext;



    return newContext;
  }

  public static async add(): Promise<string | undefined> {
    const app = new AddStepApplication({});
    return app.add();
  }

  public async add(): Promise<string | undefined> {
    if (this.#promise) return this.#promise;

    this.#promise = new Promise<string | undefined>((resolve, reject) => {
      this.#resolve = resolve;
      this.#reject = reject;
    });

    await this.render(true);

    return this.#promise;
  }

  constructor(options: DeepPartial<AddStepConfiguration> = {}) {
    super(options);
    if (options.sequence) this.#sequence = foundry.utils.deepClone(options.sequence);
  }
}