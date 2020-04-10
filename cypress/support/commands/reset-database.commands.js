
/*global cy, Cypress*/
/// <reference types="Cypress" />

Cypress.Commands.add('resetDB', resetDB);


/**
 * @description Reset the current database to the default database for testing
 * @name verifyAlertSuccess
 * @memberOf Cypress.Chainable#
 * @function
 */
function resetDB() {
  const kaleidosProject = Cypress.env('KALEIDOS_PROJECT');
  const env = {
    COMPOSE_FILE: kaleidosProject + '/docker-compose.yml:' +
      kaleidosProject + '/docker-compose.development.yml:' +
      kaleidosProject + '/docker-compose.test.yml:' +
      kaleidosProject + '/docker-compose.override.yml'
  };

  cy.exec('docker-compose kill triplestore elasticsearch file cache resource', { env })
    .exec(`rm -rf ${kaleidosProject}/testdata`)
    .exec(`unzip -o ${kaleidosProject}/testdata.zip -d ${kaleidosProject}`)
    .exec('docker-compose up -d', { env })
    .wait(5000)
}
