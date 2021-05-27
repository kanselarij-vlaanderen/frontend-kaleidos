const selectors = {
  // mandatees-domains-panel-view
  mandateePanelView: {
    rows: '[data-test-mandatee-panel-view-mandatee-row]',
    row: {
      name: '[data-test-mandatee-panel-view-row-name]',
      domains: '[data-test-mandatee-panel-view-row-domains]',
      submitter: '[data-test-mandatee-panel-view-row-submitter]',
    },
    actions: {
      edit: '[data-test-mandatee-panel-view-edit]',
    },
  },
  // mandatees-domains-panel-edit
  mandateePanelEdit: {
    rows: '[data-test-mandatee-panel-edit-mandatee-row]',
    row: {
      name: '[data-test-mandatee-panel-edit-row-name]',
      domains: '[data-test-mandatee-panel-edit-row-domains]',
      fields: '[data-test-mandatee-panel-edit-row-fields]',
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
  // create-mandatee
  createMandatee: {
    titleContainer: '[data-test-create-mandatee-title-container]',
    nicknameContainer: '[data-test-create-mandatee-nickname-container]',
    iseCodeContainer: '[data-test-create-mandatee-ise-code-container]',
  },

  // create-person-selector
  addMandateeDropdownContainer: '[data-test-add-mandatee-dropdown-container]',
  createPerson: '[data-test-create-person]',
  createPersonLastnameContainer: '[data-test-create-person-firstname]',
  createPersonfirstnameContainer: '[data-test-create-person-lastname]',
  // edit-mandatees
  mandateeEditCancel: '[data-test-edit-mandatee-cancel]',
  // manage-mandatees
  manageMandateeChangesAlert: '[data-test-manage-mandatee-changes-alert]',
};
export default selectors;
