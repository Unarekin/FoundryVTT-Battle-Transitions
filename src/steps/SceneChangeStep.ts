import { CUSTOM_HOOKS } from "../constants";
import { InvalidSceneError, SequenceTimedOutError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { activateScene, hideTransitionCover } from "../transitionUtils";
import { awaitHook, parseConfigurationFormElements } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SceneChangeConfiguration } from "./types";

export class SceneChangeStep extends TransitionStep<SceneChangeConfiguration> {
  // #region Properties (2)
  static name = "SCENECHANGE";

  static DefaultSettings = {
    type: "scenechange",
    scene: ""
  }

  public readonly template = "scenechange-config";

  // #endregion Properties (2)

  // #region Public Methods (2)

  public async execute(container: PIXI.Container, sequence: TransitionSequence): Promise<void> {
    // If we'rea lready on this scene, then really we've missed the chance to properly execute this transition.
    // Likely our preparation steps took too long.
    if (this.config.scene === canvas?.scene?.id) {
      throw new SequenceTimedOutError();
    }
    if (sequence.caller === (game.user as User).id) await activateScene(this.config.scene);
    else await awaitHook(CUSTOM_HOOKS.SCENE_ACTIVATED);

    hideTransitionCover();
  }

  public override async validate(): Promise<boolean | Error> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const scene = (game.scenes as any).get(this.config.scene);
    if (!(scene instanceof Scene)) return Promise.resolve(new InvalidSceneError(this.config.scene));
    else return Promise.resolve(true);
  }

  static from(config: SceneChangeConfiguration): SceneChangeStep
  static from(form: HTMLFormElement): SceneChangeStep
  static from(form: JQuery<HTMLFormElement>): SceneChangeStep
  static from(arg: unknown): SceneChangeStep {
    if (arg instanceof HTMLFormElement) return SceneChangeStep.fromFormElement(arg);
    else if (Array.isArray(arg) && arg[0] instanceof HTMLFormElement) return SceneChangeStep.fromFormElement(arg[0]);
    else return new SceneChangeStep(arg as SceneChangeConfiguration);
  }

  static fromFormElement(form: HTMLFormElement): SceneChangeStep {
    const elem = parseConfigurationFormElements($(form) as JQuery<HTMLFormElement>, "id", "scene");
    return new SceneChangeStep({
      ...SceneChangeStep.DefaultSettings,
      ...elem
    })
  }

  // #endregion Public Methods (2)
}
