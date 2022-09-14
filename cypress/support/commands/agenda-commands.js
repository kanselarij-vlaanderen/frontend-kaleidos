/* global cy, Cypress */
// / <reference types="Cypress" />

// ***********************************************
// Commands

import agenda from '../../selectors/agenda.selectors';
import auk from '../../selectors/auk.selectors';
import dependency from '../../selectors/dependency.selectors';
import route from '../../selectors/route.selectors';
import utils from '../../selectors/utils.selectors';

// ***********************************************
// Functions

/**
 * @description Goes to the agenda overview and creates a new agenda.
 * @name createAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} kind The kind of meeting to select, language and case sensitive
 * @param {*} date The Cypress.dayjs object with the date and time to set
 * @param {string} location The location of the meeting to enter as input
 * @param {number} meetingNumber The number of the meeting to enter as input
 * @param {string} meetingNumberVisualRepresentation The visual representation of the meetingnumber to enter as input
 * @param {*} plannedRelease The Cypress.dayjs object with the date and time to set for the planned release of the documents
 * @returns {Promise<String>} the id of the created agenda
 */
function createAgenda(kind, date, location, meetingNumber, meetingNumberVisualRepresentation, plannedRelease) {
  cy.log('createAgenda');
  cy.intercept('POST', '/meetings').as('createNewMeeting');
  cy.intercept('POST', '/agendas').as('createNewAgenda');
  cy.intercept('POST', '/newsletter-infos').as('createNewsletter');
  cy.intercept('POST', '/agendaitems').as('createAgendaitem');

  cy.visit('/overzicht?size=2');
  cy.get(route.agendas.action.newMeeting).click();

  // Set the kind
  // Added wait, mouseover, force clicking and checking for existance of the ember power select option because of flakyness
  // Sometimes, the dropdown stays after pressing an option
  if (kind) {
    cy.get(utils.kindSelector.kind).click();
    cy.get(dependency.emberPowerSelect.option, {
      timeout: 5000,
    }).wait(500)
      .contains(kind)
      .scrollIntoView()
      .trigger('mouseover')
      .click({
        force: true,
      });
    cy.get(dependency.emberPowerSelect.option, {
      timeout: 15000,
    }).should('not.exist');
  }

  // Set the start date
  cy.get(agenda.editMeeting.datepicker).find(auk.datepicker)
    .click();
  cy.setDateAndTimeInFlatpickr(date);
  // At this point, the flatpickr is still open and covers the other fields
  // To negate this, we click once with force:true on the next input field to close it
  cy.get(agenda.editMeeting.meetingNumber).click({
    force: true,
  });

  // Set the planned document release
  if (plannedRelease) {
    cy.get(agenda.editMeeting.documentPublicationDate).find(auk.datepicker)
      .click();
    cy.setDateAndTimeInFlatpickr(plannedRelease);
    cy.get(agenda.editMeeting.meetingNumber).click({
      force: true,
    });
  }

  // Set the meetingNumber
  if (meetingNumber) {
    cy.get(agenda.editMeeting.meetingNumber).click()
      .clear()
      .type(meetingNumber);
  } else {
    // 1 test in agenda.spec uses this value
    cy.get(agenda.editMeeting.meetingNumber).click()
      .invoke('val')
      // eslint-disable-next-line
      .then((sometext) => meetingNumber = sometext);
  }

  // Set the meetingNumber representation
  let meetingNumberRep;

  if (meetingNumberVisualRepresentation) {
    cy.get(agenda.editMeeting.numberRep.edit).click();
    cy.get(agenda.editMeeting.numberRep.input).click()
      .clear()
      .type(meetingNumberVisualRepresentation);
    cy.get(agenda.editMeeting.numberRep.save).click();
  }
  // Get the value from the meetingNumber representation
  cy.get(agenda.editMeeting.numberRep.edit).click();
  cy.get(agenda.editMeeting.numberRep.input).click()
    .invoke('val')
    .then((sometext) => {
      meetingNumberRep = sometext;
    });

  // Set the location
  if (location) {
    cy.get(agenda.editMeeting.meetingLocation).click()
      .type(location);
  }
  cy.get(agenda.editMeeting.save).click();

  let meetingId;
  let agendaId;

  cy.wait('@createNewMeeting', {
    timeout: 20000,
  })
    .its('response.body')
    .then((responseBody) => {
      meetingId = responseBody.data.id;
    });
  cy.wait('@createNewAgenda', {
    timeout: 20000,
  })
    .its('response.body')
    .then((responseBody) => {
      agendaId = responseBody.data.id;
    });
  cy.log('/createAgenda');
  cy.wait('@createAgendaitem', {
    timeout: 60000,
  }).then(() => new Cypress.Promise((resolve) => {
    resolve({
      meetingId, meetingNumber, agendaId, meetingNumberRep,
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
  // cy.intercept('GET', '/agendaitems/*/agenda-activity').as('loadAgendaitems');
  cy.visit(link);
  // cy.wait('@loadAgendaitems');
  // When opening an agenda, you should always get a loading screen.
  // Concept-schemes loaded at application level show a blank screen, checking for loader to get past the white screen
  cy.get(auk.loader).should('exist');
  cy.get(auk.loader, {
    timeout: 60000,
  }).should('not.exist');
  cy.log('/visitAgendaWithLink');
}

/**
 * @description Searches for the agendaDate in the history view of the agenda page, or uses the meetingId to open the meeting directly using the route 'agenda/meetingId/agendapunten'
 * @name openAgendaForDate
 * @memberOf Cypress.Chainable#
 * @function
 * @param {*} agendaDate A Cypress.dayjs object with the date to search
 * @param {integer} index Allows selecting specific agenda when multiple are found
 */
function openAgendaForDate(agendaDate, index = 0) {
  cy.log('openAgendaForDate');
  const searchDate = `${agendaDate.date()}/${agendaDate.month() + 1}/${agendaDate.year()}`;
  cy.intercept('GET', '/agendas?filter**').as('getFilteredAgendas');

  cy.visit('/overzicht?size=2');
  cy.get(route.agendasOverview.filter.container).within(() => {
    cy.get(route.agendasOverview.filter.input).type(`${searchDate}{enter}`);
  });
  cy.get(route.agendasOverview.loader, {
    timeout: 5000,
  }).should('not.exist');
  cy.wait('@getFilteredAgendas', {
    timeout: 20000,
  });
  cy.get(route.agendasOverview.dataTable).find('tbody')
    .children('tr')
    .eq(index)
    .find(route.agendasOverview.row.navButton)
    .click();

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
  cy.get(agenda.agendaitemNav.newsletterTab)
    .should('be.visible')
    .click();
}

/**
 * @description Deletes the current **open agenda**, either a design or an approved one
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * @name deleteAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {boolean} [lastAgenda] - Wether the meeting will be deleted when this agenda will be deleted (automaticaly by service).
 */
function deleteAgenda(lastAgenda) {
  cy.log('deleteAgenda');
  // Call is made but cypress doesn't see it
  cy.intercept('DELETE', '/agendas/*').as('deleteAgenda');
  cy.intercept('GET', '/agendaitems?filter**').as('loadAgendaitems');
  cy.get(agenda.agendaVersionActions.showOptions).click();
  cy.get(agenda.agendaVersionActions.actions.deleteAgenda).click();
  cy.get(auk.modal.container).find(agenda.agendaVersionActions.confirm.deleteAgenda)
    .click();
  cy.wait('@deleteAgenda', {
    timeout: 60000,
  });
  cy.get(auk.modal.container, {
    timeout: 60000,
  }).should('not.exist');
  if (!lastAgenda) {
    cy.wait('@loadAgendaitems');
  }
  // loading page is no longer visible
  cy.get(auk.loader, {
    timeout: 20000,
  }).should('not.exist');
  cy.log('/deleteAgenda');
}

/**
 * @description Set the agendaitem with the given index to formally ok, only works if this value is not yet selected
 * @name setFormalOkOnItemWithIndex
 * @memberOf Cypress.Chainable#
 * @function
 */
function setFormalOkOnItemWithIndex(indexOfItem, fromWithinAgendaOverview = false, formalityStatus = 'Formeel OK') {
  cy.log('setFormalOkOnItemWithIndex');
  if (!fromWithinAgendaOverview) {
    cy.clickReverseTab('Overzicht');
  }
  cy.get(agenda.agendaOverview.formallyOkEdit).click();
  // Data loading occurs here
  cy.get(auk.loader, {
    timeout: 20000,
  }).should('not.exist');

  cy.get(agenda.agendaOverviewItem.container).eq(indexOfItem)
    .scrollIntoView()
    .find(agenda.agendaOverviewItem.formallyOk)
    .click();
  const int = Math.floor(Math.random() * Math.floor(10000));
  cy.intercept('PATCH', '/agendaitems/**').as(`patchAgendaitem_${int}`);
  // Force click the click not working in selective tests (agendaitem-changes.spec)
  cy.get(dependency.emberPowerSelect.option)
    .contains(formalityStatus)
    .click({
      force: true,
    });
  cy.wait(`@patchAgendaitem_${int}`);
  cy.get(utils.changesAlert.close).click();
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
  const verifyText = `Bent u zeker dat u ${amountOfFormallyOks} agendapunten formeel wil goedkeuren`;
  cy.intercept('GET', '/agendaitems/*/modified-by').as('getModifiedByOfAgendaitems');
  cy.get(agenda.agendaActions.showOptions).click();
  cy.intercept('PATCH', '/agendaitems/**').as('patchAgendaitems');
  cy.get(agenda.agendaActions.approveAllAgendaitems).click();
  cy.get(auk.loader).should('not.exist'); // new loader when refreshing data
  cy.get(auk.modal.body).should('contain', verifyText);
  cy.get(agenda.agendaActions.confirm.approveAllAgendaitems).click();
  cy.wait('@patchAgendaitems');
  cy.wait('@getModifiedByOfAgendaitems');
  cy.get(auk.modal.container, {
    timeout: 60000,
  }).should('not.exist');
  cy.get(auk.loader, {
    timeout: 20000,
  }).should('not.exist');
  cy.log('/setAllItemsFormallyOk');
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

  cy.get(agenda.agendaVersionActions.showOptions).click();
  cy.get(agenda.agendaVersionActions.actions.approveAgenda).click();
  cy.get(auk.loader).should('not.exist'); // new loader when refreshing data
  if (shouldConfirm) {
    cy.get(auk.modal.container).find(agenda.agendaVersionActions.confirm.approveAgenda)
      .click();
    // as long as the modal exists, the action is not completed
    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
    // agendaitems are loading after action is completed
    cy.get(auk.loader, {
      timeout: 60000,
    }).should('not.exist');
  }

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

  cy.get(agenda.agendaVersionActions.showOptions).click();
  cy.get(agenda.agendaVersionActions.actions.approveAndCloseAgenda).click();
  cy.get(auk.loader).should('not.exist'); // new loader when refreshing data
  if (shouldConfirm) {
    cy.get(auk.modal.container).find(agenda.agendaVersionActions.confirm.approveAndCloseAgenda)
      .click();
    // as long as the modal exists, the action is not completed
    cy.get(auk.modal.container, {
      timeout: 60000,
    }).should('not.exist');
  }
  cy.get(auk.loader).should('not.exist'); // loader when refreshing data
  cy.log('/approveAndCloseDesignAgenda');
}

/**
 * @description Add a new subcase to the agenda
 * @name addAgendaitemToAgenda
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} subcaseTitle - The title of the case, Mandatory
 * @param {boolean} postponed - DO NOT USE, Feature no longer works properly but still exists, default false
 */
function addAgendaitemToAgenda(subcaseTitle) {
  cy.log('addAgendaitemToAgenda');
  cy.intercept('GET', '/subcases?**sort**').as('getSubcasesFiltered');
  cy.intercept('POST', '/agendaitems').as('createNewAgendaitem');
  cy.intercept('POST', '/agenda-activities').as('createAgendaActivity');
  cy.intercept('PATCH', '/subcases/**').as('patchSubcase');
  cy.intercept('PATCH', '/agendas/**').as('patchAgenda');

  cy.get(auk.loader).should('not.exist');
  cy.get(agenda.agendaActions.showOptions).click();
  cy.get(agenda.agendaActions.addAgendaitems).click();
  cy.wait('@getSubcasesFiltered', {
    timeout: 20000,
  });
  const encodedSubcaseTitle = encodeURIComponent(subcaseTitle);

  const randomInt = Math.floor(Math.random() * Math.floor(10000));

  cy.get(utils.vlModal.dialogWindow).within(() => {
    cy.get(auk.loader, {
      timeout: 12000,
    }).should('not.exist');
    cy.get(dependency.emberDataTable.isLoading).should('not.exist');
    // type the subcase title from parameters to search
    cy.intercept('GET', `/subcases?filter**filter[short-title]=${encodedSubcaseTitle}**`).as('getSubcasesFiltered');
    cy.get(agenda.createAgendaitem.input).clear()
      .type(subcaseTitle, {
        force: true,
      });
    cy.wait('@getSubcasesFiltered', {
      timeout: 12000,
    });
    cy.get(auk.loader, {
      timeout: 12000,
    }).should('not.exist');
    cy.get(dependency.emberDataTable.isLoading).should('not.exist');
    // select the found row (title should always match only 1 result to avoid using the wrong subcase)
    cy.get(agenda.createAgendaitem.dataTable).find('tbody')
      .children('tr')
      .as('rows');

    cy.get('@rows', {
      timeout: 12000,
    }).eq(0)
      .click()
      .get(agenda.createAgendaitem.row.checkBox)
      .should('be.checked');
    cy.get(utils.vlModalFooter.save).click();
  });

  cy.wait('@createAgendaActivity', {
    timeout: 20000,
  });
  cy.intercept('GET', '/agendaitems?filter**').as(`loadAgendaitems${randomInt}`);
  cy.wait('@createNewAgendaitem', {
    timeout: 30000,
  })
    .wait('@patchSubcase', {
      timeout: 20000,
    })
    .wait('@patchAgenda', {
      timeout: 20000,
    });
  cy.wait(`@loadAgendaitems${randomInt}`);
  cy.get(auk.loader, {
    timeout: 12000,
  }).should('not.exist');
  cy.log('/addAgendaitemToAgenda');
}

/**
 * @description Toggles the show changes
 * @name toggleShowChanges
 * @memberOf Cypress.Chainable#
 * @function
 */
function toggleShowChanges() {
  cy.log('toggleShowChanges');
  cy.clickReverseTab('Overzicht');
  cy.get(auk.loader).should('not.exist'); // data is not loading
  cy.get(agenda.agendaOverview.showChanges).click();
  // data loading is triggered so we check for the loader
  cy.get(auk.loader).should('not.exist');
  cy.log('/toggleShowChanges');
}

/**
 * @description Checks if an agendaitem with a specific name exists on an agenda,
 * if you want to open the agendaitem at the same time, use cy.openDetailOfAgendaitem(agendaitemName)
 * @name agendaitemExists
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemName - title of the agendaitem
 */
function agendaitemExists(agendaitemName) {
  cy.log('agendaitemExists');
  cy.wait(200);
  // Check which reverse tab is active
  cy.get(auk.loader, {
    timeout: 20000,
  }).should('not.exist');
  cy.get(agenda.agendaTabs.tabs).find(auk.tab.activeHref)
    .then((element) => {
      const selectedReverseTab = element[0].text.trim();
      if (selectedReverseTab.includes('Detail')) {
        cy.get(agenda.agendaDetailSidebar.subitem)
          .contains(agendaitemName, {
            timeout: 12000,
          })
          .as('foundAgendaitem');
      } else {
        if (!selectedReverseTab.includes('Overzicht')) {
          cy.clickReverseTab('Overzicht');
          cy.get(agenda.agendaOverviewItem.subitem);
          // data loading could be awaited  '/agendaitem?filter**' or next get() fails, solved bij checking loading modal
          cy.log('data needs to be loaded now, waiting a few seconds');
          cy.get(auk.loader, {
            timeout: 20000,
          }).should('not.exist');
        }
        cy.get(agenda.agendaOverviewItem.subitem)
          .contains(agendaitemName, {
            timeout: 24000,
          })
          .as('foundAgendaitem');
      }
    });
  cy.log('/agendaitemExists');
  // By getting the aliased agendaitem as last action in the command, we can chain off this in future commands
  // Used mainly for the command "openDetailOfAgendaitem"
  cy.get('@foundAgendaitem');
}

/**
 * @description Checks if an agendaitem with a specific name exists on the open agenda and opens the "Dossier" tab
 * Will also navigate from "overzicht" to "detail" tab if needed
 * @name openDetailOfAgendaitem
 * @memberOf Cypress.Chainable#
 * @function
 * @param {string} agendaitemName - title of the agendaitem.
*  @param {boolean} isAdmin - optional boolean to indicate that we are admin (some profiles can't see the link to subcase)
 */
function openDetailOfAgendaitem(agendaitemName, isAdmin = true) {
  cy.log('openDetailOfAgendaitem');
  /*
    NOTE: We are chaining from the previous command to make sure we have the same element
    without repeating the selection process since this can be a sidebar or an overview item
  */
  cy.agendaitemExists(agendaitemName)
    .scrollIntoView()
    .click();
  cy.get(auk.loader, {
    timeout: 60000,
  }).should('not.exist');
  cy.url().should('include', 'agendapunten');
  cy.get(agenda.agendaitemNav.activeTab).then((element) => {
    const selectedTab = element[0].text;
    if (!selectedTab.includes('Dossier')) {
      cy.get(agenda.agendaitemNav.caseTab).click();
      // after changing the tab, we have to wait for data to load
      cy.get(auk.loader).should('not.exist');
    }

    if (isAdmin) {
      // This is used for approval items and other profiles who don't have a link to a subcase
      cy.get(agenda.agendaitemTitlesView.linkToSubcase);
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
  cy.get(agenda.agendaSideNav.agendaName).contains(agendaName)
    .click();
  // await calls after switch covered by checking for loader
  cy.get(auk.loader, {
    timeout: 60000,
  }).should('not.exist');
}

/**
 * @description closes an agenda (agenda-hader action is renamed to closeMeeting)
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * @name closeAgenda
 * @memberOf Cypress.Chainable#
 * @function
 */
function closeAgenda() {
  cy.log('closeAgenda');
  // Call is made but cypress doesn't see it
  // cy.intercept('POST', '/agendas/*/close').as('closeAgendaCall');
  cy.get(agenda.agendaVersionActions.showOptions).click();
  cy.get(agenda.agendaVersionActions.actions.lockAgenda).click();
  cy.get(agenda.agendaVersionActions.confirm.lockAgenda).click();
  // as long as the modal exists, the action is not completed
  cy.get(auk.modal.container, {
    timeout: 60000,
  }).should('not.exist');
  cy.get(auk.loader).should('not.exist');
  // TODO-bug current-when should mark overzicht tab as active, but we enter a state where none of the tabs are active
  cy.clickReverseTab('Overzicht');
  cy.log('/closeAgenda');
}

/**
 * @description reopens an agenda
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * @name reopenAgenda
 * @memberOf Cypress.Chainable#
 * @function
 */
function reopenAgenda() {
  cy.log('reopenAgenda');
  cy.get(agenda.agendaVersionActions.showOptions).click();
  cy.get(agenda.agendaVersionActions.actions.unlockAgenda).click();
  // Currently, this action has no confirmation popup but a loading overlay is showing
  cy.get(auk.modal.container, {
    timeout: 60000,
  }).should('not.exist');
  cy.get(auk.loader).should('not.exist');
  cy.log('/reopenAgenda');
}

/**
 * @description reopens the previous version of an agenda
 * In all cases there will be 1 popup, an auModal, opened for confirmation during this command
 * @name reopenPreviousAgenda
 * @memberOf Cypress.Chainable#
 * @function
 */
function reopenPreviousAgenda() {
  cy.log('reopenPreviousAgenda');
  // Call is made but cypress doesn't see it
  // cy.intercept('POST', '/agendas/*/reopen').as('reopenPreviousAgendaCall');
  cy.get(agenda.agendaVersionActions.showOptions).click();
  cy.get(agenda.agendaVersionActions.actions.reopenPreviousVersion).click();
  cy.get(agenda.agendaVersionActions.confirm.reopenPreviousVersion).click();
  // as long as the modal exists, the action is not completed
  cy.get(auk.modal.container, {
    timeout: 60000,
  }).should('not.exist');
  cy.get(auk.loader).should('not.exist');
  cy.log('/reopenPreviousAgenda');
}

/**
 * @description releases the decisions of the current meeting
 * @name releaseDecisions
 * @memberOf Cypress.Chainable#
 * @function
 */
function releaseDecisions() {
  cy.log('releaseDecisions');
  cy.intercept('PATCH', '/internal-decision-publication-activities/**').as('patchDecisionPubActivity');

  cy.get(agenda.agendaActions.showOptions).click();
  cy.get(agenda.agendaActions.releaseDecisions).click({
    force: true,
  });
  cy.get(agenda.agendaActions.confirm.releaseDecisions).click();
  cy.wait('@patchDecisionPubActivity', {
    timeout: 20000,
  });
  cy.log('/releaseDecisions');
}

/**
 * @description releases the documents of the current meeting
 * @name releaseDocuments
 * @memberOf Cypress.Chainable#
 * @function
 */
function releaseDocuments(now = true) {
  cy.log('releaseDocuments');
  cy.intercept('PATCH', '/internal-document-publication-activities/**').as('patchDocPubActivity');

  cy.get(agenda.agendaActions.showOptions).click();
  cy.get(agenda.agendaActions.releaseDocuments).click();
  if (now) {
    cy.get(agenda.publicationPlanning.actions.releaseDocumentsNow).click();
  }
  cy.get(agenda.publicationPlanning.confirm.releaseDocuments).click();
  cy.wait('@patchDocPubActivity', {
    timeout: 20000,
  });
  cy.log('/releaseDocuments');
}

/**
 * @description Checks if the agenda exists in the agenda/side-nav component by  (ex. "Ontwerpagenda A")
 * @name agendaNameExists
 * @memberOf Cypress.Chainable#
 * @function
 * @param {String} serialnumber The serialnumber (1 letter) of the agenda, capitalized (ex. "A")
 * @param {Boolean} design Whether or not the agenda is a design agenda (default true, most used in test)
 */
function agendaNameExists(serialnumber, design = true) {
  let agendaName;
  if (design) {
    agendaName = `Ontwerpagenda ${serialnumber}`;
  } else {
    agendaName = `Agenda ${serialnumber}`;
  }
  cy.get(agenda.agendaSideNav.agendaName).contains(agendaName);
  // TODO-command this can fail on collapsed sidenav
}

Cypress.Commands.add('createAgenda', createAgenda);
Cypress.Commands.add('openAgendaForDate', openAgendaForDate);
Cypress.Commands.add('visitAgendaWithLink', visitAgendaWithLink);
Cypress.Commands.add('deleteAgenda', deleteAgenda);
Cypress.Commands.add('setFormalOkOnItemWithIndex', setFormalOkOnItemWithIndex);
Cypress.Commands.add('approveDesignAgenda', approveDesignAgenda);
Cypress.Commands.add('addAgendaitemToAgenda', addAgendaitemToAgenda);
Cypress.Commands.add('toggleShowChanges', toggleShowChanges);
Cypress.Commands.add('agendaitemExists', agendaitemExists);
Cypress.Commands.add('openDetailOfAgendaitem', openDetailOfAgendaitem);
Cypress.Commands.add('changeSelectedAgenda', changeSelectedAgenda);
Cypress.Commands.add('closeAgenda', closeAgenda);
Cypress.Commands.add('reopenAgenda', reopenAgenda);
Cypress.Commands.add('reopenPreviousAgenda', reopenPreviousAgenda);
Cypress.Commands.add('releaseDecisions', releaseDecisions);
Cypress.Commands.add('releaseDocuments', releaseDocuments);
Cypress.Commands.add('openAgendaitemKortBestekTab', openAgendaitemKortBestekTab);
Cypress.Commands.add('approveAndCloseDesignAgenda', approveAndCloseDesignAgenda);
Cypress.Commands.add('setAllItemsFormallyOk', setAllItemsFormallyOk);
Cypress.Commands.add('agendaNameExists', agendaNameExists);
