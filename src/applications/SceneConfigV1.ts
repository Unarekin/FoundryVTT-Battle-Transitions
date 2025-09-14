import { ConfigurationHandler } from "../ConfigurationHandler";
import { confirm, generateMacro } from "./functions";
import { InvalidTransitionError, LocalizedError } from "../errors";
import { SceneConfiguration } from "../interfaces";
import { TransitionConfiguration } from "../steps";
import { formDataExtendedClass, getStepClassByKey, localize } from "../utils";
import { AddStepApplication } from "./AddStepApplication";



export function SceneConfigV1Mixin(Base: typeof SceneConfig) {
  return class extends Base {

    _config: SceneConfiguration | null = null;

    async _onSubmit(event: Event, options?: FormApplication.OnSubmitOptions): Promise<Partial<any>> {

      const form = this.element.find("form")[0];
      if (form) {
        const config: Record<string, unknown> = {};
        // Merge form data
        const data = foundry.utils.expandObject((new (formDataExtendedClass())(form)).object) as Record<string, unknown>;
        // Merge in our existing config
        foundry.utils.mergeObject(config, { transition: this._config });
        foundry.utils.mergeObject(config, data);


        // const data = foundry.utils.expandObject((new (formDataExtendedClass())(form)).object) as Record<string, unknown>;
        // foundry.utils.mergeObject(config, data);

        // if (this._config) foundry.utils.mergeObject(config, { transition: this._config });

        if (config.transition) {
          ConfigurationHandler
            .SetSceneConfiguration(this.document, config.transition as TransitionConfiguration)
            .catch((err: Error) => {
              console.error(err);
              ui.notifications?.error(err.message, { console: false })
            })
        }
      }

      return super._onSubmit(event, options);
    }

    async _renderInner(data: ReturnType<this["getData"]>): Promise<JQuery<HTMLElement>> {
      const html = await super._renderInner(data);

      // Append tab
      html
        .find(`nav.tabs[data-group="main"]`)
        .append(
          $("<a>")
            .addClass("item")
            .attr("data-tab", "transition")
            .append(`<i class="fa-solid bt-icon bt-crossed-swords fa-fw v12"></i> ${localize("SCENE.TABS.SHEET.transition")}`)
        );

      const content = await renderTemplate(`modules/${__MODULE_ID__}/templates/scene-config.hbs`, {
        transition: {
          isV1: true,
          transition: this._config,
          canCreateMacro: Macro.canUserCreate(game.user as User)
        }
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

    async editStep(e: JQuery.ClickEvent): Promise<void> {
      try {
        const id = (e.currentTarget as HTMLElement)?.dataset.step as string ?? "";
        if (!id) throw new InvalidTransitionError(id);

        const original = this._config?.sequence.find(config => config.id === id);
        if (!original) throw new InvalidTransitionError(id);

        const stepClass = getStepClassByKey(original.type);
        if (!stepClass) throw new InvalidTransitionError(original.type);
        if (stepClass.skipConfig) return;

        if (!stepClass.ConfigurationApplication) throw new LocalizedError("NOCONFIGAPP");


        const app = new stepClass.ConfigurationApplication(foundry.utils.deepClone({
          ...stepClass.DefaultSettings,
          ...original
        }), {
          newScene: this.document.uuid
        });
        const updated = await app.configure();
        if (updated && this._config?.sequence) {
          const index = this._config.sequence.findIndex(config => config.id === updated.id);
          if (index !== -1) this._config.sequence.splice(index, 1, updated);
          this.render();
        }
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    async addStep(): Promise<void> {
      try {
        const key = await AddStepApplication.add({ sequence: this._config?.sequence ?? [] });
        if (!key) return;

        const step = getStepClassByKey(key);
        if (!step) throw new InvalidTransitionError(key);
        let config: TransitionConfiguration | null = null;
        if (!step.skipConfig) {
          // Edit dialog
          if (step.ConfigurationApplication) {
            const app = new step.ConfigurationApplication(foundry.utils.mergeObject(
              foundry.utils.deepClone(step.DefaultSettings),
              { id: foundry.utils.randomID() }
            ),
              {
                newScene: this.document.uuid
              });
            config = await app.configure() ?? null;
          } else {
            throw new LocalizedError("NOCONFIGAPP");
          }
        } else {
          config = {
            ...step.DefaultSettings,
            id: foundry.utils.randomID()
          }
        }
        if (!config) return;
        if (this._config) this._config.sequence.push(config);
        this.render();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    async saveMacro() {
      try {
        if (!this._config?.sequence.length) return;
        const macro = generateMacro(this._config.sequence, [], this.document);
        await Macro.createDialog({ type: "script", command: macro, img: `modules/${__MODULE_ID__}/assets/icons/crossed-swords.svg` });
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
      html.find(`[data-action="editStep"]`).on("click", e => { void this.editStep(e); });
      html.find(`[data-action="saveMacro"]`).on("click", () => { void this.saveMacro(); });

      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      (html.find(`[data-role="transition-steps"]`) as any).sortable({
        handle: ".drag-handle",
        containment: "parent",
        axis: "y",
        classes: {
          "ui-sortable-helper": "window-app ui-sortable-helper window-content"
        }
      });
    }

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);
    }
  }
}
