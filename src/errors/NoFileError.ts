import { LocalizedError } from "./LocalizedError";

export class NoFileError extends LocalizedError {
  constructor() {
    super("NOFILE");
  }
}