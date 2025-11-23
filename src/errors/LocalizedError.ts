import { TRANSLATION_KEY } from "../constants.js";

export class LocalizedError extends Error {
  constructor(message?: string, subs?: { [x: string]: unknown }) {
    if (message) super(game.i18n?.format(`${TRANSLATION_KEY}.ERRORS.${message}`, subs))
    else super();
  }
}