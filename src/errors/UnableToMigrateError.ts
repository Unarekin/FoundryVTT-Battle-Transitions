import { LocalizedError } from "./LocalizedError";

export class UnableToMigrateError extends LocalizedError {
  constructor(old: string, current: string) {
    super("UNABLETOMIGRATE", { old, current });
  }
}