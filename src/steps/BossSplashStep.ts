import { ModuleNotActiveError } from '../errors';
import { TransitionSequence } from '../interfaces';
import { getActors, getCompendiumFromUUID, isValidFontSize, parseConfigurationFormElements, parseFontSize, renderTemplateFunc, wait } from '../utils';
import { generateFontSelectOptions } from './selectOptions';
import { TransitionStep } from './TransitionStep';
import { BossSplashConfiguration } from './types';

type InputEvent = JQuery.TriggeredEvent<HTMLElement, undefined, HTMLElement, HTMLElement>;

function getSplashSetting<t>(key: string, defaultSetting: t): t {
  if (game.modules?.get("boss-splash")?.active) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    return (game.settings as any)?.get("boss-splash", key) as t;
  } else return defaultSetting;
}

export class BossSplashStep extends TransitionStep<BossSplashConfiguration> {

  public static get DefaultSettings(): BossSplashConfiguration {
    return {
      id: "",
      type: "bosssplash",
      version: "1.1.0",
      duration: 5000,
      actor: "",

      // Get defaults for Boss Splash Screen global settings
      topColor: getSplashSetting<string>("colorFirst", "#FFD502"),
      midColor: getSplashSetting<string>("colorSecond", "#FF8400"),
      botColor: getSplashSetting<string>("colorThird", "#FF1F9C"),

      fontColor: getSplashSetting<string>("colorFont", "#FFFFFF"),
      fontShadow: getSplashSetting<string>("colorShadow", "#000000"),
      subColor: getSplashSetting<string>("subColorFont", "#FFFFFF"),
      subShadow: getSplashSetting<string>("subColorShadow", "#000000"),
      sound: getSplashSetting<string | undefined>("bossSound", undefined),
      font: getSplashSetting<string>("fontFamily", "Arial"),
      fontSize: getSplashSetting<string>("fontSize", "100px"),

      subSize: getSplashSetting<string>("subFontSize", "30px"),
      message: getSplashSetting<string>("splashMessage", "{{actor.name}}") === "{{actor.name}}" ? "" : getSplashSetting<string>("splashMessage", ""),
      subText: getSplashSetting<string>("subText", ""),
      animationDelay: getSplashSetting<number>("animationDelay", 0) * 1000,
      animationDuration: getSplashSetting<number>("animationDuration", 3) * 1000,
    };
  }


  public static get hidden(): boolean { return !(game.modules?.get("boss-splash")?.active); }
  public static key = "bosssplash";
  public static name = "BOSSSPLASH";
  public static template = "bosssplash-config";
  public static category = "effect";
  public static icon = "<i class='bt-icon boss-splash fa-fw fas'></i>"


  public static RenderTemplate(config?: BossSplashConfiguration): Promise<string> {
    const actors = getActors().sort(sortActors).map(actor => ({
      ...formatActor(actor),
      selected: config?.actor === actor.uuid
    }));
    return (renderTemplateFunc())(`/modules/${__MODULE_ID__}/templates/config/${BossSplashStep.template}.hbs`, {
      ...BossSplashStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),

      fontSelect: generateFontSelectOptions(),
      actors
    });
  }

  public static from(config: BossSplashConfiguration): BossSplashStep
  public static from(form: HTMLFormElement): BossSplashStep
  public static from(form: JQuery<HTMLFormElement>): BossSplashStep
  public static from(arg: unknown): BossSplashStep {
    if (arg instanceof HTMLFormElement) return BossSplashStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    else if ((arg as any)[0] instanceof HTMLElement) return BossSplashStep.fromFormElement((arg as any)[0]);
    else return new BossSplashStep({
      ...BossSplashStep.DefaultSettings,
      ...(arg as BossSplashConfiguration)
    });
  }


  // public static validateForm(elem: HTMLElement | JQuery<HTMLElement>): boolean { return true; }
  public static validateForm(elem: HTMLElement | JQuery<HTMLElement>): boolean {
    const html = $(elem);
    if (!isValidFontSize(html.find("#fontSize").val() as string)) return false;
    if (!isValidFontSize(html.find("#subSize").val() as string)) return false;
    return true;
  }

  public static validate(config: BossSplashConfiguration): BossSplashConfiguration | Error {
    if (!game?.modules?.get("boss-splash")?.active) return new ModuleNotActiveError("Boss Splash Screen");
    return config;
  }

  public static addEventListeners(element: HTMLElement | JQuery<HTMLElement>): void {
    const html = $(element);

    html.find("#fontSize").on("input", foundry.utils.debounce((e: InputEvent) => {
      $(e.currentTarget).val(parseFontSize($(e.currentTarget).val() as string || ""));
    }, 250));

    html.find("#subSize").on("input", foundry.utils.debounce((e: InputEvent) => {
      $(e.currentTarget).val(parseFontSize($(e.currentTarget).val() as string || ""));
    }, 250));

    // Set font faces
    html.find("#font option").each((index, element) => {
      const val = $(element).val() as string;
      $(element).css("font-family", val);
    });

    html.find("#font").on("input", e => {
      $(e.currentTarget).css("font-family", $(e.currentTarget).val() as string);
    })

  }

  public static fromFormElement(form: HTMLFormElement): BossSplashStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const sound = elem.find("#sound").val() as string ?? "";

    const fontSize = parseFontSize(elem.find("#fontSize").val() as string);
    const subSize = parseFontSize(elem.find("#subSize").val() as string);

    return new BossSplashStep({
      ...BossSplashStep.DefaultSettings,
      sound,
      ...parseConfigurationFormElements(elem, "id", "actor", "message", "subText", "duration", "animationDelay", "animationDuration", "topColor", "midColor", "botColor", "fontColor", "fontShadow", "subColor", "subShadow", "font", "label"),
      fontSize: isValidFontSize(fontSize) ? fontSize : BossSplashStep.DefaultSettings.fontSize,
      subSize: isValidFontSize(subSize) ? subSize : BossSplashStep.DefaultSettings.subSize
    });
  }

  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: BossSplashConfiguration = {
      ...BossSplashStep.DefaultSettings,
      ...this.config
    };

    // If we triggered the transition, trigger the splash
    if (sequence.caller === game.user?.id) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      void (game as any).bossSplash.splashBoss(coerceConfig(config));
    }

    await wait(config.duration + config.animationDelay);
  }
}


function coerceConfig(config: BossSplashConfiguration): { [x: string]: unknown } {

  const actor = fromUuidSync(config.actor) as Actor | null;

  return {
    sound: config.sound,
    colorFirst: config.topColor,
    colorSecond: config.midColor,
    colorThird: config.botColor,
    colorFont: config.fontColor,
    subColorFont: config.subColor,
    colorShadow: config.fontShadow,
    subColorShadow: config.subShadow,
    message: config.message ? config.message : actor?.name ?? "",
    subText: config.subText,
    fontFamily: config.font,
    fontSize: config.fontSize,
    subFontSize: config.subSize,
    timer: config.duration,
    duration: config.duration,
    animationDelay: config.animationDelay,
    actorImg: actor?.img ?? ""
  }
}


function formatActor(actor: Actor): { name: string, uuid: string, pack: string, type: string, selected: boolean } {
  const retVal = {
    name: actor.name,
    uuid: actor.uuid,
    pack: "",
    type: actor.type,
    selected: false
  };

  if (game.packs) {
    const parsed = actor.uuid.split(".");
    if (parsed[0] === "Compendium") {
      const packId = parsed.slice(1, 3).join(".");
      const pack = game.packs.get(packId);
      if (pack?.documentName === "Actor")
        retVal.pack = pack.title
    }
  }
  return retVal;
}

function sortActors(first: Actor, second: Actor): number {
  const firstPack = getCompendiumFromUUID(first.uuid);
  const secondPack = getCompendiumFromUUID(second.uuid);

  if (firstPack !== secondPack) return firstPack.localeCompare(secondPack);
  return first.name.localeCompare(second.name);
}
