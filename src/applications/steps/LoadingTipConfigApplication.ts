import { StepConfigApplication } from "./StepConfigApplication";
import { generateFontSelectOptions, LoadingTipConfiguration, LoadingTipStep } from "../../steps";
import { LoadingTipContext } from "./types";
import { DeepPartial } from "../types";

export class LoadingTipConfigApplication extends StepConfigApplication<LoadingTipConfiguration> {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = LoadingTipStep as any;

  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: `modules/${__MODULE_ID__}/templates/steps/loadingtip.hbs`,
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`
    },
    basics: {
      template: `modules/${__MODULE_ID__}/templates/steps/loadingtip-basics.hbs`,
      templates: [
        `modules/${__MODULE_ID__}/templates/steps/partials/label.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/duration-selector.hbs`,
        `modules/${__MODULE_ID__}/templates/steps/partials/simple-select.hbs`
      ]
    },
    font: {
      template: `modules/${__MODULE_ID__}/templates/steps/loadingtip-font.hbs`,
      templates: [`modules/${__MODULE_ID__}/templates/steps/partials/font-selector.hbs`]
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



    return context;
  }
}
