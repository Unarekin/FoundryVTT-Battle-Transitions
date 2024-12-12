import { LocalizedError } from "./LocalizedError";

export class ModuleNotActiveError extends LocalizedError {
  constructor(name: unknown) {
    super("MODULENOTACTIVE", { name: typeof name === "string" ? name : typeof name });
  }
}