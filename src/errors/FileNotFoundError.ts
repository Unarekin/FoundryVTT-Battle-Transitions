import { LocalizedError } from "./LocalizedError";

export class FileNotFoundError extends LocalizedError {
  constructor(file: string) {
    super("FILENOTFOUND", { file });
  }
}