/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

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
  })
}

export async function registerTemplates() {


  return loadTemplates([
    `/modules/${__MODULE_ID__}/templates/scene-config.hbs`,
    ...["add-step",
      "fade-config",
      "linearwipe-config",
      "step-item",
    ].map(name => `/modules/${__MODULE_ID__}/templates/config/${name}.hbs`)
  ]);
}