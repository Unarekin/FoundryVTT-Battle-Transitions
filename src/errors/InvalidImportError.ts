import { LocalizedError } from "./LocalizedError";

export class InvalidImportError extends LocalizedError {
  constructor() {
    super("INVALIDIMPORT");
  }
}