/* global context, it, cy,beforeEach */
// / <reference types="Cypress" />

import settings from '../../../../selectors/settings.selectors';
import toolbar from '../../../../selectors/toolbar.selectors';
import modal from '../../../../selectors/modal.selectors';
import form from '../../../../selectors/form.selectors';

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
    cy.get(toolbar.settings).click();
    cy.url().should('include', 'instellingen/overzicht');
  });

  it('Should open the model behind manage goverment domains', () => {
    cy.get(settings.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
  });

  it('Should open the model behind manage goverment domains and close it', () => {
    cy.get(settings.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get(modal.baseModal.close).click();
    cy.get(modal.baseModal.dialogWindow).should('not.be.visible');
  });

  it('Should open the dropdown in the modal', () => {
    cy.get(settings.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length', govermentDomains.length);
  });

  it('Should open the dropdown in the modal and see each item', () => {
    cy.get(settings.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length', govermentDomains.length);

    for (let i = 0; i < govermentDomains.length; i++) {
      cy.get('.ember-power-select-option').eq(i)
        .scrollIntoView()
        .should('contain.text', govermentDomains[i]);
    }
  });

  it('Should open the dropdown in the modal and selecting the first element should show advanced model', () => {
    cy.get(settings.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length', govermentDomains.length);
    cy.get('.ember-power-select-option').eq(0)
      .should('contain.text', 'Cultuur, jeugd, sport & media');
    cy.get('.ember-power-select-option').eq(0)
      .click();
    cy.get('.ember-power-select-selected-item').should('contain.text', 'Cultuur, jeugd, sport & media')
      .wait(200);
    cy.get(modal.manageInSettingsModal.add).should('be.visible');
    cy.get(modal.manageInSettingsModal.edit).should('be.visible');
    cy.get(modal.manageInSettingsModal['delete']).should('be.visible');
    cy.get(modal.baseModal.close).should('be.visible');
  });

  it('Should open the dropdown in the modal and selecting the each element should show advanced model with that element in the dropdown span', () => {
    cy.get(settings.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    for (let i = 0; i < govermentDomains.length; i++) {
      cy.validateDropdownElements(i, govermentDomains[i]);
    }
  });

  it('Should open the modal and add a new item in the list', () => {
    cy.get(settings.manageGovermentDomains).click();
    cy.get(modal.manageInSettingsModal.add).click();
    cy.get(form.formInput).type('Andere zaken');
    cy.get(form.formSave).click();
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length', govermentDomains.length + 1);
    // Should clean the database after to get rid of the added elements and so that the other tests can run smooth.
    // cy.resetCache(); //TODO this does nothing
  });

  it('Should open the modal, select the first element and edit it to Edited then edit it back to the standard', () => {
    cy.get(settings.manageGovermentDomains).click();
    cy.get(modal.baseModal.dialogWindow).should('be.visible');
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length.greaterThan', 0);
    cy.get('.ember-power-select-option').eq(0)
      .should('contain.text', 'Andere zaken');
    cy.get('.ember-power-select-option').eq(0)
      .click();
    cy.get(modal.manageInSettingsModal.edit).click();
    cy.get(form.formInput).clear();
    cy.get(form.formInput).type('Test Input');
    cy.get(form.formSave).click();
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length.greaterThan', 0);
    cy.get('.ember-power-select-option').should('contain.text', 'Test Input');
    cy.get('.ember-power-select-option').should('not.contain.text', 'Andere zaken');
  });
});
