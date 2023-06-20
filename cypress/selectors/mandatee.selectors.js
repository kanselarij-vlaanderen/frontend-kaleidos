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
};
export default selectors;
