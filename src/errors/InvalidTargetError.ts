import { LocalizedError } from "./LocalizedError";

export class InvalidTargetError extends LocalizedError {
  constructor(arg?: unknown) {
    super("INVALIDTARGET", { item: typeof arg === "string" ? arg : typeof arg });
  }
}