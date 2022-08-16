/* global context, beforeEach, afterEach, it, cy */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';
import dependency from '../../selectors/dependency.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

// TODO-command
function pressRdfaButton(buttonName) {
  cy.get('button').contains(buttonName)
    .parent('button')
    .click();
}

// TODO-command, might not have any other usages
function changeSubcaseType(subcaseLink, type) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  // cy.intercept('GET', '/custom-subcases/**').as(`loadSubcasePhases${randomInt}`);
  cy.visit(subcaseLink);
  // cy.wait(`@loadSubcasePhases${randomInt}`);
  cy.get(cases.subcaseDescription.edit).click();
  cy.get(cases.subcaseDescriptionEdit.type).contains(type)
    .click();

  cy.intercept('PATCH', '/subcases/**').as(`patchSubcase${randomInt}`);
  cy.intercept('PATCH', '/agendaitems/**').as(`patchAgendaitem${randomInt}`);
  cy.intercept('PATCH', '/agendas/**').as(`patchAgenda${randomInt}`);
  cy.intercept('DELETE', '/newsletter-infos/**').as(`deleteNewsletterInfo${randomInt}`);
  cy.intercept('POST', '/newsletter-infos').as(`postNewsletterInfo${randomInt}`);
  cy.get(cases.subcaseDescriptionEdit.save).click();
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
    cy.intercept('PATCH', '/newsletter-infos/*').as('patchNewsletterInfo');
    cy.get(newsletter.editItem.save).click();
    cy.get(utils.vlModalVerify.save).click();
    cy.wait('@patchNewsletterInfo');
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
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
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
      .should('not.be.checked') // this is the default setting for nota
      .parent()
      .click();
    // the richtext is also showing in the "title"
    cy.get(newsletter.tableRow.newsletterTitle).contains(text);
    cy.wait('@patchNewsItem');
  });

  it('should test default newsletter values on new nota', () => {
    const previousSubcaseShortTitle = 'Cypress test: KB defaults 2 - Nota - 1651582137';
    const previousSubcaseRichtext = 'Tekst om te checken of default overname correct werkt.';
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
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', previousSubcaseShortTitle);
    cy.get(newsletter.editItem.rdfaEditor).contains(previousSubcaseRichtext);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme);
    // edit
    cy.get(newsletter.editItem.shortTitle).type(addedTitle);
    cy.get(newsletter.editItem.rdfaEditor).type(addedText);
    cy.get(newsletter.editItem.themesSelector).contains(theme2)
      .click();
    cy.intercept('POST', '/newsletter-infos').as('postNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@postNewsItem');
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
    // value of subtitle from newsletter info is empty, but we show agendaitem title in frontend
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
    // value of subtitle from newsletter info is empty, but we show agendaitem title in frontend
    // TODO-newsletter are these contains correct?
    cy.get(newsletter.editItem.longTitle).should('contain', '');
    // TODO-KAS-3270 check if editor empty
    // TODO-KAS-3367 default richText to shorttitle?
    cy.get(newsletter.editItem.rdfaEditor).should('contain', '');
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
  });

  it('should test default newsletter values on new nota after multiple announcements', () => {
    const previousSubcaseShortTitle = 'Cypress test: KB defaults 5 - Nota - 1651585885';
    const previousSubcaseRichtext = 'Tekst om te checken of default overname correct werkt met mededelingen ertussen.';
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
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');
    // check default values
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.toggleFinished).should('not.be.checked');
    // check inherited values
    cy.get(newsletter.editItem.shortTitle).should('have.value', previousSubcaseShortTitle);
    cy.get(newsletter.editItem.rdfaEditor).contains(previousSubcaseRichtext);
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains(theme);
    cy.intercept('POST', '/newsletter-infos').as('postNewsItem');
    cy.get(newsletter.editItem.save).click();
    cy.wait('@postNewsItem');
    // check KB views for in-newsletter toggle
    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    // The previous subcase had "in-newsletter" as checked, verify it was not inherited
    cy.get(newsletter.tableRow.newsletterTitle).contains(previousSubcaseShortTitle)
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
    const subcaseLink = 'dossiers/62713DE36C41DEA869521DFB/deeldossiers/62713E586C41DEA869521E02/overzicht';

    changeSubcaseType(subcaseLink, 'Mededeling');
    cy.visitAgendaWithLink(agendaitemKBLink);
    // check if KB exists
    // check default values
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.shortTitle).should('have.value', subcaseTitleShort);
    cy.get(newsletter.editItem.toggleFinished).should('be.checked');
    // value of subtitle from newsletter info is empty, but we show agendaitem title in frontend
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
    // value of subtitle from newsletter info is empty, but we show agendaitem title in frontend
    cy.get(newsletter.editItem.longTitle).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.rdfaEditor).contains(subcaseTitleLong);
    cy.get(newsletter.editItem.checkedThemes).should('not.exist');
    cy.get(newsletter.editItem.cancel).click();

    changeSubcaseType(subcaseLink, 'Nota');
    cy.visitAgendaWithLink(agendaitemKBLink);
    // check if KB empty
    cy.get(newsletter.newsItem.alert).contains('Nog geen kort bestek voor dit agendapunt.');
    // create new KB
    cy.intercept('GET', '/themes').as('getThemes');
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
    cy.get(agenda.agendaHeader.showOptions).click();
    cy.get(agenda.agendaHeader.actions.navigateToNewsletter).click();
    cy.get(newsletter.tableRow.newsletterTitle).contains(previousSubcaseTitleShort)
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
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getThemes');

    // check and fill in all fields
    cy.get(newsletter.editItem.noNota).should('be.disabled');
    cy.get(newsletter.editItem.mandateeProposal).contains('Niet van toepassing');
    cy.get(dependency.rdfa.editorInner).clear();
    cy.get(newsletter.editItem.rdfaEditor).type('rollbackTest');
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
    cy.openAgendaitemDossierTab(subcaseTitleShort);
    cy.addAgendaitemMandatee(1);
    cy.addDocumentsToAgendaitem(subcaseTitleShort, files);
    // TODO-bug reload should not be necessary
    // reload necessary for nota
    cy.reload();

    cy.visitAgendaWithLink(agendaitemKBLink);
    cy.intercept('GET', '/themes').as('getThemes3');
    cy.get(newsletter.newsItem.create).click();
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
      cy.get(newsletter.tableRow.newsletterTitle).contains('Nog geen kort bestek voor dit agendapunt.');
      cy.get(newsletter.buttonToolbar.openNota).should('be.disabled');
    });

    // add nota to agendaitem
    cy.visitAgendaWithLink(agendaLink);
    cy.openAgendaitemKortBestekTab(subcaseTitleNota);
    cy.addDocumentsToAgendaitem(subcaseTitleNota, files);
    cy.visit(newsletterLink);
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
    const richtext = 'this richtext should be visible in klad';
    const remarkText = 'this remark should be visible in klad';
    // const subcaseTitleMededeling = 'Cypress test: KB klad - mededeling - 1651673428';
    // const subcaseTitleNota = 'Cypress test: KB klad - nota - 1651673428';

    cy.visit(newsletterLink);
    cy.clickReverseTab('Klad');
    cy.get(newsletter.itemContent.container).find(newsletter.itemContent.edit)
      .should('not.exist');
    cy.get(newsletter.itemContent.noContent);
    // check that there is link to edit with newsletter and that info and remark text are shown
    cy.clickReverseTab('Overzicht');
    cy.get(newsletter.buttonToolbar.edit).click();
    cy.get(dependency.rdfa.editorInner).clear();
    cy.get(newsletter.editItem.rdfaEditor).type(richtext);
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
    // const agendaDate = Cypress.dayjs('2022-04-04');
    const agendaLinkMed = '/vergadering/62726CD0D600B7FF7F95BBF5/agenda/62726CD1D600B7FF7F95BBF6/agendapunten/627289BFE536C464112FFE91';
    const agendaLinkNota = '/vergadering/62726CD0D600B7FF7F95BBF5/agenda/62726CD1D600B7FF7F95BBF6/agendapunten/627289D3E536C464112FFE96';
    const newsletterLink = '/vergadering/62726CD0D600B7FF7F95BBF5/kort-bestek';
    // *note the next richtext is used in search.spec, keep them identical
    const richtextNota = 'this nota info should be visible in definitief';
    const remarkTextNota = 'this nota remark should not be visible in definitief';
    const proposalTextNota = 'Op voorstel van minister-president Jan Jambon';
    const richtextMededeling = 'this announcement info should be visible in definitief';
    const remarkTextMededeling = 'this announcement remark should not be visible in definitief';
    const proposalTextMededeling = 'Op voorstel van viceminister-president Hilde Crevits';
    const subcaseTitleMededeling = 'Cypress test: KB Definitief view - mededeling - 1651673497';
    const subcaseTitleNota = 'Cypress test: KB Definitief view - nota - 1651673497';

    // check that there is one mededeling without proposal or themes
    cy.visit(newsletterLink);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.container).should('have.length', 1);
    cy.get(newsletter.itemContent.title).contains(subcaseTitleMededeling);
    cy.get(newsletter.itemContent.printItemProposal).should('not.exist');
    cy.get(newsletter.itemContent.theme).should('not.exist');

    // add mandatee, info, remark and theme to mededeling, then check if shown/not shown correctly
    cy.visitAgendaWithLink(agendaLinkMed);
    cy.addAgendaitemMandatee(2); // Hilde Crevits
    cy.openAgendaitemKortBestekTab(subcaseTitleMededeling);
    cy.intercept('GET', '/themes').as('getThemes_1');
    cy.get(newsletter.newsItem.edit).click();
    cy.wait('@getThemes_1');
    cy.get(newsletter.editItem.rdfaEditor).type(richtextMededeling);
    cy.get(newsletter.editItem.remark).type(remarkTextMededeling);
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click()
      .wait('@patchNewsItem');

    cy.visit(newsletterLink);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.title).contains(subcaseTitleMededeling);
    cy.get(newsletter.itemContent.printItemProposal).contains(proposalTextMededeling);
    cy.get(newsletter.itemContent.theme).contains(theme);
    cy.get(newsletter.itemContent.richtext).should('not.exist');
    cy.get(newsletter.itemContent.remark).should('not.exist');

    // check if nota is visible when selected
    cy.clickReverseTab('Overzicht');
    // only 1 item in zebra view (the nota)
    cy.get(newsletter.buttonToolbar.edit).click();
    cy.get(dependency.rdfa.editorInner).clear({
      force: true,
    });
    cy.get(newsletter.editItem.rdfaEditor).type(richtextNota);
    cy.get(newsletter.editItem.remark).clear()
      .type(remarkTextNota);
    cy.intercept('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(newsletter.editItem.save).click();
    cy.get(utils.vlModalVerify.save).click();
    cy.wait('@newsletterInfosPost');
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem1');
    cy.get(newsletter.tableRow.newsletterRow)
      .find(newsletter.tableRow.inNewsletterCheckbox)
      .parent()
      .click()
      .wait('@patchNewsItem1');
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.container).should('have.length', 2);
    cy.get(newsletter.itemContent.title).eq(0)
      .contains(subcaseTitleNota);

    // check if mededeling is not visible when deselected in dossier
    cy.visitAgendaWithLink(agendaLinkMed);
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.showInNewsletter).click();
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem2');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).click()
      .wait('@patchNewsItem2');

    cy.visit(newsletterLink);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.container).should('have.length', 1);
    cy.get(newsletter.itemContent.title).should('not.contain', subcaseTitleMededeling);

    // add mandatee and theme to nota, then check if shown/not shown correctly
    // visit link of mededeling, open nota (less agenda loading)
    cy.visitAgendaWithLink(agendaLinkNota);
    cy.addAgendaitemMandatee(0);
    cy.openAgendaitemKortBestekTab(subcaseTitleNota);
    cy.intercept('GET', '/themes').as('getThemes_2');
    cy.get(newsletter.newsItem.edit).click();
    cy.wait('@getThemes_2');
    cy.get(newsletter.editItem.themesSelector).contains(theme2)
      .click();
    cy.intercept('PATCH', '/newsletter-infos/**').as('patchNewsItem3');
    cy.get(newsletter.editItem.save).click()
      .wait('@patchNewsItem3');

    cy.visit(newsletterLink);
    cy.clickReverseTab('Definitief');
    cy.get(newsletter.itemContent.title).contains(subcaseTitleNota);
    cy.get(newsletter.itemContent.printItemProposal).contains(proposalTextNota);
    cy.get(newsletter.itemContent.theme).contains(theme2);
    cy.get(newsletter.itemContent.richtext).contains(richtextNota);
    cy.get(newsletter.itemContent.remark).should('not.exist');
  });

  // RDFA tests can be flaky locally when having dev tools open or when running in background (not in focus)
  it('should test the rdfa editor', () => {
    cy.visit('/vergadering/5EBA94D7751CF70008000001/kort-bestek');
    cy.intercept('GET', '/themes').as('getThemes');
    cy.get(newsletter.buttonToolbar.edit).eq(0)
      .click();
    cy.wait('@getThemes');

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
    cy.get(newsletter.editItem.cancel).click();
  });

  it('should test the rdfa editor keypresses', () => {
    cy.visit('/vergadering/5EBA94D7751CF70008000001/kort-bestek');
    cy.get(newsletter.buttonToolbar.edit).eq(0)
      .click();

    cy.get(dependency.rdfa.editorInner).type('{ctrl+u}Underline')
      .type('{ctrl+u} ');
    cy.get('u').contains('Underline');
    cy.get(dependency.rdfa.editorInner).type('{ctrl+i}Italic')
      .type('{ctrl+i} ');
    cy.get('em').contains('Italic');
    cy.get(dependency.rdfa.editorInner).type('{ctrl+b}Bold')
      .type('{ctrl+b} ');
    cy.get('strong').contains('Bold');

    // check single backspace
    cy.get(dependency.rdfa.editorInner).type('{selectAll}{backspace}');
    cy.get(dependency.rdfa.editorInner).should('not.contain', 'Bol');
    // check single delete
    cy.get(dependency.rdfa.editorInner).type('Bold')
      .type('{selectall}{del}');
    cy.get(dependency.rdfa.editorInner).should('not.contain', 'Bold');
    // check separate backspaces
    cy.get(dependency.rdfa.editorInner).type('Bold')
      .type('{end}{backspace}')
      .type('{backspace}')
      .type('{backspace}')
      .type('{backspace}');
    cy.get(dependency.rdfa.editorInner).should('not.contain', 'Bol');
    // check separate deletes
    cy.get(dependency.rdfa.editorInner).type('Bold')
      .type('{home}{del}')
      .type('{del}')
      .type('{del}')
      .type('{del}');
    cy.get(dependency.rdfa.editorInner).should('not.contain', 'old');
    cy.get(newsletter.editItem.cancel).click();

    // check enter
    cy.get(newsletter.buttonToolbar.edit).eq(0)
      .click();
    cy.get(dependency.rdfa.editorInner).find('br')
      .should('not.exist');
    cy.get(dependency.rdfa.editorInner).type('{enter}');
    cy.get(dependency.rdfa.editorInner).find('br');
    // check space
    cy.get(dependency.rdfa.editorInner).clear()
      .type(' ');
    cy.get(dependency.rdfa.editorInner).should('contain', ' ');
    cy.get(dependency.rdfa.editorInner).should('not.contain', '\u00a0');
    // check that there are no &nbsp;
    // see: https://github.com/lblod/ember-rdfa-editor/pull/245
    cy.get(dependency.rdfa.editorInner).clear()
      .type('test  test');
    cy.get(dependency.rdfa.editorInner).should('contain', ' ');
    cy.get(dependency.rdfa.editorInner).should('not.contain', '\u00a0');
    cy.get(newsletter.editItem.cancel).click();
  });
});
