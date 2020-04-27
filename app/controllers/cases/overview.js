import Controller from '@ember/controller';
import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';

export default Controller.extend(DefaultQueryParamsMixin, {
  queryParams: [
    'isArchived',
    { searchText: 'zoekterm' },
    'mandatees',
    { dateFrom: 'vanaf' },
    { dateTo: 'tot' },
    'decisionsOnly'
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
  isArchived: false,

  emptyCaseType: computed('intl', function () {
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

  deSerializedDateFrom: computed('dateFrom', {
    get() {
      return this.dateFrom && moment(this.dateFrom, "DD-MM-YYYY").toDate();
    },
    set(key, value) {
      this.set('dateFrom', value && moment(value).format('DD-MM-YYYY'));
      return value;
    }
  }),

  deSerializedDateTo: computed('dateTo', {
    get() {
      return this.dateTo && moment(this.dateTo, "DD-MM-YYYY").toDate();
    },
    set(key, value) {
      this.set('dateTo', value && moment(value).format('DD-MM-YYYY'));
      return value;
    }
  }),

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
      await Promise.all(subcases.map(subcase => {
        subcase.set('isArchived', true);
        return subcase.save();
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
      await Promise.all(subcases.map(subcase => {
        subcase.set('isArchived', false);
        return subcase.save();
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

    filterCases(filter) {
      this.set('page', 0);
      const stoppingSearch = Boolean(!filter.searchText);
      if (stoppingSearch) {
        this.set('searchText', null);
        this.set('mandatees', null);
        this.set('dateFrom', null);
        this.set('dateTo', null);
        this.set('sort', '-created');
      } else {
        this.set('searchText', filter.searchText);
        this.set('mandatees', filter.mandatees);
        this.set('deSerializedDateFrom', filter.dateFrom);
        this.set('deSerializedDateTo', filter.dateTo);
        this.set('decisionsOnly', filter.searchInDecisionsOnly);
        this.set('sort', '-session-dates');
      }
    },

    navigateToCase(caze) {
      this.transitionToRoute('cases.case.subcases', caze.id);
    }
  },

});
