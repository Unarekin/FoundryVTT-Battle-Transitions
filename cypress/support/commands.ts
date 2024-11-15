/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

import "cypress-mochawesome-reporter/register"

declare global {
  const __MODULE_ID = `stage-manager`;
  const __MODULE_NAME__ = `Stage Manager`;
  const __DEV__ = true;
  const __MODULE_VERSION__ = "0.0.1";
}

// import "../../src/styles/module.scss"

declare global {
  namespace Cypress {
    interface Chainable {
      selectWorld: (name: string) => Cypress.Chainable<void>;
      login: (name: string) => Cypress.Chainable<void>;
    }
  }
}


Cypress.Commands.add("selectWorld", (name: string) => {
  cy
    .get("aside.tour-center-step a.step-button[data-action='exit']").click()
    .get(`li.package.world[data-package-id="${name.replace(" ", "-").toLowerCase()}"] a.control.play`).click({ force: true })
});

Cypress.Commands.add("login", (name: string) => {
  cy.get(`select[name="userid"]`)
    .as("selectBox")
    .find("option")
    .contains(name)
    .then(option => cy.get(`select[name="userid"]`).select(option.text()))
    .get(`button[type="submit"][name="join"]`).click()

})