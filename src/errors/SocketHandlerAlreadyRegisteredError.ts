import { LocalizedError } from "./LocalizedError";

export class SocketHandlerAlreadyRegisteredError extends LocalizedError {
  constructor(name: unknown) {
    super("SOCKETHANDLERALREADYREGISTERED", { name: typeof name === "string" ? name : typeof name });
  }
}