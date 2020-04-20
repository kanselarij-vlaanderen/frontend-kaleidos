const selectors = {
  agenda: {
    approveAgenda: '[data-test-agenda-approve-modal]',
  },
  createAnnouncement: {
    titleSubcase: '[data-test-vl-create-announcement-title-subcase]',
    modalDialog: '[data-test-vl-modal-dialog]',
    modalDialogCloseModal: '[data-test-vl-modal-close]',
  },
  modalManager: {
    close: '[data-test-vl-model-manager-close]',
    add: '[data-test-vl-model-manager-add]',
    edit:  '[data-test-vl-model-manager-edit]',
    delete: '[data-test-vl-model-manager-delete]'
  },
  verify: {
    save: '[data-test-vl-modal-verify-save]'
  }
};
export default selectors;
