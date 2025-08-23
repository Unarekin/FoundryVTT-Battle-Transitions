import { ConfigurationHandler } from "../ConfigurationHandler";
import { AddStepDialog, DeepPartial } from "../dialogs";
import { confirm, generateMacro } from "./functions";
import { InvalidTransitionError, LocalizedError } from "../errors";
import { SceneConfiguration } from "../interfaces";
import { TransitionConfiguration } from "../steps";
import { downloadJSON, formDataExtendedClass, getStepClassByKey, localize, uploadJSON } from "../utils";

type BaseType = typeof foundry.applications.api.DocumentSheetV2<Scene>;

export function SceneConfigV2Mixin(Base: BaseType) {


  class Mixed extends Base {
    #sceneConfiguration: SceneConfiguration | undefined = undefined;

    // Default options here
    public static DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.DocumentSheetV2.Configuration> = {
      actions: {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        importJson: Mixed.ImportJson,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        exportJson: Mixed.ExportJson,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        addStep: Mixed.AddStep,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        removeStep: Mixed.RemoveStep,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        clearSteps: Mixed.ClearSteps,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        editStep: Mixed.EditStep,
        // eslint-disable-next-line @typescript-eslint/unbound-method
        saveMacro: Mixed.SaveMacro
      }
    }

    static async SaveMacro(this: Mixed) {
      try {
        if (!this.#sceneConfiguration?.sequence.length) return;
        const macro = generateMacro(this.#sceneConfiguration.sequence, [], this.document);
        await Macro.createDialog({ type: "script", command: macro, img: `modules/${__MODULE_ID__}/assets/icons/crossed-swords.svg` });
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    static async EditStep(this: Mixed, e: PointerEvent, elem: HTMLElement) {
      try {
        if (!this.#sceneConfiguration?.sequence.length) return;
        const id = elem.dataset.step as string ?? "";
        if (!id) throw new InvalidTransitionError(id);
        const config = this.#sceneConfiguration.sequence.find(item => item.id === id);
        if (!config) throw new InvalidTransitionError(id);

        const stepClass = getStepClassByKey(config.type);
        if (!stepClass) throw new InvalidTransitionError(config.type);
        if (!stepClass.ConfigurationApplication) throw new LocalizedError("NOCONFIGAPP");

        const app = new stepClass.ConfigurationApplication(foundry.utils.deepClone(config));
        const newConfig = await app.configure();
        if (!newConfig) return;
        const index = this.#sceneConfiguration.sequence.findIndex(item => item.id === id);
        if (index !== -1) this.#sceneConfiguration.sequence.splice(index, 1, newConfig);
        await this.render();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    static async ClearSteps(this: Mixed) {
      try {
        if (!this.#sceneConfiguration?.sequence.length) return;
        const confirmed = await confirm(
          "BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.TITLE",
          game.i18n?.localize("BATTLETRANSITIONS.DIALOGS.CLEARSTEPS.MESSAGE") ?? ""
        );
        if (!confirmed) return;

        this.#sceneConfiguration.sequence.splice(0, this.#sceneConfiguration.sequence.length);
        await this.render();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }


    static async RemoveStep(this: Mixed, event: PointerEvent, element: HTMLElement) {
      try {
        if (!this.#sceneConfiguration?.sequence.length) return;
        const id = element.dataset.step as string ?? "";
        if (!id) throw new InvalidTransitionError(id);
        const step = this.#sceneConfiguration.sequence.find(item => item.id === id);
        if (!step) throw new InvalidTransitionError(id);

        const stepClass = getStepClassByKey(step.type);
        if (!stepClass) throw new InvalidTransitionError(step.type);

        const name = game.i18n?.localize(`BATTLETRANSITIONS.${stepClass.name}.NAME`)

        const confirmed = await confirm(
          game.i18n?.format("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.TITLE", { name }) ?? "",
          game.i18n?.format("BATTLETRANSITIONS.DIALOGS.REMOVECONFIRM.CONTENT", { name }) ?? ""
        );
        if (!confirmed) return;

        const index = this.#sceneConfiguration.sequence.findIndex(item => item.id === id);
        if (index !== -1) this.#sceneConfiguration.sequence.splice(index, 1);
        await this.render();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false })
      }
    }

    static async AddStep(this: Mixed) {
      try {
        const key = await AddStepDialog.prompt(this.#sceneConfiguration?.sequence ?? []);
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
        if (this.#sceneConfiguration?.sequence) this.#sceneConfiguration.sequence.push(config);
        await this.render();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    static ExportJson(this: Mixed) {
      try {
        if (!this.#sceneConfiguration?.sequence?.length) return;
        downloadJSON(this.#sceneConfiguration.sequence, `${this.document.name}.json`);
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    static async ImportJson(this: Mixed) {
      try {
        if (!this.#sceneConfiguration) this.#sceneConfiguration = ConfigurationHandler.GetSceneConfiguration(this.document);

        if (this.#sceneConfiguration?.sequence.length) {
          const confirmation = await confirm("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.TITLE", localize("BATTLETRANSITIONS.DIALOGS.IMPORTCONFIRM.MESSAGE"));
          if (!confirmation) return;
        }

        //  const sequence = await uploadJSON<TransitionConfiguration[]>();
        const sequence = await uploadJSON<TransitionConfiguration[]>();
        if (!sequence) return;
        this.#sceneConfiguration.sequence = sequence;

        await this.render();
      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    async _onSubmitForm(formConfig: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event | SubmitEvent): Promise<void> {

      const form = (this as unknown as SceneConfig).form as HTMLFormElement | null;
      if (!form) return;
      const data = foundry.utils.mergeObject(
        { transition: this.#sceneConfiguration },
        foundry.utils.expandObject(new (formDataExtendedClass())(form).object)
      ) as Record<string, unknown>;


      if (data.transition) {
        const config = data.transition as SceneConfiguration;
        void ConfigurationHandler.SetSceneConfiguration((this as unknown as SceneConfig).document, config)
          .catch((err: Error) => {
            console.error(err);
            if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
          });
      }

      await super._onSubmitForm(formConfig, event);
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

    async _prepareContext(options: foundry.applications.api.DocumentSheetV2.RenderOptions) {
      if (options.isFirstRender) this.#sceneConfiguration = foundry.utils.deepClone(ConfigurationHandler.GetSceneConfiguration(this.document));
      const context = await super._prepareContext(options) as Record<string, unknown>;

      context.transition = {
        isV1: false,
        canCreateMacro: Macro.canUserCreate(game.user as User),
        transition: foundry.utils.deepClone(this.#sceneConfiguration)
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return context as any;
    }
  }


  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  const parts = (Mixed as any).PARTS as Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart>;
  const footer = parts.footer;
  delete parts.footer;

  foundry.utils.mergeObject(parts, {
    transition: {
      template: `modules/${__MODULE_ID__}/templates/scene-config.hbs`
    },
    footer
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  foundry.utils.mergeObject((Mixed as any).PARTS ?? {}, parts);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (Mixed as any).TABS.sheet.tabs.push({
    id: "transition",
    icon: "fa-solid bt-icon fa-fw bt-crossed-swords v13",
  });

  return Mixed

}