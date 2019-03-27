import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';

export default Controller.extend(DefaultQueryParamsMixin, {
  sort:'short-title',
  isEditingRow: false,

  actions: {
    editRow(caze) {
      console.log(caze)
      this.set('caseToEdit', caze);
      this.toggleProperty('isEditingRow');
    },

    cancelEditing() {
      this.toggleProperty('isEditingRow');
    },


  }
    
});
