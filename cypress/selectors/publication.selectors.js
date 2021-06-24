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

  // new-publication-modal
  newPublicationModal: {
    createButton: '[data-test-publication-button-create-new]',
    cancelButton: '[data-test-publication-button-cancel]', // 2x duplication
    publicationNumberInput: '[data-test-create-publication-modal-number-input]',
    publicationNumberSuffixInput: '[data-test-create-publication-modal-suffix-input]',
    publicationShortTitleTextarea: '[data-test-create-publication-modal-short-title-textarea]',
    publicationLongTitleTextarea: '[data-test-create-publication-modal-long-title-textarea]',
    alertInfo: '[data-test-auk-alert-info]', // refactor either to publication specific or auk reuse
    alertError: '[data-test-auk-alert-error]', // refactor either to publication specific or auk reuse
  },
};
export default selectors;
