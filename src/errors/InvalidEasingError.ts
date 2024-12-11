import { LocalizedError } from './LocalizedError';

export class InvalidEasingError extends LocalizedError {
  constructor(easing: string) {
    super("INVALIDEASING", { easing });
  }
}