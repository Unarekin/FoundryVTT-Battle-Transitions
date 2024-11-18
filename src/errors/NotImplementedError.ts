import { LocalizedError } from "./LocalizedError";

export class NotImplementedError extends LocalizedError {
  constructor() {
    super("NOTIMPLEMENTED");
  }
}