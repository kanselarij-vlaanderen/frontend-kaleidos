/*global context, before, it, cy*/
/// <reference types="Cypress" />
import agenda from '../../selectors/agenda.selectors';
import actionModal from '../../selectors/action-modal.selectors';

context('Agendaitem changes tests', () => {

  before(() => {
    cy.server();
    cy.resetCache();
    cy.login('Admin');
    cy.visit('/');
  });

  it('should add an agendaitem to an agenda and should highlight as added', () => {
    const caseTitle = 'testId=' + currentTimestamp() + ': ' + 'Cypress test dossier 1';
    const plusMonths = 1;
    const agendaDate = currentMoment().add('month', plusMonths).set('date', 2).set('hour', 20).set('minute', 20);
    const subcaseTitle1 = caseTitle + ' test stap 1';
    const subcaseTitle2 = caseTitle + ' test stap 2';
    const file = {folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'test pdf', fileType: 'Nota'};
    const files = [file];
    cy.createCase(false, caseTitle);
    cy.addSubcase('Nota',
      subcaseTitle1,
      'Cypress test voor het testen van toegevoegde documenten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.addSubcase('Nota',
      subcaseTitle2,
      'Cypress test voor het testen van toegevoegde agendapunten',
      'In voorbereiding',
      'Principiële goedkeuring m.h.o. op adviesaanvraag');
    cy.createAgenda('Elektronische procedure', plusMonths, agendaDate, 'Zaal oxford bij Cronos Leuven');

    // when toggling show changes  the agendaitem with a document added should show
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitle1, false);

    cy.setFormalOkOnAllItems();
    cy.approveDesignAgenda();

    cy.addDocumentsToAgendaItem(subcaseTitle1, files);
    // TODO we should not have to "refresh" to see the changes. The checking for changes is set to an observer
    // TODO This observer is not triggering during initial opening of the agenda, so as a 'hack', we switch agendas to trigger it in the tests
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.toggleShowChanges(true);
    cy.agendaItemExists(subcaseTitle1);

    // when toggling show changes  the agendaitem added since current agenda should show
    cy.addAgendaitemToAgenda(subcaseTitle2, false);
    cy.toggleShowChanges(true);
    cy.agendaItemExists(subcaseTitle2);

    cy.setFormalOkOnAllItems();
    cy.approveDesignAgenda();

    // when toggling show changes  the agendaitem with a new document version should show
    cy.addNewDocumentVersionToAgendaItem(subcaseTitle1, file.newFileName , file);
    // TODO we should not have to "refresh" to see the changes. The checking for changes is set to an observer
    // TODO This observer is not triggering during initial opening of the agenda, so as a 'hack', we switch agendas to trigger it in the tests
    cy.changeSelectedAgenda('Ontwerpagenda');
    cy.toggleShowChanges(true);
    cy.agendaItemExists(subcaseTitle1);

    // when navigating to print view, should contain all relevant info
    cy.get(actionModal.showActionOptions).click();
    cy.get(agenda.navigateToPrintableAgenda).click();

    const monthDutch = getTranslatedMonth(agendaDate.month());
    const dateRegex = new RegExp('Vergadering van' + '.\\w+ ' + '.?'+ Cypress.moment(agendaDate).date() + " " + monthDutch + " " + Cypress.moment(agendaDate).year() + " om " + "20:20");

    cy.get(agenda.printHeaderTitle).should('exist').should('be.visible');
    cy.get(agenda.printHeaderTitle).contains(dateRegex);

    cy.get(agenda.printContainer).should('exist').should('be.visible');

    // this could fail with more or changed default data, you need at least 1 previous agenda when starting this test
    cy.get(agenda.printContainer).contains('Goedkeuring van het verslag van de vergadering van ');

    cy.get(agenda.printContainer).contains(subcaseTitle1);
    cy.get(agenda.printContainer).contains(subcaseTitle2);
    cy.get(agenda.printContainer).contains('Cypress test voor het testen van toegevoegde documenten');
  });
});

function currentMoment() {
  return Cypress.moment();
}

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
