import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';

export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin,  {
  sort: '-created',
  isEditingRow: false,
  isNotArchived: false,
  isArchivingCase: false,

  filter: computed('isNotArchived', function () {
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
    toggleArchived(value) {
      this.set("filter", value)
    },
    archiveCase(caze) {
      caze.set('isArchived', true);
      this.set('isArchivingCase', false);
      caze.save();
    },
    unarchiveCase(caze) {
      caze.set('isArchived', false);
      caze.save();
    },
    requestArchiveCase(caze) {
      this.set('selectedCase', caze)
      this.set('isArchivingCase', true);
    },
    cancelArchiveCase() {
      this.set('isArchivingCase', false);
    }
  }

});
