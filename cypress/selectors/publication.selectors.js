const selectors = {

  /**
    ROUTES
  */

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

  // publications-filter-modal
  publicationsFilter: {
    // TODO-SELECTOR unused selectors
    cancel: '[data-test-publications-filter-cancel]',
    reset: '[data-test-publications-filter-reset]',
    save: '[data-test-publications-filter-save]',
  },

  // publication-navigation
  publicationNav: {
    goBack: '[data-test-publication-nav-go-back]',
    case: '[data-test-publication-nav-case]',
    documents: '[data-test-publication-nav-documents]',
    translations: '[data-test-publication-nav-translations]',
    publishpreview: '[data-test-publication-nav-publishpreview]',
  },

  // publication-table-row
  publicationTableRow: {
    rows: '[data-test-publication-table-row]',
    row: {
      shortTitle: '[data-test-publication-table-row-short-title]',
      number: '[data-test-publication-table-row-number]',
      goToPublication: '[data-test-publication-table-row-go-to-publication]',
    },
  },

  // new-publication-modal
  newPublication: {
    number: '[data-test-new-publication-number]',
    suffix: '[data-test-new-publication-suffix]',
    shortTitle: '[data-test-new-publication-short-title]',
    longTitle: '[data-test-new-publication-long-title]',
    alertInfo: '[data-test-new-publication-alert-info]',
    alertError: '[data-test-new-publication-alert-error]',
    numberError: '[data-test-new-publication-number-error]',
    shortTitleError: '[data-test-new-publication-short-title-error]',
    create: '[data-test-new-publication-create]',
  },

  // contact-persons-panel
  contactPersons: {
    add: '[data-test-contact-persons-view-add]',
    rows: '[data-test-contact-persons-row]',
    row: {
      delete: '[data-test-contact-persons-row-delete]',
      fullName: '[data-test-contact-persons-row-full-name]',
      organizationName: '[data-test-contact-persons-row-organization-name]',
      email: '[data-test-contact-persons-row-email]',
    },
  },

  // contact-person-add-modal
  contactPersonAdd: {
    firstName: '[data-test-contact-person-add-first-name]',
    lastName: '[data-test-contact-person-add-last-name]',
    email: '[data-test-contact-person-add-email]',
    selectOrganization: '[data-test-contact-person-select-organization]',
    addOrganization: '[data-test-contact-person-add-organization]',
    submit: '[data-test-contact-person-add-submit]',
  },

  // organization-add-modal
  organizationAdd: {
    name: '[data-test-organization-add-name]',
    cancel: '[data-test-organization-add-cancel]',
    submit: '[data-test-organization-add-submit]',
  },

  // inscription-panel
  inscription: {
    view: {
      shortTitle: '[data-test-inscription-view-short-title]',
      longTitle: '[data-test-inscription-view-long-title]',
      edit: '[data-test-inscription-view-edit]',
    },
    edit: {
      shortTitle: '[data-test-inscription-edit-short-title]',
      shortTitleError: '[data-test-inscription-edit-short-title-error]',
      longTitle: '[data-test-inscription-edit-long-title]',
      cancel: '[data-test-inscription-edit-cancel]',
      save: '[data-test-inscription-edit-save]',
    },
  },

  // mandatees-panel
  mandateesPanel: {
    // TODO-SELECTORS unused selectors
    table: '[data-test-mandatees-panel-table]',
    add: '[data-test-mandatees-panel-add]',
    unlink: '[data-test-mandatees-panel-unlink]',
  },
  // documents-upload-modal
  documentsUploadModal: {
    save: '[data-test-publication-documents-upload-modal-save]',
  },

};
export default selectors;
