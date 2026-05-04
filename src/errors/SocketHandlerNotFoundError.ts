import { LocalizedError } from "./LocalizedError";

export class SocketHandlerNotFoundError extends LocalizedError {
  constructor(name: unknown) {
    super("SOCKETHANDLERNOTFOUND", { name: typeof name === "string" ? name : typeof name });
  }
}