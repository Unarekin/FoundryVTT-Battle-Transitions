import { SpiralLinearWipeFilter } from '../filters';
import { createColorTexture, generateClockDirectionSelectOptions, generateEasingSelectOptions, generateRadialDirectionSelectOptions, parseConfigurationFormElements } from '../utils';
import { TransitionStep } from './TransitionStep';
import { SpiralLinearWipeConfiguration } from './types';

export class SpiralLinearWipeStep extends TransitionStep<SpiralLinearWipeConfiguration> {
  public static DefaultSettings: SpiralLinearWipeConfiguration = {
    type: "spirallinearwipe",
    duration: 1000,
    direction: "left",
    clockDirection: "clockwise",
    radial: "outside",
    easing: "none",
    version: "1.1.0",
    bgSizingMode: "stretch",
    backgroundType: "color",
    backgroundImage: "",
    backgroundColor: "#00000000"
  };

  public static hidden: boolean = false;
  public static key = "spirallinearwipe";
  public static name = "SPIRALLINEARWIPE";
  public static template = "spirallinearwipe-config";

  public static async RenderTemplate(config?: SpiralLinearWipeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${SpiralLinearWipeStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...SpiralLinearWipeStep.DefaultSettings,
      ...(config ? config : {}),
      easingSelect: generateEasingSelectOptions(),
      radialSelect: generateRadialDirectionSelectOptions(),
      directionSelect: {
        top: "BATTLETRANSITIONS.DIRECTIONS.TOP",
        left: "BATTLETRANSITIONS.DIRECTIONS.LEFT",
        right: "BATTLETRANSITIONS.DIRECTIONS.RIGHT",
        bottom: "BATTLETRANSITIONS.DIRECTIONS.BOTTOM"
      },
      clockDirectionSelect: generateClockDirectionSelectOptions(),
    })
  }

  public static from(config: SpiralLinearWipeConfiguration): SpiralLinearWipeStep
  public static from(form: HTMLFormElement): SpiralLinearWipeStep
  public static from(form: JQuery<HTMLFormElement>): SpiralLinearWipeStep
  public static from(arg: unknown): SpiralLinearWipeStep {
    if (arg instanceof HTMLFormElement) return SpiralLinearWipeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return SpiralLinearWipeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new SpiralLinearWipeStep(arg as SpiralLinearWipeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): SpiralLinearWipeStep {
    const elem = $(form) as JQuery<HTMLFormElement>;
    const backgroundImage = elem.find("#backgroundImage").val() as string ?? "";

    return new SpiralLinearWipeStep({
      ...SpiralLinearWipeStep.DefaultSettings,
      backgroundImage,
      ...parseConfigurationFormElements(elem, "id", "duration", "backgroundType", "backgroundColor", "radial", "direction", "clockDirection")
    })
  }

  public async execute(container: PIXI.Container): Promise<void> {
    const config: SpiralLinearWipeConfiguration = {
      ...SpiralLinearWipeStep.DefaultSettings,
      ...this.config
    };

    const background = config.deserializedTexture ?? createColorTexture("transparent");
    const filter = new SpiralLinearWipeFilter(config.clockDirection, config.radial, config.direction, background.baseTexture);
    this.addFilter(container, filter);
    await this.simpleTween(filter);
  }
}