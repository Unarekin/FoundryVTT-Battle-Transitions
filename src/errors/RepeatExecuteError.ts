import { LocalizedError } from './LocalizedError';
export class RepeatExecuteError extends LocalizedError {
  constructor() {
    super("EXECUTECALLEDREPEAT")
  }
}