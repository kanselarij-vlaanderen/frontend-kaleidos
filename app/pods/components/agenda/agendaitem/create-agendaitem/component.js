import Component from '@ember/component';
import { inject } from '@ember/service';
import { alias } from '@ember/object/computed';
import DataTableRouteMixin from 'ember-data-table/mixins/route';
import { computed } from '@ember/object';
import {
  task, timeout
} from 'ember-concurrency';

export default Component.extend(DataTableRouteMixin, {
  availableSubcases: null,
  showPostponed: null,
  noItemsSelected: true,

  currentSession: alias('sessionService.currentSession'),
  selectedAgenda: alias('sessionService.currentAgenda'),
  agendas: alias('sessionService.agendas'),

  store: inject(),
  subcasesService: inject(),
  agendaService: inject(),
  sessionService: inject(),

  modelName: 'subcase',
  page: 0,
  size: 10,
  filter: '',
  sort: 'short-title',
  queryOptions: computed('sort', 'filter', 'page', function() {
    const {
      page, filter, size, sort,
    } = this;
    const options = {
      sort,
      page: {
        number: page,
        size,
      },
      filter: {
        ':has-no:agenda-activities': 'yes',
        ':not:is-archived': 'true',
        ':has-no:publication-flow': 'yes',
      },
    };

    if (filter) {
      options.filter['short-title'] = filter;
    }
    return options;
  }),
  onCreate: null, // argument. Function that is triggered after agenda-item creation.

  get pageParam() {
    return this.page;
  },

  set pageParam(page) {
    this.set('page', page);
    this.findAll.perform();
  },

  get filterParam() {
    return this.filter;
  },

  set filterParam(filter) {
    this.set('filter', filter);
    this.set('page', 0);
  },

  get sortParam() {
    return this.sort;
  },

  set sortParam(sort) {
    this.set('sort', sort);
    this.findAll.perform();
  },

  model: computed('items.@each', function() {
    (this.get('items') || []).map((item) => item.set('selected', false));
    return this.items;
  }),

  setFocus() {
    const element = document.getElementById('searchId');
    if (element) {
      element.focus();
    }
  },

  findAll: task(function *() {
    const {
      queryOptions,
    } = this;
    const items = yield this.store.query('subcase', queryOptions);
    this.set('items', items);
    yield timeout(100);
    this.setFocus();
  }),

  findPostponed: task(function *() {
    const ids = yield this.get('subcasesService').getPostPonedSubcaseIds();
    let postPonedSubcases = [];

    if (ids && ids.length > 0) {
      postPonedSubcases = yield this.store.query('subcase', {
        filter: {
          id: ids.toString(),
        },
      });
    }
    this.set('items', postPonedSubcases);
  }),

  searchTask: task(function *() {
    yield timeout(300);
    const {
      queryOptions,
    } = this;
    const items = yield this.store.query('subcase', queryOptions);
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
      const {
        showPostponed,
      } = this;
      if (showPostponed) {
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
        this.set('noItemsSelected', false);
      }
      const postponed = await this.get('postponedSubcases');

      if (action === 'add') {
        postponed.pushObject(subcase);
      } else if (action === 'remove') {
        const index = postponed.indexOf(subcase);
        if (index > -1) {
          postponed.splice(index, 1);
        }
        if (!postponed.length) {
          this.set('noItemsSelected', true);
        }
      }
    },

    // eslint-disable-next-line no-unused-vars
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
        available.pushObject(subcase);
      } else if (action === 'remove') {
        const index = available.indexOf(subcase);
        if (index > -1) {
          available.splice(index, 1);
        }
      }
    },

    async addSubcasesToAgenda() {
      this.set('loading', true);
      const {
        selectedAgenda,
        availableSubcases,
        postponedSubcases,
        agendaService,
      } = this;
      const subcasesToAdd = [...new Set([...postponedSubcases, ...availableSubcases])];

      // These counters are needed to set an init counter for the agendaitems that are being added to an empty agenda.
      let index;
      let agendaitemCounter = -1;
      let announcementCounter = -1;

      const promise = Promise.all(
        subcasesToAdd.map(async(subcase) => {
          if (subcase.selected) {
            if (subcase.showAsRemark) {
              announcementCounter++;
              index = announcementCounter;
            } else {
              agendaitemCounter++;
              index = agendaitemCounter;
            }
            return await agendaService.createNewAgendaitem(selectedAgenda, subcase, index);
          }
        })
      );

      promise.then(async() => {
        this.set('loading', false);
        this.set('isAddingAgendaitems', false);
        this.set('sessionService.selectedAgendaitem', null);
        const anyAddedSubcase = subcasesToAdd.get('firstObject');
        const newAgendaitem = await anyAddedSubcase.get('latestAgendaitem');
        if (this.onCreate) {
          this.onCreate(newAgendaitem.id);
        }
      });
    },
  },
});
