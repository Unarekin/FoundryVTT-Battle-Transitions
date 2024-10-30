/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { BattleTransition } from "./BattleTransition";
import { TransitionSequence } from "./interfaces";
import { log } from "./utils";

/* eslint-disable @typescript-eslint/no-unsafe-call */
class SocketHandler {
  // eslint-disable-next-line no-unused-private-class-members
  #socket: any;

  #execute(sequence: TransitionSequence) {
    void new BattleTransition().execute({
      ...sequence,
      remote: true
    });
  }

  public execute(sequence: TransitionSequence) {
    this.#socket.executeForEveryone("transition.exec", {
      ...sequence,
      caller: game.user?.id ?? ""
    });
  }


  public register(socket: any) {
    log("Registering socket.");
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#socket = socket;

    socket.register("transition.exec", this.#execute.bind(this))
  }
}

export default new SocketHandler();