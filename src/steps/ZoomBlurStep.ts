import { generateEasingSelectOptions, parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { ZoomBlurConfiguration } from './types';

export class ZoomBlurStep extends TransitionStep<ZoomBlurConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: ZoomBlurConfiguration = {
    id: "",
    type: "zoomblur",
    version: "1.1.0",
    duration: 1000,
    maxStrength: 0.5,
    easing: "none",
    innerRadius: 0
  }

  public static category = "warp";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon zoomblur fa-fw fas'></i>"
  public static key = "zoomblur";
  public static name = "ZOOMBLUR";
  public static template = "zoomblur-config";

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static async RenderTemplate(config?: ZoomBlurConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${ZoomBlurStep.template}.hbs`, {
      ...ZoomBlurStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions()
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

    const maxStrength = elem.find("#maxStrength input[type='number']").val() as number ?? 1;
    const innerRadius = elem.find("#innerRadius input[type='number']").val() as number ?? 0;

    return new ZoomBlurStep({
      ...ZoomBlurStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "label"),
      maxStrength,
      innerRadius
    });
  }

  public static getDuration(config: ZoomBlurConfiguration): number { return { ...ZoomBlurStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  public async execute(container: PIXI.Container): Promise<void> {
    const config: ZoomBlurConfiguration = {
      ...ZoomBlurStep.DefaultSettings,
      ...this.config
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const filter = new (PIXI.filters as any).ZoomBlurFilter({
      strength: 0,
      innerRadius: config.innerRadius * window.innerWidth,
      radius: -1,
      center: [window.innerWidth / 2, window.innerHeight / 2]

    }) as PIXI.Filter;

    this.addFilter(container, filter);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { uStrength: config.maxStrength, duration: config.duration / 1000, ease: config.easing || "none" });
  }

  // #endregion Public Methods (1)
}