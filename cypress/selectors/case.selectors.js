const selectors = {
  // cases-header
  casesHeader: {
    title: '[data-test-cases-header-title]',
    addCase: '[data-test-cases-header-add-case]',
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
    titleContainer: '[data-test-new-subcase-form-title-container]',
    clonePrevious: '[data-test-new-subcase-form-clone-previous]',
    toggleConfidential: '[data-test-new-subcase-form-toggle-confidential]',
    shorttitle: '[data-test-new-subcase-form-shorttitle]',
    longtitle: '[data-test-new-subcase-form-longtitle]',
    procedureStep: '[data-test-new-subcase-form-procedure-step]',
    procedureName: '[data-test-new-subcase-form-procedure-name]',
    mandateeSelectorPanel: {
      container: '[data-test-mandatee-selector-panel-container]',
      selectedMinister: '[data-test-mandatee-selector-panel-selected-minister]',
      submitterRadio: '[data-test-mandatee-selector-panel-submitter-radio]',
    },
    governmentAreasPanel: '[data-test-government-areas-panel]',
    areasPanelFieldsList: '[data-test-government-areas-panel-fields-list]',
    documentUploadPanel: '[data-test-add-subcase-document-upload-panel]',
    cancel: '[data-test-new-subcase-form-cancel]',
    save: '[data-test-new-subcase-form-save]',
  },

  // proposable-agendas
  proposableAgendas: {
    toggleFormallyOk: '[data-test-proposable-agendas-modal-toggle-formally-ok]',
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
    openAddSubcase: '[data-test-subcase-overview-header-open-add-subcase]',
    actions: {
      editCase: '[data-test-subcase-overview-header-edit-case]',
      archive: '[data-test-subcase-overview-header-archive]',
    },
  },

  // subcase-side-nav
  subcaseSideNav: {
    subcase: '[data-test-subcase-side-nav-subcase]',
    decision: '[data-test-subcase-side-nav-decision]',
  },

  // TODO KAS-4529 CLEANUP + template + component
  // subcase-process
  subcaseProcess: {
    shorttitle: '[data-test-subcases-process-shorttitle]',
  },

  // new-subcase
  // TODO KAS-4529 CLEANUP + template + component
  newSubcase: {
    clonePreviousSubcase: '[data-test-new-subcase-clone-previous-subcase]',
    type: '[data-test-new-subcase-type]',
    shorttitle: '[data-test-new-subcase-shorttitle]',
    longtitle: '[data-test-new-subcase-longtitle]',
    procedureStep: '[data-test-new-subcase-procedure-step]',
    procedureName: '[data-test-new-subcase-procedure-name]',
    save: '[data-test-new-subcase-save]',
  },

  subcaseTimeline: {
    item: '[data-test-subcase-timeline-item]',
  },

  // subcase-description
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
    // TODO KAS-4529 NO LONGER EXISTS, should it?
    subcaseName: '[data-test-subcase-description-subcase-name]',
    meetingPlannedStart: '[data-test-subcase-description-meeting-planned-start]',
    requestedBy: '[data-test-subcase-description-requested-by]',
  },

  // subcase-description-edit
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

  // TODO KAS-4529 remove / cleanup templates
  // subcase-item
  subcaseItem: {
    container: '[data-test-subcase-item-container]',
    link: '[data-test-subcase-item-link]',
    approved: '[data-test-subcase-item-approved]',
    pending: '[data-test-subcase-item-pending]',
    showDocuments: '[data-test-subcase-item-show-documents]',
  },

  // subcase-header
  subcaseHeader: {
    actionsDropdown: '[data-test-subcase-header-actions-dropdown]',
    actions: {
      // TODO KAS-4529 now opens a modal instead of a dropdown
      showProposedAgendas: '[data-test-subcase-header-action-show-proposed-agendas]',
      deleteSubcase: '[data-test-subcase-header-action-delete-subcase]',
      moveSubcase: '[data-test-subcase-header-action-move-subcase]',
    },
    // TODO KAS-4529 no longer exists
    proposeForAgenda: '[data-test-subcase-header-show-propose-for-agenda]',
  },

  // edit-case-modal
  editCase: {
    shortTitle: '[data-test-edit-case-shorttitle]',
    save: '[data-test-edit-case-save]',
  },
};
export default selectors;
