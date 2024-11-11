import { InvalidTransitionError } from "../errors";
import { getSortedSteps, getStepClassByKey, localize } from "../utils";
import { StepContext } from "./types";

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

// #region Functions (6)

function addEventListeners(dialog: Dialog, html: JQuery<HTMLElement>, resolve: (value: string | null) => void) {
  const searchIndex = buildIndex();

  // Set up tabs
  const tabs = new Tabs({
    contentSelector: ".tab-content",
    navSelector: `.tabs[data-group="primary-tabs"]`,
    initial: "wipes",
    callback: () => { dialog.setPosition(); }
  });
  tabs.bind($(html)[0]);

  html.find("#search-text").on("input", e => {
    const input = html.find("#search-text").val() as string;

    let resultsDiv = $("#step-search-results");
    if (resultsDiv.length === 0) {
      const div = document.createElement("div");
      div.setAttribute("id", "step-search-results");
      div.classList.add("step-search-results");
      document.body.appendChild(div);

      resultsDiv = $("#step-search-results");
    }

    if (!resultsDiv.length) throw new Error();

    clearSearchResults();
    if (input.length < 3) return;

    $("#clear-search").css("display", "block");

    const results = searchIndex.search(input);
    for (const result of results) {
      const step = getStepClassByKey(result.ref);
      if (!step) throw new InvalidTransitionError(result.ref);

      const resultDiv = document.createElement("div");
      resultDiv.dataset.key = result.ref;

      resultDiv.innerHTML = localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${step.name}`);
      if (step.icon) resultDiv.innerHTML = `${step.icon}${resultDiv.innerHTML}`;
      else resultDiv.style.paddingLeft = "calc(1.25em + 12px)";
      resultsDiv.append(resultDiv);
      resultsDiv.addClass("v1");

      $(resultDiv).on("click", () => {
        resultsDiv.css("display", "none");
        resultsDiv.children().remove();
        void dialog.close();
        resolve(result.ref);
      });
    }

    DO_POSITION_SEARCH_RESULTS = true;
    positionSearchResults($(e.currentTarget));

    resultsDiv.css("display", "block");
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

function buildIndex(): lunr.Index {
  const steps = getSortedSteps();

  return lunr(function (this: lunr.Builder) {
    this.field("name");
    this.field("description");
    this.ref("key");

    for (const step of steps) {
      this.add({
        name: localize(`BATTLETRANSITIONS.TRANSITIONTYPES.${step.name}`),
        description: localize(`BATTLETRANSITIONS.SCENECONFIG.${step.name}.DESCRIPTION`),
        key: step.key
      })
    }
  })
}

function clearSearchResults() {
  stopPositioningSearchResults();

  $("#step-search-results").children().remove();
  $("#step-search-results").css("display", "none");
  $("#clear-search").css("display", "none");
}

function getStepsForCategory(category: string): StepContext[] {
  return getSortedSteps().reduce((prev, curr) => curr.category === category ? [...prev, { key: curr.key, name: `BATTLETRANSITIONS.TRANSITIONTYPES.${curr.name}`, icon: curr.icon, tooltip: "", hasIcon: !!curr.icon }] : prev, [] as StepContext[]);
}

function positionSearchResults(target: JQuery<HTMLElement>) {
  if (!DO_POSITION_SEARCH_RESULTS) return;
  const resultsDiv = $("#step-search-results");
  if (!resultsDiv?.length) return;

  resultsDiv.css("top", (target?.offset()?.top ?? 0) + (target?.height() ?? 0) + 8);
  resultsDiv.css("left", target?.offset()?.left ?? 0);

  resultsDiv.css("width", target?.width() ?? 150);

  requestAnimationFrame(() => { positionSearchResults(target); })
}

function stopPositioningSearchResults() {
  DO_POSITION_SEARCH_RESULTS = false;
}

// #endregion Functions (6)

// #region Variables (1)

let DO_POSITION_SEARCH_RESULTS: boolean = false;

// #endregion Variables (1)
