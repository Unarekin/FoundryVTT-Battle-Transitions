import { HueShiftConfiguration } from './types';
import { TransitionStep } from './TransitionStep';
import { HueShiftFilter } from '../filters';
import { generateEasingSelectOptions, parseConfigurationFormElements } from '../utils';

export class HueShiftStep extends TransitionStep<HueShiftConfiguration> {
  // #region Properties (7)

  public static DefaultSettings: HueShiftConfiguration = {
    id: "",
    type: "hueshift",
    duration: 0,
    version: "1.1.0",
    maxShift: 0,
    easing: "none"
  };
  public static category: string = "effect";
  public static hidden: boolean = false;
  public static icon = "<i class='bt-icon hue-shift fa-fw fas'></i>"
  public static key: string = "hueshift";
  public static name: string = "HUESHIFT";
  public static template: string = "hueshift-config";

  // #endregion Properties (7)

  // #region Public Static Methods (7)

  public static RenderTemplate(config?: HueShiftConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${HueShiftStep.template}.hbs`, {
      ...HueShiftStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions()
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

    return new HueShiftStep({
      ...HueShiftStep.DefaultSettings,
      maxShift,
      ...parseConfigurationFormElements(elem, "id", "duration", "easing", "label")
    })
  }

  public static getDuration(config: HueShiftConfiguration): number { return { ...HueShiftStep.DefaultSettings, ...config }.duration }

  // #endregion Public Static Methods (7)

  // #region Public Methods (1)

  public async execute(container: PIXI.Container): Promise<void> {
    const config: HueShiftConfiguration = {
      ...HueShiftStep.DefaultSettings,
      ...this.config
    };

    const filter = new HueShiftFilter(0);
    this.addFilter(container, filter);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { shift: config.maxShift, duration: config.duration / 1000, ease: config.easing ?? "none" });
  }

  // #endregion Public Methods (1)
}