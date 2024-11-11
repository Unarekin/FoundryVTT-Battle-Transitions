import { InvalidTransitionError } from "../errors";
import { getSortedSteps, getStepClassByKey, localize } from "../utils";
import { StepContext } from "./types";

export class AddStepDialogV1 {
  static async prompt(): Promise<string | null> {
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
        render: (html: HTMLElement | JQuery<HTMLElement>) => {
          addEventListeners(dialog, $(html), resolve);
        }
      });
      dialog.render(true, { classes: ["dialog", "bt"], resizable: true });
    })
  }
}


function getStepsForCategory(category: string): StepContext[] {
  return getSortedSteps().reduce((prev, curr) => curr.category === category ? [...prev, { key: curr.key, name: `BATTLETRANSITIONS.TRANSITIONTYPES.${curr.name}`, icon: curr.icon, tooltip: "", hasIcon: !!curr.icon }] : prev, [] as StepContext[]);
}
function addEventListeners(dialog: Dialog, html: JQuery<HTMLElement>, resolve: (value: string | null) => void) {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  const searchIndex = buildIndex();

  // Set up tabs
  const tabs = new Tabs({
    contentSelector: ".tab-content",
    navSelector: `.tabs[data-group="primary-tabs"]`,
    initial: "wipes",
    callback: () => { dialog.setPosition(); }
  });
  tabs.bind($(html)[0]);

  // Search input
  // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
  (html.find("#search-text") as any).autocomplete({
    minLength: 2,
    // appendTo: ".dialog",
    select: (e: any, ui: any) => {
      console.log("Selected:", e, ui);
    },
    source: (request: { term: string }, response: any) => {

      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const results: lunr.Index.Result[] = searchIndex.search(request.term);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      response(results.map((res: { ref: string }) => {
        const step = getStepClassByKey(res.ref);
        if (!step) throw new InvalidTransitionError(res.ref);
        return { value: res.ref, label: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${step.name}`) };
        // return { key: step?.key, name: localize(`BATTLETRANSITION.TRANSITIONTYPES.${step.name}`), description: localize(`BATTLETRANSITION.SCENECONFIG.${step.name}.DESCRIPTION`) };
      }))
    }
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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function buildIndex(): lunr.Index {
  const steps = getSortedSteps();

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  return lunr(function (this: lunr.Builder) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.field("name");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.field("description");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    this.ref("key");

    for (const step of steps) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.add({
        name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${step.name}`),
        description: localize(`BATTLETRANSITIONS.SCENECONFIG.${step.name}.DESCRIPTION`),
        key: step.key
      })
    }
  })
}