/*global context, before, it, cy, Cypress, beforeEach*/
/// <reference types="Cypress" />


import agenda from '../../selectors/agenda.selectors';
import modal from '../../selectors/modal.selectors';
import utils from '../../selectors/utils.selectors';
import form from '../../selectors/form.selectors';

context('Agenda tests', () => {

  // before(() => {
  //   cy.resetDB();
  // });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('STEP 1: Create new agenda', () => {
    cy.visit('/overzicht').then(() => {
      // Wait for all calls to finish before we continue the activities.
      cy.route('GET','/meetings/**').as('meetings');
      cy.wait('@meetings').its('status').should('to.equal', 200)
        .then(() => {
          cy.existsAndVisible(agenda.createNewAgendaButton)
          .click()
          .then(() => {
            cy.existsAndInvisible(modal.vlModalComponents.createNewAgendaModal);
            cy.existsAndInvisible(modal.baseModal.container);
            cy.existsAndVisible(modal.baseModal.dialogWindow);
            return cy.existsAndVisible('.ember-power-select-trigger')
              .click()
              .then(() => {
                return cy.selectOptionInSelectByText("Ministerraad");
            }).then(() => {
                cy.existsAndVisible(utils.datePickerIcon)
                  .click()
                  .then(() => {
                    cy.setYearMonthDayHourMinuteInFlatPicker(2019, "augustus","5",'15',"30");
                  });
            });
        })
            .then(() => {
              cy.existsAndVisible(form.formInput).type('Plaats van de vergadering').then(() => {
                cy.existsAndVisible(form.formSave).click();
              })
            });
      });
    });
  });
});
