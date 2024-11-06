import { CUSTOM_HOOKS } from "../constants";
import { InvalidSceneError, SequenceTimedOutError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { activateScene, hideTransitionCover } from "../transitionUtils";
import { awaitHook, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SceneChangeConfiguration } from "./types";

export class SceneChangeStep extends TransitionStep<SceneChangeConfiguration> {
  // #region Properties (5)

  public static DefaultSettings = {
    type: "scenechange",
    scene: "",
    version: "1.1.0"
  }

  public static hidden: boolean = true;
  public static key = "scenechange";
  public static name = "SCENECHANGE";
  public static template = "scenechange-config";

  // #endregion Properties (5)

  // #region Public Static Methods (6)

  public static RenderTemplate(config?: SceneChangeConfiguration): Promise<string> {
    return renderTemplate(`/modules/${__MODULE_ID__}/templates/config/${SceneChangeStep.template}.hbs`, {
      id: foundry.utils.randomID(),
      ...SceneChangeStep.DefaultSettings,
      ...(config ? config : {})
    });
  }

  public static from(config: SceneChangeConfiguration): SceneChangeStep
  public static from(form: HTMLFormElement): SceneChangeStep
  public static from(form: JQuery<HTMLFormElement>): SceneChangeStep
  public static from(arg: unknown): SceneChangeStep {
    if (arg instanceof HTMLFormElement) return SceneChangeStep.fromFormElement(arg);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    else if (((arg as any)[0]) instanceof HTMLFormElement) return SceneChangeStep.fromFormElement((arg as any)[0] as HTMLFormElement);
    else return new SceneChangeStep(arg as SceneChangeConfiguration);
  }

  public static fromFormElement(form: HTMLFormElement): SceneChangeStep {
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "scene");
    return new SceneChangeStep({
      ...SceneChangeStep.DefaultSettings,
      ...elem
    })
  }

  // #endregion Public Static Methods (6)

  // #region Public Methods (2)

  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    // If we'rea lready on this scene, then really we've missed the chance to properly execute this transition.
    // Likely our preparation steps took too long.
    if (this.config.scene === canvas?.scene?.id) {
      throw new SequenceTimedOutError();
    }



    if (sequence.caller === (game.user as User).id) await activateScene({
      ...SceneChangeStep.DefaultSettings,
      ...this.config
    }.scene);
    else await awaitHook(CUSTOM_HOOKS.SCENE_ACTIVATED);

    hideTransitionCover();
  }

  public override async validate(): Promise<boolean | Error> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const scene = (game.scenes as any).get(this.config.scene);
    if (!(scene instanceof Scene)) return Promise.resolve(new InvalidSceneError({
      ...SceneChangeStep.DefaultSettings,
      ...this.config
    }.scene));
    else return Promise.resolve(true);
  }

  // #endregion Public Methods (2)
}
