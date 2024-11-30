import { LocalizedError } from "./LocalizedError";

export class StepNotReversibleError extends LocalizedError {
  constructor(key: string) {
    super("STEPNOTREVERSIBLE", { type: key });
  }
}