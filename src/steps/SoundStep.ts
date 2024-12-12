import { TransitionStep } from "./TransitionStep";
import { SoundConfiguration } from "./types";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";

export class SoundStep extends TransitionStep<SoundConfiguration> {
  // #region Properties (8)

  #sound: Sound | null = null;

  public static DefaultSettings: SoundConfiguration = {
    id: "",
    type: "sound",
    volume: 100,
    file: "",
    version: "1.1.0"
  }

  public static category = "technical";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon sound fa-fw fas'></i>"
  public static key = "sound";
  public static name = "SOUND";
  public static template = "sound-config";
  public static addDurationToTotal: boolean = false;

  // #endregion Properties (8)

  // #region Public Static Methods (8)

  public static async RenderTemplate(config?: SoundConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${SoundStep.template}.hbs`, {
      ...SoundStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {})
    });
  }

  public static addEventListeners(element: HTMLElement | JQuery<HTMLElement>): void {
    const html = $(element);
    html.find("#file input").attr("required", "true");
    html.find("form input").trigger("input");
  }

  public static from(config: SoundConfiguration): SoundStep
  public static from(form: HTMLFormElement): SoundStep
  public static from(form: JQuery<HTMLFormElement>): SoundStep
  public static from(arg: unknown): SoundStep {
    if (arg instanceof HTMLFormElement) return SoundStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return SoundStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new SoundStep(arg as SoundConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): SoundStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const file = elem.find("#file").val() as string ?? "";
    const volume = elem.find("#volume").val() as number ?? 100;

    return new SoundStep({
      ...SoundStep.DefaultSettings,
      file,
      volume,
      ...parseConfigurationFormElements(elem, "id", "label")
    })
  }

  //public static getDuration(config: PixelateConfiguration): number { return { ...PixelateStep.DefaultSettings, ...config }.duration }
  public static async getDuration(config: SoundConfiguration): Promise<number> {
    const exist = await srcExists(config.file);
    if (!exist) return 0;

    return new Promise<number>((resolve, reject) => {
      const audio = new Audio();
      audio.onloadedmetadata = () => { resolve(Math.round(audio.duration * 1000)); };
      audio.onerror = (e, src, line, col, err) => {
        if (err) reject(err);
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        else reject(new Error(e.toString()));
      }

      audio.src = config.file;
    })
  }

  // #endregion Public Static Methods (8)

  // #region Public Methods (3)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: SoundConfiguration = {
      ...SoundStep.DefaultSettings,
      ...this.config
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const sound = await foundry.audio.AudioHelper.play({ src: this.config.file, volume: config.volume / 100, autoplay: true }, true) as Sound;
    this.#sound = sound;
  }

  public async prepare(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await foundry.audio.AudioHelper.preloadSound(this.config.file);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public teardown(container: PIXI.Container): void {
    this.#sound?.stop();
  }

  // #endregion Public Methods (3)
}
