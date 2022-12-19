/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import utils from '../../../../selectors/utils.selectors';

context('Settings overview page tests', () => {
  beforeEach(() => {
    cy.login('Admin');
    cy.get(utils.mHeader.settings).click();
    cy.url().should('include', 'instellingen');
  });

  // TODO-settings test 2-9 are duplicated in their own specs

  it('Should open settings page and see all fields from the general settings tab', () => {
    cy.get(settings.settings.generalSettings).should('be.visible');
    cy.get(settings.settings.manageMinisters).should('be.visible');
    cy.get(settings.settings.manageUsers).should('be.visible');
    // settings in this view
    cy.get(settings.overview.manageEmails).should('be.visible');
    cy.get(settings.overview.manageAlerts).should('be.visible');
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.openSettingsModal(settings.overview.manageAlerts);
    cy.get(utils.vlModal.container).should('contain', 'Systeemberichten beheer');
    cy.closeSettingsModal();
  });

  it('Should trigger search when clicking on search icon', () => {
    cy.intercept('GET', '/users?filter=Minister**').as('filterUsersMinister');

    cy.get(settings.settings.manageUsers).click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.usersIndex.searchInput).type('Minister');
    cy.get(settings.usersIndex.searchButton).click()
      .wait('@filterUsersMinister');
    cy.get(settings.usersIndex.row.name).should('contain', 'Minister');
  });

  it('Should navigate to detailview from user', () => {
    cy.intercept('GET', '/users?filter=Minister**').as('filterUsersMinister');

    cy.get(settings.settings.manageUsers).click();
    cy.get(settings.usersIndex.table).should('not.contain', 'Aan het laden');
    cy.get(utils.numberPagination.container).contains('van 13'); // page loaded
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.usersIndex.searchInput).type('Minister');
    cy.get(settings.usersIndex.searchButton).click()
      .wait('@filterUsersMinister');
    cy.get(settings.goToUserDetail).click();
    cy.get(settings.settingsHeader.title).contains('Gebruiker: Minister Test');
    cy.get(settings.user.generalInfo).contains('Algemene informatie');
    cy.get(settings.user.technicalInfo).contains('Rechten');
    // TODO-users check all fields for a user ?
  });
});
