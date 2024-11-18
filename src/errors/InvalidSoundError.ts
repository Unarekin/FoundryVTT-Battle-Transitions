import { LocalizedError } from './LocalizedError';
export class InvalidSoundError extends LocalizedError {
  constructor(sound: string) {
    super("INVALIDSOUND", { sound });
  }
}