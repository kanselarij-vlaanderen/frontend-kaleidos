/* global context, beforeEach, afterEach, it, cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

// TODO-command, might not have any other usages
function changeSubcaseType(subcaseLink, type) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.visit(subcaseLink);
  cy.get(cases.subcaseDescription.edit).click();
  cy.get(cases.subcaseDescriptionEdit.type).contains(type)
    .click();

  cy.intercept('PATCH', '/subcases/**').as(`patchSubcase${randomInt}`);
  cy.intercept('PATCH', '/agendaitems/**').as(`patchAgendaitem${randomInt}`);
  cy.intercept('PATCH', '/agendas/**').as(`patchAgenda${randomInt}`);
  cy.intercept('DELETE', '/news-items/**').as(`deleteNewsItem${randomInt}`);
  cy.intercept('POST', '/news-items').as(`postNewsItem${randomInt}`);
  cy.get(cases.subcaseDescriptionEdit.save).click();
  cy.wait(`@patchSubcase${randomInt}`);
  cy.wait(`@patchAgendaitem${randomInt}`);
  cy.wait(`@patchAgenda${randomInt}`);
  // When switching to type announcement, we delete (only if ony exists) and create a new one with defaults
  if (type === 'Mededeling') {
    cy.wait(`@postNewsItem${randomInt}`);
  } else {
    // When switching to note, we delete the existing default one from announcement
    cy.wait(`@deleteNewsItem${randomInt}`);
  }
}

function addOrRemoveThemeFromMededeling(shortSubcaseTitle, theme, confirm) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.openAgendaitemKortBestekTab(shortSubcaseTitle);
  cy.get(newsletter.newsItem.edit).click();
  cy.get(newsletter.editItem.themesSelector).contains(theme)
    .click();
  cy.intercept('PATCH', '/news-items/**').as(`patchNewsItem${randomInt}`);
  cy.get(newsletter.editItem.save).click();
  if (confirm) {
    cy.get(auk.confirmationModal.footer.confirm).click();
  }
  cy.wait(`@patchNewsItem${randomInt}`);
}

function goToNewsletter() {
  cy.get(agenda.agendaActions.optionsDropdown)
    .children(appuniversum.button)
    .click();
  cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
  cy.get(newsletter.tableRow.titleContent); // await page load
}

function checkPublishMail(alertMessage) {
  cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
    .children(appuniversum.button)
    .click();
  cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();
  cy.get(auk.confirmationModal.footer.confirm).click();
  cy.get(auk.auModal.container).should('not.exist');
  cy.get(auk.alert.message).contains(alertMessage);
  cy.get(auk.alert.close).click();
}

function checkUncheckInNewsletter(index) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('PATCH', '/news-items/**').as(`patchNewsItem${randomInt}`);
  cy.get(newsletter.tableRow.inNewsletterCheckbox).eq(index)
    .parent()
    .click()
    .wait(`@patchNewsItem${randomInt}`);
}

context('newsletter tests, both in agenda detail view and newsletter route', () => {
  const theme = 'Justitie en Handhaving';
  const theme2 = 'Landbouw en Visserij';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  // tests in newsletter route

  it('Should toggle the box "in kort bestek" and patch the model', () => {
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItems');
    cy.visit('/vergadering/5EBA9588751CF70008000012/kort-bestek');
    // define alias
    cy.get(newsletter.tableRow.newsletterRow).find(newsletter.tableRow.inNewsletterCheckbox)
      .as('checkboxValue');
    cy.get('@checkboxValue').parent()
      .as('checkboxContainer');
    // checkbox is unchecked, toggle it
    cy.get('@checkboxValue').should('not.be.checked');
    cy.get('@checkboxContainer').click();
    cy.wait('@patchNewsItems');
    // checkbox is checked, toggle it back
    cy.get('@checkboxValue').should('be.checked');
    cy.get('@checkboxContainer').click();
    cy.wait('@patchNewsItems');
    // checkbox is unchecked
    cy.get('@checkboxValue').should('not.be.checked');
  });

  // test in agenda detail

  it('Test full warning flow on KB', () => {
    const caseTitle = 'testId=1589281897: Cypress test dossier 1';
    const subcaseTitle1 = `${caseTitle} test stap 1`;
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    cy.visit('/vergadering/5EBA84900A655F0008000004/kort-bestek/nota-updates');
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
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItems');
    cy.get(newsletter.editItem.save).click();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.wait('@patchNewsItems');
    cy.openAgendaitemDocumentTab(subcaseTitle1);
    cy.openAgendaitemKortBestekTab(subcaseTitle1);
    cy.get(utils.changesAlert.alert).should('not.exist');
    cy.visit('/vergadering/5EBA84900A655F0008000004/kort-bestek/nota-updates');
    cy.get(route.notaUpdates.dataTable).find('tbody')
      .children('tr')
      .should('have.length', 1)
      .contains(subcaseTitle1);
  });

  it('should test default newsletter values on nota', () => {
    const subcaseTitleShort = 'Cypress test: KB defaults 1 - Nota - 1651579812';
    const subcaseTitleLong = 'Cypress test: KB defaults 1 - lange titel Nota - 1651579812';
    const text = 'Tekst om te checken of default overname correct werkt.';

    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten/62711BECADB457F5862A6D21/kort-bestek');
    // check default nota has no KB
    cy.get(newsletter.newsItem.alert).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.intercept('GET', '/themes**').as('getThemes');
    cy.intercept('POST', '/news-items').as('postNewsItem');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@postNewsItem');
    cy.wait('@getThemes');
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    // add text to rdfaEditor and select theme
    cy.get(newsletter.editItem.rdfaEditor).type(text);
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.get(newsletter.editItem.toggleFinished)
      .parent()
      .click();
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@patchNewsItem');
    cy.wait(1000);// flakyness, zebra view does not have this newsitem yet sometimes
    // check KB views for in-newsletter toggle
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(newsletter.tableRow.titleContent).contains(subcaseTitleShort)
      .parents(newsletter.tableRow.newsletterRow)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .should('not.be.checked') // this is the default setting for nota
      .parent()
      .click();
    // the htmlContent is also showing in the "title"
    cy.get(newsletter.tableRow.titleContent).contains(text);
    cy.wait('@patchNewsItem');
  });

  it('should test default newsletter values on new nota', () => {
    const previousSubcaseShortTitle = 'Cypress test: KB defaults 2 - Nota - 1651582137';
    const previousSubcaseHtmlContent = 'Tekst om te checken of default overname correct werkt.';
    const addedText = ' Toegevoegd op bestaande tekst.';
    const addedTitle = ' Toegevoegd op bestaande titel.';

    const subcaseTitleShort = 'Cypress test: KB defaults 2 - Nota aangepast - 1651582232';
    const subcaseTitleLong = 'Cypress test: KB defaults 2 - Nota met aangepaste lange titel- 1651582232';

    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten/6271253AB783CEBD298C1CC8');
    // confirm our subcase titles (setup is ok)
    cy.get(agenda.agendaitemTitlesView.shortTitle).contains(subcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.title).contains(subcaseTitleLong);
    // check default nota has no KB
    cy.openAgendaitemKortBestekTab(subcaseTitleShort);
    cy.get(newsletter.newsItem.alert).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.intercept('GET', '/themes**').as('getThemes');
    cy.intercept('POST', '/news-items').as('postNewsItem');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@postNewsItem');
    cy.wait('@getThemes');
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', previousSubcaseShortTitle);
    cy.get(newsletter.editItem.rdfaEditor).contains(previousSubcaseHtmlContent);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme);
    // edit
    cy.get(newsletter.editItem.shortTitle).type(addedTitle);
    cy.get(newsletter.editItem.rdfaEditor).type(addedText);
    cy.get(newsletter.editItem.themesSelector).contains(theme2)
      .click();
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@patchNewsItem');
  });

  it('should test default newsletter values on announcement', () => {
    const subcaseTitleShort = 'Cypress test: KB defaults 3 - Med - 1651584615';
    const subcaseTitleLong = 'Cypress test: KB defaults 3 - lange titel Med - 1651584615';

    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    // *adding announcement to agenda creates a KB*
    cy.addAgendaitemToAgenda(subcaseTitleShort);
    cy.openAgendaitemKortBestekTab(subcaseTitleShort);
    // check if KB already exists
    cy.get(newsletter.agendaitemNewsItem.title).contains(subcaseTitleShort);
    // check default values
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('be.checked');
    // value of subtitle from news item is empty, but we show agendaitem title in frontend
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.rdfaEditor).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    cy.get(newsletter.editItem.cancel).click();
    cy.openAgendaitemDossierTab(subcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.showInNewsletter).should('be.checked');
  });

  it('should test default newsletter values and long title on announcement without long title', () => {
    const subcaseTitleShort = 'Cypress test: KB defaults 4 - Med zonder lange titel - 1651584640';

    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten');
    cy.addAgendaitemToAgenda(subcaseTitleShort);
    cy.openAgendaitemKortBestekTab(subcaseTitleShort);
    // check if KB already exists
    cy.get(newsletter.agendaitemNewsItem.title).contains(subcaseTitleShort);
    // check default values
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('be.checked');
    // value of subtitle from news item is empty, but we show agendaitem title in frontend
    // TODO-newsletter are these contains correct?
    cy.get(newsletter.editItem.longTitle).should('contain', '');
    // TODO-KAS-3270 check if editor empty
    // TODO-KAS-3367 default htmlContent to shorttitle?
    cy.get(newsletter.editItem.rdfaEditor).should('contain', '');
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
  });

  it('should test default newsletter values on new nota after multiple announcements', () => {
    const previousSubcaseShortTitle = 'Cypress test: KB defaults 5 - Nota - 1651585885';
    const previousSubcasehtmlContent = 'Tekst om te checken of default overname correct werkt met mededelingen ertussen.';
    const subcaseTitleShort = 'Cypress test: KB defaults 5 - Nota - na mededeling - 1651586158';
    const subcaseTitleLong = 'Cypress test: KB defaults 5 - lange titel Nota - na mededeling - 1651586158';

    cy.visitAgendaWithLink('/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten/627134943DCDDB638260912A');
    // confirm our subcase titles (setup is ok)
    cy.get(agenda.agendaitemTitlesView.shortTitle).contains(subcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.title).contains(subcaseTitleLong);
    // check if KB empty
    cy.openAgendaitemKortBestekTab(subcaseTitleShort);
    // TODO KAS-3367 extract, selector around the alert?
    cy.get(newsletter.newsItem.alert).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.intercept('GET', '/themes**').as('getThemes');
    cy.intercept('POST', '/news-items').as('postNewsItem');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@postNewsItem');
    cy.wait('@getThemes');
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', previousSubcaseShortTitle);
    cy.get(newsletter.editItem.rdfaEditor).contains(previousSubcasehtmlContent);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme);
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@patchNewsItem');
    // check KB views for in-newsletter toggle
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    // The previous subcase had "in-newsletter" as checked, verify it was not inherited
    cy.get(newsletter.tableRow.titleContent).contains(previousSubcaseShortTitle)
      .parents(newsletter.tableRow.newsletterRow)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .should('not.be.checked');
  });

  it('should switch between nota and announcement and test default newsletter values', () => {
    // const agendaDate = Cypress.dayjs('2020-04-01');
    const previousSubcaseTitleShort = 'Cypress test: KB defaults 6 - Nota - 1651588555';
    const previousText = 'Tekst om te checken of default overname correct werkt met switchen van type ertussen.';
    const agendaitemKBLink = '/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten/62713E716C41DEA869521E06/kort-bestek';

    const subcaseTitleShort = 'Cypress test: KB defaults 6 - Nota switch type - 1651588681';
    const subcaseTitleLong = 'Cypress test: KB defaults 6 - Nota switch type lange titel- 1651588681';
    const subcaseLink = 'dossiers/E14FB551-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers/62713E586C41DEA869521E02';

    changeSubcaseType(subcaseLink, 'Mededeling');
    cy.visitAgendaWithLink(agendaitemKBLink);
    // check if KB exists
    // check default values
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('be.checked');
    // value of subtitle from news item is empty, but we show agendaitem title in frontend
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.rdfaEditor).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    cy.get(newsletter.editItem.cancel).click();

    changeSubcaseType(subcaseLink, 'Nota');
    cy.visitAgendaWithLink(agendaitemKBLink);
    // check if KB empty
    cy.get(newsletter.newsItem.alert).contains('Nog geen kort bestek voor dit agendapunt.');

    changeSubcaseType(subcaseLink, 'Mededeling');
    cy.visitAgendaWithLink(agendaitemKBLink);
    // check if KB exists
    // check default values
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('be.checked');
    // value of subtitle from news item is empty, but we show agendaitem title in frontend
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.rdfaEditor).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    cy.get(newsletter.editItem.cancel).click();

    changeSubcaseType(subcaseLink, 'Nota');
    cy.visitAgendaWithLink(agendaitemKBLink);
    // check if KB empty
    cy.get(newsletter.newsItem.alert).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.intercept('GET', '/themes**').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', previousSubcaseTitleShort);
    cy.get(newsletter.editItem.rdfaEditor).contains(previousText);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme);
    // check KB views for in-newsletter toggle
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    cy.get(newsletter.tableRow.titleContent).contains(previousSubcaseTitleShort)
      .parents(newsletter.tableRow.newsletterRow)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .should('not.be.checked');
  });

  it('should test the complete edit component', () => {
    // const agendaDate = Cypress.dayjs('2020-04-01');
    const agendaitemKBLink = '/vergadering/5EBA84900A655F0008000004/agenda/5EBA84910A655F0008000005/agendapunten/6272890FE536C464112FFE76/kort-bestek';
    const subcaseTitleShort = 'Cypress test: KB edit - Nota edit full - 1651673319';
    const proposalText = 'Op voorstel van minister-president Jan Jambon';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    const files = [file];

    cy.visitAgendaWithLink(agendaitemKBLink);
    cy.intercept('GET', '/themes**').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');

    // check and fill in all fields
    cy.get(newsletter.editItem.noNota).should('be.disabled');
    cy.get(newsletter.editItem.mandateeProposal).contains('Niet van toepassing');
    cy.get(dependency.rdfa.editorInner).clear();
    cy.get(newsletter.editItem.rdfaEditor).type('rollbackTest');
    cy.get(newsletter.editItem.remark).should('be.empty')
      .type('rollbackTestRemark');
    cy.get(newsletter.editItem.toggleFinished)
      .should('not.be.checked')
      .parent()
      .click();
    cy.get(newsletter.editItem.themesSelector).contains(theme2)
      .click();
    // check cancel
    cy.get(newsletter.editItem.cancel).click();
    cy.intercept('GET', '/themes**').as('getThemes2');
    cy.get(newsletter.newsItem.edit).click();
    cy.wait('@getThemes2');
    cy.get(dependency.rdfa.editorInner).find('p')
      .should('have.length', 1); // 1 trailing space inside a paragraph by default
    cy.get(newsletter.editItem.remark).should('be.empty');
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');

    // check after adding nota and mandatee
    cy.get(newsletter.editItem.cancel).click();
    cy.openAgendaitemDossierTab(subcaseTitleShort);
    cy.addAgendaitemMandatee(1);
    cy.addDocumentsToAgendaitem(subcaseTitleShort, files);
    // TODO-bug reload should not be necessary
    // reload necessary for nota
    cy.reload();

    cy.visitAgendaWithLink(agendaitemKBLink);
    cy.intercept('GET', '/themes**').as('getThemes3');
    cy.get(newsletter.newsItem.edit).click();
    cy.wait('@getThemes3');
    cy.get(newsletter.editItem.mandateeProposal).contains(proposalText);
    cy.get(newsletter.editItem.nota);
    cy.get(newsletter.editItem.cancel).click();
    // TODO-refactor opening nota is an action that opens a second browser tab, not testable in cypress
  });

  it('should test the zebra view', () => {
    // const agendaDate = Cypress.dayjs('2022-04-02');
    const agendaLink = '/vergadering/62726CA1D600B7FF7F95BBEB/agenda/62726CA2D600B7FF7F95BBEC/agendapunten';
    const newsletterLink = '/vergadering/62726CA1D600B7FF7F95BBEB/kort-bestek';
    // const subcaseTitleMededeling = 'Cypress test: KB zebra view - mededeling - 1651673379';
    const subcaseTitleNota = 'Cypress test: KB zebra view - nota - 1651673379';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota',
    };
    const files = [file];

    // check that there are no items in list with only 'verslag' and 'mededeling
    cy.visit(newsletterLink);
    cy.get(route.newsletter.dataTable).within(() => {
      cy.get(newsletter.tableRow.newsletterRow).should('not.exist');
    });

    // add nota to agenda and check if list contains correct item
    cy.visitAgendaWithLink(agendaLink);
    cy.addAgendaitemToAgenda(subcaseTitleNota);
    cy.visit(newsletterLink);
    cy.get(newsletter.tableRow.newsletterRow).within(() => {
      cy.get(newsletter.tableRow.agendaitemNumber).contains(2);
      cy.get(newsletter.tableRow.titleContent).contains('Nog geen kort bestek voor dit agendapunt.');
      cy.get(newsletter.buttonToolbar.openNota).should('be.disabled');
    });

    // add nota to agendaitem
    cy.visitAgendaWithLink(agendaLink);
    cy.openAgendaitemKortBestekTab(subcaseTitleNota);
    cy.addDocumentsToAgendaitem(subcaseTitleNota, files);
    cy.visit(newsletterLink);
    // check newsitem save
    cy.intercept('GET', '/themes**').as('getThemes');
    cy.intercept('POST', '/news-items').as('postNewsItem');
    cy.get(newsletter.buttonToolbar.edit).click();
    cy.wait('@postNewsItem');
    cy.wait('@getThemes');
    cy.get(newsletter.editItem.toggleFinished)
      .parent()
      .click();
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.wait('@patchNewsItem');
    // TODO-bug reload should not be needed
    // reload needed to update openNota
    // cy.reload(); // disable reload since we can't test the opening of the nota
    // check if nota can be opened
    // TODO-refactor opening nota is an action that opens a second browser tab, not testable in cypress
    // cy.get(newsletter.tableRow.newsletterRow).within(() => {
    //   cy.get(newsletter.buttonToolbar.openNota).children('i')
    //     .invoke('removeAttr', 'target')
    //     .click();
    // });
    // cy.url().should('contain', '/document/');
  });

  it('should test the klad view', () => {
    // const agendaDate = Cypress.dayjs('2022-04-03');
    // const agendaLink = '/vergadering/62726CBED600B7FF7F95BBF0/agenda/62726CBFD600B7FF7F95BBF1/agendapunten';
    const newsletterLink = '/vergadering/62726CBED600B7FF7F95BBF0/kort-bestek';
    const htmlContent = 'this htmlContent should be visible in klad';
    const remarkText = 'this remark should be visible in klad';
    // const subcaseTitleMededeling = 'Cypress test: KB klad - mededeling - 1651673428';
    // const subcaseTitleNota = 'Cypress test: KB klad - nota - 1651673428';

    cy.visit(newsletterLink);
    cy.clickReverseTab('Klad');
    cy.get(newsletter.newsletterPrint.container).find(newsletter.newsletterPrint.edit)
      .should('not.exist');
    cy.get(newsletter.newsletterPrint.noContent);
    // check that there is link to edit with newsletter and that info and remark text are shown
    cy.clickReverseTab('Overzicht');
    cy.intercept('POST', '/news-items').as('postNewsItem');
    cy.get(newsletter.buttonToolbar.edit).click();
    cy.wait('@postNewsItem');
    cy.get(dependency.rdfa.editorInner).clear();
    cy.get(newsletter.editItem.rdfaEditor).type(htmlContent);
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.wait('@patchNewsItem');
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItem');
    cy.wait(2000); // TODO-BUG rare flaky where parent is not longer connected to dom, data reload happening?
    cy.get(newsletter.tableRow.newsletterRow).eq(0)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click();
    cy.wait('@patchNewsItem');
    cy.clickReverseTab('Klad');
    cy.get(newsletter.newsletterPrint.htmlContent).contains(htmlContent);
    cy.get(newsletter.newsletterPrint.remark).should('not.exist');
    cy.get(newsletter.newsletterPrint.theme).should('not.exist');
    cy.get(newsletter.newsletterPrint.printItemProposal).should('not.exist');
    cy.get(newsletter.newsletterPrint.edit).click();

    // check newsitem save and that theme is shown
    cy.get(newsletter.editItem.themesSelector).contains('Sport')
      .click();
    cy.get(newsletter.editItem.remark).clear()
      .type(remarkText);
    cy.get(newsletter.editItem.toggleFinished)
      .parent()
      .click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem2');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@patchNewsItem2');
    // existence of proposal is checked in mandatee-assigning
    cy.get(newsletter.newsletterPrint.remark).contains(remarkText);
    cy.get(newsletter.newsletterPrint.theme).contains('Sport');
  });

  it('should test the definitief view', () => {
    // const agendaDate = Cypress.dayjs('2022-04-04');
    const agendaLinkMed = '/vergadering/62726CD0D600B7FF7F95BBF5/agenda/62726CD1D600B7FF7F95BBF6/agendapunten/627289BFE536C464112FFE91';
    const agendaLinkNota = '/vergadering/62726CD0D600B7FF7F95BBF5/agenda/62726CD1D600B7FF7F95BBF6/agendapunten/627289D3E536C464112FFE96';
    const newsletterLink = '/vergadering/62726CD0D600B7FF7F95BBF5/kort-bestek';
    // *note the next htmlContent is used in search.spec, keep them identical
    const htmlContentNota = 'this nota info should be visible in definitief';
    const remarkTextNota = 'this nota remark should not be visible in definitief';
    const proposalTextNota = 'Op voorstel van minister-president Jan Jambon';
    const htmlContentMededeling = 'this announcement info should be visible in definitief';
    const remarkTextMededeling = 'this announcement remark should not be visible in definitief';
    const proposalTextMededeling = 'Op voorstel van viceminister-president Hilde Crevits';
    const subcaseTitleMededeling = 'Cypress test: KB Definitief view - mededeling - 1651673497';
    const subcaseTitleNota = 'Cypress test: KB Definitief view - nota - 1651673497';

    // check that there is one mededeling without proposal or themes
    cy.visit(newsletterLink);
    cy.clickReverseTab('Definitief');
    // actual time is 14:00, but server time is being used as "local time" in the test it seems
    cy.get(newsletter.newsletterPrintHeader.publicationPlannedDate).contains('11 april 2022 - 12:00');
    cy.get(newsletter.newsletterPrint.container).should('have.length', 1);
    cy.get(newsletter.newsletterPrint.title).contains(subcaseTitleMededeling);
    cy.get(newsletter.newsletterPrint.printItemProposal).should('not.exist');
    cy.get(newsletter.newsletterPrint.theme).should('not.exist');

    // add mandatee, info, remark and theme to mededeling, then check if shown/not shown correctly
    cy.visitAgendaWithLink(agendaLinkMed);
    cy.addAgendaitemMandatee(2); // Hilde Crevits
    cy.openAgendaitemKortBestekTab(subcaseTitleMededeling);
    cy.intercept('GET', '/themes**').as('getThemes_1');
    cy.get(newsletter.newsItem.edit).click();
    cy.wait('@getThemes_1');
    cy.get(newsletter.editItem.rdfaEditor).type(htmlContentMededeling);
    cy.get(newsletter.editItem.remark).type(remarkTextMededeling);
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click()
      .wait('@patchNewsItem');

    cy.visit(newsletterLink);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.newsletterPrint.title).contains(subcaseTitleMededeling);
    cy.get(newsletter.newsletterPrint.printItemProposal).contains(proposalTextMededeling);
    cy.get(newsletter.newsletterPrint.theme).contains(theme);
    cy.get(newsletter.newsletterPrint.htmlContent).should('not.exist');
    cy.get(newsletter.newsletterPrint.remark).should('not.exist');

    // check if nota is visible when selected
    cy.clickReverseTab('Overzicht');
    // only 1 item in zebra view (the nota)
    cy.intercept('POST', '/news-items').as('postNewsItems');
    cy.get(newsletter.buttonToolbar.edit).click();
    cy.wait('@postNewsItems');
    cy.get(dependency.rdfa.editorInner).clear({
      force: true,
    });
    cy.get(newsletter.editItem.rdfaEditor).type(htmlContentNota);
    cy.get(newsletter.editItem.remark).clear()
      .type(remarkTextNota);
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.wait('@patchNewsItem');
    cy.intercept('PATCH', '/news-items/*').as('patchNewsItem1');
    cy.get(newsletter.tableRow.newsletterRow)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click()
      .wait('@patchNewsItem1');
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.newsletterPrint.container).should('have.length', 2);
    cy.get(newsletter.newsletterPrint.title).eq(0)
      .contains(subcaseTitleNota);

    // check if mededeling is not visible when deselected in dossier
    cy.visitAgendaWithLink(agendaLinkMed);
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.showInNewsletter)
      .parent()
      .click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem2');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).click()
      .wait('@patchNewsItem2');

    cy.visit(newsletterLink);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.newsletterPrint.container).should('have.length', 1);
    cy.get(newsletter.newsletterPrint.title).should('not.contain', subcaseTitleMededeling);

    // add mandatee and theme to nota, then check if shown/not shown correctly
    // visit link of mededeling, open nota (less agenda loading)
    cy.visitAgendaWithLink(agendaLinkNota);
    cy.addAgendaitemMandatee(0);
    cy.openAgendaitemKortBestekTab(subcaseTitleNota);
    cy.intercept('GET', '/themes**').as('getThemes_2');
    cy.get(newsletter.newsItem.edit).click();
    cy.wait('@getThemes_2');
    cy.get(newsletter.editItem.themesSelector).contains(theme2)
      .click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem3');
    cy.get(newsletter.editItem.save).click()
      .wait('@patchNewsItem3');

    cy.visit(newsletterLink);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.newsletterPrint.title).contains(subcaseTitleNota);
    cy.get(newsletter.newsletterPrint.printItemProposal).contains(proposalTextNota);
    cy.get(newsletter.newsletterPrint.theme).contains(theme2);
    cy.get(newsletter.newsletterPrint.htmlContent).contains(htmlContentNota);
    cy.get(newsletter.newsletterPrint.remark).should('not.exist');
  });

  it('should test the pre mailchimp checks', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));

    const agendaDate = Cypress.dayjs().add(5, 'weeks')
      .day(1);
    const type1 = 'Mededeling';
    const type2 = 'Nota';
    const shortSubcaseTitle1 = 'Cypress test: nieuwsbrief mededeling';
    const theme = 'Justitie en Handhaving';
    const shortSubcaseTitle2 = 'Cypress test: nieuwsbrief nota';
    const shortSubcaseTitle3 = 'Cypress test: tweede nieuwsbrief nota';
    const alertMessage = 'De nieuwsbrief kan niet verzonden worden';

    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');

    cy.createCase('Cypress test: nieuwsbrief');

    // create subcase.
    cy.addSubcase(type1, shortSubcaseTitle1);
    cy.addSubcase(type2, shortSubcaseTitle2);
    cy.addSubcase(type2, shortSubcaseTitle3);
    cy.wait(5000);

    // create agendaitem
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(shortSubcaseTitle1);
    cy.addAgendaitemToAgenda(shortSubcaseTitle2);
    cy.addAgendaitemToAgenda(shortSubcaseTitle3);

    // test without kort bestek and no theme in mededeling
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    cy.get(newsletter.tableRow.titleContent); // await page load
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.get(auk.auModal.container).should('not.exist');
    cy.get(auk.alert.message).contains(alertMessage);
    cy.get(auk.alert.close).click();

    // add theme to mededeling
    cy.openAgendaForDate(agendaDate);
    addOrRemoveThemeFromMededeling(shortSubcaseTitle1, theme);

    // test without kort bestek and with theme in mededeling
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    cy.get(newsletter.tableRow.titleContent); // await page load
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.get(auk.auModal.container).should('not.exist');
    cy.get(auk.alert.message).contains(alertMessage);
    cy.get(auk.alert.close).click();

    // remove theme from mededeling
    cy.openAgendaForDate(agendaDate);
    addOrRemoveThemeFromMededeling(shortSubcaseTitle1, theme, true);

    // add kort bestek
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle2);
    cy.intercept('GET', '/themes**').as('getAgendaitemThemes1');
    cy.intercept('POST', '/news-items').as('newsItemsPost');
    cy.get(newsletter.newsItem.create).click()
      .wait('@newsItemsPost');
    cy.wait('@getAgendaitemThemes1');
    cy.get(newsletter.editItem.save).click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchNewsItem');

    // test with kort bestek, without nota in newsletter, with mededeling and without theme
    goToNewsletter();
    checkPublishMail(alertMessage);

    // add theme to nota
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle2);
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click()
      .wait('@patchNewsItem');
    // test with kort bestek, without nota in newsletter, with mededeling and with theme
    goToNewsletter();
    checkPublishMail(alertMessage);

    // // remove mededeling
    // cy.openAgendaForDate(agendaDate);
    // cy.openAgendaitemDossierTab(shortSubcaseTitle1);
    // cy.get(agenda.agendaitemControls.actions)
    //   .children(appuniversum.button)
    //   .click();
    // cy.get(agenda.agendaitemControls.action.delete).click();
    // cy.get(auk.confirmationModal.footer.confirm).click();
    // cy.wait(2000);

    // // test with kort bestek, without nota in newsletter, without mededeling and with theme
    // goToNewsletter();
    // checkPublishMail(alertMessage);

    // remove theme from nota
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle2);
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.get(newsletter.editItem.save).click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchNewsItem');
    // test with kort bestek, without nota in newsletter and without theme
    goToNewsletter();
    checkPublishMail(alertMessage);

    // test with nota in newsletter without theme
    checkUncheckInNewsletter(0);
    cy.log('test with nota in newsletter without theme');
    checkPublishMail(alertMessage);

    // add theme to nota
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle2);
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click()
      .wait('@patchNewsItem');
    // // re-add mededeling
    // cy.addAgendaitemToAgenda(shortSubcaseTitle1);
    // // add theme to mededeling
    // addOrRemoveThemeFromMededeling(shortSubcaseTitle1, theme);
    // add kort bestek to second nota
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle3);
    cy.intercept('GET', '/themes**').as('getAgendaitemThemes2');
    cy.intercept('POST', '/news-items').as('newsItemsPost');
    cy.get(newsletter.newsItem.create).click()
      .wait('@newsItemsPost');
    cy.wait('@getAgendaitemThemes2');
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.get(newsletter.editItem.save).click();
    cy.intercept('PATCH', '/news-items/**').as(`patchNewsItem${randomInt}`);
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait(`@patchNewsItem${randomInt}`);

    goToNewsletter();
    // uncheck nota with themes, check nota without themes
    checkUncheckInNewsletter(0);
    checkUncheckInNewsletter(1);

    // TODO-bug check on nota in kort-bestek allows mailcampaign with nota without themes
    //  and test again
    checkPublishMail(alertMessage);

    // switch the checks
    checkUncheckInNewsletter(0);
    checkUncheckInNewsletter(1);
    // there should be no alert message
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();
    cy.intercept('POST', '/newsletter/mail-campaigns').as('postMailCampaigns');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@postMailCampaigns')
      .then((responseBody) => {
        if (responseBody.error || responseBody.response?.statusCode === 500) {
          cy.get(auk.alert.message).should('not.exist');
        }
      });
  });

  // it.only('should test the pre mailchimp checks', () => {
  //   cy.visit('/vergadering/63BFF684D02D5127D91DE575/kort-bestek/afdrukken');
  //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
  //       .children(appuniversum.button)
  //       .click();
  //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();

  //   cy.fixture('example').then((examples) => {
  //     cy.log(examples);
  //     cy.intercept('POST', '/newsletter/mail-campaigns', examples.data).as('postMailCampaings');
  //   });
  //   cy.get(utils.vlModalVerify.save).click()
  //     .wait('@postMailCampaings');
  //   cy.wait(20000);
  // });
});
