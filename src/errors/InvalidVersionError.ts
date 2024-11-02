import { LocalizedError } from './LocalizedError';
export class InvalidVersionError extends LocalizedError {
  constructor(version: string) {
    super("INVALIDVERSION", { version })
  }
}