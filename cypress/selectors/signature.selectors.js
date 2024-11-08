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
    reportOrMinutes: {
      signer: '[data-test-signatures-create-signflow-report-or-minutes-signer]',
    },
  },

  // select-ministers-modal
  selectMinisters: {
    apply: '[data-test-signatures-select-ministers-apply]',
  },

  // email-modal
  // TODO-REFACTOR this is no longer unique to signatures, also used for submission. Going to copy this to utils selectors.
  // We need to refactor the component (change folder, rename to utils::EmailModal)
  email: {
    input: '[data-test-email-modal-input]',
    add: '[data-test-email-modal-add]',
  },

  // decisions and notes

  // create-sign-flow
  // TODO: cleanup? (not tested yet)
  decisionsSignFlow: {
    pieceName: '[data-test-signatures-decisions-signflow-piece-name]',
    meetingDate: '[data-test-signatures-decisions-signflow-meeting-date]',
    secretaryName: '[data-test-signatures-decisions-signflow-secretary-nam]',
  },
};
export default selectors;
