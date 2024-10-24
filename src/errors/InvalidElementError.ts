import { LocalizedError } from "./LocalizedError";

export class InvalidElementError extends LocalizedError {
  constructor() {
    super("INVALIDELEMENT");
  }
}