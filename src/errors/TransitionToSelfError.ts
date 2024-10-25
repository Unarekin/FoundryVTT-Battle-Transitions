import { LocalizedError } from './LocalizedError';
export class TransitionToSelfError extends LocalizedError {
  constructor() {
    super("TRANSITIONTOSELF")
  }
}