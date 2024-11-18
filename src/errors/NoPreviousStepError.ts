import { LocalizedError } from "./LocalizedError";

export class NoPreviousStepError extends LocalizedError {
  constructor() {
    super("NOPREVIOUSSTEP");
  }
}