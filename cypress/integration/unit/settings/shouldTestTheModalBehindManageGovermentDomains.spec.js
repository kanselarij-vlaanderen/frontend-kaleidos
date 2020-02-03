/*global context, it, cy,beforeEach*/
/// <reference types="Cypress" />


import {
  manageGovermentDomainsSelector
} from "../../../selectors/settings/settingsSelectors";
import {settingsSelector} from "../../../selectors/toolbar/toolbarSelectors";
import {
  modalDialogCloseModalSelector,
  modalDialogSelector,
  modalManagerAddSelector, modalManagerCloseSelector, modalManagerDeleteSelector, modalManagerEditSelector
} from "../../../selectors/models/modelSelectors";
import {formInputSelector, formSaveSelector} from "../../../selectors/formSelectors/formSelectors";

context('Settings page tests', () => {

  let govermentDomains = [];
  govermentDomains.push('Cultuur, jeugd, sport & media',
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
  );


  beforeEach(() => {
    cy.server();
    cy.login('Admin');
    cy.route('/')
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
  });

  it('Should open the model behind manage goverment domains', () => {
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
  });

  it('Should open the model behind manage goverment domains and close it', () => {
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get(modalDialogCloseModalSelector).click();
    cy.get(modalDialogSelector).should('not.be.visible');
  });

  it('Should open the dropdown in the modal', () => {
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length', govermentDomains.length);
  });

  it('Should open the dropdown in the modal and see each item', () => {
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length', govermentDomains.length);

    for(let i = 0; i<govermentDomains.length;i++) {
      cy.get('.ember-power-select-option').eq(i).should('contain.text', govermentDomains[i]);
    }
  });

  it('Should open the dropdown in the modal and selecting the first element should show advanced model', () => {
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length.greaterThan', 0);
    cy.get('.ember-power-select-option').eq(0).should('contain.text', "Cultuur, jeugd, sport & media");
    cy.get('.ember-power-select-option').eq(0).click();
    cy.get('.ember-power-select-selected-item').should('contain.text',"Cultuur, jeugd, sport & media");
    cy.get(modalManagerAddSelector).should('be.visible');
    cy.get(modalManagerEditSelector).should('be.visible');
    cy.get(modalManagerDeleteSelector).should('be.visible');
    cy.get(modalManagerCloseSelector).should('be.visible');
  });

  it('Should open the dropdown in the modal and selecting the each element should show advanced model with that element in the dropdown span', () => {
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    for(let i = 0; i<govermentDomains.length;i++) {
      cy.validateDropdownElements(i,govermentDomains[i]);
    }
  });

  it('Should open the modal and add a new item in the list', () => {
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalManagerAddSelector).click();
    cy.get(formInputSelector).type('Andere zaken', {delay: 300});
    cy.get(formSaveSelector).click();
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length', govermentDomains.length + 1);
    // Should clean the database after to get rid of the added elements and so that the other tests can run smooth.
    cy.resetDB();
  });

  // it('Should open the modal, select the first element and edit it to Edited then edit it back to the standard', () => {
  //   cy.route('GET', '/government-domains?sort=label').as('getGovernmentDomains');
  //   cy.get(manageGovermentDomainsSelector).click();
  //   cy.get(modalDialogSelector).should('be.visible');
  //   cy.wait("@getGovernmentDomains");
  //   cy.get('.ember-power-select-trigger').click();
  //   cy.get('.ember-power-select-option').should('have.length.greaterThan', 2);
  //   cy.get('.ember-power-select-option').eq(0).should('contain.text', "Cultuur, jeugd, sport & media");
  //   cy.get('.ember-power-select-option').eq(0).click();
  //   cy.get(modalManagerEditSelector).click();
  //   cy.get(formInputSelector).clear();
  //   cy.get(formInputSelector).type("Edited");
  //   cy.get(formSaveSelector).click();
  // });
});
