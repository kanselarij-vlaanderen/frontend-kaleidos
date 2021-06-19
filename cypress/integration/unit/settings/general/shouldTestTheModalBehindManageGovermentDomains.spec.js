/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import toolbar from '../../../../selectors/toolbar.selectors';
import modal from '../../../../selectors/modal.selectors';
import dependency from '../../../../selectors/dependency.selectors';
import utils from '../../../../selectors/utils.selectors';

context('Settings page tests', () => {
  let govermentDomains = [];

  function insertData() {
    return ['Cultuur, jeugd, sport & media',
      'Economie, wetenschap & innovatie',
      'Financieën & begroting',
      'Internationaal Vlaanderen',
      'Kanselarij & bestuur',
      'Landbouw & visserij',
      'Mobiliteit & openbare werken',
      'Omgeving',
      'Onderwijs & vorming',
      'Welzijn, vollksgezondheid & gezin',
      'Werk & sociale economie'
    ];
  }

  beforeEach(() => {
    govermentDomains = insertData();
    cy.server();
    cy.login('Admin');
    cy.get(toolbar.mHeader.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
  });

  it('Should open the model behind manage goverment domains', () => {
    cy.get(settings.overview.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
  });

  it('Should open the model behind manage goverment domains and close it', () => {
    cy.get(settings.overview.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get(modal.baseModal.close).click();
    cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
  });

  // TODO this test is duplicated by the next two
  it('Should open the dropdown in the modal', () => {
    cy.get(settings.overview.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).should('have.length', govermentDomains.length);
  });

  it('Should open the dropdown in the modal and see each item', () => {
    cy.get(settings.overview.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).should('have.length', govermentDomains.length);

    for (let index = 0; index < govermentDomains.length; index++) {
      cy.get(dependency.emberPowerSelect.option).eq(index)
        .scrollIntoView()
        .should('contain.text', govermentDomains[index]);
    }
  });

  it('Should open the dropdown in the modal and selecting the first element should show advanced modal', () => {
    cy.get(settings.overview.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).should('have.length', govermentDomains.length);
    cy.get(dependency.emberPowerSelect.option).eq(0)
      .should('contain.text', govermentDomains[0]);
    cy.get(dependency.emberPowerSelect.option).eq(0)
      .click();
    cy.get('.ember-power-select-selected-item').should('contain.text', govermentDomains[0])
      .wait(200);
    cy.get(modal.manageInSettingsModal.add).should('be.visible');
    cy.get(modal.manageInSettingsModal.edit).should('be.visible');
    cy.get(modal.manageInSettingsModal.delete).should('be.visible');
    cy.get(modal.baseModal.close).should('be.visible');
  });

  it('Should open the dropdown in the modal and selecting the each element should show advanced modal with that element in the dropdown span', () => {
    cy.get(settings.overview.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    for (let index = 0; index < govermentDomains.length; index++) {
      cy.validateDropdownElements(index, govermentDomains[index]);
    }
  });

  it('Should open the modal and add a new item in the list', () => {
    cy.get(settings.overview.manageGovermentDomains).click();
    cy.get(modal.manageInSettingsModal.add).click();
    cy.get(utils.vlFormInput).type('Andere zaken');
    cy.get(utils.vlModalFooter.save).click();
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).should('have.length', govermentDomains.length + 1);
    // Should clean the database after to get rid of the added elements and so that the other tests can run smooth.
    // cy.resetCache(); //TODO this does nothing
  });

  it('Should open the modal, select the new domain and edit it', () => {
    cy.get(settings.overview.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).should('have.length.greaterThan', 0);
    cy.get(dependency.emberPowerSelect.option).eq(0)
      .should('contain.text', 'Andere zaken');
    cy.get(dependency.emberPowerSelect.option).eq(0)
      .click();
    cy.get(modal.manageInSettingsModal.edit).click();
    cy.get(utils.vlFormInput).clear();
    cy.get(utils.vlFormInput).type('Test Input');
    cy.get(utils.vlModalFooter.save).click();
    // TODO await patch call
    cy.get(dependency.emberPowerSelect.trigger).click();
    cy.get(dependency.emberPowerSelect.option).should('have.length.greaterThan', 0);
    cy.get(dependency.emberPowerSelect.option).should('contain.text', 'Test Input');
    cy.get(dependency.emberPowerSelect.option).should('not.contain.text', 'Andere zaken');
  });
  // TODO delete this new domain
});
