/* global context, beforeEach, it, cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
}

function changeSubcaseType(caseTitle, type) {
  cy.openCase(caseTitle);
  cy.openSubcase(0);
  cy.get(cases.subcaseDescription.edit).click();
  cy.get(cases.subcaseDescriptionEdit.type).contains(type)
    .click();
  cy.route('PATCH', '/agendas/**').as('patchAgendas');
  // TODO add selector to which file?
  cy.get('[data-test-vl-save]').click();
  cy.wait('@patchAgendas');
}

context('newsletter tests, both in agenda detail view and newsletter route', () => {
  const caseTitle = `Cypress test: Nota - ${currentTimestamp()}`;
  const subcaseTitleShort = `Cypress test: korte titel Nota - ${currentTimestamp()}`;
  const subcaseTitleLong = `Cypress test: lange titel Nota - ${currentTimestamp()}`;
  const finalAdaptedSubcaseTitleShort = `Cypress test: Nota met aangepaste korte titel na mededeling - ${currentTimestamp()}`;
  const finalAdaptedSubcaseTitleLong = `Cypress test: Nota met aangepaste lange titel na mededeling - ${currentTimestamp()}`;
  const text = 'tekst om te checken of default overname correct werkt';
  const addedText = ' van 2e test';
  const theme = 'Justitie en Handhaving';
  const theme2 = 'Landbouw en Visserij';

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
      .as('checkboxValue');
    cy.get('@checkboxValue').parent()
      .as('checkboxContainer');
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

  it('should test default newsletter values on nota', () => {
    const type = 'Nota';

    cy.createCase(caseTitle);
    cy.addSubcase(type, subcaseTitleShort, subcaseTitleLong, null, null);
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.addAgendaitemToAgenda(subcaseTitleShort, false);
    cy.openAgendaitemKortBestekTab(subcaseTitleShort);
    // check if KB empty
    cy.get(utils.vlAlert.message).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.get(newsletter.newsItem.create).click();
    // check default values
    // TODO-Nota check if default in-newsletter is off
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // TODO check if editor empty
    // cy.get(newsletter.editItem.rdfaEditor).should('be.empty');
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    // add text to rdfaEditor and select theme
    cy.get(newsletter.editItem.rdfaEditor).type(text);
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.get(newsletter.editItem.toggleFinished).click();
    cy.route('POST', '/newsletter-infos').as('postNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@postNewsItem');
    // check KB views for in-newsletter toggle
    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    cy.route('PATCH', '/newsletter-infos/**').as('patchNewsItem');
    cy.get(newsletter.tableRow.newsletterTitle).contains(subcaseTitleShort)
      .parents(newsletter.tableRow.newsletterRow)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .should('not.be.checked') // this is the default for nota
      .parent()
      .click();
    cy.wait('@patchNewsItem');
  });

  it('should test default newsletter values on new nota', () => {
    const type = 'Nota';
    const adaptedSubcaseTitleShort = `Cypress test: Nota met aangepaste korte titel - ${currentTimestamp()}`;
    const adaptedSubcaseTitleLong = `Cypress test: Nota met aangepaste lange titel- ${currentTimestamp()}`;

    cy.openCase(caseTitle);
    cy.addSubcase(type, adaptedSubcaseTitleShort, adaptedSubcaseTitleLong, null, null);
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.addAgendaitemToAgenda(adaptedSubcaseTitleShort, false);
    cy.openAgendaitemKortBestekTab(adaptedSubcaseTitleShort);
    // check if KB empty
    cy.get(utils.vlAlert.message).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.get(newsletter.newsItem.create).click();
    // check default values
    // TODO-Nota check if default in-newsletter is off
    cy.get(newsletter.editItem.longTitle).contains(adaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort);
    cy.get(newsletter.editItem.rdfaEditor).contains(text);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme);
    // edit
    cy.get(newsletter.editItem.shortTitle).type(addedText);
    cy.get(newsletter.editItem.rdfaEditor).type(addedText);
    cy.get(newsletter.editItem.themesSelector).contains(theme2)
      .click();
    cy.route('POST', '/newsletter-infos').as('postNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@postNewsItem');
  });

  it('should test default newsletter values on mededeling', () => {
    const type = 'Mededeling';
    const adaptedSubcaseTitleShort = `Cypress test: Mededeling met aangepaste korte titel - ${currentTimestamp()}`;
    const adaptedSubcaseTitleLong = `Cypress test: Mededeling met aangepaste lange titel- ${currentTimestamp()}`;

    cy.openCase(caseTitle);
    cy.addSubcase(type, adaptedSubcaseTitleShort, adaptedSubcaseTitleLong, null, null);
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.addAgendaitemToAgenda(adaptedSubcaseTitleShort, false);
    cy.openAgendaitemKortBestekTab(adaptedSubcaseTitleShort);
    // check if KB already exists
    cy.get(newsletter.agendaitemNewsItem.title).contains(adaptedSubcaseTitleShort);
    // check default values
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.shortTitle).should('have.value', adaptedSubcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('be.checked');
    // value of subtitle from newsletter info is empty, but we show agendaitem title in frontend
    cy.get(newsletter.editItem.longTitle).contains(adaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.rdfaEditor).contains(adaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    cy.get(newsletter.editItem.cancel).click();
    cy.openAgendaitemDossierTab(adaptedSubcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.showInNewsletter).should('be.checked');
  });

  it('should test default newsletter values and long title on mededeling without long title', () => {
    const type = 'Mededeling';
    const adaptedSubcaseTitleShort = `Cypress test: Mededeling zonder lange titel - ${currentTimestamp()}`;

    cy.openCase(caseTitle);
    cy.addSubcase(type, adaptedSubcaseTitleShort, null, null, null);
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.addAgendaitemToAgenda(adaptedSubcaseTitleShort, false);
    cy.openAgendaitemKortBestekTab(adaptedSubcaseTitleShort);
    // check if KB already exists
    cy.get(newsletter.agendaitemNewsItem.title).contains(adaptedSubcaseTitleShort);
    // check default values
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.shortTitle).should('have.value', adaptedSubcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('be.checked');
    // value of subtitle from newsletter info is empty, but we show agendaitem title in frontend
    // TODO-newsletter are these contains correct?
    cy.get(newsletter.editItem.longTitle).should('contain', '');
    // TODO check if editor empty
    cy.get(newsletter.editItem.rdfaEditor).should('contain', '');
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
  });

  it('should test default newsletter values on new nota after multiple mededeling', () => {
    const type = 'Nota';

    cy.openCase(caseTitle);
    cy.addSubcase(type, finalAdaptedSubcaseTitleShort, finalAdaptedSubcaseTitleLong, null, null);
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.addAgendaitemToAgenda(finalAdaptedSubcaseTitleShort, false);
    cy.openAgendaitemKortBestekTab(finalAdaptedSubcaseTitleShort);
    // check if KB empty
    cy.get(utils.vlAlert.message).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.get(newsletter.newsItem.create).click();
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(finalAdaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort + addedText);
    cy.get(newsletter.editItem.rdfaEditor).contains(text + addedText);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme2);
    // check KB views for in-newsletter toggle
    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    cy.get(newsletter.tableRow.newsletterTitle).contains(subcaseTitleShort + addedText)
      .parents(newsletter.tableRow.newsletterRow)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .should('not.be.checked');
  });

  it('should switch between nota and medeling and test default newsletter values', () => {
    changeSubcaseType(caseTitle, 'Mededeling');
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.openAgendaitemKortBestekTab(finalAdaptedSubcaseTitleShort);
    // check if KB empty
    cy.get(utils.vlAlert.message).contains('Nog geen kort bestek voor dit agendapunt.');
    // check default values
    cy.get(newsletter.newsItem.create).click();
    cy.get(newsletter.editItem.shortTitle).should('have.value', finalAdaptedSubcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('be.checked');
    // value of subtitle from newsletter info is empty, but we show agendaitem title in frontend
    cy.get(newsletter.editItem.longTitle).contains(finalAdaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.rdfaEditor).contains(finalAdaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    cy.get(newsletter.editItem.cancel).click();

    changeSubcaseType(caseTitle, 'Nota');
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.openAgendaitemKortBestekTab(finalAdaptedSubcaseTitleShort);
    // check if KB empty
    cy.get(utils.vlAlert.message).contains('Nog geen kort bestek voor dit agendapunt.');

    changeSubcaseType(caseTitle, 'Mededeling');
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.openAgendaitemKortBestekTab(finalAdaptedSubcaseTitleShort);
    // check if KB empty
    cy.get(utils.vlAlert.message).contains('Nog geen kort bestek voor dit agendapunt.');
    // check default values
    cy.get(newsletter.newsItem.create).click();
    cy.get(newsletter.editItem.shortTitle).should('have.value', finalAdaptedSubcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('be.checked');
    // value of subtitle from newsletter info is empty, but we show agendaitem title in frontend
    cy.get(newsletter.editItem.longTitle).contains(finalAdaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.rdfaEditor).contains(finalAdaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    cy.get(newsletter.editItem.cancel).click();

    changeSubcaseType(caseTitle, 'Nota');
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.openAgendaitemKortBestekTab(finalAdaptedSubcaseTitleShort);
    // check if KB empty
    cy.get(utils.vlAlert.message).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.get(newsletter.newsItem.create).click();
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(finalAdaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort + addedText);
    cy.get(newsletter.editItem.rdfaEditor).contains(text + addedText);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme2);
    // check KB views for in-newsletter toggle
    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    cy.get(newsletter.tableRow.newsletterTitle).contains(subcaseTitleShort + addedText)
      .parents(newsletter.tableRow.newsletterRow)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .should('not.be.checked');
  });
});
