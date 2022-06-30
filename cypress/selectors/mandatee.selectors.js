const selectors = {
  // mandatees-panel-view
  mandateePanelView: {
    rows: '[data-test-mandatee-panel-view-mandatee-row]',
    row: {
      name: '[data-test-mandatee-panel-view-row-name]',
      submitter: '[data-test-mandatee-panel-view-row-submitter]',
    },
    actions: {
      edit: '[data-test-mandatee-panel-view-edit]',
    },
  },
  // mandateess-panel-edit
  mandateePanelEdit: {
    rows: '[data-test-mandatee-panel-edit-mandatee-row]',
    row: {
      name: '[data-test-mandatee-panel-edit-row-name]',
      submitter: '[data-test-mandatee-panel-edit-row-submitter]',
      edit: '[data-test-mandatee-panel-edit-row-edit]',
      delete: '[data-test-mandatee-panel-edit-row-delete]',
    },
    actions: {
      add: '[data-test-mandatee-panel-edit-add-mandatee]',
      cancel: '[data-test-mandatee-panel-edit-cancel]',
      save: '[data-test-mandatee-panel-edit-save]',
    },
  },

  // mandatee-selector-modal
  mandateeSelector: {
    openSearch: '[data-test-mandatee-selector-open-search]',
  },

  // create-mandatee
  createMandatee: {
    titleContainer: '[data-test-create-mandatee-title-container]',
    nicknameContainer: '[data-test-create-mandatee-nickname-container]',
    iseCodeContainer: '[data-test-create-mandatee-ise-code-container]',
  },

  // create-person-selector
  personSelector: {
    personDropdown: '[data-test-person-selector-dropdown-container]',
    // TODO-selector make test to create new person with these selectors
    createPerson: '[data-test-person-selector-action-create-person]',
    firstnameContainer: '[data-test-person-selector-firstname]',
    lastnameContainer: '[data-test-person-selector-lastname]',
  },

  // edit-mandatee
  editMandatee: {
    save: '[data-test-edit-mandatee-save]',
    cancel: '[data-test-edit-mandatee-cancel]',
  },

  // manage-mandatees
  manageMandatee: {
    changesAlert: '[data-test-manage-mandatee-changes-alert]',
  },

};
export default selectors;
