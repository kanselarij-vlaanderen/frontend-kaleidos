const selectors = {

  // create-sign-flow
  createSignFlow: {
    signers: {
      edit: '[data-test-signatures-create-sign-flow-signers-edit]',
      item: '[data-test-signatures-create-sign-flow-signers-item]',
      remove: '[data-test-signatures-create-sign-flow-signers-remove]',
    },
    approvers: {
      add: '[data-test-signatures-create-sign-flow-approvers-add]',
      item: '[data-test-signatures-create-sign-flow-approvers-item]',
      remove: '[data-test-signatures-create-sign-flow-approvers-remove]',
    },
    notificationAdresses: {
      add: '[data-test-signatures-create-sign-flow-notification-adresses-add]',
      item: '[data-test-signatures-create-sign-flow-notification-adresses-item]',
      remove: '[data-test-signatures-create-sign-flow-notification-adresses-remove]',
    },
  },

  // select-ministers-modal
  selectMinisters: {
    apply: '[data-test-signatures-select-ministers-apply]',
  },

  // email-modal
  email: {
    input: '[data-test-signatures-create-email-input]',
    add: '[data-test-signatures-create-email-add]',
  },

  // decisions and notes

  // create-sign-flow
  decisionsSignFlow: {
    pieceName: '[data-test-signatures-decisions-signflow-piece-name]',
    meetingDate: '[data-test-signatures-decisions-signflow-meeting-date]',
    secretaryName: '[data-test-signatures-decisions-signflow-secretary-nam]',
  },
};
export default selectors;
