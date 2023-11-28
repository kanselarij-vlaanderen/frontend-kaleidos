/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
// import mandatee from '../../selectors/mandatee.selectors';
import route from '../../selectors/route.selectors';
// import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

context('agenda minutes test', () => {
  const agendaDate = Cypress.dayjs().add(15, 'weeks')
    .day(6);
  const approvalTitle = 'Goedkeuring van het verslag van de vergadering van';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('Setup', () => {
    const caseTitle1 = `Cypress test: shortlist publications route case 1- ${currentTimestamp()}`;

    const type1 = 'Nota';
    const subcaseTitleShort1 = `Cypress test: subcase shortlist publications route subcase 1 - ${currentTimestamp()}`;
    const subcaseTitleLong1 = 'Cypress test voor shortlist publications route subcase 1';
    const subcaseType1 = 'Definitieve goedkeuring';
    const subcaseName1 = 'Goedkeuring na advies van de Raad van State';

    const files1 = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2024 0101 DOC.0001-1', fileType: 'BVR',
      }
    ];

    cy.createCase(caseTitle1);
    cy.addSubcase(type1, subcaseTitleShort1, subcaseTitleLong1, subcaseType1, subcaseName1);
    cy.openSubcase(0, subcaseTitleShort1);
    cy.addDocumentsToSubcase(files1);

    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort1);
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.generateDecision();
    cy.setAllItemsFormallyOk(2);
    cy.approveDesignAgenda();

    cy.openDetailOfAgendaitem(approvalTitle, false);
    cy.generateDecision();
    cy.intercept('POST', '/sign-flows*').as('postSignFlows1');
    cy.intercept('POST', '/sign-subcases*').as('postSignSubcases1');
    cy.intercept('POST', '/sign-marking-activities*').as('postSignMarkingActivities1');
    cy.get(document.documentCard.actions).click();
    cy.get(document.documentCard.signMarking).click();
    cy.wait('@postSignFlows1');
    cy.wait('@postSignSubcases1');
    cy.wait('@postSignMarkingActivities1');
  });

  it('should test that changes stay', () => {
    const extraPresident = 'Buddy Holly';
    const extraVicePresident = 'Richie Valens';
    const extraMinister = 'The Big Bopper';
    const extraSecretaris = 'Don Mclean';
    const extraGoedkeuring = 'the chevy';
    const extrabeslissing = 'The day the music died';
    const extraMededeling = 'Covered by Madonna';
    const newSecretary = 'Dries Verhaeghe';

    cy.openAgendaForDate(agendaDate);

    cy.get(agenda.agendaTabs.tabs).contains('Notulen')
      .click();
    // document card still loading
    cy.wait(2000);
    cy.get(route.agendaMinutes.create).click();
    cy.get(route.agendaMinutes.updateContent).click();

    // make a change to present
    cy.wait(6000);
    cy.get(dependency.rdfa.editorInner).find('p')
      .contains('Jan Jambon')
      .as('deMinistersPresidentParagraph');
    cy.get(dependency.rdfa.editorInner).find('p')
      .contains('Hilde Crevits')
      .as('deViceministerPresidentenParagraph');
    cy.get(dependency.rdfa.editorInner).find('p')
      .contains('Zuhal')
      .as('deVlaamseMinistersParagraph');
    cy.get(dependency.rdfa.editorInner).find('p')
      .contains('Jeroen Overmeer')
      .as('deSecretarisParagraph');
    cy.get(dependency.rdfa.editorInner).find('p')
      .contains('De Vlaamse Regering hecht haar goedkeuring aan het verslag')
      .as('goedkeuringParagraph');
    cy.get(dependency.rdfa.editorInner).find('p')
      .contains('Dit punt wordt')
      .as('beslissingParagraph');
    cy.get(dependency.rdfa.editorInner).find('p')
      .contains('De volgende vergadering van')
      .as('mededelingParagraph');

    cy.get('@deMinistersPresidentParagraph').type(`{home}${extraPresident}{shift+enter}`);
    cy.get('@deViceministerPresidentenParagraph').type(`{home}${extraVicePresident}{shift+enter}`);
    cy.get('@deVlaamseMinistersParagraph').type(`{home}${extraMinister}{shift+enter}`);
    cy.get('@deSecretarisParagraph').type(`{home}${extraSecretaris}{shift+enter}`);
    cy.get('@goedkeuringParagraph').type(`{home}${extraGoedkeuring}{shift+enter}`);
    cy.get('@beslissingParagraph').type(`{home}${extrabeslissing}{shift+enter}`);
    cy.get('@mededelingParagraph').type(`{home}${extraMededeling}{shift+enter}`);
    cy.wait(5000);
    cy.get(route.agendaMinutes.updateContent).click();
    cy.get('@deMinistersPresidentParagraph').contains(extraPresident);
    cy.get('@deViceministerPresidentenParagraph').contains(extraVicePresident);
    cy.get('@deVlaamseMinistersParagraph').contains(extraMinister);
    cy.get('@deSecretarisParagraph').contains(extraSecretaris);
    cy.get('@goedkeuringParagraph').should('not.contain', extraGoedkeuring);
    cy.get('@beslissingParagraph').should('not.contain', extrabeslissing);
    cy.get('@mededelingParagraph').contains(extraMededeling);

    cy.intercept('PATCH', '/minutes/*').as('patchMinutes');
    cy.intercept('POST', 'piece-parts').as('createNewPiecePart');
    cy.get(route.agendaMinutes.save).click();
    cy.wait('@patchMinutes');
    cy.wait('@createNewPiecePart');

    // change secretary
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.toggleEditingMeeting).forceClick();
    cy.get(agenda.editMeeting.secretary).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(newSecretary)
      .scrollIntoView()
      .trigger('mouseover')
      .click({
        force: true,
      });
    cy.intercept('PATCH', '/meetings/**').as('patchMeetings');
    cy.intercept('PATCH', '/internal-document-publication-activities/**').as('patchPublicationActivities');
    cy.intercept('PATCH', '/decision-activities/**').as('patchDecisionActivities');
    cy.get(agenda.editMeeting.save).click({
      force: true,
    });
    cy.wait('@patchMeetings');
    cy.wait('@patchPublicationActivities');
    cy.wait('@patchDecisionActivities');

    cy.get(route.agendaMinutes.currentPieceView).contains(extraPresident);
    cy.get(route.agendaMinutes.currentPieceView).contains(extraVicePresident);
    cy.get(route.agendaMinutes.currentPieceView).contains(extraMinister);
    cy.get(route.agendaMinutes.currentPieceView).should('not.contain', extraSecretaris);
    cy.get(route.agendaMinutes.currentPieceView).contains(newSecretary);
    cy.get(route.agendaMinutes.currentPieceView).should('not.contain', extrabeslissing);
    cy.get(route.agendaMinutes.currentPieceView).contains(extraMededeling);
  });
});
