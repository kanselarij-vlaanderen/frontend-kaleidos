/* eslint-disable no-undef */
/// <reference types="Cypress" />


context('Subcase tests', () => {

  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 5).set('hour', 20).set('minute', 20);
  const caseTitle = 'Cypress test: subcases - ' + currentTimestamp();

  before(() => {
    cy.server();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.createCase(false, caseTitle);
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should open an existing case and add a subcase', () => {
    cy.route('GET', '/cases/**/subcases').as('getCaseSubcases');

    const type = 'Nota';
    const SubcaseTitleShort = 'Cypress test: add subcase - ' + currentTimestamp();
    const subcaseTitleLong = 'Cypress test voor het aanmaken van een procedurestap';
    const subcaseType = 'In voorbereiding';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.openCase(caseTitle);

    cy.addSubcase(type,SubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
    cy.openSubcase(0);

    cy.changeSubcaseAccessLevel(false, SubcaseTitleShort, true, 'Intern Overheid', SubcaseTitleShort, 'Cypress test nieuwere lange titel');
    cy.addSubcaseThemes([0, 5 , 10]);
    cy.addSubcaseMandatee(1, 0, 0);
    cy.addSubcaseMandatee(2, 0, 0);

    cy.proposeSubcaseForAgenda(agendaDate);

    const dateFormat = Cypress.moment(agendaDate).format('DD.MM.YYYY');
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
    cy.get('.vl-popover__link-list__item > .vl-link')
      .contains('Procedurestap verwijderen')
      .should("not.exist");
    });

  after(() => {
    cy.openAgendaForDate(agendaDate);
    cy.deleteAgenda(null,true); // approved agenda A (and therefore the meeting)
  });
  
});
  
function currentTimestamp() {
  return Cypress.moment().unix();
}