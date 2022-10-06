/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import utils from '../../../../selectors/utils.selectors';
import dependency from '../../../../selectors/dependency.selectors';
import auk from '../../../../selectors/auk.selectors';

context('Settings overview page tests', () => {
  beforeEach(() => {
    cy.login('Admin');
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
  });

  // TODO-settings test 2-9 are duplicated in their own specs
  // disabled some of these tests in light of upcoming refactor (rights/groups come from ACMIDM)
  // Change and reenable later

  it('Should open settings page and see all fields from the general settings tab', () => {
    cy.get(settings.settings.generalSettings).should('be.visible');
    cy.get(settings.settings.manageMinisters).should('be.visible');
    cy.get(settings.settings.manageUsers).should('be.visible');
    // settings in this view
    cy.get(settings.overview.manageEmails).should('be.visible');
    cy.get(settings.overview.manageAlerts).should('be.visible');
    cy.get(settings.overview.manageDocumentTypes).should('be.visible');
    cy.get(settings.overview.manageCaseTypes).should('be.visible');
    cy.get(settings.overview.manageSubcaseTypes).should('be.visible');
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.openSettingsModal(settings.overview.manageAlerts);
    cy.get(utils.vlModal.container).should('contain', 'Systeemberichten beheer');
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage document types and close it', () => {
    cy.openSettingsModal(settings.overview.manageDocumentTypes);
    cy.get(utils.vlModal.container).should('contain', 'Document-types beheer');
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage case types and close it', () => {
    cy.openSettingsModal(settings.overview.manageCaseTypes);
    cy.get(utils.vlModal.container).should('contain', 'Dossier-types beheer');
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage subcase types and close it', () => {
    cy.openSettingsModal(settings.overview.manageSubcaseTypes);
    cy.get(utils.vlModal.container).should('contain', 'Procedurestap types beheer');
    cy.closeSettingsModal();
  });

  it.skip('Upload a CSV and delete a user', () => {
    cy.get(settings.settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    // Importeer csv met Wendy en Greta
    cy.get(settings.usersIndex.importCSV).click();
    cy.uploadUsersFile('files', 'importUsers', 'csv');
    // Zoek en verwijder Wendy
    cy.get(settings.usersIndex.searchInput).type('Wendy');
    cy.intercept('GET', '/users?filter=**').as('filterUsers');
    cy.get(settings.usersIndex.searchButton).click()
      .wait('@filterUsers');
    cy.get(settings.usersIndex.table).contains('Wendy')
      .parents('tr')
      .find(settings.vlDeleteUser.delete) // only 1 row
      .click();
    cy.intercept('GET', '/users/*').as('getUsers');
    cy.intercept('DELETE', '/accounts/*').as('deleteAccount');
    cy.intercept('DELETE', '/users/*').as('deleteUser');
    cy.get(utils.vlModalVerify.save).click();
    cy.wait('@getUsers');
    cy.wait('@deleteAccount');
    cy.wait('@deleteUser');
    cy.get(settings.usersIndex.table).should('not.have.value', 'Wendy');
    cy.get(settings.usersIndex.searchInput).clear();
    // Zoek Greta en pas de groep aan met nieuwe import
    cy.get(settings.usersIndex.table).contains('Greta')
      .parents('tr')
      .find(settings.usersIndex.row.group)
      .contains('overheid');
    cy.get(settings.usersIndex.importCSV).click();
    cy.uploadUsersFile('files', 'updateUserGroup', 'csv');
    cy.get(settings.usersIndex.searchInput).type('Greta');
    cy.intercept('GET', '/users?filter=**').as('filterUsers');
    cy.get(settings.usersIndex.searchButton).click()
      .wait('@filterUsers');
    cy.get(settings.usersIndex.table).should('have.length', '1');
    cy.get(settings.usersIndex.table).contains('Greta')
      .parents('tr')
      .find(settings.usersIndex.row.group)
      .contains('kanselarij');
  });

  it.skip('Should test the search of a user when typing', () => {
    cy.intercept('GET', '/users?filter=Minister**').as('filterUsersMinister');
    cy.get(settings.settings.manageUsers).click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.usersIndex.searchInput).type('Minister')
      .wait('@filterUsersMinister');
    cy.get(settings.usersIndex.row.firstname).should('have.length', '1')
      .should('contain', 'Minister');
  });

  it.skip('Should trigger search when clicking on search icon', () => {
    cy.intercept('GET', '/users?filter=Minister**').as('filterUsersMinister');

    cy.get(settings.settings.manageUsers).click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.usersIndex.searchInput).type('Minister')
      .wait('@filterUsersMinister');
    cy.get(settings.usersIndex.row.firstname).should('contain', 'Minister');
    cy.get(settings.usersIndex.searchButton).click()
      .wait('@filterUsersMinister');
    cy.get(settings.usersIndex.row.firstname).should('contain', 'Minister');
  });

  it.skip('Should navigate to detailview from user', () => {
    cy.intercept('GET', '/users?filter=Minister**').as('filterUsersMinister');

    cy.get(settings.settings.manageUsers).click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.usersIndex.searchInput).type('Minister')
      .wait('@filterUsersMinister');
    cy.get(settings.usersIndex.row.firstname).should('contain', 'Minister');
    cy.get(settings.usersIndex.searchButton).click()
      .wait('@filterUsersMinister');
    cy.get(settings.goToUserDetail).click();
    cy.get(settings.settingsHeader.title).contains('Gebruiker: Minister Test');
    cy.get(settings.user.generalInfo).contains('Algemene informatie');
    cy.get(settings.user.technicalInfo).contains('Technische informatie');
    // TODO-users check all fields for a user ?
  });

  it.skip('Should change the group of the user from the detailpage', () => {
    cy.intercept('GET', '/users?**').as('getUsers');
    cy.intercept('GET', '/users?filter=Minister**').as('filterUsersMinister');
    cy.intercept('PATCH', '/users/*').as('patchUsers');

    cy.get(settings.settings.manageUsers).click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.wait('@getUsers');
    cy.get(settings.usersIndex.searchInput).type('Minister')
      .wait('@filterUsersMinister');
    cy.get(settings.usersIndex.row.firstname).contains('Minister')
      .parents('tr')
      .within(() => {
        cy.get(settings.usersIndex.row.group).contains('minister');
        cy.get(settings.goToUserDetail).click();
      });
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).contains('kabinet')
      .click();
    cy.wait('@patchUsers');
    cy.get(auk.backButton).click();
    cy.get(settings.usersIndex.row.firstname).contains('Minister')
      .parents('tr')
      .find(settings.usersIndex.row.group)
      .contains('kabinet');
  });
});
