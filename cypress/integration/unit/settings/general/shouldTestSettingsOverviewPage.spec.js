/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import toolbar from '../../../../selectors/toolbar.selectors';
import utils from '../../../../selectors/utils.selectors';
import dependency from '../../../../selectors/dependency.selectors';

context('Settings overview page tests', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.get(toolbar.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
  });

  // TODO test 2-9 testing opening modals is not enough, how can we be sure that the right one has been opened ?

  it('Should open settings page and see all fields from the general settings tab', () => {
    cy.get(settings.settings.generalSettings).should('be.visible');
    cy.get(settings.settings.manageMinisters).should('be.visible');
    cy.get(settings.settings.manageUsers).should('be.visible');
    // settings in this view
    cy.get(settings.overview.manageEmails).should('be.visible');
    cy.get(settings.overview.manageGovermentDomains).should('be.visible');
    cy.get(settings.overview.manageGovermentFields).should('be.visible');
    cy.get(settings.overview.manageIseCodes).should('be.visible');
    cy.get(settings.overview.manageAlerts).should('be.visible');
    cy.get(settings.overview.manageDocumentTypes).should('be.visible');
    cy.get(settings.overview.manageCaseTypes).should('be.visible');
    cy.get(settings.overview.manageSubcaseTypes).should('be.visible');
    cy.get(settings.overview.manageSignatures).should('be.visible');
  });

  it('Should open the model behind manage goverment domains and close it', () => {
    cy.openSettingsModal(settings.overview.manageGovermentDomains);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage goverment fields and close it', () => {
    cy.openSettingsModal(settings.overview.manageGovermentFields);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage ISE codes and close it', () => {
    cy.openSettingsModal(settings.overview.manageIseCodes);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage alerts and close it', () => {
    cy.openSettingsModal(settings.overview.manageAlerts);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage document types and close it', () => {
    cy.openSettingsModal(settings.overview.manageDocumentTypes);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage case types and close it', () => {
    cy.openSettingsModal(settings.overview.manageCaseTypes);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage subcase types and close it', () => {
    cy.openSettingsModal(settings.overview.manageSubcaseTypes);
    cy.closeSettingsModal();
  });

  it('Should open the model behind manage signatures and close it', () => {
    cy.openSettingsModal(settings.overview.manageSignatures);
    cy.closeSettingsModal();
  });

  it('Upload a CSV and delete a user', () => {
    cy.visit('/');
    cy.get(toolbar.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
    cy.get(settings.settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(utils.simpleFileUploader).click();
    cy.uploadUsersFile('files', 'importUsers', 'csv');
    cy.get(settings.usersIndex.searchInput).type('Wendy');
    cy.route('GET', '/users?filter=**').as('filterUsers');
    cy.get(settings.usersIndex.searchButton).click()
      .wait('@filterUsers');
    cy.get(settings.usersIndex.table).contains('Wendy')
      .parents('tr')
      .within(() => {
        cy.get(settings.vlDeleteUser.delete).should('exist')
          .should('be.visible')
          .click();
      });
    cy.route('GET', '/users/*').as('getUsers');
    cy.get(utils.vlModalVerify.save).should('exist')
      .should('be.visible')
      .click();
    cy.wait('@getUsers').then(() => {
      cy.get(settings.usersIndex.table).should('not.have.value', 'Wendy');
    });
    cy.get(settings.usersIndex.searchInput).clear();
    cy.get(settings.usersIndex.table).contains('Greta')
      .parents('tr')
      .within(() => {
        cy.contains('overheid');
      });
    // TODO we do not click the upload button, this works anyway?
    cy.uploadUsersFile('files', 'updateUserGroup', 'csv');
    cy.get(settings.usersIndex.searchInput).type('Greta');
    cy.route('GET', '/users?filter=**').as('filterUsers');
    cy.get(settings.usersIndex.searchButton).click()
      .wait('@filterUsers');
    cy.get('tbody > tr').should('have.length', '1');
    cy.get(settings.usersIndex.table).contains('Greta')
      .parents('tr')
      .within(() => {
        cy.contains('kanselarij');
      });
  });

  it('Should test the search of a user when typing', () => {
    cy.get(settings.settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.usersIndex.searchInput).should('exist')
      .should('be.visible')
      .type('Minister');
    // TODO, this next should can work regardless of search working on the unfiltered tabel
    // wait for search api call, count the number of rows
    cy.get(settings.usersIndex.table).should('contain', 'Minister');
  });

  it('Should trigger search when clicking on search icon', () => {
    cy.route('GET', '/users?filter=**').as('filterUsers');

    cy.get(settings.settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.usersIndex.searchInput).should('exist')
      .should('be.visible')
      .type('Minister');
    cy.get(settings.usersIndex.table).should('contain', 'Minister');
    cy.get(settings.usersIndex.searchButton).click()
      .then(() => {
        cy.wait('@filterUsers');
        cy.get(settings.usersIndex.table).should('contain', 'Minister');
      });
  });

  it('Should navigate to detailview from user', () => {
    cy.get(settings.settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.get(settings.usersIndex.searchInput).should('exist')
      .should('be.visible')
      .type('Minister');
    cy.route('GET', '/users?filter=**').as('filterUsers');
    cy.get(settings.usersIndex.table).should('contain', 'Minister');
    cy.get(settings.usersIndex.searchButton).click()
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

    cy.get(settings.settings.manageUsers).contains('Gebruikersbeheer')
      .click();
    cy.url().should('include', 'instellingen/gebruikers');
    cy.wait('@getUsers').then(() => {
      cy.get(settings.usersIndex.searchInput).should('exist')
        .should('be.visible')
        .type('Minister');
      cy.get(settings.usersIndex.table).should('contain', 'Minister');
      cy.wait(3000); // TODO this wait is not needed ?
      cy.get(settings.goToUserDetail).click();
      cy.contains('Gebruiker: Minister Test');
      cy.contains('Algemene informatie');
      cy.get(dependency.emberPowerSelect.trigger).click();
      cy.get(dependency.emberPowerSelect.option).contains('kabinet')
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
