// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { inject } from '@ember/service';
import {
  task, timeout
} from 'ember-concurrency';
import { computed } from '@ember/object';
import { isPresent } from '@ember/utils';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({
  /**
   * @argument modelName
   * @argument searchField
   * @argument sortField
   * @argument readOnly
   * @argument allowClear
   * @argument isLoading
   * @argument selectedItems
   * @argument selectModel
   * @argument filterResults: a function that will filter out results from the dropwdown menu
   */
  classNameBindings: ['classes'],
  store: inject(),
  modelName: null,
  searchField: null,
  propertyToShow: null,
  placeholder: null,
  sortField: null,
  filter: null,
  loadingMessage: 'Even geduld aub..',
  noMatchesMessage: 'Geen zoekresultaten gevonden',
  selectedItems: null,

  init() {
    this._super(...arguments);
    this.findAll.perform();
  },

  findAll: task(function *() {
    const {
      modelName, queryOptions,
    } = this;
    if (modelName) {
      let items = yield this.store.query(modelName, queryOptions);
      if (this.filterResults) {
        items = this.filterResults(items);
      }
      this.set('items', items);
    }
  }),

  searchEnabled: computed('searchField', function() {
    // default searchEnabled = false on powerSelect
    // to avoid adding @searchEnabled={{true}} on all uses of this component, we assume search should be enabled when a searchField is given
    return isPresent(this.searchField);
  }),

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

    let results = yield this.store.query(modelName, queryOptions);
    if (this.filterResults) {
      results = this.filterResults(results);
    }
    return results;
  }),

  // TODO: octane-refactor
  // eslint-disable-next-line ember/no-actions-hash
  actions: {
    selectModel(items) {
      this.selectModel(items);
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
