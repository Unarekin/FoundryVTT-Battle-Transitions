import { LocalizedError } from "./LocalizedError";

export class TransitionHasToStepError extends LocalizedError {
  constructor() {
    super("HASTOSTEP");
  }
}