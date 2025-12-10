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
  // the button will be disabled now with the new warnings, untested
  cy.get(auk.confirmationModal.footer.confirm).invoke('removeAttr', 'disabled')
    .click();
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
  // for stubbing a response from newsletter service (which is disabled)
  const staticBadResponse = {
    statusCode: 500,
    ok: false,
    body: {
      errors: [
        {
          status: '500',
          title: 'Server is not enabled in cypress tests',
          detail: 'This should have worked, but service is not enabled',
        }
      ],
    },
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
    const theme = 'Brussel'; // 'Justitie en Handhaving' is the one theme we can't accept, no mailchimp id
    const announcementTheme = 'Mededeling'; // default theme on all NEW announcement newsitems
    const shortSubcaseTitle2 = 'Cypress test: nieuwsbrief nota';
    const shortSubcaseTitle3 = 'Cypress test: tweede nieuwsbrief nota';
    const alertMessage = 'De nieuwsbrief kan niet verzonden worden';

    cy.createAgenda('Ministerraad', agendaDate, 'Zaal oxford bij Cronos Leuven');

    // create case and subcases
    cy.createCase('Cypress test: nieuwsbrief');
    cy.addSubcaseViaModal({
      newCase: true,
      agendaitemType: type1,
      newShortTitle: shortSubcaseTitle1,
    });
    cy.addSubcaseViaModal({
      agendaitemType: type2,
      newShortTitle: shortSubcaseTitle2,
    });
    cy.addSubcaseViaModal({
      agendaitemType: type2,
      newShortTitle: shortSubcaseTitle3,
    });
    cy.wait(5000);

    // create agendaitem
    cy.openAgendaForDate(agendaDate);
    cy.addAgendaitemToAgenda(shortSubcaseTitle1);
    cy.addAgendaitemToAgenda(shortSubcaseTitle2);
    cy.addAgendaitemToAgenda(shortSubcaseTitle3);

    // test without kort bestek and with theme in mededeling (new announcement newsitems have a theme to start)
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    cy.get(newsletter.tableRow.titleContent); // await page load
    // checkPublishMail(alertMessage); // no longer true
    // there should be no alert message on announcements with a theme
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(newsletter.newsletterHeaderOverview.newsletterActions.publishMail).forceClick();
    cy.intercept('POST', '/newsletter/mail-campaigns', staticBadResponse).as('postMailCampaigns');

    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@postMailCampaigns')
      .then((responseBody) => {
        if (responseBody.error || responseBody.response?.statusCode === 500) {
          // service is not enabled, so we always get errors unless we use a cypress spy
          cy.get(appuniversum.alert.container).should('exist');
        }
      });

    // remove theme from mededeling, test without any valid nota or announcements
    cy.openAgendaForDate(agendaDate);
    addOrRemoveThemeFromMededeling(shortSubcaseTitle1, announcementTheme, true);

    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.navigateToNewsletter).forceClick();
    cy.get(newsletter.tableRow.titleContent); // await page load
    checkPublishMail(alertMessage);

    // add kort bestek
    cy.openAgendaForDate(agendaDate);
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
    cy.intercept('POST', '/newsletter/mail-campaigns', staticBadResponse).as('postMailCampaigns');

    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@postMailCampaigns')
      .then((responseBody) => {
        if (responseBody.error || responseBody.response?.statusCode === 500) {
          // service is not enabled, so we always get errors unless we use a cypress spy
          cy.get(appuniversum.alert.container).should('exist');
        }
      });
  });

  it.skip('should test the post mailchimp stuff', () => {
    cy.visit('vergadering/64F9AD0070A5523DE5126B7A/kort-bestek');
    cy.intercept('POST', '/newsletter/mail-campaigns', staticBadResponse).as('stubUploadMailCampaigns');

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
