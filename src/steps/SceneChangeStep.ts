import { InvalidSceneError, SequenceTimedOutError } from "../errors";
import { TransitionSequence } from "../interfaces";
import { activateScene } from "../transitionUtils";
import { awaitHook } from "../utils";
import { TransitionStep } from "./TransitionStep";
import { SceneChangeConfiguration } from "./types";

export class SceneChangeStep extends TransitionStep<SceneChangeConfiguration> {
  // #region Properties (2)
  static name = "SCENECHANGE";

  public readonly defaultSettings = {
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
    else await awaitHook("sceneActivated")
  }

  public override async validate(): Promise<boolean | Error> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const scene = (game.scenes as any).get(this.config.scene);
    if (!(scene instanceof Scene)) return Promise.resolve(new InvalidSceneError(this.config.scene));
    else return Promise.resolve(true);
  }

  // #endregion Public Methods (2)
}
