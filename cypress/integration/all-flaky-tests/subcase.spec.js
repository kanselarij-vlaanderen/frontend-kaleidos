/* global context, before, cy,beforeEach, it, Cypress */
// / <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import newsletter from '../../selectors/newsletter.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

function getTranslatedMonth(month) {
  switch (month) {
    case 0:
      return 'januari';
    case 1:
      return 'februari';
    case 2:
      return 'maart';
    case 3:
      return 'april';
    case 4:
      return 'mei';
    case 5:
      return 'juni';
    case 6:
      return 'juli';
    case 7:
      return 'augustus';
    case 8:
      return 'september';
    case 9:
      return 'oktober';
    case 10:
      return 'november';
    case 11:
      return 'december';
    default:
      return '';
  }
}

context('Subcase tests', () => {
  const agendaDate = Cypress.dayjs().add(2, 'weeks')
    .day(4); // Next friday
  // const caseTitle = 'Cypress test: subcases - 1594024946'; // The case is in the default data set with id 5F02E3F87DE3FC0008000002
  const subcaseTitleShort = `Cypress test: add subcase - ${currentTimestamp()}`;

  before(() => {
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logoutFlow();
  });

  beforeEach(() => {
    cy.login('Admin');
  });

  it('should open an existing case and add a subcase', () => {
    const type = 'Nota';
    const subcaseTitleLong = 'Cypress test voor het aanmaken van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/E14FB50A-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    cy.addSubcase(type, subcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.changeSubcaseAccessLevel(true, subcaseTitleShort, 'Cypress test nieuwere lange titel');
    cy.addSubcaseMandatee(2, 'Crevits');
    cy.addSubcaseMandatee(3);

    cy.proposeSubcaseForAgenda(agendaDate);

    const monthDutch = getTranslatedMonth(agendaDate.month());
    const dateFormat = `${agendaDate.date()} ${monthDutch} ${agendaDate.year()}`;
    const dateRegex = new RegExp(`.?${Cypress.dayjs(agendaDate).date()}.\\w+.${Cypress.dayjs(agendaDate).year()}`);

    cy.get(cases.subcaseDescription.timelineItem).eq(0)
      .contains(/Ingediend voor agendering/);

    cy.get(cases.subcaseDescription.meetingNumber);
    cy.get(cases.subcaseDescription.meetingPlannedStart).contains(/Ingediend voor de agenda van/);
    cy.get(cases.subcaseDescription.meetingPlannedStart).contains(dateRegex);
    cy.get(cases.subcaseDescription.agendaLink).contains(dateFormat);
    // The "decided on" field was already filled in right after proposing for agenda for a long time
    // this field has been changed to take in account if the relevant meeting is final to show this info
    cy.get(cases.subcaseDescription.decidedOn).contains('Nog niet beslist');
    // Deze test volgt het al dan niet default "beslist" zijn van een beslissing.
    // Default = beslist, assert dotted date; default = niet beslist: assert "nog niet beslist".
    cy.get(cases.subcaseDescription.requestedBy).contains(/Hilde Crevits/);

    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDossierTab(subcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).should('exist');
  });

  it('should add a subcase and then delete it', () => {
    const type = 'Nota';
    const shortSubcaseTitle = `Cypress test: delete subcase - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het aanmaken en verwijderen van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/E14FB50A-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    cy.addSubcase(type, shortSubcaseTitle, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.wait(2000);
    cy.deleteSubcase();
  });

  it('should not be able to delete a subcase with agendaitems', () => {
    const type = 'Nota';
    const shortSubcaseTitle = `Cypress test: delete subcase not possible - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor niet kunnen verwijderen van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/E14FB50A-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    cy.addSubcase(type, shortSubcaseTitle, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);
    cy.get(cases.subcaseHeader.actionsDropdown)
      .click();
    cy.get(cases.subcaseHeader.actions.deleteSubcase)
      .should('not.exist');
  });

  it('Clickable link should go to the agenda right after proposing to agenda', () => {
    const type = 'Nota';
    const shortSubcaseTitle = `Cypress test: Link to agenda item ok - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor te klikken op de link naar agenda vanuit procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/E14FB50A-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    cy.addSubcase(type, shortSubcaseTitle, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);

    const monthDutch = getTranslatedMonth(agendaDate.month());
    const dateFormat = `${agendaDate.date()} ${monthDutch} ${agendaDate.year()}`;
    const dateRegex = new RegExp(`.?${Cypress.dayjs(agendaDate).date()}.\\w+.${Cypress.dayjs(agendaDate).year()}`);

    cy.get(cases.subcaseDescription.meetingNumber);
    cy.get(cases.subcaseDescription.meetingPlannedStart).contains(/Ingediend voor de agenda van/);
    cy.get(cases.subcaseDescription.meetingPlannedStart).contains(dateRegex);
    cy.get(cases.subcaseDescription.agendaLink).contains(dateFormat);
    // The "decided on" field was already filled in right after proposing for agenda for a long time
    // this field has been changed to take in account if the relevant meeting is final to show this info
    cy.get(cases.subcaseDescription.decidedOn).contains('Nog niet beslist');
    // Deze test volgt het al dan niet default "beslist" zijn van een beslissing.
    // Default = beslist, assert dotted date; default = niet beslist: assert "nog niet beslist".
    cy.get(cases.subcaseDescription.requestedBy).contains(/Hilde Crevits/);
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten/');
    cy.url().should('not.contain', '/dossier/');
  });

  it('Changes to agendaitem should propagate to subcase', () => {
    const type = 'Mededeling';
    const shortSubcaseTitle = `Cypress test: Mededeling - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test doorstromen changes agendaitem to subcase';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    // Aanmaken Dossier

    cy.createCase('Cypress mededeling test');

    // Aanmaken subcase.
    cy.addSubcase(type, shortSubcaseTitle, subcaseTitleLong, subcaseType, subcaseName);

    // Aanmaken agendaitem
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(shortSubcaseTitle);
    cy.openAgendaitemDossierTab(shortSubcaseTitle);

    // Status is hidden
    cy.get(appuniversum.pill).contains('Op de website');
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();

    // Assert status also hidden
    cy.get(route.subcaseOverview.confidentialityCheckBox).should('not.be.checked');
    cy.intercept('PATCH', '/agendaitems/*').as('patchAgendaitem');
    cy.changeSubcaseAccessLevel(true) // CHECK na save in agendaitem
      .wait('@patchAgendaitem');

    cy.get(route.subcaseOverview.confidentialityCheckBox).should('be.checked');
    // "Go to agendaitem
    cy.get(cases.subcaseDescription.agendaLink).click();
    cy.get(agenda.agendaDetailSidebarItem.confidential).should('exist');
    // Index view
    // TODO-BUG, page is loading, the new sidenav for agendas has pills and we only get those
    cy.wait(1500); // waiting for now, remove this fix with a proper selector after merge of agenda design
    cy.get(agenda.agendaitemTitlesView.confidential).contains('Vertrouwelijk');

    // Click the "wijzigen link.
    cy.get(agenda.agendaitemTitlesView.edit).click();

    // Check the checkbox
    cy.get(agenda.agendaitemTitlesEdit.showInNewsletter).click();

    // Save the changes setting
    cy.intercept('PATCH', '/agendas/**').as('patchAgenda');
    cy.intercept('PATCH', '/newsletter-infos/**').as('newsletterInfosPatch');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).contains('Opslaan')
      .click();
    cy.wait('@patchAgenda');
    // We toggled hide in newsletter, await the patch
    cy.wait('@newsletterInfosPatch');

    // Assert status shown & confidentiality icon is visible
    cy.get(appuniversum.pill).contains('Niet op de website');

    // Check if saving on agendaitem did not trigger a change in confidentiality (came up during fixing)
    cy.get(agenda.agendaDetailSidebarItem.confidential).should('exist');

    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    // Check if saving on agendaitem did not trigger a change in confidentiality (came up during fixing)
    cy.get(route.subcaseOverview.confidentialityCheckBox).should('be.checked');
  });

  it('Changes to agenda item Themas propagate properly', () => {
    // Open agenda
    cy.intercept('GET', '/agendas/**').as('getAgenda');
    cy.openAgendaForDate(agendaDate);
    cy.wait('@getAgenda');

    // Are there Themes in this agenda? Should be none
    cy.openAgendaitemKortBestekTab(subcaseTitleShort);
    cy.intercept('GET', '/themes**').as('getAgendaitemThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getAgendaitemThemes');
    cy.get(newsletter.editItem.cancel).click();

    // open themes ediging pane.
    cy.intercept('GET', '/themes**').as('getAgendaitemThemes');
    cy.get(newsletter.newsItem.create).click();
    cy.wait('@getAgendaitemThemes');

    // Toggle some themes.
    cy.get(newsletter.editItem.themesSelector).contains('Wonen')
      .click();
    cy.get(newsletter.editItem.themesSelector).contains('Sport ')
      .click();
    cy.get(newsletter.editItem.themesSelector).contains('Toerisme ')
      .click();
    cy.get(newsletter.editItem.themesSelector).contains('Overheid ')
      .click();
    cy.get(newsletter.editItem.themesSelector).contains('Innovatie ')
      .click();

    // Save this stuff.
    cy.intercept('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(newsletter.editItem.save).click()
      .wait('@newsletterInfosPost');

    // Assert the save is done.
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Wonen');
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Sport');
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Toerisme');
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Overheid');
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Innovatie');

    // Go via kort-bestek view
    cy.intercept('GET', '/meetings/**/mail-campaign').as('getMeetingsMail');
    cy.intercept('GET', '/meetings?**').as('getMeetingsfilter');
    cy.get(utils.mHeader.newsletters).click();
    cy.wait('@getMeetingsMail');
    cy.wait('@getMeetingsfilter');

    cy.intercept('GET', '/meetings/**').as('getMeetingsDetail');
    cy.intercept('GET', '/agendaitems**').as('getAgendaitems');
    cy.get(route.newsletters.dataTable).find('tbody')
      .children('tr')
      .contains(`van ${Cypress.dayjs(agendaDate).format('DD-MM-YYYY')}`)
      .click();
    cy.wait('@getMeetingsDetail');
    cy.wait('@getAgendaitems');

    // open the themes editor.
    cy.intercept('GET', '/themes**').as('getKortBestekThemes');
    cy.get(newsletter.tableRow.newsletterRow).eq(0)
      .find(newsletter.buttonToolbar.edit)
      .click();
    cy.wait('@getKortBestekThemes');

    // Validate already inputted data.
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains('Wonen');
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains('Sport');
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains('Toerisme');
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains('Overheid');
    cy.get(newsletter.editItem.checkedThemes).parent('label')
      .contains('Innovatie');

    // uncheck 2
    cy.get(newsletter.editItem.themesSelector).contains('Wonen')
      .click();
    cy.get(newsletter.editItem.themesSelector).contains('Toerisme')
      .click();

    // check 3   others
    cy.get(newsletter.editItem.themesSelector).contains('Jeugd')
      .click();
    cy.get(newsletter.editItem.themesSelector).contains('Cultuur')
      .click();
    cy.get(newsletter.editItem.themesSelector).contains('Media')
      .click();

    // Save this stuff.
    cy.intercept('PATCH', '/newsletter-infos/**').as('newsletterInfosPatch');
    cy.get(newsletter.editItem.save).click()
      .wait('@newsletterInfosPatch');

    // go to agendaitem
    cy.get(newsletter.buttonToolbar.linkToAgendaitem).eq(0)
      .invoke('removeAttr', 'target') // dont open links in new windows by removing target (breaks cypress test).
      .click();

    cy.openAgendaitemKortBestekTab(subcaseTitleShort);

    cy.get(newsletter.agendaitemNewsItem.themes).contains('Sport');
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Overheid');
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Innovatie');

    cy.get(newsletter.agendaitemNewsItem.themes).contains('Jeugd');
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Cultuur');
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Media');

    cy.get(newsletter.agendaitemNewsItem.themes).contains('Toerisme')
      .should('not.exist');
    cy.get(newsletter.agendaitemNewsItem.themes).contains('Wonen')
      .should('not.exist');
  });

  it('After finalizing agenda, subcase info should change to the approved status', () => {
    cy.openAgendaForDate(agendaDate);
    cy.setAllItemsFormallyOk(5);
    cy.approveAndCloseDesignAgenda();

    cy.visit('/dossiers/E14FB50A-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    cy.get(cases.subcaseItem.approved).should('have.length', 3);
    cy.openSubcase(2);
    cy.get(cases.subcaseDescription.decidedOn).contains(agendaDate.format('DD-MM-YYYY'));
  });

  it('move subcases', () => {
    const randomInt1 = Math.floor(Math.random() * Math.floor(10000));
    const randomInt2 = randomInt1 + 1;
    const type = 'Nota';
    const caseTitle1 = `Cypress test ${randomInt1}: move subcases`;
    const caseTitle2 = `Cypress test ${randomInt2}: move subcases`;
    const subcaseShortTitle1 = 'Short title 1 for moving subcase';
    const subcaseShortTitle2 = 'Short title 2 for moving subcase';
    const subcaseShortTitle3 = 'Short title 3 for moving subcase';

    // setup
    cy.createCase(caseTitle1);
    cy.addSubcase(type, subcaseShortTitle1);
    cy.addSubcase(type, subcaseShortTitle2);
    cy.createCase(caseTitle2);
    // wait for search index
    cy.wait(30000);

    // use case 1
    cy.openCase(caseTitle1);
    cy.openSubcase(0);
    cy.get(cases.subcaseHeader.actionsDropdown).click();
    cy.get(cases.subcaseHeader.actions.moveSubcase).click();
    cy.intercept('GET', 'decisionmaking-flows/search?**').as('searchCall1');
    cy.get(utils.caseSearch.input).type(caseTitle2)
      .wait('@searchCall1')
      .wait(1000);
    cy.intercept('PATCH', 'subcases/**').as('patchSubcases1');
    cy.get(utils.caseSearch.row).contains(caseTitle2)
      .click()
      .wait('@patchSubcases1');
    cy.get(utils.vlModalVerify.container).should('not.exist');
    cy.openCase(caseTitle2);
    cy.get(cases.subcaseItem.container).should('have.length', 1)
      .find(cases.subcaseItem.link)
      .contains(subcaseShortTitle2);

    // use case 2
    cy.openCase(caseTitle1);
    cy.openSubcase(0);
    cy.get(cases.subcaseHeader.actionsDropdown).click();
    cy.get(cases.subcaseHeader.actions.moveSubcase).click();
    cy.intercept('GET', 'decisionmaking-flows/search?**').as('searchCall2');
    cy.get(utils.caseSearch.input).type(caseTitle2)
      .wait('@searchCall2')
      .wait(1000);
    cy.intercept('PATCH', 'subcases/**').as('patchSubcases2');
    cy.get(utils.caseSearch.row).contains(caseTitle2)
      .click()
      .wait('@patchSubcases2');
    cy.get(utils.vlModalVerify.cancel).click();
    cy.get(cases.subcaseOverviewHeader.titleContainer).contains(caseTitle1);
    cy.get(cases.subcaseItem.container).should('not.exist');
    cy.openCase(caseTitle2);
    cy.get(cases.subcaseItem.container).should('have.length', 2)
      .find(cases.subcaseItem.link)
      .contains(subcaseShortTitle1);

    // use case 3
    cy.openCase(caseTitle1);
    cy.addSubcase(type, subcaseShortTitle3);
    cy.openSubcase(0);
    cy.get(cases.subcaseHeader.actionsDropdown).click();
    cy.get(cases.subcaseHeader.actions.moveSubcase).click();
    cy.intercept('GET', 'decisionmaking-flows/search?**').as('searchCall3');
    cy.get(utils.caseSearch.input).type(caseTitle2)
      .wait('@searchCall3')
      .wait(1000);
    cy.intercept('PATCH', 'subcases/**').as('patchSubcases3');
    cy.get(utils.caseSearch.row).contains(caseTitle2)
      .click()
      .wait('@patchSubcases3');
    cy.get(utils.vlModalVerify.save).click();
    cy.get(route.casesOverview.dataTable);
    cy.openCase(caseTitle2);
    cy.get(cases.subcaseItem.container).should('have.length', 3)
      .find(cases.subcaseItem.link)
      .contains(subcaseShortTitle3);
  });

  it('check capital letters of subcase name', () => {
    const capital = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const nonCapital = 'principiële goedkeuring m.h.o. op adviesaanvraag';
    const subcaseWithName = 'testId=1589266576: Cypress test dossier 1 test stap 2';
    const encodedSubcaseTitle = encodeURIComponent(subcaseWithName);

    // this agenda may no longer exist if this spec is run after agenda.spec
    // subcase name (if present) in "add agendaitem to agenda" feature
    cy.visitAgendaWithLink('vergadering/5EB2CD4EF5E1260009000015/agenda/9da67561-a827-47a2-8f58-8b3fd5739df4/agendapunten');
    cy.get(agenda.agendaActions.showOptions).click();
    cy.get(agenda.agendaActions.addAgendaitems).click();
    cy.get(dependency.emberDataTable.isLoading).should('not.exist');
    cy.get(agenda.createAgendaitem.input).should('not.be.disabled')
      .clear()
      .type(subcaseWithName, {
        force: true,
      });
    cy.intercept('GET', `/subcases?filter**filter*short-title*=${encodedSubcaseTitle}**`).as('getSubcasesFiltered');
    cy.wait('@getSubcasesFiltered', {
      timeout: 12000,
    });
    cy.get(auk.loader, {
      timeout: 12000,
    }).should('not.exist');
    cy.get(dependency.emberDataTable.isLoading).should('not.exist');
    cy.get(agenda.createAgendaitem.row.subcaseName).contains(capital);
    cy.get(auk.modal.footer.cancel).click();

    // subcasename in overview and detail case tab
    cy.visitAgendaWithLink('vergadering/5EB2CD4EF5E1260009000015/agenda/5EB2CD4FF5E1260009000016/agendapunten');
    cy.get(agenda.agendaOverviewItem.subcaseName).contains(capital);
    cy.get(agenda.agendaOverviewItem.subitem).eq(1)
      .click();
    cy.get(agenda.agendaitemTitlesView.subcaseName).contains(capital);

    cy.visit('dossiers/E14FB500-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    cy.get(cases.subcaseItem.link).contains(nonCapital);
    cy.get(cases.subcaseOverviewHeader.createSubcase).click();
    cy.get(cases.newSubcase.procedureName).click();
    cy.get(dependency.emberPowerSelect.option).contains(capital);
    cy.get(auk.modal.footer.cancel).click();

    cy.get(cases.subcaseItem.link).eq(0)
      .click();
    cy.get(cases.subcaseDescription.subcaseName).contains(nonCapital)
      .should('have.class', 'auk-u-text-capitalize');
    cy.get(cases.subcaseTitlesView.subcaseName).contains(capital);
  });

  it('check submission activities', () => {
    const kind = 'Ministerraad';
    const fileName = 'VR 2020 1212 DOC.0001-1';
    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: fileName, fileType: 'Nota',
    };
    const caseTitle2 = 'cypress test: submission activities new title';
    const caseTitle = 'cypress test: submission activities';

    // TODO-setup
    cy.createCase(caseTitle);
    cy.addSubcase(null, subcaseTitleShort);
    cy.openSubcase(0);
    cy.addDocumentsToSubcase([
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 1212 DOC.0001-2', fileType: 'Nota',
      }
    ]);
    cy.createAgenda(kind, agendaDate);

    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    cy.reload();
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.addNewPiece('VR 2020 1212 DOC.0001-1', file, 'agendaitems');
    cy.get(agenda.agendaitemNav.caseTab).click();
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.shorttitle).clear()
      .type(caseTitle2);
    cy.intercept('PATCH', '/subcases/*').as('patchSubcases5');
    cy.intercept('PATCH', '/agendaitems/*').as('patchAgendaitems');
    cy.intercept('PATCH', '/agendas/*').as('patchAgendas');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).click()
      .wait('@patchSubcases5')
      .wait('@patchAgendaitems')
      .wait('@patchAgendas');
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    cy.get(cases.subcaseDetailNav.documents).click();
    // if this fails, we are probably saving subcase with an incomplete list of submission activities
    cy.get(document.documentCard.card).should('have.length', 2)
      .find(document.documentCard.name.value)
      .contains(`${file.newFileName}BIS`);
  });
});
