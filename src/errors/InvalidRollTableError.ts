import { LocalizedError } from "./LocalizedError";

export class InvalidRollTableError extends LocalizedError {
  constructor(table: unknown) {
    super("INVALIDROLLTABLE", { table: typeof table === "string" ? table : typeof table });
  }
}