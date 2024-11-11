import { InvalidTransitionError } from "../errors";
import { SceneConfiguration } from "../interfaces";
import { getStepClassByKey } from "../utils";
import { AddStepDialogV1 } from "./AddStepDialogV1";

export class SceneConfigV12 extends SceneConfig {
  static async inject(app: SceneConfig, html: JQuery<HTMLElement>, options: any, config: SceneConfiguration) {
    const navElement = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/scene-nav-bar.hbs`, {});
    const navBar = html.find("nav.sheet-tabs.tabs[data-group='main']");
    navBar.append(navElement);

    const navContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, config);
    html.find("footer.sheet-footer").before(`<div class="tab" data-group="main" data-tab="${__MODULE_ID__}">${navContent}</div>`);
    addEventListeners(app, html);
  }
}

function addEventListeners(app: SceneConfig, html: JQuery<HTMLElement>) {
  html.find(`button[data-action="add-step"]`).on("click", e => {
    e.preventDefault();
    void addStep(app, html);
  })
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function addStep(app: SceneConfig, html: JQuery<HTMLElement>) {
  const key = await AddStepDialogV1.prompt();
  if (!key) return;
  const step = getStepClassByKey(key);
  if (!step) throw new InvalidTransitionError(key);

  // Edit
}