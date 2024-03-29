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
  // mandatees-panel-edit
  mandateePanelEdit: {
    rows: '[data-test-mandatee-panel-edit-mandatee-row]',
    row: {
      submitter: '[data-test-mandatee-panel-edit-row-submitter]',
      delete: '[data-test-mandatee-panel-edit-row-delete]',
    },
    actions: {
      add: '[data-test-mandatee-panel-edit-add-mandatee]',
      cancel: '[data-test-mandatee-panel-edit-cancel]',
      save: '[data-test-mandatee-panel-edit-save]',
    },
  },

  // mandatees-checkbox-list
  mandateeCheckboxList: '[data-test-mandatee-checkbox-list]',

  // secretary-panel-view
  secretaryPanelView: {
    container: '[data-test-secretary-panel-view-container]',
    row: {
      name: '[data-test-secretary-panel-view-row-name]',
    },
    actions: {
      edit: '[data-test-secretary-panel-view-edit]',
    },
  },

  // secretary-panel-edit
  secretaryPanelEdit: {
    actions: {
      save: '[data-test-secretary-panel-edit-save]',
    },
  },
};
export default selectors;
