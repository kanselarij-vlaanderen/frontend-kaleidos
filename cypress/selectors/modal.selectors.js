const selectors = {
  vlModalComponents: {
    createNewAgendaModal: '[data-test-vl-modal="createNewAgendaModal"]'
  },
  agenda: {
    approveAgenda: '[data-test-agenda-approve-modal]',
  },
  createAnnouncement: {
    modalDialog: '[data-test-vl-modal-dialog]',
    modalDialogCloseModal: '[data-test-vl-modal-close]',
  },
  baseModal: {
    container: '[data-test-vl-modal-container]',
    dialogWindow: '[data-test-vl-modal-dialogwindow]',
    close: '[data-test-vl-modal-close]',
  },
  createNewAnnouncementModal: {
    longTitleSubcase: '[data-test-vl-create-announcement-long-title-subcase]',
  },
  manageInSettingsModal: {
    add: '[data-test-vl-model-manager-add]',
    edit:  '[data-test-vl-model-manager-edit]',
    delete: '[data-test-vl-model-manager-delete]'
  },
  verify: {
    container: '[data-test-vl-modal-verify-container]',
    close: '[data-test-vl-modal-verify-close]',
    cancel: '[data-test-vl-modal-verify-cancel]',
    save: '[data-test-vl-modal-verify-save]'
  },
};
export default selectors;
