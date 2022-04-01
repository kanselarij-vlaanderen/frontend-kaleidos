/* global context, beforeEach, it, cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

function pressRdfaButton(buttonName) {
  cy.get('button').contains(buttonName)
    .parent('button')
    .click();
}

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

function openNewsletterForDate(date) {
  cy.get(utils.mHeader.newsletters).click();
  cy.get(route.newsletters.row.title).contains(date.format('DD.MM.YYYY'))
    .parent()
    .click();
}

function changeSubcaseType(caseTitle, type) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.openCase(caseTitle);
  cy.intercept('GET', '/custom-subcases/**').as(`loadSubcasePhases${randomInt}`);
  cy.openSubcase(0);
  cy.wait(`@loadSubcasePhases${randomInt}`);
  cy.get(cases.subcaseDescription.edit).click();
  cy.get(cases.subcaseDescriptionEdit.type).contains(type)
    .click();

  cy.intercept('PATCH', '/subcases/**').as(`patchSubcase${randomInt}`);
  cy.intercept('PATCH', '/agendaitems/**').as(`patchAgendaitem${randomInt}`);
  cy.intercept('PATCH', '/agendas/**').as(`patchAgenda${randomInt}`);
  cy.intercept('DELETE', '/newsletter-infos/**').as(`deleteNewsletterInfo${randomInt}`);
  cy.intercept('POST', '/newsletter-infos').as(`postNewsletterInfo${randomInt}`);
  // TODO add selector to which file?
  cy.get('[data-test-vl-save]').click();
  cy.wait(`@patchSubcase${randomInt}`);
  cy.wait(`@patchAgendaitem${randomInt}`);
  cy.wait(`@patchAgenda${randomInt}`);
  // When switching to type announcement, we delete (only if ony exists) and create a new one with defaults
  if (type === 'Mededeling') {
    cy.wait(`@postNewsletterInfo${randomInt}`);
  } else {
    // When switching to note, we delete the existing default one from announcement
    cy.wait(`@deleteNewsletterInfo${randomInt}`);
  }
}

context('newsletter tests, both in agenda detail view and newsletter route', () => {
  const caseTitle = `Cypress test: Nota - ${currentTimestamp()}`;
  const subcaseTitleShort = `Cypress test: korte titel Nota - ${currentTimestamp()}`;
  const subcaseTitleLong = `Cypress test: lange titel Nota - ${currentTimestamp()}`;
  const finalAdaptedSubcaseTitleShort = `Cypress test: Nota met aangepaste korte titel na mededeling - ${currentTimestamp()}`;
  const finalAdaptedSubcaseTitleLong = `Cypress test: Nota met aangepaste lange titel na mededeling - ${currentTimestamp()}`;
  const fullTestEdit = `Cypress test: Edit view full - ${currentTimestamp()}`;
  const text = 'tekst om te checken of default overname correct werkt';
  const addedText = ' van 2e test';
  const theme = 'Justitie en Handhaving';
  const theme2 = 'Landbouw en Visserij';

  beforeEach(() => {
    cy.login('Admin');
  });

  // tests in newsletter route

  it('Should create a newsletter and check the updated row information', () => {
    const decisionText = 'Dit is een leuke beslissing';
    const subcaseNameToCheck = 'Eerste stap';
    cy.visit('/vergadering/5DD7CDA58C70A70008000001/kort-bestek');
    // There is only one row in this view, so eq(0) in not needed
    cy.get(newsletter.tableRow.newsletterRow).within(() => {
      // this agenda does not have an approval item, so numbering should start at 1
      cy.get(newsletter.tableRow.agendaitemNumber).contains(1);
      cy.get(newsletter.tableRow.newsletterTitle).contains('Nog geen kort bestek voor dit agendapunt.');
      cy.get(newsletter.buttonToolbar.edit).click();
    });

    // TODO flakey (locally)
    cy.get(dependency.rdfa.editorInner).clear()
      .type(decisionText);
    cy.get(newsletter.editItem.themesSelector).contains('Sport')
      .click();
    cy.intercept('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(newsletter.editItem.save).click()
      .wait('@newsletterInfosPost');

    cy.get(newsletter.tableRow.newsletterTitle).contains(subcaseNameToCheck);
    cy.get(newsletter.tableRow.newsletterTitle).contains(decisionText);
    cy.get(newsletter.buttonToolbar.openNota).should('be.disabled');
    // TODO-newsletter there is no proof that adding theme actually worked
  });

  it('Should toggle the box "in kort bestek" and patch the model', () => {
    cy.intercept('PATCH', '/newsletter-infos/*').as('patchNewsletterInfo');
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
    // cy.intercept('GET', '/pieces?fields**').as('getPieces');
    cy.visit('/vergadering/5EBA84900A655F0008000004/kort-bestek/nota-updates');
    // cy.wait('@getPieces');
    cy.get(route.notaUpdates.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .contains('Geen resultaten gevonden');
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten/5EBA84AE0A655F0008000008/kort-bestek');
    // there is no changes alert before we add the BIS
    cy.get(newsletter.agendaitemNewsItem.themes); // when themes component is loaded, we can check the changes Alert
    cy.get(utils.changesAlert.alert).should('not.exist');

    cy.addNewPieceToAgendaitem(subcaseTitle1, file.newFileName, file);
    cy.openAgendaitemKortBestekTab(subcaseTitle1);
    cy.get(utils.changesAlert.alert).should('be.visible');
    cy.get(utils.changesAlert.close).click();
    cy.get(utils.changesAlert.alert).should('not.exist');
    // Edit KB
    cy.get(newsletter.newsItem.edit).should('be.visible')
      .click();
    cy.get(newsletter.editItem.rdfaEditor).type('Aanpassing');
    cy.intercept('PATCH', '/newsletter-infos/*').as('patchNewsletterInfo');
    cy.get(newsletter.editItem.save).click();
    cy.get(utils.vlModalVerify.save).click();
    cy.wait('@patchNewsletterInfo');
    cy.openAgendaitemDocumentTab(subcaseTitle1);
    cy.openAgendaitemKortBestekTab(subcaseTitle1);
    cy.get(utils.changesAlert.alert).should('not.exist');
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
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');
    // check default values
    // TODO-Nota check if default in-newsletter is off
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // TODO-KAS-3270 check if editor empty
    // cy.get(newsletter.editItem.rdfaEditor).should('be.empty');
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    // add text to rdfaEditor and select theme
    cy.get(newsletter.editItem.rdfaEditor).type(text);
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.get(newsletter.editItem.toggleFinished).click();
    cy.intercept('POST', '/newsletter-infos').as('postNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@postNewsItem');
    // check KB views for in-newsletter toggle
    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem');
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
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');
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
    cy.intercept('POST', '/newsletter-infos').as('postNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@postNewsItem');
  });

  it('should test default newsletter values on announcement', () => {
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

  it('should test default newsletter values and long title on announcement without long title', () => {
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
    // TODO-KAS-3270 check if editor empty
    cy.get(newsletter.editItem.rdfaEditor).should('contain', '');
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
  });

  it('should test default newsletter values on new nota after multiple announcements', () => {
    const type = 'Nota';

    cy.openCase(caseTitle);
    cy.addSubcase(type, finalAdaptedSubcaseTitleShort, finalAdaptedSubcaseTitleLong, null, null);
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.addAgendaitemToAgenda(finalAdaptedSubcaseTitleShort, false);
    cy.openAgendaitemKortBestekTab(finalAdaptedSubcaseTitleShort);
    // check if KB empty
    cy.get(utils.vlAlert.message).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(finalAdaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort + addedText);
    cy.get(newsletter.editItem.rdfaEditor).contains(text)
      .contains(addedText);
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

  it('should switch between nota and announcement and test default newsletter values', () => {
    changeSubcaseType(caseTitle, 'Mededeling');
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.openAgendaitemKortBestekTab(finalAdaptedSubcaseTitleShort);
    // check if KB exists
    // check default values
    cy.get(newsletter.newsItem.edit).click();
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
    // check if KB exists
    // check default values
    cy.get(newsletter.newsItem.edit).click();
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
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(finalAdaptedSubcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort + addedText);
    cy.get(newsletter.editItem.rdfaEditor).contains(text)
      .contains(addedText);
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

  it('should test the complete edit component', () => {
    const caseTitleEditView = `Cypress test: Nota edit - ${currentTimestamp()}`;
    const proposalText = 'Op voorstel van minister-president Jan Jambon';
    const type = 'Nota';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    const files = [file];

    cy.createCase(caseTitleEditView);
    cy.openCase(caseTitleEditView);
    cy.addSubcase(type, fullTestEdit, null, null);
    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.addAgendaitemToAgenda(fullTestEdit, false);
    cy.openAgendaitemKortBestekTab(fullTestEdit);
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');

    // check and fill in all fields
    cy.get(newsletter.editItem.noNota).should('be.disabled');
    cy.get(newsletter.editItem.mandateeProposal).contains('Niet van toepassing');
    cy.get(newsletter.editItem.rdfaEditor).clear()
      .type('rollbackTest');
    cy.get(newsletter.editItem.remark).should('be.empty')
      .type('rollbackTestRemark');
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked')
      .click();
    cy.get(newsletter.editItem.themesSelector).contains(theme2)
      .click();
    // check cancel
    cy.get(newsletter.editItem.cancel).click();
    cy.intercept('GET', '/themes').as('getThemes2');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes2');
    cy.get(dependency.rdfa.editorInner).should('be.empty');
    cy.get(newsletter.editItem.remark).should('be.empty');
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');

    // check after adding nota and mandatee
    cy.get(newsletter.editItem.cancel).click();
    cy.openAgendaitemDossierTab(fullTestEdit);
    cy.addAgendaitemMandatee(1);
    cy.addDocumentsToAgendaitem(fullTestEdit, files);
    // TODO-bug reload should not be necessary
    // reload necessary for nota
    cy.reload();
    cy.openAgendaitemKortBestekTab(fullTestEdit);
    cy.intercept('GET', '/themes').as('getThemes3');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes3');
    cy.get(newsletter.editItem.mandateeProposal).contains(proposalText);
    cy.get(newsletter.editItem.nota).invoke('removeAttr', 'target')
      .click();
    // TODO still opened in another tab despite removing target (perhaps not removed?)
    // cy.url().contains('/document');
  });

  it('should test the zebra view', () => {
    const caseTitleZebraView = `Cypress test: Nota zebra view - ${currentTimestamp()}`;
    const agendaDate = Cypress.dayjs().add(6, 'weeks')
      .day(4);
    const fullTestZebraViewMededeling = `Cypress test: Zebra view full mededeling - ${currentTimestamp()}`;
    const fullTestZebraViewNota = `Cypress test: Zebra view full nota - ${currentTimestamp()}`;
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    const files = [file];

    cy.createCase(caseTitleZebraView);
    cy.openCase(caseTitleZebraView);
    cy.addSubcase('Mededeling', fullTestZebraViewMededeling, null, null);
    cy.addSubcase('Nota', fullTestZebraViewNota, null, null);
    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(fullTestZebraViewMededeling, false);
    // check that there are no items in list with only 'verslag' and 'mededeling
    openNewsletterForDate(agendaDate);
    cy.get(route.newsletter.dataTable).within(() => {
      cy.get(newsletter.tableRow.newsletterRow).should('not.exist');
    });

    // add nota to agenda and check if list contains correct item
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(fullTestZebraViewNota, false);
    openNewsletterForDate(agendaDate);
    cy.get(newsletter.tableRow.newsletterRow).within(() => {
      cy.get(newsletter.tableRow.agendaitemNumber).contains(2);
      cy.get(newsletter.tableRow.newsletterTitle).contains('Nog geen kort bestek voor dit agendapunt.');
      cy.get(newsletter.buttonToolbar.openNota).should('be.disabled');
    });

    // add nota to agendaitem
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemKortBestekTab(fullTestZebraViewNota);
    cy.addDocumentsToAgendaitem(fullTestZebraViewNota, files);
    openNewsletterForDate(agendaDate);
    // check newsitem save
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.buttonToolbar.edit).click();
    cy.wait('@getThemes');
    cy.get(newsletter.editItem.toggleFinished).click();
    cy.intercept('POST', '/newsletter-infos').as('postNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.get(utils.vlModalVerify.save).click();
    cy.wait('@postNewsItem');
    // TODO-bug reload should not be needed
    // reload needed to update openNota
    cy.reload();
    // check if nota can be opened
    // TODO find another way to open link in same tab? this doesn't work
    // cy.get(newsletter.tableRow.newsletterRow).within(() => {
    //   cy.get(newsletter.buttonToolbar.openNota).children('i')
    //     .invoke('removeAttr', 'target')
    //     .click();
    // });
    // cy.url().should('contain', '/document/');
  });

  it('should test the klad view', () => {
    const caseTitleKladView = `Cypress test: Nota klad view - ${currentTimestamp()}`;
    const agendaDate = Cypress.dayjs().add(6, 'weeks')
      .day(5);
    const richtext = 'this richtext should be visible in klad';
    const remarkText = 'this remark should be visible in klad';
    const fullTestKladViewMededeling = `Cypress test: Klad view full mededeling - ${currentTimestamp()}`;
    const fullTestKladViewNota = `Cypress test: Klad view full nota - ${currentTimestamp()}`;

    cy.createCase(caseTitleKladView);
    cy.openCase(caseTitleKladView);
    cy.addSubcase('Mededeling', fullTestKladViewMededeling, null, null);
    cy.addSubcase('Nota', fullTestKladViewNota, null, null);
    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(fullTestKladViewMededeling, false);

    // check that there are no items in list with only 'verslag' and 'mededeling
    // TODO no loading state or empty message makes it difficult to test

    // check that there is no link to edit without newsletter
    cy.addAgendaitemToAgenda(fullTestKladViewNota, false);
    openNewsletterForDate(agendaDate);
    cy.clickReverseTab('Klad');
    cy.get(newsletter.itemContent.container).find(newsletter.itemContent.edit)
      .should('not.exist');
    cy.get(newsletter.itemContent.noContent);
    // check that there is link to edit with newsletter and that info and remark text are shown
    cy.clickReverseTab('Overzicht');
    cy.get(newsletter.buttonToolbar.edit).click();
    cy.get(newsletter.editItem.rdfaEditor).clear()
      .type(richtext);
    cy.intercept('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(newsletter.editItem.save).click();
    cy.get(utils.vlModalVerify.save).click();
    cy.wait('@newsletterInfosPost');
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem');
    cy.get(newsletter.tableRow.newsletterRow).eq(0)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click();
    cy.wait('@patchNewsItem');
    cy.clickReverseTab('Klad');
    cy.get(newsletter.itemContent.richtext).contains(richtext);
    cy.get(newsletter.itemContent.remark).should('not.exist');
    cy.get(newsletter.itemContent.theme).should('not.exist');
    cy.get(newsletter.itemContent.printItemProposal).should('not.exist');
    cy.get(newsletter.itemContent.edit).click();

    // check newsitem save and that theme is shown
    cy.get(newsletter.editItem.themesSelector).contains('Sport')
      .click();
    cy.get(newsletter.editItem.remark).clear()
      .type(remarkText);
    cy.get(newsletter.editItem.toggleFinished).click();
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem2');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@patchNewsItem2');
    // existence of proposal is checked in mandatee-assigning
    cy.get(newsletter.itemContent.remark).contains(remarkText);
    cy.get(newsletter.itemContent.theme).contains('Sport');
  });

  it('should test the definitief view', () => {
    const caseTitleDefinitief = `Cypress test: Nota Definitief - ${currentTimestamp()}`;
    const agendaDate = Cypress.dayjs().add(6, 'weeks')
      .day(6);
    const richtext = 'this info should be visible in definitief';
    const remarkText = 'this remark should not be visible in definitief';
    const proposalText = 'Op voorstel van minister-president Jan Jambon';
    const fullTestDefinitiefViewMededeling = `Cypress test: Definitief view full mededeling - ${currentTimestamp()}`;
    const fullTestDefinitiefViewNota = `Cypress test: Definitief  view full nota - ${currentTimestamp()}`;

    cy.createCase(caseTitleDefinitief);
    cy.openCase(caseTitleDefinitief);
    cy.addSubcase('Mededeling', fullTestDefinitiefViewMededeling, null, null);
    cy.addSubcase('Nota', fullTestDefinitiefViewNota, null, null);
    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(fullTestDefinitiefViewMededeling, false);
    cy.addAgendaitemToAgenda(fullTestDefinitiefViewNota, false);

    // check that there is one mededeling without proposal or themes
    openNewsletterForDate(agendaDate);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.container).should('have.length', 1);
    cy.get(newsletter.itemContent.title).contains(fullTestDefinitiefViewMededeling);
    cy.get(newsletter.itemContent.printItemProposal).should('not.exist');
    cy.get(newsletter.itemContent.theme).should('not.exist');

    // add mandatee, info, remark and theme to mededeling, then check if shown/not shown correctly
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDossierTab(fullTestDefinitiefViewMededeling);
    cy.addAgendaitemMandatee(0);
    cy.openAgendaitemKortBestekTab(fullTestDefinitiefViewMededeling);
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.edit).click();
    cy.wait('@getThemes');
    cy.get(newsletter.editItem.rdfaEditor).type(richtext);
    cy.get(newsletter.editItem.remark).type(remarkText);
    cy.get(newsletter.editItem.themesSelector).contains(theme2)
      .click();
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click()
      .wait('@patchNewsItem');

    openNewsletterForDate(agendaDate);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.title).contains(fullTestDefinitiefViewMededeling);
    cy.get(newsletter.itemContent.printItemProposal).contains(proposalText);
    cy.get(newsletter.itemContent.theme).contains(theme2);
    cy.get(newsletter.itemContent.richtext).should('not.exist');
    cy.get(newsletter.itemContent.remark).should('not.exist');

    // check if nota is visible when selected
    cy.clickReverseTab('Overzicht');
    cy.get(newsletter.buttonToolbar.edit).click();
    cy.get(newsletter.editItem.rdfaEditor).clear()
      .type(richtext);
    cy.get(newsletter.editItem.remark).clear()
      .type(remarkText);
    cy.intercept('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(newsletter.editItem.save).click();
    cy.get(utils.vlModalVerify.save).click();
    cy.wait('@newsletterInfosPost');
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem');
    cy.get(newsletter.tableRow.newsletterRow)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click()
      .wait('@patchNewsItem');
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.container).should('have.length', 2);
    // TODO title text not found?
    // cy.get(newsletter.itemContent.title).eq(0)
    //   .contains(fullTestDefinitiefViewNota);

    // check if mededeling is not visible when deselected in dossier
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDossierTab(fullTestDefinitiefViewMededeling);
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.showInNewsletter).click();
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem2');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).click()
      .wait('@patchNewsItem2');

    openNewsletterForDate(agendaDate);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.container).should('have.length', 1);
    cy.get(newsletter.itemContent.title).should('not.contain', fullTestDefinitiefViewMededeling);

    // add mandatee, info, remark and theme to nota, then check if shown/not shown correctly
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDossierTab(fullTestDefinitiefViewNota);
    cy.addAgendaitemMandatee(0);
    cy.openAgendaitemKortBestekTab(fullTestDefinitiefViewNota);
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.edit).click();
    cy.wait('@getThemes');
    cy.get(newsletter.editItem.rdfaEditor).clear()
      .type(richtext);
    cy.get(newsletter.editItem.remark).clear()
      .type(remarkText);
    cy.get(newsletter.editItem.themesSelector).contains(theme2)
      .click();

    openNewsletterForDate(agendaDate);
    cy.clickReverseTab('Definitief');
    // TODO title text not found?
    // cy.get(newsletter.itemContent.title).contains(fullTestDefinitiefViewNota);
    cy.get(newsletter.itemContent.printItemProposal).contains(proposalText);
    cy.get(newsletter.itemContent.theme).contains(theme2);
    cy.get(newsletter.itemContent.richtext).contains(richtext);
    cy.get(newsletter.itemContent.remark).should('not.exist');
  });

  it('should test the rdfa editor', () => {
    cy.visit('/vergadering/5EBA94D7751CF70008000001/kort-bestek');
    cy.get(newsletter.buttonToolbar.edit).click();

    pressRdfaButton('Strikethrough');
    cy.get(dependency.rdfa.editorInner).type('Strikethrough');
    pressRdfaButton('Strikethrough');
    cy.get(dependency.rdfa.editorInner).type(' ');
    pressRdfaButton('Underline');
    cy.get(dependency.rdfa.editorInner).type('Underline');
    pressRdfaButton('Underline');
    cy.get(dependency.rdfa.editorInner).type(' ');
    pressRdfaButton('Italic');
    cy.get(dependency.rdfa.editorInner).type('Italic');
    pressRdfaButton('Italic');
    cy.get(dependency.rdfa.editorInner).type(' ');
    pressRdfaButton('Bold');
    cy.get(dependency.rdfa.editorInner).type('Bold');

    cy.get('del').contains('Strikethrough');
    cy.get('u').contains('Underline');
    cy.get('em').contains('Italic');
    cy.get('strong').contains('Bold');
  });
});
