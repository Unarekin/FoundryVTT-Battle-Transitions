/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BattleTransition } from "./BattleTransition";
import { TransitionSequence } from "./interfaces";
import { log } from "./utils";

/* eslint-disable @typescript-eslint/no-unsafe-call */
class SocketHandler {
  #socket: any;

  #execute(sequence: TransitionSequence) {
    void new BattleTransition().execute({
      ...sequence,
      remote: true
    });
  }

  public execute(sequence: TransitionSequence): Promise<void> {
    return this.#socket.executeForEveryone("transition.exec", {
      ...sequence,
      caller: game.user?.id ?? ""
    }) as Promise<void>;
  }


  public register(socket: any) {
    log("Registering socket.");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#socket = socket;

    socket.register("transition.exec", this.#execute.bind(this))
  }
}

export default new SocketHandler();