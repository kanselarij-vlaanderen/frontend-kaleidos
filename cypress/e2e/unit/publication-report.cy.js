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
  const today = Cypress.dayjs();
  const yesterday = today.add(-1, 'days');
  const tomorrow = today.add(1, 'days');
  const oneMonthEarlier = today.add(-1, 'months');
  const dateLastReportFormatToday = today.format('DD-MM-YYYY');
  const dateLastReportFormatYesterday = yesterday.format('DD-MM-YYYY');
  const dateLastReportFormatTomorrow = tomorrow.format('DD-MM-YYYY');
  const runout = [dateLastReportFormatYesterday, dateLastReportFormatToday, dateLastReportFormatTomorrow];
  const dateLastReportFormat = new RegExp(`${runout.join('|')}`, 'g');
  const dateDowloadLinkFormatToday = today.format('YYYYMMDD');
  const dateDowloadLinkFormatYesterday = yesterday.format('YYYYMMDD');
  const dateDowloadLinkFormatTomorrow = tomorrow.format('YYYYMMDD');
  const runout2 = [dateDowloadLinkFormatYesterday, dateDowloadLinkFormatToday, dateDowloadLinkFormatTomorrow];
  const dateDowloadLinkFormat = new RegExp(`${runout2.join('|')}`, 'g');
  const alertMessage1 = 'Het gevraagde rapport wordt gemaakt.';
  const alertMessage2 = 'Het gevraagde rapport is gereed.';
  const downloadPath = 'cypress/downloads';

  beforeEach(() => {
    cy.login('OVRB');
    cy.visit('/publicaties/overzicht/rapporten');
    cy.get(auk.loader);
    cy.get(auk.loader).should('not.exist');
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
    cy.setDateInFlatpickr(oneMonthEarlier);
    cy.get(auk.datepicker.datepicker).eq(1)
      .click();
    cy.setDateInFlatpickr(today);

    cy.intercept('POST', '/publication-metrics-export-jobs').as('postExport');
    cy.get(publication.generateReport.confirm).click()
      .wait('@postExport');

    cy.get(appuniversum.alert.message).eq(0)
      .contains(alertMessage1);
    cy.get(utils.downloadFileToast.message).eq(0)
      .contains(alertMessage2);
    cy.get(utils.downloadFileToast.link).eq(0)
      .click();

    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.downloadLink)
      .invoke('text')
      .invoke('replaceAll', '\n', '')
      .invoke('replaceAll', ' ', '')
      .then(($fileName) => {
        cy.readFile(`${downloadPath}/${$fileName}`, {
          timeout: 25000,
        }).should('contain', 'Ministers')
          .should('contain', 'Aantal_publicaties')
          .should('contain', 'Aantal_bladzijden')
          .should('contain', 'Aantal_uittreksels');
      });

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
    cy.get(utils.downloadFileToast.link).eq(0)
      .click();

    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.downloadLink)
      .invoke('text')
      .invoke('replaceAll', '\n', '')
      .invoke('replaceAll', ' ', '')
      .then(($fileName) => {
        cy.readFile(`${downloadPath}/${$fileName}`, {
          timeout: 25000,
        }).should('contain', 'Beleidsdomeinen')
          .should('contain', 'Aantal_publicaties')
          .should('contain', 'Aantal_bladzijden')
          .should('contain', 'Aantal_uittreksels');
      });

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
    cy.get(utils.downloadFileToast.link).eq(0)
      .click();

    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.downloadLink)
      .invoke('text')
      .invoke('replaceAll', '\n', '')
      .invoke('replaceAll', ' ', '')
      .then(($fileName) => {
        cy.readFile(`${downloadPath}/${$fileName}`, {
          timeout: 25000,
        }).should('contain', 'Ministers')
          .should('contain', 'Aantal_publicaties')
          .should('contain', 'Aantal_bladzijden')
          .should('contain', 'Aantal_uittreksels');
      });

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
    cy.get(utils.downloadFileToast.link).eq(0)
      .click();

    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.downloadLink)
      .invoke('text')
      .invoke('replaceAll', '\n', '')
      .invoke('replaceAll', ' ', '')
      .then(($fileName) => {
        cy.readFile(`${downloadPath}/${$fileName}`, {
          timeout: 25000,
        }).should('contain', 'Type_regelgeving')
          .should('contain', 'Aantal_publicaties')
          .should('contain', 'Aantal_bladzijden')
          .should('contain', 'Aantal_uittreksels');
      });

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
    cy.get(utils.downloadFileToast.link).eq(0)
      .click();

    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.downloadLink)
      .invoke('text')
      .invoke('replaceAll', '\n', '')
      .invoke('replaceAll', ' ', '')
      .then(($fileName) => {
        cy.readFile(`${downloadPath}/${$fileName}`, {
          timeout: 25000,
        }).should('contain', 'Type_regelgeving')
          .should('contain', 'Aantal_publicaties')
          .should('contain', 'Aantal_bladzijden')
          .should('contain', 'Aantal_uittreksels');
      });

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
    cy.get(utils.downloadFileToast.link).eq(0)
      .click();

    cy.get('@currentPanelEntry').find(publication.reportsPanelEntry.downloadLink)
      .invoke('text')
      .invoke('replaceAll', '\n', '')
      .invoke('replaceAll', ' ', '')
      .then(($fileName) => {
        cy.readFile(`${downloadPath}/${$fileName}`, {
          timeout: 25000,
        }).should('contain', 'Ministers')
          .should('contain', 'Aantal_publicaties')
          .should('contain', 'Aantal_bladzijden')
          .should('contain', 'Aantal_uittreksels');
      });

    checkLastReportAndDownloadlink('@currentPanelEntry', dateLastReportFormat, profile, dateDowloadLinkFormat, title);
  });
});
