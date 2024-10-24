/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { TransitionChain } from "./TransitionChain";
import { TransitionStep } from "./types";

/* eslint-disable @typescript-eslint/no-unsafe-call */
class SocketHandler {
  #socket: any;

  public transition(scene: string, config: TransitionStep[]) {
    this.#socket.executeForEveryone("transition.exec", scene, config, game.users?.current?.id ?? "");
  }

  private _execute(scene: string, config: TransitionStep[], caller: string) {
    void new TransitionChain(scene).execute(true, config, caller);
  }

  public register(socket: any) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    this.#socket = socket;
    socket.register("transition.exec", this._execute.bind(this));

  }
}


export default new SocketHandler();