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

  public async execute(sequence: TransitionSequence): Promise<void> {
    await this.#socket.executeForEveryone("transition.exec", {
      ...sequence,
      caller: game.user?.id ?? "",
      remote: true
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