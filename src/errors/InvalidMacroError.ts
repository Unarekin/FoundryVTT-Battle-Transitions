import { LocalizedError } from "./LocalizedError";

export class InvalidMacroError extends LocalizedError {
  constructor(macro: string) {
    super("INVALIDMACRO", { macro });
  }
}