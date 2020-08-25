import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import {
  task, timeout
} from 'ember-concurrency';

export default Component.extend({
  classNames: ['vlc-input-field-block'],
  classNameBindings: ['classes'],
  placeholder: null,
  sortField: null,
  loadingMessage: 'Even geduld aub..',
  noMatchesMessage: 'Geen zoekresultaten gevonden',
  selectedItems: null,
  store: inject(),
  searchField: null,
  label: null,
  value: null,
  type: 'decisions',
  modelName: 'shortcut',

  init() {
    this._super(...arguments);
    this.findAll.perform();
  },

  filter: computed('type', function() {
    return {
      type: this.type,
    };
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
    selectModel(items) {
      this.descriptionUpdated(items.get('description'));
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
