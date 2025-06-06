import { ConfigurationHandler } from "../ConfigurationHandler";
import { InvalidTransitionError } from "../errors";
import { SceneConfiguration } from "../interfaces";
import { BackgroundTransition, TransitionConfiguration } from "../steps";
import { downloadJSON, formDataExtendedClass, getStepClassByKey, localize } from "../utils";
import { buildTransitionFromForm, createConfigurationOption, importSequence, setEnabledButtons, setBackgroundType, selectItem, deleteSelectedStep, confirm, addStep, setTargetConfig, editSequenceItem, generateMacro } from "./functions";

export function injectSceneConfigV2() {

  // Inject configuration to SceneConfig application
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
  const config = (foundry.applications as any).sheets.SceneConfig
  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const parts = config.PARTS as Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart>;

  // Delete the footer, add our tab, then re-add the footer to ensure
  // that the footer part comes AFTER ours.
  const footer = parts.footer;
  delete parts.footer;
  parts.transition = {
    template: `modules/${__MODULE_ID__}/templates/scene-config.hbs`
  };
  parts.footer = footer;

  // Add tab
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  config.TABS.sheet.tabs.push({ id: "transition", icon: "fa-solid bt-icon crossed-swords fa-fw v13" });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type, @typescript-eslint/no-unsafe-member-access
  const actions = config.DEFAULT_OPTIONS.actions as Record<string, Function>;

  // Import JSON button
  actions.importJson = async function (this: foundry.applications.api.ApplicationV2) {
    try {
      await importSequence(this.element);
      setEnabledButtons(this.element);
    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
    }
  }

  // Export JSON button
  actions.exportJson = function (this: foundry.applications.api.ApplicationV2) {
    try {
      const sequence = buildTransitionFromForm($(this.element));
      downloadJSON(sequence, `${localize("BATTLETRANSITIONS.COMMON.TRANSITION")}.json`);
    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
    }
  }

  actions.saveMacro = function (this: SceneConfig) {
    try {
      const sequence = buildTransitionFromForm($(this.element));
      const formData = foundry.utils.expandObject(new (formDataExtendedClass())(this.form as HTMLFormElement).object) as Record<string, unknown>
      const macro = generateMacro(sequence, formData.users as string[] ?? [], this.document);
      void Macro.createDialog({ type: "script", command: macro, img: `modules/${__MODULE_ID__}/assets/icons/crossed-swords.svg` });

    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  // Add step button
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  actions.addStep = async function (this: foundry.applications.api.ApplicationV2, e: PointerEvent, elem: HTMLElement) {
    try {
      const config = await addStep(this.element);
      if (config) await selectItem(this.element, config.id);
      setEnabledButtons(this.element);
    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
    }
  }

  // Clear steps button
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  actions.clearSteps = async function (this: foundry.applications.api.ApplicationV2, e: PointerEvent, elem: HTMLElement) {
    try {
      const confirmed = await confirm(
        "BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE",
        localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE")
      );
      if (!confirmed) return;

      const stepList = this.element.querySelector(`select#stepList`);
      if (stepList instanceof HTMLSelectElement) stepList.innerHTML = "";

      const config = this.element.querySelector(`[data-role="transition-config"]`);
      if (config instanceof HTMLElement) config.innerHTML = "";

    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
    }
  }


  // Select step
  actions.selectStep = function (this: foundry.applications.api.ApplicationV2, e: PointerEvent, elem: HTMLSelectElement) {
    try {
      const selectedItem = elem.options[elem.selectedIndex];
      if (selectedItem instanceof HTMLOptionElement && selectedItem.dataset.id) void selectItem(this.element, selectedItem.dataset.id);
    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
    }
  }

  // Remove step button
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  actions.deleteStep = async function (this: foundry.applications.api.ApplicationV2, e: PointerEvent, elem: HTMLButtonElement) {
    try {
      await deleteSelectedStep(this.element);
    } catch (err) {
      console.error(err);
      ui.notifications?.error((err as Error).message, { console: false, localize: true });
    }
  }

  // Edit sequence for Parallel and Repeat
  actions.editSequence = async function (this: foundry.applications.api.ApplicationV2, e: PointerEvent, elem: HTMLElement) {
    try {
      const index = elem.dataset.index as string;
      await editSequenceItem(this.element, parseInt(index));
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  // Delete sequence for Parallel and Repeat
  // eslint-disable-next-line @typescript-eslint/require-await, @typescript-eslint/no-unused-vars
  actions.deleteSequence = async function (this: foundry.applications.api.ApplicationV2, e: PointerEvent, elem: HTMLElement) {
    try {
      // TODO
    } catch (err) {
      console.error(err);
      if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: true });
    }
  }

  // Add event listeners
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  libWrapper.register(__MODULE_ID__, "foundry.applications.sheets.SceneConfig.prototype._onRender", onRender);

  // On change
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  libWrapper.register(__MODULE_ID__, "foundry.applications.sheets.SceneConfig.prototype._onChangeForm", onChangeForm);

  // On submit
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  libWrapper.register(__MODULE_ID__, "foundry.applications.sheets.SceneConfig.prototype._onSubmitForm", onSubmitForm);

  // Prepare context
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  libWrapper.register(__MODULE_ID__, "foundry.applications.sheets.SceneConfig.prototype._prepareContext", prepareContext);


}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
async function prepareContext(this: foundry.applications.api.ApplicationV2, wrapped: Function, ...args: unknown[]) {
  const context = await wrapped(...args) as Record<string, unknown>

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
  const config = ConfigurationHandler.GetSceneConfiguration((this as any).document);

  context.transition = config;

  context.canCreateMacro = Macro.canUserCreate(game.user as User);
  return context;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function onRender(this: foundry.applications.api.ApplicationV2, wrapped: Function, context: Record<string, unknown>, options: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const render = wrapped(context, options);

  const stepList = this.element.querySelector(`#stepList`);
  if (stepList instanceof HTMLSelectElement) {
    stepList.innerHTML = "";

    // Set step list as re-orderable via drag and drop
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ($(stepList) as any).dragOptions({});

    const sequence: TransitionConfiguration[] = (context.transition as SceneConfiguration)?.sequence ?? [];
    for (const step of sequence) {
      const stepClass = getStepClassByKey(step.type);
      if (!stepClass) throw new InvalidTransitionError(step.type);

      const option = createConfigurationOption({
        ...stepClass.DefaultSettings,
        ...step
      });
      option.innerText = localize(`BATTLETRANSITIONS.${stepClass.name}.NAME`);
      stepList.options.add(option);
    }
  }

  setTargetConfig(this.element);

  setEnabledButtons(this.element);
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return render;
}



// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function onChangeForm(this: foundry.applications.api.ApplicationV2, wrapped: Function, ...args: unknown[]) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const change = wrapped(...args);


    const parsed = foundry.utils.expandObject(new (formDataExtendedClass())(this.element as HTMLFormElement).object) as Record<string, unknown>;
    const step = parsed.step as TransitionConfiguration | undefined;

    if (step) {
      const typeElem = this.element.querySelector(`[data-role="transition-config"] [data-transition-type]`);
      if (typeElem instanceof HTMLElement) {
        const stepType = typeElem.dataset.transitionType as string;
        const stepClass = getStepClassByKey(stepType);
        if (!stepClass) throw new InvalidTransitionError(stepType);

        const config = stepClass.from(this.element as HTMLFormElement).config;

        // const config = {
        //   ...stepClass.DefaultSettings,
        //   id: foundry.utils.randomID(),
        //   ...(step as Partial<TransitionConfiguration>),
        //   type: stepType
        // };

        const option = this.element.querySelector(`select#stepList [data-id="${config.id}"]`);
        if (option instanceof HTMLOptionElement) {
          option.value = JSON.stringify(config);
          option.dataset.serialized = JSON.stringify(config);
        }
      }
      setBackgroundType(this.element, (step as unknown as BackgroundTransition).backgroundType ?? "");
    }

    setEnabledButtons(this.element);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return change;
  } catch (err) {
    console.error(err);
    ui.notifications?.error((err as Error).message, { console: false, localize: true });
  }
}


// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function onSubmitForm(this: foundry.applications.api.ApplicationV2, wrapped: Function, ...args: unknown[]) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const val = wrapped(...args);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const form = (this as any).form as HTMLFormElement;
  if (form instanceof HTMLFormElement) {

    const data = foundry.utils.expandObject(new (formDataExtendedClass())(form).object) as Record<string, unknown>;
    //const data = foundry.utils.expandObject(new (formDataExtendedClass())(app.form as HTMLFormElement).object) as Record<string, unknown>;

    // Parse step list
    const sequence = buildTransitionFromForm($(this.element));

    if (data.step) {
      const configElem = form.querySelector(`[data-role="transition-config"] [data-transition-type]`);
      if (configElem instanceof HTMLElement) {
        const stepClass = getStepClassByKey(configElem.dataset.transitionType ?? "");
        if (!stepClass) throw new InvalidTransitionError(configElem.dataset.transitionType ?? "");

        const config = {
          ...stepClass.DefaultSettings,
          ...stepClass.from(form).config
        };

        const index = sequence.findIndex(item => item.id === config.id);
        if (index === -1) sequence.push(config);
        else sequence.splice(index, 1, config);
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    void ConfigurationHandler.SetSceneConfiguration((this as any).document as Scene, {
      ...data.transition as Partial<SceneConfiguration>,
      sequence
    }).catch((err: Error) => {
      console.error(err);
      ui.notifications?.error(err.message, { console: false, localize: true });
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return val;
}