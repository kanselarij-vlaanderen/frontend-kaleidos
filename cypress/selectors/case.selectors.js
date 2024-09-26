const selectors = {
  // cases-header
  casesHeader: {
    title: '[data-test-cases-header-title]',
    addCase: '[data-test-cases-header-add-case]',
    addSubmission: '[data-test-cases-header-add-submission]',
    clearFilter: '[data-test-cases-header-clear-filter]',
    filter: '[data-test-cases-header-filter-input]',
  },

  // new-case
  newCase: {
    shorttitle: '[data-test-new-case-shorttitle]',
    form: '[data-test-new-case-form]',
    save: '[data-test-new-case-save]',
  },

  // new-subcase-form
  newSubcaseForm: {
    clonePrevious: '[data-test-new-subcase-form-clone-previous]',
    toggleConfidential: '[data-test-new-subcase-form-toggle-confidential]',
    shorttitle: '[data-test-new-subcase-form-shorttitle]',
    longtitle: '[data-test-new-subcase-form-longtitle]',
    procedureStep: '[data-test-new-subcase-form-procedure-step]',
    procedureName: '[data-test-new-subcase-form-procedure-name]',
    cancel: '[data-test-new-subcase-form-cancel]',
    save: '[data-test-new-subcase-form-save]',
  },

  // proposable-agendas
  proposableAgendas: {
    formallyOkSelector: '[data-test-proposable-agendas-modal-formally-ok-selector]',
    privateComment: '[data-test-proposable-agendas-modal-private-comment]',
    agendaRow: '[data-test-proposable-agendas-modal-agenda-row]',
    placeOnAgenda: '[data-test-proposable-agendas-modal-place-on-agenda]',
    saveWithoutAgenda: '[data-test-proposable-agendas-modal-save-without-agenda]',
  },

  // subcase-detail-nav
  subcaseDetailNav: {
    overview: '[data-test-subcase-detail-nav-overview]',
    documents: '[data-test-subcase-detail-nav-documents]',
    decisions: '[data-test-subcase-detail-nav-decisions]',
  },

  // subcase-overview-header
  subcaseOverviewHeader: {
    optionsDropdown: '[data-test-subcase-overview-header-actions-dropdown]',
    titleContainer: '[data-test-subcase-overview-header-title-container]',
    publicationFlowLink: '[data-test-subcase-overview-header-publication-flow-link]',
    publicationFlowPill: '[data-test-subcase-overview-header-publication-flow-pill]',
    openAddSubcase: '[data-test-subcase-overview-header-open-add-subcase]',
    actions: {
      editCase: '[data-test-subcase-overview-header-edit-case]',
      archive: '[data-test-subcase-overview-header-archive]',
    },
    createSubmission: '[data-test-subcase-overview-header-create-submission]',
  },

  // subcase-side-nav
  subcaseSideNav: {
    subcase: '[data-test-subcase-side-nav-subcase]',
    decision: '[data-test-subcase-side-nav-decision]',
  },

  subcaseTimeline: {
    item: '[data-test-subcase-timeline-item]',
  },

  // subcase-description
  subcaseBekrachtigingDescription: {
    panel: '[data-test-subcase-bekrachtiging-description-panel]',
  },

  // subcase/description-panel/view
  subcaseDescription: {
    panel: '[data-test-subcase-description-panel]',
    edit: '[data-test-subcase-description-edit]',
    shortTitle: '[data-test-subcase-description-short-title]',
    agendaitemTypePill: '[data-test-subcase-description-agendaitem-type-pill',
    confidentialityPill: '[data-test-subcase-description-confidentiality-pill]',
    title: '[data-test-subcase-description-title]',
    notOnAgenda: '[data-test-subcase-description-not-on-agenda]',
    agendaLink: '[data-test-subcase-description-agenda-link]',
    meetingNumber: '[data-test-subcase-description-meeting-number]',
    decidedOn: '[data-test-subcase-description-decided-on]',
    // TODO test subaseType, subcaseName edits
    subcaseName: '[data-test-subcase-description-subcase-name]',
  },

  // subcase/description-panel/edit
  subcaseDescriptionEdit: {
    type: '[data-test-subcase-description-edit-type]',
    confidential: '[data-test-subcase-description-edit-confidential]',
    shortTitle: '[data-test-subcase-description-edit-short-title]',
    title: '[data-test-subcase-description-edit-title]',
    procedureStep: '[data-test-subcase-description-edit-procedure-step]',
    procedureName: '[data-test-subcase-description-edit-procedure-name]',
    actions: {
      save: '[data-test-subcase-description-edit-save]',
    },
  },

  // subcase-versions-panel
  subcaseVersions: {
    panel: '[data-test-subcase-versions-panel]',
  },

  // subcase-header
  subcaseHeader: {
    actionsDropdown: '[data-test-subcase-header-actions-dropdown]',
    actions: {
      showProposedAgendas: '[data-test-subcase-header-action-open-proposable-agendas]',
      deleteSubcase: '[data-test-subcase-header-action-delete-subcase]',
      moveSubcase: '[data-test-subcase-header-action-move-subcase]',
    },
  },

  // edit-case-modal
  editCase: {
    shortTitle: '[data-test-edit-case-shorttitle]',
    save: '[data-test-edit-case-save]',
  },

  // government-areas-panel under cases/subcases
  governmentAreasPanel: {
    panel: '[data-test-government-areas-panel]',
    fieldsList: '[data-test-government-areas-panel-fields-list]',
  },

  // document-upload-panel under cases/subcases
  documentUploadPanel: {
    panel: '[data-test-subcases-document-upload-panel]',
  },

};
export default selectors;
