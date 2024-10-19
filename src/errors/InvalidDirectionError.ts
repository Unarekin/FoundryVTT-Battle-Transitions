import { LocalizedError } from "./LocalizedError";

export class InvalidDirectionError extends LocalizedError {
  constructor(direction: string) {
    super("INVALIDDIRECTION", { direction });
  }
}