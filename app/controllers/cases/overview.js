import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { computed } from '@ember/object';

export default Controller.extend(DefaultQueryParamsMixin, {
  sort:'-created',
  isEditingRow: false,
  isNotArchived: false,

  filter : computed('isNotArchived', function() {
    return this.isNotArchived;
  }),
  actions: {
    editRow(caze) {
      this.set('caseToEdit', caze);
      this.toggleProperty('isEditingRow');
    },
    cancelEditing() {
      this.toggleProperty('isEditingRow');
    },
    toggleArchived(value){
      this.set("filter", value)
    }
  }

});
