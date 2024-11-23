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
  })
}

export async function registerTemplates() {


  return loadTemplates([
    `/modules/${__MODULE_ID__}/templates/scene-config.hbs`,
    ...["add-step",
      "fade-config",
      "linearwipe-config",
      "step-item",
      "background-selector",
      "duration-selector",
      "add-step-button",
      "sequence-item",
      "zoom-target-selector"
    ].map(name => `/modules/${__MODULE_ID__}/templates/config/${name}.hbs`),
    `/modules/${__MODULE_ID__}/templates/scene-selector.hbs`,
    `/modules/${__MODULE_ID__}/templates/transition-steps.hbs`,
    `/modules/${__MODULE_ID__}/templates/actor-selector.hbs`
  ]);
}