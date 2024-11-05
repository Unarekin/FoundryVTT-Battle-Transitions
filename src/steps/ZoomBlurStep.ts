import { NotImplementedError } from '../errors';
import { TransitionStep } from './TransitionStep';
import { ZoomBlurConfiguration } from './types';

export class ZoomBlurStep extends TransitionStep<ZoomBlurConfiguration> {
  public static DefaultSettings: ZoomBlurConfiguration = {
    type: "zoomblur",
    version: "1.1.0",
    duration: 1000,
    maxStrength: 0.5,
    easing: "none",
    innerRadius: 0
  }

  public static hidden: boolean = false;
  public static key = "zoomblur";
  public static name = "ZOOMBLUR";
  public static template = "zoomblur-config";

  public static async RenderTemplate(config?: ZoomBlurConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${ZoomBlurStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...ZoomBlurStep.DefaultSettings,
      ...(config ? config : {})
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

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static fromFormElement(form: HTMLFormElement): ZoomBlurStep {
    throw new NotImplementedError();
  }

  public async execute(container: PIXI.Container): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const filter = new (PIXI.filters as any).ZoomBlurFilter({
      strength: 0,
      innerRadius: this.config.innerRadius
    }) as PIXI.Filter;

    this.addFilter(container, filter);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms, { strength: this.config.maxStrength, duration: this.config.duration / 1000, ease: this.config.easing || "none" });

  }
}