import { DeepPartial } from "Foundry-VTT/src/types/utils.mjs";
import { TransitionConfiguration } from "../steps";
import { localize, log } from "../utils";


export class EditStepDialog extends foundry.applications.api.DialogV2 {
  public static DEFAULT_OPTIONS: DeepPartial<foundry.applications.api.DialogV2.Configuration> = {
    tag: "form",
    buttons: [
      {
        action: "cancel",
        label: localize("Cancel"),
        icon: "fas fa-fw fa-times"
      },
      {
        action: "ok",
        label: localize("Save"),
        icon: "fas fa-fw fa-check",
        // callback: async (event: PointerEvent | SubmitEvent, button: HTMLButtonElement, dialog: HTMLDialogElement) => {
        //   const stepClass = getStepClassByKey(this.step.type);
        //   if (!(stepClass)) throw new InvalidTransitionError(this.step.type);
        //   const config = stepClass.from(this.element as HTMLFormElement);

        // }
      }
    ]
  }


  protected _onRender(context: { [x: string]: undefined; }, options: { force?: boolean | undefined; position?: { top?: number | undefined; left?: number | undefined; width?: number | "auto" | undefined; height?: number | "auto" | undefined; scale?: number | undefined; zIndex?: number | undefined; } | undefined; window?: { title?: string | undefined; icon?: string | false | undefined; controls?: boolean | undefined; } | undefined; parts?: string[] | undefined; isFirstRender?: boolean | undefined; }): void {
    log("Rendered:", this);
    return super._onRender(context, options);
  }

  protected _onSubmitForm(formConfig: foundry.applications.api.ApplicationV2.FormConfiguration, event: Event | SubmitEvent): Promise<void> {
    log("Submitted form:", formConfig);
    return super._onSubmitForm(formConfig, event);
  }

  constructor(public readonly step: TransitionConfiguration, options: DeepPartial<foundry.applications.api.DialogV2.Configuration>) {
    super(options);
  }
}