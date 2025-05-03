import { EmptyObject } from "Foundry-VTT/src/types/utils.mjs";
import { downloadJSON, formatDuration, getStepClassByKey, localize } from "../utils";
import { addStepDialog, buildTransitionFromForm, confirm, importSequence } from "./functions";
import { TransitionConfiguration } from "../steps";
import { sequenceDuration } from "../transitionUtils";
import { InvalidTransitionError } from "../errors";

type BuilderResponse = {
  scene: string,
  sequence: TransitionConfiguration[]
};

export class TransitionBuilder extends foundry.applications.api.HandlebarsApplicationMixin(foundry.applications.api.ApplicationV2) {

  #resolve: ((config?: BuilderResponse) => void) | undefined = undefined;
  #reject: ((err: Error) => void) | undefined = undefined;
  #closed: Promise<BuilderResponse | undefined> | undefined = undefined;

  public static readonly DEFAULT_OPTIONS = {
    window: {
      contentClasses: ["standard-form", "transition-builder"],
      title: localize("BATTLETRANSITIONS.DIALOGS.TRANSITIONBUILDER.TITLE"),
      icon: "fas fa-hammer"
    },
    position: {
      width: 600
    },
    tag: "form",
    form: {
      submitOnChange: false,
      closeOnSubmit: true,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      handler: TransitionBuilder.onSubmit
    },
    actions: {
      // eslint-disable-next-line @typescript-eslint/unbound-method
      cancel: TransitionBuilder.Cancel,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      importJson: TransitionBuilder.ImportJSON,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      exportJson: TransitionBuilder.ExportJSON,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      addStep: TransitionBuilder.AddStep,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      clearSteps: TransitionBuilder.ClearSteps,
      // eslint-disable-next-line @typescript-eslint/unbound-method
      selectStep: TransitionBuilder.SelectStep

    }
  }


  public static readonly PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/dialogs/TransitionBuilder.hbs`,
      scrollabe: [`[data-role="transition-config"]`]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  };

  public get closed() { return this.#closed; }

  _onChangeForm(): void {
    try {
      if (!(this.element instanceof HTMLFormElement)) throw new InvalidTransitionError(typeof undefined);
      const data = foundry.utils.expandObject(new FormDataExtended(this.element).object) as Record<string, unknown>;

      // Parse current step
      const currentStep = data.step as Record<string, unknown>;
      if (currentStep) {
        const typeElem = this.element.querySelector(`[data-role="transition-config"] [data-transition-type]`);
        if (typeElem instanceof HTMLElement) {
          const stepType = typeElem.dataset.transitionType as string;
          const step = getStepClassByKey(stepType);
          if (!step) throw new InvalidTransitionError(stepType);
          const config = {
            ...step.DefaultSettings,
            id: foundry.utils.randomID(),
            ...currentStep
          };

          const option = this.element.querySelector(`select#steplist [data-id="${config.id}"]`);
          if (option instanceof HTMLOptionElement) {
            option.dataset.serialized = JSON.stringify(config);
          }
        }
      }
    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
      if (this.#reject) this.#reject(err as Error);
      this.cleanup();
    }
  }

  protected cleanup() {
    this.#reject = undefined;
    this.#resolve = undefined;
  }

  public static async ClearSteps(this: TransitionBuilder) {
    const confirmed = await confirm("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE", localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE"));
    if (!confirmed) return;
    const stepList = this.element.querySelector(`#transition-step-list`);
    if (stepList instanceof HTMLElement) stepList.innerHTML = "";

    this.setEnabledButtons();
  }

  public static async SelectStep(this: TransitionBuilder, e: Event, elem: HTMLElement) {
    if (elem instanceof HTMLSelectElement) {
      const selectedItem = elem.options[elem.selectedIndex];
      if (selectedItem instanceof HTMLOptionElement && selectedItem.dataset.id) await this.selectItem(selectedItem.dataset.id);
    }
  }

  public static async AddStep(this: TransitionBuilder) {
    try {
      const key = await addStepDialog();
      if (!key) return;

      const step = getStepClassByKey(key);
      if (!step) throw new InvalidTransitionError(key);

      const id = foundry.utils.randomID();
      await this.upsertStepButton({
        ...step.DefaultSettings,
        id
      });
      await this.selectItem(id);
      this.setEnabledButtons();
    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
      if (this.#reject) this.#reject(err as Error);
      this.cleanup();
    }
  }

  public async selectItem(id: string) {
    try {
      const option = this.element.querySelector(`select#stepList option[data-id="${id}"]`);
      if (!(option instanceof HTMLOptionElement)) return;

      const serialized = option.dataset.serialized as string;
      const deserialized = JSON.parse(serialized) as TransitionConfiguration;

      const step = getStepClassByKey(deserialized.type);
      if (!step) throw new InvalidTransitionError(deserialized.type);

      const content = await step.RenderTemplate({
        ...deserialized,
        isV1: false
      } as TransitionConfiguration);

      const config = this.element.querySelector(`[data-role="transition-config"]`);
      if (!(config instanceof HTMLElement)) return;

      config.innerHTML = content;
      this.setEnabledButtons();
    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
      if (this.#reject) this.#reject(err as Error);
      this.cleanup();
    }
  }

  public static Cancel(this: TransitionBuilder) {
    void this.close();
    if (this.#resolve) this.#resolve();

    this.#resolve = undefined;
    this.#reject = undefined;
  }

  public static onSubmit(this: TransitionBuilder, e: Event | SubmitEvent, elem: HTMLFormElement, data: FormDataExtended) {
    const formData = foundry.utils.expandObject(data.object) as Record<string, unknown>;
    delete formData.step;
    delete formData.stepList;

    const sequence: TransitionConfiguration[] = [];

    const stepOptions = elem.querySelectorAll(`select#stepList option`);
    for (const option of stepOptions) {
      if (option instanceof HTMLOptionElement) {
        const serialized = option.dataset.serialized;
        if (typeof serialized === "string" && serialized) {
          const deserialized = JSON.parse(serialized) as TransitionConfiguration;
          if (deserialized) sequence.push(deserialized);
        }
      }
    }

    formData.sequence = sequence;
    if (this.#resolve) {
      this.#resolve({
        scene: formData.scene as string,
        sequence
      });
    }
  }

  protected setEnabledButtons() {
    const sequence = buildTransitionFromForm($(this.element));

    // Export
    const exportButton = this.element.querySelector(`[data-action="exportJson"]`);
    if (exportButton instanceof HTMLElement) {
      if (sequence.length) exportButton.classList.remove("disabled");
      else exportButton.classList.add("disabled");
    }

    // Clear
    const clearButton = this.element.querySelector(`[data-action="clearSteps"]`);
    if (clearButton instanceof HTMLElement) {
      if (sequence.length) clearButton.classList.remove("disabled");
      else clearButton.classList.add("disabled");
    }

    // Transition
    const okButton = this.element.querySelector(`[data-action="ok"]`)
    if (okButton instanceof HTMLButtonElement) okButton.disabled = sequence.length === 0;

    // Remove
    const removeButton = this.element.querySelector(`[data-action="deleteStep"]`);
    if (removeButton instanceof HTMLButtonElement) {
      const idElem = this.element.querySelector(`[data-role="transition-config"] input[name="step.id"]`);
      const label = removeButton.querySelector(`[data-role="delete-step-label"]`);
      if (idElem instanceof HTMLInputElement) {
        removeButton.disabled = false;
        const option = this.element.querySelector(`[data-action="selectStep"] option[data-id="${idElem.value}"]`);
        const label = removeButton.querySelector(`[data-role="delete-step-label"]`);
        if (label instanceof HTMLElement) {
          if (option instanceof HTMLOptionElement) {
            const deserialized = JSON.parse(option.dataset.serialized as string) as TransitionConfiguration;
            label.innerText = localize("BATTLETRANSITIONS.SCENECONFIG.BUTTONS.REMOVE", { name: deserialized.label ?? deserialized.type });
          } else {
            label.innerText = localize("BATTLETRANSITIONS.SCENECONFIG.BUTTONS.REMOVE", { name: "" });
          }
        }

      } else {
        removeButton.disabled = true;
        if (label instanceof HTMLElement) label.innerText = localize("BATTLETRANSITIONS.SCENECONFIG.BUTTONS.REMOVE", { name: "" });
      }
    }
  }

  public static async ImportJSON(this: TransitionBuilder) {
    try {
      await importSequence(this.element);
      // const sequence = await ImportJSON(this.element);
      // if (!sequence) return;

      // const stepList = this.element.querySelector(`#transition-step-list`);
      // // Remove all steps
      // if (stepList instanceof HTMLElement) stepList.innerHTML = "";
      // for (const step of sequence)
      //   await this.upsertStepButton(step);

    } catch (err) {
      ui.notifications?.error((err as Error).message, { localize: true });
      if (this.#reject) this.#reject(err as Error);
      this.cleanup();
    } finally {
      this.setEnabledButtons();
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected _onRender(context: { [x: string]: undefined; }, options: { force?: boolean | undefined; position?: { top?: number | undefined; left?: number | undefined; width?: number | "auto" | undefined; height?: number | "auto" | undefined; scale?: number | undefined; zIndex?: number | undefined; } | undefined; window?: { title?: string | undefined; icon?: string | false | undefined; controls?: boolean | undefined; } | undefined; parts?: string[] | undefined; isFirstRender?: boolean | undefined; }): void {
    this.setEnabledButtons();

    this.#closed = new Promise<BuilderResponse | undefined>((resolve, reject) => {
      this.#reject = reject;
      this.#resolve = resolve;
    });
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async upsertStepButton(config: TransitionConfiguration) {
    try {
      const step = getStepClassByKey(config.type);
      if (!step) throw new InvalidTransitionError(config.type);

      const list = this.element.querySelector(`#stepList`);
      if (!(list instanceof HTMLSelectElement)) return;

      // const sequence = [...buildTransitionFromForm($(this.element)), config];
      // const duration = await step.getDuration(config, sequence);

      const actualConfig = {
        ...step.DefaultSettings,
        ...config
      };

      if (list.querySelector(`option[value="${config.id}"]`) instanceof HTMLOptionElement) {
        const option = list.querySelector(`option[value="${config.id}]`) as HTMLOptionElement
        option.dataset.serialized = JSON.stringify(actualConfig);
        option.dataset.type = actualConfig.type;
        option.value = option.dataset.serialized;
        option.dataset.id = actualConfig.id;
        // option.dataset.calculatedDuration = duration.toString();
        option.innerText = localize(`BATTLETRANSITIONS.${step.name}.NAME`);
      } else {
        const option = document.createElement("option");
        option.dataset.serialized = JSON.stringify(actualConfig);
        option.dataset.type = actualConfig.type;
        // option.dataset.calculatedDuration = duration.toString();
        option.value = option.dataset.serialized;
        option.dataset.id = actualConfig.id;
        option.innerText = localize(`BATTLETRANSITIONS.${step.name}.NAME`);

        list.appendChild(option);
      }


      this.setEnabledButtons();
    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
      if (this.#reject) this.#reject(err as Error);
      this.cleanup();
    }
  }

  protected async updateTotalDuration() {
    const sequence = buildTransitionFromForm($(this.element));
    const totalDuration = await sequenceDuration(sequence);
    const durationElement = this.element.querySelector(`#total-duration`);
    if (durationElement instanceof HTMLElement)
      durationElement.innerHTML = localize("BATTLETRANSITIONS.SCENECONFIG.TOTALDURATION", { duration: formatDuration(totalDuration) });
  }

  public static ExportJSON(this: TransitionBuilder) {
    const sequence = buildTransitionFromForm($(this.element));
    downloadJSON(sequence, `${localize("BATTLETRANSITIONS.COMMON.TRANSITION")}.json`);
  }

  protected async _prepareContext(options: { force?: boolean | undefined; position?: { top?: number | undefined; left?: number | undefined; width?: number | "auto" | undefined; height?: number | "auto" | undefined; scale?: number | undefined; zIndex?: number | undefined; } | undefined; window?: { title?: string | undefined; icon?: string | false | undefined; controls?: boolean | undefined; } | undefined; parts?: string[] | undefined; isFirstRender?: boolean | undefined; }): Promise<EmptyObject> {
    const context = await super._prepareContext(options) as Record<string, unknown>;

    // context.scenes = game?.scenes?.contents.map(scene => ({ id: scene.id, uuid: scene.uuid, name: scene.name })) ?? [];
    context.scenes = Object.fromEntries((game?.scenes?.contents.map(scene => [scene.id, scene.name])) ?? []);
    context.oldScene = game?.scenes?.current?.id ?? "";


    context.buttons = [
      { type: "button", icon: "fas fa-times", label: "Cancel", action: "cancel" },
      { type: "submit", icon: "fas fa-play", label: "BATTLETRANSITIONS.DIALOGS.BUTTONS.TRANSITION", action: "ok" }
    ]

    return context as EmptyObject;
  }
}