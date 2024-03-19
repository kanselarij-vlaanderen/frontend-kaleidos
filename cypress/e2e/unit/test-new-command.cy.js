/* global context, it, cy, Cypress, beforeEach, afterEach, it */
// / <reference types="Cypress" />

// import agenda from '../../selectors/agenda.selectors';
// import dependency from '../../selectors/dependency.selectors';
// import route from '../../selectors/route.selectors';
// import settings from '../../selectors/settings.selectors';
// import utils from '../../selectors/utils.selectors';
// import auk from '../../selectors/auk.selectors';
// import appuniversum from '../../selectors/appuniversum.selectors';
import mandateeNames from '../../selectors/mandatee-names.selectors';

context('testing new add subcase command', () => {
  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should test the new add subcase command', () => {
    const agendaDate = Cypress.dayjs().add(1, 'weeks')
      .day(5);
    const agendaDateFormatted = agendaDate.format('DD-MM-YYYY');
    const agendaType = 'Nota';
    const newShortTitle = 'Test ShortTitle';
    const longTitle = 'Test Longtitle';
    const subcaseType = 'principiële goedkeuring';
    const subcaseName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const mandatee1 = {
      fullName: mandateeNames.current.first.fullName,
      submitter: false,
    };
    const mandatee2 = {
      fullName: mandateeNames.current.second.fullName,
      submitter: true,
    };
    const mandatees = [mandatee1, mandatee2];
    const domain1 = {
      name: 'Cultuur, Jeugd, Sport en Media',
      selected: true,
      fields: [],
    };
    const domain2 = {
      name: 'Economie, Wetenschap en Innovatie',
      selected: false,
      fields: ['Wetenschappelijk onderzoek', 'Innovatie'],
    };
    const domains = [domain1, domain2];
    const files1 = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet',
      }
    ];

    const subcase1 = {
      agendaitemType: agendaType,
      confidential: true,
      newShortTitle: newShortTitle,
      longTitle: longTitle,
      subcaseType: subcaseType,
      subcaseName: subcaseName,
      mandatees: mandatees,
      domains: domains,
      documents: files1,
      formallyOk: true,
      agendaDate: agendaDateFormatted,
    };

    cy.createAgenda('Ministerraad', agendaDate, 'test add newsubcase');

    cy.visitCaseWithLink('dossiers/655B933CD500B784623C3EAA/deeldossiers');

    cy.addSubcaseViaModal(subcase1);
  });
});
