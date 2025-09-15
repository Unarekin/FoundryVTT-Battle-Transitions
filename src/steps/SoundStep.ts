import { TransitionStep } from "./TransitionStep";
import { SoundConfiguration, TransitionConfiguration } from "./types";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";
import { FileNotFoundError } from "../errors";
import { SoundConfigApplication } from "../applications";

export class SoundStep extends TransitionStep<SoundConfiguration> {
  // #region Properties (8)

  // #sound: Sound | null = null;

  public static DefaultSettings: SoundConfiguration = Object.freeze({
    id: "",
    type: "sound",
    volume: 100,
    file: "",
    version: "1.1.0"
  });

  public static category = "technical";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-sound fa-fw fas'></i>"
  public static key = "sound";
  public static name = "SOUND";
  public static addDurationToTotal: boolean = false;

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  public static ConfigurationApplication = SoundConfigApplication as any;

  // #endregion Properties (8)

  // #region Public Static Methods (8)
  static getListDescription(config?: SoundConfiguration): string {
    if (config) return game.i18n?.format("BATTLETRANSITIONS.SOUND.LABEL", { file: config.file }) ?? "";
    else return "";
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
    const file = elem.find(`[name="step.file"]`).val() as string ?? "";

    const volume = elem.find("[name='step.volume']").val() as number ?? 100;

    return new SoundStep({
      ...SoundStep.DefaultSettings,
      file,
      volume,
      ...parseConfigurationFormElements(elem, "id", "label")
    })
  }

  //public static getDuration(config: PixelateConfiguration): number { return { ...PixelateStep.DefaultSettings, ...config }.duration }
  public static async getDuration(config: SoundConfiguration): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const exist = await (game?.release?.isNewer("13") ? (foundry as any).canvas.srcExists(config.file) : srcExists(config.file));
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

  public static async validate(config: SoundConfiguration,): Promise<TransitionConfiguration | Error> {
    if (config.file) {
      const exists = await srcExists(config.file);
      if (!exists) return new FileNotFoundError(config.file);
      return config;
    } else {
      return new FileNotFoundError(typeof config.file === "string" ? config.file : typeof config.file)
    }

  }

  // #endregion Public Static Methods (8)

  // #region Public Methods (3)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: SoundConfiguration = {
      ...SoundStep.DefaultSettings,
      ...this.config
    }

    if (foundry.audio?.AudioHelper) {
      // // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      // const sound = await foundry.audio.AudioHelper.play({ src: this.config.file ?? "", volume: config.volume / 100, autoplay: true }, true) as Sound;
      // // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      // const sound = await foundry.audio.AudioHelper.play({ src: this.config.file ?? "", volume: config.volume / 100, autoplay: true }, true) as Sound;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await foundry.audio.AudioHelper.play({ src: this.config.file ?? "", volume: config.volume / 100, autoplay: true }, false);
      // this.#sound = sound;
    } else {
      // const sound = await AudioHelper.play({ src: this.config.file ?? "", volume: config.volume / 100, autoplay: true }, true);
      await AudioHelper.play({ src: this.config.file ?? "", volume: config.volume / 100, autoplay: true }, false);
      // this.#sound = sound;
    }
  }

  public async prepare(): Promise<void> {
    if (foundry.audio?.AudioHelper) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      await foundry.audio.AudioHelper.preloadSound(this.config.file);
    } else {
      await AudioHelper.preloadSound(this.config.file ?? "");
    }
  }

  public teardown(): void {
    // this.#sound?.stop();
  }

  // #endregion Public Methods (3)
}
