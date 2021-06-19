const selectors = {
  vlModalComponents: {
    createNewAgendaModal: '[data-test-vl-modal="createNewAgendaModal"]',
  },
  baseModal: {
    container: '[data-test-vl-modal-container]',
    dialogWindow: '[data-test-vl-modal-dialogwindow]',
    close: '[data-test-vl-modal-close]',
  },
  manageInSettingsModal: {
    add: '[data-test-vl-model-manager-add]',
    edit: '[data-test-vl-model-manager-edit]',
    delete: '[data-test-vl-model-manager-delete]',
  },
  verify: {
    container: '[data-test-vl-modal-verify-container]',
    close: '[data-test-vl-modal-verify-close]',
    cancel: '[data-test-vl-modal-verify-cancel]',
    save: '[data-test-vl-modal-verify-save]',
  },
  publication: {
    modal: '[data-test-au-modal-publication-new]',
    alertInfo: '[data-test-auk-alert-info]',
    alertError: '[data-test-auk-alert-error]',
    createButton: '[data-test-publication-button-create-new]',
    cancelButton: '[data-test-publication-button-cancel]',
    publicationNumberInput: '[data-test-create-publication-modal-number-input]',
    publicationNumberSuffixInput: '[data-test-create-publication-modal-suffix-input]',
    publicationShortTitleTextarea: '[data-test-create-publication-modal-short-title-textarea]',
    publicationLongTitleTextarea: '[data-test-create-publication-modal-long-title-textarea]',
  },
  auModal: {
    container: '[data-test-au-modal]',
    close: '[data-test-au-modal-header-close]',
    resize: '[data-test-au-modal-header-resize]',
    cancel: '[data-test-au-modal-footer-cancel]',
    save: '[data-test-au-modal-footer-save]',
    title: '[data-test-au-modal-header-title]',
    body: '[data-test-au-modal-body-content]',
  },
  modalDialog: '[data-test-vl-modal-dialog]',
  // this selector is both in vl-modal and vl-modal-verify component
  modal: '[data-test-vl-modal]',

  ministerModalSelector: '[data-test-mandatee-selector]',
};
export default selectors;
