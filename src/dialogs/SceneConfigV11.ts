import { SceneConfiguration } from "../interfaces";

export class SceneConfigV11 extends SceneConfig {
  static async inject(app: SceneConfig, html: JQuery<HTMLElement>, options: any, config: SceneConfiguration): Promise<void> {
    const navElement = await renderTemplate(`/modules/${__MODULE_ID__}/templates/config/scene-nav-bar.hbs`, {});
    const navBar = html.find("nav.sheet-tabs.tabs");
    navBar.append(navElement);

    const navContent = await renderTemplate(`/modules/${__MODULE_ID__}/templates/scene-config.hbs`, config);
    html.find(`button[type="submit"]`).before(`<div class="tab" data-tab="battle-transitions">${navContent}</div>`);
    addEventListeners(app, html);
  }
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function addEventListeners(app: SceneConfig, html: JQuery<HTMLElement>) {

}
