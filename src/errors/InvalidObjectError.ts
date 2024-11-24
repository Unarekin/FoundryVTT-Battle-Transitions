import { LocalizedError } from "./LocalizedError";

export class InvalidObjectError extends LocalizedError {
  constructor(arg: unknown) {
    super("INVALIDOBJECT", { object: typeof arg });
  }
}