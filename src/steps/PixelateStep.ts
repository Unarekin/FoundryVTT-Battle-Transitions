import { parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { PixelateConfiguration } from './types';


export class PixelateStep extends TransitionStep<PixelateConfiguration> {
  public static DefaultSettings: PixelateConfiguration = {
    type: "pixelate",
    version: "1.1.0",
    maxSize: 100,
    duration: 1000,
    easing: "none"
  };

  public static hidden: boolean = false;
  public static key: string = "pixelate";
  public static name: string = "PIXELATE";
  public static template: string = "pixelate-config";
  public static category: string = "effect";

  public static async RenderTemplate(config?: PixelateConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${PixelateStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...PixelateStep.DefaultSettings,
      ...(config ? config : {})
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
    return new PixelateStep({
      ...PixelateStep.DefaultSettings,
      ...parseConfigurationFormElements(elem, "id", "duration", "maxSize")
    });
  }

  public async execute(container: PIXI.Container): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const filter = new (PIXI.filters as any).PixelateFilter(1) as PIXI.Filter;

    this.addFilter(container, filter);
    const config: PixelateConfiguration = {
      ...PixelateStep.DefaultSettings,
      ...this.config
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    await TweenMax.to(filter.uniforms.size, { 0: config.maxSize, 1: config.maxSize, duration: config.duration / 1000, ease: config.easing });
  }
}