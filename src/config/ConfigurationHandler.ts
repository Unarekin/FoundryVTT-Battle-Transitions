import { InvalidElementError, InvalidTransitionError } from "../errors";
import { TransitionConfigHandler } from "../interfaces";
import { localize, shouldUseAppV2 } from "../utils";
import { FadeConfigHandler } from './FadeConfigHandler';
import { LinearWipeConfigHandler } from './LinearWipeConfigHandler';

const CONFIG_HANDLERS: TransitionConfigHandler<object>[] = [
  new FadeConfigHandler(),
  new LinearWipeConfigHandler()
];


export class ConfigurationHandler {
  #dialog: Application;
  #scene: Scene;
  #addStepDialog: Application | null = null;

  private tabName: string = "battle-transitions";
  private icon: string[] = ["fas", "crossed-swords", "fa-fw", "icon"];

  public get appId() { return this.#dialog.appId; }
  public get rootElement() { return $(this.#dialog.element); }
  public get addStepDialogElement() { return this.#addStepDialog ? $(this.#addStepDialog.element) : null; }

  private updateConfiguration() {
    this.rootElement.find("[data-transition-id]").each((i, element) => {
      console.log(`Transition element ${i}: ${element.dataset.transitionId}`);
    });
  }

  private addEventListeners() {

    // Add step button handler
    this.rootElement.find("button[data-action='add-step']").on("click", this.onAddStep.bind(this));

    // Save changes button hook
    this.rootElement.find("button[type='submit']").on("click", () => { void this.updateConfiguration(); });


    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ColorPicker.install();
  }

  private onAddStep(e: JQuery.ClickEvent) {
    e.preventDefault();
    void ((shouldUseAppV2() && foundry.applications.api.DialogV2) ? this.addStepDialogV2() : this.addStepDialog());
  }

  private resizeDialog() {
    this.#dialog.activateTab("basic");
    this.#dialog.activateTab(this.tabName);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private addStepEventListeners(element: JQuery<HTMLElement>, config: object = {}) {
    element.find("[data-action='remove']").on("click", () => {
      const key = element.data("transition-type") as string ?? ""
      const handler = CONFIG_HANDLERS.find(elem => elem.key === key);
      if (!handler) throw new InvalidTransitionError(key);

      void Dialog.confirm({
        content: localize("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM", { name: localize(handler.name) }),
      }).then(value => {
        if (value) {
          element.remove();
          this.resizeDialog();
        }
      })
        ;
    });

    element.find("[data-action='configure']").on("click", () => {
      const key = element.data("transition-type") as string ?? "";
      const handler = CONFIG_HANDLERS.find(elem => elem.key === key);
      if (!handler) throw new InvalidTransitionError(key);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const flag = element.data("flag") ?? handler.defaultSettings;

      void this.configureStep(key, flag);
    })
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private addConfigureStepEventListeners(html: JQuery<HTMLElement>, flag: object = {}) {
    html.find("input[type='text'],input[type='number']").on("focus", e => {

      (e.currentTarget as HTMLInputElement).select();
    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ColorPicker.install();
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private async configureStep(key: string, flag: any = {}) {
    const handler = CONFIG_HANDLERS.find(item => item.key === key);
    if (!handler) throw new InvalidTransitionError(key);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const content = await handler.renderTemplate(flag);

    await Dialog.wait({
      title: localize("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE", { name: localize(handler.name) }),
      content,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      render: html => { this.addConfigureStepEventListeners(html, flag); },
      default: 'ok',
      buttons: {
        cancel: {
          icon: "<i class='fas fa-times'></i>",
          label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL")
        },
        ok: {
          icon: "<i class='fas fa-check'></i>",
          label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
          callback: html => {
            const flag = handler.createFlagFromHTML(html);
            void this.addUpdateTransitionStep(key, flag);
          }
        }
      }
    })

  }




  private async addUpdateTransitionStep(key: string, config: object = {}) {
    const handler = CONFIG_HANDLERS.find(item => item.key === key);
    if (!handler) throw new InvalidTransitionError(key);


    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
      ...(config ?? {}),
      name: localize(handler?.name),

      summary: handler.generateSummary(config),
      type: key,
      flag: JSON.stringify(config)
    });

    const appended = $(content);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
    const extant = this.rootElement.find(`[data-id="${(config as any).id}"]`);
    if (extant.length) extant.replaceWith(appended);
    else this.rootElement.find("#transition-step-list").append(appended);

    this.addStepEventListeners(appended, config);

    this.resizeDialog();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ColorPicker.install();

  }

  private async getRenderedDialogTemplate() {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/add-step.hbs`, {
      transitionTypes: CONFIG_HANDLERS.map(handler => ({ key: handler.key, name: handler.name }))
    });
  }


  private onAddStepDialogRender() {
    if (!this.addStepDialogElement) throw new InvalidElementError();

    this.addStepDialogElement.find("#add-step-form button[data-transition]").on("click", e => {
      e.preventDefault();

      const key = e.currentTarget.dataset.transition ?? "";
      void this.#addStepDialog?.close();
      const handler = CONFIG_HANDLERS.find(item => item.key === key);
      if (!handler) throw new InvalidTransitionError(key);

      void this.configureStep(key, handler.defaultSettings);
      // void this.addTransitionStep(key, {});
    })
  }


  private async addStepDialog(): Promise<void> {
    // const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/add-step.hbs`, {});
    const content = await this.getRenderedDialogTemplate();


    const dialog = new Dialog({
      title: localize("BATTLETRANSITIONS.SCENECONFIG.ADDSTEPDIALOG.TITLE"),
      content,
      render: () => { this.onAddStepDialogRender(); },
      buttons: {
        cancel: {
          label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
          icon: "<i class='fas fa-times'></i>"
        }
      }
    });
    this.#addStepDialog = dialog;
    dialog.render(true);

  }

  private async addStepDialogV2(): Promise<void> {
    // const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/add-step.hbs`, {});
    const content = await this.getRenderedDialogTemplate();


    void foundry.applications.api.DialogV2.wait({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-explicit-any
      window: ({ title: "BATTLETRANSITIONS.SCENECONFIG.ADDSTEPDIALOG.TITLE" } as any),
      rejectClose: false,
      render: (e: Event) => {
        this.#addStepDialog = e.target as unknown as Application;
        this.onAddStepDialogRender();
      },
      content,
      buttons: [
        {
          label: "<i class='fas fa-times'></i> " + localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
          action: "cancel"
        }
      ]
    })
      .then(action => { return action === "cancel" ? null : action; })
      ;
  }

  private async inject() {
    const navBar = this.rootElement.find("nav.sheet-tabs.tabs[data-group='main']");
    const link = document.createElement("a");
    link.classList.add("item");
    link.dataset.tab = this.tabName;
    const icon = document.createElement("i");
    icon.classList.add(...this.icon);

    link.appendChild(icon);
    link.innerHTML += " " + localize("BATTLETRANSITIONS.SCENECONFIG.TAB");

    navBar.append(link);

    const transitionConfig = this.#scene.getFlag(__MODULE_ID__, "config");

    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, transitionConfig);
    this.rootElement.find("footer.sheet-footer").before(`<div class="tab" data-group="main" data-tab="${this.tabName}">${content}</div>`);
    this.addEventListeners();
  }

  constructor(dialog: Application, scene: Scene) {
    this.#dialog = dialog;
    this.#scene = scene;
    void this.inject();
  }
}