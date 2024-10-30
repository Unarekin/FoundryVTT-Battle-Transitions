import { TransitionStep } from "./TransitionStep";
import { SoundConfiguration } from "./types";
import { TransitionSequence } from "../interfaces";

export class SoundStep extends TransitionStep<SoundConfiguration> {
  static name = "SOUND";
  #sound: Sound | null = null;
  public readonly template = "sound-config";
  public readonly defaultSettings: Partial<SoundConfiguration> = {
    volume: 100
  };

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
}
