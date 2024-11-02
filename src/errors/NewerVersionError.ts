import { LocalizedError } from './LocalizedError';
export class NewerVersionError extends LocalizedError {
  constructor(version: string) {
    super("NEWERVERSION", { version })
  }
}