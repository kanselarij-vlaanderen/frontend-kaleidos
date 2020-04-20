/*global context, before, it, cy,beforeEach, Cypress*/
/// <reference types="Cypress" />



context('Subcase tests', () => {
  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 5).set('hour', 20).set('minute', 20);
  const caseTitle = 'Cypress test: subcases - ' + currentTimestamp();

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should open an existing case and add a subcase', () => {

    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: add subcase - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het aanmaken van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.createCase(false, caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.changeSubcaseAccessLevel(false, SubcaseTitleShort, true, 'Intern Overheid', SubcaseTitleShort, 'Cypress test nieuwere lange titel');
    cy.addSubcaseMandatee(1, 0, 0);
    cy.addSubcaseMandatee(2, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);

    const monthDutch = getTranslatedMonth(agendaDate.month());
    const dateFormat = agendaDate.date() + ' ' + monthDutch + ' ' + agendaDate.year();
    const dateRegex = new RegExp(".?"+Cypress.moment(agendaDate).date()+".\\w+."+Cypress.moment(agendaDate).year());

    cy.get('.vlc-status-timeline > li').eq(0).contains(/Ingediend voor agendering/);
    cy.get('.vl-description-data').within(() => {
      cy.get('.vl-description-data__value').as('descriptionValue');
      cy.get('@descriptionValue').eq(0).contains(/Nog geen nummer/);
      cy.get('@descriptionValue').eq(1).contains(/Ingediend voor de agenda van/);
      cy.get('@descriptionValue').eq(1).contains(dateRegex);
      cy.get('@descriptionValue').eq(2).contains(dateFormat);
      cy.get('@descriptionValue').eq(4).contains(/Nog niet beslist/);
      //TODO, know what minister we have selected for durable test.
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
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
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
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);
    cy.proposeSubcaseForAgenda(agendaDate);
    cy.get('.vl-button--icon-before')
    .contains('Acties')
    .click();
    cy.get('.vlc-dropdown-menu__item > .vl-link')
      .contains('Procedurestap verwijderen')
      .should("not.exist");
    });

    //TODO Yggdrasil needs to be triggered or default data needs to be available for minister
  xit('should be able to open a subcase with user profile: Minister', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: Non-editor profiles can open subcase - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het kunnen bekijken van een procedurestap door een ander profiel dan "editor" maar mag geen wijzigingen kunnen doen';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.openCase(caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
    cy.logout();
    cy.login('Minister');
    cy.openCase(caseTitle);
    cy.openSubcase(0);
    cy.url().should('contain', '/deeldossiers/');
    cy.url().should('contain', '/overzicht');
    cy.contains('Wijzigen').should('not.exist');
    cy.contains('Acties').should('not.exist');
    cy.contains('Indienen voor agendering').should('not.exist');
    cy.clickReverseTab('Documenten');
    cy.contains('Wijzigen').should('not.exist');
    cy.contains('Documenten toevoegen').should('not.exist');
    cy.contains('Reeds bezorgde documenten koppelen').should('not.exist');
  });

  it('Clickable link should go to the agenda right after proposing to agenda', () => {
    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: Link to agenda item ok - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor te klikken op de link naar agenda vanuit procedurestap' ;
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    cy.openCase(caseTitle);
    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
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
});

function currentTimestamp() {
  return Cypress.moment().unix();
}

function getTranslatedMonth(month) {
  switch(month) {
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
