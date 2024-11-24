/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BattleTransition } from "./BattleTransition";
import { TransitionSequence } from "./interfaces";
import { StartPlaylistConfiguration, StartPlaylistStep, TransitionConfiguration } from "./steps";
import { sequenceDuration } from "./transitionUtils";
import { localize, log, wait } from "./utils";

const TIMEOUT_PERIOD = 3000;

/* eslint-disable @typescript-eslint/no-unsafe-call */
class SocketHandler {
  #socket: any;

  async #execute(id: string) {
    await BattleTransition.executePreparedSequence(id);
  }

  async #prepare(sequence: TransitionSequence) {
    await BattleTransition.prepareSequence(sequence);
  }

  public async execute(sequence: TransitionConfiguration[]): Promise<void> {
    try {
      const id = foundry.utils.randomID();

      const validated = await BattleTransition.validateSequence(sequence);
      if (validated instanceof Error) throw validated;

      const actual: TransitionSequence = {
        caller: game.user?.id ?? "",
        id,
        sequence: validated.map(step => typeof step.id === "undefined" ? ({ ...step, id: foundry.utils.randomID() }) : step)
      };

      // Ensure we have a StartPlaylist step in our sequence
      if (!sequence.some(step => step.type === "startplaylist")) {
        const step: StartPlaylistConfiguration = {
          ...StartPlaylistStep.DefaultSettings,
          ...(new StartPlaylistStep({}).config)
        }
        actual.sequence.push(step);
      }

      const expectedDuration = await sequenceDuration(actual.sequence);

      const users = (game.users?.contents.filter(user => user.active) as User[]) ?? []

      const usersPrepared: User[] = [];

      // Prepare
      await Promise.any([
        Promise.all(users.map(user => (this.#socket.executeAsUser("transition.prep", user.id, actual) as Promise<void>).then(() => { usersPrepared.push(user) }))),
        wait(TIMEOUT_PERIOD)
      ]);

      if (usersPrepared.length < users.length)
        ui.notifications?.warn(localize("BATTLETRANSITIONS.WARNINGS.PREPARETIMEOUT"), { console: false });

      // Execute
      await Promise.any([
        Promise.all(usersPrepared.map(user => this.#socket.executeAsUser("transition.exec", user.id, actual.id) as Promise<void>)),
        wait(expectedDuration + TIMEOUT_PERIOD)
      ]);

    } catch (err) {
      ui.notifications?.error((err as Error).message, { console: false });
      console.error(err);
    }
  }

  public register(socket: any) {
    log("Registering socket.");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#socket = socket;

    socket.register("transition.exec", this.#execute.bind(this));
    socket.register("transition.prep", this.#prepare.bind(this));
  }
}

export default new SocketHandler();