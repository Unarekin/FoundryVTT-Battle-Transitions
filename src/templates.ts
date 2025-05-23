/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import groupBy from "./lib/groupBy";
import { formatDuration } from "./utils";

export function registerHelpers() {
  Handlebars.registerHelper("switch", function (this: any, value, options) {
    this._switch_value_ = value;
    const html = options.fn(this);
    delete this._switch_value_;
    return html;
  });

  Handlebars.registerHelper("case", function (this: any, value, options) {
    if (value == this._switch_value_)
      return options.fn(this);
  });

  groupBy.register(Handlebars)

  Handlebars.registerHelper("formatDuration", function (this: any, value: number) {
    if (typeof value === "number") return formatDuration(value);
    else if (typeof value === "string" && !isNaN(parseFloat(value))) return formatDuration(parseFloat(value));
    else return "NaN";
  });

  Handlebars.registerHelper("when", function (this: any, operand_1: any, operator: any, operand_2: any, options) {
    const operators = {
      'eq': function (l: any, r: any) { return l == r; },
      'noteq': function (l: any, r: any) { return l != r; },
      'gt': function (l: any, r: any) { return Number(l) > Number(r); },
      'or': function (l: any, r: any) { return l || r; },
      'and': function (l: any, r: any) { return l && r; },
      '%': function (l: number, r: number) { return (l % r) === 0; }
    }
      , result = (operators as any)[operator](operand_1, operand_2);

    if (result) return options.fn(this);
    else return options.inverse(this);
  });

  Handlebars.registerHelper("json", function (context: any) {
    try {
      return JSON.stringify(context);
    } catch (err) {
      console.error(err);
      ui.notifications?.error(err instanceof Error ? err.message : typeof err === "string" ? err : typeof err, { console: false, localize: true });
    }
  })

}

export async function registerTemplates() {

  return (game?.release?.isNewer("13") ? (foundry.applications as any).handlebars.loadTemplates : loadTemplates)([
    `/modules/${__MODULE_ID__}/templates/scene-config.hbs`,
    ...["step-item",
      "background-selector",
      "duration-selector",
      "add-step-button",
      "sequence-item",
      "target-selector",
      "dualtransition-selector",
      "falloff-config"
    ].map(name => `/modules/${__MODULE_ID__}/templates/config/${name}.hbs`),
    `/modules/${__MODULE_ID__}/templates/scene-selector.hbs`,
    `/modules/${__MODULE_ID__}/templates/transition-steps.hbs`,
    `/modules/${__MODULE_ID__}/templates/font-selector.hbs`,
    `/modules/${__MODULE_ID__}/templates/actor-selector.hbs`
  ]) as Promise<Handlebars.TemplateDelegate[]>;
}