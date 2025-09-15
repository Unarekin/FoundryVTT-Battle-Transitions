import { ViewSceneConfiguration } from './types';
import { TransitionStep } from './TransitionStep';
import { parseConfigurationFormElements, renderTemplateFunc, templateDir } from '../utils';
import { InvalidSceneError } from '../errors';
import { TransitionSequence } from '../interfaces';
import { hideTransitionCover } from '../transitionUtils';

export class ViewSceneStep extends TransitionStep<ViewSceneConfiguration> {

  public static DefaultSettings: ViewSceneConfiguration = Object.freeze({
    id: "",
    type: "viewscene",
    version: "2.0.0",
    scene: ""
  });

  public static hidden: boolean = true;
  public static key = "viewscene";
  public static name = "VIEWSCENE";
  public static template = "viewscene-config";
  public static icon = "<i class='fas fa-magnifying-glass fa-fw'></i>";
  public static category = "technical";

  public static RenderTemplate(config?: ViewSceneConfiguration): Promise<string> {
    return (renderTemplateFunc())(templateDir(`config/${ViewSceneStep.template}.hbs`), {
      ...ViewSceneStep.DefaultSettings,
      id: foundry.utils.randomID(),
      ...(config ? config : {})
    });
  }

  public static from(config: ViewSceneConfiguration): ViewSceneStep
  public static from(form: HTMLFormElement): ViewSceneStep
  public static from(form: JQuery<HTMLFormElement>): ViewSceneStep
  public static from(arg: unknown): ViewSceneStep {
    if (arg instanceof HTMLFormElement) return ViewSceneStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return ViewSceneStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new ViewSceneStep(arg as ViewSceneConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): ViewSceneStep {
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "scene");
    return new ViewSceneStep({
      ...ViewSceneStep.DefaultSettings,
      ...elem
    });
  }

  public async validate(): Promise<boolean | Error> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const scene = (game.scenes as any).get(this.config.scene);
    if (!(scene instanceof Scene)) return Promise.resolve(new InvalidSceneError({
      ...ViewSceneStep.DefaultSettings,
      ...this.config
    }.scene));
    else return Promise.resolve(true);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    const config: ViewSceneConfiguration = {
      ...ViewSceneStep.DefaultSettings,
      ...this.config
    }
    // If we're already viewing this scene, bail
    if (canvas?.scene?.id === config.scene) return;

    const scene = game?.scenes?.get(config.scene);
    if (!(scene instanceof Scene)) throw new InvalidSceneError(config.scene);
    await scene.view();
    hideTransitionCover()
  }
}