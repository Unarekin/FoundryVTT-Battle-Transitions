/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BattleTransition } from "./BattleTransition";
import { PrepareTimedOutError, SequenceTimedOutError } from "./errors";
import { TransitionSequence } from "./interfaces";
import { TransitionConfiguration } from "./steps";
import { log, timeout } from "./utils";

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
      const actual: TransitionSequence = {
        caller: game.user?.id ?? "",
        id,
        sequence
      };

      const expectedDuration = sequence.reduce((prev, curr) => {

        switch (typeof (curr as any).duration) {
          case "string": {
            const duration = parseFloat((curr as any).duration as string);
            if (!isNaN(duration)) return prev + duration;
            break;
          }
          case "number": {
            return prev + (curr as any).duration as number;
          }
        }
        return prev;
      }, 0);

      log("Executing:", actual)
      log("Expected duration:", expectedDuration);

      const users = (game.users?.contents.filter(user => user.active) as User[]) ?? []
      // Prepare
      await Promise.race([
        Promise.all(users.map(user => this.#socket.executeAsUser("transition.prep", user.id, actual) as Promise<void>)),
        timeout(TIMEOUT_PERIOD + expectedDuration).catch(() => { throw new PrepareTimedOutError(); })
      ])

      // Execute
      await Promise.race([
        Promise.all(users.map(user => this.#socket.executeAsUser("transition.exec", user.id, actual.id) as Promise<void>)),
        timeout(expectedDuration + TIMEOUT_PERIOD).catch(() => { throw new SequenceTimedOutError(); })
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