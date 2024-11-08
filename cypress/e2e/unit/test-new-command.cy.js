/* global context, it, cy, Cypress, beforeEach, afterEach, it */
// / <reference types="Cypress" />

// import agenda from '../../selectors/agenda.selectors';
// import dependency from '../../selectors/dependency.selectors';
// import route from '../../selectors/route.selectors';
// import settings from '../../selectors/settings.selectors';
// import utils from '../../selectors/utils.selectors';
// import auk from '../../selectors/auk.selectors';
// import appuniversum from '../../selectors/appuniversum.selectors';
import mandatee from '../../selectors/mandatee.selectors';
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
      name: 'Werk, Economie, Wetenschap, Innovatie, Landbouw en Sociale Economie',
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
      formallyOk: 'Formeel OK',
      agendaDate: agendaDateFormatted,
    };

    cy.createAgenda('Ministerraad', agendaDate, 'test add newsubcase');

    cy.visitCaseWithLink('dossiers/655B933CD500B784623C3EAA/deeldossiers');

    cy.addSubcaseViaModal(subcase1);
  });

  // TODO this test is very dependent on previous mandatee
  // so if a new government is completely new people/mandatees, this test fails)
  it('should map to active mandatee as submitter without manual edit', () => {
    // reason: old subcase with old mandatees > new subcase should map to new mandatees and submitter.
    // both mandatees and submitter have been wrong before with this automation (old mandatee)
    const isCI = Cypress.env('CI');
    const oldMandatee = mandateeNames['10052021-16052022'].second; // crevits is pos 2
    const newMandateeOfSamePerson = mandateeNames.current.third; // crevits is pos 3

    const subcase1 = {
      newShortTitle: 'submitter is correctly mapped to active mandatee',
    };

    let dateRange;
    if (isCI) {
      const date09052021 = Cypress.dayjs('2021-05-09').format('DD-MM-YYYY');
      const date15052022 = Cypress.dayjs('2022-05-15').format('DD-MM-YYYY');
      dateRange = `${date09052021} tot ${date15052022}`;
    } else {
      const date10052021 = Cypress.dayjs('2021-05-10').format('DD-MM-YYYY');
      const date16052022 = Cypress.dayjs('2022-05-16').format('DD-MM-YYYY');
      dateRange = `${date10052021} tot ${date16052022}`;
    }

    cy.visitCaseWithLink('dossiers/6374F30CD9A98BD0A2288557/deeldossiers/6374F312D9A98BD0A2288558');
    cy.get(mandatee.mandateePanelView.rows).should('not.exist');
    cy.addSubcaseMandatee(oldMandatee);
    // old mandatee is submitter
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 1, {
      timeout: 5000,
    });
    cy.get('@listItems').eq(0)
      .as('row');
    cy.get('@row').find(mandatee.mandateePanelView.row.name)
      .should('contain', oldMandatee.fullName);
    cy.get('@row').find(mandatee.mandateePanelView.row.name)
      .contains(dateRange);
    cy.get('@row').find(mandatee.mandateePanelView.row.submitter)
      .children()
      .should('exist');

    // new subcase
    cy.addSubcaseViaModal(subcase1);

    // old mandatee mapped to new mandatee is the submitter
    cy.get(mandatee.mandateePanelView.rows).as('listItems');
    cy.get('@listItems').should('have.length', 1, {
      timeout: 5000,
    });
    cy.get('@listItems').eq(0)
      .as('row');
    cy.get('@row').find(mandatee.mandateePanelView.row.name)
      .should('contain', newMandateeOfSamePerson.fullName);
    cy.get('@row').find(mandatee.mandateePanelView.row.name)
      .contains('tot heden');
    cy.get('@row').find(mandatee.mandateePanelView.row.submitter) // new person is the active submitter
      .children()
      .should('exist');

    // cleanup
    cy.deleteSubcase();
  });
});
