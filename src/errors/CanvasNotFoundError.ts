import { LocalizedError } from "./LocalizedError";

export class CanvasNotFoundError extends LocalizedError {
  constructor() {
    super("CANVASNOTFOUND");
  }
}