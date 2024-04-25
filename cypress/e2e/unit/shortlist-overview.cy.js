/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import dependency from '../../selectors/dependency.selectors';
import agenda from '../../selectors/agenda.selectors';
import publication from '../../selectors/publication.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import document from '../../selectors/document.selectors';
import settings from '../../selectors/settings.selectors';
import mandatee from '../../selectors/mandatee.selectors';
import route from '../../selectors/route.selectors';
import signature from '../../selectors/signature.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';

import utils from '../../selectors/utils.selectors';

function currentTimestamp() {
  return Cypress.dayjs().unix();
}

function createPublicationViaMR(subcaseTitle, fileName, publicationNumber) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.openAgendaitemDocumentTab(subcaseTitle);
  cy.get(route.agendaitemDocuments.openPublication).click();
  cy.get(publication.batchDocumentsPublicationRow.name).contains(fileName)
    .parent()
    .find(publication.batchDocumentsPublicationRow.new)
    .click();

  // create new publication
  cy.get(publication.newPublication.number).click()
    .clear()
    .type(publicationNumber);
  cy.intercept('POST', '/publication-flows').as(`createNewPublicationFlow${randomInt}`);
  // more posts happen, but the patch is the final part of the create action
  cy.intercept('PATCH', '/pieces/**').as(`patchPieceForPublication${randomInt}`);
  cy.get(publication.newPublication.create).click();
  cy.wait(`@createNewPublicationFlow${randomInt}`);
  cy.wait(`@patchPieceForPublication${randomInt}`);
}

context('signatures shortlist overview tests', () => {
  const caseTitle1 = `Cypress test: shortlist signatures route case 1- ${currentTimestamp()}`;
  const caseTitle2 = `Cypress test: shortlist signatures route case 2- ${currentTimestamp()}`;
  const caseTitle3 = `Cypress test: shortlist signatures route case 3- ${currentTimestamp()}`;

  const type1 = 'Nota';
  const subcaseTitleShort1 = `Cypress test: subcase shortlist signatures route subcase 1 - ${currentTimestamp()}`;
  const subcaseTitleLong1 = 'Cypress test voor shortlist signatures route subcase 1';
  const subcaseType1 = 'Definitieve goedkeuring';
  const subcaseName1 = 'Goedkeuring na advies van de Raad van State';

  const type2 = 'Nota';
  const subcaseTitleShort2 = `Cypress test: subcase shortlist signatures route subcase 2 - ${currentTimestamp()}`;
  const subcaseTitleLong2 = 'Cypress test voor shortlist signatures route subcase 2';
  const subcaseType2 = 'Definitieve goedkeuring';
  const subcaseName2 = 'Goedkeuring na adviezen';

  const type3 = 'Mededeling';
  const subcaseTitleShort3 = `Cypress test: subcase shortlist signatures route subcase 3 - ${currentTimestamp()}`;
  const subcaseTitleLong3 = 'Cypress test voor shortlist signatures route subcase 3';
  const subcaseType3 = 'Definitieve goedkeuring';
  const subcaseName3 = 'Goedkeuring na adviezen';

  const files1 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2023 0504 DOC.0001-1', fileType: 'BVR',
    }
  ];

  const files2 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2023 0504 DOC.0001-2', fileType: 'BVR',
    }
  ];

  const files3 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2023 0504 DOC.0001-3', fileType: 'BVR',
    }
  ];

  const agendaDate = Cypress.dayjs().add(15, 'weeks')
    .day(5);

  const primeMandatee = mandateeNames.current.first;
  const mandatee1 = mandateeNames.current.third; // 'Gwendolyn Rutten'
  const mandatee2 = mandateeNames.current.fourth; // 'Ben Weyts';
  const mandatee3 = mandateeNames.current.fifth; // 'Zuhal Demir'

  const approverEmail = 'approver@test.com';
  const notificationEmail = 'notification@test.com';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('setup', () => {
    cy.createCase(caseTitle1);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: type1,
      newShortTitle: subcaseTitleShort1,
      longTitle: subcaseTitleLong1,
      subcaseType: subcaseType1,
      subcaseName: subcaseName1,
      documents: files1,
    });
    cy.createCase(caseTitle2);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: type2,
      newShortTitle: subcaseTitleShort2,
      longTitle: subcaseTitleLong2,
      subcaseType: subcaseType2,
      subcaseName: subcaseName2,
      documents: files2,
    });

    cy.createCase(caseTitle3);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: type3,
      newShortTitle: subcaseTitleShort3,
      longTitle: subcaseTitleLong3,
      subcaseType: subcaseType3,
      subcaseName: subcaseName3,
      documents: files3,
    });

    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);

    cy.addAgendaitemToAgenda(subcaseTitleShort1);
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.changeDecisionResult('Goedgekeurd');

    cy.addAgendaitemToAgenda(subcaseTitleShort2);
    cy.openDetailOfAgendaitem(subcaseTitleShort2);
    cy.changeDecisionResult('Goedgekeurd');

    cy.addAgendaitemToAgenda(subcaseTitleShort3);
    cy.openDetailOfAgendaitem(subcaseTitleShort3);
    cy.changeDecisionResult('Goedgekeurd');

    cy.setAllItemsFormallyOk(4);
    cy.approveDesignAgenda();

    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.addAgendaitemMandatee(mandatee1);
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.actions).click();
    cy.intercept('POST', '/sign-flows').as('postSignFlows1');
    cy.intercept('POST', '/sign-subcases').as('postSignSubcases1');
    cy.get(document.documentCard.signMarking).click()
      .wait('@postSignFlows1')
      .wait('@postSignSubcases1');
    cy.get(auk.loader).should('not.exist', {
      timeout: 60000,
    });
    cy.openDetailOfAgendaitem(subcaseTitleShort2);
    cy.addAgendaitemMandatee(mandatee2);
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.actions).click();
    cy.intercept('POST', '/sign-flows').as('postSignFlows2');
    cy.intercept('POST', '/sign-subcases').as('postSignSubcases2');
    cy.get(document.documentCard.signMarking).click()
      .wait('@postSignFlows2')
      .wait('@postSignSubcases2');
    cy.get(auk.loader).should('not.exist', {
      timeout: 60000,
    });
    cy.openDetailOfAgendaitem(subcaseTitleShort3);
    cy.addAgendaitemMandatee(mandatee3);
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.actions).click();
    cy.intercept('POST', '/sign-flows').as('postSignFlows3');
    cy.intercept('POST', '/sign-subcases').as('postSignSubcases3');
    cy.get(document.documentCard.signMarking).click()
      .wait('@postSignFlows3')
      .wait('@postSignSubcases3');
    cy.get(auk.loader).should('not.exist', {
      timeout: 60000,
    });

    cy.setAllItemsFormallyOk(3);
    cy.approveAndCloseDesignAgenda();
    cy.releaseDecisions();
    cy.wait(60000); // shortlist not always found
  });

  it('should check the signatures overview', () => {
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.get(utils.mHeader.signatures).click()
      .wait('@getShortlist1');

    cy.get(route.signatures.row.mandatee).contains(mandatee1.fullName)
      .parent()
      .as('currentDoc');

    cy.get('@currentDoc').find(route.signatures.row.name)
      .invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'document');
    cy.get(document.previewDetailsTab.name).children('div.auk-key-value-item__value')
      .contains(files1[0].newFileName);
    cy.go('back');

    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();
    cy.get(route.signatures.sidebar.close);
    // clicking it again should not close the sidebar (so close button should still be visible and clickable)
    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click({
        force: true,
      });
    cy.get(route.signatures.sidebar.close).click();
    cy.get(route.signatures.sidebar.close).should('not.exist');
  });

  it('should check the signatures overview mandatee filter', () => {
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.get(utils.mHeader.signatures).click()
      .wait('@getShortlist1', {
        timeout: 60000,
      });

    // no filters (all mandatees)
    cy.get(route.signatures.row.mandatee).contains(mandatee1.fullName);
    cy.get(route.signatures.row.mandatee).contains(mandatee2.fullName);
    cy.get(route.signatures.row.mandatee).contains(mandatee3.fullName);

    // filter nonexistent
    cy.get(route.signatures.openMinisterFilter).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(appuniversum.checkbox).contains(primeMandatee.fullName)
      .click();
    cy.intercept('GET', '/sign-flows*').as('getShortlist2');
    cy.get(route.signatures.applyFilter).click()
      .wait('@getShortlist2');
    cy.get(route.signatures.dataTable).contains('Geen resultaten gevonden');

    // filter one
    cy.get(route.signatures.openMinisterFilter).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(appuniversum.checkbox).contains(mandatee1.fullName)
      .click();
    cy.intercept('GET', '/sign-flows*').as('getShortlist3');
    cy.get(route.signatures.applyFilter).click()
      .wait('@getShortlist3');
    cy.get(route.signatures.row.mandatee).contains(mandatee1.fullName);
    cy.get(route.signatures.row.mandatee).should('not.contain', mandatee2.fullName);
    cy.get(route.signatures.row.mandatee).should('not.contain', mandatee3.fullName);

    // filter two
    cy.get(route.signatures.openMinisterFilter).click();
    cy.get(appuniversum.loader).should('not.exist', {
      timeout: 60000,
    });
    cy.get(appuniversum.checkbox).contains(mandatee2.fullName)
      .click();
    cy.intercept('GET', '/sign-flows*').as('getShortlist4');
    cy.get(route.signatures.applyFilter).click()
      .wait('@getShortlist4');
    cy.get(route.signatures.row.mandatee).contains(mandatee1.fullName);
    cy.get(route.signatures.row.mandatee).contains(mandatee2.fullName);

    cy.get(route.signatures.row.mandatee).should('not.contain', mandatee3.fullName);

    // filter all
    cy.get(route.signatures.openMinisterFilter).click();
    cy.get(auk.loader).should('not.exist');
    cy.get(appuniversum.checkbox).contains(mandatee3.fullName)
      .click();
    cy.intercept('GET', '/sign-flows*').as('getShortlist4');
    cy.get(route.signatures.applyFilter).click()
      .wait('@getShortlist4');
    cy.get(route.signatures.row.mandatee).contains(mandatee1.fullName);
    cy.get(route.signatures.row.mandatee).contains(mandatee2.fullName);
    cy.get(route.signatures.row.mandatee).contains(mandatee3.fullName);
  });

  it('should check the signatures overview sidebar', () => {
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.get(utils.mHeader.signatures).click()
      .wait('@getShortlist1');

    cy.get(route.signatures.row.mandatee).contains(mandatee1.fullName)
      .parent()
      .as('currentDoc');

    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();

    // check info
    cy.get(route.signatures.sidebar.info).contains(files1[0].fileType);
    cy.get(route.signatures.sidebar.info).contains(files1[0].newFileName);
    cy.get(route.signatures.sidebar.info).contains(agendaDate.format('DD-MM-YYYY'));

    // check preview
    cy.get(route.signatures.sidebar.preview).invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'document');
    cy.go('back');
    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();
    // check last agendaitem
    cy.get(route.signatures.sidebar.lastAgendaitem).invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'agendapunten');
    cy.get(agenda.agendaSideNav.agendaName).contains('B')
      .parents('li')
      .invoke('attr', 'class')
      .should('include', 'auk-sidebar__item--active');
    cy.go('back');
    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();

    // check default signers
    cy.get(signature.createSignFlow.signers.item, {
      timeout: 60000,
    }).eq(0)
      .contains(primeMandatee.fullName);
    cy.get(signature.createSignFlow.signers.item).eq(1)
      .contains(mandatee1.fullName);
    // remove signer with button
    cy.get(signature.createSignFlow.signers.remove).eq(1)
      .click();
    cy.get(signature.createSignFlow.signers.item).eq(1)
      .should('not.exist');
    // add signer
    cy.get(signature.createSignFlow.signers.edit).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(mandatee.mandateeCheckboxList).find(appuniversum.checkbox)
      .contains(mandatee1.fullName)
      .scrollIntoView()
      .click();
    cy.get(signature.selectMinisters.apply).click();
    cy.get(signature.createSignFlow.signers.item).eq(1)
      .contains(mandatee1.fullName);
    // remove signer with edit
    cy.get(signature.createSignFlow.signers.edit).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(mandatee.mandateeCheckboxList).find(appuniversum.checkbox)
      .contains(mandatee1.fullName)
      .scrollIntoView()
      .click();
    cy.get(signature.selectMinisters.apply).click();
    cy.get(signature.createSignFlow.signers.item).eq(1)
      .should('not.exist');

    // check that there's only current ministers
    cy.get(signature.createSignFlow.signers.edit).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(mandatee.mandateeCheckboxList).find(appuniversum.checkbox)
      .should('have.length', 9);
    mandateeNames.current.signatureTitles.forEach((minister) => {
      cy.get(appuniversum.checkbox).contains(minister);
    });
    cy.get(auk.modal.footer.cancel).click();

    // add approver
    cy.get(signature.createSignFlow.approvers.add).click();
    cy.get(signature.email.input).type(approverEmail);
    cy.get(signature.email.add).click();
    cy.get(signature.createSignFlow.approvers.item).contains(approverEmail);
    // remove approver
    cy.get(signature.createSignFlow.approvers.remove).click();
    cy.get(signature.createSignFlow.approvers.item).should('not.exist');

    // add notification adress
    cy.get(signature.createSignFlow.notificationAdresses.add).click();
    cy.get(signature.email.input).type(notificationEmail);
    cy.get(signature.email.add).click();
    cy.get(signature.createSignFlow.notificationAdresses.item).contains(notificationEmail);
    // remove notification adress
    cy.get(signature.createSignFlow.notificationAdresses.remove).click();
    cy.get(signature.createSignFlow.notificationAdresses.item).should('not.exist');

    // start signflow
    // cy.get(route.signatures.sidebar.startSignflow).click();
    // cy.wait(5000);

    // no email set
    // TODO this fails, is there an email for primeMandatee in the testdata?
    // cy.get(route.signatures.sidebar.startSignflow).should('be.disabled');
  });

  it('check dossierbeheerder add one minister', () => {
    // setup: add minister to dossierbeheerder
    cy.visit('instellingen/organisaties/40df7139-fdfb-4ab7-92cd-e73ceba32721');
    cy.get(settings.organization.technicalInfo.showSelectMandateeModal).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(mandatee1.fullName)
      .scrollIntoView()
      .click();
    cy.intercept('PATCH', '/user-organizations/**').as('patchUserOrganizations');
    cy.get(utils.mandateesSelector.add).should('not.be.disabled')
      .click();
    cy.wait('@patchUserOrganizations');

    cy.logout();
    cy.login('Kabinetdossierbeheerder');

    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.get(utils.mHeader.signatures).click()
      .wait('@getShortlist1');

    cy.get(route.signatures.row.mandatee).contains(mandatee1.fullName);
    cy.get(route.signatures.row.mandatee).should('have.length', 1);
  });

  it('check dossierbeheerder add second minister', () => {
    // setup: add minister to dossierbeheerder
    cy.visit('instellingen/organisaties/40df7139-fdfb-4ab7-92cd-e73ceba32721');
    cy.get(settings.organization.technicalInfo.showSelectMandateeModal).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(utils.mandateeSelector.container).click();
    cy.get(dependency.emberPowerSelect.optionLoadingMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.optionTypeToSearchMessage).should('not.exist');
    cy.get(dependency.emberPowerSelect.option).contains(mandatee2.fullName)
      .scrollIntoView()
      .click();
    cy.intercept('PATCH', '/user-organizations/**').as('patchUserOrganizations');
    cy.get(utils.mandateesSelector.add).should('not.be.disabled')
      .click();
    cy.wait('@patchUserOrganizations');
    cy.wait(2000);

    cy.logout();
    cy.login('Kabinetdossierbeheerder');
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.get(utils.mHeader.signatures).click()
      .wait('@getShortlist1');

    cy.get(route.signatures.row.mandatee).contains(mandatee1.fullName);
    cy.get(route.signatures.row.mandatee).contains(mandatee2.fullName);
    cy.get(route.signatures.row.mandatee).should('have.length', 2);
  });

  it('check starting/stopping signflow', () => {
    const staticResponse = {
      statusCode: 200,
      ok: true,
    };

    cy.visit('ondertekenen/opstarten');

    cy.get(route.signatures.row.name).contains(files1[0].newFileName)
      .parents('tr')
      .as('currentDoc');

    // ** start signflow **

    // check fail
    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();
    cy.get(signature.createSignFlow.signers.item); // wait for signers to load

    // add approver
    cy.get(signature.createSignFlow.approvers.add).click();
    cy.get(signature.email.input).type(approverEmail);
    cy.get(signature.email.add).click();
    cy.get(signature.createSignFlow.approvers.item).contains(approverEmail);

    cy.intercept('POST', '/sign-signing-activities').as('postSigningActivities');
    cy.intercept('PATCH', '/sign-subcases/**').as('patchSignSubcases');
    cy.intercept('PATCH', '/sign-flows/**').as('patchSignFlows');
    cy.intercept('POST', '/signing-flows/update-to-signinghub', {
      forceNetworkError: true,
    }).as('updateToSigningHubError');
    // no email set so forcing through disabled button
    cy.get(route.signatures.sidebar.startSignflow).invoke('removeAttr', 'disabled')
      .click();
    cy.wait('@postSigningActivities');
    cy.wait('@patchSignSubcases');
    cy.wait('@patchSignFlows');
    cy.get(appuniversum.toaster).find(appuniversum.alert.close)
      .click();

    // TODO test error `cy.parents()` failed because it requires a DOM element or document.
    cy.visit('ondertekenen/opstarten');
    // check succes
    cy.get(route.signatures.row.name).contains(files1[0].newFileName)
      .parents('tr')
      .as('currentDoc');
    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();
    cy.get(signature.createSignFlow.signers.item); // wait for signers to load

    cy.intercept('POST', '/sign-signing-activities').as('postSigningActivities2');
    cy.intercept('PATCH', '/sign-subcases/**').as('patchSignSubcases2');
    cy.intercept('PATCH', '/sign-flows/**').as('patchSignFlows2');
    cy.intercept('POST', '/signing-flows/upload-to-signinghub', staticResponse).as('stubUpload');
    // no email set so forcing through disabled button
    cy.get(route.signatures.sidebar.startSignflow).invoke('removeAttr', 'disabled')
      .click();
    cy.wait('@postSigningActivities2');
    cy.wait('@patchSignSubcases2');
    cy.wait('@patchSignFlows2');

    // this works because signflow-status-sync service is not active.
    // Normally the status becomes 'Marked' because there is no preparation-activity created.
    cy.visit('ondertekenen/opvolgen');
    cy.get(route.ongoing.row.documentName).contains(files1[0].newFileName);

    // ** stop signflow **

    cy.visit('ondertekenen/opstarten');
    cy.get(route.signatures.row.name).contains(files2[0].newFileName)
      .parents('tr')
      .as('currentDoc');

    // check succes
    cy.get('@currentDoc').find(route.signatures.row.openSidebar)
      .click();

    cy.intercept('DELETE', '/signing-flows/**').as('deleteSignFlows'); // service call
    cy.get(route.signatures.sidebar.stopSignflow).click();
    cy.wait('@deleteSignFlows');
    // table currently empty at this point, but could contain more data in the future
    // cy.get(route.signatures.row.name).should('not.contain', files2[0].newFileName);
  });

  it('remove mandatees from organisation', () => {
    cy.visit('instellingen/organisaties/40df7139-fdfb-4ab7-92cd-e73ceba32721');
    // unlink first mandatee
    cy.intercept('PATCH', '/user-organizations/**').as('patchorgs');
    cy.get(settings.organization.technicalInfo.row.unlinkMandatee).eq(0)
      .click();
    cy.get(settings.organization.confirm.unlinkMandatee).click()
      .wait('@patchorgs');
    // unlink second mandatee
    cy.get(settings.organization.technicalInfo.row.unlinkMandatee).eq(0)
      .click();
    cy.get(settings.organization.confirm.unlinkMandatee).click()
      .wait('@patchorgs');
    cy.get(settings.organization.technicalInfo.row.mandatee).should('not.exist');
  });

  it('retracting subcase removes sign-marking option', () => {
    // retract subcase (and check delete calls)
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(subcaseTitleShort3);
    cy.get(agenda.agendaitemNav.decisionTab).click();
    cy.get(agenda.decisionResultPill.edit).click();
    cy.get(agenda.agendaitemDecisionEdit.resultContainer).within(() => {
      cy.get(dependency.emberPowerSelect.trigger).scrollIntoView()
        .click();
    });
    cy.get(dependency.emberPowerSelect.option).contains('Ingetrokken')
      .scrollIntoView();
    cy.intercept('DELETE', '/signing-flows/**').as('deleteSigningFlows');
    cy.get(agenda.agendaitemDecisionEdit.save).click()
      .wait('@deleteSigningFlows');

    // check that sign-marking is impossible
    cy.get(agenda.agendaitemNav.documentsTab).click();
    cy.get(document.documentCard.actions).click();
    cy.get(document.documentCard.signMarking).should('be.disabled');
    cy.get(route.agendaitemDocuments.batchEdit).click();
    cy.get(document.documentDetailsRow.markedForSignature).should('be.disabled');
    cy.get(auk.modal.header.close).click();
    // check that alertmessage contains 'ingetrokken'
    cy.get(document.documentCard.name.value).contains(files3[0].newFileName)
      .invoke('removeAttr', 'target')
      .click();
    cy.get(document.documentPreviewSidebar.tabs.signatures).click();
    cy.get(appuniversum.alert.message).contains('ingetrokken');
  });
});

context('publications shortlist overview tests', () => {
  const caseTitle1 = `Cypress test: shortlist publications route case 1- ${currentTimestamp()}`;
  const caseTitle2 = `Cypress test: shortlist publications route case 2- ${currentTimestamp()}`;

  const type1 = 'Nota';
  const subcaseTitleShort1 = `Cypress test: subcase shortlist publications route subcase 1 - ${currentTimestamp()}`;
  const subcaseTitleLong1 = 'Cypress test voor shortlist publications route subcase 1';
  const subcaseType1 = 'Definitieve goedkeuring';
  const subcaseName1 = 'Goedkeuring na advies van de Raad van State';

  const type2 = 'Nota';
  const subcaseTitleShort2 = `Cypress test: subcase shortlist publications route subcase 2 - ${currentTimestamp()}`;
  const subcaseTitleLong2 = 'Cypress test voor shortlist publications route subcase 2';
  const subcaseType2 = 'Bekrachtiging en afkondiging';
  const subcaseName2 = 'Goedkeuring na adviezen';

  const files1 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'BVR',
    }
  ];

  const files2 = [
    {
      folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet',
    }
  ];

  const publicationNumber1 = 1123;
  const publicationNumber2 = 1124;

  const fields = {
    number: publicationNumber2,
    shortTitle: 'Some text',
    longTitle: 'Some text',
  };
  const agendaDate = Cypress.dayjs().add(16, 'weeks')
    .day(6);

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('setup', () => {
    cy.createCase(caseTitle1);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: type1,
      newShortTitle: subcaseTitleShort1,
      longTitle: subcaseTitleLong1,
      subcaseType: subcaseType1,
      subcaseName: subcaseName1,
      documents: files1,
    });
    cy.createCase(caseTitle2);
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: type2,
      newShortTitle: subcaseTitleShort2,
      longTitle: subcaseTitleLong2,
      subcaseType: subcaseType2,
      subcaseName: subcaseName2,
      documents: files2,
      ratification: true,
    });

    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(subcaseTitleShort1);
    cy.openDetailOfAgendaitem(subcaseTitleShort1);
    cy.changeDecisionResult('Goedgekeurd');
    cy.addAgendaitemToAgenda(subcaseTitleShort2);
    cy.openDetailOfAgendaitem(subcaseTitleShort2);
    cy.changeDecisionResult('Goedgekeurd');
    cy.get(appuniversum.loader).should('not.exist');
  });

  it('should check the shortlist overview', () => {
    // check if both docs show correctly
    cy.get(utils.mHeader.publications).click();
    cy.get(publication.publicationsIndex.tabs.shortlist).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(publication.shortlist.row.documentName).contains(files1[0].newFileName)
      .parents('tr')
      .as('doc1');
    cy.get(publication.shortlist.row.documentName).contains(files2[0].newFileName)
      .parents('tr')
      .as('doc2');
    cy.get('@doc1').find(publication.shortlist.row.documentType)
      .contains(files1[0].fileType);
    cy.get('@doc2').find(publication.shortlist.row.documentType)
      .contains(files2[0].fileType);

    cy.openAgendaForDate(agendaDate);
    createPublicationViaMR(subcaseTitleShort1, files1[0].newFileName, publicationNumber1);

    // check if doc1 is no longer visible and create publication for doc2
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(auk.modal.header.close).click();
    cy.get(utils.mHeader.publications).click();
    cy.get(publication.publicationsIndex.tabs.shortlist).click();
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(publication.shortlist.row.documentName).should('not.contain', files1[0].newFileName);
    cy.get('@doc2').find(publication.shortlist.row.openNewPublication)
      .click();
    cy.fillInNewPublicationFields(fields);
    // cy.intercept('POST', '/cases').as('createNewCase');
    cy.intercept('POST', '/publication-flows').as('createNewPublicationFlow');
    cy.intercept('GET', '/publication-flows/shortlist').as('getShortlist');
    cy.get(publication.newPublication.create).click()
      // .wait('@createNewCase')
      .wait('@createNewPublicationFlow');
    // check if doc2 is no longer visible
    cy.wait('@getShortlist');
    cy.get(appuniversum.loader).should('not.exist');
    // different table when signature data is enabled.
    cy.get(publication.shortlist.row.documentName).should('not.contain', files2[0].newFileName);
    // cy.get(publication.shortlist.table).contains('Geen resultaten gevonden');
  });
});

context('decisions and minutes shortlist overview tests', () => {
  const agendaDate = Cypress.dayjs().add(15, 'weeks')
    .day(5);
  const approvalTitle = 'Goedkeuring van het verslag van de vergadering van';
  let decisionTitle;
  const pieceTypeDecision = 'BF';
  const pieceTypeMinutes = 'Notulen';
  let minutesTitle;

  const defaultSecretary = 'Jeroen Overmeer';
  const newSecretary = 'Joachim Pohlmann';

  const alertMessage = 'De geselecteerde documenten hebben verschillende secretarissen. Kaleidos kan de namen van de ondertekenaars niet automatisch invullen.';

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('setup', () => {
    cy.createAgenda('Ministerraad', agendaDate);
    cy.openAgendaForDate(agendaDate);
    cy.setAllItemsFormallyOk(1);
    cy.approveDesignAgenda();

    cy.openDetailOfAgendaitem(approvalTitle, false);
    cy.generateDecision();
    cy.wait(5000); // TODO-waits better wait
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(document.documentCard.name.value).should('not.contain', 'Aan het laden');
    cy.get(document.documentCard.name.value).contains('VR PV', {
      timeout: 60000,
    });
    cy.get(document.documentCard.name.value).invoke('text')
      .then((generatedDocTitle) => {
        decisionTitle = generatedDocTitle.replace('.pdf', '').trim();
      });
    cy.intercept('POST', '/sign-flows*').as('postSignFlows1');
    cy.intercept('POST', '/sign-subcases*').as('postSignSubcases1');
    cy.intercept('POST', '/sign-marking-activities*').as('postSignMarkingActivities1');
    cy.get(document.documentCard.actions).click();
    cy.get(document.documentCard.signMarking).click();
    cy.wait('@postSignFlows1', {
      timeout: 60000,
    });
    cy.wait('@postSignSubcases1', {
      timeout: 60000,
    });
    cy.wait('@postSignMarkingActivities1', {
      timeout: 60000,
    });

    cy.generateMinutes();
    cy.wait(5000); // TODO-waits better wait
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(document.documentCard.name.value).should('not.contain', 'Aan het laden');
    cy.get(document.documentCard.name.value).contains('VR PV', {
      timeout: 60000,
    });
    cy.get(document.documentCard.name.value).invoke('text')
      .then((generatedDocTitle) => {
        minutesTitle = generatedDocTitle.replace('.pdf', '').trim();
      });
    cy.intercept('POST', '/sign-flows*').as('postSignFlows2');
    cy.intercept('POST', '/sign-subcases*').as('postSignSubcases2');
    cy.intercept('POST', '/sign-marking-activities*').as('postSignMarkingActivities2');
    cy.get(document.documentCard.actions).click();
    cy.get(document.documentCard.signMarking).forceClick();
    cy.wait('@postSignFlows2');
    cy.wait('@postSignSubcases2');
    cy.wait('@postSignMarkingActivities2');
  });

  it('should check the signatures/decisions overview', () => {
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.visit('ondertekenen/beslissingen-en-notulen');
    cy.wait('@getShortlist1');

    // ** decision **

    cy.get(route.decisions.row.pieceName).contains(decisionTitle)
      .invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'document');
    cy.get(document.previewDetailsTab.name).children('div.auk-key-value-item__value')
      .contains(decisionTitle);
    cy.go('back');

    cy.get(route.decisions.row.pieceName).contains(decisionTitle)
      .parents('tr')
      .as('currentDecision');

    cy.get('@currentDecision').find(route.decisions.row.openSidebar)
      .click();
    cy.get(route.decisions.sidebar.close);
    // clicking it again should not close the sidebar (so close button should still be visible and clickable)
    cy.get('@currentDecision').find(route.decisions.row.openSidebar)
      .click();
    cy.wait(2000); // TODO loading data in the sidebar is async, but we expect it to be sync.
    cy.get(route.decisions.sidebar.close).click();
    cy.get(route.decisions.sidebar.close).should('not.exist');

    // ** minutes **

    cy.get(route.decisions.row.pieceName).contains(minutesTitle)
      .invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'document');
    cy.get(document.previewDetailsTab.name).children('div.auk-key-value-item__value')
      .contains(minutesTitle);
    cy.go('back');
    cy.get(appuniversum.loader).should('not.exist');

    cy.get(route.decisions.row.pieceName).contains(minutesTitle)
      .parents('tr')
      .as('currentMinutes');

    cy.get('@currentMinutes').find(route.decisions.row.openSidebar)
      .click();
    cy.get(route.decisions.sidebar.close);
    // clicking it again should not close the sidebar (so close button should still be visible and clickable)
    cy.get('@currentMinutes').find(route.decisions.row.openSidebar)
      .click();
    cy.wait(2000); // TODO loading data in the sidebar is async, but we expect it to be sync.
    cy.get(route.decisions.sidebar.close).click();
    cy.get(route.decisions.sidebar.close).should('not.exist');
  });

  it('should check the signatures/decisions overview sidebar', () => {
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.visit('ondertekenen/beslissingen-en-notulen');
    cy.wait('@getShortlist1');

    // ** decision **

    cy.get(route.decisions.row.pieceName).contains(decisionTitle)
      .parents('tr')
      .as('currentDecision');

    cy.get('@currentDecision').find(route.decisions.row.openSidebar)
      .click();

    // check info
    cy.get(route.decisions.sidebar.info).contains(pieceTypeDecision);
    cy.get(route.decisions.sidebar.info).contains(agendaDate.format('DD-MM-YYYY'));
    cy.get(route.decisions.sidebar.info).contains(decisionTitle);

    // check preview
    cy.get(route.decisions.sidebar.preview).invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'document');
    cy.go('back');
    cy.get('@currentDecision').find(route.decisions.row.openSidebar)
      .click();
    // check last agendaitem
    cy.get(route.decisions.sidebar.consultDecision).invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'agendapunten');
    cy.url().should('include', 'beslissingen');
    cy.get(agenda.agendaSideNav.agendaName).contains('B')
      .parents('li')
      .invoke('attr', 'class')
      .should('include', 'auk-sidebar__item--active');
    cy.go('back');
    cy.get('@currentDecision').find(route.decisions.row.openSidebar)
      .click();

    // check default signer
    cy.get(signature.createSignFlow.reportOrMinutes.signer).eq(0)
      .contains(defaultSecretary);

    // ** minutes **

    cy.get(route.decisions.row.pieceName).contains(minutesTitle)
      .parents('tr')
      .as('currentMinutes');

    cy.get('@currentMinutes').find(route.decisions.row.openSidebar)
      .click();

    // check info
    cy.get(route.decisions.sidebar.info).contains(pieceTypeMinutes);
    cy.get(route.decisions.sidebar.info).contains(agendaDate.format('DD-MM-YYYY'));
    cy.get(route.decisions.sidebar.info).contains(minutesTitle);

    // check preview
    cy.get(route.decisions.sidebar.preview).invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'document');
    cy.get(appuniversum.loader).should('not.exist');
    cy.go('back');
    cy.get('@currentMinutes').find(route.decisions.row.openSidebar)
      .click();
    // check last agendaitem
    cy.get(route.decisions.sidebar.consultMinutes).invoke('removeAttr', 'target')
      .click();
    cy.url().should('include', 'agenda');
    cy.url().should('include', 'notulen');
    cy.get(agenda.agendaSideNav.agendaName).contains('B')
      .parents('li')
      .invoke('attr', 'class')
      .should('include', 'auk-sidebar__item--active');
    cy.go('back');
    cy.get('@currentMinutes').find(route.decisions.row.openSidebar)
      .click();

    // check default signer
    cy.get(signature.createSignFlow.reportOrMinutes.signer).eq(0)
      .contains(defaultSecretary);
  });

  it('check starting multiple signflows with same/different secretary', () => {
    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.visit('ondertekenen/beslissingen-en-notulen');
    cy.wait('@getShortlist1');

    cy.get(route.decisions.row.pieceName).contains(decisionTitle)
      .parents('tr')
      .as('currentDecision');
    cy.get(route.decisions.row.pieceName).contains(minutesTitle)
      .parents('tr')
      .as('currentMinutes');

    // select two pieces with same secretary
    cy.get('@currentDecision').find(route.decisions.row.selectSignflow)
      .children()
      .click();
    cy.get('@currentMinutes').find(route.decisions.row.selectSignflow)
      .children()
      .click();

    // check that signflow can be started
    cy.get(route.signatures.navbar.startMultipleSignflows).click();
    cy.get(route.decisions.sidebar.startSignflow).should('be.enabled');

    // change secretary
    cy.openAgendaForDate(agendaDate);
    cy.openDetailOfAgendaitem(approvalTitle, false);
    cy.get(mandatee.secretaryPanelView.actions.edit).click();
    cy.get(utils.mandateeSelector.container).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains(newSecretary)
      .scrollIntoView()
      .trigger('mouseover')
      .click({
        force: true,
      });
    cy.intercept('PATCH', '/decision-activities/**').as('patchDecisionActivities1');
    cy.get(mandatee.secretaryPanelEdit.actions.save).click();
    cy.wait('@patchDecisionActivities1');

    // go back
    cy.intercept('GET', '/sign-flows*').as('getShortlist2');
    cy.visit('ondertekenen/beslissingen-en-notulen');
    cy.wait('@getShortlist2');

    // select two pieces with different secretary
    cy.get('@currentDecision').find(route.decisions.row.selectSignflow)
      .children()
      .click();
    cy.get('@currentMinutes').find(route.decisions.row.selectSignflow)
      .children()
      .click();

    // check that signflow can't be started
    cy.get(route.signatures.navbar.startMultipleSignflows).click();
    cy.get(route.decisions.sidebar.startSignflow).should('be.disabled');
    cy.get(appuniversum.alert.message).contains(alertMessage);
  });

  it('check starting/stopping signflow', () => {
    const staticResponse = {
      statusCode: 200,
      ok: true,
    };

    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.visit('ondertekenen/beslissingen-en-notulen');
    cy.wait('@getShortlist1');

    cy.get(route.decisions.row.pieceName).contains(decisionTitle)
      .parents('tr')
      .as('currentDecision');

    // ** decision **

    // *start signflow*

    // check fail
    cy.wait(2000); // TODO-waits: better wait, not waiting sometimes results in missing piece-id
    cy.get('@currentDecision').find(route.decisions.row.openSidebar)
      .click();
    cy.get(signature.createSignFlow.reportOrMinutes.signer); // wait for signers to load

    cy.intercept('POST', '/sign-signing-activities').as('postSigningActivities');
    cy.intercept('PATCH', '/sign-subcases/**').as('patchSignSubcases');
    cy.intercept('PATCH', '/sign-flows/**').as('patchSignFlows');
    cy.intercept('POST', '/signing-flows/update-to-signinghub', {
      forceNetworkError: true,
    }).as('updateToSigningHubError');
    // cy.intercept('DELETE', '/sign-signing-activities/**').as('deleteSigningActivities');
    // no email set so forcing through disabled button
    cy.get(route.decisions.sidebar.startSignflow).invoke('removeAttr', 'disabled')
      .click();
    cy.wait('@postSigningActivities');
    cy.wait('@patchSignSubcases');
    cy.wait('@patchSignFlows');
    // cy.wait('@deleteSigningActivities');
    cy.get(appuniversum.toaster).find(appuniversum.alert.close)
      .click();

    // check succes
    cy.wait(2000); // TODO-waits: better wait, not waiting sometimes results in missing piece-id
    cy.get('@currentDecision').find(route.decisions.row.openSidebar)
      .click();
    cy.get(signature.createSignFlow.reportOrMinutes.signer).eq(0)
      .contains(newSecretary); // wait for signers to load

    cy.intercept('POST', '/sign-signing-activities').as('postSigningActivities2');
    cy.intercept('PATCH', '/sign-subcases/**').as('patchSignSubcases2');
    cy.intercept('PATCH', '/sign-flows/**').as('patchSignFlows2');
    cy.intercept('POST', '/signing-flows/upload-to-signinghub', staticResponse).as('stubUpload');
    // no email set so forcing through disabled button
    cy.get(route.decisions.sidebar.startSignflow).invoke('removeAttr', 'disabled')
      .click();
    cy.wait('@postSigningActivities2');
    cy.wait('@patchSignSubcases2');
    cy.wait('@patchSignFlows2');

    // this works because signflow-status-sync service is not active.
    // Normally the status becomes 'Marked' because there is no preparation-activity created.
    cy.visit('ondertekenen/beslissingen-en-notulen%20opvolgen');
    cy.get(route.ongoingDecisions.row.pieceName).contains(decisionTitle);

    // ** minutes **

    // * stop signflow *

    cy.intercept('GET', '/sign-flows*').as('getShortlist1');
    cy.visit('ondertekenen/beslissingen-en-notulen');
    cy.wait('@getShortlist1');
    cy.get(route.decisions.row.pieceName).contains(minutesTitle)
      .parents('tr')
      .as('currentMinutes');

    // check succes
    cy.get('@currentMinutes').find(route.decisions.row.openSidebar)
      .click();

    cy.intercept('DELETE', '/signing-flows/**').as('deleteSignFlows3');
    cy.get(route.decisions.sidebar.stopSignflow).click();
    cy.wait('@deleteSignFlows3');
    // table currently empty at this point, but could contain more data in the future
    // cy.get(route.signatures.row.name).should('not.contain', files2[0].newFileName);
  });
});
