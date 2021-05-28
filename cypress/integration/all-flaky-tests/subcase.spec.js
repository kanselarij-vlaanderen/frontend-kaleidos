/* global context, before, cy,beforeEach, it, Cypress */
// / <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import cases from '../../selectors/case.selectors';
import auComponents from '../../selectors/au-component-selectors';

function currentTimestamp() {
  return Cypress.moment().unix();
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
  const agendaDate = Cypress.moment().add(2, 'weeks')
    .day(4); // Next friday
  // const caseTitle = 'Cypress test: subcases - 1594024946'; // The case is in the default data set with id 5F02E3F87DE3FC0008000002
  const SubcaseTitleShort = `Cypress test: add subcase - ${currentTimestamp()}`;

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logoutFlow();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should open an existing case and add a subcase', () => {
    const type = 'Nota';
    const subcaseTitleLong = 'Cypress test voor het aanmaken van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/5F02E3F87DE3FC0008000002/deeldossiers');
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.changeSubcaseAccessLevel(false, SubcaseTitleShort, true, 'Intern Overheid', SubcaseTitleShort, 'Cypress test nieuwere lange titel');
    cy.addSubcaseMandatee(1, 0, 0, 'Vlaams minister voor onderwijs'); // TODO: awaits @iseCodes that doesn't come
    cy.addSubcaseMandatee(2, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);

    const monthDutch = getTranslatedMonth(agendaDate.month());
    const dateFormat = `${agendaDate.date()} ${monthDutch} ${agendaDate.year()}`;
    const dateRegex = new RegExp(`.?${Cypress.moment(agendaDate).date()}.\\w+.${Cypress.moment(agendaDate).year()}`);

    cy.get('.vlc-status-timeline > li').eq(0)
      .contains(/Ingediend voor agendering/);

    cy.get(cases.subcaseMeetingNumber);
    cy.get(cases.subcaseMeetingPlannedStart).contains(/Ingediend voor de agenda van/);
    cy.get(cases.subcaseMeetingPlannedStart).contains(dateRegex);
    cy.get(agenda.subcase.agendaLink).contains(dateFormat);
    // The "decided on" field was already filled in right after proposing for agenda for a long time
    // this field has been changed to take in account if the relevant meeting is final to show this info
    cy.get(cases.subcaseDecidedOn).contains('Nog niet beslist');
    // Deze test volgt het al dan niet default "beslist" zijn van een beslissing.
    // Default = beslist, assert dotted date; default = niet beslist: assert "nog niet beslist".
    cy.get(cases.subcaseRequestedBy).contains(/Hilde Crevits/);

    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemDossierTab(SubcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).should('exist');
  });

  it('should add a subcase and then delete it', () => {
    const type = 'Nota';
    const shortSubcaseTitle = `Cypress test: delete subcase - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor het aanmaken en verwijderen van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/5F02E3F87DE3FC0008000002/deeldossiers');
    cy.addSubcase(type, shortSubcaseTitle, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.deleteSubcase();
  });

  it('should not be able to delete a subcase with agendaitems', () => {
    const type = 'Nota';
    const shortSubcaseTitle = `Cypress test: delete subcase not possible - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor niet kunnen verwijderen van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/5F02E3F87DE3FC0008000002/deeldossiers');
    cy.addSubcase(type, shortSubcaseTitle, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);
    cy.get('.auk-button')
      .contains('Acties')
      .click();
    cy.get('.vlc-dropdown-menu__item > .auk-button-link')
      .contains('Procedurestap verwijderen')
      .should('not.exist');
  });

  it('Clickable link should go to the agenda right after proposing to agenda', () => {
    const type = 'Nota';
    const shortSubcaseTitle = `Cypress test: Link to agenda item ok - ${currentTimestamp()}`;
    const subcaseTitleLong = 'Cypress test voor te klikken op de link naar agenda vanuit procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.visit('/dossiers/5F02E3F87DE3FC0008000002/deeldossiers');
    cy.addSubcase(type, shortSubcaseTitle, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);

    const monthDutch = getTranslatedMonth(agendaDate.month());
    const dateFormat = `${agendaDate.date()} ${monthDutch} ${agendaDate.year()}`;
    const dateRegex = new RegExp(`.?${Cypress.moment(agendaDate).date()}.\\w+.${Cypress.moment(agendaDate).year()}`);

    cy.get(cases.subcaseMeetingNumber);
    cy.get(cases.subcaseMeetingPlannedStart).contains(/Ingediend voor de agenda van/);
    cy.get(cases.subcaseMeetingPlannedStart).contains(dateRegex);
    cy.get(agenda.subcase.agendaLink).contains(dateFormat);
    // The "decided on" field was already filled in right after proposing for agenda for a long time
    // this field has been changed to take in account if the relevant meeting is final to show this info
    cy.get(cases.subcaseDecidedOn).contains('Nog niet beslist');
    // Deze test volgt het al dan niet default "beslist" zijn van een beslissing.
    // Default = beslist, assert dotted date; default = niet beslist: assert "nog niet beslist".
    cy.get(cases.subcaseRequestedBy).contains(/Hilde Crevits/);
    cy.get(agenda.subcase.agendaLink).click();
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

    cy.createCase(false, 'Cypress mededeling test');

    // Aanmaken subcase.
    cy.addSubcase(type, shortSubcaseTitle, subcaseTitleLong, subcaseType, subcaseName);

    // Aanmaken agendaitem
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(shortSubcaseTitle, false);
    cy.openAgendaitemDossierTab(shortSubcaseTitle);

    // Status is hidden
    cy.get(auComponents.auPillSpan).contains('Zichtbaar in kort bestek');
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();

    // Assert status also hidden
    cy.get(agenda.subcase.confidentialyCheck).should('not.be.checked');
    cy.route('PATCH', '/agendaitems/*').as('patchAgendaitem');
    cy.changeSubcaseAccessLevel(true, shortSubcaseTitle, true, 'Intern Overheid') // CHECK na save in agendaitem
      .wait('@patchAgendaitem');

    cy.get(agenda.subcase.confidentialyCheck).should('be.checked');
    // "Go to agendaitem
    cy.route('GET', '/meetings/**').as('getMeetingsRequest');
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.get(agenda.subcase.agendaLink).click();
    cy.wait('@getMeetingsRequest');
    cy.get(agenda.confidentialityIcon).should('exist');
    // Index view
    cy.get(auComponents.auPillSpan).contains('Vertrouwelijk');

    // Click the "wijzigen link.
    cy.get(agenda.agendaitemTitlesView.edit).click();

    // Check the checkbox (toggle this invisible motafoka).
    cy.get(agenda.agendaitemTitlesEditShowInNewsletter)
      .find(agenda.item.checkBoxLabel) // Because who uses checkboxes anyway?
      .click();

    // Save the changes setting
    cy.route('PATCH', '/agendas/**').as('patchAgenda');
    cy.route('PATCH', '/newsletter-infos/**').as('newsletterInfosPatch');
    cy.get(agenda.item.actionButton).contains('Opslaan')
      .click();
    cy.wait('@patchAgenda');
    // We toggled hide in newsletter, await the patch
    cy.wait('@newsletterInfosPatch');

    // Assert status shown & confidentiality icon is visible
    cy.get(auComponents.auPillSpan).contains('Verborgen in kort bestek');

    // Check if saving on agendaitem did not trigger a change in confidentiality (came up during fixing)
    cy.get(agenda.confidentialityIcon).should('exist');

    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    // Check if saving on agendaitem did not trigger a change in confidentiality (came up during fixing)
    cy.get(agenda.subcase.confidentialyCheck).should('be.checked');
  });

  it('Changes to agenda item Themas propagate properly', () => {
    // Open agenda
    cy.route('GET', '/agendas/**').as('getAgenda');
    cy.openAgendaForDate(agendaDate);
    cy.wait('@getAgenda');

    // Are there Themes in this agenda? Should be none
    cy.openAgendaitemKortBestekTab(SubcaseTitleShort); // TODO: doesn't find this item it's looking for in the agenda it just openend
    cy.route('GET', '**/themes').as('getAgendaitemThemes');
    cy.get(agenda.item.news.editLink).click();
    cy.wait('@getAgendaitemThemes');
    cy.contains('Annuleren').click();

    // open themes ediging pane.
    cy.route('GET', '**/themes').as('getAgendaitemThemes');
    cy.get(agenda.item.news.editLink).click();
    cy.wait('@getAgendaitemThemes');

    // Toggle some themes.
    cy.get(agenda.item.news.themesSelector).contains('Wonen')
      .click();
    cy.get(agenda.item.news.themesSelector).contains('Sport ')
      .click();
    cy.get(agenda.item.news.themesSelector).contains('Toerisme ')
      .click();
    cy.get(agenda.item.news.themesSelector).contains('Overheid ')
      .click();
    cy.get(agenda.item.news.themesSelector).contains('Innovatie ')
      .click();

    // Save this stuff.
    cy.route('POST', '/newsletter-infos').as('newsletterInfosPost');
    cy.get(agenda.item.news.saveButton).click()
      .wait('@newsletterInfosPost');

    // Assert the save is done.
    cy.get(agenda.item.themes).contains('Wonen');
    cy.get(agenda.item.themes).contains('Sport');
    cy.get(agenda.item.themes).contains('Toerisme');
    cy.get(agenda.item.themes).contains('Overheid');
    cy.get(agenda.item.themes).contains('Innovatie');

    // Go via kort-bestek view
    cy.route('GET', '/meetings/**/mail-campaign').as('getMeetingsMail');
    cy.route('GET', '/meetings?**').as('getMeetingsfilter');
    cy.get('.auk-toolbar-complex').contains('Kort bestek')
      .click();
    cy.wait('@getMeetingsMail');
    cy.wait('@getMeetingsfilter');

    cy.route('GET', '/meetings/**').as('getMeetingsDetail');
    // cy.route('GET', '/agendas**').as('getAgendas');
    cy.route('GET', '/agendaitems**').as('getAgendaitems');
    cy.get(agenda.dataTableZebra).contains(`van ${Cypress.moment(agendaDate).format('DD.MM.YYYY')}`)
      .click();
    cy.wait('@getMeetingsDetail');
    // cy.wait('@getAgendas');
    cy.wait('@getAgendaitems');

    // open the themes editor.
    cy.route('GET', '**/themes').as('getKortBestekThemes');
    cy.get(agenda.dataTable).find('.ki-pencil')
      .first()
      .click();
    cy.wait('@getKortBestekThemes');

    // Validate already inputted data.
    cy.get(agenda.item.news.checkedThemes).parent('label')
      .contains('Wonen');
    cy.get(agenda.item.news.checkedThemes).parent('label')
      .contains('Sport');
    cy.get(agenda.item.news.checkedThemes).parent('label')
      .contains('Toerisme');
    cy.get(agenda.item.news.checkedThemes).parent('label')
      .contains('Overheid');
    cy.get(agenda.item.news.checkedThemes).parent('label')
      .contains('Innovatie');

    // uncheck 2
    cy.get(agenda.item.news.themesSelector).contains('Wonen')
      .click();
    cy.get(agenda.item.news.themesSelector).contains('Toerisme')
      .click();

    // check 3   others
    cy.get(agenda.item.news.themesSelector).contains('Jeugd')
      .click();
    cy.get(agenda.item.news.themesSelector).contains('Cultuur')
      .click();
    cy.get(agenda.item.news.themesSelector).contains('Media')
      .click();

    // Save this stuff.
    // cy.route('GET', '**/pieces?page*size*=9999').as('pieces');
    cy.route('PATCH', '/newsletter-infos/**').as('newsletterInfosPatch');
    cy.get(agenda.item.news.saveButton).click()
      .wait('@newsletterInfosPatch');
    // cy.wait('@pieces');

    // dont open links in new windows.

    cy.get('a').invoke('removeAttr', 'target');
    cy.get(agenda.dataTable).find('[data-test-link-to-subcase-overview]')
      .first()
      .click();

    cy.wait(1000);
    cy.get(agenda.agendaitemTitlesView.linkToSubcase).click();
    // "Go to agendaitem
    cy.route('GET', '/meetings/**').as('getMeetingsRequest');
    cy.get(agenda.subcase.agendaLink).click();
    cy.wait('@getMeetingsRequest');

    cy.openAgendaitemKortBestekTab(SubcaseTitleShort);

    cy.get(agenda.item.themes).contains('Sport');
    cy.get(agenda.item.themes).contains('Overheid');
    cy.get(agenda.item.themes).contains('Innovatie');

    cy.get(agenda.item.themes).contains('Jeugd');
    cy.get(agenda.item.themes).contains('Cultuur');
    cy.get(agenda.item.themes).contains('Media');

    cy.get(agenda.item.themes).contains('Toerisme')
      .should('not.exist');
    cy.get(agenda.item.themes).contains('Wonen')
      .should('not.exist');
  });

  it('After finalizing agenda, subcase info should change to the approved status', () => {
    const realmonth = agendaDate.month() + 1; // Js month start at 0.
    const paddedMonth = realmonth < 10 ? `0${realmonth}` : realmonth;
    const dateFormatDotted = `${agendaDate.date()}.${paddedMonth}.${agendaDate.year()}`;

    cy.openAgendaForDate(agendaDate);
    cy.setAllItemsFormallyOk(5);
    cy.approveAndCloseDesignAgenda(true);

    cy.visit('/dossiers/5F02E3F87DE3FC0008000002/deeldossiers');
    cy.get(cases.overviewSubcaseInfo.approved).should('have.length', 3);
    cy.openSubcase(2);
    cy.get(cases.subcaseDecidedOn).contains(dateFormatDotted);
  });
});
