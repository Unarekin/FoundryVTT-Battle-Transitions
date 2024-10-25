import { LocalizedError } from "./LocalizedError";

export class NoCoverElementError extends LocalizedError {
  constructor() {
    super("NOCOVERELEMENT");
  }
}