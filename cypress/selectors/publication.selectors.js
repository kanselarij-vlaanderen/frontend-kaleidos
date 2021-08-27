const selectors = {

  /**
    ROUTES
  */

  // TODO this route is already in route.selectors file, remove from route.selectors
  // publications\index\template
  publicationsIndex: {
    title: '[data-test-route-publications-index-title]',
    newPublication: '[data-test-route-publications-index-new-publication]',
    filter: '[data-test-route-publications-index-filter]',
  },

  // publications\publication\template
  publicationHeader: {
    number: '[data-test-route-publications-publication-header-number]',
    shortTitle: '[data-test-route-publications-publication-header-short-title]',
  },

  /**
    COMPONENTS
  */

  // publication-navigation
  publicationCaseNav: {
    goBack: '[data-test-publication-case-nav-go-back]',
    case: '[data-test-publication-case-nav-case]',
    documents: '[data-test-publication-case-nav-documents]',
    translations: '[data-test-publication-case-nav-translations]',
    publishpreview: '[data-test-publication-case-nav-publishpreview]',
  },

  // publication-table-row
  publicationTableRow: {
    goToPublication: '[data-test-publication-table-row-go-to-publication]',
  },

  // new-publication-modal
  newPublication: {
    numberInput: '[data-test-new-publication-modal-number-input]',
    shortTitle: '[data-test-new-publication-modal-short-title]',
    longTitle: '[data-test-new-publication-modal-long-title]',
    alertInfo: '[data-test-new-publication-modal-alert-info]',
    alertError: '[data-test-new-publication-modal-alert-error]',
    numberError: '[data-test-new-publication-modal-number-error]',
    shortTitleError: '[data-test-new-publication-modal-short-title-error]',
    create: '[data-test-new-publication-modal-create]',
    suffixInput: '[data-test-new-publication-modal-suffix-input]',
  },

  // contact-persons-panel
  contactPersonsPanel: {
    panel: '[data-test-contact-persons-panel-panel]',
    table: '[data-test-contact-persons-panel-table]',
    add: '[data-test-contact-persons-panel-add]',
    delete: '[data-test-contact-persons-panel-delete]',
  },

  // contact-person-add-modal
  contactPersonAdd: {
    firstName: '[data-test-contact-person-add-first-name]',
    lastName: '[data-test-contact-person-add-last-name]',
    email: '[data-test-contact-person-add-email]',
    submit: '[data-test-contact-person-add-submit]',
  },

  // organization-add-modal
  organizationAdd: {
    submit: '[data-test-organization-add-submit]',
  },

  // TODO-KAS-2849 separate edit and view
  // inscription-panel
  inscriptionPanel: {
    casePanel: '[data-test-inscription-panel-case-panel]',
    shortTitle: '[data-test-inscription-panel-short-title]',
    longTitle: '[data-test-inscription-panel-long-title]',
    edit: '[data-test-inscription-panel-edit]',
    save: '[data-test-inscription-panel-save]',
  },

  // mandatees-panel
  mandateesPanel: {
    // unused selectors:
    panel: '[data-test-mandatees-panel-panel]',
    table: '[data-test-mandatees-panel-table]',
    add: '[data-test-mandatees-panel-add]',
    unlink: '[data-test-mandatees-panel-unlink]',
  },
  // documents-upload-modal
  documentsUploadModal: {
    save: '[data-test-publication-documents-upload-modal-save]',
  },

  // TODO-selector replace deze bij het maken van publication translation testen
  tableCell: '.auk-table__cell--accent',
  flowTitle: '[data-test-publication-flow-title]',


};
export default selectors;
