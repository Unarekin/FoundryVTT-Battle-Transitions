import { TransitionStep } from './TransitionStep';
import { LoadingTipConfiguration } from './types';
import { localize, log, parseConfigurationFormElements } from '../utils';


export class LoadingTipStep extends TransitionStep<LoadingTipConfiguration> {
  public static DefaultSettings: LoadingTipConfiguration = {
    id: "",
    type: "loadingtip",
    version: "1.1.0",
    duration: 0,
    source: "string",
    message: "Loading",
    localize: true,
    location: "bottomcenter",
    fontFamily: "",
    fontColor: "#FFFFFF",
    fontSize: 128,

  }

  public static category = "effect";
  public static hidden: boolean = false;
  public static icon = `<i class="fas fa-spinner"></i>`
  public static key = "loadingtip";
  public static name = "LOADINGTIP";
  public static template = "loadingtip-config";

  public static async RenderTemplate(config?: LoadingTipConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${LoadingTipStep.template}.hbs`, {
      ...LoadingTipStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {})
    });
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
    return new LoadingTipStep({
      ...LoadingTipStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "message", "source", "table", "duration", "randomize", "location", "localize")
    });
  }

  #textObject: PIXI.HTMLText | null = null;

  public execute(container: PIXI.Container): void {
    const config: LoadingTipConfiguration = {
      ...LoadingTipStep.DefaultSettings,
      ...this.config
    }
    const style = new PIXI.HTMLTextStyle({
      fontFamily: config.fontFamily,
      fill: new PIXI.Color(config.fontColor).toHex(),
      fontSize: config.fontSize
    });

    const message: string = config.source === "string" ? config.message ?? "" : "temp";

    const text = new PIXI.HTMLText(config.localize ? localize(message) : message, style);

    text.anchor.x = 0.5;
    text.anchor.y = 0.5;

    switch (config.location) {
      case "bottomcenter":
        text.x = window.innerWidth / 2;
        text.y = window.innerHeight - (text.height / 2) - 100;
        break;
      case "bottomleft":
      case "bottomright":
      case "center":
      case "topcenter":
      case "topleft":
      case "topright":
      default:

    }

    this.#textObject = text;
    container.parent.addChild(text);
  }

  public teardown(): void {
    log("Tearing down:", this.config);
    if (this.#textObject) {
      this.#textObject.destroy();
      this.#textObject = null;
    }
  }

}