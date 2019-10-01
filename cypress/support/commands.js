
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This is will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

/* eslint-disable no-undef */
import 'cypress-file-upload';

Cypress.Commands.add('login', (name) => {
  cy.server().route('POST', '/mock/sessions').as('mockLogin');
  cy.visit('mock-login');
  cy.get('.grid', { timeout: 12000 }).within(() => {
    cy.contains(name).click()
      .wait('@mockLogin');
  });
});

Cypress.Commands.add('setDateInFlatpickr', (date, plusMonths) => {
  cy.get('.flatpickr-months').within(() => {
    for (let n = 0; n < plusMonths; n++) {
      cy.get('.flatpickr-next-month').click();
    }
  });
  cy.get('.flatpickr-days').within(() => {
    cy.get('.flatpickr-day').not('.prevMonthDay').not('.nextMonthDay').contains(date.date()).click();
  });
  cy.get('.flatpickr-time').within(() => {
    cy.get('.flatpickr-hour').type(date.hour());
    cy.get('.flatpickr-minute').type(date.minutes());
  });
});

//#region Agenda commands


Cypress.Commands.add('createAgenda', (kind, plusMonths, date, location) => {
  cy.visit('/');
  cy.route('GET', '/meetings**').as('getMeetings');
  cy.route('POST', '/meetings').as('createNewMeeting');
  
  cy.wait('@getMeetings', { timeout: 12000 });
  cy.get('.vlc-toolbar__item > .vl-button')
    .contains('Nieuwe agenda aanmaken')
    .click();

  cy.get('.vl-modal-dialog').as('dialog').within(() =>{
    cy.get('.vlc-input-field-block').as('newAgendaForm').should('have.length', 3);
  });

  //#region Set the kind
  cy.get('@newAgendaForm').eq(0).within(() => {
    cy.get('.ember-power-select-trigger').click();
  });
  cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
    cy.contains(kind).click();
  });
  
  //#endregion

  //#region Set the start date
  cy.get('@newAgendaForm').eq(1).within(() => {
    cy.get('.vl-datepicker').click();
  });
  cy.setDateInFlatpickr(date, plusMonths);
  //#endregion

  //Set the location
  cy.get('@newAgendaForm').eq(2).within(() => {
    cy.get('.vl-input-field').click().type(location);
  });

  cy.get('@dialog').within(()=> {
    cy.get('.vlc-toolbar__item').contains('Toevoegen').click();
  });

  cy.wait('@createNewMeeting', { timeout: 20000 })
    .then((res) => {
      const meetingId = res.responseBody.data.id;

      return new Cypress.Promise((resolve) => {
        resolve(meetingId);
      });
    });
});

Cypress.Commands.add('openAgendaForDate', (agendaDate) => {
  const searchDate = agendaDate.date()+ '/' +(agendaDate.month()+1) + '/' + agendaDate.year();
  cy.route('GET', '/meetings/**').as('getMeetings');

  cy.visit('');
  cy.get('.vlc-input-field-group-wrapper--inline', { timeout: 10000 }).should('exist').within(() => {
    cy.get('.vl-input-field').type(searchDate);
    cy.get('.vl-button').click();
  });
  cy.wait('@getMeetings', { timeout: 10000 });
  cy.get('.vl-data-table > tbody').children().should('have.length', 1);
  cy.get('.vl-data-table > tbody > :nth-child(1) > .vl-u-align-center > .vl-button > .vl-button__icon').click();
});

Cypress.Commands.add('deleteAgenda', (agendaDate, meetingId) => {
  if(meetingId) {
    cy.route('DELETE', `/meetings/${meetingId}`).as('deleteMeeting');
  } else {
    cy.route('DELETE', '/meetings/**').as('deleteMeeting');
  }
  
  cy.openAgendaForDate(agendaDate);

  //TODO remove subcases
  cy.get('.vl-button--icon-before')
    .contains('Acties')
    .click();
  cy.get('.vl-popover__link-list__item--action-danger > .vl-link')
    .contains('Agenda verwijderen')
    .click()
    .wait('@deleteMeeting')
    .verifyAlertSuccess();
});

Cypress.Commands.add('setFormalOkOnAllItems', () => {
  cy.get('.vlc-tabs-reverse', { timeout: 12000 }).should('exist').within(() =>{
    cy.contains('Overzicht').click();
  });
  cy.get('.vl-title--h3').contains(`Nota's`).parent().within(() => {
    cy.get('.vl-link').contains('Wijzigen').should('exist').click();
  });
  
  cy.get('.vlc-agenda-items__sub-item').as('agendaItemsAndRemarks');
  cy.get('@agendaItemsAndRemarks').each((item) => {
    cy.get(item).within(() => {
      cy.get('.ember-power-select-selected-item').click();
    });
    cy.contains('Formeel OK').click();
  });

  cy.get('.vl-title--h3').contains(`Nota's`).parent().within(() => {
    cy.get('.vl-link').contains('Wijzigen').should('exist').click();
  });
});

Cypress.Commands.add('approveCoAgendaitem', (caseShortTitle) => {
  cy.route('GET', '/ise-codes/**').as('getIseCodes');
  cy.route('GET', '/government-fields/**').as('getGovernmentFields');
  cy.route('PATCH', '/approvals/**').as('patchApprovals');
  cy.route('PATCH', '/agendas/**').as('patchAgendas');

  // cy.get('.vlc-tabs-reverse', { timeout: 12000 }).should('exist').within(() =>{
  //   cy.contains('Overzicht').click();
  // });

  cy.contains(caseShortTitle).click();
  cy.wait('@getIseCodes', { timeout: 20000 });
  cy.wait('@getGovernmentFields', { timeout: 20000 });
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
  cy.wait('@patchApprovals', { timeout: 10000 }).then(() => {
    cy.verifyAlertSuccess();
  });
  cy.wait('@patchAgendas', { timeout: 10000 }).then(() => {
    cy.verifyAlertSuccess();
  });
});

Cypress.Commands.add('approveDesignAgenda', () => {
  cy.route('PATCH', '/agendas/**').as('patchAgenda');
  cy.route('POST', '/agendas').as('createNewDesignAgenda');
  cy.route('POST', '/agenda-approve/approveAgenda').as('createApprovedAgenda');
  cy.route('POST', '/agenda-sort?**').as('createSorting');
  cy.get('.vlc-toolbar').within(() => {
    cy.get('.vl-button--narrow')
    .contains('Ontwerpagenda')
    .click();
  });

  cy.wait('@patchAgenda', { timeout: 12000 });
  cy.wait('@createNewDesignAgenda', { timeout: 12000 });
  cy.wait('@createApprovedAgenda', { timeout: 12000 });
  cy.wait('@createSorting', { timeout: 12000 });
});

/**
 * Creates a remark for an agenda and attaches any file in the files array
 * 
 * @param {String} title - The title of the remark
 * @param {String} remark - The remark
 * @param {{folder: String, fileName: String, fileExtension: String}[]} file
 * 
 */
Cypress.Commands.add('addRemarkToAgenda', (title, remark, files) => {
  cy.route('POST', '/agendaitems').as('createNewAgendaitem');
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
    cy.wait('@createNewAgendaitem', { timeout: 20000 }).then(() => {
      cy.verifyAlertSuccess();
    });
  });
});

Cypress.Commands.add('addAgendaitemToAgenda', (caseTitle, postponed) => {
  cy.route('GET', '/subcases?**').as('getSubcasesFiltered');
  cy.route('POST', '/agendaitems').as('createNewAgendaitem');

  cy.get('.vl-button--icon-before', { timeout: 10000 }).should('exist')
    .contains('Acties')
    .click();
  cy.get('.vl-popover__link-list__item > .vl-link')
    .contains('Agendapunt toevoegen')
    .click();
  cy.wait('@getSubcasesFiltered', { timeout: 12000 });

  cy.get('.vl-modal-dialog').as('dialog').within(() =>{
    cy.get('.vl-form-grid').children().as('formGrid');

    if(postponed) {
      cy.get('@formGrid').eq(1).within(() => {
        cy.get('.vl-checkbox--switch__label').click();
      });
    }
    cy.get('@formGrid').eq(0).within(() => {
      cy.get('.vl-input-field').clear().type(caseTitle);
      cy.wait('@getSubcasesFiltered', { timeout: 12000 });
    });

    cy.get('table > tbody > tr').as('rows');
    cy.get('@rows').eq(0).click().get('[type="checkbox"]').should('be.checked');
    cy.get('.vl-button').contains('Agendapunt toevoegen').click();
  });
  cy.wait('@createNewAgendaitem', { timeout: 20000 }).then(() => {
    cy.verifyAlertSuccess();
  });
});

//#endregion

//#region Case commands

Cypress.Commands.add('createCase', (confidential, shortTitle) => {
  cy.route('GET', '/cases?**').as('getCases');
  cy.route('POST', '/cases').as('createNewCase');

  cy.visit('/dossiers');
  cy.wait('@getCases', { timeout: 12000 });

  cy.get('.vlc-toolbar__item .vl-button')
  .contains('Nieuw dossier aanmaken')
  .click();

  cy.get('.vl-modal-dialog').as('dialog').within(() =>{
    cy.get('.vlc-input-field-block').as('newCaseForm').should('have.length', 2);
  });

  //Set confidentiality
  if(confidential){
    cy.get('@newCaseForm').eq(0).within(() => {
      cy.get('.vl-checkbox--switch__label').click();
    });
  }
  
  //Set short title
  cy.get('@newCaseForm').eq(1).within(() => {
    cy.get('.vl-textarea').click().type(shortTitle);
  });

  cy.get('@dialog').within(()=> {
    cy.get('.vlc-toolbar__item > .vl-button').contains('Dossier aanmaken').click();
  });

  cy.wait('@createNewCase', { timeout: 20000 })
    .then((res) => {
      const caseId = res.responseBody.data.id;

      return new Cypress.Promise((resolve) => {
        resolve(caseId);
      });
    });
});

Cypress.Commands.add('addSubcase', (type, newShortTitle, longTitle, step, stepName) => {
  cy.route('GET', '/cases?*').as('getCases');
  cy.route('GET', '/subcases?*').as('getSubcases');
  cy.route('POST', '/subcases').as('createNewSubcase');

  cy.wait('@getSubcases',{ timeout: 12000 });

  cy.get('.vlc-toolbar__item .vl-button')
    .contains('Procedurestap toevoegen')
    .click();

  cy.get('.vlc-input-field-block').should('have.length', 5);

  //Set the type
  cy.get('.vlc-input-field-block').eq(0).within(() => {
    cy.contains(type).click();
  });

  //Set the short title
  cy.get('.vlc-input-field-block').eq(1).within(() => {
    cy.get('.vl-textarea').click().clear().type(newShortTitle);
  });

  //Set the long title
  cy.get('.vlc-input-field-block').eq(2).within(() => {
    cy.get('.vl-textarea').click().type(longTitle);
  });

  //#region Set the step type
  cy.get('.vlc-input-field-block').eq(3).within(() => {
    cy.get('.ember-power-select-trigger').click();
  });
  cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
    cy.contains(step).click();
  });
  // cy.get('.ember-power-select-option').contains(step).click();
  //#endregion

  //#region Set the step name
  cy.get('.vlc-input-field-block').eq(4).within(() => {
    cy.get('.ember-power-select-trigger').click();
  });
  cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
    cy.contains(stepName).click();
  });
  // cy.get('.ember-power-select-option').contains(stepName).click();
  //#endregion
  
  cy.get('.vlc-toolbar').within(() => {
    cy.contains('Procedurestap aanmaken').click();
  });

  cy.wait('@createNewSubcase', { timeout: 20000 })
    .then((res) => {
      const subcaseId = res.responseBody.data.id;

      return new Cypress.Promise((resolve) => {
        resolve(subcaseId);
      });
    });
});

//#endregion

//#region Subcase commands

/**
 * Changes the subcase access levels and titles when used in the subcase view (/dossiers/..id../overzicht)
 * shortTitle is required to find the dom element
 * 
 * @param {string} shortTitle - Current title of the subcase (same as case title unless already renamed)
 * @param {boolean} [confidentialityChange] -Will change the current confidentiality if true
 * @param {string} [accessLevel] -Access level to set, must match exactly with possible options in dropdown
 * @param {string} [newShortTitle] - new short title for the subcase
 * @param {string} [newLongTitle] - new long title for the subcase
 */
Cypress.Commands.add('changeSubcaseAccessLevel', (shortTitle, confidentialityChange, accessLevel, newShortTitle, newLongTitle) => {
  cy.route('PATCH','/subcases/*').as('patchSubcase');

  cy.get('.vl-title--h4').contains(shortTitle).parents('.vl-u-spacer-extended-bottom-l').within(() => {
    cy.get('a').click();
  });

  cy.get('.vl-form__group').as('subcaseAccessLevel');

  if(accessLevel) {
    cy.get('@subcaseAccessLevel').within(() => {
      cy.get('.ember-power-select-trigger').click();
    });
    cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
      cy.contains(accessLevel).click();
    });
    
  }

  cy.get('@subcaseAccessLevel').within(() => {
    cy.get('.vlc-input-field-block').as('editCaseForm').should('have.length', 3);

    if(confidentialityChange) {
      cy.get('@editCaseForm').eq(0).within(() => {
        cy.get('.vl-checkbox--switch__label').click();
      });
    }
    if(newShortTitle) {
      cy.get('@editCaseForm').eq(1).within(() => {
        cy.get('.vl-textarea').click().clear().type(newShortTitle);
      });
    }
    if(newLongTitle) {
      cy.get('@editCaseForm').eq(2).within(() => {
        cy.get('.vl-textarea').click().clear().type(newLongTitle);
      });
    }

    cy.get('.vl-action-group > .vl-button')
      .contains('Opslaan')
      .click();
  });
  cy.wait('@patchSubcase', { timeout: 20000 }).then(() => {
    cy.verifyAlertSuccess();
  });
});

/**
 * Changes the themes of a sucase when used in the subcase view (/dossiers/..id../overzicht)
 * 
 * @param {Array<Number|String>} themes - An array of theme names that must match exactly or an array of numbers that correspond to the checkboxes in themes 
 * 
 */
Cypress.Commands.add('addSubcaseThemes', (themes) => {
  cy.route('GET', '/themes').as('getThemes');
  cy.route('PATCH','/subcases/*').as('patchSubcase');
  cy.get('.vl-title--h4').contains(`Thema's`).parents('.vl-u-spacer-extended-bottom-l').as('subcaseTheme');

  cy.get('@subcaseTheme').within(() => {
    cy.get('a').click();
    cy.wait('@getThemes', { timeout: 12000 });
    themes.forEach(element => {
      if(isNaN(element)){
        cy.get('.vl-checkbox').contains(element).click();
      } else {
        cy.get('.vl-checkbox').eq(element).click();
      }
      
    });
    cy.get('.vl-action-group > .vl-button')
      .contains('Opslaan')
      .click();
  });
  cy.wait('@patchSubcase', { timeout: 20000 }).then(() => {
    cy.verifyAlertSuccess();
  });
});

//TODO use arrays of fields and domains, search on mandatee name 
/**
 * Adds a mandatees with field and domain to a sucase when used in the subcase view (/dossiers/..id../overzicht)
 * 
 * @param {Number} mandatees - The list index of the mandatee 
 * @param {Number} fieldNumber - The list index of the field 
 * @param {Number} domainNumber - The list index of the domain 
 * 
 */
Cypress.Commands.add('addSubcaseMandatee', (mandateeNumber, fieldNumber, domainNumber) => {
  cy.route('GET', '/mandatees?**').as('getMandatees');
  cy.route('GET', '/ise-codes/**').as('getIseCodes');
  cy.route('GET', '/government-fields/**').as('getGovernmentFields');
  cy.route('PATCH','/subcases/*').as('patchSubcase');

  cy.get('.vl-title--h4').contains(`Ministers en beleidsvelden`).parents('.vl-u-spacer-extended-bottom-l').as('subcaseMandatees');
  cy.get('@subcaseMandatees').within(() => {
    cy.get('.vl-u-spacer-extended-left-s', { timeout: 5000 }).should('exist').then(() => {
      cy.contains('Wijzigen').click();
    });
  });

  cy.get('.vlc-box a').contains('Minister toevoegen').click();
  cy.get('.mandatee-selector-container').children('.ember-power-select-trigger').click();
  cy.wait('@getMandatees', { timeout: 12000 });
  cy.get('.ember-power-select-option', { timeout: 10000 }).should('exist').then(() => {
    cy.get('.ember-power-select-option').eq(mandateeNumber).click();
  });
  //TODO loading the isecodes and government fields takes time to load, are they be cached for reuse ?
  cy.wait('@getIseCodes', { timeout: 20000 });
  cy.wait('@getGovernmentFields', { timeout: 20000 });
  cy.get('.vlc-checkbox-tree', { timeout: 20000 }).should('exist').eq(fieldNumber).within(() => {
    cy.get('.vl-checkbox').eq(domainNumber).click();
  });
  cy.get('.vlc-toolbar').within(() => {
    cy.contains('Toevoegen').click();
  });
  cy.get('@subcaseMandatees').within(() => {
    cy.get('.vlc-toolbar')
    .contains('Opslaan')
    .click();
  });
  cy.wait('@patchSubcase', { timeout: 20000 }).then(() => {
    cy.verifyAlertSuccess();
  });
});

Cypress.Commands.add('proposeSubcaseForAgenda', (agendaDate) => {
  cy.route('POST','/agendaitems').as('createNewAgendaitem');
  cy.route('PATCH','/agendas/*').as('patchAgenda');
  cy.route('PATCH','/subcases/*').as('patchSubcase');
  cy.route('POST','/subcase-phases').as('createSubcasePhase');
  const monthDutch = getTranslatedMonth(agendaDate.month());
  const formattedDate = agendaDate.date() + ' ' + monthDutch + ' ' + agendaDate.year();

  cy.get('.vlc-page-header').within(() => {
    cy.get('.vl-button').contains('Indienen voor agendering').click();

  });
  cy.get('.ember-attacher-show').within(() => {
    cy.contains(formattedDate).click();
  });
  cy.wait('@createNewAgendaitem', { timeout: 12000 });
  cy.wait('@patchAgenda', { timeout: 12000 });
  cy.wait('@patchSubcase', { timeout: 12000 });
  cy.wait('@createSubcasePhase', { timeout: 12000 });
});

//#endregion

//#region Document commands

/**
 * Opens the document add dialog and adds each file in the files array
 * 
 * @param {{folder: String, fileName: String, fileExtension: String, [newFileName]: String, [fileType]: String}[]} files
 * 
 */
Cypress.Commands.add('addDocuments', (files) => {

  cy.route('GET', 'document-types?**').as('getDocumentTypes');
  cy.route('POST', 'document-versions').as('createNewDocumentVersion');
  cy.route('POST', 'documents').as('createNewDocument');
  cy.route('PATCH', '**').as('patchModel');

  cy.get('.vlc-tabs-reverse', { timeout: 12000 }).should('exist').within(() =>{
    cy.contains('Documenten').click();
  });
  cy.contains('Documenten toevoegen').click();
  cy.get('.vl-modal-dialog').as('fileUploadDialog');

  files.forEach((file, index) => {
    cy.get('@fileUploadDialog').within(() => {
      cy.uploadFile(file.folder, file.fileName, file.fileExtension);

      cy.get('.vl-uploaded-document').eq(index).within(() => {
        if(file.newFileName) {
          cy.get('.vlc-input-field-block').eq(0).within(() => {
            cy.get('.vl-input-field').clear().type(file.newFileName);
          });
        }
      });
    });
  
    if(file.fileType) {
      cy.get('@fileUploadDialog').within(() => {
        cy.get('.vl-uploaded-document').eq(index).within(() => {
          cy.get('.vlc-input-field-block').eq(1).within(() => {
            cy.get('.ember-power-select-trigger').click();
            cy.wait('@getDocumentTypes', { timeout: 12000 });
          });
        });
      });
      cy.get('.ember-power-select-option', { timeout: 5000 }).should('exist').then(() => {
        cy.contains(file.fileType).click();
      });
    }

    cy.get('@fileUploadDialog').within(() => {
      cy.get('.vl-button').contains('Documenten toevoegen').click();
    });
  });

  cy.wait('@createNewDocumentVersion');
  cy.wait('@createNewDocument');
  cy.wait('@patchModel');

});

/**
 * Opens the new document version dialog and adds the file
 * 
 * @param {{folder: String, fileName: String, fileExtension: String} file
 * 
 */
Cypress.Commands.add('addNewDocumentVersion', (oldFileName, file) => {

  cy.route('GET', 'document-types?**').as('getDocumentTypes');
  cy.route('POST', 'document-versions').as('createNewDocumentVersion');
  cy.route('PATCH', '**').as('patchModel');

  cy.get('.vlc-tabs-reverse', { timeout: 12000 }).should('exist').within(() =>{
    cy.contains('Documenten').click();
  });
  cy.get('.vl-title--h6').contains(oldFileName).parents('.vlc-document-card').as('documentCard');

  cy.get('@documentCard').within(() => {
    cy.get('.vl-vi-nav-show-more-horizontal').click();
  });
  cy.get('.vl-link--block').contains('Nieuwe versie uploaden').click();

  cy.get('.vl-modal-dialog').as('fileUploadDialog');

  cy.get('@fileUploadDialog').within(() => {
    cy.uploadFile(file.folder, file.fileName, file.fileExtension);
  });

  cy.get('@fileUploadDialog').within(() => {
    cy.get('.vl-button').contains('Toevoegen').click();
  });
  

  cy.wait('@createNewDocumentVersion');
  cy.wait('@patchModel');

});

/**
 * Uploads a file to an open document dialog window
 * 
 * @param {String} folder - The relative path to the file in the cypress/fixtures folder excluding the fileName
 * @param {String} fileName - The name of the file without the extension
 * @param {String} extension - The extension of the file
 * 
 */
Cypress.Commands.add('uploadFile', (folder, fileName, extension) => {
  cy.route('POST', 'files').as('createNewFile');

  const fileFullName = fileName + '.' + extension;
  const filePath = folder + '/' + fileFullName;
  //TODO pdf is uploaded but all pages are blank, encoding issue? Irrelevant for test
  // let mimeType = 'text/plain';
  // if(extension == 'pdf'){
  //   mimeType = 'application/pdf';
  // }   

  cy.fixture(filePath).then(fileContent => {
    cy.get('[type=file]').upload(
        {fileContent, fileName: fileFullName, mimeType: 'application/pdf'},
        {uploadType: 'input'},
    );
  });
  cy.wait('@createNewFile');
});

//#endregion

//#region general resuable commands

Cypress.Commands.add('verifyAlertSuccess', () => {
  cy.get('.vl-alert').contains('Gelukt').should('be.visible');
});

//#endregion

const getTranslatedMonth = (month) => {
  switch(month) {
    case 0:
      return 'januari';
    case 1:
      return 'februari';
    case 2:
      return 'maart';
    case 3:
      return 'april';
    case 4:
      return 'mei';
    case 5:
      return 'juni';
    case 6:
      return 'juli';
    case 7:
      return 'augustus';
    case 8:
      return 'september';
    case 9:
      return 'oktober';
    case 10:
      return 'november';
    case 11:
      return 'december';

    default:
      break;
  }
}