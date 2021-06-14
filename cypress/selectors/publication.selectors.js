const selectors = {
  newPublicationButton: '[data-test-publication-header-button-new]',
  publicationDetailHeaderShortTitle: '[data-test-publication-detail-menu-short-title]',
  publicationDetailHeaderPublicationNumber: '[data-test-publication-detail-menu-publication-number]',
  goToPublication: '[data-test-publications-button-go-to-publication]',
  editInscriptionButton: '[data-test-publication-edit-inscription-button]',
  inscriptionShortTitleTextarea: '[data-test-publication-inscription-short-title-textarea]',
  inscriptionLongTitleTextarea: '[data-test-publication-inscription-long-title-textarea]',
  inscriptionSaveButton: '[data-test-publication-save-inscription]',
  contactperson: {
    addButton: '[data-test-add-contactperson]',
    submitButton: '[data-test-add-contactperson-submit-button]',
    firstNameInput: '#firstNameInput',
    lastNameInput: '#lastNameInput',
    emailInput: '#emailInput',
    organisationInput: '#organisationInput',
    threedotsButton: '[data-test-contact-persons] button i',
    deleteContactpersonButton: '[data-test-delete-contactperson]',
  },
  publicationCase: {
    // panels
    casePanel: '[data-test-publication-case-panel-case]',
    casePanelEditing: '[data-test-publication-case-panel-case-editing]',
    mandateePanel: '[data-test-publication-case-panel-mandatees]',
    contantPersonPanel: '[data-test-publication-case-panel-contactperson]',
  },
  nav: {
    goBack: '[data-test-publication-case-nav-go-back]',
    case: '[data-test-publication-case-nav-case]',
    documents: '[data-test-publication-case-nav-documents]',
    translations: '[data-test-publication-case-nav-translations]',
    publishpreview: '[data-test-publication-case-nav-publishpreview]',
  },
  // TODO replace deze bij het maken van publication translation testen
  tableCell: '.auk-table__cell--accent',
  flowTitle: '[data-test-publication-flow-title]',
};
export default selectors;
