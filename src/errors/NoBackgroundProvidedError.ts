import { LocalizedError } from "./LocalizedError";

export class NoBackgroundProvidedError extends LocalizedError {
  constructor() {
    super("NOBACKGROUNDPROVIDED");
  }
}