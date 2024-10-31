import { TransitionStep } from "./TransitionStep";
import { SoundConfiguration } from "./types";
import { TransitionSequence } from "../interfaces";
import { parseConfigurationFormElements } from "../utils";

export class SoundStep extends TransitionStep<SoundConfiguration> {
  static name = "SOUND";
  #sound: Sound | null = null;
  public readonly template = "sound-config";

  static DefaultSettings: SoundConfiguration = {
    type: "sound",
    volume: 100,
    file: ""
  }

  override async prepare(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await foundry.audio.AudioHelper.preloadSound(this.config.file);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public teardown(container: PIXI.Container): void {
    this.#sound?.stop();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const sound = await foundry.audio.AudioHelper.play({ src: this.config.file, volume: this.config.volume / 100, autoplay: true }, true) as Sound;
    this.#sound = sound;
  }

  static from(config: SoundConfiguration): SoundStep
  static from(form: HTMLFormElement): SoundStep
  static from(form: JQuery<HTMLFormElement>): SoundStep
  static from(arg: unknown): SoundStep {
    if (arg instanceof HTMLFormElement) return SoundStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return SoundStep.fromFormElement(arg[0]);
    else return new SoundStep(arg as SoundConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): SoundStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const file = elem.find("#file").val() as string ?? "";
    return new SoundStep({
      ...SoundStep.DefaultSettings,
      file,
      ...parseConfigurationFormElements(elem, "id", "volume")
    })
  }
}
