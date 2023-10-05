/* global context, beforeEach, afterEach, it, cy, Cypress */
// / <reference types="Cypress" />

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';
import newsletter from '../../selectors/newsletter.selectors';

function addOrRemoveThemeFromMededeling(shortSubcaseTitle, theme, confirm) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.openAgendaitemKortBestekTab(shortSubcaseTitle);
  cy.get(newsletter.newsItem.edit).click();
  cy.get(newsletter.editItem.themesSelector).contains(theme)
    .click();
  cy.intercept('PATCH', '/news-items/**').as(`patchNewsItem${randomInt}`);
  cy.get(newsletter.editItem.save).click();
  if (confirm) {
    cy.get(auk.confirmationModal.footer.confirm).click();
  }
  cy.wait(`@patchNewsItem${randomInt}`);
}

function goToNewsletter() {
  cy.get(agenda.agendaActions.optionsDropdown)
    .children(appuniversum.button)
    .click();
  cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
  cy.get(newsletter.tableRow.titleContent); // await page load
}

function checkPublishMail(alertMessage) {
  cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
    .children(appuniversum.button)
    .click();
  cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();
  cy.get(auk.confirmationModal.footer.confirm).click();
  cy.get(auk.auModal.container).should('not.exist');
  cy.get(appuniversum.alert.message).contains(alertMessage);
  cy.get(appuniversum.alert.close).click();
}

function checkUncheckInNewsletter(index) {
  const randomInt = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('PATCH', '/news-items/**').as(`patchNewsItem${randomInt}`);
  cy.get(newsletter.tableRow.inNewsletterCheckbox).eq(index)
    .parent()
    .click()
    .wait(`@patchNewsItem${randomInt}`);
}

context('newsletter tests, both in agenda detail view and newsletter route', () => {
  const staticResponse = {
    statusCode: 200,
    ok: true,
  };

  beforeEach(() => {
    cy.login('Admin');
  });

  afterEach(() => {
    cy.logout();
  });


  it('should test the pre mailchimp checks', () => {
    const randomInt = Math.floor(Math.random() * Math.floor(10000));

    const agendaDate = Cypress.dayjs().add(5, 'weeks')
      .day(1);
    const type1 = 'Mededeling';
    const type2 = 'Nota';
    const shortSubcaseTitle1 = 'Cypress test: nieuwsbrief mededeling';
    const theme = 'Justitie en Handhaving';
    const shortSubcaseTitle2 = 'Cypress test: nieuwsbrief nota';
    const shortSubcaseTitle3 = 'Cypress test: tweede nieuwsbrief nota';
    const alertMessage = 'De nieuwsbrief kan niet verzonden worden';

    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');

    cy.createCase('Cypress test: nieuwsbrief');

    // create subcase.
    cy.addSubcase(type1, shortSubcaseTitle1);
    cy.addSubcase(type2, shortSubcaseTitle2);
    cy.addSubcase(type2, shortSubcaseTitle3);
    cy.wait(5000);

    // create agendaitem
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(shortSubcaseTitle1);
    cy.addAgendaitemToAgenda(shortSubcaseTitle2);
    cy.addAgendaitemToAgenda(shortSubcaseTitle3);

    // test without kort bestek and no theme in mededeling
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    cy.get(newsletter.tableRow.titleContent); // await page load
    checkPublishMail(alertMessage);

    // add theme to mededeling
    cy.openAgendaForDate(agendaDate);
    addOrRemoveThemeFromMededeling(shortSubcaseTitle1, theme);

    // test without kort bestek and with theme in mededeling
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    cy.get(newsletter.tableRow.titleContent); // await page load
    checkPublishMail(alertMessage);

    // remove theme from mededeling
    cy.openAgendaForDate(agendaDate);
    addOrRemoveThemeFromMededeling(shortSubcaseTitle1, theme, true);

    // add kort bestek
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle2);
    cy.intercept('GET', '/themes**').as('getAgendaitemThemes1');
    cy.intercept('POST', '/news-items').as('newsItemsPost');
    cy.get(newsletter.newsItem.create).click()
      .wait('@newsItemsPost');
    cy.wait('@getAgendaitemThemes1');
    cy.get(newsletter.editItem.save).click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchNewsItem');

    // test with kort bestek, without nota in newsletter, with mededeling and without theme
    goToNewsletter();
    checkPublishMail(alertMessage);

    // add theme to nota
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle2);
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click()
      .wait('@patchNewsItem');
    // test with kort bestek, without nota in newsletter, with mededeling and with theme
    goToNewsletter();
    checkPublishMail(alertMessage);

    // remove theme from nota
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle2);
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.get(newsletter.editItem.save).click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@patchNewsItem');
    // test with kort bestek, without nota in newsletter and without theme
    goToNewsletter();
    checkPublishMail(alertMessage);

    // test with nota in newsletter without theme
    checkUncheckInNewsletter(0);
    cy.log('test with nota in newsletter without theme');
    checkPublishMail(alertMessage);

    // add theme to nota
    cy.openAgendaForDate(agendaDate);
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle2);
    cy.get(newsletter.newsItem.edit).click();
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.intercept('PATCH', '/news-items/**').as('patchNewsItem');
    cy.get(newsletter.editItem.save).click()
      .wait('@patchNewsItem');

    // add kort bestek to second nota
    cy.openAgendaitemKortBestekTab(shortSubcaseTitle3);
    cy.intercept('GET', '/themes**').as('getAgendaitemThemes2');
    cy.intercept('POST', '/news-items').as('newsItemsPost');
    cy.get(newsletter.newsItem.create).click()
      .wait('@newsItemsPost');
    cy.wait('@getAgendaitemThemes2');
    cy.get(newsletter.editItem.themesSelector).contains(theme)
      .click();
    cy.get(newsletter.editItem.save).click();
    cy.intercept('PATCH', '/news-items/**').as(`patchNewsItem${randomInt}`);
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait(`@patchNewsItem${randomInt}`);

    goToNewsletter();
    // uncheck nota with themes, check nota without themes
    checkUncheckInNewsletter(0);
    checkUncheckInNewsletter(1);

    // TODO-bug check on nota in kort-bestek allows mailcampaign with nota without themes
    //  and test again
    checkPublishMail(alertMessage);

    // switch the checks
    checkUncheckInNewsletter(0);
    checkUncheckInNewsletter(1);
    // there should be no alert message
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();
    cy.intercept('POST', '/newsletter/mail-campaigns').as('postMailCampaigns');

    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@postMailCampaigns')
      .then((responseBody) => {
        if (responseBody.error || responseBody.response?.statusCode === 500) {
          cy.get(appuniversum.alert.container).should('not.exist');
        }
      });
  });

  it.skip('should test the post mailchimp stuff', () => {
    cy.visit('vergadering/64F9AD0070A5523DE5126B7A/kort-bestek');
    cy.intercept('POST', '/newsletter/mail-campaigns', staticResponse).as('stubUploadMailCampaigns');

    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@stubUploadMailCampaigns');
    cy.wait(10000);
  });

  // it.only('should test the pre mailchimp checks', () => {
  //   cy.visit('/vergadering/63BFF684D02D5127D91DE575/kort-bestek/afdrukken');
  //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
  //       .children(appuniversum.button)
  //       .click();
  //   cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();

  //   cy.fixture('example').then((examples) => {
  //     cy.log(examples);
  //     cy.intercept('POST', '/newsletter/mail-campaigns', examples.data).as('postMailCampaings');
  //   });
  //   cy.get(utils.vlModalVerify.save).click()
  //     .wait('@postMailCampaings');
  //   cy.wait(20000);
  // });
});
