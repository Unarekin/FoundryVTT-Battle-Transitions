import { LocalizedError } from "./LocalizedError";

export class NoVideoProvidedError extends LocalizedError {
  constructor() {
    super("NOVIDEOPROVIDED");
  }
}