import { localize, renderTemplateFunc } from "../utils";
import { clearSearchResults, handleSearchInput } from "./addStepFunctions";
import { getStepsForCategory } from "./functions";

export class AddStepDialog {
  public static async prompt(): Promise<string | null> {
    const content = await (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/dialogs/AddStepDialogV2.hbs`, {
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
    });
    return new Promise<string | null>(resolve => {
      const dialog = new foundry.applications.api.DialogV2({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        window: ({ title: localize("BATTLETRANSITIONS.DIALOGS.ADDSTEP.TITLE") } as any),
        content,
        position: {
          width: 450
        },
        buttons: [
          {

            // icon: `<i class="fas fa-times"></i>`,
            icon: "fas fa-times",
            label: "Cancel",
            action: "cancel",
            callback: () => {
              resolve(null);
              return Promise.resolve();
            }
          }
        ]
      });
      void dialog.render(true)
        .then(dialog => {
          addEventListeners(dialog, $(dialog.element), resolve);
        });
    })
  }
}

function addEventListeners(dialog: foundry.applications.api.DialogV2, html: JQuery<HTMLElement>, resolve: (key: string | null) => void) {
  // Set up tabs
  const tabs = new Tabs({
    contentSelector: ".tab-content",
    navSelector: ".tabs[data-group='primary-tabs']",
    initial: "wipes",
  });
  tabs.bind(dialog.element);

  // Step buttons
  html.find("button[data-transition]").on("click", e => {
    e.preventDefault();
    const transition = e.currentTarget.dataset.transition ?? "";
    if (transition) resolve(transition);
    else resolve(null);
    clearSearchResults();
    void dialog.close();
  })


  html.find("#clear-search").on("click", () => {
    clearSearchResults();
    html.find("#search-text").val("");
  })

  // Search
  html.find("#search-text").on("input", e => {
    handleSearchInput($(e.currentTarget) as JQuery<HTMLInputElement>, dialog, (key: string) => {
      resolve(key);
      void dialog.close();
      clearSearchResults();
    });
  });

}