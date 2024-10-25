import { LocalizedError } from "./LocalizedError";

export class InvalidSceneError extends LocalizedError {
  constructor(name: string) {
    super("INVALIDSCENE", { name });
  }
}