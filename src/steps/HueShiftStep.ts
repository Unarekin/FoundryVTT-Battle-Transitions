import { HueShiftConfiguration } from './types';
import { TransitionStep } from './TransitionStep';
import { HueShiftFilter } from '../filters';
import { generateEasingSelectOptions, parseConfigurationFormElements } from '../utils';
import { addFilterToScene, removeFilterFromScene } from '../transitionUtils';
import { PreparedTransitionHash, TransitionSequence } from '../interfaces';

export class HueShiftStep extends TransitionStep<HueShiftConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: HueShiftConfiguration = {
    id: "",
    type: "hueshift",
    duration: 0,
    version: "1.1.0",
    maxShift: 0,
    easing: "none",
    applyToOverlay: true,
    applyToScene: false
  };
  public static category: string = "effect";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon hue-shift fa-fw fas'></i>"
  public static key: string = "hueshift";
  public static name: string = "HUESHIFT";
  public static template: string = "hueshift-config";
  public static reversible: boolean = true;

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: HueShiftConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${HueShiftStep.template}.hbs`, {
      ...HueShiftStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      dualStyleSelect: {
        "overlay": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.OVERLAY`,
        "scene": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.SCENE`,
        "both": `BATTLETRANSITIONS.SCENECONFIG.COMMON.DUALSTYLE.BOTH`
      },
      dualStyle: config ? config.applyToOverlay && config.applyToScene ? "both" : config.applyToOverlay ? "overlay" : config.applyToScene ? "scene" : "overlay" : "overlay"
    });
  }

  public static from(config: HueShiftConfiguration): HueShiftStep
  public static from(form: JQuery<HTMLFormElement>): HueShiftStep
  public static from(form: HTMLFormElement): HueShiftStep
  public static from(arg: unknown): HueShiftStep {
    if (arg instanceof HTMLFormElement) return HueShiftStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return HueShiftStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    return new HueShiftStep(arg as HueShiftConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): HueShiftStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const maxShift = elem.find("#maxShift input[type='number']").val() as number;
    const dualStyle = elem.find("#dualStyle").val() as string;

    return new HueShiftStep({
      ...HueShiftStep.DefaultSettings,
      maxShift,
      ...parseConfigurationFormElements(elem, "id", "duration", "easing", "label"),
      applyToOverlay: dualStyle === "overlay" || dualStyle === "both",
      applyToScene: dualStyle === "scene" || dualStyle === "both"
    })
  }

  public static getDuration(config: HueShiftConfiguration): number { return { ...HueShiftStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  #sceneFilter: PIXI.Filter | null = null;

  public teardown(): Promise<void> | void {
    if (this.#sceneFilter) removeFilterFromScene(this.#sceneFilter);
    this.#sceneFilter = null;
  }

  #filters: HueShiftFilter[] = [];
  public async reverse(): Promise<void> {
    const config: HueShiftConfiguration = {
      ...HueShiftStep.DefaultSettings,
      ...this.config
    };
    await Promise.all(
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
      this.#filters.map(filter => TweenMax.to(filter.uniforms, { shift: 0, duration: config.duration / 1000, ease: config.easing }))
    );
  }

  public async execute(container: PIXI.Container, sequence: TransitionSequence, prepared: PreparedTransitionHash): Promise<void> {
    const config: HueShiftConfiguration = {
      ...HueShiftStep.DefaultSettings,
      ...this.config
    };

    const filters: HueShiftFilter[] = [];

    if (config.applyToOverlay) {
      const filter = new HueShiftFilter(0);
      this.addFilter(container, filter);
      filters.push(filter);
    }

    if (config.applyToScene && canvas?.stage) {
      const filter = new HueShiftFilter(0);
      addFilterToScene(filter, prepared.prepared);
      this.#sceneFilter = filter;
      filters.push(filter);

    }


    this.#filters = [...filters];
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return
    await Promise.all(filters.map(filter => TweenMax.to(filter.uniforms, { shift: config.maxShift, duration: config.duration / 1000, ease: config.easing ?? "none" })));
  }

  // #endregion Public Methods (1)
}