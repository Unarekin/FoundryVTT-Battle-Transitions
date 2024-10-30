import { FileNotFoundError } from "../errors";
import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { VideoConfiguration } from "./types";

export class VideoStep extends TransitionStep<VideoConfiguration> {
  #preloadedVideo: PIXI.Texture | null = null;
  static name = "VIDEO";

  public readonly template = "video-config";
  public readonly defaultSettings: Partial<VideoConfiguration> = {
    volume: 100,
    clear: false
  };

  public async prepare(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const texture: PIXI.Texture = await (PIXI.loadVideo as any).load(this.config.file) as PIXI.Texture;
    this.#preloadedVideo = texture;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    if (!this.#preloadedVideo) throw new FileNotFoundError(this.config.file);
    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const resource: PIXI.VideoResource = this.#preloadedVideo.baseTexture.resource as PIXI.VideoResource;
    const source = resource.source;

    return new Promise<void>((resolve, reject) => {
      if (!this.#preloadedVideo) throw new FileNotFoundError(this.config.file);
      const swapFilter = new TextureSwapFilter(this.#preloadedVideo.baseTexture);
      const sprite = PIXI.Sprite.from(this.#preloadedVideo);
      const bgSprite = PIXI.Sprite.from(background);

      const videoContainer = new PIXI.Container();
      videoContainer.addChild(bgSprite, sprite);
      bgSprite.width = window.innerWidth;
      bgSprite.height = window.innerHeight;
      sprite.width = window.innerWidth;
      sprite.height = window.innerHeight;

      source.currentTime = 0;
      sprite.filters = [swapFilter];

      container.addChild(videoContainer);

      source.addEventListener("ended", () => {
        if (this.config.clear) setTimeout(() => { sprite.destroy(); }, 500);
        resolve();
      });
      source.addEventListener("error", e => { reject(e.error as Error); });

      void source.play();
    })
  }
}