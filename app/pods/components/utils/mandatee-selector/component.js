/* eslint-disable ember/no-arrow-function-computed-properties */
import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import {
  task, timeout
} from 'ember-concurrency';
import moment from 'moment';

export default Component.extend({
  classNames: ['mandatee-selector-container'],
  classNameBindings: ['classes'],
  store: inject(),
  selectedMandatees: null,
  singleSelect: false,
  modelName: 'mandatee',
  sortField: 'priority',
  searchField: 'title',
  includeField: 'person',

  init() {
    this._super(...arguments);
    this.findAll.perform();
  },

  filter: computed(() => ({
    ':gte:end': moment().utc()
      .toDate()
      .toISOString(),
  })),

  queryOptions: computed('sortField', 'searchField', 'filter', 'modelName', 'includeField', function() {
    const options = {};
    const {
      filter, sortField, includeField,
    } = this;
    if (sortField) {
      options.sort = sortField;
    }
    if (filter) {
      options.filter = filter;
    }
    if (includeField) {
      options.include = includeField;
    }
    return options;
  }),

  findAll: task(function *() {
    const {
      modelName, queryOptions,
    } = this;
    if (modelName) {
      const items = yield this.store.query(modelName, queryOptions);
      this.set('items', items);
    }
  }),

  searchTask: task(function *(searchValue) {
    yield timeout(300);
    const {
      queryOptions, searchField, modelName,
    } = this;
    if (queryOptions.filter) {
      queryOptions.filter[searchField] = searchValue;
    } else {
      const filter = {};
      filter[searchField] = searchValue;
      queryOptions.filter = filter;
    }

    return this.store.query(modelName, queryOptions);
  }),

  actions: {
    async chooseMandatee(mandatees) {
      this.set('selectedMandatees', mandatees);
      this.chooseMandatee(mandatees);
    },

    resetValueIfEmpty(param) {
      if (param === '') {
        this.set('queryOptions', {
          sort: this.sortField,
        });
        this.findAll.perform();
      }
    },
  },
});
