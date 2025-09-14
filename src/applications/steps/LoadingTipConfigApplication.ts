import { StepConfigApplication } from "./StepConfigApplication";
import { generateFontSelectOptions, LoadingTipConfiguration, LoadingTipStep } from "../../steps";
import { LoadingTipContext } from "./types";
import { DeepPartial } from "../types";
import { templateDir } from "../../utils";

export class LoadingTipConfigApplication extends StepConfigApplication<LoadingTipConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = LoadingTipStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/loadingtip.hbs`),
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`
    },
    basics: {
      template: templateDir(`steps/loadingtip-basics.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`),
        templateDir(`steps/partials/simple-select.hbs`)
      ]
    },
    font: {
      template: templateDir(`steps/loadingtip-font.hbs`),
      templates: [
        templateDir(`steps/partials/font-selector.hbs`),
        templateDir(`steps/partials/dropshadow-selector.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _preparePartContext(partId: string, context: any, options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const actual = await super._preparePartContext(partId, context, options) as LoadingTipContext;
    actual.tab = actual.tabs?.[partId] ?? {};

    return actual;
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<LoadingTipContext> {
    const context = (await super._prepareContext(options)) as LoadingTipContext;

    context.fontSelect = generateFontSelectOptions();
    context.sourceSelect = {
      "string": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.SOURCETYPE.STRING.LABEL",
      "rolltable": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.SOURCETYPE.ROLLTABLE.LABEL"
    };

    context.locationSelect = {
      "topleft": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.TOPLEFT",
      "topcenter": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.TOPCENTER",
      "topright": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.TOPRIGHT",
      "center": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.CENTER",
      "bottomleft": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.BOTTOMLEFT",
      "bottomcenter": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.BOTTOMCENTER",
      "bottomright": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.BOTTOMRIGHT"
    };

    context.tableSelect = Object.fromEntries((game?.tables?.contents ?? []).map(table => [table.uuid, table.name]));
    context.fontSelect = generateFontSelectOptions();

    context.tabs = {
      basics: {
        id: "basics",
        group: "primary",
        label: "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.TABS.BASICS",
        active: true,
        cssClass: "active",
        icon: "fa-solid fa-cogs"
      },
      font: {
        id: "font",
        group: "primary",
        label: "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.TABS.FONT",
        active: false,
        cssClass: "",
        icon: "fa-solid fa-paragraph"
      }
    }

    if (context.config.source === "rolltable")
      context.table = context.config.message ?? "";
    else if (context.config.source === "string")
      context.string = context.config.message ?? "";

    context.fontFamily = (context.config.style.fontFamily as string) ?? "";

    const color = new PIXI.Color(context.config.style.dropShadowColor as string ?? "#000");
    color.setAlpha(context.config.style.dropShadowAlpha as number ?? 1);
    context.dropShadowColor = color.toHexa();

    return context;
  }

  _onRender(context: LoadingTipContext, options: foundry.applications.api.ApplicationV2.RenderOptions) {
    super._onRender(context, options);

    const sourceSelector = this.element.querySelector(`#source`);
    if (sourceSelector instanceof HTMLSelectElement) {
      sourceSelector.addEventListener("change", () => { this.setMessageSource(sourceSelector.value ?? ""); })
    }

    this.setMessageSource(context.config.source);
  }

  parseFormData(data: Record<string, unknown>): LoadingTipConfiguration {
    const parsed = super.parseFormData(data);
    if (parsed.source === "rolltable") {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
      parsed.message = (parsed as any).table;
      delete parsed.table;
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    parsed.style.fontFamily = (parsed as any).fontFamily ?? "";
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete (parsed as any).fontFamily;

    // Parse drop shadow
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const dropShadow = new PIXI.Color((parsed as any).dropShadowColor as string ?? "");
    parsed.style.dropShadowColor = dropShadow.toHex();
    parsed.style.dropShadowAlpha = dropShadow.alpha;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete (parsed as any).dropShadowColor;

    return parsed;
  }


  protected setMessageSource(value: string) {
    const visible = this.element.querySelectorAll(`[data-source-type="${value}"]`);
    for (const elem of visible)
      if (elem instanceof HTMLElement) elem.style.display = "block";

    const invisible = this.element.querySelectorAll(`[data-source-type]:not([data-source-type="${value}"])`);
    for (const elem of invisible)
      if (elem instanceof HTMLElement) elem.style.display = "none";

  }
}
