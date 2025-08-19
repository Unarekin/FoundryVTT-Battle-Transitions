import { coerceScene } from "../coercion";
import { AddStepDialog, DeepPartial } from "../dialogs";
import { InvalidSceneError, InvalidTransitionError, LocalizedError } from "../errors";
import { TransitionConfiguration } from "../steps";
import { downloadJSON, getStepClassByKey, localize, uploadJSON } from "../utils";
import { generateMacro, confirm } from "./functions";

type BuilderResponse = {
  scene: string,
  users: string[],
  sequence: TransitionConfiguration[]
};

interface TransitionBuilderConfiguration extends foundry.applications.api.ApplicationV2.Configuration {
  scene?: string;
}

interface TransitionBuilderContext {
  scene?: string;
  users?: string[];
  sequence: TransitionConfiguration[];

  usersSelect: Record<string, string>;
  scenesSelect: Record<string, string>;
  canCreateMacro: boolean;

  buttons: foundry.applications.api.ApplicationV2.FormFooterButton[];
}

export class TransitionBuilder extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

  // eslint-disable-next-line no-unused-private-class-members
  #reject: ((reason: any) => void) | undefined = undefined;
  #resolve: ((response: BuilderResponse | undefined) => void) | undefined = undefined;
  #promise: Promise<BuilderResponse | undefined> | undefined = undefined;
  #submitted = false;

  #response: BuilderResponse = {
    scene: "",
    users: [],
    sequence: []
  };


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/dialogs/TransitionBuilder.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/transition-step.hbs`
      ]
    },
    footer: {
      template: `templates/generic/form-footer.hbs`
    }
  }


  public static DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.ApplicationV2.Configuration> = {
    window: {
      title: localize("BATTLETRANSITIONS.TRANSITIONBUILDER.TITLE"),
      icon: "fa-solid fa-hammer",
      contentClasses: ["standard-form", "transition-builder"]
    },
    tag: "form",
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      handler: TransitionBuilder.onFormSubmit
    },
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      cancel: TransitionBuilder.Cancel,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      saveMacro: TransitionBuilder.SaveMacro,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      importJson: TransitionBuilder.ImportJSON,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      exportJson: TransitionBuilder.ExportJSON,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      clearSteps: TransitionBuilder.ClearSteps,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      addStep: TransitionBuilder.AddStep,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      removeStep: TransitionBuilder.RemoveStep,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      editStep: TransitionBuilder.EditStep
    }
  }

  static async Cancel(this: TransitionBuilder) {
    try {
      this.#submitted = false;
      await this.close();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  static async EditStep(this: TransitionBuilder, event: PointerEvent, elem: HTMLElement) {
    try {
      if (!this.#response.sequence.length) return;
      const id = elem.dataset.step as string ?? "";
      if (!id) throw new InvalidTransitionError(id);
      const config = this.#response.sequence.find(item => item.id === id);
      if (!config) throw new InvalidTransitionError(id);

      const stepClass = getStepClassByKey(config.type);
      if (!stepClass) throw new InvalidTransitionError(config.type);
      if (!stepClass.ConfigurationApplication) throw new LocalizedError("NOCONFIGAPP");

      const app = new stepClass.ConfigurationApplication(foundry.utils.deepClone(config));
      const newConfig = await app.configure();
      if (!newConfig) return;
      const index = this.#response.sequence.findIndex(item => item.id === id);
      if (index !== -1) this.#response.sequence.splice(index, 1, newConfig);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  static async RemoveStep(this: TransitionBuilder, event: PointerEvent, element: HTMLElement) {
    try {
      if (!this.#response?.sequence.length) return;

      const id = element.dataset.step as string ?? "";
      if (!id) throw new InvalidTransitionError(id);
      const step = this.#response.sequence.find(item => item.id === id);
      if (!step) throw new InvalidTransitionError(id);

      const stepClass = getStepClassByKey(step.type);
      if (!stepClass) throw new InvalidTransitionError(step.type);

      const name = game.i18n?.localize(`BATTLETRANSITIONS.${stepClass.name}.NAME`)

      const confirmed = await confirm(
        game.i18n?.format("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name }) ?? "",
        game.i18n?.format("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name }) ?? ""
      );
      if (!confirmed) return;
      const index = this.#response.sequence.findIndex(item => item.id === id);
      if (index !== -1) this.#response.sequence.splice(index, 1);
      await this.render();

    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  static async AddStep(this: TransitionBuilder) {
    try {
      const key = await AddStepDialog.prompt(this.#response?.sequence ?? []);
      if (!key) return;
      const stepClass = getStepClassByKey(key);
      if (!stepClass) throw new InvalidTransitionError(key);
      let config: TransitionConfiguration | null = null;
      if (!stepClass.skipConfig) {
        if (!stepClass.ConfigurationApplication) throw new LocalizedError("NOCONFIGAPP");
        const app = new stepClass.ConfigurationApplication(foundry.utils.mergeObject(
          foundry.utils.deepClone(stepClass.DefaultSettings),
          { id: foundry.utils.randomID() }
        ));
        config = await app.configure() ?? null;
      } else {
        config = {
          ...foundry.utils.deepClone(stepClass.DefaultSettings),
          id: foundry.utils.randomID()
        }
      }
      if (!config) return;
      console.log("Adding:", foundry.utils.deepClone(config));
      if (this.#response.sequence) this.#response.sequence.push(foundry.utils.deepClone(config));
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  static async ClearSteps(this: TransitionBuilder) {
    try {
      if (!this.#response?.sequence.length) return;
      const confirmed = await confirm("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE", localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE"));
      if (!confirmed) return;
      this.#response.sequence.splice(0, this.#response.sequence.length);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  static async ImportJSON(this: TransitionBuilder) {
    try {
      if (this.#response?.sequence.length) {
        const confirmation = await confirm("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.TITLE", localize("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.MESSAGE"));
        if (!confirmation) return;
      }

      const sequence = await uploadJSON<TransitionConfiguration[]>();
      if (!sequence) return;
      this.#response.sequence = foundry.utils.deepClone(sequence);
      await this.render();
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }

  static ExportJSON(this: TransitionBuilder) {
    try {
      if (!this.#response.sequence.length) return;
      downloadJSON(this.#response.sequence, `${localize("BATTLETRANSITIONS.COMMON.TRANSITION")}.json`);
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false })
    }
  }

  static async SaveMacro(this: TransitionBuilder) {
    try {
      if (!this.#response?.sequence.length) return;
      let scene: Scene | undefined = undefined;
      if (this.#response.scene) {
        scene = coerceScene(this.#response.scene);
        if (!(scene instanceof Scene)) throw new InvalidSceneError(this.#response.scene);
      }
      const macro = generateMacro(this.#response.sequence, [], scene);
      await Macro.createDialog({ type: "script", command: macro, img: `modules/${__MODULE_ID__}/assets/icons/crossed-swords.svg` });
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
    }
  }
  /**
   * Build an ad-hoc transition
   * @returns {Promise<BuilderResponse | undefined>} - {@link BuilderResponse}
   */
  public async build(scene?: string): Promise<BuilderResponse | undefined> {
    if (!this.#promise) {
      this.#promise = new Promise<BuilderResponse | undefined>((resolve, reject) => {
        this.#reject = reject;
        this.#resolve = resolve;
      });
    }
    if (scene) {
      const actualScene = coerceScene(scene);
      if (!(actualScene instanceof Scene)) throw new InvalidSceneError(scene);
      this.#response.scene = actualScene.uuid;
    }

    if (!this.rendered) await this.render(true);
    return this.#promise;
  }

  /**
   * Build an ad-hoc transition
   * @returns {Promise<BuilderResponse | undefined>} - {@link BuilderResponse}
   */
  public static async build(scene?: string): Promise<BuilderResponse | undefined> {
    const app = new TransitionBuilder({ scene });
    return app.build(scene);
  }

  protected _onClose(options: foundry.applications.api.ApplicationV2.RenderOptions): void {
    if (this.#resolve) this.#resolve(this.#submitted ? this.#response : undefined);
    this.#promise = undefined;
    this.#resolve = undefined;
    this.#reject = undefined;

    super._onClose(options);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  static onFormSubmit(this: TransitionBuilder, e: Event, form: HTMLFormElement, formData: FormDataExtended) {
    this.#submitted = true;

    // Handle parsing the form
  }

  async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<any> {
    const context = await super._prepareContext(options) as unknown as TransitionBuilderContext;

    if (this.#response.scene) context.scene = this.#response.scene;
    if (this.#response.users) context.users = [...this.#response.users];
    context.sequence = foundry.utils.deepClone(this.#response.sequence);

    context.usersSelect = Object.fromEntries(
      (game?.users?.contents ?? []).map(user => [user.uuid, user.name])
    ) as Record<string, string>;

    context.scenesSelect = Object.fromEntries(
      (game?.scenes?.contents ?? []).map(scene => [scene.uuid, scene.name])
    ) as Record<string, string>;

    context.canCreateMacro = Macro.canUserCreate(game?.user as User);

    context.buttons = [
      { type: "button", icon: "fas fa-times", label: "Cancel", action: "cancel" },
      { type: "submit", icon: "fas fa-play", label: "BATTLETRANSITIONS.DIALOGS.BUTTONS.TRANSITION", action: "ok" }

    ]

    return context;
  }


  constructor(options?: DeepPartial<TransitionBuilderConfiguration>) {
    super(options ?? {});
    if (options?.scene) {
      const scene = coerceScene(options.scene);
      if (!(scene instanceof Scene)) throw new InvalidSceneError(options.scene);
      this.#response.scene = scene.uuid;
    }
  }
}