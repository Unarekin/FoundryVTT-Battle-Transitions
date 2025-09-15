import { coerceScene } from "../coercion"
import { InvalidTransitionError, LocalizedError } from "../errors"
import { TransitionConfiguration } from "../steps"
import { getStepClassByKey, localize, templateDir } from "../utils"
import { AddStepApplication } from "./AddStepApplication"
import { confirm } from "./functions"
import { DeepPartial, SequenceEditorConfiguration, SequenceEditorContext } from "./types"

export class SequenceEditorApplication extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {
  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`dialogs/EditSequence.hbs`),
      templates: [
        templateDir(`transition-step.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  public static DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    window: {
      title: localize("BATTLETRANSITIONS.DIALOGS.SEQUENCE.EDIT"),
      icon: "fa-solid fa-hammer",
      contentClasses: ["standard-form", "transition-builder"]
    },
    position: {
      width: 500
    },
    tag: "form",
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      handler: SequenceEditorApplication.onFormSubmit
    },
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      cancel: SequenceEditorApplication.Cancel,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      addStep: SequenceEditorApplication.AddStep,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      clearSteps: SequenceEditorApplication.ClearSteps,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      editStep: SequenceEditorApplication.EditStep,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      removeStep: SequenceEditorApplication.RemoveStep
    }
  }

  #resolve: ((sequence?: TransitionConfiguration[]) => void) | undefined = undefined;
  // eslint-disable-next-line no-unused-private-class-members
  #reject: ((err: Error) => void) | undefined = undefined;
  #promise: Promise<TransitionConfiguration[] | undefined> | undefined = undefined;
  #submitted = false;

  #oldScene: Scene | undefined = undefined;
  #newScene: Scene | undefined = undefined;

  public static async AddStep(this: SequenceEditorApplication) {
    try {
      const key = await AddStepApplication.add({ sequence: this.sequence });
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
          oldScene: this.#oldScene?.uuid,
          newScene: this.#newScene?.uuid
        });
        config = await app.configure() ?? null;
      } else {
        config = {
          ...foundry.utils.deepClone(stepClass.DefaultSettings),
          id: foundry.utils.randomID()
        }
      }
      if (!config) return;
      this.sequence.push(foundry.utils.deepClone(config));
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  public static async ClearSteps(this: SequenceEditorApplication) {
    try {
      if (!this.sequence.length) return;
      const confirmed = await confirm("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE", localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE"));
      if (!confirmed) return;
      this.sequence.splice(0, this.sequence.length);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  public static async EditStep(this: SequenceEditorApplication, event: PointerEvent, elem: HTMLElement) {
    try {
      if (!this.sequence.length) return;
      const id = elem.dataset.step as string ?? "";
      if (!id) throw new InvalidTransitionError(id);
      const config = this.sequence.find(item => item.id === id);
      if (!config) throw new InvalidTransitionError(id);

      const stepClass = getStepClassByKey(config.type);
      if (!stepClass) throw new InvalidTransitionError(config.type);
      if (!stepClass.ConfigurationApplication) throw new LocalizedError("NOCONFIGAPP");

      const app = new stepClass.ConfigurationApplication(foundry.utils.deepClone(config), {
        oldScene: this.#oldScene?.uuid ?? "",
        newScene: this.#newScene?.uuid ?? ""
      });
      const newConfig = await app.configure();
      if (!newConfig) return;
      const index = this.sequence.findIndex(item => item.id === id);
      if (index !== -1) this.sequence.splice(index, 1, newConfig);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }
  _onRender(context: any, options: foundry.applications.api.DocumentSheetV2.RenderOptions) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    super._onRender(context, options);


    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ($(this.element).find(`[data-role="transition-steps"]`) as any).sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y",
      classes: {
        "ui-sortable-helper": "application ui-sortable-helper"
      }
    });
  }

  public static async RemoveStep(this: SequenceEditorApplication, event: PointerEvent, element: HTMLElement) {
    try {
      if (!this.sequence.length) return;

      const id = element.dataset.step as string ?? "";
      if (!id) throw new InvalidTransitionError(id);
      const step = this.sequence.find(item => item.id === id);
      if (!step) throw new InvalidTransitionError(id);
      const stepClass = getStepClassByKey(step.type);
      if (!stepClass) throw new InvalidTransitionError(step.type);

      const name = localize(`BATTLETRANSITIONS.${stepClass.name}.NAME`);
      const confirmed = await confirm(
        game.i18n?.format("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name }) ?? "",
        game.i18n?.format("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name }) ?? ""
      );
      if (!confirmed) return;

      const index = this.sequence.findIndex(item => item.id === id);
      if (index !== -1) this.sequence.splice(index, 1);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }


  public static async Cancel(this: SequenceEditorApplication) { await this.close(); }

  public async edit(): Promise<TransitionConfiguration[] | undefined> {
    if (!this.#promise) {
      this.#promise = new Promise<TransitionConfiguration[] | undefined>((resolve, reject) => {
        this.#reject = reject;
        this.#resolve = resolve;
      });
    }

    if (!this.rendered) await this.render(true);
    return this.#promise;
  }

  public static async edit(config?: DeepPartial<SequenceEditorConfiguration>): Promise<TransitionConfiguration[] | undefined> {
    const app = new SequenceEditorApplication(config);
    return app.edit();
  }

  protected _onClose(options: foundry.applications.api.ApplicationV2.RenderOptions): void {
    if (this.#resolve) this.#resolve(this.#submitted ? this.sequence : undefined);
    this.#promise = undefined;
    this.#resolve = undefined;
    this.#reject = undefined;
    super._onClose(options);
  }

  static onFormSubmit(this: SequenceEditorApplication) {
    this.#submitted = true;
  }

  protected readonly sequence: TransitionConfiguration[] = [];

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<any> {
    const context = await super._prepareContext(options) as unknown as SequenceEditorContext;

    context.sequence = foundry.utils.deepClone(this.sequence);

    context.buttons = [
      { type: "button", icon: "fas fa-times", label: "Cancel", action: "cancel" },
      { type: "submit", icon: "fas fa-check", label: "BATTLETRANSITIONS.DIALOGS.BUTTONS.OK", action: "ok" }
    ]
    return context;
  }

  constructor(config?: DeepPartial<SequenceEditorConfiguration>) {
    super(config ?? {});
    if (config?.sequence) this.sequence.splice(0, this.sequence.length, ...foundry.utils.deepClone(config.sequence));
    if (config?.oldScene) {
      const scene = coerceScene(config.oldScene);
      if (scene instanceof Scene) this.#oldScene = scene;
    }
    if (config?.newScene) {
      const scene = coerceScene(config.newScene);
      if (scene instanceof Scene) this.#newScene = scene;
    }
  }
}
