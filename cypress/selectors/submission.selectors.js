const selectors = {
  // overview-header under cases/submissions
  overviewHeader: {
    titleContainer: '[data-test-submission-overview-header-case-title-container]',
    caseLink: '[data-test-submission-overview-header-case-link]',
    treatedBy: '[data-test-submission-overview-header-treated-by]',
  },

  // submission-header
  submissionHeader: {
    actions: '[data-test-submission-header-actions]',
    action: {
      createSubcase: '[data-test-submission-header-action-create-subcase]',
      takeInTreatment: '[data-test-submission-header-action-take-in-treatment]',
      sendBack: '[data-test-submission-header-action-send-back]',
      delete: '[data-test-submission-header-action-delete]',
    },
    resubmit: '[data-test-submission-header-action-resubmit]',
    requestSendBack: '[data-test-submission-header-action-request-send-back]',
  },

  // new-submission
  newSubmissionForm: {
    toggleConfidential: '[data-test-cases-new-submission-form-toggle-confidential]',
    shortTitle: '[data-test-cases-new-submission-form-short-title]',
    subcaseType: '[data-test-cases-new-submission-form-subcase-type]',
    cancel: '[data-test-cases-new-submission-form-cancel]',
    save: '[data-test-cases-new-submission-form-save]',
  },

  // notifications-panel
  notificationsPanel: {
    panel: '[data-test-submission-notifications-panel]',
    edit: '[data-test-submission-notifications-edit]',
    approvers: {
      add: '[data-test-submission-notifications-approvers-add]',
      item: '[data-test-submission-notifications-approvers-item]',
      remove: '[data-test-submission-notifications-approvers-remove]',
      commentEdit: '[data-test-submission-notifications-approvers-comment-edit]',
      comment: '[data-test-submission-notifications-approvers-comment]',
    },
    notification: {
      add: '[data-test-submission-notifications-notification-add]',
      item: '[data-test-submission-notifications-notification-item]',
      remove: '[data-test-submission-notifications-notification-remove]',
      commentEdit: '[data-test-submission-notifications-notification-comment-edit]',
      comment: '[data-test-submission-notifications-notification-comment]',
    },
    cancel: '[data-test-submission-notifications-cancel]',
    save: '[data-test-submission-notifications-save]',
  },


  // document-upload-panel under cases/submissions
  documentUploadPanel: {
    panel: '[data-test-submission-document-upload-panel]',
  },

  // history-panel under cases/submissions
  historyPanel: {
    panel: '[data-test-submission-history-panel]',
  },

  // agenda-item-type-selector
  agendaItemTypeSelector: {
    typeRadio: '[data-test-agenda-item-type-selector-radio]',
  },

  // proposable-agendas-modal under cases/submission
  proposableAgendas: {
    agendaRow: '[data-test-submission-proposable-agendas-modal-agenda-row]',
    comment: '[data-test-submission-proposable-agendas-modal-comment]',
    save: '[data-test-submission-proposable-agendas-save]',
  },

  // description-panel/view
  descriptionView: {
    panel: '[data-test-submission-description-panel]',
    edit: '[data-test-submission-description-edit]',
    shortTitle: '[data-test-submission-description-short-title]',
    agendaitemTypePill: '[data-test-submission-description-agendaitem-type-pill]',
    confidentialityPill: '[data-test-submission-description-confidentiality-pill]',
    title: '[data-test-submission-description-title]',
    subcaseType: '[data-test-submission-description-subcase-type]',
    subcaseName: '[data-test-submission-description-subcase-name]',
  },

  // description-panel/edit
  descriptionEdit: {
    agendaitemType: '[data-test-submission-description-edit-agendaitem-type]',
    confidential: '[data-test-submission-description-edit-confidential]',
    shortTitle: '[data-test-submission-description-edit-short-title]',
    title: '[data-test-submission-description-edit-title]',
    subcaseType: '[data-test-submission-description-edit-subcase-type]',
    shortcut: '[data-test-submission-description-edit-subcase-shortcut-selector]',
    shortcutEdit: '[data-test-submission-description-edit-subcase-shortcut-edit]',
    subcaseName: '[data-test-submission-description-edit-subcase-name]',
    subcaseNameCancel: '[data-test-submission-description-edit-subcase-name-cancel]',
    subcaseNameClear: '[data-test-submission-description-edit-subcase-name-clear]',
    cancel: '[data-test-submission-description-edit-cancel]',
    save: '[data-test-submission-description-edit-save]',
  },

  // status-change-activity
  statusChangeActivity: {
    item: '[data-test-submission-status-change-activity-item]',
  },
};
export default selectors;
