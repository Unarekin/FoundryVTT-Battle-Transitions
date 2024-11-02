import { InvalidTransitionError } from "../errors";
import { TransitionBuilderOptions } from "../interfaces";
import { TransitionConfiguration } from "../steps";
import { confirmDialog, getStepClassByKey, localize, log } from "../utils";
import { AddTransitionStepDialog } from "./AddTransitionStep";
import { EditTransitionStepDialog } from "./EditTransitionStep";


export class TransitionBuilderApplicationV1 extends Application {
  constructor(options?: Partial<TransitionBuilderOptions>) {
    super(options);
  }

  static get defaultOptions() {
    return foundry.utils.mergeObject(
      super.defaultOptions,
      {
        width: 500,
        resizable: true,
        popOut: true,
        template: `/modules/${__MODULE_ID__}/templates/transition-builder.hbs`,
        id: `transition-builder`,
        title: localize("BATTLETRANSITIONS.TRANSITIONBUILDER.TITLE")
      }
    )
  }

  getData(options?: Partial<ApplicationOptions>): object {
    const opt = {
      ...options,
      scenes: game.scenes?.contents.reduce((prev, curr) => {
        if (curr.id === game.scenes?.current?.id) return prev;
        return [
          ...prev,
          { id: curr.id, name: curr.name }
        ]
      }, [] as { id: string, name: string }[]) ?? []
    }
    log("Options:", opt);
    return opt;
  }

  activateListeners(html: JQuery<HTMLElement>): void {
    super.activateListeners(html);
    html.find(`button[data-action="add-step"]`).on("click", e => {
      e.preventDefault();
      AddTransitionStepDialog.add()
        .then(config => {
          if (config) return this.addTransitionStep(config, html, this);
        }).catch((err: Error) => {
          ui.notifications?.error(err.message, { console: false });
          throw err;
        });
    })
  }

  private async addTransitionStep(config: TransitionConfiguration, html: JQuery<HTMLElement>, app: Application) {
    const stepClass = getStepClassByKey(config.type);
    if (!stepClass) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);

    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
      ...config,
      name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${stepClass.name}`),
      type: config.type,
      flag: JSON.stringify(config)
    });

    const button = $(content);
    html.find("#transition-step-list").append(button);
    this.addStepEventListeners(button, config, app);
    this.setPosition();
    log(this);
    this.render();
  }

  private addStepEventListeners(button: JQuery<HTMLElement>, config: TransitionConfiguration, app: Application) {
    // Remove button
    button.find(`[data-action="remove"]`).on("click", () => { void this.removeStepHandler(button, config); });

    // Configure button
    button.find(`[data-action="configure"]`).on("click", () => { void this.configureStepHandler(button, config, app); })
  }


  private async removeStepHandler(button: JQuery<HTMLElement>, config: TransitionConfiguration) {
    const stepClass = getStepClassByKey(config.type);
    if (!stepClass) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);
    const localizedName = localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${stepClass.name}`);
    const confirm = await confirmDialog(localize("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM.TITLE", { name: localizedName }), localize("BATTLETRANSITIONS.SCENECONFIG.REMOVECONFIRM.CONTENT", { name: localizedName }));
    if (confirm) {
      button.remove();
      this.setPosition();
    }
  }

  private async configureStepHandler(button: JQuery<HTMLElement>, config: TransitionConfiguration, app: Application) {
    const newConfig = await EditTransitionStepDialog.EditStep(config);
    if (!newConfig) return;

    const stepClass = getStepClassByKey(config.type);
    if (!stepClass) throw new InvalidTransitionError(typeof config.type === "string" ? config.type : typeof config.type);

    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/step-item.hbs`, {
      ...config,
      name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${stepClass.name}`),
      type: config.type,
      flag: JSON.stringify(newConfig)
    });

    const appended = $(content);
    button.replaceWith(appended);
    this.addStepEventListeners(appended, newConfig, app);
  }


}

