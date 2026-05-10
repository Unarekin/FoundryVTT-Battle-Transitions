import { expandedFormData, log } from "utils";
import { DeepPartial } from "./types";
import { BTScene, SceneTransition, SceneConfiguration } from "interfaces";
import { ConfigurationHandler } from "ConfigurationHandler";
import { SequenceEditorApplication } from "./SequenceEditorApplication";

type BaseType = typeof foundry.applications.api.DocumentSheetV2<BTScene>;
type RenderContext = foundry.applications.api.DocumentSheetV2.RenderContext<BTScene>;
type RenderOptions = foundry.applications.api.DocumentSheetV2.RenderOptions;

interface FormData {
  transition: SceneTransition;
  [key: string]: unknown;
}

export function SceneConfigMixin(Base: BaseType) {
  return class BattleTransitionSceneConfig extends Base {

    #battleTransitionConfiguration: SceneConfiguration | undefined = undefined;

    public static DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.DocumentSheetV2.Configuration<Scene>> = {
      window: {
        controls: [
          {
            icon: "fa-solid fa-fw bt-icon bt-crossed-swords",
            label: "BATTLETRANSITIONS.COMMON.TRANSITIONTYPE",
            action: "editBattleTransition"
          }
        ]
      },
      actions: {
        // eslint-disable-next-line @typescript-eslint/unbound-method
        editBattleTransition: BattleTransitionSceneConfig.EditBattleTransition
      }
    }


    static async EditBattleTransition(this: BattleTransitionSceneConfig) {
      try {
        // const transition = await (new TransitionBuilder({ scene: this.document.id ?? "", allowUserSelect: false })).build();
        const transition = await SequenceEditorApplication.edit({ sequence: this.#battleTransitionConfiguration?.sequence ?? [], oldScene: this.document.id ?? "", window: { title: "BATTLETRANSITIONS.SCENECONFIG.BUTTONS.CONFIGURETRANSITION" } });
        if (transition) {
          this.#battleTransitionConfiguration ??= foundry.utils.deepClone(this.document.battleTransitionConfiguration);
          this.#battleTransitionConfiguration.sequence = foundry.utils.deepClone(transition);
        }


      } catch (err) {
        console.error(err);
        if (err instanceof Error) ui.notifications?.error(err.message, { console: false });
      }
    }

    protected _iterateElements(selectors: string[], fn: ((elem: HTMLElement) => void)) {
      const elements: HTMLElement[] = Array.from(this.element.querySelectorAll(selectors.join(",")));
      for (const element of elements)
        fn(element);
    }

    protected _hideElements(...selectors: string[]) {
      this._iterateElements(selectors, elem => { elem.style.display = "none"; });
    }

    protected _showElements(...selectors: string[]) {
      this._iterateElements(selectors, elem => { elem.style.display = "flex"; });
    }

    protected _enableElements(...selectors: string[]) {
      this._iterateElements(selectors, elem => {
        if (elem instanceof HTMLInputElement || elem instanceof HTMLSelectElement) {
          elem.disabled = false;
        } else {
          elem.classList.remove("disabled");
          elem.removeAttribute("disabled")
        }
      });
    }

    protected _disableElements(...selectors: string[]) {
      this._iterateElements(selectors, elem => {
        if (elem instanceof HTMLInputElement || elem instanceof HTMLSelectElement) {
          elem.disabled = true;
        } else {
          elem.classList.add("disabled");
          elem.setAttribute("disabled", "disabled");
        }
      })
    }

    protected toggleBattleTransitionConfiguration() {
      if (this.form) {
        const data = expandedFormData<FormData>(this.form);
        const container = this.element.querySelector(`[data-role="battle-transition-config"]`);
        if (container instanceof HTMLElement)
          container.style.display = data.transition.type === "battleTransition" ? "block" : "none";

        const selectors = [`[name="transition.duration"]`, `[name="transition.activeOnly"]`];
        if (data.transition.type === "battleTransition") {
          this._disableElements(...selectors);
          this._hideElements(...selectors.map(selector => `.form-group:has(${selector})`));
        } else {
          this._enableElements(...selectors);
          this._showElements(...selectors.map(selector => `.form-group:has(${selector})`));
        }
      }
    }

    // #region Form Handlers

    protected _onClose(options: RenderOptions): void {
      this.#battleTransitionConfiguration = undefined;

      super._onClose(options);
    }

    async _onSubmitForm(formConfig: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event) {
      if (this.#battleTransitionConfiguration) {
        log("Saving configuration:", foundry.utils.deepClone(this.#battleTransitionConfiguration));

        ConfigurationHandler.SetSceneConfiguration(this.document, this.#battleTransitionConfiguration)
          .catch((err: Error) => {
            console.error(err);
            ui.notifications?.error(err.message, { console: false });
          });
      }

      await super._onSubmitForm(formConfig, event);
    }

    _onChangeForm(formConfig: foundry.applications.api.ApplicationV2.FormConfiguration, e: Event) {
      super._onChangeForm(formConfig, e);
      this.toggleBattleTransitionConfiguration();
    }

    public async _onRender(context: RenderContext, options: RenderOptions) {
      await super._onRender(context, options);

      const typeContainer = this.element.querySelector(`.form-group:has([name="transition.type"])`);
      if (typeContainer instanceof HTMLElement) {
        const container = document.createElement("section");
        container.dataset.role = "battle-transition-config";

        const buttonRow = document.createElement("div");
        container.appendChild(buttonRow);

        buttonRow.classList.add("flexrow");

        // configContainer.appendChild(label);

        const button = document.createElement("button");
        button.type = "button";
        button.dataset.action = "editBattleTransition";

        const icon = document.createElement("i");
        icon.classList.add("fa-solid", "bt-icon", "fa-fw", "bt-crossed-swords");
        button.appendChild(icon);
        button.innerHTML += _loc("BATTLETRANSITIONS.SCENECONFIG.BUTTONS.CONFIGURETRANSITION");

        buttonRow.appendChild(button);

        typeContainer.after(container);
      }
      this.toggleBattleTransitionConfiguration();
    }

    public async _prepareContext(options: RenderOptions): Promise<RenderContext> {
      const context = await super._prepareContext(options);

      this.#battleTransitionConfiguration ??= foundry.utils.deepClone(this.document.battleTransitionConfiguration);

      return context;
    }

    // #endregion
  }

}