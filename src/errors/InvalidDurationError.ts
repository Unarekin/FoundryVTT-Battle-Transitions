import { LocalizedError } from "./LocalizedError";

export class InvalidDurationError extends LocalizedError {
  constructor(arg: unknown) {
    super("INVALIDDURATION", { duration: typeof arg === "string" ? arg : typeof arg });
  }
}