/* global context, beforeEach, it, cy */
// / <reference types="Cypress" />

import dependency from '../../selectors/dependency.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

context('newsletter tests, both in agenda detail view and newsletter route', () => {
  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  // tests in newsletter route

  it('Should create a newsletter and check the updated row information', () => {
    const decisionText = 'Dit is een leuke beslissing';
    const subcaseNameToCheck = 'Eerste stap';
    cy.visit('/vergadering/5DD7CDA58C70A70008000001/kort-bestek');
    // There is only one row in this view, so eq(0) in not needed
    cy.get(newsletter.tableRow.newsletterRow).within(() => {
      cy.get(newsletter.tableRow.newsletterTitle).contains('Nog geen kort bestek voor dit agendapunt.');
      cy.get(newsletter.buttonToolbar.edit).click();
    });

    cy.get(dependency.rdfa.editorInner).clear()
      .type(decisionText);
    cy.get(newsletter.editItem.themesSelector).contains('Sport')
      .click();
    cy.route('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(newsletter.editItem.save).click()
      .wait('@newsletterInfosPost');

    cy.get(newsletter.tableRow.newsletterTitle).contains(subcaseNameToCheck);
    cy.get(newsletter.tableRow.newsletterTitle).contains(decisionText);
    // TODO-newsletter there is no proof that adding theme actually worked
  });

  it('Should toggle the box "in kort bestek" and patch the model', () => {
    cy.route('PATCH', '/newsletter-infos/*').as('patchNewsletterInfo');
    cy.visit('/vergadering/5EBA9588751CF70008000012/kort-bestek');
    // define alias
    cy.get(newsletter.tableRow.newsletterRow).find(newsletter.tableRow.inNewsletterCheckbox)
      .as('checkboxContainer');
    cy.get('@checkboxContainer').find(utils.vlCheckbox.checkbox)
      .as('checkboxValue');
    // checkbox is unchecked, toggle it
    cy.get('@checkboxValue').should('not.be.checked');
    cy.get('@checkboxContainer').click();
    cy.wait('@patchNewsletterInfo');
    // checkbox is checked, toggle it back
    cy.get('@checkboxValue').should('be.checked');
    cy.get('@checkboxContainer').click();
    cy.wait('@patchNewsletterInfo');
    // checkbox is unchecked
    cy.get('@checkboxValue').should('not.be.checked');
    // TODO-newsletter Check "definitief" view
  });

  // test in agenda detail

  it('Test full warning flow on KB', () => {
    const caseTitle = 'testId=1589281897: Cypress test dossier 1';
    const subcaseTitle1 = `${caseTitle} test stap 1`;
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    // TODO-newsletter this route does not work
    // cy.route('GET', '/pieces?fields**').as('getPieces');
    cy.visit('/vergadering/5EBA84900A655F0008000004/kort-bestek/nota-updates');
    // cy.wait('@getPieces');
    cy.get(route.notaUpdates.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .contains('Geen resultaten gevonden');
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten/5EBA84AE0A655F0008000008/kort-bestek');
    // there is no changes alert before we add the BIS
    cy.get(newsletter.agendaitemNewsItem.themes); // when themes component is loaded, we can check the changes Alert
    cy.get(utils.changesAlert.alert).should('not.be.visible');

    cy.addNewPieceToAgendaitem(subcaseTitle1, file.newFileName, file);
    cy.openAgendaitemKortBestekTab(subcaseTitle1);
    cy.get(utils.changesAlert.alert).should('be.visible');
    cy.get(utils.changesAlert.close).click();
    cy.get(utils.changesAlert.alert).should('not.be.visible');
    // Edit KB
    cy.get(newsletter.newsItem.edit).should('be.visible')
      .click();
    cy.get(newsletter.editItem.rdfaEditor).type('Aanpassing');
    cy.route('PATCH', '/newsletter-infos/*').as('patchNewsletterInfo');
    cy.get(newsletter.editItem.save).click();
    cy.get(utils.vlModalVerify.save).click();
    cy.wait('@patchNewsletterInfo');
    cy.openAgendaitemDocumentTab(subcaseTitle1);
    cy.openAgendaitemKortBestekTab(subcaseTitle1);
    cy.get(utils.changesAlert.alert).should('not.be.visible');
    cy.visit('/vergadering/5EBA84900A655F0008000004/kort-bestek/nota-updates');
    // cy.wait('@getPieces');
    cy.get(route.notaUpdates.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .contains(subcaseTitle1);
  });
});
