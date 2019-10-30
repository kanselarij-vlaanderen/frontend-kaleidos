/* eslint-disable no-undef */
/// <reference types="Cypress" />


context('Case test', () => {

  const plusMonths = 1;
  const agendaDate = Cypress.moment().add('month', plusMonths).set('date', 5).set('hour', 20).set('minute', 20);

  before(() => {
    cy.server();
    cy.login('Admin');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');
    cy.logout();
  });

  beforeEach(() => {
    cy.server();
    cy.login('Admin');
  });

  it('should create a new case and add a subcase', () => {
    cy.route('GET', '/cases?**').as('getCases');
    cy.route('GET', '/subcases?**').as('getSubcases');
    cy.route('GET', '/mandatees?**').as('getMandatees');
    cy.route('GET', '/cases/**/subcases').as('getCaseSubcases');
    cy.route('PATCH','/subcases/*').as('patchSubcase');

    const caseTitleShort= 'Cypress test ' + currentTimestamp();
    const type= 'Nota';
    let newSubcaseTitleShort= caseTitleShort;
    const subcaseTitleLong= 'Cypress test voor het aanmaken van een dossier en procedurestap';
    const subcaseType='In voorbereiding';
    const subcaseName='Principiële goedkeuring m.h.o. op adviesaanvraag';

    cy.createCase(false, caseTitleShort);

    cy.addSubcase(type,newSubcaseTitleShort,subcaseTitleLong, subcaseType, subcaseName);
    
    cy.wait('@getSubcases', { timeout: 12000 });
    cy.get('.vlc-procedure-step').as('subcasesList');
    cy.get('@subcasesList').eq(0).within(() => {
      cy.get('.vl-title').click();
    })
    cy.wait('@getCaseSubcases', { timeout: 12000 });

    cy.changeSubcaseAccessLevel(false, caseTitleShort, true, 'Intern Overheid', newSubcaseTitleShort, 'Cypress test nieuwere lange titel');
    cy.addSubcaseThemes([0, 5 , 10]);
    cy.addSubcaseMandatee(1, 0, 0);
    cy.addSubcaseMandatee(2, 0, 0);

    cy.addDocuments([{folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2019 1111 DOC.0001/1', fileType: 'Nota'}]);

    cy.clickReverseTab('Overzicht');
    cy.proposeSubcaseForAgenda(agendaDate);

    cy.get('.vlc-status-timeline > li').eq(0).contains('Ingediend voor agendering');

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
    cy.contains(newSubcaseTitleShort).click();
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

  after(() => {
    cy.openAgendaForDate(agendaDate);
    cy.deleteAgenda(null,true); // approved agenda A (and therefore the meeting)
  });

});

const currentTimestamp = () => {
  return Cypress.moment().unix();
}