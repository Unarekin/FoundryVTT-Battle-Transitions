import { localize } from "../utils";

export function SceneConfigMixin(Base: typeof SceneConfig) {
  return class extends Base {

    async _renderInner(data: ReturnType<this["getData"]>): Promise<JQuery<HTMLElement>> {
      const html = await super._renderInner(data);

      // Append tab
      html
        .find(`nav.tabs[data-group="main"]`)
        .append(
          $("<a>")
            .addClass("item")
            .attr("data-tab", "transition")
            .append(`<i class="fa-solid bt-icon crossed-swords fa-fw v12"></i> ${localize("SCENE.TABS.SHEET.transition")}`)
        );

      const content = await renderTemplate(`modules/${__MODULE_ID__}/templates/scene-config.hbs`, {
        isV1: true,
        transition: {},
        canCreateMacro: Macro.canUserCreate(game.user as User)
      });

      html.find(`.sheet-footer`)
        .before(
          $("<div>")
            .addClass("tab")
            .attr("data-tab", "transition")
            .append(content)
        )


      return html;
    }

    constructor(...args: any[]) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      super(...args);

      console.log(this._tabs);
    }
  }
}
