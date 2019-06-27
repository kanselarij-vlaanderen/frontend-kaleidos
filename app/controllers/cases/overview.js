import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { computed } from '@ember/object';
import isAuthenticatedMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { inject } from '@ember/service';
export default Controller.extend(DefaultQueryParamsMixin, isAuthenticatedMixin, {
  intl: inject(),
  sort: '-created',
  oc: false,
  isEditingRow: false,
  isNotArchived: false,
  isArchivingCase: false,

  emptyCaseType: computed('intl', function() {
    return this.intl.t('no-case-type');
  }),

  editCase: computed('intl', function () {
    return this.intl.t('edit-case');
  }),

  archiveCase: computed('intl', function () {
    return this.intl.t('archive-case');
  }),

  unArchiveCase: computed('intl', function () {
    return this.intl.t('unarchive-case');
  }),

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
    },

    close(caze) {
      if (!caze) {
        return;
      }
      this.transitionToRoute('cases.case.subcases', caze.id);
    }
  }

});
