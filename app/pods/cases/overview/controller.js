import Controller from '@ember/controller';
import { inject } from '@ember/service';

export default Controller.extend({
  queryParams: [
    {
      page: {
        type: 'number',
      },
    },
    {
      size: {
        type: 'number',
      },
    },
    {
      sort: {
        type: 'string',
      },
    },
    {
      showArchived: {
        type: 'boolean',
      },
    }
  ],
  sizeOptions: Object.freeze([5, 10, 20, 50, 100, 200]),
  page: 0,
  size: 20,

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
      await Promise.all(subcases.map(async(subcase) => {
        subcase.set('isArchived', true);
        const savedSubcase = await subcase.save();
        return savedSubcase;
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
      await Promise.all(subcases.map(async(subcase) => {
        subcase.set('isArchived', false);
        const savedSubcase = await subcase.save();
        return savedSubcase;
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
    },
  },

});
