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
    modal: '[data-test-au2-modal-publication-new]',
    alertInfo: '[data-test-au2-alert-info]',
    alertError: '[data-test-au2-alert-error]',
    createButton: '[data-test-publication-button-create-new]',
    cancelButton: '[data-test-publication-button-cancel]',
  },
  modalDialog: '[data-test-vl-modal-dialog]',
  modal: '[data-test-vl-modal]',
  au2Modal: '[data-test-au2-modal]',
  ministerModalSelector: '[data-test-mandatee-selector]',
  modalFooterSaveButton: '[data-test-vl-modal-footer-save]',
};
export default selectors;
