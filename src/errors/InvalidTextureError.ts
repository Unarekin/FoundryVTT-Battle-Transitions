import { LocalizedError } from "./LocalizedError";

export class InvalidTextureError extends LocalizedError {
  constructor() {
    super("INVALIDTEXTURE");
  }
}