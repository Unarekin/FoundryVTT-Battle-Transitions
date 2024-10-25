import { LocalizedError } from "./LocalizedError";

export class NotInitializedError extends LocalizedError {
  constructor() {
    super("NOTINITIALIZED");
  }
}