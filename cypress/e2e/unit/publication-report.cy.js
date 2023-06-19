/* global context, it, cy, Cypress, beforeEach, afterEach */

// / <reference types="Cypress" />
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import dependency from '../../selectors/dependency.selectors';
import publication from '../../selectors/publication.selectors';
import utils from '../../selectors/utils.selectors';

function checkLastReportAndDownloadlink(currentPanelEntry, dateLastReportFormat, profile, dateDowloadLinkFormat, title) {
  cy.get(currentPanelEntry).find(publication.reportsPanelEntry.lastRequest)
    .contains(dateLastReportFormat);
  cy.get(currentPanelEntry).find(publication.reportsPanelEntry.lastRequest)
    .contains(profile);
  cy.get(currentPanelEntry).find(publication.reportsPanelEntry.downloadLink)
    .contains(dateDowloadLinkFormat);
  cy.get(currentPanelEntry).find(publication.reportsPanelEntry.downloadLink)
    .contains(`-${title.replace(/\s+/g, '-').toLowerCase()}.csv`);
}

context('Publications reports tests', () => {
  const profile = 'OVRB Test';
  const date = Cypress.dayjs();
  const dateEarlier = Cypress.dayjs().add(-1, 'months');
  const dateLastReportFormat = date.format('DD-MM-YYYY');
  const dateDowloadLinkFormat = date.format('YYYYMMDD');
  const alertMessage1 = 'Het gevraagde rapport wordt gemaakt.';
  const alertMessage2 = 'Het gevraagde rapport is gereed.';

  beforeEach(() => {
    cy.login('OVRB');
    cy.visit('/publicaties/overzicht/rapporten');
  });

  afterEach(() => {
    cy.logout();
  });

  it('should test report for publicaties per minister voor beslissingsdatum', () => {
    const title = 'Publicaties per minister voor beslissingsdatum';

    cy.get(publication.reportsPanelEntry.title).contains(title)
      .parents('.auk-panel__body')
      .as('currentPanelEntry');
    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.create)
      .click();

    cy.get(auk.datepicker.datepicker).eq(0)
      .click();
    cy.setDateInFlatpickr(dateEarlier);
    cy.get(auk.datepicker.datepicker).eq(1)
      .click();
    cy.setDateInFlatpickr(date);

    cy.intercept('POST', '/publication-metrics-export-jobs').as('postExport');
    cy.get(publication.generateReport.confirm).click()
      .wait('@postExport');

    cy.get(appuniversum.alert.message).eq(0)
      .contains(alertMessage1);
    cy.get(utils.downloadFileToast.message).eq(0)
      .contains(alertMessage2);
    cy.get(utils.downloadFileToast.link);
    // .eq(0)
    // .click();

    // TODO there are two methods for checking downloads, which one to use (both require extra setup)
    // cy.get(publication.reportsPanelEntry.downloadLink).invoke('text')
    //   .then((text) => {
    //     cy.readFile(text);
    //   });

    checkLastReportAndDownloadlink('@currentPanelEntry', dateLastReportFormat, profile, dateDowloadLinkFormat, title);
  });

  it('should test report for Publicaties per beleidsdomein', () => {
    const title = 'Publicaties per beleidsdomein';

    cy.get(publication.reportsPanelEntry.title).contains(title)
      .parents('.auk-panel__body')
      .as('currentPanelEntry');
    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.create)
      .click();

    cy.intercept('POST', '/publication-metrics-export-jobs').as('postExport');
    cy.get(publication.generateReport.confirm).click()
      .wait('@postExport');

    cy.get(appuniversum.alert.message).eq(0)
      .contains(alertMessage1);
    cy.get(utils.downloadFileToast.message).eq(0)
      .contains(alertMessage2);
    cy.get(utils.downloadFileToast.link);
    // .eq(0)
    // .click();

    // TODO there are two methods for checking downloads, which one to use (both require extra setup)
    // cy.get(publication.reportsPanelEntry.downloadLink).invoke('text')
    //   .then((text) => {
    //     cy.readFile(text);
    //   });

    checkLastReportAndDownloadlink('@currentPanelEntry', dateLastReportFormat, profile, dateDowloadLinkFormat, title);
  });

  it('should test report for Publicaties van BVRs per minister', () => {
    const title = 'Publicaties van BVRs per minister';
    const mandatee = 'Zuhal Demir';

    cy.get(publication.reportsPanelEntry.title).contains(title)
      .parents('.auk-panel__body')
      .as('currentPanelEntry');
    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.create)
      .click();

    cy.get(utils.mandateePersonSelector)
      // .find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).should('not.contain', 'Aan het zoeken');
    cy.get(dependency.emberPowerSelect.option).contains(mandatee)
      .click();

    cy.intercept('POST', '/publication-metrics-export-jobs').as('postExport');
    cy.get(publication.generateReport.confirm).click()
      .wait('@postExport');

    cy.get(appuniversum.alert.message).eq(0)
      .contains(alertMessage1);
    cy.get(utils.downloadFileToast.message).eq(0)
      .contains(alertMessage2);
    cy.get(utils.downloadFileToast.link);
    // .eq(0)
    // .click();

    // TODO there are two methods for checking downloads, which one to use (both require extra setup)
    // cy.get(publication.reportsPanelEntry.downloadLink).invoke('text')
    //   .then((text) => {
    //     cy.readFile(text);
    //   });

    checkLastReportAndDownloadlink('@currentPanelEntry', dateLastReportFormat, profile, dateDowloadLinkFormat, title);
  });

  it('should test report for Publicaties per type regelgeving buiten Ministerraad', () => {
    const title = 'Publicaties per type regelgeving buiten Ministerraad';

    cy.get(publication.reportsPanelEntry.title).contains(title)
      .parents('.auk-panel__body')
      .as('currentPanelEntry');
    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.create)
      .click();

    cy.intercept('POST', '/publication-metrics-export-jobs').as('postExport');
    cy.get(publication.generateReport.confirm).click()
      .wait('@postExport');

    cy.get(appuniversum.alert.message).eq(0)
      .contains(alertMessage1);
    cy.get(utils.downloadFileToast.message).eq(0)
      .contains(alertMessage2);
    cy.get(utils.downloadFileToast.link);
    // .eq(0)
    // .click();

    // TODO there are two methods for checking downloads, which one to use (both require extra setup)
    // cy.get(publication.reportsPanelEntry.downloadLink).invoke('text')
    //   .then((text) => {
    //     cy.readFile(text);
    //   });

    checkLastReportAndDownloadlink('@currentPanelEntry', dateLastReportFormat, profile, dateDowloadLinkFormat, title);
  });

  it('should test report for Publicaties per type regelgeving', () => {
    const title = 'Publicaties per type regelgeving';

    cy.get(publication.reportsPanelEntry.title).contains(/^Publicaties per type regelgeving$/)
      .parents('.auk-panel__body')
      .as('currentPanelEntry');
    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.create)
      .click();

    cy.intercept('POST', '/publication-metrics-export-jobs').as('postExport');
    cy.get(publication.generateReport.confirm).click()
      .wait('@postExport');

    cy.get(appuniversum.alert.message).eq(0)
      .contains(alertMessage1);
    cy.get(utils.downloadFileToast.message).eq(0)
      .contains(alertMessage2);
    cy.get(utils.downloadFileToast.link);
    // .eq(0)
    // .click();

    // TODO there are two methods for checking downloads, which one to use (both require extra setup)
    // cy.get(publication.reportsPanelEntry.downloadLink).invoke('text')
    //   .then((text) => {
    //     cy.readFile(text);
    //   });

    cy.get(publication.reportsPanelEntry.title).contains(/^Publicaties per type regelgeving$/)
      .parents('.auk-panel__body')
      .as('currentPanelEntry2');
    checkLastReportAndDownloadlink('@currentPanelEntry2', dateLastReportFormat, profile, dateDowloadLinkFormat, title);
  });

  it('should test report for Publicaties van decreten per minister', () => {
    const title = 'Publicaties van decreten per minister';
    const mandatee = 'Zuhal Demir';

    cy.get(publication.reportsPanelEntry.title).contains(title)
      .parents('.auk-panel__body')
      .as('currentPanelEntry');
    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.create)
      .click();

    cy.get(utils.mandateePersonSelector)
      // .find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).should('not.contain', 'Aan het zoeken');
    cy.get(dependency.emberPowerSelect.option).contains(mandatee)
      .click();

    cy.intercept('POST', '/publication-metrics-export-jobs').as('postExport');
    cy.get(publication.generateReport.confirm).click()
      .wait('@postExport');

    cy.get(appuniversum.alert.message).eq(0)
      .contains(alertMessage1);
    cy.get(utils.downloadFileToast.message).eq(0)
      .contains(alertMessage2);
    cy.get(utils.downloadFileToast.link);
    // .eq(0)
    // .click();

    // TODO there are two methods for checking downloads, which one to use (both require extra setup)
    // cy.get(publication.reportsPanelEntry.downloadLink).invoke('text')
    //   .then((text) => {
    //     cy.readFile(text);
    //   });

    checkLastReportAndDownloadlink('@currentPanelEntry', dateLastReportFormat, profile, dateDowloadLinkFormat, title);
  });
});
