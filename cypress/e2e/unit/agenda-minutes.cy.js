/* global context, it, cy, beforeEach, afterEach, Cypress */
// / <reference types='Cypress' />

import agenda from '../../selectors/agenda.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import dependency from '../../selectors/dependency.selectors';
import document from '../../selectors/document.selectors';
// import mandatee from '../../selectors/mandatee.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';
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
    const agendaDateFormatted = agendaDate.format('DD-MM-YYYY');
    const caseTitle1 = `Cypress test: agenda minutes case 1 - ${currentTimestamp()}`;

    const type1 = 'Nota';
    const subcaseTitleShort1 = `Cypress test: agenda minutes subcase 1 - ${currentTimestamp()}`;
    const subcaseTitleLong1 = 'Cypress test voor agenda minutes subcase 1';
    const subcaseType1 = 'Definitieve goedkeuring';
    const subcaseName1 = 'Goedkeuring na advies van de Raad van State';

    const files1 = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2024 0101 DOC.0001-1', fileType: 'BVR',
      }
    ];

    cy.createAgenda('Ministerraad', agendaDate);

    cy.createCase(caseTitle1);
    cy.addSubcaseViaModal({
      agendaitemType: type1,
      newShortTitle: subcaseTitleShort1,
      longTitle: subcaseTitleLong1,
      subcaseType: subcaseType1,
      subcaseName: subcaseName1,
      documents: files1,
      agendaDate: agendaDateFormatted,
    });

    cy.openAgendaForDate(agendaDate);
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
    const newSecretary = mandateeNames.current.secondSecretary.fullName;

    cy.openAgendaForDate(agendaDate);

    cy.get(agenda.agendaTabs.tabs).contains('Notulen')
      .click();
    // document card still loading
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(route.agendaMinutes.createEdit).click();
    cy.get(route.agendaMinutes.editor.updateContent).click();

    cy.get(appuniversum.loader).should('not.exist');
    // make a change to present
    cy.get(dependency.rdfaEditor.inner).find('p')
      .contains(mandateeNames.current.first.fullName)
      .as('deMinistersPresidentParagraph');
    cy.get(dependency.rdfaEditor.inner).find('p')
      .contains(mandateeNames.current.second.fullName)
      .as('deViceministerPresidentenParagraph');
    cy.get(dependency.rdfaEditor.inner).find('p')
      .contains(mandateeNames.current.fifth.fullName)
      .as('deVlaamseMinistersParagraph');
    cy.get(dependency.rdfaEditor.inner).find('p')
      .contains(mandateeNames.current.firstSecretary.fullName)
      .as('deSecretarisParagraph');
    cy.get(dependency.rdfaEditor.inner).find('p')
      .contains('De Vlaamse Regering hecht haar goedkeuring aan het verslag')
      .as('goedkeuringParagraph');
    cy.get(dependency.rdfaEditor.inner).find('p')
      .contains('Dit punt wordt')
      .as('beslissingParagraph');
    cy.get(dependency.rdfaEditor.inner).find('p')
      .contains('De volgende vergadering van')
      .as('mededelingParagraph');

    cy.get('@deMinistersPresidentParagraph').type(`{home}${extraPresident}{shift+enter}`);
    cy.get('@deViceministerPresidentenParagraph').type(`{home}${extraVicePresident}{shift+enter}`);
    cy.get('@deVlaamseMinistersParagraph').type(`{home}${extraMinister}{shift+enter}`);
    cy.get('@deSecretarisParagraph').type(`{home}${extraSecretaris}{shift+enter}`);
    cy.get('@goedkeuringParagraph').type(`{home}${extraGoedkeuring}{shift+enter}`);
    cy.get('@beslissingParagraph').type(`{home}${extrabeslissing}{shift+enter}`);
    cy.get('@mededelingParagraph').type(`{home}${extraMededeling}{shift+enter}`);

    // update should not update mandatee sections
    cy.get(route.agendaMinutes.editor.updateContent).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get('@deMinistersPresidentParagraph').contains(extraPresident);
    cy.get('@deViceministerPresidentenParagraph').contains(extraVicePresident);
    cy.get('@deVlaamseMinistersParagraph').contains(extraMinister);
    cy.get('@deSecretarisParagraph').contains(extraSecretaris);
    cy.get('@goedkeuringParagraph').should('not.contain', extraGoedkeuring);
    cy.get('@beslissingParagraph').should('not.contain', extrabeslissing);
    cy.get('@mededelingParagraph').contains(extraMededeling);

    cy.intercept('PATCH', '/minutes/*').as('patchMinutes');
    cy.intercept('POST', 'piece-parts').as('createNewPiecePart');
    cy.get(route.agendaMinutes.editor.save).click();
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
