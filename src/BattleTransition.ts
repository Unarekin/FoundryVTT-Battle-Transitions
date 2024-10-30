import { coerceScene } from "./coercion";
import { InvalidSceneError, InvalidTransitionError } from "./errors";
import { TransitionSequence } from "./interfaces";
import SocketHandler from "./SocketHandler";
import { TransitionConfiguration, TransitionStep, WaitConfiguration, WaitStep } from "./steps";
import { cleanupTransition, hideLoadingBar, setupTransition, showLoadingBar } from "./transitionUtils";

/**
 * Primary class that handles queueing, synchronizing, and executing transition sequences.
 */
export class BattleTransition {
  // #region Properties (4)

  #scene: Scene | undefined = undefined;
  #sequence: TransitionConfiguration[] = [];
  #stepTypes: { [x: string]: typeof TransitionStep } = {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wait: (WaitStep as any)
  }

  // eslint-disable-next-line no-unused-private-class-members
  #transitionOverlay: PIXI.DisplayObject[] = [];

  // #endregion Properties (4)

  // #region Constructors (6)

  constructor()
  constructor(scene: Scene)
  constructor(id: string)
  constructor(name: string)
  constructor(uuid: string)
  constructor(arg?: unknown) {
    try {
      if (arg) {
        this.#scene = coerceScene(arg);
        if (!this.#scene) throw new InvalidSceneError(typeof arg === "string" ? arg : typeof arg);
      }
    } catch (err) {
      ui.notifications?.error((err as Error).message);
      throw err;
    }
  }

  // #endregion Constructors (6)

  // #region Public Methods (7)

  /**
   * Adds a step to change scenes
   * @param {string} id - ID of the {@link Scene} to which to transition
   */
  public changeScene(id: string): this
  /**
   * Adds a step to change scenes
   * @param {string} name - Name of the {@link Scene} to which to transition
   */
  public changeScene(name: string): this
  /**
   * Adds a step to change scenes
   * @param {string} uuid - UUID of the {@link Scene} to which to transition
   */
  public changeScene(uuid: string): this
  /**
   * Adds a step to change scenes
   * @param {Scene} scene - The {@link Scene} to which to transition
   */
  public changeScene(scene: Scene): this
  public changeScene(arg: unknown): this {
    const scene = coerceScene(arg);
    if (!(scene instanceof Scene)) throw new InvalidSceneError(typeof arg === "string" ? arg : typeof arg);

    return this;
  }

  /**
   * Begins executing a given transition sequence, notifying other connected clients to do the same.
   * @param {TransitionConfiguration[]} [sequence] - {@link TransitionConfiguration}[] to execute.  Defaults to sequence pre-configured on this {@link BattleTransition}.
   */
  public async execute(sequence: TransitionSequence): Promise<void> {
    try {
      // Notify other clients to execute, if necessary
      if (!sequence.remote) {
        SocketHandler.execute(sequence);
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

  // #endregion Public Methods (7)

  // #region Private Methods (4)

  async #executeSequence(sequence: TransitionSequence) {
    let container: PIXI.Container | null = null;
    try {
      // Last minute validation of our sequence
      const valid = await this.#validateSequence(sequence.sequence);
      if (valid instanceof Error) throw valid;

      // Prepare overlay
      container = await setupTransition();
      this.#transitionOverlay = [...container.children];
      hideLoadingBar();

      // Prepare sequence
      const preparedSequence = await this.#prepareSequence(sequence.sequence);

      for (const step of preparedSequence) {
        await step.execute();
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

  // #endregion Private Methods (4)
}