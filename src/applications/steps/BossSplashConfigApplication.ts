import { BossSplashContext } from "./types";
import { BossSplashConfiguration, BossSplashStep, generateFontSelectOptions } from "../../steps";
import { StepConfigApplication } from "./StepConfigApplication";
import { templateDir } from "../../utils";
import { DeepPartial } from "../types";

export class BossSplashConfigApplication extends StepConfigApplication<BossSplashConfiguration> {

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public readonly StepClass = BossSplashStep as any;


  public static PARTS: Record<string, foundry.applications.api.HandlebarsApplicationMixin.HandlebarsTemplatePart> = {
    main: {
      template: templateDir(`steps/bosssplash.hbs`),
    },
    tabs: {
      template: `templates/generic/tab-navigation.hbs`
    },
    basics: {
      template: templateDir(`steps/bosssplash-basics.hbs`),
      templates: [
        templateDir(`steps/partials/label.hbs`),
        templateDir(`steps/partials/duration-selector.hbs`)
      ]
    },
    colors: {
      template: templateDir(`steps/bosssplash-colors.hbs`)
    },
    font: {
      template: templateDir(`steps/bosssplash-font.hbs`),
      templates: [
        templateDir(`steps/partials/font-selector.hbs`)
      ]
    },
    footer: {
      template: "templates/generic/form-footer.hbs"
    }
  }

  protected async _preparePartContext(partId: string, context: any, options: DeepPartial<foundry.applications.api.ApplicationV2.RenderOptions>): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const actual = await super._preparePartContext(partId, context, options) as BossSplashContext;
    actual.tab = actual.tabs?.[partId] ?? {};

    return actual;
  }

  parseFormData(data: Record<string, unknown>): BossSplashConfiguration {
    const parsed = super.parseFormData(data);
    parsed.font = data.fontFamily as string ?? BossSplashStep.DefaultSettings.font;
    return parsed;
  }

  protected async _prepareContext(options: foundry.applications.api.ApplicationV2.RenderOptions): Promise<BossSplashContext> {
    const context = (await super._prepareContext(options)) as BossSplashContext;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (context as any).fontFamily = context.config.font;

    context.fontSelect = generateFontSelectOptions();

    context.tabs = {
      basics: {
        id: "basics",
        group: "primary",
        label: "BATTLETRANSITIONS.SCENECONFIG.BOSSSPLASH.TABS.BASICS",
        active: true,
        cssClass: "active",
        icon: "fa-solid fa-cogs"
      },
      colors: {
        id: "colors",
        group: "primary",
        label: "BATTLETRANSITIONS.SCENECONFIG.BOSSSPLASH.TABS.COLORS",
        active: false,
        cssClass: "",
        icon: "fa-solid fa-palette"
      },
      font: {
        id: "font",
        group: "primary",
        label: "BATTLETRANSITIONS.SCENECONFIG.BOSSSPLASH.TABS.FONT",
        active: false,
        cssClass: "",
        icon: "fa-solid fa-paragraph"
      }
    }
    return context;
  }

}