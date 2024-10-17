import { LocalizedError } from "./LocalizedError";

export class CannotInitializeCanvasError extends LocalizedError {
  constructor() {
    super("CANNOTINITIALIZECANVAS");
  }
}