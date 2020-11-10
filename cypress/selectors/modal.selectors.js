const selectors = {
  vlModalComponents: {
    createNewAgendaModal: '[data-test-vl-modal="createNewAgendaModal"]',
  },
  agenda: {
    approveAgenda: '[data-test-agenda-approve-modal]',
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
    modal: '[data-test-auk-modal-publication-new]',
    alertInfo: '[data-test-auk-alert-info]',
    alertError: '[data-test-auk-alert-error]',
    createButton: '[data-test-publication-button-create-new]',
    cancelButton: '[data-test-publication-button-cancel]',
    publicationNumberInput: '[data-test-create-publication-modal-number-input]',
    publicationShortTitleTextarea: '[data-test-create-publication-modal-short-title-textarea]',
    publicationLongTitleTextarea: '[data-test-create-publication-modal-long-title-textarea]',
  },
  modalDialog: '[data-test-vl-modal-dialog]',
  modal: '[data-test-vl-modal]',
  aukModal: '[data-test-auk-modal]',
  ministerModalSelector: '[data-test-mandatee-selector]',
  modalFooterSaveButton: '[data-test-vl-modal-footer-save]',
};
export default selectors;
