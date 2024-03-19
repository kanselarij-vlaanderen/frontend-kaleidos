/* global context, it, cy,beforeEach, afterEach, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import route from  '../../selectors/route.selectors';
import utils from  '../../selectors/utils.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';

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

function downloadDocs(postAgenda = true) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  cy.get(appuniversum.loader).should('not.exist');
  cy.intercept('POST', 'agendas/*/agendaitems/pieces/files/archive?decisions=false&pdfOnly=true').as(`postAgendas${randomInt}`);
  cy.intercept('GET', '/file-bundling-jobs/**').as(`fileBundlingJobs${randomInt}`);
  cy.get(auk.confirmationModal.footer.confirm).click();
  cy.get(utils.downloadFileToast.link).eq(0)
    .click()
    .wait(`@fileBundlingJobs${randomInt}`);
  if (postAgenda) {
    cy.wait(`@postAgendas${randomInt}`);
  }
}

context('Agenda tests', () => {
  const typeNota = 'Nota';
  const agendaKind = 'Ministerraad';
  const agendaPlace = 'Cypress Room';

  const agendaDate = Cypress.dayjs('2022-04-20');
  const agendaDateFormatted = agendaDate.format('DD_MM_YYYY');
  const downloadPath = 'cypress/downloads';
  const downloadZipAgendaA = `${downloadPath}/VR_zitting_${agendaDateFormatted}_agenda_A_alle_punten.zip`;

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should assert messages on agenda actions with different formal ok statusses', () => {
    // const agendaDate = Cypress.dayjs('2022-04-07');
    cy.visitAgendaWithLink('/vergadering/627E529689C002BE724F77B4/agenda/627E529689C002BE724F77B5/agendapunten');

    // should get different message when trying to approve with formal not ok items
    cy.setFormalOkOnItemWithIndex(0);
    cy.approveDesignAgenda(false);
    cy.get(auk.modal.body).find(appuniversum.alert.container)
      .should('not.exist');
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(auk.modal.footer.cancel).click();
    cy.approveAndCloseDesignAgenda(false);
    cy.get(auk.modal.body).find(appuniversum.alert.container)
      .should('not.exist');
    cy.get(auk.modal.footer.cancel).click();

    // Should not be able to close a session with only a design agenda, cfr. KAS-1551
    cy.get(agenda.agendaVersionActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaVersionActions.actions.lockAgenda).should('not.exist');
    // Should not be able to reopenprevious with only a design agenda
    cy.get(agenda.agendaVersionActions.actions.reopenPreviousVersion).should('not.exist');

    // Adding new agendaitem changes messages in actions (based on formally ok status)
    const agendaitemName = 'Derde stap';
    cy.addAgendaitemToAgenda(agendaitemName);
    cy.agendaitemExists(agendaitemName);

    // alert message exists after agendaitem that is not formally ok
    cy.approveDesignAgenda(false);
    cy.get(auk.modal.body).find(appuniversum.alert.container);
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(auk.modal.footer.cancel).click();
    cy.approveAndCloseDesignAgenda(false);
    cy.get(auk.modal.body).find(appuniversum.alert.container);
    cy.get(auk.modal.footer.cancel).click();

    cy.setAllItemsFormallyOk(1);
    // alert message no longer exists after agendaitems are formally ok
    cy.approveDesignAgenda(false);
    cy.get(auk.modal.body).find(appuniversum.alert.container)
      .should('not.exist');
    cy.get(appuniversum.loader).should('not.exist');
    cy.get(auk.modal.footer.cancel).click();
    cy.approveAndCloseDesignAgenda(false);
    cy.get(auk.modal.body).find(appuniversum.alert.container)
      .should('not.exist');
    cy.get(auk.modal.footer.cancel).click();
  });

  it('should create a new agenda and then delete the last agenda (and automatically the meeting)', () => {
    // const agendaDate = Cypress.dayjs('2022-04-08');
    cy.visitAgendaWithLink('/vergadering/627E52AD89C002BE724F77B9/agenda/627E52AE89C002BE724F77BA/agendapunten');
    cy.get(agenda.agendaVersionActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaVersionActions.actions.deleteAgenda).forceClick();
    cy.get(auk.modal.body).find(appuniversum.alert.container);
    cy.get(agenda.agendaVersionActions.confirm.deleteAgenda);
    cy.get(auk.modal.footer.cancel).click();
    // instead of confirming the opened modal, we cancel and let the command handle it
    cy.deleteAgenda(true);
    cy.url().should('include', '/overzicht');
  });

  it('Should be able to close a session with only 1 approved agenda, cfr. KAS-1551', () => {
    // const agendaDate = Cypress.dayjs('2022-04-09');
    cy.visitAgendaWithLink('/vergadering/627E52BF89C002BE724F77BE/agenda/627E52C089C002BE724F77BF/agendapunten');
    cy.closeAgenda();
  });

  it('should edit nota on agendaitem and trim whitespaces', () => {
    // const agendaDate = Cypress.dayjs('2022-04-10');
    const subcaseTitleShort = 'Cypress test: agendaitem trim whitespace - korte titel - 1652448232';
    const subcaseTitleLong = 'Cypress test: agendaitem trim whitespace - lange titel - 1652448232';
    const comment = 'Dit is de opmerking';
    const privateComment = 'Dit is de interne opmerking';
    const whitespace = '\n';

    cy.visitCaseWithLink('dossiers/E14FB528-3347-11ED-B8A0-F82C0F9DE1CF/deeldossiers');
    // keep this setup because we want to validate the trimming of text on creation of subcase
    cy.addSubcaseViaModal({
      agendaitemType: typeNota,
      newShortTitle: subcaseTitleShort + whitespace,
      longTitle: subcaseTitleLong + whitespace,
    });
    cy.visitAgendaWithLink('vergadering/627E52D589C002BE724F77C3/agenda/627E52D689C002BE724F77C4/agendapunten');
    cy.addAgendaitemToAgenda(subcaseTitleShort);

    // after creating, whitespace is removed
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShort);
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShort + whitespace)
      .should('not.exist');
    cy.get(agenda.agendaOverviewItem.title).contains(subcaseTitleLong);
    cy.openDetailOfAgendaitem(subcaseTitleShort);
    // detail view
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.confidential)
      .parent()
      .click();
    // When typing, the name in de sidebar item also changes, showing the whitespaces before saving

    // short title
    // check sidebar and input field before change
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).should('not.contain', whitespace + subcaseTitleShort + whitespace);
    cy.get(agenda.agendaitemTitlesEdit.shorttitle).should('not.have.value', whitespace + subcaseTitleShort + whitespace);
    // The new short title with whitespace before and after
    cy.get(agenda.agendaitemTitlesEdit.shorttitle).clear()
      .type(whitespace + subcaseTitleShort + whitespace);
    // Before save, the whitespaces are visible in input field and sidebar
    cy.get(agenda.agendaitemTitlesEdit.shorttitle).should('have.value', whitespace + subcaseTitleShort + whitespace);
    cy.get(agenda.agendaDetailSidebarItem.shortTitle).should('contain', whitespace + subcaseTitleShort + whitespace);

    // long title
    cy.get(agenda.agendaitemTitlesEdit.title).should('not.have.value', whitespace + subcaseTitleLong + whitespace);
    cy.get(agenda.agendaitemTitlesEdit.title).clear()
      .type(whitespace + subcaseTitleLong + whitespace);
    cy.get(agenda.agendaitemTitlesEdit.title).should('have.value', whitespace + subcaseTitleLong + whitespace);

    // comment
    cy.get(agenda.agendaitemTitlesEdit.comment).clear()
      .type(whitespace + comment + whitespace);
    cy.get(agenda.agendaitemTitlesEdit.comment).should('have.value', whitespace + comment + whitespace);
    // private comment
    cy.get(agenda.agendaitemTitlesEdit.privateComment).clear()
      .type(whitespace + privateComment + whitespace);
    cy.get(agenda.agendaitemTitlesEdit.privateComment).should('have.value', whitespace + privateComment + whitespace);

    cy.intercept('PATCH', '/agendas/*').as('patchAgendas');
    cy.get(agenda.agendaitemTitlesEdit.actions.save).click();
    cy.wait('@patchAgendas');
    // after saving, agendaitem-titles show trimmed values
    cy.get(agenda.agendaitemTitlesView.edit).scrollIntoView();
    cy.get(agenda.agendaitemTitlesView.shortTitle).as('shortTitle');
    cy.get('@shortTitle').should('contain.text', subcaseTitleShort); // this is an exact match
    cy.get('@shortTitle').should('not.contain.text', whitespace + subcaseTitleShort);
    cy.get(agenda.agendaitemTitlesView.title).as('longTitle');
    // This should technicaly fail but we simulate whitespace before of the actual value for readability
    cy.get('@longTitle').contains(subcaseTitleLong);
    // comment is not trimmed
    cy.get(agenda.agendaitemTitlesView.comment).contains(`Opmerking: ${whitespace + comment + whitespace}`);
    // privatec comment is not trimmed
    cy.get(agenda.agendaitemTitlesView.privateComment).contains(`Interne opmerking: ${whitespace + privateComment + whitespace}`);
    cy.get(agenda.agendaitemTitlesView.confidential).contains('Beperkte toegang');

    // rollback confidentiality should work
    cy.get(agenda.agendaitemTitlesView.edit).click();
    cy.get(agenda.agendaitemTitlesEdit.confidential)
      .parent()
      .click();
    cy.get(agenda.agendaitemTitlesView.confidential).should('not.exist');
    cy.get(agenda.agendaitemTitlesEdit.actions.cancel).click();
    cy.get(agenda.agendaitemTitlesView.confidential).contains('Beperkte toegang');
  });

  it('It should be automatically get the next meetingID assigned in the UI', () => {
    const agendaDateSingle = Cypress.dayjs();
    cy.intercept('GET', '/meetings/**/internal-decision-publication-activity').as('getDecisionPubActivity');
    cy.intercept('GET', '/meetings/**/internal-document-publication-activity').as('getDocPubActivity');
    cy.intercept('GET', '/themis-publication-activities**').as('getThemisPubActivity');
    cy.intercept('GET', '/concepts?filter**').as('loadConcepts');

    // We have to make this agenda with number 1 to ensure numbering works
    cy.createAgenda(agendaKind, agendaDateSingle, agendaPlace, 1);
    cy.createAgenda(agendaKind, agendaDateSingle, agendaPlace, null, 'VV AA 1999/2BIS').then((result) => {
      cy.visit(`/vergadering/${result.meetingId}/agenda/${result.agendaId}/agendapunten`);
      // Check the values in edit session view
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.toggleEditingMeeting).forceClick();
      cy.wait('@getDecisionPubActivity');
      cy.wait('@getDocPubActivity');
      cy.wait('@getThemisPubActivity');
      cy.wait('@loadConcepts');
      cy.get(agenda.editMeeting.meetingNumber).should('have.value', result.meetingNumber);
      cy.get(agenda.editMeeting.numberRep.view).should('contain', result.meetingNumberRep);
      cy.get(auk.modal.footer.cancel).click();
      // Check if the next automatic number is correct
      cy.get(utils.mHeader.agendas).click();
      cy.get(route.agendas.action.newMeeting).click();
      cy.wait(500); // await call not possible
      cy.get(agenda.editMeeting.meetingNumber).should('have.value', (parseInt(result.meetingNumber, 10) + 1).toString());
    });
  });

  it('Should add agendaitems to an agenda and close the agenda', () => {
    // const agendaDate = Cypress.dayjs('2022-04-11');
    // Agenda A cy.visitAgendaWithLink('/vergadering/627E638F896D8E189787BAF7/agenda/627E6390896D8E189787BAF8/agendapunten');
    // Agenda b cy.visitAgendaWithLink('/vergadering/627E638F896D8E189787BAF7/agenda/046d3960-d2c5-11ec-bc63-419d8e010fd1/agendapunten');
    const subcaseTitleShortNew = 'Cypress test: close agenda - formal not ok: new item - 1652450185';
    const subcaseTitleShortApproved = 'Cypress test: close agenda - formal ok: approved item - 1652450185';
    const approvalTitle = 'Goedkeuring van het verslag';

    // *Setup of this test:
    // Agenda A has 1 approval and 1 agendaitem
    // Agenda B has 1 approval (no changes), 1 recurring agendaitem, 1 new agendaitem
    // What should happen on close:
    // agenda B is removed, agenda A is still ok
    // new agendaitem can be proposed for a new agenda

    cy.visitAgendaWithLink('/vergadering/627E638F896D8E189787BAF7/agenda/046d3960-d2c5-11ec-bc63-419d8e010fd1/agendapunten');
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 2);
    cy.agendaNameExists('B');
    cy.agendaNameExists('A', false);
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 2);
    cy.get(agenda.agendaOverviewItem.subitem).contains(approvalTitle);
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShortApproved);
    cy.addAgendaitemToAgenda(subcaseTitleShortNew); // !TODO KAS-3413 could be placed in setup

    cy.get(agenda.agendaVersionActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaVersionActions.actions.lockAgenda).forceClick();
    cy.get(auk.modal.body).find(appuniversum.alert.message)
      .contains('met alle wijzigingen wil verwijderen?');
    cy.get(auk.modal.footer.cancel).click();
    // let the command do the work
    cy.closeAgenda();
    // Closing an agenda should remove any design agenda
    // check existence of showChanges and absence of the formally ok edit
    cy.get(agenda.agendaOverview.showChanges);
    cy.get(agenda.agendaitemSearch.formallyReorderEdit).should('not.exist');
    // By checking the length of agendas and confirming "Agenda A", no other agenda exists
    cy.get(agenda.agendaSideNav.agenda).should('have.length', 1);
    cy.agendaNameExists('A', false);
    cy.get(agenda.agendaOverviewItem.subitem).should('have.length', 2);
    cy.get(agenda.agendaOverviewItem.subitem).contains(approvalTitle);
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShortApproved);
    cy.get(agenda.agendaOverviewItem.subitem).contains(subcaseTitleShortNew)
      .should('not.exist');
  });

  it('Should create agenda, switch to PVV, then switch back to MR', () => {
    const agendaNumberMR = 190;
    const agendaDateMR = Cypress.dayjs().add(4, 'weeks')
      .day(3);
    const vvKind = 'Ministerraad - Plan Vlaamse Veerkracht';
    const formattedAgendaDateMR = agendaDateMR.format('DD-MM-YYYY');
    const suffixVV = '-VV';
    const fullmeetingNumber = `VR PV ${Cypress.dayjs().format('YYYY')}/${agendaNumberMR}`;
    const fullmeetingNumberVV = `${fullmeetingNumber}${suffixVV}`;
    const mrKind = 'Ministerraad';
    const agendaNumberPVV = 191;
    const agendaDatePVV = agendaDateMR.add(1, 'days');

    const monthDutchMR = getTranslatedMonth(agendaDateMR.month());
    const monthDutchPVV = getTranslatedMonth(agendaDatePVV.month());
    const dateFormatMR = `${agendaDateMR.date()} ${monthDutchMR} ${agendaDateMR.year()}`;
    const dateFormatPVV = `${agendaDatePVV.date()} ${monthDutchPVV} ${agendaDatePVV.year()}`;

    cy.createAgenda(null, agendaDateMR, null, agendaNumberMR);
    cy.createAgenda(null, agendaDatePVV, null, agendaNumberPVV);

    cy.intercept('GET', '/meetings/**/internal-decision-publication-activity').as('getDecisionPubActivity');
    cy.intercept('GET', '/meetings/**/internal-document-publication-activity').as('getDocPubActivity');
    cy.intercept('GET', '/themis-publication-activities**').as('getThemisPubActivity');
    cy.intercept('GET', '/concepts?filter**').as('loadConcepts');
    // switch to PVV
    cy.openAgendaForDate(agendaDatePVV);
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.toggleEditingMeeting).forceClick();
    cy.wait('@getDecisionPubActivity');
    cy.wait('@getDocPubActivity');
    cy.wait('@getThemisPubActivity');
    cy.wait('@loadConcepts');
    cy.get(utils.kindSelector.kind).click();
    cy.selectFromDropdown(vvKind);
    cy.get(agenda.editMeeting.relatedMainMeeting).click();
    // cy.selectFromDropdown(formattedAgendaDatePVV);
    // cy.get(dependency.emberPowerSelect.option).should('not.contain', formattedAgendaDatePVV);
    cy.selectFromDropdown(formattedAgendaDateMR);
    cy.get(agenda.editMeeting.numberRep.view).should('contain', fullmeetingNumberVV);
    cy.intercept('PATCH', '/meetings/**').as('patchMeetings');
    cy.get(agenda.editMeeting.save).click();
    cy.wait('@patchMeetings');
    cy.get(agenda.agendaHeader.title).contains(dateFormatMR);
    cy.get(agenda.agendaHeader.kind).contains(vvKind);

    // switch to MR
    cy.openAgendaForDate(agendaDateMR, 1);
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.toggleEditingMeeting).forceClick();
    cy.wait('@getDecisionPubActivity');
    cy.wait('@getDocPubActivity');
    cy.wait('@getThemisPubActivity');
    cy.wait('@loadConcepts');
    cy.get(utils.kindSelector.kind).click();
    cy.selectFromDropdown(mrKind);
    cy.get(agenda.editMeeting.datepicker)
      .find(auk.datepicker.datepicker)
      .click();
    cy.setDateInFlatpickr(agendaDatePVV);
    // TODO-BUG when creating agendas for next year, the year in numberRep acts strange after switch
    const fullmeetingNumberMR = `VR PV ${agendaDateMR.format('YYYY')}/${agendaNumberMR}`;
    cy.get(agenda.editMeeting.numberRep.view).should('contain', fullmeetingNumberMR);
    cy.intercept('PATCH', '/meetings/**').as('patchMeetingsPVV');
    cy.intercept('PATCH', 'internal-document-publication-activities/*').as('patchInternalActivity');
    cy.get(agenda.editMeeting.save).click();
    cy.wait('@patchMeetingsPVV');
    cy.wait('@patchInternalActivity');
    cy.get(agenda.agendaHeader.title).contains(dateFormatPVV);
    cy.get(agenda.agendaHeader.kind).contains(mrKind);
  });

  it('Should download all files', () => {
    const shortSubcaseTitle1 = 'test propagatie vertrouwelijkheid 1655729512';
    const shortSubcaseTitle2 = 'test propagatie vertrouwelijkheid locked 1655729512';

    cy.visit('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten?anchor=62B06EBFEC3CB8277FF058F0');
    // setup
    cy.openAgendaitemDossierTab(shortSubcaseTitle1);
    cy.addAgendaitemMandatee(mandateeNames['10052021-16052022'].first, false);
    cy.openAgendaitemDossierTab(shortSubcaseTitle2);
    cy.addAgendaitemMandatee(mandateeNames['10052021-16052022'].second, false);

    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.downloadDocuments).forceClick();
    downloadDocs();
    cy.readFile(downloadZipAgendaA, {
      timeout: 25000,
    }).should('contain', 'DOC.0001-01 propagatie intern secretarie.pdf')
      .should('contain', 'DOC.0001-02 propagatie ministerraad.pdf')
      .should('contain', 'DOC.0001-03 propagatie intern regering.pdf')
      .should('contain', 'DOC.0001-04 propagatie intern overheid.pdf')
      .should('contain', 'DOC.0001-05 propagatie publiek.pdf')
      .should('contain', 'DOC.0002-01 propagatie vertrouwelijk intern secretarie.pdf')
      .should('contain', 'DOC.0002-02 propagatie vertrouwelijk ministerraad.pdf')
      .should('contain', 'DOC.0002-03 propagatie vertrouwelijk intern regering.pdf')
      .should('contain', 'DOC.0002-04 propagatie vertrouwelijk intern overheid.pdf')
      .should('contain', 'DOC.0002-05 propagatie vertrouwelijk publiek.pdf');
  });

  it('Should download all files for Prime-minister', () => {
    cy.visit('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten?anchor=62B06EBFEC3CB8277FF058F0');

    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.downloadDocuments).forceClick();
    cy.get(appuniversum.checkbox)
      .contains(mandateeNames['10052021-16052022'].first.lastName)
      .click();
    downloadDocs(false);
    cy.readFile(downloadZipAgendaA, {
      timeout: 25000,
    }).should('contain', 'DOC.0001-01 propagatie intern secretarie.pdf')
      .should('contain', 'DOC.0001-02 propagatie ministerraad.pdf')
      .should('contain', 'DOC.0001-03 propagatie intern regering.pdf')
      .should('contain', 'DOC.0001-04 propagatie intern overheid.pdf')
      .should('contain', 'DOC.0001-05 propagatie publiek.pdf')
      .should('not.contain', 'DOC.0002-01 propagatie vertrouwelijk intern secretarie.pdf')
      .should('not.contain', 'DOC.0002-02 propagatie vertrouwelijk ministerraad.pdf')
      .should('not.contain', 'DOC.0002-03 propagatie vertrouwelijk intern regering.pdf')
      .should('not.contain', 'DOC.0002-04 propagatie vertrouwelijk intern overheid.pdf')
      .should('not.contain', 'DOC.0002-05 propagatie vertrouwelijk publiek.pdf');
  });

  it('Should download all files for second minister', () => {
    cy.visit('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten?anchor=62B06EBFEC3CB8277FF058F0');

    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.downloadDocuments).forceClick();
    cy.get(appuniversum.checkbox)
      .contains(mandateeNames['10052021-16052022'].second.lastName)
      .click();
    downloadDocs(false);
    cy.readFile(downloadZipAgendaA, {
      timeout: 25000,
    }).should('not.contain', 'DOC.0001-01 propagatie intern secretarie.pdf')
      .should('not.contain', 'DOC.0001-02 propagatie ministerraad.pdf')
      .should('not.contain', 'DOC.0001-03 propagatie intern regering.pdf')
      .should('not.contain', 'DOC.0001-04 propagatie intern overheid.pdf')
      .should('not.contain', 'DOC.0001-05 propagatie publiek.pdf')
      .should('contain', 'DOC.0002-01 propagatie vertrouwelijk intern secretarie.pdf')
      .should('contain', 'DOC.0002-02 propagatie vertrouwelijk ministerraad.pdf')
      .should('contain', 'DOC.0002-03 propagatie vertrouwelijk intern regering.pdf')
      .should('contain', 'DOC.0002-04 propagatie vertrouwelijk intern overheid.pdf')
      .should('contain', 'DOC.0002-05 propagatie vertrouwelijk publiek.pdf');
  });

  it('Should download all filetypes', () => {
    cy.visit('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten/62B06EECEC3CB8277FF058F3/documenten?anchor=62B06EECEC3CB8277FF058F3');

    const file = {
      folder: 'files', fileName: 'test', fileExtension: 'docx', newFileName: 'test wordfile for download all filetypes',
    };

    // setup
    cy.get(route.agendaitemDocuments.add).click();
    cy.get(auk.confirmationModal.footer.confirm).click();
    cy.addNewDocumentsInUploadModal([file], 'agendaitems');

    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.downloadDocuments).forceClick();
    cy.get(agenda.agendaActions.downloadDocumentsFiletypeSelector)
      .contains('Alle bestandstypes')
      .click();
    downloadDocs(false);
    cy.readFile(downloadZipAgendaA, {
      timeout: 25000,
    }).should('contain', 'DOC.0001-01 propagatie intern secretarie.pdf')
      .should('contain', 'DOC.0001-02 propagatie ministerraad.pdf')
      .should('contain', 'DOC.0001-03 propagatie intern regering.pdf')
      .should('contain', 'DOC.0001-04 propagatie intern overheid.pdf')
      .should('contain', 'DOC.0001-05 propagatie publiek.pdf')
      .should('contain', 'DOC.0002-01 propagatie vertrouwelijk intern secretarie.pdf')
      .should('contain', 'DOC.0002-02 propagatie vertrouwelijk ministerraad.pdf')
      .should('contain', 'DOC.0002-03 propagatie vertrouwelijk intern regering.pdf')
      .should('contain', 'DOC.0002-04 propagatie vertrouwelijk intern overheid.pdf')
      .should('contain', 'DOC.0002-05 propagatie vertrouwelijk publiek.pdf')
      .should('contain', file.newFileName);
  });

  context('download decisions', () => {
    const fileName2 = 'test'; // `VR PV ${agendaDate.format('YYYY_DD')} - punt 0002` if generated
    const fileName3 = 'replace'; // `VR PV ${agendaDate.format('YYYY_DD')} - punt 0003` if generated

    it('Setup for downloading all decisions', () => {
      // const concerns = 'Cypress test for downloading decisions';
      // const decision = 'Goedgekeurd';
      const filePunt2 = {
        folder: 'files', fileName: fileName2, fileExtension: 'pdf',
      };
      const filePunt3 = {
        folder: 'files', fileName: fileName3, fileExtension: 'pdf',
      };

      const shortSubcaseTitle1 = 'test propagatie vertrouwelijkheid 1655729512';
      const shortSubcaseTitle2 = 'test propagatie vertrouwelijkheid locked 1655729512';

      cy.visit('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten?anchor=62B06EBFEC3CB8277FF058F0');

      cy.openDetailOfAgendaitem(shortSubcaseTitle1);
      // cy.addAgendaitemMandatee(mandateeNames['10052021-16052022'].first, false); // This already happened in previous setup
      cy.get(agenda.agendaitemNav.decisionTab)
        .should('be.visible')
        .click();
      cy.addDocumentToTreatment(filePunt2);
      // cy.generateDecision(concerns, decision);
      cy.openDetailOfAgendaitem(shortSubcaseTitle2);
      // cy.addAgendaitemMandatee(mandateeNames['10052021-16052022'].second, false); // This already happened in previous setup
      cy.get(agenda.agendaitemNav.decisionTab)
        .should('be.visible')
        .click();
      // cy.generateDecision(concerns, decision);
      cy.addDocumentToTreatment(filePunt3);
    });

    it('Should download all decisions for Prime-minister', () => {
      cy.visit('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten?anchor=62B06EBFEC3CB8277FF058F0');
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.downloadDecisions).forceClick();
      cy.get(appuniversum.checkbox)
        .contains(mandateeNames['10052021-16052022'].first.lastName)
        .click();
      downloadDocs(false);
      cy.readFile(downloadZipAgendaA, {
        timeout: 25000,
      }).should('contain', fileName2)
        .should('not.contain', fileName3);
    });

    it('Should download all decisions for second minister', () => {
      cy.visit('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten?anchor=62B06EBFEC3CB8277FF058F0');
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.downloadDecisions).forceClick();
      cy.get(appuniversum.checkbox)
        .contains(mandateeNames['10052021-16052022'].second.lastName)
        .click();
      downloadDocs(false);
      cy.readFile(downloadZipAgendaA, {
        timeout: 25000,
      }).should('contain', fileName3)
        .should('not.contain', fileName2);
    });

    it('Should download all decisions', () => {
      cy.visit('vergadering/62B06E87EC3CB8277FF058E9/agenda/62B06E89EC3CB8277FF058EA/agendapunten?anchor=62B06EBFEC3CB8277FF058F0');
      cy.get(agenda.agendaActions.optionsDropdown)
        .children(appuniversum.button)
        .click();
      cy.get(agenda.agendaActions.downloadDecisions).forceClick();
      downloadDocs(false);
      cy.readFile(downloadZipAgendaA, {
        timeout: 25000,
      }).should('contain', fileName2)
        .should('contain', fileName3);
    });
  });
});
