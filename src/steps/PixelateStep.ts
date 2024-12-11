import { PreparedTransitionHash, TransitionSequence } from '../interfaces';
import { addFilterToScene, removeFilterFromScene } from '../transitionUtils';
import { parseConfigurationFormElements } from '../utils';
import { generateDualStyleSelectOptions, generateEasingSelectOptions } from './selectOptions';
import { TransitionStep } from './TransitionStep';
import { PixelateConfiguration } from './types';

export class PixelateStep extends TransitionStep<PixelateConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: PixelateConfiguration = {
    id: "",
    type: "pixelate",
    version: "1.1.0",
    maxSize: 100,
    duration: 1000,
    easing: "none",
    applyToScene: false,
    applyToOverlay: true
  };
  public static category: string = "effect";
  public static hidden: boolean = false;
  public static icon = `<i class="fas fa-fw fa-image"></i>`
  public static key: string = "pixelate";
  public static name: string = "PIXELATE";
  public static template: string = "pixelate-config";
  public static reversible: boolean = true;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static async RenderTemplate(config?: PixelateConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${PixelateStep.template}.hbs`, {
      ...PixelateStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      dualStyleSelect: generateDualStyleSelectOptions(),
      dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay",
      easingSelect: generateEasingSelectOptions(),
    });
  }

  public static from(config: PixelateConfiguration): PixelateStep
  public static from(form: HTMLFormElement): PixelateStep
  public static from(form: JQuery<HTMLFormElement>): PixelateStep
  public static from(arg: unknown): PixelateStep {
    if (arg instanceof HTMLFormElement) return PixelateStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return PixelateStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new PixelateStep(arg as PixelateConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): PixelateStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const dualStyle = elem.find("#dualStyle").val() as string;

    return new PixelateStep({
      ...PixelateStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "maxSize", "label", "easing"),
      applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
      applyToScene: dualStyle === "scene" || dualStyle === "both",

    });
  }

  public static getDuration(config: PixelateConfiguration): number { return { ...PixelateStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  #sceneFilter: PIXI.Filter | null = null;

  #filters: PIXI.Filter[] = [];

  public async reverse(): Promise<void> {
    const config: PixelateConfiguration = {
      ...PixelateStep.DefaultSettings,
      ...this.config
    }

    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.#filters.map(filter => TweenMax.to(filter.uniforms.size, { 0: 1, 1: 1, duration: config.duration / 1000, ease: config.easing }))
    );
  }

  public teardown(): Promise<void> | void {
    if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
    this.#sceneFilter = null;
  }

  public async execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> {
    const config: PixelateConfiguration = {
      ...PixelateStep.DefaultSettings,
      ...this.config
    }

    const filters: PIXI.Filter[] = [];

    if (config.applyToOverlay) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const filter = new (PIXI.filters as any).PixelateFilter(1) as PIXI.Filter;
      this.addFilter(container, filter);
      filters.push(filter);
    }

    if (config.applyToScene && canvas?.stage) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const filter = new (PIXI.filters as any).PixelateFilter(1) as PIXI.Filter;
      addFilterToScene(filter, prepared.prepared);
      filters.push(filter);
      this.#sceneFilter = filter;
    }

    this.#filters = [...filters];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await Promise.all(filters.map(filter => TweenMax.to(filter.uniforms.size, { 0: config.maxSize, 1: config.maxSize, duration: config.duration / 1000, ease: config.easing }) as Promise<void>));
  }

  // #endregion Public Methods (1)
}