import { PreparedTransitionHash, TransitionSequence } from '../interfaces';
import { addFilterToScene, removeFilterFromScene } from '../transitionUtils';
import { parseConfigurationFormElements, renderTemplateFunc, templateDir } from '../utils';
import { generateDualStyleSelectOptions, generateEasingSelectOptions } from './selectOptions';
import { TransitionStep } from './TransitionStep';
import { ZoomBlurConfiguration } from './types';

export class ZoomBlurStep extends TransitionStep<ZoomBlurConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: ZoomBlurConfiguration = Object.freeze({
    id: "",
    type: "zoomblur",
    version: "1.1.6",
    duration: 1000,
    maxStrength: 0.5,
    easing: "none",
    innerRadius: 0,
    applyToOverlay: true,
    applyToScene: false
  });

  public static category = "warp";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon bt-zoom-blur fa-fw fas'></i>"
  public static key = "zoomblur";
  public static name = "ZOOMBLUR";
  public static template = "zoomblur-config";
  public static reversible: boolean = true;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static async RenderTemplate(config?: ZoomBlurConfiguration): Promise<string> {
    return (renderTemplateFunc())(templateDir(`config/${ZoomBlurStep.template}.hbs`), {
      ...ZoomBlurStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      dualStyleSelect: generateDualStyleSelectOptions(),
      dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
    });
  }

  public static from(config: ZoomBlurConfiguration): ZoomBlurStep
  public static from(form: HTMLFormElement): ZoomBlurStep
  public static from(form: JQuery<HTMLFormElement>): ZoomBlurStep
  public static from(arg: unknown) {
    if (arg instanceof HTMLFormElement) return ZoomBlurStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return ZoomBlurStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new ZoomBlurStep(arg as ZoomBlurConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): ZoomBlurStep {
    const elem = $(form) as JQuery<HTMLFormElement>;

    const maxStrength = elem.find("#maxStrength input[type='number'],input[type='range'][name='maxStrength']").val() as number ?? 1;
    const innerRadius = elem.find("#innerRadius input[type='number'],input[type='range'][name='innerRadius']").val() as number ?? 0;

    const dualStyle = elem.find("#dualStyle").val() as string;
    return new ZoomBlurStep({
      ...ZoomBlurStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "label", "easing"),
      maxStrength,
      innerRadius,
      applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
      applyToScene: dualStyle === "scene" || dualStyle === "both"
    });
  }

  public static getDuration(config: ZoomBlurConfiguration): number { return { ...ZoomBlurStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)
  #sceneFilter: PIXI.Filter | null = null;

  public teardown(): Promise<void> | void {
    if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
    this.#sceneFilter = null;
  }


  #filters: PIXI.Filter[] = [];

  public async reverse(): Promise<void> {
    const config: ZoomBlurConfiguration = {
      ...ZoomBlurStep.DefaultSettings,
      ...this.config
    };

    await Promise.all(
      this.#filters.map(filter => gsap.to(filter.uniforms, { uStrength: 0, duration: config.duration / 1000, ease: config.easing }))
    )
  }

  public async execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> {
    const config: ZoomBlurConfiguration = {
      ...ZoomBlurStep.DefaultSettings,
      ...this.config
    };

    const filters: PIXI.Filter[] = [];
    if (config.applyToOverlay) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const filter = new (PIXI.filters as any).ZoomBlurFilter({
        strength: 0,
        innerRadius: config.innerRadius * window.innerWidth,
        radius: -1,
        center: [window.innerWidth / 2, window.innerHeight / 2]

      }) as PIXI.Filter;

      this.addFilter(container, filter);
      filters.push(filter);
    }

    if (config.applyToScene && canvas?.stage) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const filter = new (PIXI.filters as any).ZoomBlurFilter({
        strength: 0,
        innerRadius: config.innerRadius * window.innerWidth,
        radius: -1,
        center: [window.innerWidth / 2, window.innerHeight / 2]

      }) as PIXI.Filter;

      this.#sceneFilter = filter;
      addFilterToScene(filter, prepared.prepared);
      filters.push(filter);
    }

    this.#filters = [...filters];
    await Promise.all(filters.map(filter => gsap.to(filter.uniforms, { uStrength: config.maxStrength, duration: config.duration / 1000, ease: config.easing || "none" })));
  }

  // #endregion Public Methods (1)
}