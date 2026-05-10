import { TRANSLATION_KEY } from "../constants.js";

export class LocalizedError extends Error {
  constructor(message?: string, subs?: { [x: string]: unknown }) {
    if (message) super(_loc(`${TRANSLATION_KEY}.ERRORS.${message}`, subs))
    else super();
  }
}