

/* eslint-disable no-undef */

// ***********************************************
// Commands

Cypress.Commands.add('createAgenda', createAgenda);
Cypress.Commands.add('openAgendaForDate', openAgendaForDate);
Cypress.Commands.add('deleteAgenda', deleteAgenda);
Cypress.Commands.add('setFormalOkOnAllItems',setFormalOkOnAllItems);
Cypress.Commands.add('approveCoAgendaitem',approveCoAgendaitem);
Cypress.Commands.add('approveDesignAgenda', approveDesignAgenda);
Cypress.Commands.add('addRemarkToAgenda', addRemarkToAgenda);
Cypress.Commands.add('addAgendaitemToAgenda',addAgendaitemToAgenda);
Cypress.Commands.add('toggleShowChanges', toggleShowChanges);
Cypress.Commands.add('agendaItemExists', agendaItemExists);
Cypress.Commands.add('changeSelectedAgenda', changeSelectedAgenda);
Cypress.Commands.add('closeAgenda', closeAgenda);


// ***********************************************
// Functions

/**
 * Goes to the agenda overview and creates a new agenda
 *
 * @returns {Promise<String>} the id of the created agenda
 *
 * @param {*} kind The kind of meeting to select, language and case sensitive
 * @param {*} plusMonths The positive amount of months from today to advance in the vl-datepicker
 * @param {*} date The cypress.moment object with the date and time to set
 * @param {*} location The location of the meeting to enter as input
 */
function createAgenda(kind, plusMonths, date, location) {
  cy.visit('');
  cy.route('GET', '/meetings**').as('getMeetings');
  cy.route('POST', '/meetings').as('createNewMeeting');
  cy.route('POST', '/agendas').as('createNewAgenda');
  cy.route('POST', '/agendaitems').as('createNewAgendaItems');
  cy.route('POST', '/newsletter-infos').as('createNewsletter');
  cy.route('PATCH', '/meetings/**').as('patchMeetings');

  cy.wait('@getMeetings', { timeout: 20000 });
  cy.get('.vlc-toolbar__item > .vl-button')
    .contains('Nieuwe agenda aanmaken')
    .click();

  cy.get('.vl-modal-dialog').as('dialog').within(() =>{
    cy.get('.vlc-input-field-block').as('newAgendaForm').should('have.length', 3);
  });

  // Set the kind
  cy.get('@newAgendaForm').eq(0).within(() => {
    cy.get('.ember-power-select-trigger').click();
  });
  cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
    cy.contains(kind).click();
  });

  //Set the start date
  cy.get('@newAgendaForm').eq(1).within(() => {
    cy.get('.vl-datepicker').click();
  });
  //TODO get months by calculating instead
  cy.setDateInFlatpickr(date, plusMonths);

  //Set the location
  cy.get('@newAgendaForm').eq(2).within(() => {
    cy.get('.vl-input-field').click().type(location);
  });

  cy.get('@dialog').within(()=> {
    cy.get('.vlc-toolbar__item').contains('Toevoegen').click();
  });

  let meetingId;

  cy.wait('@createNewMeeting', { timeout: 20000 })
  .then((res) => {
    meetingId = res.responseBody.data.id;
  }).verifyAlertSuccess();

  cy.wait('@createNewAgenda',{ timeout: 20000 });
  cy.wait('@createNewAgendaItems',{ timeout: 20000 });
  cy.wait('@createNewsletter',{ timeout: 20000 });
  cy.wait('@patchMeetings',{ timeout: 20000 })
  .then(() => {
    return new Cypress.Promise((resolve) => {
      resolve(meetingId);
    });
  });
}

/**
 * Searches for the agendaDate in the history view of the agenda page, or uses the meetingId to open
 * the meeting directly using the route 'agenda/meetingId/agendapunten'
 *
 * @param {*} agendaDate A cypress.moment object with the date to search
 * @param {*} [meetingId] If known, use the meetingId to open the meeting with a direct route instead of searching
 */
function openAgendaForDate(agendaDate, meetingId) {
  cy.server();
  if(meetingId) {
    cy.visit(`agenda/${meetingId}/agendapunten`);
  } else {
  const searchDate = agendaDate.date()+ '/' +(agendaDate.month()+1) + '/' + agendaDate.year();
  cy.route('GET', '/meetings/**').as('getMeetings');
  cy.route('GET', '/meetings?filter**').as('getFilteredMeetings');

  cy.visit('');
  cy.wait('@getMeetings', { timeout: 20000 });
  cy.get('.vlc-input-field-group-wrapper--inline', { timeout: 10000 }).should('exist').within(() => {
    cy.get('.vl-input-field').type(searchDate);
    cy.get('.vl-button').click();
  });

  cy.wait('@getFilteredMeetings', { timeout: 20000 });
  cy.get('.data-table > tbody > :nth-child(1) > .vl-u-align-center > .vl-button > .vl-button__icon').click();
  }
}

/**
 * Deletes the current **open agenda**, either a design or an approved one
 *
 * @param {number} [meetingId] - The id of the meeting to delete to monitor if the DELETE call is made.
 * @param {boolean} [lastAgenda] - Wether the meeting will be deleted when this agenda is deleted.
 */
function deleteAgenda(meetingId, lastAgenda) {
  if(meetingId) {
    cy.route('DELETE', `/meetings/${meetingId}`).as('deleteMeeting');
  } else {
    cy.route('DELETE', '/meetings/**').as('deleteMeeting');
  }
  cy.route('POST', '/agenda-approve/deleteAgenda').as('deleteAgenda');
  cy.route('DELETE', '/newsletter-infos/**').as('deleteNewsletter');

  cy.get('.vl-button--icon-before')
    .contains('Acties')
    .click();
  cy.get('.vl-popover__link-list__item--action-danger > .vl-link')
    .contains('Agenda verwijderen')
    .click();
  cy.wait('@deleteAgenda', { timeout: 20000 }).then(() =>{
    cy.get('.vl-modal').should('not.exist');
  });
  if(lastAgenda) {
    cy.wait('@deleteNewsletter', { timeout: 20000 });
    cy.wait('@deleteMeeting', { timeout: 20000 });
  }
  //TODO should patches happen when deleting a design agenda ?
}

/**
 * Set all agendaitems on an open agenda to "formally OK"
 *
 */
function setFormalOkOnAllItems() {
  //TODO set only some items to formally ok with list as parameter
  cy.route('GET', '/meetings/**').as('getMeetings');
  cy.route('PATCH', '/agendaitems/**').as('patchAgendaItem');

  cy.clickReverseTab('Overzicht');

  cy.get('.vlc-agenda-items .vlc-toolbar__right > .vlc-toolbar__item')
    .last().as('editFormality');

  cy.get('@editFormality').click();

  cy.get('li.vlc-agenda-items__sub-item')
    .each((whatever, index) =>
      cy.get('li.vlc-agenda-items__sub-item')
        .eq(index)
        .scrollIntoView()
        .within($selectBox =>
          cy.get('.vl-u-spacer-extended-bottom-s').as('selectBox'))
        .get('@selectBox')
        .then($selectBox =>
          !$selectBox.text().includes('Formeel OK')
            ? cy.get('@selectBox')
              .click()
              .get('.ember-power-select-option')
              .contains('Formeel OK')
              .click()
              .wait('@patchAgendaItem')
              .wait(1000) // sorry ik zou hier moeten wachten op access-levels maar net zoveel keer als dat er items zijn ...
            : cy.get('@selectBox')));
  cy.get('.vlc-agenda-items .vl-alert button')
    .click();
}

/**
 * Check all approval checkboxes of an agendaitem
 *
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
 * Approve an open agenda when all formally OK's are set ()
 */
function approveDesignAgenda() {
  cy.route('PATCH', '/agendas/**').as('patchAgenda');
  cy.route('POST', '/agenda-approve/approveAgenda').as('createApprovedAgenda');
  cy.route('GET', '/agendaitems/**').as('getAgendaitems');

  //TODO add boolean for when not all items are formally ok, click through the confirmation modal
  cy.get('.vlc-toolbar').within(() => {
    cy.get('.vl-button--narrow')
    .contains('Ontwerpagenda')
    .click();
  });

  cy.wait('@patchAgenda', { timeout: 12000 });
  cy.wait('@createApprovedAgenda', { timeout: 12000 });
  cy.wait('@getAgendaitems', { timeout: 12000 });
}

/**
 * Creates a remark for an agenda and attaches any file in the files array
 *
 * @param {String} title - The title of the remark
 * @param {String} remark - The remark
 * @param {{folder: String, fileName: String, fileExtension: String}[]} file
 *
 */
function addRemarkToAgenda(title, remark, files) {
  cy.route('POST', '/agendaitems').as('createNewAgendaitem');
  cy.route('PATCH', '**').as('patchModel');

  cy.get('.vl-button--icon-before', { timeout: 10000 }).should('exist')
    .contains('Acties')
    .click();
  cy.get('.vl-popover__link-list__item > .vl-link')
    .contains('Mededeling toevoegen')
    .click();

  cy.get('.vl-modal-dialog').as('dialog').within(() =>{
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

function addAgendaitemToAgenda(caseTitle, postponed){
  cy.route('GET', '/subcases?**').as('getSubcasesFiltered');
  cy.route('GET', '/agendaitems/**').as('getAgendaitems');
  cy.route('POST', '/agendaitems').as('createNewAgendaitem');
  cy.route('POST','/subcase-phases').as('createSubcasePhase');
  cy.route('PATCH', '/subcases/**').as('patchSubcase');
  cy.route('PATCH', '/agendas/**').as('patchAgenda');

  cy.get('.vl-button--icon-before', { timeout: 10000 }).should('exist')
    .contains('Acties')
    .click();
  cy.get('.vl-popover__link-list__item > .vl-link')
    .contains('Agendapunt toevoegen')
    .should('be.visible')
    .click();
  cy.wait('@getSubcasesFiltered', { timeout: 20000 });

  cy.get('.vl-modal-dialog').as('dialog').within(() => {
    cy.get('.vl-form-grid').children().as('formGrid');

    if(postponed) {
      cy.get('@formGrid').eq(1).within(() => {
        cy.get('.vl-checkbox--switch__label').click();
      });
    }
    if(caseTitle){
      cy.get('@formGrid').eq(0).within(() => {
        cy.get('.vl-input-field').clear().type(caseTitle, {force: true});
        cy.wait('@getSubcasesFiltered', { timeout: 12000 });
      });
      cy.get('table > tbody > tr', ).as('rows');
    } else {
      cy.get('table > tbody > tr', ).as('rows');
      cy.get('@rows', { timeout: 12000 }).should('not.have.length', 1)
    }
    cy.get('@rows', { timeout: 12000 }).eq(0).click().get('[type="checkbox"]').should('be.checked');
    cy.get('.vl-button').contains('Agendapunt toevoegen').click();
  });
  cy.wait('@createNewAgendaitem', { timeout: 20000 });
  cy.wait('@patchSubcase', { timeout: 20000 });

  cy.wait('@createSubcasePhase', { timeout: 20000 });
  cy.wait('@patchAgenda', { timeout: 20000 });
  cy.wait('@getAgendaitems', { timeout: 20000 });
}

function toggleShowChanges(refresh) {
  cy.route('GET', '/agendaitems/**').as('getAgendaitems');
  cy.route('GET', '/agenda-sort/agenda-with-changes**').as('getChanges');

  if (refresh) {
    cy.get('.vlc-side-nav-item', { timeout: 12000 })
      .last({ timeout: 12000 })
      .click();
    cy.wait('@getAgendaitems', { timeout: 20000 });
    cy.get('.vlc-side-nav-item', { timeout: 12000 })
      .first({ timeout: 12000 })
      .click();
    cy.wait('@getChanges', { timeout: 20000 });
  }

  cy.get('.vlc-agenda-items .vlc-toolbar__right > .vlc-toolbar__item')
    .first()
    .click();
}

function agendaItemExists(agendaItemName) {
  cy.get('li.vlc-agenda-items__sub-item h4')
    .contains(agendaItemName, {timeout: 12000})
    .should('exist');
}

function changeSelectedAgenda(agendaName) {
  cy.get('.vlc-side-nav-item').children()
  .contains(agendaName).click();
}

function closeAgenda() {
  cy.route('POST', '/agenda-approve/deleteAgenda').as('deleteAgenda');

  cy.get('.vl-button--icon-before')
    .contains('Acties')
    .click();
  cy.get('.vl-popover__link-list__item > .vl-link')
    .contains('Agenda afsluiten')
    .click();
  cy.wait('@deleteAgenda', { timeout: 20000 }).then(() =>{
    cy.get('.vl-modal').should('not.exist');
  });

}
