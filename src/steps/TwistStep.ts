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
    direction: "clockwise"
  };
  public static category = "warp";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon twist fa-fw fas'></i>"
  public static key = "twist";
  public static name = "TWIST";
  public static template = "twist-config";

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static async RenderTemplate(config?: TwistConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${TwistStep.template}.hbs`, {
      ...TwistStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),

      directionSelect: generateClockDirectionSelectOptions(),
      easingSelect: generateEasingSelectOptions()
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
    return new TwistStep({
      ...TwistStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "direction", "easing", "label")
    })
  }

  public static getDuration(config: TwistConfiguration): number { return { ...TwistStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  public async execute(container: PIXI.Container): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const filter = new (PIXI.filters as any).TwistFilter({
      radius: window.innerWidth,
      angle: 0,
      offset: { x: window.innerWidth / 2, y: window.innerHeight / 2 }
    }) as PIXI.Filter;

    this.addFilter(container, filter);

    const config: TwistConfiguration = {
      ...TwistStep.DefaultSettings,
      ...this.config
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { angle: this.config.direction === "clockwise" ? config.maxAngle * -1 : this.config.maxAngle, duration: config.duration / 1000, ease: this.config.easing || "none" });
    // await TweenMax.to(filter.uniforms, {  })
  }

  // #endregion Public Methods (1)
}