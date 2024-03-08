/* global context, it, cy, Cypress, beforeEach, afterEach, it */
// / <reference types="Cypress" />

// import agenda from '../../selectors/agenda.selectors';
// import dependency from '../../selectors/dependency.selectors';
// import route from '../../selectors/route.selectors';
// import settings from '../../selectors/settings.selectors';
// import utils from '../../selectors/utils.selectors';
// import auk from '../../selectors/auk.selectors';
// import appuniversum from '../../selectors/appuniversum.selectors';

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
    const step = 'principiële goedkeuring';
    const stepName = 'Principiële goedkeuring m.h.o. op adviesaanvraag';
    const mandatee1 = {
      name: 'Ben Weyts',
      submitter: false,
    };
    const mandatee2 = {
      name: 'Hilde Crevits',
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
    const files = [
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-1', fileType: 'Nota',
      },
      {
        folder: 'files', fileName: 'test', fileExtension: 'pdf', newFileName: 'VR 2020 0404 DOC.0001-2', fileType: 'Decreet',
      }
    ];

    cy.createAgenda('Ministerraad', agendaDate, 'test add newsubcase');

    cy.visit('dossiers/655B933CD500B784623C3EAA/deeldossiers');

    cy.addSubcaseViaModal(agendaType, true, newShortTitle, longTitle, step, stepName, mandatees, domains, files, true, agendaDateFormatted);
  });
});
