/* eslint-disable no-undef */
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
  });

  it('Should open the model behind manage goverment domains', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
  });

  it('Should open the model behind manage goverment domains and close it', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get(modalDialogCloseModalSelector).click();
    cy.get(modalDialogSelector).should('not.be.visible');
  });

  it('Should open the dropdown in the modal', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length', 11);
  });

  it('Should open the dropdown in the modal and see each item', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    cy.get('.ember-power-select-trigger').click();
    cy.get('.ember-power-select-option').should('have.length', 11);

    for(let i = 0; i<govermentDomains.length;i++) {
      cy.get('.ember-power-select-option').eq(i).should('contain.text', govermentDomains[i]);
    }
  });

  it('Should open the dropdown in the modal and selecting the first element should show advanced model', () => {
    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
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

    cy.get(settingsSelector).click();
    cy.url().should('include','instellingen/overzicht');
    cy.get(manageGovermentDomainsSelector).click();
    cy.get(modalDialogSelector).should('be.visible');
    for(let i = 0; i<govermentDomains.length;i++) {
      cy.validateDropdownElements(i,govermentDomains[i]);
    }
  });

});
