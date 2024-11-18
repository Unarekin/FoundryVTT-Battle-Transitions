import { LocalizedError } from "./LocalizedError";

export class NoImageProvidedError extends LocalizedError {
  constructor() {
    super("NOIMAGEPROVIDED");
  }
}