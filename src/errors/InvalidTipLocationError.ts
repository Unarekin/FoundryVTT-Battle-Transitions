import { LocalizedError } from "./LocalizedError";

export class InvalidTipLocationError extends LocalizedError {
  constructor(location: unknown) {
    super("INVALIDTIPLOCATION", { location: typeof location === "string" ? location : typeof location });
  }
}