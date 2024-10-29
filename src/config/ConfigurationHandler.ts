/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { InvalidElementError, InvalidTransitionError } from "../errors";
import { TransitionConfigHandler, TransitionStep } from "../interfaces";
import { localize, shouldUseAppV2 } from "../utils";
import { FadeConfigHandler } from './FadeConfigHandler';
import { LinearWipeConfigHandler } from './LinearWipeConfigHandler';
import { BilinearWipeConfigHandler } from './BilinearWipeConfigHandler';
import { ChromaKeyConfigHandler } from './ChromaKeyConfigHandler';
import { ClockWipeConfigHandler } from './ClockWipeConfigHandler';
import { DiamondTransitionConfigHandler } from './DiamondTransitionConfigHandler';
import { FireDissolveConfigHandler } from './FireDissolveConfigHandler';
import { RadialWipeConfigHandler } from './RadialWipeConfigHandler';
import { SpotlightWipeConfigHandler } from './SpotlightWipeConfigHandler';
import { TextureSwapConfigHandler } from './TextureSwapConfigHandler';
import { WaitConfigHandler } from './WaitConfigHandler';
import { SoundConfigHandler } from './SoundConfigHandler';
import { VideoConfigHandler } from './VideoConfigHandler';
import { InvertConfigurationHandler } from './InvertConfigurationHandler';
import { MeltConfigHandler } from "./MeltConfigHandler";
import { AngularWipeConfigHandler } from "./AngularWipeConfigHandler";
import { FlashConfigHandler } from "./FlashConfigHandler";

new ChromaKeyConfigHandler();

const CONFIG_HANDLERS: TransitionConfigHandler<any>[] = [
  new AngularWipeConfigHandler(),
  new FadeConfigHandler(),
  new LinearWipeConfigHandler(),
  new BilinearWipeConfigHandler(),
  // new ChromaKeyConfigHandler(),
  new ClockWipeConfigHandler(),
  new DiamondTransitionConfigHandler(),
  new FireDissolveConfigHandler(),
  new FlashConfigHandler(),
  new InvertConfigurationHandler(),
  new MeltConfigHandler(),
  new RadialWipeConfigHandler(),
  new SpotlightWipeConfigHandler(),
  new TextureSwapConfigHandler(),
  new WaitConfigHandler(),
  new SoundConfigHandler(),
  new VideoConfigHandler(),
].sort((a, b) => localize(a.name).localeCompare(localize(b.name)))


export class ConfigurationHandler {
  #dialog: Application;
  #scene: Scene | null = null;
  #addStepDialog: Application | null = null;

  private stepKey = "steps";
  private configKey = "config";
  private tabName: string = "battle-transitions";
  private icon: string[] = ["fas", "crossed-swords", "fa-fw", "bt-icon"];

  public get appId() { return this.#dialog.appId; }
  public get rootElement() { return $(this.#dialog.element); }
  public get addStepDialogElement() { return this.#addStepDialog ? $(this.#addStepDialog.element) : null; }

  public generateSequence(): TransitionStep[] {
    const flags: TransitionStep[] = [];

    // Generate steps
    this.rootElement.find(".step-config-item[data-transition-type]").each((i, element) => {
      const flagData = $(element).data("flag") as unknown;
      const transitionType = $(element).data("transition-type") as unknown;

      if (!transitionType || typeof transitionType !== "string" || typeof flagData !== "object") throw new InvalidTransitionError("");

      flags.push({
        ...(flagData),
        type: transitionType
      });
    });
    return flags;
  }

  private updateConfiguration() {

    const flags = this.generateSequence();

    // void (this.#scene as any).setFlag(__MODULE_ID__, this.stepKey, flags);

    const container = this.rootElement.find(`[data-tab="${__MODULE_ID__}"]`);

    const config = {
      autoTrigger: container.find("input#auto-trigger").is(":checked")
    }

    if (this.#scene) {
      void Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (this.#scene as any).setFlag(__MODULE_ID__, this.stepKey, flags),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
        (this.#scene as any).setFlag(__MODULE_ID__, this.configKey, config)
      ]);
    }

  }

  private addEventListeners() {
    // Add step button handler
    this.rootElement.find("button[data-action='add-step']").on("click", e => {
      e.preventDefault();
      if ($(e.currentTarget).is(":focus")) return this.onAddStep(e);
    });

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    (this.rootElement.find("#transition-step-list") as any).sortable({
      handle: ".drag-handle",
      containment: "parent",
      axis: "y"
    });

    // Save changes button hook
    this.rootElement.find("button[type='submit']").on("click", () => {
      this.updateConfiguration();
    });


    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ColorPicker.install();
  }

  private onAddStep(e: JQuery.ClickEvent) {
    e.preventDefault();
    void ((shouldUseAppV2() && foundry.applications.api.DialogV2) ? this.addStepDialogV2() : this.addStepDialog());
  }

  private resizeDialog() {
    // console.log("Active tab:", this.rootElement.find(".item.active[data-tab]")[0]);
    const activeTab = this.rootElement.find(".item.active[data-tab]").data("tab") as string;
    if (activeTab === this.tabName) {
      this.#dialog.activateTab("basic");
      this.#dialog.activateTab(this.tabName);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private addStepEventListeners(element: JQuery<HTMLElement>, config: object = {}) {
    element.find("[data-action='remove']").on("click", () => {
      const key = element.data("transition-type") as string ?? ""
      const handler = CONFIG_HANDLERS.find(elem => elem.key === key);
      if (!handler) throw new InvalidTransitionError(key);
      if (shouldUseAppV2() && foundry.applications.api.DialogV2) {
        void foundry.applications.api.DialogV2.confirm({
          content: localize("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM", { name: localize(handler.name) }),

        }).then(value => {
          if (value) {
            element.remove();
            this.resizeDialog();
          }
        })
      } else {
        void Dialog.confirm({
          content: localize("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM", { name: localize(handler.name) }),
        }).then(value => {
          if (value) {
            element.remove();
            this.resizeDialog();
          }
        })
          ;
      }
    });

    element.find("[data-action='configure']").on("click", () => {
      const key = element.data("transition-type") as string ?? "";
      const handler = CONFIG_HANDLERS.find(elem => elem.key === key);
      if (!handler) throw new InvalidTransitionError(key);

      const flag = element.data("flag") ?? handler.defaultSettings;

      void this.configureStep(key, flag as object);
    })
  }



  private addConfigureStepEventListeners(html: JQuery<HTMLElement>, flag: any) {
    html.find("input[type='text'],input[type='number']").on("focus", e => {
      (e.currentTarget as HTMLInputElement).select();
    });

    // Handle background picker selection
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (flag.useImage) html.find("#backgroundColor").css("display", "none");
    else html.find("#backgroundImage").css("display", "none");

    html.find("#backgroundType").on("input", e => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const inputType = (e.currentTarget as any).value;
      if (inputType === "image") {
        html.find("#backgroundColor").css("display", "none");
        html.find("#backgroundImage").css("display", "");
      } else {
        html.find("#backgroundColor").css("display", "");
        html.find("#backgroundImage").css("display", "none");
      }

    })

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    ColorPicker.install();
  }

  private isFormValid(form: JQuery<HTMLFormElement>, flag: object, key: string) {
    const handler = CONFIG_HANDLERS.find(handler => handler.key === key);
    if (!handler) throw new InvalidTransitionError(key);
    if (typeof handler.validate === "function") return handler.validate(handler.createFlagFromHTML(form));
    else return true;
  }


  private addConfigureStepValidation(html: JQuery<HTMLElement>, flag: object, key: string) {

    const form = html.find(".step-config-item").parents("form");

    try {
      if (this.isFormValid($(form).parent(), flag, key)) {
        html.find("button[data-action='ok']").prop("disabled", false);
      } else {
        html.find("button[data-action='ok']").prop("disabled", true);
      }
    } catch {
      html.find("button[data-action='ok']").prop("disabled", true);
    }



    form.on("change", e => {
      try {
        if (this.isFormValid(($(e.currentTarget) as JQuery<HTMLFormElement>).parent(), flag, key)) {
          // Enable ok button
          html.find("button[data-action='ok']").prop("disabled", false);
        } else {
          // Disable ok button
          html.find("button[data-action='ok']").prop("disabled", true);
        }
      } catch {
        html.find("button[data-action='ok']").prop("disabled", true);
      }
    });
  }


  private async configureStep(key: string, flag: object = {}) {
    const handler = CONFIG_HANDLERS.find(item => item.key === key);
    if (!handler) throw new InvalidTransitionError(key);

    if (handler.skipConfig) {
      const config = handler.createFlagFromHTML();
      void this.addUpdateTransitionStep(key, config);
    } else {
      const content = await handler.renderTemplate(flag);

      if (shouldUseAppV2() && foundry.applications.api.DialogV2) {
        void foundry.applications.api.DialogV2.wait({

          window: ({ title: localize("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE", { name: localize(handler.name) }) } as any),
          content,
          render: (e, dialog) => {
            this.addConfigureStepEventListeners($(dialog), flag);
            this.addConfigureStepValidation($(dialog), flag, key);
          },
          buttons: [
            {
              label: "<i class='fas fa-times'></i> " + localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
              action: "cancel"
            },
            {
              label: "<i class='fas fa-check'></i> " + localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.OK"),
              action: "ok",
              default: true,
              // eslint-disable-next-line @typescript-eslint/require-await
              callback: async (e, button, dialog): Promise<void> => {
                const flag = handler.createFlagFromHTML($(dialog));
                void this.addUpdateTransitionStep(key, flag);
              }
            }
          ]
        });

      } else {
        await Dialog.wait({
          title: localize("BATTLETRANSITIONS.SCENECONFIG.EDITSTEPDIALOG.TITLE", { name: localize(handler.name) }),
          content,
          render: html => {
            this.addConfigureStepEventListeners($(html), flag);
            this.addConfigureStepValidation($(html), flag, key);
          },
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
    }
  }




  private async addUpdateTransitionStep(key: string, config: object = {}) {
    try {
      const handler = CONFIG_HANDLERS.find(item => item.key === key);
      if (!handler) throw new InvalidTransitionError(key);



      handler.validate(config);


      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (!(config as any).id) (config as any).id = foundry.utils.randomID();


      const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
        ...(config ?? {}),
        name: localize(handler?.name),

        summary: handler.generateSummary(config),
        type: key,
        flag: JSON.stringify(config)
      });

      const appended = $(content);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const extant = this.rootElement.find(`[data-id="${(config as any).id}"]`);
      if (extant.length) extant.replaceWith(appended);
      else this.rootElement.find("#transition-step-list").append(appended);

      this.addStepEventListeners(appended, config);

      this.resizeDialog();
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      ColorPicker.install();
    } catch (err) {
      ui.notifications?.error((err as Error).message);
    }

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
    if (game.release?.isNewer("12")) return this.injectV12();
    else return this.injectV11();
  }

  private async injectV11() {
    const navBar = this.rootElement.find("nav.sheet-tabs.tabs");
    const link = document.createElement("a");
    link.classList.add("item");
    link.dataset.tab = this.tabName;
    const icon = document.createElement("i");
    icon.classList.add(...this.icon);

    link.appendChild(icon);
    link.innerHTML += " " + localize("BATTLETRANSITIONS.SCENECONFIG.TAB");

    navBar.append(link);

    const transitionConfig = this.#scene ? this.#scene.getFlag(__MODULE_ID__, this.configKey) : {};
    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, transitionConfig);
    this.rootElement.find("button[type='submit']").before(`<div class="tab" data-tab="${this.tabName}">${content}</div>`);


    const steps = this.#scene ? this.#scene.getFlag(__MODULE_ID__, this.stepKey) as TransitionStep[] : [];
    if (Array.isArray(steps)) {
      for (const step of steps) {
        await this.addUpdateTransitionStep(step.type, step);
      }
    }
    this.addEventListeners();
  }

  private async injectV12() {

    const navBar = this.rootElement.find("nav.sheet-tabs.tabs[data-group='main']");
    const link = document.createElement("a");
    link.classList.add("item");
    link.dataset.tab = this.tabName;
    const icon = document.createElement("i");
    icon.classList.add(...this.icon);

    link.appendChild(icon);
    link.innerHTML += " " + localize("BATTLETRANSITIONS.SCENECONFIG.TAB");

    navBar.append(link);


    const transitionConfig = this.#scene ? this.#scene.getFlag(__MODULE_ID__, this.configKey) : {};

    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, transitionConfig);
    this.rootElement.find("footer.sheet-footer").before(`<div class="tab" data-group="main" data-tab="${this.tabName}">${content}</div>`);


    const steps = this.#scene ? this.#scene.getFlag(__MODULE_ID__, this.stepKey) as TransitionStep[] : [];
    if (Array.isArray(steps)) {
      for (const step of steps) {
        await this.addUpdateTransitionStep(step.type, step);
      }
    }


    this.addEventListeners();
  }

  constructor(dialog: Application, scene?: Scene) {
    this.#dialog = dialog;
    if (scene) this.#scene = scene;
    void this.inject();
  }
}