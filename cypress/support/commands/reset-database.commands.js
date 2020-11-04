/* eslint-disable */

/*global cy, Cypress*/
/// <reference types="Cypress" />

Cypress.Commands.add('resetCache', resetCache);
Cypress.Commands.add('resetSearch', resetSearch);

/**
 * @description Reset the current database to the default database for testing
 * @name resetCache
 * @memberOf Cypress.Chainable#
 * @function
 */
function resetCache() {

  return;

  const kaleidosProject = Cypress.env('KALEIDOS_PROJECT');
  const env = {
    COMPOSE_FILE: kaleidosProject + '/docker-compose.yml:' +
      kaleidosProject + '/docker-compose.development.yml:' +
      kaleidosProject + '/docker-compose.test.yml:' +
      kaleidosProject + '/docker-compose.override.yml'
  };

  cy.exec('docker-compose kill yggdrasil triplestore file cache resource migrations-service', { env })
    .exec(`rm -rf ${kaleidosProject}/testdata/db && rm -rf ${kaleidosProject}/testdata/files`)
    .exec(`unzip -o ${kaleidosProject}/testdata.zip -x "elasticsearch/*" -d ${kaleidosProject}`)
    .exec('docker-compose up -d', { env })
    .wait(3000)
}

/**
 * @description Reset the current database indexes to the default database set for testing
 * @name resetSearch
 * @memberOf Cypress.Chainable#
 * @function
 */
function resetSearch() {
  const kaleidosProject = Cypress.env('KALEIDOS_PROJECT');
  const env = {
    COMPOSE_FILE: kaleidosProject + '/docker-compose.yml:' +
      kaleidosProject + '/docker-compose.development.yml:' +
      kaleidosProject + '/docker-compose.test.yml:' +
      kaleidosProject + '/docker-compose.override.yml'
  };

  cy.exec('docker-compose kill triplestore elasticsearch musearch file cache resource', { env })
    .exec(`rm -rf ${kaleidosProject}/testdata`)
    .exec(`unzip -o ${kaleidosProject}/testdata.zip -d ${kaleidosProject}`)
    .exec('docker-compose up -d', { env })
    .wait(60000)
}
