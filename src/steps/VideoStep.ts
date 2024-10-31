import { FileNotFoundError } from "../errors";
import { TextureSwapFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { log, createColorTexture, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { VideoConfiguration } from "./types";

export class VideoStep extends TransitionStep<VideoConfiguration> {
  // #region Properties (7)

  #preloadedVideo: PIXI.Texture | null = null;
  #videoContainer: PIXI.Container | null = null;

  public static DefaultSettings: VideoConfiguration = {
    type: "video",
    volume: 100,
    clear: false,
    file: "",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000",
    videoSizingMode: "stretch",
    version: "1.1.0"
  }

  public static hidden: boolean = false;
  public static key = "video";
  public static name = "VIDEO";
  public static template = "video-config";

  // #endregion Properties (7)

  // #region Public Static Methods (6)

  public static async RenderTemplate(config?: VideoConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${VideoStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...VideoStep.DefaultSettings,
      ...(config ? config : {})
    });
  }

  public static from(config: VideoConfiguration): VideoStep
  public static from(form: JQuery<HTMLFormElement>): VideoStep
  public static from(form: HTMLFormElement): VideoStep
  public static from(arg: unknown): VideoStep {
    if (arg instanceof HTMLFormElement) return VideoStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return VideoStep.fromFormElement(arg[0]);
    else return new VideoStep(arg as VideoConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): VideoStep {
    const file = $(form).find("#file").val() as string ?? "";
    const volume = $(form).find("#volume input[type='number']").val() as number;
    const backgroundImage = $(form).find("#backgroundImage").val() as string ?? ""
    return new VideoStep({
      ...VideoStep.DefaultSettings,
      ...(file ? { file } : {}),
      ...(volume ? { volume: volume / 100 } : {}),
      serializedTexture: backgroundImage,
      ...parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "background", "backgroundType", "backgroundColor")
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (3)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    log("executeVideo:", [...container.children]);
    const texture = this.#preloadedVideo;
    if (!texture) throw new FileNotFoundError(this.config.file);

    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const resource = texture?.baseTexture.resource as PIXI.VideoResource;
    const source = resource.source;

    return new Promise<void>((resolve, reject) => {
      const swapFilter = new TextureSwapFilter(texture.baseTexture);
      const sprite = PIXI.Sprite.from(texture);
      const bgSprite = PIXI.Sprite.from(background);

      const videoContainer = new PIXI.Container();
      videoContainer.addChild(bgSprite);
      bgSprite.width = window.innerWidth;
      bgSprite.height = window.innerHeight;
      videoContainer.addChild(sprite);
      sprite.width = window.innerWidth;
      sprite.height = window.innerHeight;
      sprite.filters = [swapFilter];
      source.currentTime = 0;

      this.#videoContainer = videoContainer;
      container.parent.addChild(videoContainer);

      source.addEventListener("ended", () => {
        if (this.config.clear) setTimeout(() => { sprite.destroy(); }, 500);
        resolve();
      });

      source.addEventListener("error", e => { reject(e.error as Error); });

      void source.play();
    })
  }

  public async prepare(): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const texture: PIXI.Texture = await (PIXI.loadVideo as any).load(this.config.file) as PIXI.Texture;
    this.#preloadedVideo = texture;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public teardown(container: PIXI.Container): void {
    if (!this.#videoContainer) return;
    const children = [...this.#videoContainer.children];
    for (const child of children) child.destroy();
    this.#videoContainer.destroy();
  }

  // #endregion Public Methods (3)
}
