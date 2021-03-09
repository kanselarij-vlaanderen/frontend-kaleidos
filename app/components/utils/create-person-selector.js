import Component from '@ember/component';
import { inject } from '@ember/service';
import {
  task, timeout
} from 'ember-concurrency';
import { computed } from '@ember/object';

export default Component.extend({
  classNames: ['vlc-input-field-block'],
  classNameBindings: [
    'isCreatingPerson:vl-u-bg-alt',
    'isCreatingPerson:auk-u-m-0',
    'isCreatingPerson:auk-u-p-4',
    'classes'
  ],
  searchField: 'first-name',
  modelName: 'person',
  propertyToShow: 'nameToDisplay',
  isCreatingPerson: false,
  firstName: null,
  lastName: null,
  store: inject(),
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

  clearValues() {
    this.set('isCreatingPerson', false);
    this.set('firstName', null);
    this.set('lastName', null);
    this.set('isLoading', false);
  },

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
    toggleIsCreatingPerson() {
      this.toggleProperty('isCreatingPerson');
    },

    resetValuesAndCancelCreation() {
      this.clearValues();
    },

    createPerson() {
      const {
        firstName, lastName,
      } = this;
      const person = this.store.createRecord('person', {
        firstName,
        lastName,
      });
      person.save().then(() => {
        this.findAll.perform();
        this.clearValues();
      });
    },

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
