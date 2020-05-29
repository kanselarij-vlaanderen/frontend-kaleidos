import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';

export default Controller.extend(DefaultQueryParamsMixin, {
  queryParams: [
    { showArchived: 'gearchiveerd' },
  ],
  sizeOptions: Object.freeze([5, 10, 20, 50, 100, 200]),
  size: 10,

  intl: inject(),
  currentSession: inject(),
  sort: '-created',
  selectedCase: null,
  isEditingRow: false,
  isNotArchived: false,
  isArchivingCase: false,
  showArchived: false,

  actions: {
    selectSize(size) {
      this.set('size', size);
    },

    editRow(caze) {
      this.set('caseToEdit', caze);
      this.toggleProperty('isEditingRow');
    },

    cancelEditing() {
      this.toggleProperty('isEditingRow');
    },

    async archiveCase() {
      const caseModel = await this.store.findRecord('case', this.get('selectedCase.id'));
      caseModel.set('isArchived', true);
      const subcases = await caseModel.subcases;
      await Promise.all(subcases.map(async subcase => {
        subcase.set('isArchived', true);
        return await subcase.save();
      }));
      caseModel.save().then(() => {
        this.set('selectedCase', null);
        this.send('refreshModel');
        this.set('isArchivingCase', false);
      });
    },

    async unarchiveCase(caze) {
      caze.set('isArchived', false);
      const subcases = await caze.subcases;
      await Promise.all(subcases.map(async subcase => {
        subcase.set('isArchived', false);
        return await subcase.save();
      }));
      await caze.save();
    },

    requestArchiveCase(caze) {
      this.set('selectedCase', caze);
      this.set('isArchivingCase', true);
    },

    cancelArchiveCase() {
      this.set('isArchivingCase', false);
      this.set('selectedCase', null);
    },

    close(caze) {
      if (!caze) {
        return;
      }
      this.transitionToRoute('cases.case.subcases', caze.id);
    },

    navigateToCase(_case) {
      this.transitionToRoute('cases.case.subcases', _case.id);
    }
  },

});
