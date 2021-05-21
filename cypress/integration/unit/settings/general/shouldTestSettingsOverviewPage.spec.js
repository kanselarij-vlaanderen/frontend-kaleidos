/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import toolbar from '../../../../selectors/toolbar.selectors';
import modal from '../../../../selectors/modal.selectors';
import agenda from '../../../../selectors/agenda.selectors';
import utils from '../../../../selectors/utils.selectors';
import form from '../../../../selectors/form.selectors';

context('Settings overview page tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.get(toolbar.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
  });

  // TODO test 2-9 testing opening modals is not enough, how can we be sure that the right one has been opened ?

  it('Should open settings page and see all fields from the general settings tab', () => {
    cy.get(settings.generalSettings).should('be.visible');
    cy.get(settings.manageMinisters).should('be.visible');
    cy.get(settings.manageUsers).should('be.visible');
    // settings in this view
    cy.get(settings.manageEmails).should('be.visible');
    cy.get(settings.manageGovermentDomains).should('be.visible');
    cy.get(settings.manageGovermentFields).should('be.visible');
    cy.get(settings.manageIseCodes).should('be.visible');
    cy.get(settings.manageAlerts).should('be.visible');
    cy.get(settings.manageDocumentTypes).should('be.visible');
    cy.get(settings.manageCaseTypes).should('be.visible');
    cy.get(settings.manageSubcaseTypes).should('be.visible');
    cy.get(settings.manageSignatures).should('be.visible');
  });

  it('Should open the model behind manage goverment domains and close it', () => {
    cy.openSettingsModal(settings.manageGovermentDomains);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage goverment fields and close it', () => {
    cy.openSettingsModal(settings.manageGovermentFields);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage ISE codes and close it', () => {
    cy.openSettingsModal(settings.manageIseCodes);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.openSettingsModal(settings.manageAlerts);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage document types and close it', () => {
    cy.openSettingsModal(settings.manageDocumentTypes);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage case types and close it', () => {
    cy.openSettingsModal(settings.manageCaseTypes);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage subcase types and close it', () => {
    cy.openSettingsModal(settings.manageSubcaseTypes);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage signatures and close it', () => {
    cy.openSettingsModal(settings.manageSignatures);
    cy.closeSettingsModal();
  });

  it('Upload a CSV and delete a user', () => {
    cy.visit('/');
    cy.get(toolbar.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(form.fileUploadButton).click({
      force: true,
    });
    cy.uploadUsersFile('files', 'importUsers', 'csv');
    cy.get(settings.userSearchInput).type('Wendy');
    cy.route('GET', '/users?filter=**').as('filterUsers');
    cy.get(settings.userSearchButton).click()
      .wait('@filterUsers');
    cy.get(settings.settingsUserTable).contains('Wendy')
      .parents('tr')
      .within(() => {
        cy.get(settings.deleteUser).should('exist')
          .should('be.visible')
          .click();
      });
    cy.route('GET', '/users/*').as('getUsers');
    cy.get(modal.verify.save).should('exist')
      .should('be.visible')
      .click();
    cy.wait('@getUsers').then(() => {
      cy.get(settings.settingsUserTable).should('not.have.value', 'Wendy');
    });
    cy.get(settings.userSearchInput).clear();
    cy.get(settings.settingsUserTable).contains('Greta')
      .parents('tr')
      .within(() => {
        cy.contains('overheid');
      });
    cy.uploadUsersFile('files', 'updateUserGroup', 'csv');
    cy.get(settings.userSearchInput).type('Greta');
    cy.route('GET', '/users?filter=**').as('filterUsers');
    cy.get(settings.userSearchButton).click()
      .wait('@filterUsers');
    cy.get('tbody > tr').should('have.length', '1');
    cy.get(settings.settingsUserTable).contains('Greta')
      .parents('tr')
      .within(() => {
        cy.contains('kanselarij');
      });
  });

  it('Should test the search of a user when typing', () => {
    cy.get(settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.userSearchInput).should('exist')
      .should('be.visible')
      .type('Minister');
    // TODO, this next should can work regardless of search working on the unfiltered tabel
    // wait for search api call, count the number of rows
    cy.get(settings.settingsUserTable).should('contain', 'Minister');
  });

  it('Should trigger search when clicking on search icon', () => {
    cy.route('GET', '/users?filter=**').as('filterUsers');

    cy.get(settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.userSearchInput).should('exist')
      .should('be.visible')
      .type('Minister');
    cy.get(settings.settingsUserTable).should('contain', 'Minister');
    cy.get(settings.userSearchButton).click()
      .then(() => {
        cy.wait('@filterUsers');
        cy.get(settings.settingsUserTable).should('contain', 'Minister');
      });
  });

  it('Should navigate to detailview from user', () => {
    cy.route('GET', '/users?filter=**').as('filterUsers');
    cy.get(settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.userSearchInput).should('exist')
      .should('be.visible')
      .type('Minister');
    cy.get(settings.settingsUserTable).should('contain', 'Minister');
    cy.get(settings.userSearchButton).click()
      .then(() => {
        cy.wait('@filterUsers');
        cy.get(settings.goToUserDetail).should('exist')
          .should('be.visible')
          .click();
      });
    cy.contains('Gebruiker: Minister Test');
    cy.contains('Algemene informatie');
  });

  it('Should change the group of the user from the detailpage', () => {
    cy.route('GET', '/users?**').as('getUsers');
    cy.route('GET', '/users?filter=**').as('filterUsers');

    cy.get(settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.wait('@getUsers').then(() => {
      cy.get(settings.userSearchInput).should('exist')
        .should('be.visible')
        .type('Minister');
      cy.get(settings.settingsUserTable).should('contain', 'Minister');
      cy.wait(3000); // TODO this wait is not needed ?
      cy.get(settings.goToUserDetail).click();
      cy.contains('Gebruiker: Minister Test');
      cy.contains('Algemene informatie');
      cy.get(settings.emberPowerSelectTrigger).click();
      cy.get(agenda.emberPowerSelectOption).contains('kabinet')
        .click();
      cy.wait(5000); // TODO await PATCH call instead
      cy.get(utils.generalBackButton).should('exist')
        .should('be.visible')
        .click();
      cy.wait(3000); // TODO why wait ?
      cy.contains('kabinet');
    });
  });
});
