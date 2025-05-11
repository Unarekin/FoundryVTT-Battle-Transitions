import { TransitionStep } from './TransitionStep';
import { LoadingTipConfiguration, LoadingTipSource } from './types';
import { deepCopy, parseConfigurationFormElements, renderTemplateFunc } from '../utils';
import { InvalidRollTableError, InvalidTipLocationError } from '../errors';
import { generateFontSelectOptions } from './selectOptions';

let ACTIVE_TEXT_ELEMENT: PIXI.HTMLText | null = null;

export class LoadingTipStep extends TransitionStep<LoadingTipConfiguration> {
  public static DefaultSettings: LoadingTipConfiguration = {
    id: "",
    type: "loadingtip",
    version: "1.1.0",
    duration: 0,
    source: "string",
    message: "Loading",
    location: "bottomcenter",
    style: {
      ...(JSON.parse(JSON.stringify(PIXI.HTMLTextStyle.defaultStyle)) as object),
      fill: "#FFFFFF",
      dropShadow: true,
      fontSize: 64
    }
  };



  public static category = "effect";
  public static hidden: boolean = false;
  public static icon = `<i class="fas fa-spinner"></i>`
  public static key = "loadingtip";
  public static name = "LOADINGTIP";
  public static template = "loadingtip-config";

  public static async RenderTemplate(config?: LoadingTipConfiguration): Promise<string> {
    const style = styleFromJSON({
      ...LoadingTipStep.DefaultSettings,
      ...(config ? config : {})
    }.style);

    return renderTemplateFunc(`/modules/${__MODULE_ID__}/templates/config/${LoadingTipStep.template}.hbs`, {
      ...LoadingTipStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      sourceSelect: {
        "string": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.SOURCETYPE.STRING.LABEL",
        "rolltable": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.SOURCETYPE.ROLLTABLE.LABEL"
      },
      locationSelect: {
        "topleft": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.TOPLEFT",
        "topcenter": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.TOPCENTER",
        "topright": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.TOPRIGHT",
        "center": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.CENTER",
        "bottomleft": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.BOTTOMLEFT",
        "bottomcenter": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.BOTTOMCENTER",
        "bottomright": "BATTLETRANSITIONS.SCENECONFIG.LOADINGTIP.LOCATION.BOTTOMRIGHT"
      },
      tableSelect: Object.fromEntries(getRollTables().map(table => [table.uuid, table.name])),
      fontSelect: generateFontSelectOptions(),
      fontFamily: style.fontFamily,
      fontSize: style.fontSize,
      fontColor: style.fill
    });
  }

  public static getDuration(config: LoadingTipConfiguration): number {
    const actual: LoadingTipConfiguration = {
      ...LoadingTipStep.DefaultSettings,
      ...config
    };
    return actual.duration;
  }

  public static from(config: LoadingTipConfiguration): LoadingTipStep
  public static from(form: HTMLFormElement): LoadingTipStep
  public static from(form: JQuery<HTMLFormElement>): LoadingTipStep
  public static from(arg: unknown): LoadingTipStep {
    if (arg instanceof HTMLFormElement) return LoadingTipStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if ((arg as any)[0] instanceof HTMLFormElement) return LoadingTipStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new LoadingTipStep(arg as LoadingTipConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): LoadingTipStep {
    const elem = $(form) as JQuery<HTMLFormElement>;

    const source = elem.find("#sourceType").val() as LoadingTipSource;
    let message: string = "";
    let table: string = "";
    if (source === "string") message = elem.find("#message").val() as string;
    else if (source === "rolltable") table = elem.find("#table").val() as string;

    const style = JSON.parse(JSON.stringify(styleFromJSON({
      ...LoadingTipStep.DefaultSettings.style,
      fontFamily: elem.find("#fontFamily").val() as string,
      fontSize: elem.find("#fontSize").val() as number,
      fill: elem.find("#fontColor").val() as string
    }))) as object;



    return new LoadingTipStep({
      ...LoadingTipStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "location"),
      source, message, table,
      style
    });
  }


  public execute(container: PIXI.Container): void | Promise<void> {
    const config: LoadingTipConfiguration = {
      ...LoadingTipStep.DefaultSettings,
      ...this.config
    };

    const style = styleFromJSON(config.style);

    if (!ACTIVE_TEXT_ELEMENT) {
      ACTIVE_TEXT_ELEMENT = new PIXI.HTMLText(config.message ?? "");
      container.parent.addChild(ACTIVE_TEXT_ELEMENT);
    }
    ACTIVE_TEXT_ELEMENT.text = messageFromConfig(config);
    ACTIVE_TEXT_ELEMENT.style = style;

    const [x, y] = positionFromConfig(config);
    const anchor = anchorFromConfig(config);


    ACTIVE_TEXT_ELEMENT.anchor.x = anchor[0];
    ACTIVE_TEXT_ELEMENT.anchor.y = anchor[1];
    ACTIVE_TEXT_ELEMENT.x = x;
    ACTIVE_TEXT_ELEMENT.y = y;

    if (config.duration) {
      return new Promise(resolve => {
        setTimeout(() => {
          this.teardown();
          resolve();
        }, config.duration);
      })
    }

  }

  // public static addEventListeners(element: HTMLElement | JQuery<HTMLElement>, config?: TransitionConfiguration): void { }
  public static addEventListeners(element: HTMLElement | JQuery<HTMLElement>): void {
    const elem = $(element);
    setMessageSource(elem, elem.find("#sourceType").val() as LoadingTipSource);
    elem.find("#sourceType").on("input", () => {
      const source = elem.find("#sourceType").val() as LoadingTipSource;
      setMessageSource(elem, source);
      if (source === "string") elem.find("#table").removeAttr("required");
      else if (source === "rolltable") elem.find("#table").attr("required", "true");
    });
  }

  public teardown(): void {
    if (ACTIVE_TEXT_ELEMENT) {
      ACTIVE_TEXT_ELEMENT.destroy();
      ACTIVE_TEXT_ELEMENT = null;
    }
  }
}

function styleFromJSON(json: object): PIXI.HTMLTextStyle {
  const style = new PIXI.HTMLTextStyle();
  deepCopy(style, json);
  return style;
}


function messageFromConfig(config: LoadingTipConfiguration): string {
  // Check for UUID
  if (config.source === "rolltable") {
    if (!config.table) throw new InvalidRollTableError(config.table);
    const table = fromUuidSync(config.table)
    if (!(table instanceof RollTable)) throw new InvalidRollTableError(config.table);
    return table.results.contents[Math.floor(Math.random() * table.results.contents.length)].text;
  } else {
    return config.message ?? "";
  }
}

function getVisualRectangle(): Rectangle {
  return {
    x: elementRight("#controls"),
    y: elementBottom("#ui-top"),
    width: ($("#sidebar").offset() ?? { top: 0, left: 0 }).left - elementRight("#controls"),
    height: ($("#ui-bottom").offset() ?? { top: 0, left: 0 }).top - elementBottom("#ui-top") - 25
  }
}

function anchorFromConfig(config: LoadingTipConfiguration): [number, number] {
  switch (config.location) {
    case "topleft":
      return [0, 0];
    case "topcenter":
      return [0.5, 0];
    case "topright":
      return [1, 0];
    case "center":
      return [0.5, 0.5];
    case "bottomleft":
      return [0, 1];
    case "bottomcenter":
      return [0.5, 1];
    case "bottomright":
      return [1, 1];
    default:
      throw new InvalidTipLocationError(config.location);
  }
}

function positionFromConfig(config: LoadingTipConfiguration): [number, number] {
  const viewBox = getVisualRectangle();
  switch (config.location) {
    case "topleft":
      return [viewBox.x, viewBox.y];
    case "topcenter":
      return [window.innerWidth / 2, viewBox.y];
    case "topright":
      return [viewBox.x + viewBox.width, viewBox.y];
    case "bottomleft":
      return [viewBox.x, viewBox.y + viewBox.height];
    case "bottomcenter":
      return [window.innerWidth / 2, viewBox.y + viewBox.height];
    case "bottomright":
      return [viewBox.x + viewBox.width, viewBox.height + viewBox.y];
    case "center":
      return [window.innerWidth / 2, window.innerHeight / 2];
    default:
      throw new InvalidTipLocationError(config.location);
  }
}

function elementRight(selector: string): number {
  return (($(selector).offset() ?? { top: 0, left: 0 }).left ?? 0) + ($(selector).width() as number ?? 0);
}

function elementBottom(selector: string): number {
  return (($(selector).offset() ?? { top: 0, left: 0 }).top ?? 0) + ($(selector).height() as number ?? 0);
}

function getRollTables(): RollTable[] {
  return [
    ...(game?.tables?.contents ?? [])
  ]
}

function setMessageSource(html: JQuery<HTMLElement>, source: LoadingTipSource) {
  html.find("[data-source-type]").css("display", "none");
  html.find(`[data-source-type="${source}"]`).css("display", "block");
}