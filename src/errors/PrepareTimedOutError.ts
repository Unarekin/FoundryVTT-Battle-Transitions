import { LocalizedError } from './LocalizedError';
export class PrepareTimedOutError extends LocalizedError {
  constructor() {
    super("PREPARETIMEDOUT");
  }
}