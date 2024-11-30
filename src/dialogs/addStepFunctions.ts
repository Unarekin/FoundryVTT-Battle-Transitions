import { TransitionStep } from "../steps";
import { getSortedSteps, getStepClassByKey, localize } from "../utils";

// #region Functions (9)

export function buildIndex(): lunr.Index {
  const steps = getSortedSteps();

  return lunr(function (this: lunr.Builder) {
    this.field("name");
    this.field("description");
    this.ref("key");

    for (const step of steps) {
      this.add({
        name: localize(`BATTLETRANSITIONS.${step.name}.NAME`),
        description: localize(`BATTLETRANSITIONS.${step.name}.DESCRIPTION`),
        key: step.key
      })
    }
  })
}

export function clearSearchResults() {
  DO_POSITION_SEARCH_RESULTS = false;

  $("#step-search-results").children().remove();
  $("#step-search-results").css("display", "none");
  $("#clear-search").css("display", "none");
}

function createResultsDiv(): JQuery<HTMLElement> {
  const div = document.createElement("div");
  div.setAttribute("id", "step-search-results");
  div.classList.add("step-search-results");
  document.body.appendChild(div);
  return $(div);
}

function createSearchResultDiv(step: typeof TransitionStep): HTMLDivElement {
  const div = document.createElement("div");
  div.dataset.key = step.key;

  div.innerHTML = localize(`BATTLETRANSITIONS.${step.name}.NAME`);
  if (step.icon) div.innerHTML = `${step.icon}${div.innerHTML}`;
  else div.style.paddingLeft = "calc(1.25em + 12px)";

  return div;
}

export function getSearchResults(term: string): (typeof TransitionStep)[] {
  const index = buildIndex();

  const results = index.search(term);

  return results.map(res => getStepClassByKey(res.ref)).filter(res => !!res);
}

export function handleSearchInput(input: JQuery<HTMLInputElement>, dialog: Dialog | foundry.applications.api.DialogV2, cb: (key: string) => void) {
  const term = input.val();
  if (!term || term.length < 3) {
    hideSearchResults();
    return;
  }

  let resultsDiv = $("#step-search-results");
  if (!resultsDiv || !resultsDiv.length) resultsDiv = createResultsDiv();

  clearSearchResults();

  $("#clear-search").css("display", "block");

  const results = getSearchResults(term);

  for (const step of results) {
    const div = createSearchResultDiv(step);
    $(div).on("click", () => { cb(step.key); });
    resultsDiv.append(div);
  }
  showSearchResults(input, dialog);
}

export function hideSearchResults() {
  DO_POSITION_SEARCH_RESULTS = false;
  clearSearchResults();
  $("#clear-search").css("display", "none");
}

function positionSearchResults(target: JQuery<HTMLElement>, dialog: Dialog | foundry.applications.api.DialogV2) {
  if (!DO_POSITION_SEARCH_RESULTS) return;
  const resultsDiv = $("#step-search-results");

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
  if (!resultsDiv?.length || !target.length || (dialog instanceof Dialog && dialog.closing) || (foundry.applications?.api?.DialogV2 && dialog instanceof foundry.applications.api.DialogV2 && ((dialog as any).state as number) === -2)) {
    clearSearchResults();
    return;
  }

  resultsDiv.css("top", (target?.offset()?.top ?? 0) + (target?.height() ?? 0) + 8);
  resultsDiv.css("left", target?.offset()?.left ?? 0);

  resultsDiv.css("width", target?.width() ?? 150);

  requestAnimationFrame(() => { positionSearchResults(target, dialog); })
}

export function showSearchResults(target: JQuery<HTMLElement>, dialog: Dialog | foundry.applications.api.DialogV2) {
  const div = $("#step-search-results")
  div.css("display", "block");
  DO_POSITION_SEARCH_RESULTS = true;

  positionSearchResults(target, dialog);
}

// #endregion Functions (9)

// #region Variables (1)

let DO_POSITION_SEARCH_RESULTS: boolean = false;

// #endregion Variables (1)
