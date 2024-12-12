import { LocalizedError } from './LocalizedError';

export class MigratorNotFoundError extends LocalizedError {
  constructor(element: string, currentVersion: string, newVersion: string) {
    super("MIGRATORNOTFOUND", { type: element, currentVersion, newVersion });
  }
}