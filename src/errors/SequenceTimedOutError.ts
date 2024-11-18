import { LocalizedError } from './LocalizedError';
export class SequenceTimedOutError extends LocalizedError {
  constructor() {
    super("SEQUENCETIMEDOUT");
  }
}