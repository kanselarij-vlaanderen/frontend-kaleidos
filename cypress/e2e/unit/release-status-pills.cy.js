/* global context, it, cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import auk from '../../selectors/auk.selectors';


context('Testing internal and themis document release pills', () => {
  it('change defaults and check status pills', () => {
    cy.login('Admin');
    const newAgendaDate = Cypress.dayjs().add(2, 'weeks')
      .day(4)
      .hour(14)
      .minute(0);
    const nextDay = newAgendaDate.add(1, 'days');
    const newReleaseDate = Cypress.dayjs().add(2, 'weeks')
      .day(6)
      .hour(14)
      .minute(0);
    cy.createAgenda(null, newAgendaDate, 'Zaal oxford bij Cronos Leuven', null, null);

    cy.openAgendaForDate(newAgendaDate);

    // cy.setFormalOkOnItemWithIndex(0);
    cy.setAllItemsFormallyOk();
    cy.approveAndCloseDesignAgenda();

    // check if planned release date is the changed value
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.planReleaseDocuments).forceClick();
    cy.get(auk.datepicker.datepicker).eq(0)
      .should('have.value', nextDay.format('DD-MM-YYYY HH:mm'));
    cy.get(auk.datepicker.datepicker).eq(1)
      .should('have.value', nextDay.format('DD-MM-YYYY HH:mm'));
    cy.intercept('PATCH', 'internal-document-publication-activities/*').as('patchInternalActivity');
    cy.intercept('PATCH', 'themis-publication-activities/*').as('patchThemisActivity');
    cy.get(agenda.publicationPlanning.confirm.releaseDocuments).click();
    cy.wait('@patchInternalActivity');
    cy.wait('@patchThemisActivity');
    cy.get(agenda.publicationPills.container).within(() => {
      cy.get(appuniversum.pill).eq(0)
        .contains(`Publicatie documenten gepland op ${nextDay.format('DD-MM-YYYY')}`);
      cy.get(appuniversum.pill).eq(1)
        .contains(`Publicatie documenten gepland op ${nextDay.format('DD-MM-YYYY')}`);
    });

    // change release date and check if value changed
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.planReleaseDocuments).forceClick();
    cy.get(auk.datepicker.datepicker).eq(0)
      .click();
    cy.setDateAndTimeInFlatpickr(newReleaseDate);
    cy.get(auk.datepicker.datepicker).eq(1)
      .click({
        force: true,
      });
    cy.intercept('PATCH', 'internal-document-publication-activities/*').as('patchInternalActivity');
    cy.intercept('PATCH', 'themis-publication-activities/*').as('patchInternalActivity');
    cy.setDateAndTimeInFlatpickr(newReleaseDate);
    cy.get(agenda.publicationPlanning.confirm.releaseDocuments).click();
    cy.wait('@patchInternalActivity');
    cy.wait('@patchThemisActivity');
    cy.get(agenda.publicationPills.container).within(() => {
      cy.get(appuniversum.pill).contains(`Publicatie documenten gepland op ${newReleaseDate.format('DD-MM-YYYY')}`);
      // cy.get(appuniversum.pill).eq(1)
      //   .contains(`Publicatie documenten gepland op ${newReleaseDate.format('DD-MM-YYYY')}`);
    });
  });
});
