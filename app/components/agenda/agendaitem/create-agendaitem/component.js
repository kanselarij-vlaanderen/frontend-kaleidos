import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';

import DefaultQueryParamsMixin from 'ember-data-table/mixins/default-query-params';
import CONFIG from 'fe-redpencil/utils/config';
import { computed,observer } from '@ember/object';
import { task, timeout } from 'ember-concurrency';

export default Component.extend(DefaultQueryParamsMixin, {
  availableSubcases: null,
  showPostponed:null,

  currentSession: alias('sessionService.currentSession'),
  selectedAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'),

  store: inject(),
  subcasesService: inject(),
  agendaService: inject(),
  sessionService: inject(),

  size: 5,
  sort: 'short-title',

  queryOptions: computed('sort', 'filter', 'page', function () {
    const { page, filter, size, sort } = this;
		let options = {
      sort: sort,
      page: {
        number: page,
        size: size
      },
      filter: {
        ':has-no:agendaitems': 'yes',
        'case': { 'policy-level': { id: CONFIG.VRCaseTypeID } }
      }
    };
    if (filter) {
      options['filter']['short-title'] = filter;
    }
		return options;
  }),

  // dirty observers to make use of the datatable actions
  pageObserver: observer('page', function() {
    this.findAll.perform();
  }),

  // dirty observers to make use of the datatable actions
  filterObserver: observer('filter', function() {
    if(this.filter == "") {
      this.findAll.perform();
    }
  }),
  
  model: computed('items.@each', function() {
    return this.items;
  }),

  setFocus() {
    document.getElementById("searchId").focus();
  },

  findAll: task(function* () {
		const { queryOptions } = this;
		const items = yield this.store.query("subcase", queryOptions);
    this.set('items', items);
    yield timeout(100);
    this.setFocus();
  }),

  findPostponed: task(function* () {
    const ids = yield this.get('subcasesService').getPostPonedSubcaseIds();
    let postPonedSubcases = [];

    if (ids && ids.length > 0) {
      postPonedSubcases = yield this.store.query('subcase', {
        filter: {
          "id": ids.toString()
        }
      });
    }
    this.set('items', postPonedSubcases);
  }),

  searchTask: task(function* () {
    yield timeout(300);
    const { queryOptions } = this;
		const items = yield this.store.query("subcase", queryOptions);
    this.set('items', items);
    yield timeout(100);
    this.setFocus();
  }).restartable(),

  async didInsertElement() {
    this._super(...arguments);
    this.set('availableSubcases', []);
    this.set('postponedSubcases', []);
    this.findAll.perform();
  },

  actions: {
    close() {
      this.set('isAddingAgendaitems', false);
    },

    checkShowPostponedValue() {
      const { showPostponed } = this;
      if(showPostponed) {
        this.findPostponed.perform();
      } else {
        this.findAll.perform();
      }
    },

    async selectPostponed(subcase, event) {
      if (event) {
        event.stopPropagation();
      }
      let action = 'add';
      if (subcase.selected) {
        subcase.set('selected', false);
        action = 'remove';
      } else {
        subcase.set('selected', true);
        action = 'add';
      }
      const postponed = await this.get('postponedSubcases');

      if (action === 'add') {
        postponed.pushObject(subcase)
      } else if (action === 'remove') {
        const index = postponed.indexOf(subcase);
        if (index > -1) {
          postponed.splice(index, 1);
        }
      }
    },

    async selectAvailableSubcase(subcase, destination, event) {
      if (event) {
        event.stopPropagation();
      }
      
      let action = 'add';
      if (subcase.selected) {
        subcase.set('selected', false);
        action = 'remove';
      } else {
        subcase.set('selected', true);
        action = 'add';
      }

      const available = await this.get('availableSubcases');

      if (action === 'add') {
        available.pushObject(subcase)
      } else if (action === 'remove') {
        const index = available.indexOf(subcase);
        if (index > -1) {
          available.splice(index, 1);
        }
      }
    },

    reloadRoute(id) {
      this.reloadRoute(id);
    },

    async addSubcasesToAgenda() {
      this.set('loading', true);
      const { selectedAgenda, availableSubcases, postponedSubcases, agendaService } = this;
      const alreadySelected = await selectedAgenda.get('agendaitems');

      await Promise.all(postponedSubcases.map(async (item) => {
        const agendaitems = await item.get('agendaitems');
        return agendaitems.map(async (agendaitem) => {
          const idx = await alreadySelected.indexOf(agendaitem);
          if (idx !== -1) {
            const postponed_obj = await agendaitem.get('postponedTo');
            if (postponed_obj) {
              await postponed_obj.set('agendaitem', null);
              await postponed_obj.destroyRecord();
              await agendaitem.set('retracted', false);
              await agendaitem.set('postponedTo', null);
              await agendaitem.save();
            } else {
              console.log('lollig')
              // Never reached this
            }
          }
        });
      }));

      const itemsToAdd = [...postponedSubcases, ...availableSubcases];

      let promise = Promise.all(itemsToAdd.map(async (subCase) => {
          if (subCase.selected) {
            return agendaService.createNewAgendaItem(selectedAgenda, subCase);
          }
      }));

      promise.then(async () => {
        await selectedAgenda.hasMany('agendaitems').reload();
        await agendaService.assignDirtyPrioritiesToAgendaitems(selectedAgenda);

        this.set('loading', false);
        this.set('isAddingAgendaitems', false);
        this.set('sessionService.selectedAgendaItem', null);
        this.reloadRoute(selectedAgenda.get('id'));
      });
    }
  }
});
