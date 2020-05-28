import Component from '@ember/component';
import { inject } from '@ember/service';
import { computed } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend( {
  sessionService: inject(),
  classNameBindings: ['classes'],
  store: inject(),
  modelName: null,
  searchField: null,
  propertyToShow: null,
  placeholder: null,
  sortField: null,
  filter: null,
  selectedItems: null,

  init() {
    this._super(...arguments);
    this.findAll.perform();
  },

  findAll: task(function* () {
    const { modelName, queryOptions } = this;
    if (modelName) {
      const items = yield this.store.query(modelName, queryOptions);
      this.set('items', items);
    }
  }),

  searchTask: task(function* (searchValue) {
    yield timeout(300);
    const { queryOptions, searchField, modelName } = this;
    if (queryOptions['filter']) {
      queryOptions['filter'][searchField] = searchValue;
    } else {
      let filter = {};
      filter[searchField] = searchValue;
      queryOptions['filter'] = filter;
    }

    return this.store.query(modelName, queryOptions);
  }),

  items: computed('sessionService.agendas', function () {
    return this.sessionService.get('agendas');
  }),

  actions: {
    selectModel(items) {
      this.selectModel(items);
    },

    resetValueIfEmpty(param) {
      if (param == '') {
        this.set('items', this.sessionService.get('agendas'));
      }
    }
  },
});
