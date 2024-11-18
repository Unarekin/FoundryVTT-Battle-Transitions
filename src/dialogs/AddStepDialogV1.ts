import { localize } from "../utils";
import { clearSearchResults, handleSearchInput } from "./addStepFunctions";
import { getStepsForCategory } from "./functions";

// #region Classes (1)

export class AddStepDialogV1 {
  // #region Public Static Methods (1)

  public static async prompt(): Promise<string | null> {
    const content = await renderTemplate(`/modules/${__MODULE_ID__}/templates/dialogs/AddStepDialogV1.hbs`, {
      tabs: [
        {
          icon: "",
          id: "wipes",
          title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.WIPES",
          data: getStepsForCategory("wipe")
        },
        {
          icon: "",
          id: "warps",
          title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.WARPS",
          data: getStepsForCategory("warp")
        },
        {
          icon: "",
          id: "effects",
          title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.EFFECTS",
          data: getStepsForCategory("effect")
        },
        {
          icon: "",
          id: "technical",
          title: "BATTLETRANSITIONS.DIALOGS.ADDSTEP.TABS.TECHNICAL",
          data: getStepsForCategory("technical")
        }
      ]
    })

    return new Promise<string | null>((resolve) => {
      const dialog = new Dialog({
        title: localize("BATTLETRANSITIONS.DIALOGS.ADDSTEP.TITLE"),
        content,
        buttons: {
          cancel: {
            icon: `<i class="fas fa-times"></i>`,
            label: localize("BATTLETRANSITIONS.DIALOGS.BUTTONS.CANCEL"),
            callback: () => { resolve(null); }
          }
        },
        close: () => { clearSearchResults(); },
        render: (html: HTMLElement | JQuery<HTMLElement>) => {
          addEventListeners(dialog, $(html), resolve);
        }
      });
      dialog.render(true, { classes: ["dialog", "bt"], resizable: true });
    })
  }

  // #endregion Public Static Methods (1)
}

// #endregion Classes (1)

// #region Functions (1)

function addEventListeners(dialog: Dialog, html: JQuery<HTMLElement>, resolve: (value: string | null) => void) {
  // Set up tabs
  const tabs = new Tabs({
    contentSelector: ".tab-content",
    navSelector: `.tabs[data-group="primary-tabs"]`,
    initial: "wipes",
    callback: () => { dialog.setPosition(); }
  });
  tabs.bind($(html)[0]);

  html.find("#search-text").on("input", e => {
    handleSearchInput($(e.currentTarget) as JQuery<HTMLInputElement>, dialog, (key: string) => {
      resolve(key);
      void dialog.close();
    });
  });

  html.find("#clear-search").on("click", () => {
    clearSearchResults();
    html.find("#search-text").val("");
  })
  // Button clickies
  html.find(`button[data-transition]`).on("click", e => {
    e.preventDefault();
    const transition = e.currentTarget?.dataset?.transition ?? "";
    if (transition) resolve(transition);
    else resolve(null);
    void dialog.close();
  })
}

// #endregion Functions (1)
