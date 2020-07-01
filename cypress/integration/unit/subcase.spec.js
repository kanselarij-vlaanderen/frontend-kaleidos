/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';

context('Subcase tests', () => {
  const agendaDate = Cypress.moment().add(2, 'weeks').day(4); // Next friday
  const caseTitle = 'Cypress test: subcases - ' + currentTimestamp();
  const SubcaseTitleShort = 'Cypress test: add subcase - ' + currentTimestamp();

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createCase(false, caseTitle);
    cy.createAgenda('Elektronische procedure', agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
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
    cy.openCase(caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.changeSubcaseAccessLevel(false, SubcaseTitleShort, true, 'Intern Overheid', SubcaseTitleShort, 'Cypress test nieuwere lange titel');
    cy.addSubcaseMandatee(1, 0, 0, "Vlaams minister voor onderwijs");
    cy.addSubcaseMandatee(2, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);

    const monthDutch = getTranslatedMonth(agendaDate.month());
    const dateFormat = agendaDate.date() + ' ' + monthDutch + ' ' + agendaDate.year();
    const dateRegex = new RegExp(".?" + Cypress.moment(agendaDate).date() + ".\\w+." + Cypress.moment(agendaDate).year());

    cy.get('.vlc-status-timeline > li').eq(0).contains(/Ingediend voor agendering/);
    cy.get('.vl-description-data').within(() => {
      cy.get('.vl-description-data__value').as('descriptionValue');
      cy.get('@descriptionValue').eq(0).contains(/Nog geen nummer/);
      cy.get('@descriptionValue').eq(1).contains(/Ingediend voor de agenda van/);
      cy.get('@descriptionValue').eq(1).contains(dateRegex);
      cy.get('@descriptionValue').eq(2).contains(dateFormat);
      cy.get('@descriptionValue').eq(4).contains(/Nog niet beslist/);
      cy.get('@descriptionValue').eq(5).contains(/Hilde Crevits/);

    });

    cy.openAgendaForDate(agendaDate);
    cy.route('GET', '/cases/**/subcases').as('getCaseSubcases');
    cy.contains(SubcaseTitleShort).click();
    cy.get('.vlc-panel-layout__main-content').within(() => {
      cy.wait('@getCaseSubcases');
      cy.get('.vl-tab').as('agendaitemTabs');
      cy.get('@agendaitemTabs').eq(0).should('contain', 'Dossier').click();

      cy.get('.vlc-container').as('agendaitemContent');
      cy.get('@agendaitemContent').within(() => {
        cy.contains('Naar procedurestap').should('exist');
      })
    });
  });

  it('should add a subcase and then delete it', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: delete subcase - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het aanmaken en verwijderen van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.openCase(caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.deleteSubcase();
  });

  it('should not be able to delete a subcase with agendaitems', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: delete subcase not possible - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor niet kunnen verwijderen van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.openCase(caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);
    cy.get('.vl-button--icon-before')
      .contains('Acties')
      .click();
    cy.get('.vlc-dropdown-menu__item > .vl-link')
      .contains('Procedurestap verwijderen')
      .should("not.exist");
  });

  it('Clickable link should go to the agenda right after proposing to agenda', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: Link to agenda item ok - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor te klikken op de link naar agenda vanuit procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.openCase(caseTitle);
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);

    const monthDutch = getTranslatedMonth(agendaDate.month());
    const formattedDate = agendaDate.date() + ' ' + monthDutch + ' ' + agendaDate.year();

    cy.get('.vl-description-data').within(() => {
      cy.get('.vl-description-data__value').as('descriptionValue');
      cy.get('@descriptionValue').eq(2).contains(formattedDate);
      cy.get('@descriptionValue').eq(2).get('.vl-link').click();
    });
    cy.url().should('contain', '/agenda/');
    cy.url().should('contain', '/agendapunten/');
    cy.url().should('not.contain', '/dossier/');
  });

  it('Changes to agendaitem should propagate to subcase', () => {
    const type = 'Mededeling';
    const SubcaseTitleShort = 'Cypress test: Mededeling - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test doorstromen changes agendaitem to subcase';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    // Aanmaken Dossier

    cy.createCase(false, 'Cypress mededeling test');

    // Aanmaken subcase.
    cy.addSubcase(type, SubcaseTitleShort, subcaseTitleLong, subcaseType, subcaseName);

    // Aanmaken agendaItem
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(SubcaseTitleShort, false);
    cy.openAgendaItemDossierTab(SubcaseTitleShort);

    // Status is hidden
    cy.get(agenda.pillContainer).contains('Zichtbaar in kort bestek');
    cy.get(agenda.toProcedureStapLink).contains('Naar procedurestap').click();

    // Assert status also hidden
    cy.get(agenda.subcase.confidentialyCheck).should('not.be.checked');
    cy.route('PATCH','/agendaitems/*').as('patchAgendaitem');
    cy.changeSubcaseAccessLevel(true, SubcaseTitleShort, true, 'Intern Overheid') //CHECK na save in agendaitem
      .wait('@patchAgendaitem');

    cy.get(agenda.subcase.confidentialyCheck).should('be.checked');

    //"Go to agendaItem
    cy.route('GET', '/meetings/**').as('getMeetingsRequest');
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.get(agenda.subcase.agendaLink).click();
    cy.wait('@getMeetingsRequest');
    cy.wait('@getAgendas');
    cy.get(agenda.confidentialityIcon).should('be.visible');

    // Click the "wijzigen link.
    cy.get(agenda.item.editLink).click();

    // Check the checkbox (toggle this invisible motafoka).
    cy.get(agenda.agendaitemTitlesEditShowInNewsletter)
      .find(agenda.item.checkBoxLabel) // Because who uses checkboxes anyway?
      .click();

    // Save the changes setting
    cy.route('PATCH', '/agendas/**').as('patchAgenda');
    cy.get(agenda.item.actionButton).contains('Opslaan').click();
    cy.wait('@patchAgenda');

    // Assert status shown & confidentiality icon is visible
    cy.get(agenda.pillContainer).contains('Verborgen in kort bestek');

    // Check if saving on agendaitem did not trigger a change in confidentiality (came up during fixing)
    cy.get(agenda.confidentialityIcon).should('be.visible');

    cy.get(agenda.toProcedureStapLink).contains('Naar procedurestap').click();

    // Check if saving on agendaitem did not trigger a change in confidentiality (came up during fixing)
    cy.get(agenda.subcase.confidentialyCheck).should('be.checked');

  });


  it('Changes to agenda item Themas propagate properly', () => {

    // Open agenda
    cy.route('GET', '/agendas/**').as('getAgenda');
    cy.openAgendaForDate(agendaDate);
    cy.wait('@getAgenda');

    // Are there Themes in this agenda? Should be none
    cy.openAgendaItemKortBestekTab(SubcaseTitleShort);
    cy.get(agenda.item.themes).contains('Er zijn nog geen thema\'s toegevoegd.');

    // open themes ediging pane.
    cy.route('GET', '**/themes').as('getAgendaItemThemes');
    cy.get(agenda.item.news.editLink).click();
    cy.wait('@getAgendaItemThemes');

    // Toggle some themes.
    cy.get(agenda.item.news.themesSelector).contains('Wonen').click();
    cy.get(agenda.item.news.themesSelector).contains('Sport ').click();
    cy.get(agenda.item.news.themesSelector).contains('Toerisme ').click();
    cy.get(agenda.item.news.themesSelector).contains('Overheid ').click();
    cy.get(agenda.item.news.themesSelector).contains('Innovatie ').click();

    // Save this stuff.
    cy.route('PATCH', '/newsletter-infos/**').as('newsletterInfosPatch');
    cy.route('GET', '/newsletter-infos/**').as('newsletterInfosGet');
    cy.get(agenda.item.news.saveButton).click();
    cy.wait('@newsletterInfosPatch');
    cy.wait('@newsletterInfosGet');

    // Assert the save is done.
    cy.get(agenda.item.themes).contains('Wonen');
    cy.get(agenda.item.themes).contains('Sport');
    cy.get(agenda.item.themes).contains('Toerisme');
    cy.get(agenda.item.themes).contains('Overheid');
    cy.get(agenda.item.themes).contains('Innovatie');

    // Go via kort-bestek view
    cy.route('GET', '/meetings/**/mail-campaign').as('getMeetingsMail');
    cy.route('GET', '/meetings?**').as('getMeetingsfilter');
    cy.get('.vlc-toolbar').contains('Kort bestek').click();
    cy.wait('@getMeetingsMail');
    cy.wait('@getMeetingsfilter');

    cy.route('GET', '/meetings/**').as('getMeetingsDetail');
    //cy.route('GET', '/agendas**').as('getAgendas');
    cy.route('GET', '/agendaitems**').as('getAgendaItems');
    cy.get(agenda.dataTableZebra).contains('van ' + Cypress.moment(agendaDate).format('DD.MM.YYYY')).click();
    cy.wait('@getMeetingsDetail');
    //cy.wait('@getAgendas');
    cy.wait('@getAgendaItems');

    // open the themes editor.
    cy.route('GET', '**/themes').as('getKortBestekThemes');
    cy.get(agenda.dataTable).find('.vl-vi-pencil').first().click()
    cy.wait('@getKortBestekThemes');

    // Validate already inputted data.
    cy.get(agenda.item.news.checkedThemes).parent('label').contains('Wonen');
    cy.get(agenda.item.news.checkedThemes).parent('label').contains('Sport');
    cy.get(agenda.item.news.checkedThemes).parent('label').contains('Toerisme');
    cy.get(agenda.item.news.checkedThemes).parent('label').contains('Overheid');
    cy.get(agenda.item.news.checkedThemes).parent('label').contains('Innovatie');

    // uncheck 2
    cy.get(agenda.item.news.themesSelector).contains('Wonen').click();
    cy.get(agenda.item.news.themesSelector).contains('Toerisme').click();

    // check 3   others
    cy.get(agenda.item.news.themesSelector).contains('Jeugd').click();
    cy.get(agenda.item.news.themesSelector).contains('Cultuur').click();
    cy.get(agenda.item.news.themesSelector).contains('Media').click();


    // Save this stuff.
    //cy.route('GET', '**/document-versions?page*size*=9999').as('documentVersions');
    cy.route('PATCH', '/newsletter-infos/**').as('newsletterInfosPatch');
    cy.route('GET', '/newsletter-infos/**').as('newsletterInfosGet');
    cy.get(agenda.item.news.saveButton).click();
    //cy.wait('@documentVersions');
    cy.wait('@newsletterInfosPatch');
    cy.wait('@newsletterInfosGet');

    //dont open links in new windows.

    cy.get('a').invoke('removeAttr', 'target');
    cy.get(agenda.dataTable).find('[data-test-link-to-subcase-overview]').first().click();

    //"Go to agendaItem
    cy.route('GET', '/meetings/**').as('getMeetingsRequest');
    cy.route('GET', '/agendas/**').as('getAgendas');
    cy.get(agenda.subcase.agendaLink).click();
    cy.wait('@getMeetingsRequest');
    cy.wait('@getAgendas');

    cy.openAgendaItemKortBestekTab(SubcaseTitleShort);

    cy.get(agenda.item.themes).contains('Sport');
    cy.get(agenda.item.themes).contains('Overheid');
    cy.get(agenda.item.themes).contains('Innovatie');

    cy.get(agenda.item.themes).contains('Jeugd');
    cy.get(agenda.item.themes).contains('Cultuur');
    cy.get(agenda.item.themes).contains('Media');

    cy.get(agenda.item.themes).contains('Toerisme').should('not.exist');
    cy.get(agenda.item.themes).contains('Wonen').should('not.exist');
  });
});


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
      break;
  }
}
