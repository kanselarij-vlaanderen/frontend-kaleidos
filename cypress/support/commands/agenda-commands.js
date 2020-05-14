/*global cy, Cypress*/
/// <reference types="Cypress" />

// ***********************************************
// Commands

import agenda from '../../selectors/agenda.selectors';
import actionModel from '../../selectors/action-modal.selectors';
import form from '../../selectors/form.selectors';
import modal from '../../selectors/modal.selectors';
import utils from '../../selectors/utils.selectors';
import agendaOverview from '../../selectors/agenda-overview.selectors';

Cypress.Commands.add('createAgenda', createAgenda);
Cypress.Commands.add('openAgendaForDate', openAgendaForDate);
Cypress.Commands.add('deleteAgenda', deleteAgenda);
Cypress.Commands.add('setFormalOkOnItemWithIndex', setFormalOkOnItemWithIndex);
Cypress.Commands.add('approveCoAgendaitem', approveCoAgendaitem);
Cypress.Commands.add('approveDesignAgenda', approveDesignAgenda);
Cypress.Commands.add('addRemarkToAgenda', addRemarkToAgenda);
Cypress.Commands.add('addAgendaitemToAgenda', addAgendaitemToAgenda);
Cypress.Commands.add('toggleShowChanges', toggleShowChanges);
Cypress.Commands.add('agendaItemExists', agendaItemExists);
Cypress.Commands.add('openDetailOfAgendaitem', openDetailOfAgendaitem);
Cypress.Commands.add('changeSelectedAgenda', changeSelectedAgenda);
Cypress.Commands.add('closeAgenda', closeAgenda);
Cypress.Commands.add('releaseDecisions', releaseDecisions);
Cypress.Commands.add('releaseDocuments', releaseDocuments);
Cypress.Commands.add('createDefaultAgenda', createDefaultAgenda);
Cypress.Commands.add('openAgendaItemKortBestekTab', openAgendaItemKortBestekTab);
Cypress.Commands.add('clickAgendaitemTab', clickAgendaitemTab);
Cypress.Commands.add('createAgendaOnDate', createAgendaOnDate);
Cypress.Commands.add('agendaItemExistsInDetail', agendaItemExistsInDetail);

// ***********************************************
// Functions


/**
 * @description Goes to the agenda overview and creates a new agenda.
 * @name createAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} kind The kind of meeting to select, language and case sensitive
 * @param {*} plusMonths The positive amount of months from today to advance in the vl-datepicker
 * @param {*} date The cypress.moment object with the date and time to set
 * @param {*} location The location of the meeting to enter as input
 * @returns {Promise<String>} the id of the created agenda
 */
function createAgenda(kind, plusMonths, date, location) {

  // cy.route('GET', '/meetings**').as('getMeetings');
  cy.route('POST', '/meetings').as('createNewMeeting');
  cy.route('POST', '/agendas').as('createNewAgenda');
  cy.route('POST', '/agendaitems').as('createNewAgendaItems');
  cy.route('POST', '/newsletter-infos').as('createNewsletter');
  cy.route('PATCH', '/meetings/**').as('patchMeetings');

  cy.visit('')
  //   .wait('@getMeetings', { timeout: 20000 });
  cy.get('.vlc-toolbar__item > .vl-button')
    .contains('Nieuwe agenda aanmaken')
    .click();

  cy.get('.vl-modal-dialog').as('dialog').within(() => {
    cy.get('.vlc-input-field-block').as('newAgendaForm').should('have.length', 3);
  });

  // Set the kind
  cy.get('@newAgendaForm').eq(0).within(() => {
    cy.get('.ember-power-select-trigger').click();
  });
  cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
    cy.contains(kind).trigger('mouseover').click();
  });

  //Set the start date
  cy.get('@newAgendaForm').eq(1).within(() => {
    cy.get('.vl-datepicker').click();
  });
  //TODO get months by calculating instead
  cy.setDateAndTimeInFlatpickr(date, plusMonths);

  //Set the location
  cy.get('@newAgendaForm').eq(2).within(() => {
    cy.get('.vl-input-field').click().type(location);
  });

  cy.get('@dialog').within(() => {
    cy.get('.vlc-toolbar__item').contains('Toevoegen').click();
  });

  let meetingId;

  cy.wait('@createNewMeeting', { timeout: 20000 })
    .then((res) => {
      meetingId = res.responseBody.data.id;
    }).verifyAlertSuccess();

  cy.wait('@createNewAgenda', { timeout: 20000 });
  cy.wait('@createNewAgendaItems', { timeout: 20000 });
  cy.wait('@createNewsletter', { timeout: 20000 });
  cy.wait('@patchMeetings', { timeout: 20000 })
    .then(() => {
      return new Cypress.Promise((resolve) => {
        resolve(meetingId);
      });
    });
}

/**
 * Create a default agenda
 * @memberOf Cypress.Chainable#
 * @name createDefaultAgenda
 * @function
 * @param {String} kindOfAgenda - kind of agenda that should be made
 * @param {String} year - year that the agenda should be made on
 * @param {String} month - month that the agenda should be made on
 * @param {String} day - day that the agenda should be made on
 * @param {String} location - Location that the event is taking place
 */
function createDefaultAgenda(kindOfAgenda, year, month, day, location) {

  cy.route('POST', '/meetings').as('createNewMeeting');
  cy.route('POST', '/agendas').as('createNewAgenda');
  cy.route('POST', '/agendaitems').as('createNewAgendaItems');
  cy.route('POST', '/newsletter-infos').as('createNewsletter');
  cy.route('PATCH', '/meetings/**').as('patchMeetings');

  const TOEVOEGEN = 'Toevoegen';

  cy.get(agenda.createNewAgendaButton).click();
  cy.get(agenda.emberPowerSelectTrigger).click();
  cy.get(agenda.emberPowerSelectOption).contains(kindOfAgenda).click();
  cy.selectDate(year, month, day);
  cy.get(form.formInput).type(location);
  cy.get(agenda.button).contains(TOEVOEGEN).click();

  cy.wait('@createNewMeeting', { timeout: 20000 });
  cy.wait('@createNewAgenda', { timeout: 20000 });
  cy.wait('@createNewAgendaItems', { timeout: 20000 });
  cy.wait('@createNewsletter', { timeout: 20000 });
  cy.wait('@patchMeetings', { timeout: 20000 })
}


/**
 * Create a default agenda
 * @memberOf Cypress.Chainable#
 * @name createAgendaOnDate
 * @function
 * @param {String} kindOfAgenda - kind of agenda that should be made
 * @param {String} year - year that the agenda should be made on
 * @param {String} month - month that the agenda should be made on
 * @param {String} day - day that the agenda should be made on
 * @param {String} hour - hour of the day that the agenda should be made on
 * @param {String} minute - minute of the day that the agenda should be made on
 * @param {String} location - Location that the event is taking place
 */
function createAgendaOnDate(kindOfAgenda, year, month, day, hour, minute, location) {
  // Wait for all calls to finish before we continue the activities.
  cy.route('GET', '/meetings/**').as('meetings');
  // Create agenda backend calls
  cy.route('POST', '/meetings').as('createNewMeeting');
  cy.route('POST', '/agendas').as('createNewAgenda');
  cy.route('POST', '/agendaitems').as('createNewAgendaItems');
  cy.route('POST', '/newsletter-infos').as('createNewsletter');
  cy.route('PATCH', '/meetings/**').as('patchMeetings');

  return cy.wait('@meetings').its('status').should('to.equal', 200)
    .then(() => {
      return cy.existsAndVisible(agenda.createNewAgendaButton)
        .click()
        .then(() => {
          cy.existsAndInvisible(modal.vlModalComponents.createNewAgendaModal);
          cy.existsAndInvisible(modal.baseModal.container);
          cy.existsAndVisible(modal.baseModal.dialogWindow);
          return cy.existsAndVisible('.ember-power-select-trigger')
            .click()
            .then(() => {
              return cy.selectOptionInSelectByText(kindOfAgenda);
            }).then(() => {
              cy.existsAndVisible(utils.datePickerIcon)
                .click()
                .then(() => {
                  cy.setYearMonthDayHourMinuteInFlatPicker(year, month, day, hour, minute);
                });
            });
        })
        .then(() => {
          return cy.existsAndVisible(form.formInput).type(location).then(() => {
            return cy.existsAndVisible(form.formSave).click()
              .then(() => {
                cy.wait('@createNewAgenda').its('status').should('to.equal', 201);
                cy.wait('@createNewAgendaItems').its('status').should('to.equal', 201);
                cy.wait('@createNewsletter').its('status').should('to.equal', 201);
                cy.wait('@patchMeetings').its('status').should('to.equal', 204);
                return cy.wait('@createNewMeeting').then((xhr) => {
                  return xhr.response.body.data.id
                });
              })
          })
        });
    });
}

/**
 * @description Searches for the agendaDate in the history view of the agenda page, or uses the meetingId to open the meeting directly using the route 'agenda/meetingId/agendapunten'
 * @name openAgendaForDate
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} agendaDate A cypress.moment object with the date to search
 */
function openAgendaForDate(agendaDate) {
  const searchDate = agendaDate.date() + '/' + (agendaDate.month() + 1) + '/' + agendaDate.year();
  // cy.route('GET', '/meetings/**').as('getMeetings');
  cy.route('GET', '/meetings?filter**').as('getFilteredMeetings');

  cy.visit('');
  // cy.wait('@getMeetings', { timeout: 20000 });
  cy.get('.vlc-input-field-group-wrapper--inline', { timeout: 10000 }).should('exist').within(() => {
    cy.get(agendaOverview.agendaFilterInput).type(searchDate);
    cy.get(agendaOverview.agendaFilterButton).click();
  });
  cy.wait('@getFilteredMeetings', { timeout: 20000 });
  cy.get('.data-table > tbody > :nth-child(1) > .vl-u-align-center > .vl-button > .vl-button__icon').click();

  cy.url().should('include', '/vergadering');
  cy.url().should('include', '/agenda');
}

/**
 * Create a default agenda
 * @memberOf Cypress.Chainable#
 * @name openAgendaItemKortBestekTab
 * @function
 * @param {String} agendaItemTitle - title of the agendaitem
 */
function openAgendaItemKortBestekTab(agendaItemTitle, isDetailView = false) {
  // cy.route('GET', 'documents**').as('getDocuments');
  if(isDetailView) {
    cy.get(agenda.agendaDetailSidebarSubitem)
      .contains(agendaItemTitle)
      .click()
      .wait(2000); // sorry
  } else {
    cy.openDetailOfAgendaitem(agendaItemTitle);
  }

  cy.get(agenda.agendaItemKortBestekTab)
    .should('be.visible')
    .click()
    .wait(2000); //Access-levels GET occured earlier, general wait instead
}

/**
 * @description Deletes the current **open agenda**, either a design or an approved one
 * @name deleteAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {number} [meetingId] - The id of the meeting to delete to monitor if the DELETE call is made.
 * @param {boolean} [lastAgenda] - Wether the meeting will be deleted when this agenda is deleted.
 */
function deleteAgenda(meetingId, lastAgenda) {
  if (meetingId) {
    cy.route('DELETE', `/meetings/${meetingId}`).as('deleteMeeting');
  } else {
    cy.route('DELETE', '/meetings/**').as('deleteMeeting');
  }
  // cy.route('POST', '/agenda-approve/deleteAgenda').as('deleteAgenda'); //Call is made but cypress doesn't see it
  cy.route('DELETE', '/newsletter-infos/**').as('deleteNewsletter');

  cy.get(actionModel.showActionOptions).click();
  cy.get(actionModel.agendaHeaderDeleteAgenda).click();
  // cy.wait('@deleteAgenda', { timeout: 20000 }).then(() =>{
  cy.get('.vl-modal', { timeout: 20000 }).should('not.exist');
  // });
  if (lastAgenda) {
    cy.wait('@deleteNewsletter', { timeout: 20000 })
      .wait('@deleteMeeting', { timeout: 20000 });
  }
  //TODO should patches happen when deleting a design agenda ?
}

/**
 * @description Set the agendaitem with the given index to formally ok, only works if this value is not yet selected
 * @name setFormalOkOnItemWithIndex
 * @memberOf Cypress.Chainable#
 * @function
 */
function setFormalOkOnItemWithIndex(indexOfItem) {
  //TODO set only some items to formally ok with list as parameter
  cy.route('PATCH', '/agendaitems/**').as('patchAgendaItem');

  cy.clickReverseTab('Overzicht');

  cy.get('.vlc-agenda-items .vlc-toolbar__right > .vlc-toolbar__item')
    .last().as('editFormality');

  cy.get('@editFormality').click();

  cy.get('li.vlc-agenda-items__sub-item').as('agendaitems');
  cy.get('@agendaitems').eq(indexOfItem).scrollIntoView().within(() => {
    cy.get('.vl-u-spacer-extended-bottom-s').click();
  });
  cy.get('.ember-power-select-option')
    .contains('Formeel OK')
    .click()
    .wait('@patchAgendaItem')
    .wait(1000) // sorry ik zou hier moeten wachten op access-levels maar net zoveel keer als dat er items zijn ...
    .get('.ember-power-select-option').should('not.exist')
  cy.get('.vlc-agenda-items .vl-alert button')
    .click();
}

/**
 * @description Check all approval checkboxes of an agendaitem
 * @name approveCoAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} agendaitemShortTitle - The short title of the case with coapprovals, must be unique in an agenda.
 */
function approveCoAgendaitem(agendaitemShortTitle) {
  cy.route('GET', '/ise-codes/**').as('getIseCodes');
  cy.route('GET', '/government-fields/**').as('getGovernmentFields');
  cy.route('PATCH', '/approvals/**').as('patchApprovals');
  cy.route('PATCH', '/agendas/**').as('patchAgenda');

  cy.contains(agendaitemShortTitle).click();
  cy.wait('@getIseCodes', { timeout: 50000 });
  cy.wait('@getGovernmentFields', { timeout: 50000 });
  cy.get('.vlc-panel-layout__main-content').within(() => {

    cy.get('.vl-u-spacer-extended-bottom-l').as('detailBlocks');
    cy.get('@detailBlocks').eq(4).within(() => {
      cy.contains('Acties').should('exist');
      cy.contains('Wijzigen').click();
      cy.get('.vl-data-table > tbody > tr').as('mandatees');
      cy.get('@mandatees').each((item) => {
        cy.get(item).within(() => {
          cy.get('.vl-checkbox', { timeout: 10000 }).should('exist').click();
        })
      });

      cy.get('.vl-action-group > .vl-button--narrow')
        .contains('Opslaan')
        .click();
    });
  });
  cy.wait('@patchApprovals', { timeout: 10000 });
  cy.wait('@patchAgenda', { timeout: 10000 });
}

/**
 * @description Approve an open agenda when all formally OK's are set ()
 * @name approveDesignAgenda
 * @memberOf Cypress.Chainable#
 * @function
 */
function approveDesignAgenda() {
  cy.route('PATCH', '/agendas/**').as('patchAgenda');
  // cy.route('GET', '/agendaitems/**/subcase').as('getAgendaitems');
  cy.route('GET', '/agendas/**').as('getAgendas');

  //TODO add boolean for when not all items are formally ok, click through the confirmation modal
  //TODO use test selector
  cy.get('.vlc-toolbar').within(() => {
    cy.get('.vl-button--narrow')
      .contains('Ontwerpagenda')
      .click()
      .wait('@patchAgenda', { timeout: 12000 })
      // .wait('@getAgendaitems', { timeout: 12000 })
      .wait('@getAgendas', { timeout: 12000 });
  });
  cy.get('.vl-loader').should('not.exist');
}

/**
 * @description Creates a remark for an agenda and attaches any file in the files array
 * @name addRemarkToAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} title - The title of the remark
 * @param {String} remark - The remark
 * @param {{folder: String, fileName: String, fileExtension: String}[]} file
 */
function addRemarkToAgenda(title, remark, files) {
  cy.route('POST', '/agendaitems').as('createNewAgendaitem');
  cy.route('PATCH', '**').as('patchModel');

  cy.get('.vl-button--icon-before', { timeout: 10000 }).should('exist')
    .contains('Acties')
    .click();
  cy.get(actionModel.announcement)
    .contains('Mededeling toevoegen')
    .click();

  cy.get('.vl-modal-dialog').as('dialog').within(() => {
    cy.get('.vlc-input-field-block').as('newRemarkForm').should('have.length', 3);

    //Set title
    cy.get('@newRemarkForm').eq(0).within(() => {
      cy.get('.vl-input-field').click().type(title);
    });

    //Set remark
    cy.get('@newRemarkForm').eq(1).within(() => {
      cy.get('.vl-textarea').click().type(remark);
    });

    //add file
    cy.get('@newRemarkForm').eq(2).within(() => {
      files.forEach((file) => {
        cy.get('@dialog').within(() => {
          cy.uploadFile(file.folder, file.fileName, file.fileExtension);
        });
      });
    });
    cy.get('.vl-button').contains('Mededeling toevoegen').click();
  });
  cy.wait('@createNewAgendaitem', { timeout: 20000 })
  //TODO patchmodel does not happen ??
  // cy.wait('@patchModel', { timeout: 20000 }).verifyAlertSuccess();
}

/**
 * @description Add a new case to the agenda
 * @name addAgendaitemToAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} caseTitle - The title of the case
 * @param {boolean} postponed - The remark
 */
function addAgendaitemToAgenda(caseTitle, postponed) {
  cy.route('GET', '/subcases?**sort**').as('getSubcasesFiltered');
  cy.route('POST', '/agendaitems').as('createNewAgendaitem');
  cy.route('POST', '/subcase-phases').as('createSubcasePhase');
  cy.route('PATCH', '/subcases/**').as('patchSubcase');
  cy.route('PATCH', '/agendas/**').as('patchAgenda');

  cy.contains('Pagina is aan het laden').should('not.exist');
  cy.get('.vl-button--icon-before', { timeout: 10000 }).should('exist')
    .contains('Acties')
    .click();
  cy.get(actionModel.navigatetosubcases)
    .should('be.visible')
    .click();
  cy.wait('@getSubcasesFiltered', { timeout: 20000 });

  cy.get('.vl-modal-dialog').as('dialog').within(() => {
    cy.get('.vl-form-grid').children().as('formGrid');

    if (postponed) {
      cy.get('@formGrid').eq(1).within(() => {
        cy.get('.vl-checkbox--switch__label').click();
      });
    }
    cy.get('.is-loading-data', { timeout: 12000 }).should('not.exist');

    // cy.route('GET', `/subcases?filter[:has-no:agendaitems]=yes&filter[:not:is-archived]=true&filter[short-title]=${caseTitle}**`).as('getSubcasesFiltered');
    // cy.route('GET', `/subcases?filter[:has-no:agendaitems]=yes&filter[:not:is-archived]=true&filter[short-title]=${caseTitle}**`).as('getSubcasesFilteredBetter');


    if (caseTitle) {
      cy.get('@formGrid').eq(0).within(() => {
        cy.get('.vl-input-field').clear().type(caseTitle, { force: true });
        cy.route('GET', `/subcases?filter**filter[short-title]=${caseTitle}**`).as('getSubcasesFiltered');
        cy.wait('@getSubcasesFiltered', { timeout: 12000 });
        cy.get('.vl-loader').should('not.exist');
      });
      cy.get('table > tbody > tr').as('rows');
    } else {
      cy.get('table > tbody > tr').as('rows');
      cy.get('@rows', { timeout: 12000 }).should('not.have.length', 1)
    }
    cy.get('@rows', { timeout: 12000 }).eq(0).click().get('[type="checkbox"]').should('be.checked');
    cy.get('.vl-button').contains('Agendapunt toevoegen').click();
  });
  cy.wait('@createNewAgendaitem', { timeout: 20000 })
    .wait('@patchSubcase', { timeout: 20000 })
    .wait('@createSubcasePhase', { timeout: 20000 })
    .wait('@patchAgenda', { timeout: 20000 })
}

/**
 * @description Toggles the show changes
 * @name toggleShowChanges
 * @memberOf Cypress.Chainable#
 * @function
 * @param {boolean} refresh - boolean to check if a refresh needs to happen.
 */
function toggleShowChanges(refresh) {
  cy.route('GET', '/agendaitems?filter**').as('getAgendaitems');
  // cy.route('GET', '/agenda-sort/agenda-with-changes**').as('getChanges');

  if (refresh) {
    cy.get('.vlc-side-nav-item', { timeout: 12000 })
      .last({ timeout: 12000 })
      .click();
    cy.wait('@getAgendaitems', { timeout: 20000 });
    cy.get('.vlc-side-nav-item', { timeout: 12000 })
      .first({ timeout: 12000 })
      .click();
    // cy.wait('@getChanges', {timeout: 20000});
  } else {
    cy.clickReverseTab('Overzicht');
  }

  cy.get('.vlc-agenda-items .vlc-toolbar__right > .vlc-toolbar__item')
    .first()
    .click();
}

/**
 * @description Checks if an agendaitem with a specific name exists on an agenda
 * @name agendaItemExists
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaItemName - boolean to check if a refresh needs to happen.
 */
function agendaItemExists(agendaItemName) {
  cy.get('li.vlc-agenda-items__sub-item h4')
    .contains(agendaItemName, { timeout: 12000 })
    .should('exist');
}

/**
 * @description Checks if a case with a specific name exists on an agenda
 * @name agendaItemExistsInDetail
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaItemName - boolean to check if a refresh needs to happen.
 */
function agendaItemExistsInDetail(agendaItemName) {
  cy.get(agenda.agendaDetailSidebarSubitem)
    .contains(agendaItemName, { timeout: 12000 })
    .should('exist');
}

/**
 * @description Checks if an agendaitem with a specific name exists on the open agenda and opens it
 * @name openDetailOfAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaItemName - title of the agendaitem.
*  @param {boolean} hasSubcase - optional boolean to indicate if this agendaitem has a subcase
 */
function openDetailOfAgendaitem(agendaItemName, hasSubcase = true) {
  cy.agendaItemExists(agendaItemName).click();
  if (hasSubcase) {
    cy.contains('Naar procedurestap', { timeout: 12000 });
  } else {
    cy.wait(2000);
  }
}

/**
 * @description Changes the selected agenda to the one matching the given name
 * @name changeSelectedAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaName - name of the agenda item
 */
function changeSelectedAgenda(agendaName) {
  cy.get('.vlc-side-nav-item').children()
    .contains(agendaName, { timeout: 12000 })
    .should('exist')
    .click();
}

/**
 * @description closes an agenda
 * @name closeAgenda
 * @memberOf Cypress.Chainable#
 * @function
 */
function closeAgenda() {
  cy.get('.vl-button--icon-before')
    .contains('Acties')
    .click();
  cy.get(actionModel.lockAgenda).click();
  cy.get('.vl-modal', { timeout: 20000 }).should('not.exist');

}

/**
 * @description releases the decisions of the current meeting
 * @name releaseDecisions
 * @memberOf Cypress.Chainable#
 * @function
 */
function releaseDecisions() {
  cy.get('.vl-button--icon-before')
    .contains('Acties')
    .click();
  cy.get(actionModel.releaseDecisions).click();
  cy.get('.vl-modal').within(() => {
    cy.get('.vl-button').contains('Vrijgeven').click();
  });
  cy.get('.vl-modal', { timeout: 20000 }).should('not.exist');
}

/**
 * @description releases the documents of the current meeting
 * @name releaseDocuments
 * @memberOf Cypress.Chainable#
 * @function
 */
function releaseDocuments() {
  cy.get('.vl-button--icon-before')
    .contains('Acties')
    .click();
  cy.get(actionModel.releaseDocuments).click();
  cy.get('.vl-modal').within(() => {
    cy.get('.vl-button').contains('Vrijgeven').click();
  });
  cy.get('.vl-modal', { timeout: 20000 }).should('not.exist');
}

/**
 * @description Clicks on the specified agendaitem tab for navigating
 * @name clickAgendaitemTab
 * @if class="vlc-tabs"
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} selector The name of the tab to click on, case sensitive
 */
function clickAgendaitemTab(selector) {
  cy.get(selector).should('be.visible').click();
}
