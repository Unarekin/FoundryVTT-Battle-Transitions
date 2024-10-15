import "cypress-mochawesome-reporter/register"
import "./commands";
import path from "path-browserify";
import Handlebars from "handlebars";
import { getContainerEl, setupHooks } from "@cypress/mount-utils";

import "./public/css/style.css";
import "./public/fonts/fontawesome/css/all.min.css";
import "../../src/styles/module.scss";

interface HandlebarsMountOptions {
  context: object;
  isDialog?: boolean;
}

declare global {
  namespace Cypress {
    interface Chainable {
      mount: typeof hbsMount;
    }
  }
}

let dispose: () => void = () => void 0;

function cleanup() {
  dispose?.();
}


function render(component: HTMLElement | null, root: HTMLElement) {
  root.innerHTML = "";
  if (!component) return;
  root.appendChild(component);
}

setupHooks(cleanup);

function hbsMount(template: string, options: HandlebarsMountOptions): Cypress.Chainable<JQuery<HTMLElement>> {

  return cy.then(() => {
    if (options.isDialog) return cy.readFile("./cypress/support/dialog-template.html", { log: false });
    else return cy.wrap(null);
  }).then((container: string) => {

    return cy.then(() => {
      if (isPathlike(template)) return cy.readFile(template, { log: false });
      else return cy.wrap(template, { log: false });
    })
      .then(content => {
        const renderFunc = Handlebars.compile(content);
        let source = renderFunc(options.context);
        if (container) source = container.replace("<!-- ##CONTENT## -->", source);

        const componentElement = document.createElement("template");
        componentElement.innerHTML = source;

        if (componentElement.content.children.length > 1) throw new Error("The provided template must have a single root element.");
        const component = componentElement.content.firstElementChild as HTMLElement;
        if (!component) throw new Error("The provided template was not able to be parsed into a valid HTML element.");

        const root = getContainerEl();
        render(component, root);

        dispose = () => { render(null, root); };

        return cy.wrap(root, { log: false })
      })
      .wait(0, { log: false })
      .children({ log: false })
      .first({ log: false })
      .then(element => {
        const name = (element.prop("tagName") as string).toLowerCase();
        const el = document.getElementsByTagName(name)[0] as HTMLElement;
        return cy.wrap(el, { log: false });
      })
  });
}


// Set up dummy localize helper so templates can still compile
Handlebars.registerHelper("localize", (...args: unknown[]) => {
  return args[0];
})

Cypress.Commands.add("mount", hbsMount);

function isPathlike(str: string): boolean {
  if (!str || typeof str !== "string") return false;

  const root = path.parse(str).root;
  if (root) str = str.slice(root.length);

  return !/[<>:"|?*]/.test(str);
}