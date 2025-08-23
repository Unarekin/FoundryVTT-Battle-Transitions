import { FileNotFoundError } from "../errors";
import { ChromaKeyFilter, TextureSwapFilter } from "../filters";
import { TransitionSequence } from "../interfaces";
import { createColorTexture, getFormDataExtended, renderTemplateFunc } from "../utils";
import { generateBackgroundTypeSelectOptions } from "./selectOptions";
import { TransitionStep } from "./TransitionStep";
import { VideoConfiguration } from "./types";

export class VideoStep extends TransitionStep<VideoConfiguration> {
  // #region Properties (7)

  #preloadedVideo: PIXI.Texture | null = null;
  #videoContainer: PIXI.Container | null = null;

  public static DefaultSettings: VideoConfiguration = Object.freeze({
    id: "",
    type: "video",
    volume: 100,
    clear: false,
    file: "",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000",
    videoSizingMode: "stretch",
    version: "1.1.9",
    chromaKey: "#0CA023",
    chromaRange: [0.11, 0.22],
    enableChromaKey: false
  });

  public static hidden: boolean = false;
  public static key = "video";
  public static name = "VIDEO";
  public static template = "video-config";
  public static icon = "<i class='bt-icon bt-video fa-fw fas'></i>"
  public static category = "effect";

  // #endregion Properties (7)

  // #region Public Static Methods (6)

  public static async RenderTemplate(config?: VideoConfiguration): Promise<string> {
    const actualConfig = {
      ...VideoStep.DefaultSettings,
      ...(config ? config : {})
    };

    return (renderTemplateFunc())(`modules/${__MODULE_ID__}/templates/config/${VideoStep.template}.hbs`, {
      ...VideoStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      bgTypeSelect: generateBackgroundTypeSelectOptions(),
      keyRangeX: actualConfig.chromaRange[0],
      keyRangeY: actualConfig.chromaRange[1]
    });
  }

  public static from(config: VideoConfiguration): VideoStep
  public static from(form: JQuery<HTMLFormElement>): VideoStep
  public static from(form: HTMLFormElement): VideoStep
  public static from(arg: unknown): VideoStep {
    if (arg instanceof HTMLFormElement) return VideoStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return VideoStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new VideoStep(arg as VideoConfiguration);
  }

  public static addEventListeners(element: HTMLElement | JQuery<HTMLElement>): void {
    const html = $(element);
    html.find("#file input").attr("required", "true");
    html.find("form input").trigger("input");
  }

  public static fromFormElement(form: HTMLFormElement): VideoStep {
    const formData = getFormDataExtended(form);
    const data = (foundry.utils.expandObject(formData.object) as Record<string, unknown>).step as Partial<VideoConfiguration>;

    // data.chromaRange = [(data as any).keyRangeX, (data as any).keyRangeY];

    return new VideoStep({
      ...VideoStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...data
    });
  }


  // #endregion Public Static Methods (6)

  public static async getDuration(config: VideoConfiguration): Promise<number> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const exist = await (game?.release?.isNewer("13") ? (foundry as any).canvas.srcExists(config.file) : srcExists(config.file));
    if (!exist) return 0;

    return new Promise<number>((resolve, reject) => {
      const vid = document.createElement("video");
      vid.onloadedmetadata = () => { resolve(Math.round(vid.duration * 1000)); };
      vid.onerror = (e, src, line, col, err) => {
        if (err) reject(err);
        // eslint-disable-next-line @typescript-eslint/no-base-to-string
        else reject(new Error(e.toString()));
      };

      vid.src = config.file;
    });
  }

  // #region Public Methods (3)

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: VideoConfiguration = {
      ...VideoStep.DefaultSettings,
      ...this.config
    };

    const texture = this.#preloadedVideo;
    if (!texture) throw new FileNotFoundError(config.file);

    const background = this.config.deserializedTexture ?? createColorTexture("transparent");
    const resource = texture?.baseTexture.resource as PIXI.VideoResource;
    const source = resource.source;
    source.volume = config.volume / 100;

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
      container.addChild(videoContainer);

      if (config.enableChromaKey) {
        const chromaFilter = new ChromaKeyFilter(config.chromaKey);
        this.addFilter(sprite, chromaFilter);
      }

      source.addEventListener("ended", () => {
        if (config.clear) setTimeout(() => {
          sprite.renderable = false;
        }, 500);
        resolve();
      });

      source.addEventListener("error", e => { reject(e.error as Error); });

      void source.play();
    })
  }

  public async prepare(): Promise<void> {
    const config: VideoConfiguration = {
      ...VideoStep.DefaultSettings,
      ...this.config
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const texture: PIXI.Texture = await (PIXI.loadVideo as any).load(config.file) as PIXI.Texture;
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
