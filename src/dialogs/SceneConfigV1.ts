import { ConfigurationHandler } from "../ConfigurationHandler";
import { InvalidTransitionError } from "../errors";
import { TransitionConfiguration } from "../steps";
import { downloadJSON, formDataExtendedClass, getStepClassByKey, localize } from "../utils";
import { importSequence, buildTransitionFromForm, setEnabledButtons, selectItem, setBackgroundType, deleteSelectedStep, addStep, createConfigurationOption, confirm, editSequenceItem, generateMacro, updateConfigurationOption, } from "./functions";
export async function injectSceneConfigV1(app: SceneConfig) {
  // Add tab
  const tab = `<a class="item" data-tab="transition">
    <i class="fa-solid bt-icon crossed-swords fa-fw v12"></i>
    ${localize("SCENE.TABS.SHEET.transition")}
  </a>`

  app.element.find(`nav.tabs[data-group="main"]`).append($(tab));

  // Add part
  const config = ConfigurationHandler.GetSceneConfiguration(app.document);

  const content = await renderTemplate(`modules/${__MODULE_ID__}/templates/scene-config.hbs`, {
    isV1: true,
    transition: config,
    canCreateMacro: Macro.canUserCreate(game.user as User)
  });
  app.element.find(`footer`).before($(content));

  if (Array.isArray(config.sequence) && config.sequence.length) {
    const stepList = app.element.find(`#stepList`)[0];

    if (stepList instanceof HTMLSelectElement) {
      for (const step of config.sequence) {
        const stepClass = getStepClassByKey(step.type);
        if (!stepClass) throw new InvalidTransitionError(step.type);
        const option = createConfigurationOption(step);
        option.innerText = localize(`BATTLETRANSITIONS.${stepClass.name}.NAME`);
        stepList.options.add(option);
      }
    }

  }

  setEnabledButtons(app.element[0]);
  addEventListeners(app.element[0], app);
}


function onChangeForm(form: HTMLFormElement) {
  const list = form.querySelector(`#stepList`);
  if (!(list instanceof HTMLSelectElement)) return

  const data = foundry.utils.expandObject(new (formDataExtendedClass())(form).object) as Record<string, unknown>
  // If a step is selected, make sure its configuration is reflected in the step list
  if (data.step) {
    const step = data.step as TransitionConfiguration;
    const option = list.querySelector(`option[data-id="${step.id}"]`);

    if (!(option instanceof HTMLOptionElement)) return
    if (!option.dataset.type) throw new InvalidTransitionError(option.dataset.type ?? typeof undefined);
    const typeClass = getStepClassByKey(option.dataset.type);

    if (!typeClass) throw new InvalidTransitionError(step.type);

    const config = {
      ...typeClass.DefaultSettings,
      id: option.dataset.id,
      ...typeClass.from(step).config
    }
    updateConfigurationOption(option, config as TransitionConfiguration);
  }
}

function addEventListeners(parent: HTMLElement, app: SceneConfig) {
  const form = parent.querySelector(`form`);
  if (form instanceof HTMLFormElement) {
    form.addEventListener("change", () => {
      onChangeForm(form);
    });
  }

  const importButton = parent.querySelector(`[data-action="importJson"]`);
  if (importButton instanceof HTMLElement) {
    importButton.addEventListener("click", () => {
      void importSequence(parent)
        .then(() => {
          setEnabledButtons(parent);
        })
        .catch((err: Error) => {
          console.error(err);
          ui.notifications?.error(err.message, { console: false, localize: true });
        });
    })
  }

  const exportButton = parent.querySelector(`[data-action="exportJson"]`);
  if (exportButton instanceof HTMLElement) {
    exportButton.addEventListener("click", () => {
      const sequence = buildTransitionFromForm($(parent));
      downloadJSON(sequence, `${localize("BATTLETRANSITIONS.COMMON.TRANSITION")}.json`);
    });
  }

  const saveMacro = parent.querySelector(`[data-action="saveMacro"]`);
  if (saveMacro instanceof HTMLElement) {
    saveMacro.addEventListener("click", () => {
      const sequence = buildTransitionFromForm($(parent));
      const formData = foundry.utils.expandObject(new (formDataExtendedClass())(app.form as HTMLFormElement).object) as Record<string, unknown>
      const macro = generateMacro(sequence, formData.users as string[] ?? [], app.document);
      void Macro.createDialog({ type: "script", command: macro, img: `modules/${__MODULE_ID__}/assets/icons/crossed-swords.svg` });
    })
  }

  const stepList = parent.querySelector(`#stepList`);
  if (stepList instanceof HTMLSelectElement) {
    let lastSelected = "";
    stepList.addEventListener("click", () => {
      const selectedItem = stepList.options[stepList.selectedIndex];
      if (selectedItem instanceof HTMLOptionElement && selectedItem.dataset.id && selectedItem.dataset.id !== lastSelected) {
        lastSelected = selectedItem.dataset.id ?? "";
        selectItem(parent, selectedItem.dataset.id)
          .then(() => {
            setConfigEventListeners(parent);
            app.activateTab("transition");
          })
          .catch((err: Error) => {
            console.error(err);
            ui.notifications?.error(err.message, { console: false, localize: true });
          })
      }
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ($(stepList) as any).dragOptions({});
  }

  const deleteButton = parent.querySelector(`[data-action="deleteStep"]`);
  if (deleteButton instanceof HTMLButtonElement) {
    deleteButton.addEventListener("click", () => {
      deleteSelectedStep(parent)
        .then(() => { app.activateTab("transition"); })
        .catch((err: Error) => {
          console.error(err);
          ui.notifications?.error(err.message, { console: false, localize: true });
        });
    })
  }

  const addButtons = parent.querySelectorAll(`[data-action="addStep"]`);
  for (const button of addButtons) {
    button.addEventListener("click", () => {
      addStep(parent)
        .then((config: TransitionConfiguration | undefined) => {
          if (config) return selectItem(parent, config.id);
        })
        .then(() => {
          setConfigEventListeners(parent);
          app.activateTab("transition");
        })
        .catch((err: Error) => {
          console.error(err);
          ui.notifications?.error(err.message, { console: false, localize: true });
        })
    })
  }

  const clearButton = parent.querySelector(`[data-action="clearSteps"]`);
  if (clearButton instanceof HTMLElement) {
    clearButton.addEventListener("click", () => {
      confirm(
        "BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE",
        localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE")
      )
        .then(confirmed => {
          if (confirmed) {
            const stepList = parent.querySelector(`#stepList`);
            if (stepList instanceof HTMLElement) stepList.innerHTML = "";
            const edit = parent.querySelector(`[data-role="transition-config"]`);
            if (edit instanceof HTMLElement) edit.innerHTML = "";
          }
        })
        .catch((err: Error) => {
          console.error(err);
          ui.notifications?.error(err.message, { console: false, localize: true });
        })


    })
  }

  const submitButton = parent.querySelector(`footer button[type="submit"]`);
  if (submitButton instanceof HTMLButtonElement) {
    submitButton.addEventListener("click", () => {
      const data = foundry.utils.expandObject(new (formDataExtendedClass())(app.form as HTMLFormElement).object) as Record<string, unknown>;
      const sequence = buildTransitionFromForm($(parent));

      if (data.step) {
        const configElem = parent.querySelector(`[data-role="transition-config"] [data-transition-type]`);
        if (configElem instanceof HTMLElement) {
          const stepClass = getStepClassByKey(configElem.dataset.transitionType ?? "");
          if (!stepClass) throw new InvalidTransitionError(configElem.dataset.transitionType ?? "");

          const config = {
            ...stepClass.DefaultSettings,
            ...stepClass.from(app.form as HTMLFormElement).config
          };

          const index = sequence.findIndex(item => item.id === config.id);

          // Really probably shouldn't be adding one here.
          if (index === -1) sequence.push(config);
          else sequence.splice(index, 1, config);
        }
      }

      ConfigurationHandler.SetSceneConfiguration(app.document, {
        ...data.transition as Partial<TransitionConfiguration>,
        sequence
      })
        .catch((err: Error) => {
          console.error(err);
          ui.notifications?.error(err.message, { console: false, localize: true });
        })
    })
  }
}


function setConfigEventListeners(parent: HTMLElement) {
  const bgSelect = parent.querySelector(`select[name="step.backgroundType"]`);

  if (bgSelect instanceof HTMLSelectElement) {
    setBackgroundType(parent, bgSelect.value as "image" | "color" | "overlay");
    bgSelect.addEventListener("input", () => { setBackgroundType(parent, bgSelect.value as "image" | "color" | "overlay"); });
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const tabs = new (game?.release?.isNewer("13") ? (foundry.applications as any).ux.Tabs as typeof Tabs : Tabs)({
    contentSelector: ".tab-content",
    navSelector: `.tabs [data-group="config"]`,
    initial: "basics"
  });
  tabs.bind(parent);

  const editSequenceItems = parent.querySelectorAll(`[data-action="editSequence"]`);
  for (const item of editSequenceItems) {
    item.addEventListener("click", () => {
      try {
        if (item instanceof HTMLElement) {
          const index = item.dataset.index as string;
          void editSequenceItem(parent, parseInt(index));
        }
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false, localize: false });
      }
    })
  }
}