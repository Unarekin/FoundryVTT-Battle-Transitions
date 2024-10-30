import { coerceScene } from "./coercion";
import { InvalidSceneError, InvalidTransitionError } from "./errors";
import { TransitionSequence } from "./interfaces";
import SocketHandler from "./SocketHandler";
import { SceneChangeConfiguration, SceneChangeStep, TransitionConfiguration, TransitionStep, WaitConfiguration, WaitStep } from "./steps";
import { cleanupTransition, hideLoadingBar, setupTransition, showLoadingBar } from "./transitionUtils";

/**
 * Primary class that handles queueing, synchronizing, and executing transition sequences.
 */
export class BattleTransition {
  // #region Properties (3)

  #sequence: TransitionConfiguration[] = [];
  #stepTypes: { [x: string]: typeof TransitionStep } = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wait: (WaitStep as any),
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    scenechange: (SceneChangeStep as any)
  }

  // eslint-disable-next-line no-unused-private-class-members
  #transitionOverlay: PIXI.DisplayObject[] = [];

  // #endregion Properties (3)

  // #region Constructors (6)

  constructor()
  constructor(scene: Scene)
  constructor(id: string)
  constructor(name: string)
  constructor(uuid: string)
  constructor(arg?: unknown) {
    try {
      if (arg) {
        const scene = coerceScene(arg);
        if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : typeof arg);
        this.#sequence.push({ type: "scenechange", scene: scene.id } as SceneChangeConfiguration);
      }
    } catch (err) {
      ui.notifications?.error((err as Error).message);
      throw err;
    }
  }

  // #endregion Constructors (6)

  // #region Public Methods (2)

  /**
   * Begins executing a given transition sequence, notifying other connected clients to do the same.
   * @param {TransitionConfiguration[]} [sequence] - {@link TransitionConfiguration}[] to execute.  Defaults to sequence pre-configured on this {@link BattleTransition}.
   */
  public async execute(sequence: TransitionSequence): Promise<void> {
    try {
      // Notify other clients to execute, if necessary
      if (!sequence.remote) {
        // Last minute validation of our sequence
        const valid = await this.#validateSequence(sequence.sequence);
        if (valid instanceof Error) throw valid;

        const serialized = await this.#serializeSequence(sequence.sequence);
        await SocketHandler.execute({
          ...sequence,
          sequence: serialized
        });
      } else {
        await this.#executeSequence(sequence);
      }
    } catch (err) {
      ui.notifications?.error((err as Error).message);
    }
  }

  /**
   * Adds a step to simply wait a given amount of time before continuing.
   * @param {number} duration - Amount of time, in milliseconds, to wait.
   */
  public wait(duration: number): this {
    this.#sequence.push({ type: "wait", duration } as WaitConfiguration);
    return this;
  }

  // #endregion Public Methods (2)

  // #region Private Methods (5)

  async #executeSequence(sequence: TransitionSequence) {
    let container: PIXI.Container | null = null;
    try {
      // Prepare overlay
      container = await setupTransition();
      this.#transitionOverlay = [...container.children];
      hideLoadingBar();

      // Prepare sequence
      const preparedSequence = await this.#prepareSequence(sequence.sequence);

      for (const step of preparedSequence) {
        await step.execute(sequence);
      }

    } catch (err) {
      throw err as Error;
    } finally {
      showLoadingBar();
      if (container) cleanupTransition(container);
    }
  }

  #getStepInstance(step: TransitionConfiguration): TransitionStep {
    const handler = this.#stepTypes[step.type];
    if (!handler) throw new InvalidTransitionError(step.type);
    return handler.from(step);
  }

  async #prepareSequence(sequence: TransitionConfiguration[] = this.#sequence): Promise<TransitionStep[]> {
    try {
      const steps: TransitionStep[] = [];

      for (const step of sequence) {
        const instance = this.#getStepInstance(step);
        await instance.prepare();
        steps.push(instance);
      }
      return steps;
    } catch (err) {
      throw err as Error;
    }
  }

  async #serializeSequence(sequence: TransitionConfiguration[] = this.#sequence): Promise<TransitionConfiguration[]> {
    const serializedSequence: TransitionConfiguration[] = [];
    for (const step of sequence) {
      const instance = this.#getStepInstance(step);
      serializedSequence.push(await instance.serialize());
    }
    return serializedSequence;
  }

  async #validateSequence(sequence: TransitionConfiguration[] = this.#sequence): Promise<boolean | Error> {
    try {
      for (const step of sequence) {
        const handler = this.#stepTypes[step.type];
        if (!handler) throw new InvalidTransitionError(step.type);
        const valid = await handler.validate(step);
        if (valid instanceof Error) return valid;
      }
      return true;
    } catch (err) {
      throw err as Error;
    }
  }

  // #endregion Private Methods (5)
}