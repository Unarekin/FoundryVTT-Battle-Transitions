import { LocalizedError } from './LocalizedError';
export class InvalidTransitionError extends LocalizedError {
  constructor(name: string) {
    super("INVALIDTRANSITION", { name });
  }
}