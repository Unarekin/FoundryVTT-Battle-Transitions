import { SocketMessage } from "interfaces";
import { CUSTOM_HOOKS } from "./constants";
import { SocketHandlerAlreadyRegisteredError, SocketHandlerNotFoundError } from "errors";

export enum MESSAGES {

}

type SocketCallback = (...args: unknown[]) => void

export class SocketHandler {
  static Identifier = `module.${__MODULE_ID__}`;

  #messageHandlers = new Map<string, SocketCallback>();

  /**
   * Registers a message handler
   * @param {string} message 
   * @param {SocketCallback} handler - {@link SocketCallback}
   */
  public register(message: string, handler: SocketCallback) {
    if (this.#messageHandlers.has(message)) throw new SocketHandlerAlreadyRegisteredError(message);
    this.#messageHandlers.set(message, handler);
  }

  /**
   * Executes a handler as a specific user
   * @param {string} name - Name of the handler function.  Must be registered with {@link register}
   * @param {string} userId - ID of the {@link User}
   * @param {...any} args - Arguments to pass to the handler function
   * @returns 
   */
  public executeAsUser(name: string, userId: string, ...args: unknown[]) {
    return this.sendMessage(name, [userId], args);
  }

  /**
   * Executes a handler for a set of users
   * @param {string} name Name of the handler function.  Must be registered with {@link register}
   * @param {string[]} users - IDs of the {@link User}s
   * @param {...any} args 
   */
  public executeForUsers(name: string, users: string[], ...args: unknown[]) {
    return this.sendMessage(name, users, args);
  }

  /**
   * Executes a handler for all connected users
   * @param {string} name - Name of the handler function.  Must be registered with {@link register}
   * @param {...any} args 
   */
  public executeForEveryone(name: string, ...args: unknown[]) {
    const userIds = (game.users ?? []).reduce((prev: string[], curr: User) => {
      if (curr.active && curr.id) return [...prev, curr.id];
      return prev;
    }, [] as string[])

    return this.sendMessage(name, userIds, args);
  }

  /**
   * Executes a handler for the current active GM
   * @param {string} name - Name of the handler function.  Must be registered with {@link register}
   * @param {...any} args 
   */
  public executeAsGM(name: string, ...args: unknown[]) {
    if (game?.users?.activeGM?.id)
      return this.sendMessage(name, [game.users.activeGM.id], args);
  }

  /**
   * Unregisters a message handler
   * @param {string} message - Name of the handler function.  Must be registered with {@link register}
   * @returns {boolean}
   */
  public unregister(message: string) {
    return this.#messageHandlers.delete(message);
  }

  /**
   * 
   * @param {string} name - Name of the handler function.  Must be registered with {@link register}
   * @param {string[]} users - List of user IDs to process this message
   * @param {...any} args - List of arguments to pass to handler
   */
  public sendMessage(name: string, users: string[], args: any[]) {
    const handler = this.#messageHandlers.get(name);
    if (!handler) throw new SocketHandlerNotFoundError(name);

    const message = foundry.utils.deepFreeze({
      id: foundry.utils.randomID(),
      timestamp: Date.now(),
      sender: game.user?.id,
      name,
      users,
      args
    });

    const confirmed = Hooks.call(CUSTOM_HOOKS.SOCKET_SEND_EVENT);
    if (!confirmed) return;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    if (message.users.includes(game?.user?.id ?? "")) handler.apply(undefined, [...message.args, message]);
    if (message.users.some(id => id !== game?.user?.id)) game.socket?.emit(SocketHandler.Identifier, message);
  }


  constructor() {
    Hooks.once("ready", () => {
      if (!(game?.socket)) return;
      game.socket.on(SocketHandler.Identifier, (message: SocketMessage) => {
        if (!game?.user?.id) return;

        if (Array.isArray(message.users) && !message.users.includes(game.user.id)) return;

        const handler = this.#messageHandlers.get(message.name);
        if (!handler) throw new SocketHandlerNotFoundError(message.name);

        const frozen = foundry.utils.deepFreeze(message as any) as Readonly<SocketMessage>;
        handler.apply(undefined, [...frozen.args, frozen]);
        Hooks.callAll(CUSTOM_HOOKS.SOCKET_RECEIVE_EVENT, frozen);
      });
    })
  }
}