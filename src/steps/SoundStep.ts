import { TransitionStep } from "./TransitionStep";
import { SoundConfiguration } from "./types";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";

export class SoundStep extends TransitionStep<SoundConfiguration> {
  // #region Properties (6)

  #sound: Sound | null = null;

  public static DefaultSettings: SoundConfiguration = {
    type: "sound",
    volume: 100,
    file: "",
    version: "1.1.0"
  }

  public static hidden: boolean = false;
  public static key = "sound";
  public static name = "SOUND";
  public static template = "sound-config";

  // #endregion Properties (6)

  // #region Public Static Methods (6)

  public static async RenderTemplate(config?: SoundConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${SoundStep.template}.hbs`, {
      ...SoundStep.DefaultSettings,
      ...(config ? config : {})
    });
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
    return new SoundStep({
      ...SoundStep.DefaultSettings,
      file,
      ...parseConfigurationFormElements(elem, "id", "volume")
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (3)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const sound = await foundry.audio.AudioHelper.play({ src: this.config.file, volume: this.config.volume / 100, autoplay: true }, true) as Sound;
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
