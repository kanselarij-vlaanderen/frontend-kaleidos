/* global context, it, cy, Cypress, beforeEach */
// / <reference types="Cypress" />

import dependency from '../../selectors/dependency.selectors';
import utils from '../../selectors/utils.selectors';
import auk from '../../selectors/auk.selectors';
import settings from '../../selectors/settings.selectors';
import agenda from '../../selectors/agenda.selectors';
import appuniversum from '../../selectors/appuniversum.selectors';

const ALERT_POLL_INTERVAL = 70000;

context('Settings: Create a system-alert and verify if it gets shown and closes', () => {
  beforeEach(() => {
    cy.login('Admin');
    cy.visit('instellingen/systeemmeldingen');
  });

  it('Should create & Should pop up to the user once polling picks it up', () => {
    const today = Cypress.dayjs();
    const yesterday = today.add(-1, 'days');
    const tomorrow = today.add(1, 'days');
    const defaultDateFormatToday = today.format('DD-MM-YYYY');
    const defaultDateFormatYesterday = yesterday.format('DD-MM-YYYY');
    const defaultDateFormatTomorrow = tomorrow.format('DD-MM-YYYY');
    const runout = [defaultDateFormatYesterday, defaultDateFormatToday, defaultDateFormatTomorrow];
    const defaultDateFormat = new RegExp(`${runout.join('|')}`, 'g');

    // # It creates
    cy.get(settings.systemAlertsIndex.add).click();

    // check default dates
    cy.get(settings.systemAlertForm.beginDate).find(auk.datepicker.datepicker)
      .invoke('val')
      .should('match', defaultDateFormat);
    cy.get(settings.systemAlertForm.endDate).find(auk.datepicker.datepicker)
      .invoke('val')
      .should('match', defaultDateFormat);

    cy.get(settings.systemAlertForm.title).type('System alert title');
    cy.get(settings.systemAlertForm.message).type('System alert message');

    cy.intercept('GET', '/alerts?**').as('getAlerts');
    cy.intercept('POST', '/alerts').as('postAlerts');
    cy.get(auk.confirmationModal.footer.confirm).click()
      .wait('@postAlerts');
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass
    cy.get(settings.systemAlert).should('exist', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    });
  });

  it('Should edit, close and stay closed', () => {
    //  check if default severity is grey
    cy.get(appuniversum.alert.container)
      .should('not.have.class', 'au-c-alert--warning')
      .should('not.have.class', 'au-c-alert--error');
    // open editmodal
    cy.get(settings.systemAlertsIndex.alerts).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('System alert title')
      .scrollIntoView()
      .click();
    cy.get(settings.systemAlertsIndex.edit).click();
    // switch severity to urgent and check if it is red
    cy.get(settings.systemAlertForm.severity).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Dringend')
      .scrollIntoView()
      .click();
    cy.get(appuniversum.alert.container).should('have.class', 'au-c-alert--error');
    // switch severity to warning and check if it is yellow
    cy.get(settings.systemAlertForm.severity).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).contains('Waarschuwing')
      .scrollIntoView()
      .click();
    cy.get(appuniversum.alert.container).should('have.class', 'au-c-alert--warning');
    // change title and message
    cy.get(settings.systemAlertForm.title).clear()
      .type('Edited system alert title');
    cy.get(settings.systemAlertForm.message).clear()
      .type('Edited system alert message');
    cy.get(appuniversum.alert.container).contains('Edited system alert title');
    cy.get(appuniversum.alert.message).contains('Edited system alert message');
    // close edit modal because otherwise alert can't be closed
    cy.get(auk.confirmationModal.footer.cancel).click();

    cy.get(auk.auModal.header.close).click();
    cy.get(auk.auModal.container).should('not.exist');
    cy.intercept('GET', '/alerts?**').as('getAlerts');
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass

    cy.get(appuniversum.alert.close).each((button) => {
      cy.get(button).click();
    });
    cy.get(settings.systemAlert).should('not.exist');

    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for another polling-cycle to pass
    cy.get(settings.systemAlert).should('not.exist');
  });

  it('Should delete the alert created', () => {
    cy.intercept('GET', '/alerts**').as('getAlerts');
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass
    cy.get(settings.systemAlert).should('exist');

    cy.get(settings.systemAlertsIndex.alerts).find(dependency.emberPowerSelect.trigger)
      .click();
    cy.get(dependency.emberPowerSelect.option).click();
    cy.intercept('GET', '/alerts**').as('getAlerts');
    cy.get(settings.systemAlertsIndex.remove).click();
    cy.wait('@getAlerts', {
      timeout: ALERT_POLL_INTERVAL + 60000,
    }); // Wait for a polling-cycle to pass
    cy.get(settings.systemAlert).should('not.exist');
  });

  it('Should check the datepicker', () => {
    // TODO-bug datepicker inputs are broken on system alert.
    // check on edit agenda for now, switch when fixed (or move to separate testfile?)
    const newDate = Cypress.dayjs('2023-09-15')
      .hour(12)
      .minute(5);
    const manuallyEditedDateDown = Cypress.dayjs('2022-08-15').hour(11)
      .minute(0);

    // * agenda version: *
    cy.visit('vergadering/6374F696D9A98BD0A2288559/agenda/3db46410-65bd-11ed-a5a5-db2587a216a4/agendapunten');
    cy.get(agenda.agendaActions.optionsDropdown)
      .children(appuniversum.button)
      .click();
    cy.get(agenda.agendaActions.toggleEditingMeeting).forceClick();

    // use command
    cy.get(agenda.editMeeting.datepicker).find(auk.datepicker.datepicker)
      .click();
    cy.setDateAndTimeInFlatpickr(newDate);
    // click something outside the datepicker to close and update it
    cy.get(agenda.editMeeting.meetingLocation).click();

    cy.get(agenda.editMeeting.datepicker).find(auk.datepicker.datepicker)
      .should('have.value', newDate.format('DD-MM-YYYY HH:mm'));

    // manual year down
    cy.get(agenda.editMeeting.datepicker).find(auk.datepicker.datepicker)
      .click();
    cy.get(dependency.flatPickr.yearDown).click();
    cy.get(dependency.flatPickr.prevMonth).click();
    // date has to be set before time
    cy.get(dependency.flatPickr.days).find(dependency.flatPickr.day)
      .not(dependency.flatPickr.prevMonthDay)
      .not(dependency.flatPickr.nextMonthDay)
      .contains(newDate.format('DD'))
      .click();
    cy.get(dependency.flatPickr.hourDown).click();
    cy.get(dependency.flatPickr.minuteDown).click();

    // check edited date
    cy.get(agenda.editMeeting.meetingLocation).click();
    cy.get(agenda.editMeeting.datepicker).find(auk.datepicker.datepicker)
      .should('have.value', manuallyEditedDateDown.format('DD-MM-YYYY HH:mm'));

    // manual year up
    cy.get(agenda.editMeeting.datepicker).find(auk.datepicker.datepicker)
      .click();
    cy.get(dependency.flatPickr.yearUp).click();
    cy.get(dependency.flatPickr.nextMonth).click();
    // date has to be set before time
    cy.get(dependency.flatPickr.days).find(dependency.flatPickr.day)
      .not(dependency.flatPickr.prevMonthDay)
      .not(dependency.flatPickr.nextMonthDay)
      .contains(newDate.format('DD'))
      .click();
    cy.get(dependency.flatPickr.hourUp).click();
    cy.get(dependency.flatPickr.minuteUp).click();
    // click something outside the datepicker to close and update it
    cy.get(agenda.editMeeting.meetingLocation).click();

    // check edited date
    cy.get(agenda.editMeeting.datepicker).find(auk.datepicker.datepicker)
      .should('have.value', newDate.format('DD-MM-YYYY HH:mm'));

    // type full date
    cy.get(agenda.editMeeting.datepicker).find(auk.datepicker.datepicker)
      .clear()
      .type(manuallyEditedDateDown.format('DD-MM-YYYY HH:mm'));
    // check edited date
    cy.get(agenda.editMeeting.datepicker).find(auk.datepicker.datepicker)
      .should('have.value', manuallyEditedDateDown.format('DD-MM-YYYY HH:mm'));

    // * system-alert version: *
    // cy.get(settings.systemAlertsIndex.add).click();

    // // use command
    // cy.get(settings.systemAlertForm.beginDate).find(auk.datepicker.datepicker)
    //   .click();
    // cy.setDateAndTimeInFlatpickr(newDate);
    // cy.get(settings.systemAlertForm.endDate).find(auk.datepicker.datepicker)
    //   .click({
    //     // previous datepicker is still open and covers this one
    //     force: true,
    //   });
    // cy.setDateAndTimeInFlatpickr(nextDay);
    // // click something outside the datepicker to close and update it
    // cy.get(settings.systemAlertForm.title).click({
    //   force: true,
    // });

    // // ckeck edited dates
    // cy.get(settings.systemAlertForm.beginDate).find(auk.datepicker.datepicker)
    //   .should('have.value', newDate.format('DD-MM-YYYY HH:mm'));
    // cy.get(settings.systemAlertForm.endDate).find(auk.datepicker.datepicker)
    //   .should('have.value', nextDay.format('DD-MM-YYYY HH:mm'));

    // // manual year down
    // cy.get(settings.systemAlertForm.beginDate).find(auk.datepicker.datepicker)
    //   .click();
    // cy.get(dependency.flatPickr.yearDown).click();
    // cy.get(dependency.flatPickr.prevMonth).click();
    // // date has to be set before time
    // cy.get(dependency.flatPickr.days).find(dependency.flatPickr.day)
    //   .not(dependency.flatPickr.prevMonthDay)
    //   .not(dependency.flatPickr.nextMonthDay)
    //   .contains(newDate.format('DD'))
    //   .click();
    // cy.get(dependency.flatPickr.hourDown).eq(0)
    //   .click();
    // cy.get(dependency.flatPickr.minuteDown).eq(0)
    //   .click();
    // // manual year up
    // cy.get(settings.systemAlertForm.endDate).find(auk.datepicker.datepicker)
    //   .click({
    //     force: true,
    //   });
    // cy.get(dependency.flatPickr.yearUp).click();
    // cy.get(dependency.flatPickr.nextMonth).click();
    // // date has to be set before time
    // cy.get(dependency.flatPickr.days).find(dependency.flatPickr.day)
    //   .not(dependency.flatPickr.prevMonthDay)
    //   .not(dependency.flatPickr.nextMonthDay)
    //   .contains(nextDay.format('DD'))
    //   .click();
    // cy.get(dependency.flatPickr.hourUp).eq(1)
    //   .click();
    // cy.get(dependency.flatPickr.minuteUp).eq(1)
    //   .click();
    // // click something outside the datepicker to close and update it
    // cy.get(settings.systemAlertForm.title).click({
    //   force: true,
    // });

    // // check edited dates
    // cy.get(settings.systemAlertForm.beginDate).find(auk.datepicker.datepicker)
    //   .should('have.value', manuallyEditedDateDown.format('DD-MM-YYYY HH:mm'));
    // cy.get(settings.systemAlertForm.endDate).find(auk.datepicker.datepicker)
    //   .should('have.value', manuallyEditedDateUp.format('DD-MM-YYYY HH:mm'));
  });
});
