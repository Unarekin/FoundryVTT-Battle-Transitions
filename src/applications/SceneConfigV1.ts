import { ConfigurationHandler } from "../ConfigurationHandler";
import { addStepDialog, confirm } from "../dialogs";
import { InvalidTransitionError } from "../errors";
import { SceneConfiguration } from "../interfaces";
import { getStepClassByKey, localize, log } from "../utils";


export function SceneConfigMixin(Base: typeof SceneConfig) {
  return class extends Base {

    _config: SceneConfiguration | null = null;

    async _renderInner(data: ReturnType<this["getData"]>): Promise<JQuery<HTMLElement>> {
      const html = await super._renderInner(data);


      console.log("Config:", this._config);
      // Append tab
      html
        .find(`nav.tabs[data-group="main"]`)
        .append(
          $("<a>")
            .addClass("item")
            .attr("data-tab", "transition")
            .append(`<i class="fa-solid bt-icon crossed-swords fa-fw v12"></i> ${localize("SCENE.TABS.SHEET.transition")}`)
        );

      const content = await renderTemplate(`modules/${__MODULE_ID__}/templates/scene-config.hbs`, {
        isV1: true,
        transition: this._config,
        canCreateMacro: Macro.canUserCreate(game.user as User)
      });

      html.find(`.sheet-footer`)
        .before(
          $("<div>")
            .addClass("tab")
            .attr("data-tab", "transition")
            .append(content)
        )


      return html;
    }

    async removeStep(e: JQuery.ClickEvent): Promise<void> {
      try {
        e.preventDefault();
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        const id = e.currentTarget.dataset.step as string ?? "";
        if (!id) throw new InvalidTransitionError(typeof id === "string" ? id : typeof id);


        if (!this._config) this._config = foundry.utils.deepClone(ConfigurationHandler.GetSceneConfiguration(this.object));

        const step = this._config.sequence.find(item => item.id === id);
        if (!step) throw new InvalidTransitionError(id);

        const stepClass = getStepClassByKey(step.type);
        if (!stepClass) throw new InvalidTransitionError(step.type);

        const name = game.i18n?.localize(`BATTLETRANSITIONS.${stepClass.name}.NAME`)

        const confirmed = await confirm(
          game.i18n?.format("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name }) ?? "",
          game.i18n?.format("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name }) ?? ""
        );
        if (!confirmed) return;

        const index = this._config.sequence.findIndex(item => item.id === id);
        if (index !== -1) {
          this._config.sequence.splice(index, 1);
          this.render()
        }
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    async clearSteps(): Promise<void> {
      try {
        if (!this._config) return;

        const confirmed = await confirm(
          "BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE",
          game.i18n?.localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE") ?? ""
        );
        if (!confirmed) return;

        this._config.sequence.splice(0, this._config.sequence.length);
        this.render();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    async addStep(): Promise<void> {
      try {
        const result = await addStepDialog();
        log("Add:", result);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    render(force?: boolean, options?: Application.RenderOptions<DocumentSheetOptions<Scene>>): this {
      if (force) this._config = foundry.utils.deepClone(ConfigurationHandler.GetSceneConfiguration(this.object));
      return super.render(force, options);
    }

    activateListeners(html: JQuery<HTMLElement>): void {
      super.activateListeners(html);

      html.find(`[data-action="removeStep"]`).on("click", e => { void this.removeStep(e); });
      html.find(`[data-action="clearSteps"]`).on("click", () => { void this.clearSteps(); });
      html.find(`[data-action="addStep"]`).on("click", () => { void this.addStep(); });
    }

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);
      console.log("SceneConfig constructor");
    }
  }
}
