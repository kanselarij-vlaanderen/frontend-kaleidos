/* global context, it, cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import utils from '../../selectors/utils.selectors';


context('Propagation to other graphs', () => {
  it('change defaults and check status pills', () => {
    cy.login('Admin');
    const newAgendaDate = Cypress.dayjs().add(2, 'weeks')
      .day(4)
      .hour(14)
      .minute(0);
    const newReleaseDate = Cypress.dayjs().add(2, 'weeks')
      .day(5)
      .hour(14)
      .minute(0);
    cy.createAgenda(null, newAgendaDate, 'Zaal oxford bij Cronos Leuven', null, null, newAgendaDate);
    cy.log(newAgendaDate.format('DD-MM-YYYY HH:mm'));

    cy.openAgendaForDate(newAgendaDate);

    cy.setFormalOkOnItemWithIndex(0);
    cy.approveAndCloseDesignAgenda();

    // check if planned release date is the changed value
    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.releaseDocuments).click({
      force: true,
    });
    cy.get(utils.vlDatepicker).eq(0)
      .should('have.value', newAgendaDate.format('DD-MM-YYYY HH:mm'));
    cy.get(utils.vlDatepicker).eq(1)
      .should('have.value', newAgendaDate.format('DD-MM-YYYY HH:mm'));
    cy.intercept('PATCH', 'internal-document-publication-activities/*').as('patchInternalActivity');
    cy.intercept('PATCH', 'themis-publication-activities/*').as('patchThemisActivity');
    cy.get(agenda.agendaHeader.confirm.releaseDocuments).click();
    cy.wait('@patchInternalActivity');
    cy.wait('@patchThemisActivity');
    cy.get(agenda.publicationPills.container).within(() => {
      cy.get(appuniversum.pill).eq(0)
        .contains(`Publicatie documenten gepland op ${newAgendaDate.format('DD-MM-YYYY')}`);
      cy.get(appuniversum.pill).eq(1)
        .contains(`Publicatie documenten gepland op ${newAgendaDate.format('DD-MM-YYYY')}`);
    });

    // change release date and check if value changed
    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.releaseDocuments).click({
      force: true,
    });
    cy.get(utils.vlDatepicker).eq(0)
      .click();
    cy.setDateAndTimeInFlatpickr(newReleaseDate);
    cy.get(utils.vlDatepicker).eq(1)
      .click({
        force: true,
      });
    cy.intercept('PATCH', 'internal-document-publication-activities/*').as('patchInternalActivity');
    cy.intercept('PATCH', 'themis-publication-activities/*').as('patchInternalActivity');
    cy.setDateAndTimeInFlatpickr(newReleaseDate);
    cy.get(agenda.agendaHeader.confirm.releaseDocuments).click();
    cy.wait('@patchInternalActivity');
    cy.wait('@patchThemisActivity');
    cy.get(agenda.publicationPills.container).within(() => {
      cy.get(appuniversum.pill).contains(`Publicatie documenten gepland op ${newReleaseDate.format('DD-MM-YYYY')}`);
      // cy.get(appuniversum.pill).eq(1)
      //   .contains(`Publicatie documenten gepland op ${newReleaseDate.format('DD-MM-YYYY')}`);
    });
  });
});
