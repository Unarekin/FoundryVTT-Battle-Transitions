describe('Templating', () => {
  it('Mounts Handlebars Template', () => {
    cy.mount("./cypress/fixtures/template.hbs", { context: {} })
      .get("p").contains("Template")
  });

  it("Mounts HTML String", () => {
    cy.mount("<p>HTML String</p>", { context: {} })
      .get("p").contains("HTML String")
  });

  it("Mounts template as dialog", () => {
    cy.mount("./cypress/fixtures/template.hbs", { context: {}, isDialog: true })
      .get("header.window-header").should("exist")
      .get("p").contains("Template");
  })

})