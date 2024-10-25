import { LocalizedError } from './LocalizedError';
export class PermissionDeniedError extends LocalizedError {
  constructor() {
    super("PERMISSIONDENIED");
  }
}