import { LocalizedError } from './LocalizedError';
export class ParallelExecuteError extends LocalizedError {
  constructor() {
    super("EXECUTECALLEDPARALLEL")
  }
}