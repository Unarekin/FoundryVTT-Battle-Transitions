/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

import { InvalidTransitionError } from "./errors";
import groupBy from "./lib/groupBy";
import { TransitionConfiguration } from "./steps";
import { formatDuration, getStepClassByKey, wait } from "./utils";



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
  });

  Handlebars.registerHelper("stepDescription", function (this: any, config: TransitionConfiguration) {

    const step = getStepClassByKey(config.type);
    if (!step) throw new InvalidTransitionError(config.type);
    const template = `modules/${__MODULE_ID__}/templates/steps/${step.template}.hbs`;

    const tempId = foundry.utils.randomID();
    const context = step.getRenderContext(config);

    wait(100)
      .then(() => renderTemplate(template, context))
      .then(content => {
        console.log("Rendered:", content);
        const container = document.body.querySelector(`[data-role="template-item"][data-step="${config.id}"][data-render-id="${tempId}"]`);
        if (container instanceof HTMLElement)
          container.innerHTML = content;
      })
      .catch((err: Error) => {
        console.error(err);
        const selector = `[data-role="template-item"][data-step="${config.id}"][data-render-id="${tempId}"]`;
        const container = document.body.querySelector(selector);
        if (container instanceof HTMLElement)
          container.innerHTML = `<div class="error">${game.i18n?.localize(err.message)}</div>`;
      })

    return new Handlebars.SafeString(`<section data-role="template-item" data-step="${config.id}" data-render-id="${tempId}"></section>`);
  });

  Handlebars.registerHelper("shouldConfigureStep", function (config: TransitionConfiguration) {
    const stepClass = getStepClassByKey(config.type);
    if (!stepClass) throw new InvalidTransitionError(config.type);
    return !stepClass.skipConfig
  })

  Handlebars.registerHelper("stepName", function (config: TransitionConfiguration) {
    const stepClass = getStepClassByKey(config.type);
    if (!stepClass) throw new InvalidTransitionError(config.type);
    return game.i18n?.localize(`BATTLETRANSITIONS.${stepClass.name}.NAME`) ?? "";
  })
}

export async function registerTemplates() {

  return (game?.release?.isNewer("13") ? (foundry.applications as any).handlebars.loadTemplates : loadTemplates)([
    `/modules/${__MODULE_ID__}/templates/scene-config.hbs`,
    `modules/${__MODULE_ID__}/templates/transition-step.hbs`,
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