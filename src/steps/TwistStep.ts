import { TransitionSequence, PreparedTransitionHash } from '../interfaces';
import { addFilterToScene, removeFilterFromScene } from '../transitionUtils';
import { generateClockDirectionSelectOptions, generateEasingSelectOptions, parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { TwistConfiguration } from './types';
export class TwistStep extends TransitionStep<TwistConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: TwistConfiguration = {
    id: "",
    type: "twist",
    version: "1.1.0",
    duration: 1000,
    maxAngle: 10,
    easing: "none",
    direction: "clockwise",
    applyToScene: false,
    applyToOverlay: true
  };
  public static category = "warp";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon twist fa-fw fas'></i>"
  public static key = "twist";
  public static name = "TWIST";
  public static template = "twist-config";
  public static reversible: boolean = true;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static async RenderTemplate(config?: TwistConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${TwistStep.template}.hbs`, {
      ...TwistStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),

      directionSelect: generateClockDirectionSelectOptions(),
      easingSelect: generateEasingSelectOptions(),
      dualStyleSelect: {
        "overlay": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.OVERLAY`,
        "scene": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.SCENE`,
        "both": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.BOTH`
      },
      dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
    });
  }

  public static from(config: TwistConfiguration): TwistStep
  public static from(form: HTMLFormElement): TwistStep
  public static from(form: JQuery<HTMLFormElement>): TwistStep
  public static from(arg: unknown): TwistStep {
    if (arg instanceof HTMLFormElement) return TwistStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return TwistStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new TwistStep(arg as TwistConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): TwistStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const dualStyle = elem.find("#dualStyle").val() as string;
    return new TwistStep({
      ...TwistStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "direction", "easing", "label"),
      applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
      applyToScene: dualStyle === "scene" || dualStyle === "both"
    })
  }

  public static getDuration(config: TwistConfiguration): number { return { ...TwistStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  #sceneFilter: PIXI.Filter | null = null;

  public teardown(): Promise<void> | void {
    if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
    this.#sceneFilter = null;
  }

  #filters: PIXI.Filter[] = [];


  public async reverse(): Promise<void> {
    const config: TwistConfiguration = {
      ...TwistStep.DefaultSettings,
      ...this.config
    }
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
      this.#filters.map(filter => TweenMax.to(filter.uniforms, { angle: 0, duration: config.duration / 1000, ease: config.easing }))
    )
  }

  // #filter: RadialWipeFilter | null = null;
  // public async reverse(): Promise<void> {
  //   if (this.#filter instanceof RadialWipeFilter) await this.simpleReverse(this.#filter);
  // }

  public async execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> {
    const config: TwistConfiguration = {
      ...TwistStep.DefaultSettings,
      ...this.config
    }
    const filters: PIXI.Filter[] = [];

    if (config.applyToOverlay) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const filter = new (PIXI.filters as any).TwistFilter({
        radius: window.innerWidth,
        angle: 0,
        offset: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      }) as PIXI.Filter;

      this.addFilter(container, filter);
      filters.push(filter);
    }

    if (config.applyToScene && canvas?.stage) {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      const filter = new (PIXI.filters as any).TwistFilter({
        radius: window.innerWidth,
        angle: 0,
        offset: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
      }) as PIXI.Filter;
      addFilterToScene(filter, prepared.prepared);
      filters.push(filter);
    }

    this.#filters = [...filters];

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    await Promise.all(filters.map(filter => TweenMax.to(filter.uniforms, { angle: this.config.direction === "clockwise" ? config.maxAngle * -1 : this.config.maxAngle, duration: config.duration / 1000, ease: this.config.easing || "none" })));
  }

  // #endregion Public Methods (1)
}
