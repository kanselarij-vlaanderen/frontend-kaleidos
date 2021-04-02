/* global cy, Cypress */
// / <reference types="Cypress" />

// ***********************************************
// Commands

import agenda from '../../selectors/agenda.selectors';
import actionModel from '../../selectors/action-modal.selectors';
import form from '../../selectors/form.selectors';
import modal from '../../selectors/modal.selectors';
import utils from '../../selectors/utils.selectors';
import agendaOverview from '../../selectors/agenda-overview.selectors';
import auComponents from '../../selectors/au-component-selectors';

// ***********************************************
// Functions

/**
 * @description Goes to the agenda overview and creates a new agenda.
 * @name createAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} kind The kind of meeting to select, language and case sensitive
 * @param {*} date The cypress.moment object with the date and time to set
 * @param {string} location The location of the meeting to enter as input
 * @param {number} meetingNumber The number of the meeting to enter as input
 * @param {string} meetingNumberVisualRepresentation The visual representation of the meetingnumber to enter as input
 * @returns {Promise<String>} the id of the created agenda
 */
function createAgenda(kind, date, location, meetingNumber, meetingNumberVisualRepresentation) {
  cy.log('createAgenda');
  cy.route('POST', '/meetings').as('createNewMeeting');
  cy.route('POST', '/agendas').as('createNewAgenda');
  cy.route('POST', '/newsletter-infos').as('createNewsletter');
  cy.route('PATCH', '/meetings/**').as('patchMeetings');

  cy.visit('');
  cy.get(agenda.createNewAgendaButton).click();

  cy.get('.auk-modal').as('dialog')
    .within(() => {
      cy.get('.vlc-input-field-block').as('newAgendaForm')
        .should('have.length', 4);
    });

  // Set the kind
  cy.get('@newAgendaForm').eq(0)
    .within(() => {
      cy.get('.ember-power-select-trigger').click();
    });
  cy.get('.ember-power-select-option', {
    timeout: 5000,
  }).should('exist')
    .then(() => {
      cy.wait(500); // TODO Experiment for dropdown flakyness, see if waiting before helps
      cy.contains(kind).scrollIntoView()
        .trigger('mouseover')
        .click({
          force: true,
        });
      // TODO Experiment for dropdown flakyness
      // Does the ember-power-select-option fix itself if we wait long enough ?
      cy.get('.ember-power-select-option', {
        timeout: 15000,
      }).should('not.be.visible');
    // Could/Should we verify that the dropdown has closed, and try to repeat the process if not ?
    });

  // Set the start date
  cy.get('@newAgendaForm').eq(1)
    .within(() => {
      cy.get('.vl-datepicker').click();
    });
  cy.setDateAndTimeInFlatpickr(date);

  // Set the meetingNumber
  cy.get('@newAgendaForm').eq(2)
    .within(() => {
      if (meetingNumber) {
        cy.get('.auk-input').click({
          force: true,
        })
          .clear()
          .type(meetingNumber);
      } else {
        cy.get('.auk-input').click({
          force: true,
        })
          .invoke('val')
          // eslint-disable-next-line
          .then((sometext) => meetingNumber = sometext);
      }
    });

  // Set the meetingNumber
  if (meetingNumberVisualRepresentation) {
    cy.get(form.meeting.meetingEditIdentifierButton).click({
      force: true,
    });
    cy.get(form.formInput).eq(1)
      .click()
      .clear()
      .type(meetingNumberVisualRepresentation);
    cy.get(utils.saveButton).contains('Opslaan')
      .click();
  } else {
    cy.get(form.meeting.meetingEditIdentifierButton).click({
      force: true,
    });

    cy.get(form.formInput).eq(1)
      .click({
        force: true,
      })
      .invoke('val')
      // eslint-disable-next-line
      .then((sometext) => meetingNumberVisualRepresentation = sometext);
  }

  // Set the location
  cy.get('@newAgendaForm').eq(3)
    .within(() => {
      cy.get('.auk-input').click({
        force: true,
      })
        .type(location);
    });

  cy.get('@dialog').within(() => {
    cy.get(modal.modalFooterSaveButton).click();
  });

  let meetingId;
  let agendaId;

  cy.wait('@createNewMeeting', {
    timeout: 20000,
  })
    .then((res) => {
      meetingId = res.responseBody.data.id;
    });
  cy.wait('@createNewAgenda', {
    timeout: 20000,
  })
    .then((res) => {
      agendaId = res.responseBody.data.id;
    });
  cy.log('/createAgenda');
  cy.wait('@patchMeetings', {
    timeout: 20000,
  })
    .then(() => new Cypress.Promise((resolve) => {
      resolve({
        meetingId, meetingNumber, agendaId, meetingNumberVisualRepresentation,
      });
    }));
}

/**
 * @description basic visit to agenda with some data loading
 * @name visitAgendaWithLink
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} link The link to visit, should be "/vergadering/id/agenda/id/agendapunten" or "/vergadering/id/agenda/id/agendapunten/id"
 */
function visitAgendaWithLink(link) {
  cy.log('visitAgendaWithLink');
  cy.route('GET', '/agendaitems/*/agenda-activity').as('loadAgendaitems');
  cy.visit(link);
  cy.wait('@loadAgendaitems');
  cy.log('/visitAgendaWithLink');
}

/**
 * @description Searches for the agendaDate in the history view of the agenda page, or uses the meetingId to open the meeting directly using the route 'agenda/meetingId/agendapunten'
 * @name openAgendaForDate
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} agendaDate A cypress.moment object with the date to search
 */
function openAgendaForDate(agendaDate) {
  cy.log('openAgendaForDate');
  const searchDate = `${agendaDate.date()}/${agendaDate.month() + 1}/${agendaDate.year()}`;
  // cy.route('GET', '/meetings/**').as('getMeetings');
  cy.route('GET', '/meetings?filter**').as('getFilteredMeetings');

  cy.visit('');
  // cy.wait('@getMeetings', { timeout: 20000 });
  cy.get('.vlc-input-field-group-wrapper--inline', {
    timeout: 10000,
  }).should('exist')
    .within(() => {
      cy.get(agendaOverview.agendaFilterInput).type(searchDate);
      cy.get(agendaOverview.agendaFilterButton).click();
    });
  cy.wait('@getFilteredMeetings', {
    timeout: 20000,
  });
  cy.get('.data-table > tbody > :nth-child(1) > .auk-u-text-align--center > .auk-button > .auk-icon').click();

  cy.url().should('include', '/vergadering');
  cy.url().should('include', '/agenda');
  cy.log('/openAgendaForDate');
}

/**
 * Goes to the detailview of agendaitem and opens the kort-bestek tab
 * @memberOf Cypress.Chainable#
 * @name openAgendaitemKortBestekTab
 * @function
 * @param {String} agendaitemTitle - title of the agendaitem
 */
function openAgendaitemKortBestekTab(agendaitemTitle) {
  cy.openDetailOfAgendaitem(agendaitemTitle);
  cy.get(agenda.agendaitemKortBestekTab)
    .should('be.visible')
    .click();
}

/**
 * @description Deletes the current **open agenda**, either a design or an approved one
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * @name deleteAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {number} [meetingId] - The id of the meeting to delete to monitor if the DELETE call is made.
 * @param {boolean} [lastAgenda] - Wether the meeting will be deleted when this agenda is deleted.
 * @param {Boolean} shouldConfirm - Default true, should the command click the confirm button? false is used if you want to check the message in the modal
 */
function deleteAgenda(meetingId, lastAgenda, shouldConfirm = true) {
  cy.log('deleteAgenda');
  if (meetingId) {
    cy.route('DELETE', `/meetings/${meetingId}`).as('deleteMeeting');
  } else {
    cy.route('DELETE', '/meetings/**').as('deleteMeeting');
  }
  // cy.route('POST', '/agenda-approve/deleteAgenda').as('deleteAgenda');
  // Call is made but cypress doesn't see it
  cy.route('DELETE', '/newsletter-infos/**').as('deleteNewsletter');
  cy.route('GET', '/agendaitems?fields**').as('loadAgendaitems');

  cy.get(actionModel.showAgendaOptions).click();
  cy.get(actionModel.agendaHeaderDeleteAgenda).click();
  if (shouldConfirm) {
    cy.get(modal.auModal.container).within(() => {
      cy.get(modal.auModal.save).click();
    });
    if (lastAgenda) {
      cy.wait('@deleteNewsletter', {
        timeout: 20000,
      })
        .wait('@deleteMeeting', {
          timeout: 20000,
        });
    }
    cy.get(modal.auModal.container, {
      timeout: 20000,
    }).should('not.exist');
    if (!lastAgenda) {
      cy.wait('@loadAgendaitems');
    }
  }

  cy.log('/deleteAgenda');
  // TODO should patches happen when deleting a design agenda ?
}

/**
 * @description Set the agendaitem with the given index to formally ok, only works if this value is not yet selected
 * @name setFormalOkOnItemWithIndex
 * @memberOf Cypress.Chainable#
 * @function
 */
function setFormalOkOnItemWithIndex(indexOfItem, fromWithinAgendaOverview = false, formalityStatus = 'Formeel OK') {
  cy.log('setFormalOkOnItemWithIndex');
  // TODO set only some items to formally ok with list as parameter
  if (!fromWithinAgendaOverview) {
    cy.clickReverseTab('Overzicht');
  }
  cy.get(agendaOverview.agendaEditFormallyOkButton).click();
  cy.wait(2000); // TODO await data loading after clicking this button?

  cy.get('.vlc-agenda-items__sub-item').as('agendaitems');
  cy.get('@agendaitems').eq(indexOfItem)
    .scrollIntoView()
    .within(() => {
      cy.get(agenda.agendaOverviewItemFormallyok).click();
    });
  const int = Math.floor(Math.random() * Math.floor(10000));
  cy.route('PATCH', '/agendaitems/**').as(`patchAgendaitem_${int}`);
  cy.get('.ember-power-select-option')
    .contains(formalityStatus)
    .click();
  cy.wait(`@patchAgendaitem_${int}`)
    .wait(1000); // sorry ik zou hier moeten wachten op access-levels maar net zoveel keer als dat er items zijn ...
  // .get('.ember-power-select-option').should('not.exist');
  cy.get('.vlc-agenda-items .vl-alert button')
    .click();
  cy.log('/setFormalOkOnItemWithIndex');
}

/**
 * @description Set all agendaitems to formallyOk
 * @name setAllItemsFormallyOk
 * @memberOf Cypress.Chainable#
 * @function
 */
function setAllItemsFormallyOk(amountOfFormallyOks) {
  cy.log('setAllItemsFormallyOk');
  cy.route('GET', '/agendaitems/*/modified-by').as('getModifiedByOfAgendaitems');
  // TODO set only some items to formally ok with list as parameter
  cy.get(actionModel.showActionOptions).click();
  cy.route('PATCH', '/agendaitems/**').as('patchAgendaitems');
  cy.get(actionModel.approveAllAgendaitems).click();
  cy.contains(`Bent u zeker dat u ${amountOfFormallyOks} agendapunten formeel wil goedkeuren`);
  cy.get(modal.verify.save).click();
  cy.wait('@patchAgendaitems');
  cy.wait('@getModifiedByOfAgendaitems');
  cy.log('/setAllItemsFormallyOk');
}


/**
 * @description Check all approval checkboxes of an agendaitem
 * @name approveCoAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} agendaitemShortTitle - The short title of the case with coapprovals, must be unique in an agenda.
 */
function approveCoAgendaitem(agendaitemShortTitle) {
  cy.log('approveCoAgendaitem');
  cy.route('GET', '/government-fields/**/domain').as('getGovernmentFieldDomains');
  cy.route('PATCH', '/approvals/**').as('patchApprovals');
  cy.route('PATCH', '/agendas/**').as('patchAgenda');

  cy.contains(agendaitemShortTitle).click();
  cy.wait('@getGovernmentFieldDomains', {
    timeout: 50000,
  });
  cy.get('.vlc-panel-layout__main-content').within(() => {
    cy.get('.auk-u-mb-8').as('detailBlocks');
    cy.get('@detailBlocks').eq(4)
      .within(() => {
        cy.contains('Acties').should('exist');
        cy.contains('Wijzigen').click();
        cy.get('.auk-table > tbody > tr').as('mandatees');
        cy.get('@mandatees').each((item) => {
          cy.get(item).within(() => {
            cy.get('.auk-checkbox', {
              timeout: 10000,
            }).should('exist')
              .click();
          });
        });

        cy.get('.auk-toolbar-complex__item > .auk-button')
          .contains('Opslaan')
          .click();
      });
  });
  cy.wait('@patchApprovals', {
    timeout: 10000,
  });
  cy.wait('@patchAgenda', {
    timeout: 10000,
  });
  cy.log('/approveCoAgendaitem');
}

/**
 * @description triggers the action "approve agenda" in agenda view
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * This pop will contain information about which agendaitems are not ok, if any
 * @name approveDesignAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Boolean} shouldConfirm - Default true, should the command click the confirm button
 */
function approveDesignAgenda(shouldConfirm = true) {
  cy.log('approveDesignAgenda');
  // cy.route('PATCH', '/agendas/**').as('patchAgenda');
  // cy.route('GET', '/agendaitems/**/subcase').as('getAgendaitems');
  // cy.route('GET', '/agendas/**').as('getAgendas');

  // TODO add boolean for when not all items are formally ok, click through the confirmation modal
  // TODO use test selector
  cy.get('.vlc-toolbar').within(() => {
    cy.get(agenda.agendaHeaderShowAgendaOptions).click();
  });
  cy.get(agenda.approveAgenda).click();
  if (shouldConfirm) {
    cy.get(modal.auModal.container).within(() => {
      cy.get(modal.auModal.save).click();
    });
    // as long as the modal exists, the action is not completed
    cy.get(modal.auModal.container, {
      timeout: 60000,
    }).should('not.exist');
  }
  // .wait('@patchAgenda', {
  //   timeout: 12000,
  // })
  // .wait('@getAgendaitems', { timeout: 12000 })
  // .wait('@getAgendas', {
  //   timeout: 12000,
  // });

  // cy.get(modal.auModal.container, {
  //   timeout: 60000,
  // }).should('not.exist');
  cy.log('/approveDesignAgenda');
}

/**
 * @description triggers the action "approve and close agenda" in agenda view
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * This pop will contain information about which agendaitems are not ok, if any
 * @name approveAndCloseDesignAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {Boolean} shouldConfirm - Default true, should the command click the confirm button
 */
function approveAndCloseDesignAgenda(shouldConfirm = true) {
  cy.log('approveAndCloseDesignAgenda');
  cy.route('PATCH', '/agendas/**').as('patchAgendaAndCloseAgenda');
  cy.route('GET', '/agendas/**').as('getAgendasInCloseDesignAgenda');

  // TODO add boolean for when not all items are formally ok, click through the confirmation modal
  // TODO use test selector
  cy.get('.vlc-toolbar').within(() => {
    cy.get(agenda.agendaHeaderShowAgendaOptions).click();
  });
  cy.get(agenda.agendaHeaderApproveAndCloseAgenda).click();
  if (shouldConfirm) {
    cy.get(modal.auModal.container).within(() => {
      cy.get(modal.auModal.save).click();
    });
    // as long as the modal exists, the action is not completed
    cy.get(modal.auModal.container, {
      timeout: 60000,
    }).should('not.exist');
  }
  cy.log('/approveAndCloseDesignAgenda');
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
  cy.log('addAgendaitemToAgenda');
  cy.route('GET', '/subcases?**sort**').as('getSubcasesFiltered');
  cy.route('POST', '/agendaitems').as('createNewAgendaitem');
  cy.route('POST', '/agenda-activities').as('createAgendaActivity');
  cy.route('PATCH', '/subcases/**').as('patchSubcase');
  cy.route('PATCH', '/agendas/**').as('patchAgenda');

  cy.contains('Pagina is aan het laden').should('not.exist');
  cy.get(actionModel.showActionOptions).click();
  cy.get(actionModel.addAgendaitems)
    .should('be.visible')
    .click();
  cy.wait('@getSubcasesFiltered', {
    timeout: 20000,
  });

  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  cy.get('.auk-modal').as('dialog')
    .within(() => {
      if (postponed) {
        cy.get('[data-test-postponed-checkbox]')
          .within(() => {
            cy.get('.vl-toggle__label').click();
          });
      }
      cy.get('.auk-loader', {
        timeout: 12000,
      }).should('not.exist');
      if (caseTitle) {
        cy.get('.vl-input-field').clear()
          .type(caseTitle, {
            force: true,
          });
        cy.route('GET', `/subcases?filter**filter[short-title]=${caseTitle}**`).as('getSubcasesFiltered');
        cy.wait('@getSubcasesFiltered', {
          timeout: 12000,
        });
        cy.get('.auk-loader').should('not.exist');
        cy.get('table > tbody > tr').as('rows');
      } else {
        cy.get('table > tbody > tr').as('rows');
        cy.get('@rows', {
          timeout: 12000,
        }).should('not.have.length', 1);
      }
      cy.get('.auk-loader').should('not.exist');
      cy.get('@rows', {
        timeout: 12000,
      }).eq(0)
        .click()
        .get('[type="checkbox"]')
        .should('be.checked');
      cy.get(modal.modalFooterSaveButton).click();
    });

  cy.wait('@createAgendaActivity', {
    timeout: 20000,
  });
  cy.route('GET', '/agendaitems?fields**').as(`loadAgendaitemFields${randomInt}`);
  cy.wait('@createNewAgendaitem', {
    timeout: 20000,
  })
    .wait('@patchSubcase', {
      timeout: 20000,
    })
    .wait('@patchAgenda', {
      timeout: 20000,
    });
  cy.wait(`@loadAgendaitemFields${randomInt}`);
  cy.log('/addAgendaitemToAgenda');
}

/**
 * @description Toggles the show changes
 * @name toggleShowChanges
 * @memberOf Cypress.Chainable#
 * @function
 * @param {boolean} refresh - boolean to check if a refresh needs to happen.
 */
function toggleShowChanges(refresh) {
  cy.log('toggleShowChanges');
  cy.route('GET', '/agendaitems?fields**').as('getAgendaitems');

  // TODO, refresh is no longer needed
  if (refresh) {
  //   cy.get('.vlc-side-nav-item', {
  //     timeout: 12000,
  //   })
  //     .last({
  //       timeout: 12000,
  //     })
  //     .click();
  //   cy.wait('@getAgendaitems', {
  //     timeout: 20000,
  //   });
  //   cy.get('.vlc-side-nav-item', {
  //     timeout: 12000,
  //   })
  //     .first({
  //       timeout: 12000,
  //     })
  //     .click();
  //   cy.wait(2000); // a lot of data is being reloaded
  // } else {
    cy.clickReverseTab('Overzicht');
    cy.wait(2500); // data loading after switching to overzicht
  }

  cy.get('.vlc-agenda-items .vlc-toolbar__right > .vlc-toolbar__item')
    .first()
    .click();
  cy.wait(1500); // the changes are not loaded yet, cypress does not find the get call to agenda-sort
  cy.log('/toggleShowChanges');
}

/**
 * @description Checks if an agendaitem with a specific name exists on an agenda,
 * if you want to open the agendaitem at the same time, use cy.openDetailOfAgendaitem(agendaitemName)
 * @name agendaitemExists
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemName - boolean to check if a refresh needs to happen.
 */
function agendaitemExists(agendaitemName) {
  cy.log('agendaitemExists');
  cy.wait(200);
  // Check which reverse tab is active
  cy.get(auComponents.auLoading, {
    timeout: 20000,
  }).should('not.exist');
  cy.get('.vlc-tabs-reverse__link--active').then((element) => {
    const selectedReverseTab = element[0].text;
    if (selectedReverseTab.includes('Details')) {
      cy.get(agenda.agendaDetailSidebarSubitem)
        .contains(agendaitemName, {
          timeout: 12000,
        })
        .should('exist');
    } else {
      if (!selectedReverseTab.includes('Overzicht')) {
        cy.clickReverseTab('Overzicht');
        // data loading could be awaited  '/agendaitem?fields**' or next get() fails, solved bij checking loading modal
        cy.log('data needs to be loaded now, waiting a few seconds');
        cy.get(auComponents.auLoading, {
          timeout: 20000,
        }).should('not.exist');
      }
      cy.get(agenda.agendaOverviewSubitem)
        .contains(agendaitemName, {
          timeout: 24000,
        })
        .should('exist');
    }
  });
  cy.log('/agendaitemExists');
}

/**
 * @description Checks if an agendaitem with a specific name exists on the open agenda and opens it
 * @name openDetailOfAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemName - title of the agendaitem.
*  @param {boolean} isAdmin - optional boolean to indicate that we are admin (some profiles can't see the link to subcase)
 */
function openDetailOfAgendaitem(agendaitemName, isAdmin = true) {
  cy.log('openDetailOfAgendaitem');
  cy.agendaitemExists(agendaitemName);
  cy.contains(agendaitemName)
    .scrollIntoView()
    .click();
  cy.wait(1000);
  cy.url().should('include', 'agendapunten');
  cy.get('[data-test-agenda-agendaitem] .active').then((element) => {
    const selectedTab = element[0].text;
    if (!selectedTab.includes('Dossier')) {
      cy.wait(3000); // TODO wait to ensure the page and tabs are loaded, find a better to check this
      cy.get(agenda.agendaitemDossierTab).click();
    }
    if (isAdmin) {
      cy.wait(1000); // "Naar procedurestap" was showing up before dissapearing again, failing any tab click that followed because the tabs were not ready/showing
      cy.contains('Naar procedurestap', {
        timeout: 12000,
      });
    } else {
      cy.wait(3000); // TODO wait to ensure the page is loaded, find a better way to check this for other profiles
    }
  });
  cy.log('/openDetailOfAgendaitem');
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
    .contains(agendaName, {
      timeout: 12000,
    })
    .should('exist')
    .click();
  cy.wait(2000); // TODO await calls after switch
}

/**
 * @description closes an agenda
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * @name closeAgenda
 * @memberOf Cypress.Chainable#
 * @function
 */
function closeAgenda() {
  cy.log('closeAgenda');
  cy.get(actionModel.showAgendaOptions).click();
  cy.get(actionModel.lockAgenda).click();
  cy.get(modal.auModal.container).within(() => {
    cy.get(modal.auModal.save).click();
  });
  // as long as the modal exists, the action is not completed
  cy.get(modal.auModal.container, {
    timeout: 60000,
  }).should('not.exist');
  cy.log('/closeAgenda');
}

/**
 * @description releases the decisions of the current meeting
 * @name releaseDecisions
 * @memberOf Cypress.Chainable#
 * @function
 */
function releaseDecisions() {
  cy.log('releaseDecisions');
  cy.get(actionModel.showActionOptions).click();
  cy.get(actionModel.releaseDecisions).click({
    force: true,
  });
  cy.get(modal.modal).within(() => {
    cy.get('.auk-button').contains('Vrijgeven')
      .click();
  });
  cy.get(modal.modal, {
    timeout: 20000,
  }).should('not.exist');
  cy.log('/releaseDecisions');
}

/**
 * @description releases the documents of the current meeting
 * @name releaseDocuments
 * @memberOf Cypress.Chainable#
 * @function
 */
function releaseDocuments() {
  cy.log('releaseDocuments');
  cy.get(actionModel.showActionOptions).click();
  cy.get(actionModel.releaseDocuments).click();
  cy.get(modal.modal).within(() => {
    cy.get('.auk-button').contains('Vrijgeven')
      .click();
  });
  cy.get(modal.modal, {
    timeout: 20000,
  }).should('not.exist');
  cy.log('/releaseDocuments');
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
  cy.get(selector).should('be.visible')
    .click();
}

Cypress.Commands.add('createAgenda', createAgenda);
Cypress.Commands.add('openAgendaForDate', openAgendaForDate);
Cypress.Commands.add('visitAgendaWithLink', visitAgendaWithLink);
Cypress.Commands.add('deleteAgenda', deleteAgenda);
Cypress.Commands.add('setFormalOkOnItemWithIndex', setFormalOkOnItemWithIndex);
Cypress.Commands.add('approveCoAgendaitem', approveCoAgendaitem);
Cypress.Commands.add('approveDesignAgenda', approveDesignAgenda);
Cypress.Commands.add('addAgendaitemToAgenda', addAgendaitemToAgenda);
Cypress.Commands.add('toggleShowChanges', toggleShowChanges);
Cypress.Commands.add('agendaitemExists', agendaitemExists);
Cypress.Commands.add('openDetailOfAgendaitem', openDetailOfAgendaitem);
Cypress.Commands.add('changeSelectedAgenda', changeSelectedAgenda);
Cypress.Commands.add('closeAgenda', closeAgenda);
Cypress.Commands.add('releaseDecisions', releaseDecisions);
Cypress.Commands.add('releaseDocuments', releaseDocuments);
Cypress.Commands.add('openAgendaitemKortBestekTab', openAgendaitemKortBestekTab);
Cypress.Commands.add('clickAgendaitemTab', clickAgendaitemTab);
Cypress.Commands.add('approveAndCloseDesignAgenda', approveAndCloseDesignAgenda);
Cypress.Commands.add('setAllItemsFormallyOk', setAllItemsFormallyOk);
