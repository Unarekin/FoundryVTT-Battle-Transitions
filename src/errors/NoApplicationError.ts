import { LocalizedError } from "./LocalizedError";

export class NoApplicationError extends LocalizedError {
  constructor() {
    super("NOAPPLICATION");
  }
}